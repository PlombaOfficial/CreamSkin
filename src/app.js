/**
 * THE BACKROOMS MULTIPLAYER // MAIN APPLICATION COORDINATOR
 * Ties together Three.js WebGL, Firestore Realtime Networking,
 * Audio Engine, AI Entities, Level Transitions, and VHS Horror UI.
 */

import { BackroomsTextures } from "./textures.js";
import { BackroomsAudioEngine } from "./audio-engine.js";
import { BackroomsWorld } from "./backrooms-world.js";
import { BackroomsEntity } from "./entity-ai.js";
import { PlayerController } from "./player-controller.js";
import { MultiplayerManager } from "./multiplayer-manager.js";

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');

  // 1. Audio Engine
  const audio = new BackroomsAudioEngine();
  window.bcAudio = audio;

  // 2. Three.js Core Setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050504);
  scene.fog = new THREE.FogExp2(0x0a0907, 0.08); // Dense atmospheric Backrooms fog

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // 3. Textures, World, Entity & Controller
  const textures = new BackroomsTextures();
  const world = new BackroomsWorld(scene, textures);
  const player = new PlayerController(camera, scene, world);
  const smiler = new BackroomsEntity(scene, world, 'smiler');
  const network = new MultiplayerManager(scene);

  window.world = world;
  window.player = player;
  window.network = network;

  // 4. UI Elements
  const screenLobby = document.getElementById('screen-lobby');
  const hudGame = document.getElementById('hud-game');
  const inputPlayerName = document.getElementById('input-player-name');
  const inputRoomCode = document.getElementById('input-room-code');
  const btnCreateRoom = document.getElementById('btn-create-room');
  const btnJoinRoom = document.getElementById('btn-join-room');
  const roomCodeDisplay = document.getElementById('hud-room-code');
  const levelTitleDisplay = document.getElementById('hud-level-title');

  // HUD Meters
  const fillBattery = document.getElementById('fill-battery');
  const fillSanity = document.getElementById('fill-sanity');
  const fillStamina = document.getElementById('fill-stamina');
  const countWater = document.getElementById('count-water');
  const countBatteries = document.getElementById('count-batteries');
  const notifBox = document.getElementById('game-notification');
  const modalJumpscare = document.getElementById('modal-jumpscare');

  // Chat Elements
  const chatBox = document.getElementById('chat-messages');
  const chatInputContainer = document.getElementById('chat-input-container');
  const chatInput = document.getElementById('chat-input');

  // Notification Helper
  window.showGameNotification = (text) => {
    if (!notifBox) return;
    notifBox.textContent = text;
    notifBox.classList.add('visible');
    setTimeout(() => notifBox.classList.remove('visible'), 2500);
  };

  // Inventory UI Updater
  window.updateInventoryUI = (inv) => {
    if (countWater) countWater.textContent = inv.almondWater;
    if (countBatteries) countBatteries.textContent = inv.batteries;
  };
  window.updateInventoryUI(player.inventory);

  // Chat Message Receiver
  window.onChatMessageReceived = (msg) => {
    if (!chatBox) return;
    const line = document.createElement('div');
    line.className = 'chat-line';
    line.innerHTML = `<span class="chat-sender">${msg.sender}:</span> <span class="chat-text">${msg.text}</span>`;
    chatBox.appendChild(line);
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  // Level Names
  const levelNames = [
    'УРОВЕНЬ 0: «THE LOBBY»',
    'УРОВЕНЬ 1: «HABITABLE ZONE»',
    'УРОВЕНЬ 2: «PIPE DREAMS»'
  ];

  // 5. Lobby Event Listeners
  btnCreateRoom.addEventListener('click', async () => {
    const name = inputPlayerName.value.trim() || 'Оператор';
    try {
      btnCreateRoom.disabled = true;
      btnCreateRoom.textContent = 'Создание...';
      const code = await network.createRoom(name);
      startGameSession(code);
    } catch (err) {
      alert('Ошибка подключения: ' + err.message);
      btnCreateRoom.disabled = false;
      btnCreateRoom.textContent = 'СОЗДАТЬ КОМНАТУ';
    }
  });

  btnJoinRoom.addEventListener('click', async () => {
    const name = inputPlayerName.value.trim() || 'Оператор';
    const code = inputRoomCode.value.trim();
    if (!code) {
      alert('Введите 6-значный код комнаты (например, BCK-409)!');
      return;
    }
    try {
      btnJoinRoom.disabled = true;
      btnJoinRoom.textContent = 'Подключение...';
      const joinedCode = await network.joinRoom(code, name);
      startGameSession(joinedCode);
    } catch (err) {
      alert('Ошибка входа: ' + err.message);
      btnJoinRoom.disabled = false;
      btnJoinRoom.textContent = 'ВОЙТИ ПО КОДУ';
    }
  });

  function startGameSession(code) {
    screenLobby.classList.add('hidden');
    hudGame.classList.remove('hidden');
    roomCodeDisplay.textContent = code;
    levelTitleDisplay.textContent = levelNames[world.currentLevel];
    audio.init();
    canvas.requestPointerLock();
  }

  // Elevator Progression
  window.onElevatorReached = (nextLvl) => {
    if (nextLvl >= 3) {
      window.showGameNotification('ВЫ ВЫБРАЛИСЬ ИЗ ЗАКУЛИСЬЯ! ПОБЕДА!');
      return;
    }
    audio.playElevatorChime();
    world.buildLevel(nextLvl);
    player.position.set(6, 1.6, 6);
    levelTitleDisplay.textContent = levelNames[nextLvl];
    window.showGameNotification(`ЛИФТ ПРИБЫЛ: ${levelNames[nextLvl]}`);
  };

  // 6. In-Game Chat Handling
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyT' || e.code === 'Enter') {
      if (document.activeElement !== chatInput && player.isLocked) {
        document.exitPointerLock();
        chatInputContainer.classList.remove('hidden');
        chatInput.focus();
        e.preventDefault();
      } else if (document.activeElement === chatInput && e.code === 'Enter') {
        const text = chatInput.value.trim();
        if (text) {
          network.sendChatMessage(text);
          chatInput.value = '';
        }
        chatInputContainer.classList.add('hidden');
        canvas.requestPointerLock();
      }
    }
  });

  // Jumpscare Death Handler
  function triggerJumpscare() {
    if (modalJumpscare.classList.contains('active')) return;
    modalJumpscare.classList.add('active');
    audio.playSmilerRoar();
    document.exitPointerLock();
  }

  document.getElementById('btn-respawn').addEventListener('click', () => {
    modalJumpscare.classList.remove('active');
    player.sanity = 100;
    player.battery = 100;
    player.position.set(6, 1.6, 6);
    canvas.requestPointerLock();
  });

  // 7. Main Game Loop (60 FPS)
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.08);

    if (!screenLobby.classList.contains('hidden')) {
      // Rotate camera in background preview when in menu
      camera.rotation.y += delta * 0.1;
      renderer.render(scene, camera);
      return;
    }

    // Update Player Controller
    player.update(delta);

    // Update Monster AI
    smiler.update(delta, player.position, player.isFlashlightOn, (damage) => {
      player.sanity = Math.max(0, player.sanity - damage);
      if (player.sanity <= 0) triggerJumpscare();
    });

    // Update World & Network Replication
    world.update(delta);
    network.update(delta);

    // Broadcast Coordinates to Firestore
    network.broadcastPlayerState(
      player.position,
      player.euler.y,
      player.euler.x,
      player.isFlashlightOn,
      player.sanity
    );

    // Update HUD Meters
    if (fillBattery) fillBattery.style.width = `${player.battery}%`;
    if (fillSanity) fillSanity.style.width = `${player.sanity}%`;
    if (fillStamina) fillStamina.style.width = `${player.stamina}%`;

    // Render Scene
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
});
