/**
 * 3D CITY SANDBOX // MASTER MULTIPLAYER GAME ENGINE (GTA STYLE)
 * High-Quality 3D Models, Drivable Sportcars & 4-Seater SUVs, Police Chases,
 * Weapons, and Real-Time Multiplayer.
 */

import { CityModelFactory } from "./city-models.js";
import { VehicleManager } from "./vehicle-physics.js";
import { PoliceSystem } from "./police-system.js";
import { CityPlayer } from "./player-city.js";
import { CityAudioEngine, WEAPONS } from "./weapons-combat.js";
import { MinecraftMultiplayerManager } from "./multiplayer-manager.js";
import { SaveManager } from "./storage-save.js";

// Global Singletons
let scene, camera, renderer, container;
let audio, vehicleManager, policeSystem, network, saveManager;
let player = null;
let isGameRunning = false;
let selectedColorHex = 0x00aaaa;

const remotePlayerMeshes = new Map();
const keys = {};

function setupLobbyUI() {
  saveManager = new SaveManager();
  network = new MinecraftMultiplayerManager();
  audio = new CityAudioEngine();

  const profile = saveManager.loadProfile() || { name: 'Стив', color: '#00aaaa' };
  const inputPlayerName = document.getElementById('mc-player-name');
  if (inputPlayerName) inputPlayerName.value = profile.name;

  const colorMap = {
    '#00aaaa': 0x00aaaa,
    '#55aa55': 0x55aa55,
    '#aa0000': 0xaa0000,
    '#8800aa': 0x8800aa,
    '#222222': 0x222222
  };
  selectedColorHex = colorMap[profile.color] || 0x00aaaa;

  // 1. Skin Dots Selection
  document.querySelectorAll('.mc-skin-dot').forEach(dot => {
    if (dot.dataset.color === profile.color) dot.classList.add('active');
    else dot.classList.remove('active');

    dot.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.mc-skin-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      selectedColorHex = colorMap[dot.dataset.color] || 0x00aaaa;
      saveManager.saveProfile((inputPlayerName ? inputPlayerName.value.trim() : 'Стив') || 'Стив', dot.dataset.color);
    });
  });

  // 2. Tabs
  const tabSingle = document.getElementById('tab-btn-single');
  const tabMulti = document.getElementById('tab-btn-multi');
  const viewSingle = document.getElementById('tab-view-single');
  const viewMulti = document.getElementById('tab-view-multi');

  if (tabSingle && tabMulti && viewSingle && viewMulti) {
    tabSingle.addEventListener('click', (e) => {
      e.preventDefault();
      tabSingle.classList.add('active');
      tabMulti.classList.remove('active');
      viewSingle.classList.remove('hidden');
      viewMulti.classList.add('hidden');
    });

    tabMulti.addEventListener('click', (e) => {
      e.preventDefault();
      tabMulti.classList.add('active');
      tabSingle.classList.remove('active');
      viewMulti.classList.remove('hidden');
      viewSingle.classList.add('hidden');
      refreshPublicServers();
    });
  }

  // 3. Create City World (Host)
  const btnCreateOnline = document.getElementById('btn-mc-create-online');
  if (btnCreateOnline) {
    btnCreateOnline.addEventListener('click', (e) => {
      e.preventDefault();
      const pName = (inputPlayerName ? inputPlayerName.value.trim() : 'Стив') || 'Стив';
      const nameInput = document.getElementById('mc-online-world-name');
      const worldName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : '3D Мегаполис';
      const roomId = 'GTA' + Math.floor(1000 + Math.random() * 9000);

      startCityWorld(roomId);
      network.createWorld(pName, '#00aaaa', worldName, true).catch(() => {});
    });
  }

  // 4. Join by Code (Friend)
  const btnJoinOnline = document.getElementById('btn-mc-join-online');
  if (btnJoinOnline) {
    btnJoinOnline.addEventListener('click', (e) => {
      e.preventDefault();
      const pName = (inputPlayerName ? inputPlayerName.value.trim() : 'Стив') || 'Стив';
      const codeInput = document.getElementById('mc-room-code');
      const code = codeInput ? codeInput.value.trim().toUpperCase() : '';
      if (!code) return alert('Введите код комнаты (например, GTA4829)!');

      startCityWorld(code);
      network.joinWorld(code, pName, '#00aaaa').catch(() => {});
    });
  }

  // 5. Singleplayer
  const btnCreateSingle = document.getElementById('btn-create-single-world');
  if (btnCreateSingle) {
    btnCreateSingle.addEventListener('click', (e) => {
      e.preventDefault();
      startCityWorld(null);
    });
  }

  const btnRefresh = document.getElementById('btn-refresh-servers');
  if (btnRefresh) btnRefresh.addEventListener('click', refreshPublicServers);
}

