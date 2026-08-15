/**
 * 2D MINECRAFT // COMPLETE MASTER GAME ENGINE
 * Coordinates Canvas 2D rendering, Player Physics, Mining/Building,
 * Crafting Grid, Furnace Smelting, Mob AI, Boss Fights, Day-Night Cycle,
 * Sound Synthesizer, and Auto-Saving.
 */

import { BLOCKS, ITEMS, ITEM_DATA, CRAFTING_RECIPES, SMELTING_RECIPES } from "./items-recipes.js";
import { MinecraftAudioEngine } from "./audio-engine.js";
import { WorldGenerator } from "./world-generator.js";
import { Player, Mob, Projectile, DroppedItem } from "./entities.js";
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

  // 1. Initialize Engines
  const audio = new MinecraftAudioEngine();
  const world = new WorldGenerator(450, 150);
  const player = new Player(225, 45);
  const saveManager = new SaveManager();

  // Try loading existing save
  const loadedTime = saveManager.loadGame(world, player);
  let gameTime = loadedTime || 300; // seconds

  // Entities
  const mobs = [];
  const projectiles = [];
  const droppedItems = [];
  const particles = [];

  // Tile Scale
  const TILE_SIZE = 32; // px per block
  const camera = { x: player.x * TILE_SIZE, y: player.y * TILE_SIZE };

  // Mining state
  const mouse = { x: 0, y: 0, worldX: 0, worldY: 0, leftDown: false, rightDown: false };
  let miningTarget = null; // { x, y, progress, maxHardness }

  // Keyboard state
  const keys = {};

  window.addEventListener('keydown', (e) => {
    audio.init();
    keys[e.code] = true;

    // Number keys 1..9 for hotbar
    if (e.key >= '1' && e.key <= '9') {
      player.selectedHotbarSlot = parseInt(e.key) - 1;
      updateHotbarUI();
    }

    if (e.code === 'KeyE') toggleInventoryModal();
    if (e.code === 'KeyQ') dropHeldItem();
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  // Mouse controls
  canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    updateWorldMouse();
  });

  canvas.addEventListener('mousedown', (e) => {
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
    if (e.deltaY > 0) player.selectedHotbarSlot = (player.selectedHotbarSlot + 1) % 9;
    else player.selectedHotbarSlot = (player.selectedHotbarSlot + 8) % 9;
    updateHotbarUI();
  });

  function updateWorldMouse() {
    mouse.worldX = Math.floor((mouse.x - canvas.width / 2 + camera.x) / TILE_SIZE);
    mouse.worldY = Math.floor((mouse.y - canvas.height / 2 + camera.y) / TILE_SIZE);
  }

  // --- MINING & INTERACTION ---

  function handleMouseAction(button) {
    updateWorldMouse();
    const bx = mouse.worldX;
    const by = mouse.worldY;
    const distToBlock = Math.hypot(player.x - bx, (player.y + 0.8) - by);

    if (distToBlock > 6.5) return; // Block reach distance

    const targetBlock = world.getBlock(bx, by);
    const held = player.getHeldItem();

    if (button === 0) {
      // Left Click: Attack mob or Start Mining
      player.swingProgress = 1.0;
      audio.playSwing();

      // Check hit mob
      let hitMob = false;
      mobs.forEach(mob => {
        if (!mob.isDead && Math.hypot(mob.x - bx, mob.y - by) < 1.4) {
          hitMob = true;
          let dmg = 2; // Fist
          if (held && ITEM_DATA[held.id] && ITEM_DATA[held.id].damage) {
            dmg = ITEM_DATA[held.id].damage;
          }
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
      // Right Click: Place block / Interact / Eat food / Bow / Summon Boss
      player.swingProgress = 1.0;

      // 1. Open Crafting Table
      if (targetBlock === BLOCKS.CRAFTING_TABLE) {
        openCraftingTableModal();
        return;
      }
      // 2. Open Furnace
      if (targetBlock === BLOCKS.FURNACE) {
        openFurnaceModal();
        return;
      }

      if (!held) return;

      // 3. Eat Food
      if (ITEM_DATA[held.id] && ITEM_DATA[held.id].food) {
        if (player.hunger < player.maxHunger || player.health < player.maxHealth) {
          player.hunger = Math.min(player.maxHunger, player.hunger + ITEM_DATA[held.id].food);
          if (ITEM_DATA[held.id].health) {
            player.health = Math.min(player.maxHealth, player.health + ITEM_DATA[held.id].health);
          }
          held.count--;
          if (held.count <= 0) player.inventory[player.selectedHotbarSlot] = null;
          audio.playEat();
          updateHotbarUI();
          return;
        }
      }

      // 4. Shoot Bow
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

      // 5. Summon Boss (Eye of Ender)
      if (held.id === ITEMS.EYE_OF_ENDER) {
        held.count--;
        if (held.count <= 0) player.inventory[player.selectedHotbarSlot] = null;
        mobs.push(new Mob('boss', player.x + 8, player.y - 12));
        audio.playExplosion();
        showBannerNotification('ПРОБУЖДЕНИЕ ДРАКОНА-ВИТЕРА!');
        updateHotbarUI();
        return;
      }

      // 6. Place Block
      if (ITEM_DATA[held.id] && ITEM_DATA[held.id].isBlock) {
        if (targetBlock === BLOCKS.AIR || targetBlock === BLOCKS.WATER) {
          // Check player not intersecting placement
          const overlapsPlayer = (
            bx >= Math.floor(player.x - player.w / 2) &&
            bx <= Math.floor(player.x + player.w / 2) &&
            by >= Math.floor(player.y) &&
            by <= Math.floor(player.y + player.h)
          );

          if (!overlapsPlayer || held.id === BLOCKS.TORCH || held.id === BLOCKS.LADDER) {
            world.setBlock(bx, by, held.id);
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
    if (!mouse.leftDown || !miningTarget) return;

    updateWorldMouse();
    if (miningTarget.x !== mouse.worldX || miningTarget.y !== mouse.worldY) {
      miningTarget = null;
      return;
    }

    const held = player.getHeldItem();
    let speedMult = 1.0;
    if (held && ITEM_DATA[held.id] && ITEM_DATA[held.id].speed) {
      speedMult = ITEM_DATA[held.id].speed;
    }

    miningTarget.progress += delta * speedMult;

    // Dig sound interval
    if (Math.random() < 0.25) {
      const b = world.getBlock(miningTarget.x, miningTarget.y);
      const bDef = ITEM_DATA[b];
      audio.playDig(bDef && bDef.reqTool === 'pickaxe' ? 'stone' : 'dirt');
    }

    if (miningTarget.progress >= miningTarget.hardness) {
      // Block Broken!
      const b = world.getBlock(miningTarget.x, miningTarget.y);
      const bDef = ITEM_DATA[b];
      const dropId = bDef && bDef.drop !== undefined ? bDef.drop : b;

      world.setBlock(miningTarget.x, miningTarget.y, BLOCKS.AIR);
      droppedItems.push(new DroppedItem(dropId, miningTarget.x + 0.5, miningTarget.y + 0.5, 1));
      createHitParticles((miningTarget.x + 0.5) * TILE_SIZE, (miningTarget.y + 0.5) * TILE_SIZE, bDef ? bDef.color : '#888');

      miningTarget = null;
    }
  }

  function dropHeldItem() {
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

  // --- SPAWN MOBS AT NIGHT ---

  let mobSpawnTimer = 0;
  function updateMobSpawning(delta) {
    mobSpawnTimer += delta;
    if (mobSpawnTimer > 6.0 && mobs.length < 12) {
      mobSpawnTimer = 0;
      const isNight = (gameTime % 600) > 300;

      // Spawn off-screen
      const spawnX = Math.floor(player.x + (Math.random() > 0.5 ? 1 : -1) * (18 + Math.random() * 8));
      if (spawnX > 4 && spawnX < world.width - 4) {
        // Find top block
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
    renderCraftingList(true); // 3x3 allowed
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

    // Add result
    new DroppedItem(recipe.result, 0, 0, recipe.count).giveToPlayer(player);
  }

  // --- FURNACE MODAL ---
  function openFurnaceModal() {
    toggleInventoryModal(true);
    showBannerNotification('ПЕЧЬ: ПЕРЕПЛАВКА РУДЫ');
  }

  // --- HUD UPDATES ---

  function updateHotbarUI() {
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
    // Health (Hearts)
    const heartsContainer = document.getElementById('hud-hearts');
    heartsContainer.innerHTML = '❤️'.repeat(Math.ceil(player.health / 2));

    // Hunger (Drumsticks)
    const hungerContainer = document.getElementById('hud-hunger');
    hungerContainer.innerHTML = '🍗'.repeat(Math.ceil(player.hunger / 2));

    // Boss Bar
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
    saveManager.saveGame(world, player, gameTime);
    showBannerNotification('МИР УСПЕШНО СОХРАНЕН!');
  });
  document.getElementById('btn-export-world').addEventListener('click', () => {
    saveManager.exportSaveFile(world, player, gameTime);
  });

  // --- RENDER & PHYSICS LOOP ---

  let lastSaveTime = 0;
  const clock = new THREE.Clock();

  function loop() {
    requestAnimationFrame(loop);
    const delta = Math.min(clock.getDelta(), 0.08);
    gameTime += delta;

    // 1. Auto-save every 30s
    if (gameTime - lastSaveTime > 30) {
      lastSaveTime = gameTime;
      saveManager.saveGame(world, player, gameTime);
    }

    // 2. Update Player & Camera
    player.update(delta, world, keys, audio);
    camera.x += ((player.x * TILE_SIZE) - camera.x) * 0.12;
    camera.y += (((player.y + 0.8) * TILE_SIZE) - camera.y) * 0.12;

    // 3. Mining
    updateMining(delta);

    // 4. Update Mobs
    updateMobSpawning(delta);
    mobs.forEach(mob => mob.update(delta, player, world, projectiles, droppedItems, audio));

    // 5. Update Projectiles
    projectiles.forEach(p => p.update(delta, world, player, mobs, audio));

    // 6. Update Dropped Items
    droppedItems.forEach(item => item.update(delta, world, player, audio));

    // 7. Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].life -= delta;
      particles[i].x += particles[i].vx * delta;
      particles[i].y += particles[i].vy * delta;
      if (particles[i].life <= 0) particles.splice(i, 1);
    }

    // 8. Render Scene
    renderGame();
    updateStatusHUD();
  }

  function renderGame() {
    // 1. Dynamic Sky Cycle
    const cycleTime = (gameTime % 600) / 600; // 0..1 (Day -> Sunset -> Night -> Dawn)
    let skyColor = '#80b5ff'; // Day
    let sunIntensity = 1.0;

    if (cycleTime > 0.45 && cycleTime < 0.55) {
      skyColor = '#d97d43'; // Sunset
      sunIntensity = 0.5;
    } else if (cycleTime >= 0.55 && cycleTime <= 0.95) {
      skyColor = '#0b0f19'; // Starry Night
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

    // Compute Dynamic Lighting
    world.computeLighting(sunIntensity, minX, maxX, minY, maxY);

    // 2. Draw World Blocks
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const b = world.getBlock(x, y);
        if (b === BLOCKS.AIR) continue;

        const bDef = ITEM_DATA[b] || { color: '#888888' };
        const light = world.lightMap[world.getIndex(x, y)] || 1.0;

        ctx.fillStyle = bDef.color;
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        // Pixel block texture border
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.fillRect(x * TILE_SIZE, (y + 0.9) * TILE_SIZE, TILE_SIZE, TILE_SIZE * 0.1);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE * 0.1);

        // Torch Glow
        if (b === BLOCKS.TORCH) {
          ctx.fillStyle = '#ffeedd';
          ctx.beginPath();
          ctx.arc((x + 0.5) * TILE_SIZE, (y + 0.5) * TILE_SIZE, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Apply Darkness / Cave shadow
        if (light < 0.95 && b !== BLOCKS.TORCH) {
          ctx.fillStyle = `rgba(0, 0, 0, ${1.0 - light})`;
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // 3. Draw Mining Cracks
    if (miningTarget) {
      const crackStage = Math.floor((miningTarget.progress / miningTarget.hardness) * 5);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeRect(miningTarget.x * TILE_SIZE, miningTarget.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = `rgba(0, 0, 0, ${crackStage * 0.15})`;
      ctx.fillRect(miningTarget.x * TILE_SIZE, miningTarget.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    // 4. Draw Dropped Items
    droppedItems.forEach(item => {
      if (!item.isDead) {
        const itemInfo = ITEM_DATA[item.itemId] || { icon: '📦' };
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(itemInfo.icon || '🧱', item.x * TILE_SIZE, (item.y + Math.sin(item.floatTimer * 4) * 0.15) * TILE_SIZE);
      }
    });

    // 5. Draw Projectiles
    projectiles.forEach(p => {
      if (!p.isDead) {
        ctx.fillStyle = p.source === 'boss' ? '#8a2be2' : '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x * TILE_SIZE, p.y * TILE_SIZE, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 6. Draw Mobs
    mobs.forEach(mob => {
      if (!mob.isDead) drawMob(ctx, mob);
    });

    // 7. Draw Player
    if (!player.isDead) {
      drawPlayer(ctx, player);
    }

    // 8. Draw Particles
    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 4, 4);
    });

    ctx.restore();
  }

  function drawPlayer(c, p) {
    const px = p.x * TILE_SIZE;
    const py = p.y * TILE_SIZE;

    c.save();
    c.translate(px, py);
    c.scale(p.facing, 1);

    // Head
    c.fillStyle = '#c68c53';
    c.fillRect(-6, 0, 12, 12);
    // Hair
    c.fillStyle = '#4a2e18';
    c.fillRect(-6, 0, 12, 4);
    // Body (Cyan Shirt)
    c.fillStyle = '#00aaaa';
    c.fillRect(-8, 12, 16, 20);
    // Legs (Blue Pants)
    c.fillStyle = '#2b3990';
    c.fillRect(-7, 32, 6, 22);
    c.fillRect(1, 32, 6, 22);

    // Tool/Weapon in Hand
    const held = p.getHeldItem();
    if (held) {
      const itemInfo = ITEM_DATA[held.id] || { icon: '🗡️' };
      c.save();
      c.translate(8, 20);
      c.rotate(p.swingProgress * Math.PI * 0.6);
      c.font = '20px sans-serif';
      c.fillText(itemInfo.icon || '🗡️', 0, 0);
      c.restore();
    }

    c.restore();
  }

  function drawMob(c, m) {
    const mx = m.x * TILE_SIZE;
    const my = m.y * TILE_SIZE;

    c.save();
    c.translate(mx, my);
    c.scale(m.facing, 1);

    if (m.type === 'zombie') {
      c.fillStyle = '#497332'; // Green head
      c.fillRect(-6, 0, 12, 12);
      c.fillStyle = '#008888'; // Cyan shirt
      c.fillRect(-8, 12, 16, 20);
      c.fillStyle = '#2b3990';
      c.fillRect(-7, 32, 6, 22);
      c.fillRect(1, 32, 6, 22);
    } else if (m.type === 'skeleton') {
      c.fillStyle = '#d9d9d9'; // Bone head
      c.fillRect(-6, 0, 12, 12);
      c.fillRect(-6, 12, 12, 20);
      c.fillRect(-5, 32, 4, 22);
      c.fillRect(1, 32, 4, 22);
    } else if (m.type === 'creeper') {
      c.fillStyle = m.fuseTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0 ? '#ffffff' : '#00aa00';
      c.fillRect(-8, 0, 16, 16); // Head
      c.fillRect(-7, 16, 14, 24); // Body
      c.fillRect(-8, 40, 6, 10);
      c.fillRect(2, 40, 6, 10);
    } else if (m.type === 'spider') {
      c.fillStyle = '#1c1108';
      c.fillRect(-18, 0, 36, 16);
      c.fillStyle = '#ff0000'; // Red eyes
      c.fillRect(10, 4, 4, 4);
    } else if (m.type === 'boss') {
      // Giant Wither Dragon
      c.fillStyle = '#140d1e';
      c.fillRect(-36, -36, 72, 72);
      c.fillStyle = '#ff00ff';
      c.fillRect(-20, -10, 8, 8);
      c.fillRect(12, -10, 8, 8);
    }

    c.restore();
  }

  updateHotbarUI();
  loop();
});
