/**
 * CYBER-MAKER // MASTER GAME & LEVEL EDITOR CONTROLLER
 * Seamlessly integrates:
 * 1. Precision Physics Player & Ghost Replays.
 * 2. Pro-Grade Level Editor with Undo/Redo & Playtesting.
 * 3. Social Community Hub with Levels, Comments, Likes & Search.
 * 4. Music Audio Synthesizer & Customization.
 */

import { PhysicsPlayer } from "./physics-player.js";
import { LevelEditorEngine } from "./level-editor.js";
import { CommunityHubEngine } from "./community-hub.js";
import { MusicAudioEngine } from "./music-audio.js";
import { PlayerProfileEngine } from "./player-profile.js";

// Core Instances
let player, editor, community, audio, profile;
let canvas, ctx;
let activeMode = 'community'; // 'play', 'editor', 'community', 'profile'
let activeLevel = null;

// Camera & Timing
let cameraX = 0;
let cameraY = 0;
let lastTime = 0;
let screenShake = 0;

// Input Handling
const keys = {
  left: false,
  right: false,
  jump: false,
  jumpPressed: false,
  dashPressed: false
};

// Editor Mouse State
let isMouseDown = false;
let mouseX = 0;
let mouseY = 0;
let editorCameraX = 0;
let editorCameraY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;

function init() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');

  audio = new MusicAudioEngine();
  player = new PhysicsPlayer(audio);
  editor = new LevelEditorEngine();
  community = new CommunityHubEngine();
  profile = new PlayerProfileEngine();

  // Apply customization
  player.skinColor = profile.skinColor;
  player.secondaryColor = profile.secondaryColor;

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  setupInputListeners();
  setupUIButtons();
  setupEditorPalette();
  setupCommunityView();
  setupCustomizationView();

  // Load first featured level
  loadLevelForPlay(community.levels[0]);

  // Start Game Loop
  requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
  const container = document.getElementById('canvas-container');
  if (container) {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }
}

// ----------------------------------------------------------------------------
// 1. INPUT HANDLING
// ----------------------------------------------------------------------------
function setupInputListeners() {
  window.addEventListener('keydown', (e) => {
    // Start Audio Context on first interaction
    if (!audio.isPlayingMusic && !audio.isMuted) {
      audio.startMusic();
    }

    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = true;

    if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
      if (!keys.jump) keys.jumpPressed = true;
      keys.jump = true;
    }

    if (e.code === 'ShiftLeft' || e.code === 'KeyJ' || e.code === 'KeyK') {
      keys.dashPressed = true;
    }

    // Toggle Playtest in Editor mode (Tab or Enter)
    if (activeMode === 'editor' && (e.code === 'Tab' || e.code === 'Enter')) {
      e.preventDefault();
      toggleEditorPlaytest();
    }

    // Undo / Redo in Editor
    if (activeMode === 'editor') {
      if (e.ctrlKey && e.code === 'KeyZ') { e.preventDefault(); editor.undo(); }
      if (e.ctrlKey && e.code === 'KeyY') { e.preventDefault(); editor.redo(); }
      if (e.code === 'Delete' || e.code === 'Backspace') { e.preventDefault(); editor.deleteSelected(); }
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') keys.jump = false;
  });

  // Canvas Mouse Events for Editor
  canvas.addEventListener('mousedown', (e) => {
    if (activeMode !== 'editor') return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (e.button === 0) { // Left Click -> Place object
      isMouseDown = true;
      const worldX = mx + editorCameraX;
      const worldY = my + editorCameraY;
      editor.addObjectAt(worldX, worldY);
    } else if (e.button === 1 || e.button === 2) { // Right or Middle click -> Pan
      e.preventDefault();
      isPanning = true;
      panStartX = e.clientX;
      panStartY = e.clientY;
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (isPanning && activeMode === 'editor') {
      const dx = e.clientX - panStartX;
      const dy = e.clientY - panStartY;
      editorCameraX -= dx;
      editorCameraY -= dy;
      panStartX = e.clientX;
      panStartY = e.clientY;
    }
  });

  window.addEventListener('mouseup', () => {
    isMouseDown = false;
    isPanning = false;
  });

  canvas.addEventListener('contextmenu', e => e.preventDefault());
}

// ----------------------------------------------------------------------------
// 2. NAVIGATION & UI BUTTONS
// ----------------------------------------------------------------------------
function setupUIButtons() {
  document.querySelectorAll('.app-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.app-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetMode = btn.dataset.mode;
      switchMode(targetMode);
    });
  });

  // Sound Toggle
  const btnSound = document.getElementById('btn-sound-toggle');
  if (btnSound) {
    btnSound.addEventListener('click', () => {
      const isMuted = audio.toggleMute();
      btnSound.textContent = isMuted ? '🔇 ЗВУК: ВЫКЛ' : '🔊 ЗВУК: ВКЛ';
    });
  }

  // Playtest Toggle Button
  const btnTest = document.getElementById('btn-editor-playtest');
  if (btnTest) {
    btnTest.addEventListener('click', () => toggleEditorPlaytest());
  }

  // Editor Publish Button
  const btnPublish = document.getElementById('btn-editor-publish');
  if (btnPublish) {
    btnPublish.addEventListener('click', () => {
      if (!editor.level.isVerified) {
        alert('⚠️ Для публикации уровня вы должны сначала полностью пройти его от 0% до 100% в режиме тестирования (кнопка ТЕСТ)!');
        return;
      }
      const title = prompt('Введите название для Community:', editor.level.title);
      if (title && title.trim()) {
        editor.level.title = title.trim();
        const pub = community.publishLevel(editor.level, profile.name);
        alert(`🎉 Уровень "${pub.title}" успешно опубликован в Community!`);
        switchMode('community');
        renderCommunityLevels();
      }
    });
  }
}