async function refreshPublicServers() {
  const list = document.getElementById('public-servers-list');
  if (!list || !network) return;
  list.innerHTML = '<div class="empty-list-msg">Поиск серверов...</div>';
  const worlds = await network.getPublicWorlds();
  list.innerHTML = '';

  if (worlds.length === 0) {
    list.innerHTML = '<div class="empty-list-msg">Сейчас нет открытых серверов. Создайте свой выше!</div>';
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

    row.querySelector('.join-btn').addEventListener('click', () => {
      const inputPlayerName = document.getElementById('mc-player-name');
      const pName = (inputPlayerName ? inputPlayerName.value.trim() : 'Стив') || 'Стив';
      startCityWorld(w.roomId);
      network.joinWorld(w.roomId, pName, '#00aaaa').catch(() => {});
    });

    list.appendChild(row);
  });
}

// ----------------------------------------------------------------------------
// START 3D CITY WORLD
// ----------------------------------------------------------------------------
function startCityWorld(roomCode) {
  audio.init();

  const screenLobby = document.getElementById('screen-mc-lobby');
  if (screenLobby) screenLobby.classList.add('hidden');
  const hud = document.getElementById('mc-hud');
  if (hud) hud.classList.remove('hidden');

  container = document.getElementById('game-container');
  if (!container) return;

  if (!renderer) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#78a7ff');
    scene.fog = new THREE.FogExp2('#78a7ff', 0.008);

    camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 400);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Sun & Atmosphere
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xfff5e6, 0.9);
    sun.position.set(100, 150, 80);
    scene.add(sun);

    // Build Open City Grid
    CityModelFactory.buildCity(scene);

    // Initialize Vehicle Manager
    vehicleManager = new VehicleManager(scene);

    // Spawn Park of Drivable Cars (NO CUBES!)
    spawnInitialVehicles();

    // Initialize Police System
    policeSystem = new PoliceSystem(scene, vehicleManager);

    setupCityInputs();
  }

  // Create Local Player
  const inputPlayerName = document.getElementById('mc-player-name');
  player = new CityPlayer(scene, camera, renderer.domElement, 0, 0, 0, selectedColorHex);
  player.name = (inputPlayerName ? inputPlayerName.value.trim() : 'Стив') || 'Стив';
  player.requestLock();

  if (roomCode) {
    const roomTag = document.getElementById('hud-mc-room-tag');
    if (roomTag) {
      roomTag.textContent = `СЕРВЕР: ${roomCode}`;
      roomTag.classList.remove('hidden');
    }

    network.listenToWorld(
      roomCode,
      null,
      (remotePlayers) => updateRemotePlayers(remotePlayers),
      (chat) => addChatMessage(chat.sender, chat.text),
      () => {
        alert('Сервер закрыт. Возврат в меню.');
        location.reload();
      }
    );
    showBannerNotification(`3D Мегаполис запущен! Код: ${roomCode}`);
  } else {
    const roomTag = document.getElementById('hud-mc-room-tag');
    if (roomTag) roomTag.classList.add('hidden');
    showBannerNotification('3D Мегаполис запущен!');
  }

  isGameRunning = true;
  updateWeaponHUD();
  loop();
}

function spawnInitialVehicles() {
  // 1. Red Supercar
  const sport1 = CityModelFactory.createSportCar(0xe61c24);
  vehicleManager.addVehicle('car_sport_1', sport1, -6, 0, 10, 0);

  // 2. Neon Cyan Supercar
  const sport2 = CityModelFactory.createSportCar(0x00f0ff);
  vehicleManager.addVehicle('car_sport_2', sport2, 6, 0, 10, 0);

  // 3. 4-Seater Squad SUV (Ride together with 3 friends!)
  const suv1 = CityModelFactory.createSUV(0x2b4f77);
  vehicleManager.addVehicle('car_suv_1', suv1, 0, 0, 24, Math.PI);

  // 4. Police Interceptor
  const cop1 = CityModelFactory.createPoliceCar();
  vehicleManager.addVehicle('car_police_1', cop1, -14, 0, 24, Math.PI / 2);
}

