/**
 * 2D MINECRAFT // COMPLETE MASTER GAME ENGINE WITH MULTIPLAYER ROOMS
 * Pixel-Art Texture Rendering, Platformer Physics, Room Codes,
 * Realtime Block & Player Synchronization, Crafting, and Combat.
 */

import { BLOCKS, ITEMS, ITEM_DATA, CRAFTING_RECIPES } from "./items-recipes.js";
import { MinecraftAudioEngine } from "./audio-engine.js";
import { TextureAtlas } from "./textures.js";
import { WorldGenerator } from "./world-generator.js";
import { Player, Mob, Projectile, DroppedItem } from "./entities.js";
import { MinecraftMultiplayerManager } from "./multiplayer-manager.js";
import { SaveManager } from "./storage-save.js";

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // 1. Initialize Core Engines
  const audio = new MinecraftAudioEngine();
  const atlas = new TextureAtlas();
  const network = new MinecraftMultiplayerManager();
  const saveManager = new SaveManager();

  let world = null;
  let player = null;
  let gameTime = 300;
  let isGameRunning = false;

  const mobs = [];
  const projectiles = [];
  const droppedItems = [];
  const particles = [];

  const TILE_SIZE = 32;
  const camera = { x: 0, y: 0 };

  // Mining state
  const mouse = { x: 0, y: 0, worldX: 0, worldY: 0, leftDown: false, rightDown: false };
  let miningTarget = null;

  // Keyboard state
  const keys = {};

  window.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'INPUT') return;
    audio.init();
    keys[e.code] = true;

    if (e.key >= '1' && e.key <= '9') {
      if (player) player.selectedHotbarSlot = parseInt(e.key) - 1;
      updateHotbarUI();
    }

    if (e.code === 'KeyE') toggleInventoryModal();
    if (e.code === 'KeyQ') dropHeldItem();
    if (e.code === 'KeyT' || e.code === 'Enter') openChatInput();
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    updateWorldMouse();
  });

  canvas.addEventListener('mousedown', (e) => {
    if (!isGameRunning) return;
    audio.init();
    if (e.button === 0) mouse.leftDown = true;
    if (e.button === 2) mouse.rightDown = true;
    handleMouseAction(e.button);
  });

  canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) { mouse.leftDown = false; miningTarget = null; }
    if (e.button === 2) mouse.rightDown = false;
  });

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  canvas.addEventListener('wheel', (e) => {
    if (!player) return;
    if (e.deltaY > 0) player.selectedHotbarSlot = (player.selectedHotbarSlot + 1) % 9;
    else player.selectedHotbarSlot = (player.selectedHotbarSlot + 8) % 9;
    updateHotbarUI();
  });

  function updateWorldMouse() {
    mouse.worldX = Math.floor((mouse.x - canvas.width / 2 + camera.x) / TILE_SIZE);
    mouse.worldY = Math.floor((mouse.y - canvas.height / 2 + camera.y) / TILE_SIZE);
  }

  // --------------------------------------------------------------------------
  // LOBBY & MULTIPLAYER CONNECT
  // --------------------------------------------------------------------------
  const screenLobby = document.getElementById('screen-mc-lobby');
  const inputPlayerName = document.getElementById('mc-player-name');
  const inputRoomCode = document.getElementById('mc-room-code');
  const btnSingleplayer = document.getElementById('btn-mc-single');
  const btnCreateWorld = document.getElementById('btn-mc-create-online');
  const btnJoinWorld = document.getElementById('btn-mc-join-online');

  let selectedColor = '#00aaaa';

  document.querySelectorAll('.mc-skin-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.mc-skin-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      selectedColor = dot.dataset.color;
    });
  });

  // Singleplayer
  btnSingleplayer.addEventListener('click', () => {
    startWorld(Math.floor(Math.random() * 999999), null);
  });

  // Create Online World
  btnCreateWorld.addEventListener('click', async () => {
    const pName = inputPlayerName.value.trim() || 'Стив';
    btnCreateWorld.disabled = true;
    btnCreateWorld.textContent = 'Создание...';
    try {
      const { roomId, seed } = await network.createWorld(pName, selectedColor);
      startWorld(seed, roomId);
    } catch (e) {
      alert('Ошибка базы: ' + e.message);
    } finally {
      btnCreateWorld.disabled = false;
      btnCreateWorld.textContent = '⚡ СОЗДАТЬ СЕТЕВОЙ МИР';
    }
  });

  // Join Online World
  btnJoinWorld.addEventListener('click', async () => {
    const pName = inputPlayerName.value.trim() || 'Стив';
    const code = inputRoomCode.value.trim();
    if (!code) {
      alert('Введите код мира (например, MC4092)!');
      return;
    }
    btnJoinWorld.disabled = true;
    btnJoinWorld.textContent = 'Вход...';
    try {
      const { roomId, seed } = await network.joinWorld(code, pName, selectedColor);
      startWorld(seed, roomId);
    } catch (e) {
      alert(e.message || 'Мир не найден');
    } finally {
      btnJoinWorld.disabled = false;
      btnJoinWorld.textContent = '🔗 ВОЙТИ К ДРУГУ ПО КОДУ';
    }
  });

  function startWorld(seed, roomCode) {
    audio.init();
    screenLobby.classList.add('hidden');
    document.getElementById('mc-hud').classList.remove('hidden');

    world = new WorldGenerator(450, 150, seed);

    // Safe surface spawn finder
    let spawnY = 40;
    for (let y = 10; y < 90; y++) {
      if (world.getBlock(100, y) === BLOCKS.GRASS) {
        spawnY = y - 2.5;
        break;
      }
    }

    player = new Player(100, spawnY);
    player.name = inputPlayerName.value.trim() || 'Стив';
    player.color = selectedColor;

    camera.x = player.x * TILE_SIZE;
    camera.y = player.y * TILE_SIZE;

    // Multiplayer room listener
    if (roomCode) {
      document.getElementById('hud-mc-room-tag').textContent = `КОМНАТА: ${roomCode}`;
      document.getElementById('hud-mc-room-tag').classList.remove('hidden');

      network.listenToWorld(
        roomCode,
        (bx, by, blockId) => {
          world.setBlock(bx, by, blockId);
        },
        (remotePlayers) => {
          // updated
        },
        (chat) => {
          addChatMessage(chat.sender, chat.text);
        }
      );
      showBannerNotification(`Сетевой мир запущен! Код: ${roomCode}`);
    } else {
      document.getElementById('hud-mc-room-tag').classList.add('hidden');
      showBannerNotification('Одиночный мир запущен!');
    }

    isGameRunning = true;
    updateHotbarUI();
  }

  // Click Room Tag to Copy
  document.getElementById('hud-mc-room-tag').addEventListener('click', () => {
    const text = document.getElementById('hud-mc-room-tag').textContent.replace('КОМНАТА: ', '');
    navigator.clipboard.writeText(text).then(() => {
      showBannerNotification(`Код ${text} скопирован в буфер!`);
    }).catch(() => {});
  });

  // --- MINING & INTERACTION ---

  function handleMouseAction(button) {
    if (!player || player.isDead) return;
    updateWorldMouse();
    const bx = mouse.worldX;
    const by = mouse.worldY;
    const dist = Math.hypot(player.x - bx, (player.y + 0.8) - by);

    if (dist > 6.5) return;

    const targetBlock = world.getBlock(bx, by);
    const held = player.getHeldItem();

    if (button === 0) {
      // Left Click: Attack Mob / Start Mining
      player.swingProgress = 1.0;
      audio.playSwing();

      let hitMob = false;
      mobs.forEach(mob => {
        if (!mob.isDead && Math.hypot(mob.x - bx, mob.y - by) < 1.4) {
          hitMob = true;
          let dmg = 2;
          if (held && ITEM_DATA[held.id] && ITEM_DATA[held.id].damage) dmg = ITEM_DATA[held.id].damage;
          mob.takeDamage(dmg, droppedItems, audio);
          createHitParticles(mob.x * TILE_SIZE, mob.y * TILE_SIZE, '#ff3333');
        }
      });

      if (!hitMob && targetBlock !== BLOCKS.AIR && targetBlock !== BLOCKS.BEDROCK) {
        const blockDef = ITEM_DATA[targetBlock] || { hardness: 1.0 };
        miningTarget = { x: bx, y: by, progress: 0, hardness: blockDef.hardness };
      }
    } 
    else if (button === 2) {
      // Right Click: Place / Interact / Eat / Boss
      player.swingProgress = 1.0;

      if (targetBlock === BLOCKS.CRAFTING_TABLE) {
        openCraftingTableModal();
        return;
      }

      if (!held) return;

      if (ITEM_DATA[held.id] && ITEM_DATA[held.id].food) {
        if (player.hunger < player.maxHunger || player.health < player.maxHealth) {
          player.hunger = Math.min(player.maxHunger, player.hunger + ITEM_DATA[held.id].food);
          if (ITEM_DATA[held.id].health) player.health = Math.min(player.maxHealth, player.health + ITEM_DATA[held.id].health);
          held.count--;
          if (held.count <= 0) player.inventory[player.selectedHotbarSlot] = null;
          audio.playEat();
          updateHotbarUI();
          return;
        }
      }

      if (held.id === ITEMS.BOW) {
        const hasArrow = player.inventory.some(s => s && s.id === ITEMS.ARROW);
        if (hasArrow) {
          const arrowSlot = player.inventory.find(s => s && s.id === ITEMS.ARROW);
          arrowSlot.count--;
          if (arrowSlot.count <= 0) {
            const idx = player.inventory.indexOf(arrowSlot);
            player.inventory[idx] = null;
          }
          const angle = Math.atan2(mouse.y - canvas.height / 2, mouse.x - canvas.width / 2);
          projectiles.push(new Projectile(player.x, player.y + 0.8, Math.cos(angle) * 20, Math.sin(angle) * 20, 'player'));
          audio.playBowShoot();
          updateHotbarUI();
          return;
        }
      }

      if (held.id === ITEMS.EYE_OF_ENDER) {
        held.count--;
        if (held.count <= 0) player.inventory[player.selectedHotbarSlot] = null;
        mobs.push(new Mob('boss', player.x + 8, player.y - 12));
        audio.playExplosion();
        showBannerNotification('ПРОБУЖДЕНИЕ ДРАКОНА-ВИТЕРА!');
        updateHotbarUI();
        return;
      }

      if (ITEM_DATA[held.id] && ITEM_DATA[held.id].isBlock) {
        if (targetBlock === BLOCKS.AIR || targetBlock === BLOCKS.WATER) {
          const overlapsPlayer = (
            bx >= Math.floor(player.x - player.w / 2) &&
            bx <= Math.floor(player.x + player.w / 2) &&
            by >= Math.floor(player.y) &&
            by <= Math.floor(player.y + player.h)
          );

          if (!overlapsPlayer || held.id === BLOCKS.TORCH || held.id === BLOCKS.LADDER) {
            world.setBlock(bx, by, held.id);
            network.broadcastBlock(bx, by, held.id);
            audio.playBlockPlace();
            held.count--;
            if (held.count <= 0) player.inventory[player.selectedHotbarSlot] = null;
            updateHotbarUI();
          }
        }
      }
    }
  }

  function updateMining(delta) {
    if (!mouse.leftDown || !miningTarget || !world) return;

    updateWorldMouse();
    if (miningTarget.x !== mouse.worldX || miningTarget.y !== mouse.worldY) {
      miningTarget = null;
      return;
    }

    const held = player.getHeldItem();
    let speedMult = 1.0;
    if (held && ITEM_DATA[held.id] && ITEM_DATA[held.id].speed) speedMult = ITEM_DATA[held.id].speed;

    miningTarget.progress += delta * speedMult;

    if (Math.random() < 0.25) {
      const b = world.getBlock(miningTarget.x, miningTarget.y);
      const bDef = ITEM_DATA[b];
      audio.playDig(bDef && bDef.reqTool === 'pickaxe' ? 'stone' : 'dirt');
    }

    if (miningTarget.progress >= miningTarget.hardness) {
      const b = world.getBlock(miningTarget.x, miningTarget.y);
      const bDef = ITEM_DATA[b];
      const dropId = bDef && bDef.drop !== undefined ? bDef.drop : b;

      world.setBlock(miningTarget.x, miningTarget.y, BLOCKS.AIR);
      network.broadcastBlock(miningTarget.x, miningTarget.y, BLOCKS.AIR);

      droppedItems.push(new DroppedItem(dropId, miningTarget.x + 0.5, miningTarget.y + 0.5, 1));
      createHitParticles((miningTarget.x + 0.5) * TILE_SIZE, (miningTarget.y + 0.5) * TILE_SIZE, bDef ? bDef.color : '#888');

      miningTarget = null;
    }
  }

  function dropHeldItem() {
    if (!player) return;
    const held = player.getHeldItem();
    if (!held) return;

    droppedItems.push(new DroppedItem(held.id, player.x + player.facing * 0.8, player.y + 0.5, 1));
    held.count--;
    if (held.count <= 0) player.inventory[player.selectedHotbarSlot] = null;
    audio.playPop();
    updateHotbarUI();
  }

  function createHitParticles(px, py, color) {
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 140,
        vy: (Math.random() - 0.8) * 140,
        color: color,
        life: 0.4
      });
    }
  }

  // --- MOBS SPAWNER ---
  let mobSpawnTimer = 0;
  function updateMobSpawning(delta) {
    if (!world || !player) return;
    mobSpawnTimer += delta;
    if (mobSpawnTimer > 6.0 && mobs.length < 12) {
      mobSpawnTimer = 0;
      const isNight = (gameTime % 600) > 300;

      const spawnX = Math.floor(player.x + (Math.random() > 0.5 ? 1 : -1) * (18 + Math.random() * 8));
      if (spawnX > 4 && spawnX < world.width - 4) {
        for (let y = 10; y < world.height - 10; y++) {
          if (world.getBlock(spawnX, y) !== BLOCKS.AIR && world.getBlock(spawnX, y - 1) === BLOCKS.AIR) {
            const types = isNight ? ['zombie', 'skeleton', 'creeper', 'spider'] : ['zombie'];
            const chosen = types[Math.floor(Math.random() * types.length)];
            mobs.push(new Mob(chosen, spawnX, y - 2));
            break;
          }
        }
      }
    }
  }

  // --- INVENTORY & CRAFTING UI ---
  const inventoryModal = document.getElementById('modal-inventory');
  const craftingList = document.getElementById('crafting-recipes-list');

  function toggleInventoryModal(forceState = null) {
    if (!player) return;
    const isVis = forceState !== null ? forceState : !inventoryModal.classList.contains('active');
    if (isVis) {
      renderInventoryGrid();
      renderCraftingList(false);
      inventoryModal.classList.add('active');
    } else {
      inventoryModal.classList.remove('active');
    }
  }

  function openCraftingTableModal() {
    renderInventoryGrid();
    renderCraftingList(true);
    inventoryModal.classList.add('active');
    showBannerNotification('ОТКРЫТ ВЕРСТАК (3x3)');
  }

  function renderInventoryGrid() {
    const grid = document.getElementById('inventory-slots-grid');
    grid.innerHTML = '';

    for (let i = 0; i < 36; i++) {
      const slot = document.createElement('div');
      slot.className = `inv-slot ${i === player.selectedHotbarSlot ? 'selected' : ''}`;
      const item = player.inventory[i];

      if (item) {
        const itemInfo = ITEM_DATA[item.id] || { name: 'Предмет', icon: '📦' };
        slot.innerHTML = `
          <div class="inv-item-icon">${itemInfo.icon || '🧱'}</div>
          ${item.count > 1 ? `<span class="inv-item-count">${item.count}</span>` : ''}
        `;
        slot.title = itemInfo.name;
      }

      grid.appendChild(slot);
    }
  }

  function renderCraftingList(hasTable = false) {
    craftingList.innerHTML = '';

    CRAFTING_RECIPES.forEach(recipe => {
      if (recipe.reqTable && !hasTable) return;

      const resultInfo = ITEM_DATA[recipe.result] || { name: 'Предмет', icon: '📦' };
      const canCraft = canCraftRecipe(recipe);

      const row = document.createElement('div');
      row.className = `craft-recipe-row ${canCraft ? 'available' : 'disabled'}`;
      row.innerHTML = `
        <div class="craft-res-icon">${resultInfo.icon || '🧱'}</div>
        <div class="craft-res-info">
          <div class="craft-res-name">${resultInfo.name} x${recipe.count}</div>
          <div class="craft-reqs">${getRecipeRequirementString(recipe)}</div>
        </div>
      `;

      if (canCraft) {
        row.addEventListener('click', () => {
          craftRecipe(recipe);
          renderInventoryGrid();
          renderCraftingList(hasTable);
          updateHotbarUI();
          audio.playPop();
        });
      }

      craftingList.appendChild(row);
    });
  }

  function canCraftRecipe(recipe) {
    const counts = {};
    player.inventory.forEach(s => {
      if (s) counts[s.id] = (counts[s.id] || 0) + s.count;
    });

    const needed = {};
    recipe.inputs.forEach(id => needed[id] = (needed[id] || 0) + 1);

    for (const [id, reqCount] of Object.entries(needed)) {
      if ((counts[id] || 0) < reqCount) return false;
    }
    return true;
  }

  function getRecipeRequirementString(recipe) {
    const needed = {};
    recipe.inputs.forEach(id => needed[id] = (needed[id] || 0) + 1);
    return Object.entries(needed).map(([id, c]) => {
      const info = ITEM_DATA[id] || { name: 'Предмет' };
      return `${info.name} x${c}`;
    }).join(', ');
  }

  function craftRecipe(recipe) {
    recipe.inputs.forEach(id => {
      for (let i = 0; i < 36; i++) {
        const s = player.inventory[i];
        if (s && s.id === id) {
          s.count--;
          if (s.count <= 0) player.inventory[i] = null;
          break;
        }
      }
    });

    new DroppedItem(recipe.result, 0, 0, recipe.count).giveToPlayer(player);
  }

  // --- CHAT SYSTEM ---
  const chatInputBox = document.getElementById('hud-mc-chat-box');
  const chatInput = document.getElementById('hud-mc-chat-input');
  const chatFeed = document.getElementById('hud-mc-chat-feed');

  function openChatInput() {
    chatInputBox.classList.remove('hidden');
    chatInput.focus();
  }

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const text = chatInput.value.trim();
      if (text && player) {
        addChatMessage(player.name, text);
        network.sendChat(text);
        chatInput.value = '';
      }
      chatInputBox.classList.add('hidden');
      canvas.focus();
    } else if (e.key === 'Escape') {
      chatInputBox.classList.add('hidden');
      canvas.focus();
    }
  });

  function addChatMessage(sender, text) {
    const msg = document.createElement('div');
    msg.className = 'chat-msg';
    msg.innerHTML = `<span class="chat-sender">&lt;${sender}&gt;</span> ${text}`;
    chatFeed.appendChild(msg);
    chatFeed.scrollTop = chatFeed.scrollHeight;
    setTimeout(() => msg.remove(), 12000);
  }

  // --- HUD UPDATES ---
  function updateHotbarUI() {
    if (!player) return;
    const bar = document.getElementById('hotbar-slots');
    bar.innerHTML = '';

    for (let i = 0; i < 9; i++) {
      const slot = document.createElement('div');
      slot.className = `hotbar-slot ${i === player.selectedHotbarSlot ? 'active' : ''}`;
      const item = player.inventory[i];

      if (item) {
        const itemInfo = ITEM_DATA[item.id] || { name: 'Предмет', icon: '📦' };
        slot.innerHTML = `
          <div class="hotbar-icon">${itemInfo.icon || '🧱'}</div>
          ${item.count > 1 ? `<span class="hotbar-count">${item.count}</span>` : ''}
        `;
      }

      slot.addEventListener('click', () => {
        player.selectedHotbarSlot = i;
        updateHotbarUI();
      });

      bar.appendChild(slot);
    }
  }

  function updateStatusHUD() {
    if (!player) return;
    document.getElementById('hud-hearts').innerHTML = '❤️'.repeat(Math.ceil(player.health / 2));
    document.getElementById('hud-hunger').innerHTML = '🍗'.repeat(Math.ceil(player.hunger / 2));

    const boss = mobs.find(m => m.type === 'boss' && !m.isDead);
    const bossHud = document.getElementById('hud-boss-bar');
    if (boss) {
      bossHud.classList.remove('hidden');
      document.getElementById('boss-fill').style.width = `${(boss.health / boss.maxHealth) * 100}%`;
    } else {
      bossHud.classList.add('hidden');
    }
  }

  function showBannerNotification(msg) {
    const banner = document.getElementById('hud-notification');
    banner.textContent = msg;
    banner.classList.add('visible');
    setTimeout(() => banner.classList.remove('visible'), 3000);
  }

  document.getElementById('btn-close-inv').addEventListener('click', () => toggleInventoryModal(false));
  document.getElementById('btn-save-world').addEventListener('click', () => {
    if (world && player) {
      saveManager.saveGame(world, player, gameTime);
      showBannerNotification('МИР УСПЕШНО СОХРАНЕН!');
    }
  });
  document.getElementById('btn-export-world').addEventListener('click', () => {
    if (world && player) saveManager.exportSaveFile(world, player, gameTime);
  });

  // --- RENDER & PHYSICS LOOP ---
  const clock = new THREE.Clock();

  function loop() {
    requestAnimationFrame(loop);
    const delta = Math.min(clock.getDelta(), 0.08);

    if (isGameRunning && world && player) {
      gameTime += delta;

      // 1. Update Player & Camera
      player.update(delta, world, keys, audio);
      camera.x += ((player.x * TILE_SIZE) - camera.x) * 0.12;
      camera.y += (((player.y + 0.8) * TILE_SIZE) - camera.y) * 0.12;

      // Broadcast position to friend
      network.broadcastPlayer(player.x, player.y, player.facing, player.getHeldItem() ? player.getHeldItem().id : 0, !player.isDead);

      // 2. Mining
      updateMining(delta);

      // 3. Mobs & Spawns
      updateMobSpawning(delta);
      mobs.forEach(mob => mob.update(delta, player, world, projectiles, droppedItems, audio));

      // 4. Projectiles
      projectiles.forEach(p => p.update(delta, world, player, mobs, audio));

      // 5. Dropped Items
      droppedItems.forEach(item => item.update(delta, world, player, audio));

      // 6. Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].life -= delta;
        particles[i].x += particles[i].vx * delta;
        particles[i].y += particles[i].vy * delta;
        if (particles[i].life <= 0) particles.splice(i, 1);
      }

      // 7. Render Game
      renderGame();
      updateStatusHUD();
    }
  }

  function renderGame() {
    const cycleTime = (gameTime % 600) / 600;
    let skyColor = '#80b5ff';
    let sunIntensity = 1.0;

    if (cycleTime > 0.45 && cycleTime < 0.55) {
      skyColor = '#d97d43';
      sunIntensity = 0.5;
    } else if (cycleTime >= 0.55 && cycleTime <= 0.95) {
      skyColor = '#0b0f19';
      sunIntensity = 0.15;
    }

    ctx.fillStyle = skyColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2 - camera.x, canvas.height / 2 - camera.y);

    const minX = Math.max(0, Math.floor((camera.x - canvas.width / 2) / TILE_SIZE) - 2);
    const maxX = Math.min(world.width - 1, Math.ceil((camera.x + canvas.width / 2) / TILE_SIZE) + 2);
    const minY = Math.max(0, Math.floor((camera.y - canvas.height / 2) / TILE_SIZE) - 2);
    const maxY = Math.min(world.height - 1, Math.ceil((camera.y + canvas.height / 2) / TILE_SIZE) + 2);

    world.computeLighting(sunIntensity, minX, maxX, minY, maxY);

    // Draw Pixel Blocks
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const b = world.getBlock(x, y);
        if (b === BLOCKS.AIR) continue;

        const tex = atlas.textures.get(b);
        const light = world.lightMap[world.getIndex(x, y)] || 1.0;

        if (tex) {
          ctx.drawImage(tex, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        } else {
          const bDef = ITEM_DATA[b] || { color: '#888888' };
          ctx.fillStyle = bDef.color;
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }

        if (b === BLOCKS.TORCH) {
          ctx.fillStyle = '#ffeedd';
          ctx.beginPath();
          ctx.arc((x + 0.5) * TILE_SIZE, (y + 0.5) * TILE_SIZE, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        if (light < 0.95 && b !== BLOCKS.TORCH) {
          ctx.fillStyle = `rgba(0, 0, 0, ${1.0 - light})`;
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // Mining Crack Overlay
    if (miningTarget) {
      const crackStage = Math.floor((miningTarget.progress / miningTarget.hardness) * 5);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(miningTarget.x * TILE_SIZE, miningTarget.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = `rgba(0, 0, 0, ${crackStage * 0.15})`;
      ctx.fillRect(miningTarget.x * TILE_SIZE, miningTarget.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    // Dropped Items
    droppedItems.forEach(item => {
      if (!item.isDead) {
        const itemInfo = ITEM_DATA[item.itemId] || { icon: '📦' };
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(itemInfo.icon || '🧱', item.x * TILE_SIZE, (item.y + Math.sin(item.floatTimer * 4) * 0.15) * TILE_SIZE);
      }
    });

    // Projectiles
    projectiles.forEach(p => {
      if (!p.isDead) {
        ctx.fillStyle = p.source === 'boss' ? '#8a2be2' : '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x * TILE_SIZE, p.y * TILE_SIZE, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Mobs
    mobs.forEach(mob => {
      if (!mob.isDead) drawMob(ctx, mob);
    });

    // Remote Players (Friend!)
    network.remotePlayers.forEach(rp => {
      if (rp.isAlive) {
        drawSteve(ctx, rp.x, rp.y, rp.facing, rp.name, rp.color, rp.heldId);
      }
    });

    // Local Player
    if (!player.isDead) {
      drawSteve(ctx, player.x, player.y, player.facing, player.name, player.color, player.getHeldItem() ? player.getHeldItem().id : 0, player.swingProgress, player.walkAnimTimer);
    }

    // Particles
    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 4, 4);
    });

    ctx.restore();
  }

  function drawSteve(c, x, y, facing, name, shirtColor, heldId = 0, swing = 0, walkTimer = 0) {
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;

    c.save();
    c.translate(px, py);
    c.scale(facing, 1);

    // Leg walk swing
    const legOffset = Math.sin(walkTimer) * 4;

    // Head
    c.fillStyle = '#c68c53';
    c.fillRect(-6, 0, 12, 12);
    // Hair
    c.fillStyle = '#4a2e18';
    c.fillRect(-6, 0, 12, 4);
    // Eyes
    c.fillStyle = '#ffffff';
    c.fillRect(1, 4, 3, 2);
    c.fillStyle = '#3a5da8';
    c.fillRect(3, 4, 2, 2);

    // Shirt
    c.fillStyle = shirtColor || '#00aaaa';
    c.fillRect(-7, 12, 14, 18);

    // Legs
    c.fillStyle = '#2b3990';
    c.fillRect(-6, 30, 5, 20 + legOffset);
    c.fillRect(1, 30, 5, 20 - legOffset);

    // Held Item
    if (heldId) {
      const itemInfo = ITEM_DATA[heldId] || { icon: '🗡️' };
      c.save();
      c.translate(6, 18);
      c.rotate(swing * Math.PI * 0.6);
      c.font = '20px sans-serif';
      c.fillText(itemInfo.icon || '🗡️', 0, 0);
      c.restore();
    }

    // Nametag
    c.fillStyle = '#ffffff';
    c.font = 'bold 12px sans-serif';
    c.textAlign = 'center';
    c.scale(facing, 1); // unflip nametag
    c.fillText(name, 0, -8);

    c.restore();
  }

  function drawMob(c, m) {
    const mx = m.x * TILE_SIZE;
    const my = m.y * TILE_SIZE;

    c.save();
    c.translate(mx, my);
    c.scale(m.facing, 1);

    if (m.type === 'zombie') {
      c.fillStyle = '#497332';
      c.fillRect(-6, 0, 12, 12);
      c.fillStyle = '#008888';
      c.fillRect(-7, 12, 14, 18);
      c.fillStyle = '#2b3990';
      c.fillRect(-6, 30, 5, 20);
      c.fillRect(1, 30, 5, 20);
    } else if (m.type === 'skeleton') {
      c.fillStyle = '#d9d9d9';
      c.fillRect(-6, 0, 12, 12);
      c.fillRect(-5, 12, 10, 18);
      c.fillRect(-5, 30, 4, 20);
      c.fillRect(1, 30, 4, 20);
    } else if (m.type === 'creeper') {
      c.fillStyle = m.fuseTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0 ? '#ffffff' : '#00aa00';
      c.fillRect(-7, 0, 14, 14);
      c.fillRect(-6, 14, 12, 22);
      c.fillRect(-7, 36, 5, 10);
      c.fillRect(2, 36, 5, 10);
    } else if (m.type === 'spider') {
      c.fillStyle = '#1c1108';
      c.fillRect(-16, 0, 32, 14);
      c.fillStyle = '#ff0000';
      c.fillRect(8, 4, 4, 4);
    } else if (m.type === 'boss') {
      c.fillStyle = '#140d1e';
      c.fillRect(-32, -32, 64, 64);
      c.fillStyle = '#ff00ff';
      c.fillRect(-18, -8, 8, 8);
      c.fillRect(10, -8, 8, 8);
    }

    c.restore();
  }

  loop();
});