function switchMode(mode) {
  activeMode = mode;

  // Toggle View Panels
  document.getElementById('panel-editor-tools').classList.toggle('hidden', mode !== 'editor');
  document.getElementById('panel-community').classList.toggle('hidden', mode !== 'community');
  document.getElementById('panel-customization').classList.toggle('hidden', mode !== 'profile');
  document.getElementById('play-hud-overlay').classList.toggle('hidden', mode !== 'play');

  if (mode === 'play') {
    player.reset(100, 300, true);
  } else if (mode === 'community') {
    renderCommunityLevels();
  }
}

function toggleEditorPlaytest() {
  if (activeMode === 'editor') {
    activeLevel = editor.level;
    activeMode = 'play';
    document.getElementById('panel-editor-tools').classList.add('hidden');
    document.getElementById('play-hud-overlay').classList.remove('hidden');
    player.reset(100, 300, true);
  } else if (activeMode === 'play') {
    activeMode = 'editor';
    document.getElementById('panel-editor-tools').classList.remove('hidden');
    document.getElementById('play-hud-overlay').classList.add('hidden');
  }
}

// ----------------------------------------------------------------------------
// 3. EDITOR PALETTE
// ----------------------------------------------------------------------------
function setupEditorPalette() {
  document.querySelectorAll('.palette-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      editor.selectedTool = btn.dataset.type;
    });
  });

  const btnUndo = document.getElementById('btn-editor-undo');
  if (btnUndo) btnUndo.addEventListener('click', () => editor.undo());

  const btnRedo = document.getElementById('btn-editor-redo');
  if (btnRedo) btnRedo.addEventListener('click', () => editor.redo());

  const btnClear = document.getElementById('btn-editor-clear');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (confirm('Очистить все объекты на уровне?')) {
        editor.pushHistoryState();
        editor.level.objects = [];
      }
    });
  }
}

// ----------------------------------------------------------------------------
// 4. COMMUNITY LEVEL HUB
// ----------------------------------------------------------------------------
function setupCommunityView() {
  document.querySelectorAll('.community-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.community-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCommunityLevels(btn.dataset.filter);
    });
  });

  const searchInput = document.getElementById('community-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderCommunityLevels('featured', searchInput.value);
    });
  }
}

