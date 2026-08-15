/**
 * AMONG US // CYBER STATION PRIMARY GAME ENGINE (WITH FULL CHAT)
 * Coordinates Canvas 2D rendering, Player Movement, Impostor Kills/Vents,
 * Tasks, Bot AI, Emergency Meetings with Live Chat, and Speech Bubbles.
 */

import { STATION_MAP } from "./station-map.js";
import { AmongUsAudioEngine } from "./audio-engine.js";
import { BotManager } from "./bot-ai.js";
import { TaskManager } from "./tasks.js";

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // 1. Audio, Bot, and Task Engines
  const audio = new AmongUsAudioEngine();
  const taskManager = new TaskManager(audio);
  const botManager = new BotManager(STATION_MAP, audio);

  // 2. Player State
  const player = {
    x: 1225,
    y: 460,
    radius: 24,
    speed: 4.8,
    color: '#c51111',
    name: 'Вы (Красный)',
    isImpostor: false,
    isAlive: true,
    inVent: false,
    currentVentIdx: 0,
    killCooldown: 10.0,
    completedTasks: 0,
    totalTasks: 4,
    speechBubble: null,
    speechTimer: 0
  };

  // Game Status
  let gameState = 'ROLE_INTRO';
  let meetingTimer = 30;
  let meetingInterval = null;
  let votes = {};
  let hasPlayerVoted = false;

  // Keyboard State
  const keys = { w: false, a: false, s: false, d: false };

  window.addEventListener('keydown', (e) => {
    // If typing in chat, don't trigger game hotkeys
    if (document.activeElement.tagName === 'INPUT') return;

    if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.w = true;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.a = true;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.s = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.d = true;

    if (e.code === 'KeyE') handleUseOrVent();
    if (e.code === 'KeyQ') handleKill();
    if (e.code === 'KeyR') handleReport();
    if (e.code === 'KeyT') openHudChat();
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.w = false;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.a = false;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.s = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.d = false;
  });

  // UI Buttons
  const btnUse = document.getElementById('btn-action-use');
  const btnKill = document.getElementById('btn-action-kill');
  const btnVent = document.getElementById('btn-action-vent');
  const btnReport = document.getElementById('btn-action-report');

  btnUse.addEventListener('click', handleUseOrVent);
  btnKill.addEventListener('click', handleKill);
  btnVent.addEventListener('click', handleVentToggle);
  btnReport.addEventListener('click', handleReport);

  // Role Selection
  document.getElementById('btn-select-crew').addEventListener('click', () => startGame(false));
  document.getElementById('btn-select-impostor').addEventListener('click', () => startGame(true));

  function startGame(asImpostor) {
    audio.init();
    player.isImpostor = asImpostor;
    player.isAlive = true;
    player.x = 1225;
    player.y = 460;
    player.inVent = false;
    player.killCooldown = 12.0;

    botManager.initBots(7);
    if (!asImpostor) {
      const impBot = botManager.bots[Math.floor(Math.random() * botManager.bots.length)];
      impBot.isImpostor = true;
    }

    document.getElementById('screen-role-select').classList.add('hidden');
    const introModal = document.getElementById('modal-role-intro');
    const roleText = document.getElementById('intro-role-name');
    const roleDesc = document.getElementById('intro-role-desc');

    if (asImpostor) {
      roleText.textContent = 'ПРЕДАТЕЛЬ (IMPOSTOR)';
      roleText.style.color = '#ff3333';
      roleDesc.textContent = 'Устраняйте членов экипажа, используйте вентиляцию и не дайте завершить задания!';
      btnKill.classList.remove('hidden');
      btnVent.classList.remove('hidden');
    } else {
      roleText.textContent = 'ЧЛЕН ЭКИПАЖА (CREWMATE)';
      roleText.style.color = '#00f0ff';
      roleDesc.textContent = 'Выполняйте задания на станции и вычислите предателя на собрании!';
      btnKill.classList.add('hidden');
      btnVent.classList.add('hidden');
    }

    introModal.classList.add('active');
    setTimeout(() => {
      introModal.classList.remove('active');
      gameState = 'PLAYING';
    }, 2800);
  }

  // --- ACTIONS ---

  function handleUseOrVent() {
    if (gameState !== 'PLAYING' || !player.isAlive) return;

    const distToTable = Math.hypot(player.x - STATION_MAP.emergencyTable.x, player.y - STATION_MAP.emergencyTable.y);
    if (distToTable < 70) {
      startEmergencyMeeting('emergency', { name: player.name });
      return;
    }

    for (let i = 0; i < STATION_MAP.tasks.length; i++) {
      const t = STATION_MAP.tasks[i];
      if (Math.hypot(player.x - t.x, player.y - t.y) < 60) {
        taskManager.openTask(t, () => {
          player.completedTasks++;
          updateTaskProgress();
        });
        return;
      }
    }
  }

  function handleKill() {
    if (gameState !== 'PLAYING' || !player.isImpostor || player.killCooldown > 0 || !player.isAlive) return;

    let nearestBot = null;
    let minDist = 80;

    botManager.bots.forEach(bot => {
      if (bot.isAlive) {
        const dist = Math.hypot(player.x - bot.x, player.y - bot.y);
        if (dist < minDist) {
          minDist = dist;
          nearestBot = bot;
        }
      }
    });

    if (nearestBot) {
      nearestBot.isAlive = false;
      player.killCooldown = 22.0;
      botManager.deadBodies.push({
        x: nearestBot.x,
        y: nearestBot.y,
        color: nearestBot.color,
        name: nearestBot.name,
        reported: false
      });
      audio.playKill();
      checkWinCondition();
    }
  }

  function handleVentToggle() {
    if (gameState !== 'PLAYING' || !player.isImpostor || !player.isAlive) return;

    if (!player.inVent) {
      let nearestVentIdx = -1;
      let minDist = 70;
      STATION_MAP.vents.forEach((v, idx) => {
        const dist = Math.hypot(player.x - v.x, player.y - v.y);
        if (dist < minDist) {
          minDist = dist;
          nearestVentIdx = idx;
        }
      });

      if (nearestVentIdx !== -1) {
        player.inVent = true;
        player.currentVentIdx = nearestVentIdx;
        const v = STATION_MAP.vents[nearestVentIdx];
        player.x = v.x;
        player.y = v.y;
        audio.playVent();
      }
    } else {
      const curVent = STATION_MAP.vents[player.currentVentIdx];
      const nextVentId = curVent.connectsTo[0];
      const nextVentIdx = STATION_MAP.vents.findIndex(v => v.id === nextVentId);

      if (nextVentIdx !== -1) {
        player.currentVentIdx = nextVentIdx;
        const nv = STATION_MAP.vents[nextVentIdx];
        player.x = nv.x;
        player.y = nv.y;
      }
      player.inVent = false;
      audio.playVent();
    }
  }

  function handleReport() {
    if (gameState !== 'PLAYING' || !player.isAlive) return;

    for (let i = 0; i < botManager.deadBodies.length; i++) {
      const body = botManager.deadBodies[i];
      if (!body.reported && Math.hypot(player.x - body.x, player.y - body.y) < 90) {
        body.reported = true;
        startEmergencyMeeting('body', { name: player.name }, body);
        return;
      }
    }
  }

  // --- EMERGENCY MEETING, LIVE CHAT & VOTING ---

  const chatContainer = document.getElementById('meeting-chat-list');
  const chatInput = document.getElementById('meeting-chat-input');
  const btnSendChat = document.getElementById('btn-send-meeting-chat');

  function startEmergencyMeeting(type, reporter, bodyInfo) {
    if (gameState === 'MEETING') return;
    gameState = 'MEETING';
    hasPlayerVoted = false;
    votes = {};

    if (type === 'body') audio.playReport();
    else audio.playEmergency();

    const meetingModal = document.getElementById('modal-meeting');
    const meetingTitle = document.getElementById('meeting-title');
    const voteGrid = document.getElementById('voting-grid');

    meetingTitle.textContent = type === 'body' 
      ? `НАЙДЕНО ТЕЛО: ${bodyInfo.name}!` 
      : `СРОЧНОЕ СОБРАНИЕ (${reporter.name})`;
    
    meetingModal.classList.add('active');

    // 1. Initial Bot Discussion
    chatContainer.innerHTML = '';
    const discussions = botManager.generateDiscussion(reporter, bodyInfo);
    discussions.forEach(d => addMeetingChatMessage(d.sender, d.text));

    // 2. Build Voting Cards
    voteGrid.innerHTML = '';
    buildVoteCard(voteGrid, 'player', player.name, player.color, player.isAlive);
    botManager.bots.forEach(bot => {
      buildVoteCard(voteGrid, bot.id, bot.name, bot.color, bot.isAlive);
    });

    const skipBtn = document.createElement('button');
    skipBtn.className = 'btn-skip-vote';
    skipBtn.textContent = 'ПРОПУСТИТЬ ГОЛОСОВАНИЕ (SKIP)';
    skipBtn.addEventListener('click', () => castVote('skip'));
    voteGrid.appendChild(skipBtn);

    // 3. Timer Countdown
    meetingTimer = 35;
    const timerEl = document.getElementById('meeting-timer');
    if (meetingInterval) clearInterval(meetingInterval);

    meetingInterval = setInterval(() => {
      meetingTimer--;
      timerEl.textContent = `Голосование: ${meetingTimer}с`;
      if (meetingTimer <= 0) {
        clearInterval(meetingInterval);
        resolveVoting();
      }
    }, 1000);
  }

  function addMeetingChatMessage(sender, text, isPlayer = false) {
    const row = document.createElement('div');
    row.className = 'meeting-chat-row';
    row.innerHTML = `<strong style="color: ${isPlayer ? '#00f0ff' : '#ffdd00'};">${sender}:</strong> <span>${text}</span>`;
    chatContainer.appendChild(row);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  // Handle Player Sending Chat in Meeting
  function sendPlayerMeetingChat() {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';

    addMeetingChatMessage(player.name, text, true);

    // Smart Bot AI reaction
    setTimeout(() => {
      const reply = botManager.respondToPlayerChat(text);
      if (reply) {
        addMeetingChatMessage(reply.sender, reply.text);
      }
    }, 1200 + Math.random() * 1000);
  }

  btnSendChat.addEventListener('click', sendPlayerMeetingChat);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendPlayerMeetingChat();
  });

  // HUD Chat Input during normal gameplay
  const hudChatInputContainer = document.getElementById('hud-chat-input-box');
  const hudChatInput = document.getElementById('hud-chat-input');

  function openHudChat() {
    if (gameState !== 'PLAYING') return;
    hudChatInputContainer.classList.remove('hidden');
    hudChatInput.focus();
  }

  hudChatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const text = hudChatInput.value.trim();
      if (text) {
        player.speechBubble = text;
        player.speechTimer = 4.0;
        hudChatInput.value = '';
      }
      hudChatInputContainer.classList.add('hidden');
      canvas.focus();
    } else if (e.key === 'Escape') {
      hudChatInputContainer.classList.add('hidden');
      canvas.focus();
    }
  });

  function buildVoteCard(container, id, name, color, isAlive) {
    const card = document.createElement('div');
    card.className = `vote-card ${!isAlive ? 'dead' : ''}`;
    card.innerHTML = `
      <div class="vote-avatar" style="background: ${color};"></div>
      <div class="vote-name">${name}</div>
    `;

    if (isAlive && player.isAlive) {
      card.addEventListener('click', () => castVote(id));
    }
    container.appendChild(card);
  }

  function castVote(targetId) {
    if (hasPlayerVoted) return;
    hasPlayerVoted = true;
    audio.playVoteTick();

    votes[targetId] = (votes[targetId] || 0) + 1;

    botManager.bots.forEach(b => {
      if (b.isAlive) {
        const aliveTargets = ['player', ...botManager.bots.filter(ob => ob.isAlive).map(ob => ob.id), 'skip'];
        const randomTarget = aliveTargets[Math.floor(Math.random() * aliveTargets.length)];
        votes[randomTarget] = (votes[randomTarget] || 0) + 1;
      }
    });

    document.querySelectorAll('.vote-card, .btn-skip-vote').forEach(el => el.classList.add('voted'));
    setTimeout(resolveVoting, 1500);
  }

  function resolveVoting() {
    clearInterval(meetingInterval);
    document.getElementById('modal-meeting').classList.remove('active');

    let highestTarget = null;
    let maxVotes = 0;
    let tie = false;

    Object.entries(votes).forEach(([target, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        highestTarget = target;
        tie = false;
      } else if (count === maxVotes) {
        tie = true;
      }
    });

    showEjectionCinematic(tie || highestTarget === 'skip' ? null : highestTarget);
  }

  function showEjectionCinematic(ejectedId) {
    gameState = 'EJECTION';
    audio.playEjection();

    const ejectionModal = document.getElementById('modal-ejection');
    const ejectionText = document.getElementById('ejection-text');
    ejectionModal.classList.add('active');

    if (!ejectedId) {
      ejectionText.textContent = 'Никто не был выброшен (Ничья или Пропуск).';
    } else if (ejectedId === 'player') {
      player.isAlive = false;
      ejectionText.textContent = `${player.name} был выброшен в космос. ${player.isImpostor ? 'Он был Предателем.' : 'Он НЕ был Предателем.'}`;
    } else {
      const ejectedBot = botManager.bots.find(b => b.id === ejectedId);
      if (ejectedBot) {
        ejectedBot.isAlive = false;
        ejectionText.textContent = `${ejectedBot.name} был выброшен в космос. ${ejectedBot.isImpostor ? 'Он был Предателем!' : 'Он НЕ был Предателем.'}`;
      }
    }

    setTimeout(() => {
      ejectionModal.classList.remove('active');
      checkWinCondition();
      if (gameState !== 'GAME_OVER') {
        gameState = 'PLAYING';
      }
    }, 3800);
  }

  function updateTaskProgress() {
    const totalCrewTasks = 8;
    const progressPct = Math.min(100, Math.floor((player.completedTasks / totalCrewTasks) * 100));
    document.getElementById('task-bar-fill').style.width = `${progressPct}%`;

    if (progressPct >= 100) {
      showGameOver('ПОБЕДА ЭКИПАЖА!', 'Все задания станции успешно выполнены!', '#00ffaa');
    }
  }

  function checkWinCondition() {
    const aliveImpostors = (player.isImpostor && player.isAlive ? 1 : 0) + botManager.bots.filter(b => b.isAlive && b.isImpostor).length;
    const aliveCrew = (!player.isImpostor && player.isAlive ? 1 : 0) + botManager.bots.filter(b => b.isAlive && !b.isImpostor).length;

    if (aliveImpostors === 0) {
      showGameOver('ПОБЕДА ЭКИПАЖА!', 'Все предатели обнаружены и выброшены в космос!', '#00ffaa');
    } else if (aliveImpostors >= aliveCrew) {
      showGameOver('ПОБЕДА ПРЕДАТЕЛЯ!', 'Предатель захватил космическую станцию!', '#ff3333');
    }
  }

  function showGameOver(title, desc, color) {
    gameState = 'GAME_OVER';
    const overModal = document.getElementById('modal-game-over');
    const titleEl = document.getElementById('game-over-title');
    const descEl = document.getElementById('game-over-desc');

    titleEl.textContent = title;
    titleEl.style.color = color;
    descEl.textContent = desc;
    overModal.classList.add('active');
  }

  document.getElementById('btn-play-again').addEventListener('click', () => {
    document.getElementById('modal-game-over').classList.remove('active');
    document.getElementById('screen-role-select').classList.remove('hidden');
    gameState = 'ROLE_INTRO';
  });

  // --- RENDER LOOP ---

  const clock = new THREE.Clock();

  function loop() {
    requestAnimationFrame(loop);
    const delta = Math.min(clock.getDelta(), 0.08);

    if (gameState === 'PLAYING') {
      if (player.speechTimer > 0) {
        player.speechTimer -= delta;
        if (player.speechTimer <= 0) player.speechBubble = null;
      }

      if (player.isAlive && !player.inVent) {
        let mx = 0, my = 0;
        if (keys.w) my -= 1;
        if (keys.s) my += 1;
        if (keys.a) mx -= 1;
        if (keys.d) mx += 1;

        if (mx !== 0 || my !== 0) {
          const len = Math.hypot(mx, my);
          player.x = Math.max(80, Math.min(STATION_MAP.width - 80, player.x + (mx / len) * player.speed));
          player.y = Math.max(80, Math.min(STATION_MAP.height - 80, player.y + (my / len) * player.speed));
        }
      }

      if (player.isImpostor) {
        player.killCooldown = Math.max(0, player.killCooldown - delta);
        const cdText = document.getElementById('kill-cooldown-text');
        if (cdText) cdText.textContent = player.killCooldown > 0 ? Math.ceil(player.killCooldown) : 'ГОТОВО';
        btnKill.classList.toggle('ready', player.killCooldown <= 0);
      }

      botManager.update(delta, player, (type, reporter, body) => {
        startEmergencyMeeting(type, reporter, body);
      });
    }

    renderCanvas();
  }

  function renderCanvas() {
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2 - player.x, canvas.height / 2 - player.y);

    // 1. Draw Corridors
    ctx.fillStyle = '#222938';
    STATION_MAP.corridors.forEach(c => ctx.fillRect(c.x, c.y, c.w, c.h));

    // 2. Draw Rooms
    STATION_MAP.rooms.forEach(r => {
      ctx.fillStyle = r.color;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = '#4f627a';
      ctx.lineWidth = 6;
      ctx.strokeRect(r.x, r.y, r.w, r.h);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(r.name, r.x + r.w / 2, r.y + r.h / 2);
    });

    // 3. Draw Emergency Table
    ctx.fillStyle = '#1c2430';
    ctx.beginPath();
    ctx.arc(STATION_MAP.emergencyTable.x, STATION_MAP.emergencyTable.y, STATION_MAP.emergencyTable.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff3333';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#ff2222';
    ctx.beginPath();
    ctx.arc(STATION_MAP.emergencyTable.x, STATION_MAP.emergencyTable.y, 16, 0, Math.PI * 2);
    ctx.fill();

    // 4. Draw Vents
    STATION_MAP.vents.forEach(v => {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(v.x - 18, v.y - 12, 36, 24);
      ctx.strokeStyle = '#555555';
      ctx.lineWidth = 2;
      ctx.strokeRect(v.x - 18, v.y - 12, 36, 24);
    });

    // 5. Draw Task Consoles
    STATION_MAP.tasks.forEach(t => {
      ctx.fillStyle = '#ffdd00';
      ctx.beginPath();
      ctx.arc(t.x, t.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // 6. Draw Dead Bodies
    botManager.deadBodies.forEach(b => drawDeadBody(ctx, b.x, b.y, b.color));

    // 7. Draw Bots
    botManager.bots.forEach(bot => {
      if (bot.isAlive) {
        drawAstronaut(ctx, bot.x, bot.y, bot.color, bot.name, false, bot.speechBubble);
      }
    });

    // 8. Draw Player
    if (player.isAlive && !player.inVent) {
      drawAstronaut(ctx, player.x, player.y, player.color, player.name, true, player.speechBubble);
    }

    ctx.restore();
  }

  function drawAstronaut(c, x, y, color, name, isPlayer = false, speech = null) {
    c.save();
    c.translate(x, y);

    c.fillStyle = color;
    c.fillRect(-22, -12, 10, 24);
    c.strokeStyle = '#000';
    c.lineWidth = 2;
    c.strokeRect(-22, -12, 10, 24);

    c.fillStyle = color;
    c.beginPath();
    c.arc(0, -6, 16, Math.PI, 0);
    c.lineTo(16, 12);
    c.arc(8, 12, 8, 0, Math.PI);
    c.arc(-8, 12, 8, 0, Math.PI);
    c.lineTo(-16, -6);
    c.closePath();
    c.fill();
    c.stroke();

    c.fillStyle = '#66ccff';
    c.beginPath();
    c.ellipse(6, -6, 10, 6, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = '#000';
    c.lineWidth = 2;
    c.stroke();

    c.fillStyle = isPlayer ? '#ffff55' : '#ffffff';
    c.font = 'bold 14px sans-serif';
    c.textAlign = 'center';
    c.fillText(name, 0, -26);

    // Speech Bubble
    if (speech) {
      c.fillStyle = 'rgba(0, 0, 0, 0.85)';
      c.strokeStyle = '#00f0ff';
      c.lineWidth = 2;
      const textW = c.measureText(speech).width;
      c.fillRect(-textW / 2 - 10, -60, textW + 20, 26);
      c.strokeRect(-textW / 2 - 10, -60, textW + 20, 26);
      c.fillStyle = '#ffffff';
      c.font = 'bold 13px sans-serif';
      c.fillText(speech, 0, -42);
    }

    c.restore();
  }

  function drawDeadBody(c, x, y, color) {
    c.save();
    c.translate(x, y);

    c.fillStyle = 'rgba(180, 20, 20, 0.45)';
    c.beginPath();
    c.arc(0, 0, 26, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = color;
    c.fillRect(-14, -6, 28, 16);
    c.strokeStyle = '#000';
    c.lineWidth = 2;
    c.strokeRect(-14, -6, 28, 16);

    c.fillStyle = '#ffffff';
    c.fillRect(-4, -14, 8, 10);
    c.strokeRect(-4, -14, 8, 10);

    c.restore();
  }

  loop();
});
