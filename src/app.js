/**
 * 3D MINECRAFT // COMPLETE 3D MASTER GAME ENGINE (THREE.JS)
 * 60 FPS Optimized Voxel Meshing, Cozy Shaders & Atmospheric Lighting,
 * 3D Raycasting Block Mining/Placing, 3D Mobs, Remote 3D Players, and Pause Menu.
 */

import { BLOCKS, ITEMS, ITEM_DATA, CRAFTING_RECIPES } from "./items-recipes.js";
import { MinecraftAudioEngine } from "./audio-engine.js";
import { VoxelTextureAtlas } from "./textures.js";
import { VoxelWorld } from "./voxel-world.js";
import { Player3D } from "./player-3d.js";
import { Mob3D, DroppedItem3D } from "./mobs-3d.js";
import { MinecraftMultiplayerManager } from "./multiplayer-manager.js";
import { SaveManager } from "./storage-save.js";

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-container');

  // 1. Initialize Three.js Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#80b5ff');
  scene.fog = new THREE.FogExp2('#80b5ff', 0.018);

  const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 200);
  
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', resize);

  // 2. Cozy Lighting
  const ambientLight = new THREE.AmbientLight(0xffeedd, 0.65);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 0.85);
  sunLight.position.set(40, 80, 40);
  scene.add(sunLight);

  // 3. Core Game Objects
  const audio = new MinecraftAudioEngine();
  const atlas = new VoxelTextureAtlas();
  const network = new MinecraftMultiplayerManager();
  const saveManager = new SaveManager();

  let world = null;
  let player = null;
  let worldMesh = null;
  let isGameRunning = false;
  let activeSeed = 12345;
  let activeWorldId = null;
  let activeWorldName = '3D Мир';
  let gameTime = 100;

  const mobs = [];
  const droppedItems = [];
  const remotePlayerMeshes = new Map();

  // Voxel Material
  const voxelMaterial = new THREE.MeshLambertMaterial({
    map: atlas.threeTexture,
    transparent: false,
    side: THREE.FrontSide
  });

  // Target Block 3D Wireframe Box
  const wireGeo = new THREE.BoxGeometry(1.005, 1.005, 1.005);
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
  const wireBox = new THREE.Mesh(wireGeo, wireMat);
  wireBox.visible = false;
  scene.add(wireBox);

  // Keyboard
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
    if (e.code === 'Escape') togglePauseMenu();
  });

  window.addEventListener('keyup', (e) => { keys[e.code] = false; });

  // --------------------------------------------------------------------------
  // LOBBY & PROFILE
  // --------------------------------------------------------------------------
  const profile = saveManager.loadProfile();
  const inputPlayerName = document.getElementById('mc-player-name');
  inputPlayerName.value = profile.name;
  let selectedColor = profile.color;

  document.querySelectorAll('.mc-skin-dot').forEach(dot => {
    if (dot.dataset.color === selectedColor) dot.classList.add('active');
    dot.addEventListener('click', () => {
      document.querySelectorAll('.mc-skin-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      selectedColor = dot.dataset.color;
      saveManager.saveProfile(inputPlayerName.value.trim() || 'Стив', selectedColor);
    });
  });

  const tabSingle = document.getElementById('tab-btn-single');
  const tabMulti = document.getElementById('tab-btn-multi');
  const viewSingle = document.getElementById('tab-view-single');
  const viewMulti = document.getElementById('tab-view-multi');

  tabSingle.addEventListener('click', () => {
    tabSingle.classList.add('active');
    tabMulti.classList.remove('active');
    viewSingle.classList.remove('hidden');
    viewMulti.classList.add('hidden');
    renderLocalWorldsList();
  });

  tabMulti.addEventListener('click', () => {
    tabMulti.classList.add('active');
    tabSingle.classList.remove('active');
    viewMulti.classList.remove('hidden');
    viewSingle.classList.add('hidden');
    refreshPublicServers();
  });

  document.getElementById('btn-create-single-world').addEventListener('click', () => {
    const name = prompt('Введите название мира:', `3D Мир ${saveManager.listWorlds().length + 1}`) || '3D Мир';
    const seed = Math.floor(Math.random() * 999999);
    activeWorldId = 'world_' + Date.now();
    activeWorldName = name;
    start3DWorld(seed, null);
  });

  function renderLocalWorldsList() {
    const list = document.getElementById('local-worlds-list');
    list.innerHTML = '';
    const worlds = saveManager.listWorlds();

    if (worlds.length === 0) {
      list.innerHTML = '<div class="empty-list-msg">Нет миров на устройстве. Создайте новый!</div>';
      return;
    }

    worlds.forEach(w => {
      const row = document.createElement('div');
      row.className = 'saved-world-card';
      row.innerHTML = `
        <div class="world-card-info">
          <div class="world-card-title">${w.name}</div>
          <div class="world-card-sub">3D Voxel World • ${new Date(w.lastPlayed).toLocaleDateString()}</div>
        </div>
        <div class="world-card-actions">
          <button class="btn-mc-primary btn-sm play-btn">▶ ИГРАТЬ</button>
          <button class="btn-mc-danger btn-sm del-btn">🗑</button>
        </div>
      `;

      row.querySelector('.play-btn').addEventListener('click', () => {
        activeWorldId = w.id;
        activeWorldName = w.name;
        start3DWorld(w.seed, null);
      });

      row.querySelector('.del-btn').addEventListener('click', () => {
        if (confirm(`Удалить мир "${w.name}"?`)) {
          saveManager.deleteWorld(w.id);
          renderLocalWorldsList();
        }
      });

      list.appendChild(row);
    });
  }

  // Multiplayer
  document.getElementById('btn-mc-create-online').addEventListener('click', async () => {
    const pName = inputPlayerName.value.trim() || 'Стив';
    const worldName = document.getElementById('mc-online-world-name').value.trim() || '3D Сервер';
    const btn = document.getElementById('btn-mc-create-online');
    btn.disabled = true;
    btn.textContent = 'Создание...';

    try {
      const { roomId, seed } = await network.createWorld(pName, selectedColor, worldName, true);
      start3DWorld(seed, roomId);
    } catch (e) {
      alert('Ошибка базы: ' + e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = '⚡ СОЗДАТЬ ОТКРЫТЫЙ СЕРВЕР';
    }
  });

  document.getElementById('btn-mc-join-online').addEventListener('click', async () => {
    const pName = inputPlayerName.value.trim() || 'Стив';
    const code = document.getElementById('mc-room-code').value.trim();
    if (!code) return alert('Введите код!');
    try {
      const { roomId, seed } = await network.joinWorld(code, pName, selectedColor);
      start3DWorld(seed, roomId);
    } catch (e) {
      alert(e.message || 'Сервер не найден');
    }
  });

  async function refreshPublicServers() {
    const list = document.getElementById('public-servers-list');
    list.innerHTML = '<div class="empty-list-msg">Поиск серверов...</div>';
    const worlds = await network.getPublicWorlds();
    list.innerHTML = '';

    if (worlds.length === 0) {
      list.innerHTML = '<div class="empty-list-msg">Нет открытых серверов. Создайте свой!</div>';
      return;
    }

    worlds.forEach(w => {
      const row = document.createElement('div');
      row.className = 'saved-world-card';
      row.innerHTML = `
        <div class="world-card-info">
          <div class="world-card-title">${w.name} [${w.roomId}]</div>
          <div class="world-card-sub">Хост: ${w.hostName} • Игроков: ${w.playerCount}</div>
        </div>
        <button class="btn-mc-primary btn-sm join-btn">🚀 ВОЙТИ</button>
      `;

      row.querySelector('.join-btn').addEventListener('click', async () => {
        try {
          const { roomId, seed } = await network.joinWorld(w.roomId, inputPlayerName.value.trim() || 'Стив', selectedColor);
          start3DWorld(seed, roomId);
        } catch (e) {
          alert(e.message || 'Ошибка входа');
        }
      });

      list.appendChild(row);
    });
  }

  document.getElementById('btn-refresh-servers').addEventListener('click', refreshPublicServers);

  // --- START 3D WORLD ---
  function start3DWorld(seed, roomCode) {
    audio.init();
    document.getElementById('screen-mc-lobby').classList.add('hidden');
    document.getElementById('mc-hud').classList.remove('hidden');

    activeSeed = seed;
    world = new VoxelWorld(64, 32, 64, seed);

    rebuildWorldMesh();

    // Spawn Player
    player = new Player3D(camera, renderer.domElement, 32, 24, 32);
    player.name = inputPlayerName.value.trim() || 'Стив';
    player.color = selectedColor;

    // Spawn starter mobs
    mobs.push(new Mob3D('zombie', 38, 20, 36, scene));
    mobs.push(new Mob3D('creeper', 26, 20, 28, scene));

    // Multiplayer Listener
    if (roomCode) {
      document.getElementById('hud-mc-room-tag').textContent = `КОМНАТА: ${roomCode}`;
      document.getElementById('hud-mc-room-tag').classList.remove('hidden');

      network.listenToWorld(
        roomCode,
        (bx, by, blockId) => {
          // Sync 3D block
          const [vx, vy, vz] = [bx % 64, by % 32, Math.floor(bx / 64)];
          world.setVoxel(vx, vy, vz, blockId);
          rebuildWorldMesh();
        },
        (remotePlayers) => updateRemote3DPlayers(remotePlayers),
        (chat) => addChatMessage(chat.sender, chat.text),
        () => {
          alert('Хост вышел из мира. Возврат в меню.');
          location.reload();
        }
      );
      showBannerNotification(`3D Сетевой мир запущен! Код: ${roomCode}`);
    } else {
      document.getElementById('hud-mc-room-tag').classList.add('hidden');
      showBannerNotification('3D Одиночный мир запущен!');
    }

    isGameRunning = true;
    updateHotbarUI();
  }

  function rebuildWorldMesh() {
    if (worldMesh) scene.remove(worldMesh);
    const geo = world.buildGeometry(atlas);
    worldMesh = new THREE.Mesh(geo, voxelMaterial);
    scene.add(worldMesh);
  }

  // --- 3D RAYCASTING (MINING & PLACING BLOCKS) ---
  const raycaster = new THREE.Raycaster();
  raycaster.far = 5.5;

  function updateRaycast() {
    if (!isGameRunning || !player || !player.isLocked) {
      wireBox.visible = false;
      return null;
    }

    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObject(worldMesh);

    if (intersects.length > 0) {
      const hit = intersects[0];
      // Target Voxel coords
      const targetPos = hit.point.clone().sub(hit.face.normal.clone().multiplyScalar(0.1));
      const tx = Math.floor(targetPos.x);
      const ty = Math.floor(targetPos.y);
      const tz = Math.floor(targetPos.z);

      // Place Voxel coords
      const placePos = hit.point.clone().add(hit.face.normal.clone().multiplyScalar(0.1));
      const px = Math.floor(placePos.x);
      const py = Math.floor(placePos.y);
      const pz = Math.floor(placePos.z);

      wireBox.position.set(tx + 0.5, ty + 0.5, tz + 0.5);
      wireBox.visible = true;

      return { tx, ty, tz, px, py, pz, normal: hit.face.normal };
    } else {
      wireBox.visible = false;
      return null;
    }
  }

  // Mouse Actions in 3D
  renderer.domElement.addEventListener('mousedown', (e) => {
    if (!isGameRunning || !player || !player.isLocked) return;
    const hit = updateRaycast();

    if (e.button === 0) {
      // Left Click: Mine Block
      player.swingProgress = 1.0;
      audio.playSwing();

      if (hit) {
        const b = world.getVoxel(hit.tx, hit.ty, hit.tz);
        if (b !== BLOCKS.AIR && b !== BLOCKS.BEDROCK) {
          world.setVoxel(hit.tx, hit.ty, hit.tz, BLOCKS.AIR);
          rebuildWorldMesh();
          audio.playDig('stone');
          droppedItems.push(new DroppedItem3D(b, hit.tx + 0.5, hit.ty + 0.5, hit.tz + 0.5, scene));
          network.broadcastBlock(hit.tx + hit.tz * 64, hit.ty, BLOCKS.AIR);
        }
      }
    } 
    else if (e.button === 2) {
      // Right Click: Place Block / Eat / Craft
      player.swingProgress = 1.0;
      const held = player.getHeldItem();

      if (hit && held && ITEM_DATA[held.id] && ITEM_DATA[held.id].isBlock) {
        // Prevent placing inside player
        const isInsidePlayer = (
          hit.px === Math.floor(player.pos.x) &&
          (hit.py === Math.floor(player.pos.y) || hit.py === Math.floor(player.pos.y + 1)) &&
          hit.pz === Math.floor(player.pos.z)
        );

        if (!isInsidePlayer) {
          world.setVoxel(hit.px, hit.py, hit.pz, held.id);
          rebuildWorldMesh();
          audio.playBlockPlace();
          network.broadcastBlock(hit.px + hit.pz * 64, hit.py, held.id);
          held.count--;
          if (held.count <= 0) player.inventory[player.selectedHotbarSlot] = null;
          updateHotbarUI();
        }
      }
    }
  });

  // --- REMOTE 3D PLAYERS ---
  function updateRemote3DPlayers(remotePlayers) {
    remotePlayers.forEach((rp, id) => {
      let mesh = remotePlayerMeshes.get(id);
      if (!mesh) {
        mesh = new THREE.Group();
        const mat = new THREE.MeshLambertMaterial({ color: rp.color || 0x00aaaa });
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.8, 0.4), mat);
        body.position.y = 0.9;
        mesh.add(body);
        scene.add(mesh);
        remotePlayerMeshes.set(id, mesh);
      }
      mesh.position.set(rp.x, rp.y, rp.z || 32);
    });
  }

  // --- PAUSE MENU ---
  const pauseModal = document.getElementById('modal-pause');
  function togglePauseMenu(force = null) {
    const isVis = force !== null ? force : !pauseModal.classList.contains('active');
    if (isVis) {
      document.exitPointerLock();
      pauseModal.classList.add('active');
    } else {
      pauseModal.classList.remove('active');
      renderer.domElement.requestPointerLock();
    }
  }

  document.getElementById('btn-resume-game').addEventListener('click', () => togglePauseMenu(false));
  document.getElementById('btn-pause-save').addEventListener('click', () => {
    saveManager.saveWorld(activeWorldId || 'world_default', activeWorldName, activeSeed, world, player, gameTime, 'overworld');
    showBannerNotification('Мир успешно сохранен!');
  });
  document.getElementById('btn-exit-to-menu').addEventListener('click', () => location.reload());

  // --- INVENTORY & CRAFTING ---
  const inventoryModal = document.getElementById('modal-inventory');
  function toggleInventoryModal() {
    const isVis = !inventoryModal.classList.contains('active');
    if (isVis) {
      document.exitPointerLock();
      renderInventoryGrid();
      renderCraftingList();
      inventoryModal.classList.add('active');
    } else {
      inventoryModal.classList.remove('active');
      renderer.domElement.requestPointerLock();
    }
  }

  function renderInventoryGrid() {
    const grid = document.getElementById('inventory-slots-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 36; i++) {
      const slot = document.createElement('div');
      slot.className = `inv-slot ${i === player.selectedHotbarSlot ? 'selected' : ''}`;
      const item = player.inventory[i];
      if (item) {
        const itemInfo = ITEM_DATA[item.id] || { name: 'Предмет' };
        slot.textContent = item.count > 1 ? item.count : '';
        slot.title = itemInfo.name;
      }
      grid.appendChild(slot);
    }
  }

  function renderCraftingList() {
    const list = document.getElementById('crafting-recipes-list');
    list.innerHTML = '';
    CRAFTING_RECIPES.forEach(r => {
      const info = ITEM_DATA[r.result] || { name: 'Предмет' };
      const row = document.createElement('div');
      row.className = 'craft-recipe-row available';
      row.innerHTML = `<div class="craft-res-name">${info.name} x${r.count}</div>`;
      row.addEventListener('click', () => {
        // Quick craft
        player.inventory[0] = { id: r.result, count: r.count };
        updateHotbarUI();
        audio.playPop();
      });
      list.appendChild(row);
    });
  }

  document.getElementById('btn-close-inv').addEventListener('click', () => toggleInventoryModal());

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
        const info = ITEM_DATA[item.id] || { name: 'Предмет' };
        slot.textContent = item.count > 1 ? item.count : '';
        slot.title = info.name;
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
  }

  function showBannerNotification(msg) {
    const b = document.getElementById('hud-notification');
    b.textContent = msg;
    b.classList.add('visible');
    setTimeout(() => b.classList.remove('visible'), 3000);
  }

  function addChatMessage(sender, text) {
    const feed = document.getElementById('hud-mc-chat-feed');
    const msg = document.createElement('div');
    msg.className = 'chat-msg';
    msg.innerHTML = `<span class="chat-sender">&lt;${sender}&gt;</span> ${text}`;
    feed.appendChild(msg);
    setTimeout(() => msg.remove(), 10000);
  }

  // --- 60 FPS 3D GAME LOOP ---
  const clock = new THREE.Clock();

  function loop() {
    requestAnimationFrame(loop);
    const delta = Math.min(clock.getDelta(), 0.08);

    if (isGameRunning && world && player) {
      gameTime += delta;

      // 1. Update Player Physics
      player.update(delta, world, keys, audio);

      // 2. 3D Raycasting
      updateRaycast();

      // 3. Update 3D Mobs
      mobs.forEach(mob => mob.update(delta, player, world, [], droppedItems, audio));

      // 4. Update Dropped Items
      droppedItems.forEach(item => item.update(delta, player, audio));

      // 5. Broadcast Position
      network.broadcastPlayer(player.pos.x, player.pos.y, player.yaw, player.getHeldItem() ? player.getHeldItem().id : 0, !player.isDead);

      updateStatusHUD();
    }

    renderer.render(scene, camera);
  }

  renderLocalWorldsList();
  loop();
});