function renderCommunityLevels(filter = 'featured', query = '') {
  const container = document.getElementById('community-levels-grid');
  if (!container) return;
  container.innerHTML = '';

  const list = community.getLevels(filter, query);
  list.forEach(lvl => {
    const card = document.createElement('div');
    card.className = 'community-level-card';
    card.innerHTML = `
      <div class="lvl-card-head">
        <div class="lvl-title">${lvl.title}</div>
        <span class="diff-badge ${lvl.difficulty.toLowerCase()}">${lvl.difficulty}</span>
      </div>
      <div class="lvl-author">Автор: <b>${lvl.author}</b></div>
      <div class="lvl-stats-row">
        <span>❤️ ${lvl.likes}</span>
        <span>👥 ${lvl.plays} игр</span>
        <span>🏆 ${lvl.passRate}% pass</span>
      </div>
      <div class="lvl-actions-row">
        <button class="btn-play-level">▶ ИГРАТЬ</button>
        <button class="btn-like-level">❤️ LIKE</button>
      </div>
    `;

    card.querySelector('.btn-play-level').addEventListener('click', () => {
      loadLevelForPlay(lvl);
      document.querySelector('[data-mode="play"]').click();
    });

    card.querySelector('.btn-like-level').addEventListener('click', (e) => {
      e.stopPropagation();
      const count = community.likeLevel(lvl.id);
      renderCommunityLevels(filter, query);
    });

    container.appendChild(card);
  });
}

function loadLevelForPlay(lvl) {
  activeLevel = lvl;
  document.getElementById('play-hud-title').textContent = lvl.title;
  document.getElementById('play-hud-author').textContent = `Автор: ${lvl.author}`;
  player.reset(100, 300, true);
}

// ----------------------------------------------------------------------------
// 5. CUSTOMIZATION & PROFILE VIEW
// ----------------------------------------------------------------------------
function setupCustomizationView() {
  document.querySelectorAll('.color-pick-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      const col = btn.dataset.color;
      profile.skinColor = col;
      player.skinColor = col;
      profile.saveProfile();
      renderProfileStats();
    });
  });

  const btnChangeName = document.getElementById('btn-profile-change-name');
  if (btnChangeName) {
    btnChangeName.addEventListener('click', () => {
      const n = prompt('Введите ваш никнейм:', profile.name);
      if (n && n.trim()) {
        profile.name = n.trim();
        profile.saveProfile();
        renderProfileStats();
      }
    });
  }
}

function renderProfileStats() {
  document.getElementById('prof-stat-name').textContent = profile.name;
  document.getElementById('prof-stat-stars').textContent = `⭐ ${profile.stars}`;
  document.getElementById('prof-stat-demons').textContent = `💀 ${profile.demonsBeaten}`;
  document.getElementById('prof-stat-completed').textContent = profile.levelsCompleted;
  document.getElementById('prof-stat-attempts').textContent = profile.totalAttempts;
}