// ----------------------------------------------------------------------------
// INPUTS & COMBAT
// ----------------------------------------------------------------------------
function setupCityInputs() {
  window.addEventListener('keydown', (e) => {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    audio.init();
    keys[e.code] = true;

    // F / E Key: Enter / Exit Car
    if (e.code === 'KeyF' || e.code === 'KeyE') {
      if (player && vehicleManager) {
        vehicleManager.tryEnterVehicle(player, audio);
      }
    }

    // Weapons 1..4
    if (e.key >= '1' && e.key <= '4') {
      if (player) {
        player.activeWeaponIdx = parseInt(e.key) - 1;
        updateWeaponHUD();
      }
    }

    if (e.code === 'Escape') togglePauseMenu();
  });

  window.addEventListener('keyup', (e) => { keys[e.code] = false; });

  // Mouse Shooting
  renderer.domElement.addEventListener('mousedown', (e) => {
    if (!isGameRunning || !player || !player.isLocked) return;
    if (e.button === 0) {
      player.shoot(scene, audio, policeSystem, remotePlayerMeshes, network);
    }
  });

  // Pause Menu Buttons
  const btnResume = document.getElementById('btn-resume-game');
  if (btnResume) btnResume.addEventListener('click', () => togglePauseMenu(false));
  const btnExitMenu = document.getElementById('btn-exit-to-menu');
  if (btnExitMenu) btnExitMenu.addEventListener('click', () => location.reload());
}

function updateRemotePlayers(remotePlayers) {
  remotePlayers.forEach((rp, id) => {
    let mesh = remotePlayerMeshes.get(id);
    if (!mesh) {
      mesh = CityModelFactory.createCharacter(rp.color ? parseInt(rp.color.replace('#', '0x')) : 0x00aaaa);
      scene.add(mesh);
      remotePlayerMeshes.set(id, mesh);
    }
    mesh.position.set(rp.x, rp.y || 0, rp.z || 0);
    mesh.rotation.y = rp.facing || 0;
  });
}

// Pause Menu
const pauseModal = document.getElementById('modal-pause');
function togglePauseMenu(force = null) {
  if (!pauseModal) return;
  const isVis = force !== null ? force : !pauseModal.classList.contains('active');
  if (isVis) {
    document.exitPointerLock();
    pauseModal.classList.add('active');
  } else {
    pauseModal.classList.remove('active');
    if (player) player.requestLock();
  }
}

function updateWeaponHUD() {
  if (!player) return;
  const wep = player.getActiveWeapon();
  const wepEl = document.getElementById('hud-active-weapon');
  if (wepEl) wepEl.textContent = `🔫 ${wep.name}`;
}

function updateStatusHUD() {
  if (!player) return;
  const hp = document.getElementById('hud-hp-bar');
  if (hp) hp.style.width = `${Math.max(0, player.health)}%`;
  const ap = document.getElementById('hud-ap-bar');
  if (ap) ap.style.width = `${Math.max(0, player.armor)}%`;
  const money = document.getElementById('hud-money');
  if (money) money.textContent = `$${player.money}`;

  // Speedometer
  const speedo = document.getElementById('hud-speedometer');
  if (speedo && vehicleManager) {
    if (vehicleManager.activeVehicle) {
      speedo.classList.remove('hidden');
      const kmh = Math.round(Math.abs(vehicleManager.activeVehicle.speed) * 3.6);
      speedo.textContent = `${kmh} КМ/Ч`;
    } else {
      speedo.classList.add('hidden');
    }
  }
}

function showBannerNotification(msg) {
  const b = document.getElementById('hud-notification');
  if (!b) return;
  b.textContent = msg;
  b.classList.add('visible');
  setTimeout(() => b.classList.remove('visible'), 3000);
}

function addChatMessage(sender, text) {
  const feed = document.getElementById('hud-mc-chat-feed');
  if (!feed) return;
  const msg = document.createElement('div');
  msg.className = 'chat-msg';
  msg.innerHTML = `<span class="chat-sender">&lt;${sender}&gt;</span> ${text}`;
  feed.appendChild(msg);
  setTimeout(() => msg.remove(), 10000);
}

// ----------------------------------------------------------------------------
// 60 FPS MAIN LOOP
// ----------------------------------------------------------------------------
const clock = new THREE.Clock();

function loop() {
  if (!isGameRunning) return;
  requestAnimationFrame(loop);
  const delta = Math.min(clock.getDelta(), 0.08);

  if (player) {
    // 1. Update Player Movement
    player.update(delta, keys);

    // 2. Update Vehicles & Passengers
    if (vehicleManager) {
      vehicleManager.update(delta, keys, camera, player, audio);
    }

    // 3. Update Police AI Chases & Stars
    if (policeSystem) {
      policeSystem.update(delta, player, audio);
    }

    // 4. Broadcast Player Position & Vehicle State
    if (network) {
      network.broadcastPlayer(player.pos.x, player.pos.y, player.yaw, player.activeWeaponIdx, !player.isDead);
    }

    updateStatusHUD();
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

setupLobbyUI();