// ----------------------------------------------------------------------------
// 6. MASTER GAME LOOP (60-120 FPS)
// ----------------------------------------------------------------------------
function gameLoop(time) {
  const delta = Math.min((time - lastTime) / 1000, 0.1);
  lastTime = time;

  if (activeMode === 'play' && activeLevel) {
    // 1. Update Physics
    const inputState = {
      moveX: (keys.right ? 1 : 0) - (keys.left ? 1 : 0),
      jumpPressed: keys.jumpPressed,
      jumpHold: keys.jump,
      dashPressed: keys.dashPressed
    };

    player.update(delta, inputState, activeLevel, activeLevel.length || 3000);

    // If player completed level
    if (player.hasWon) {
      if (editor.level && activeLevel.id === editor.level.id) {
        editor.level.isVerified = true;
        const btnPub = document.getElementById('btn-editor-publish');
        if (btnPub) btnPub.classList.add('verified-glow');
      }
      community.recordAttempt(activeLevel.id, true);
      profile.recordLevelWin(activeLevel.difficulty);
    }

    // Smooth Camera Follow
    cameraX += (player.x - canvas.width * 0.35 - cameraX) * 12.0 * delta;
    cameraY += (player.y - canvas.height * 0.5 - cameraY) * 8.0 * delta;

    // Update Play HUD
    document.getElementById('play-hud-percent').textContent = `${player.currentPercent}%`;
    document.getElementById('play-hud-attempts').textContent = `Попытка ${player.attempts}`;
    document.getElementById('play-progress-bar-fill').style.width = `${player.currentPercent}%`;

    // 2. Render Play View
    ctx.fillStyle = activeLevel.bgColor || '#080c14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Parallax Background Grid
    drawBackgroundStars(ctx, cameraX);

    // Draw Level Objects
    drawLevelObjects(ctx, activeLevel, cameraX, cameraY);

    // Draw Player
    player.draw(ctx, cameraX, cameraY);

  } else if (activeMode === 'editor') {
    // Render Editor View
    editor.draw(ctx, editorCameraX, editorCameraY, canvas.width, canvas.height);
  }

  // Reset One-shot Input Flags
  keys.jumpPressed = false;
  keys.dashPressed = false;

  requestAnimationFrame(gameLoop);
}

function drawBackgroundStars(ctx, camX) {
  ctx.fillStyle = '#101a2e';
  for (let i = 0; i < 40; i++) {
    const x = ((i * 120 - camX * 0.2) % canvas.width + canvas.width) % canvas.width;
    const y = (i * 37) % canvas.height;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawLevelObjects(ctx, lvl, camX, camY) {
  lvl.objects.forEach(obj => {
    const rx = obj.x - camX;
    const ry = obj.y - camY;

    if (rx + obj.w < 0 || rx > canvas.width || ry + obj.h < 0 || ry > canvas.height) return;

    ctx.save();
    if (obj.type === 'solid') {
      ctx.fillStyle = obj.color || '#162b4d';
      ctx.fillRect(rx, ry, obj.w, obj.h);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(rx, ry, obj.w, obj.h);
    } else if (obj.type === 'hazard') {
      ctx.fillStyle = obj.color || '#ff0055';
      ctx.beginPath();
      ctx.moveTo(rx, ry + obj.h);
      ctx.lineTo(rx + obj.w / 2, ry);
      ctx.lineTo(rx + obj.w, ry + obj.h);
      ctx.closePath();
      ctx.fill();
    } else if (obj.type === 'saw') {
      ctx.fillStyle = '#ff3366';
      ctx.beginPath();
      ctx.arc(rx + obj.w / 2, ry + obj.h / 2, obj.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (obj.type === 'jump_ring') {
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(rx + obj.w / 2, ry + obj.h / 2, obj.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (obj.type === 'portal_gravity') {
      ctx.fillStyle = obj.val === -1 ? 'rgba(0, 240, 255, 0.3)' : 'rgba(255, 0, 119, 0.3)';
      ctx.fillRect(rx, ry, obj.w, obj.h);
      ctx.strokeStyle = obj.val === -1 ? '#00f0ff' : '#ff0077';
      ctx.lineWidth = 3;
      ctx.strokeRect(rx, ry, obj.w, obj.h);
    } else if (obj.type === 'speed_boost') {
      ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.fillRect(rx, ry, obj.w, obj.h);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.strokeRect(rx, ry, obj.w, obj.h);
    } else if (obj.type === 'finish') {
      ctx.fillStyle = 'rgba(0, 255, 136, 0.4)';
      ctx.fillRect(rx, ry, obj.w, obj.h);
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 4;
      ctx.strokeRect(rx, ry, obj.w, obj.h);
    }
    ctx.restore();
  });
}

window.addEventListener('DOMContentLoaded', init);
