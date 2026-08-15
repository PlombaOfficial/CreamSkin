/**
 * AMONG US // CYBER STATION COMPLETE ENGINE
 * Strict Wall Collisions, BFS Waypoint Pathfinding, Single-Document Realtime Sync,
 * Host-Client Bot Replication, and Remote Player Rendering.
 */

import { STATION_MAP } from "./station-map.js";
import { AmongUsAudioEngine } from "./audio-engine.js";
import { BotManager } from "./bot-ai.js";
import { TaskManager } from "./tasks.js";
import { MultiplayerManager } from "./multiplayer-manager.js";

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // 1. Audio, Bot, Task & Network Managers
  const audio = new AmongUsAudioEngine();
  const taskManager = new TaskManager(audio);
  const botManager = new BotManager(STATION_MAP, audio);
  const network = new MultiplayerManager();

  // 2. Player State
  const player = {
    x: 1000,
    y: 290,
    radius: 16,
    speed: 3.4,
    color: '#c51111',
    name: 'Оператор',
    isImpostor: false,
    isAlive: true,
    inVent: false,
    currentVentIdx: 0,
    killCooldown: 12.0,
    completedTasks: 0,
    totalTasks: 4,
    speechBubble: null,
    speechTimer: 0
  };

  // Game Status
  let gameState = 'LOBBY';
  let meetingTimer = 30;
  let meetingInterval = null;
  let votes = {};
  let hasPlayerVoted = false;
  let activeRoomCode = null;

  // Keyboard State
  const keys = { w: false, a: false, s: false, d: false };

  window.addEventListener('keydown', (e) => {
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

  // --------------------------------------------------------------------------
  // LOBBY SETUP & REALTIME FIRESTORE WAITING ROOM
  // --------------------------------------------------------------------------
  const inputPlayerName = document.getElementById('input-player-name');
  const inputRoomCode = document.getElementById('input-room-code');
  const btnCreateRoom = document.getElementById('btn-create-room');
  const btnJoinRoom = document.getElementById('btn-join-room');
  const screenWaiting = document.getElementById('screen-waiting-room');
  const waitingCodeBadge = document.getElementById('waiting-room-code');
  const waitingPlayerList = document.getElementById('waiting-player-list');
  const btnStartMatch = document.getElementById('btn-start-match');
  const btnCancelRoom = document.getElementById('btn-cancel-room');

  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      player.color = dot.dataset.color;
    });
  });

  // 1. Host creates room
  btnCreateRoom.addEventListener('click', async () => {
    player.name = inputPlayerName.value.trim() || 'Оператор';
    try {
      btnCreateRoom.disabled = true;
      btnCreateRoom.textContent = 'Создание...';
      const code = await network.createRoom(player.name, player.color);
      openWaitingRoom(code, true);
    } catch (e) {
      alert('Ошибка базы Firebase: ' + e.message);
    } finally {
      btnCreateRoom.disabled = false;
      btnCreateRoom.textContent = '⚡ СОЗДАТЬ КОМНАТУ';
    }
  });

  // 2. Friend joins room
  btnJoinRoom.addEventListener('click', async () => {
    player.name = inputPlayerName.value.trim() || 'Оператор';
    const code = inputRoomCode.value.trim();
    if (!code) {
      alert('Введите код комнаты (например, BCK4092)!');
      return;
    }
    try {
      btnJoinRoom.disabled = true;
      btnJoinRoom.textContent = 'Вход...';
      const joinedCode = await network.joinRoom(code, player.name, player.color);
      openWaitingRoom(joinedCode, false);
    } catch (e) {
      alert(e.message || 'Комната не найдена');
    } finally {
      btnJoinRoom.disabled = false;
      btnJoinRoom.textContent = '🔗 ВОЙТИ ПО КОДУ';
    }
  });

  function openWaitingRoom(code, isHost) {
    activeRoomCode = code;
    document.getElementById('screen-lobby').classList.add('hidden');
    screenWaiting.classList.remove('hidden');
    waitingCodeBadge.textContent = code;

    if (isHost) {
      btnStartMatch.classList.remove('hidden');
      btnStartMatch.textContent = '🚀 НАЧАТЬ ИГРУ СЕЙЧАС';
    } else {
      btnStartMatch.classList.add('hidden');
    }

    // Realtime Listener for room players & match start
    network.listenToRoom(
      code,
      (players) => {
        waitingPlayerList.innerHTML = '';
        players.forEach(p => {
          const item = document.createElement('div');
          item.className = 'waiting-player-slot';
          item.innerHTML = `
            <div class="waiting-player-dot" style="background: ${p.color};"></div>
            <span>${p.name} ${p.isHost ? '(Хост)' : '(Подключен)'}</span>
          `;
          waitingPlayerList.appendChild(item);
        });

        const botSlot = document.createElement('div');
        botSlot.className = 'waiting-player-slot';
        botSlot.style.color = '#5a759e';
        botSlot.innerHTML = `
          <div class="waiting-player-dot" style="background: #132ed1;"></div>
          <span>+ ${Math.max(0, 8 - players.length)} Умных AI-Ботов (Заполнят экипаж)</span>
        `;
        waitingPlayerList.appendChild(botSlot);
      },
      (roomData) => {
        if (gameState === 'LOBBY') {
          screenWaiting.classList.add('hidden');
          startMatch(code, roomData.secretPick);
        }
      }
    );
  }

  waitingCodeBadge.addEventListener('click', () => {
    navigator.clipboard.writeText(activeRoomCode).then(() => {
      showFloatingNotif(`Код ${activeRoomCode} скопирован в буфер!`);
    }).catch(() => {});
  });

  // Host starts match
  btnStartMatch.addEventListener('click', async () => {
    const totalParticipants = 8;
    const secretPick = Math.floor(Math.random() * totalParticipants);
    await network.startMatchInFirestore(secretPick);
    screenWaiting.classList.add('hidden');
    startMatch(activeRoomCode, secretPick);
  });

  btnCancelRoom.addEventListener('click', () => {
    screenWaiting.classList.add('hidden');
    document.getElementById('screen-lobby').classList.remove('hidden');
  });

  function startMatch(roomCode, secretPick = 0) {
    audio.init();
    document.getElementById('screen-lobby').classList.add('hidden');
    screenWaiting.classList.add('hidden');
    document.getElementById('game-hud').classList.remove('hidden');
    document.getElementById('hud-room-code-tag').textContent = `КОМНАТА: ${roomCode}`;

    // Reset Player
    player.x = 1000;
    player.y = 290;
    player.isAlive = true;
    player.inVent = false;
    player.killCooldown = 12.0;
    player.completedTasks = 0;
    document.getElementById('task-bar-fill').style.width = '0%';

    // Init Bots
    botManager.initBots(6);

    // Synchronized Secret Impostor Assignment
    if (secretPick === 0) {
      player.isImpostor = network.isHost;
    } else if (secretPick === 1) {
      player.isImpostor = !network.isHost;
    } else {
      player.isImpostor = false;
      const impBotIdx = Math.min(botManager.bots.length - 1, secretPick - 2);
      botManager.bots[impBotIdx].isImpostor = true;
    }

    // Role Intro Splash
    const introModal = document.getElementById('modal-role-intro');
    const roleText = document.getElementById('intro-role-name');
    const roleDesc = document.getElementById('intro-role-desc');

    if (player.isImpostor) {
      roleText.textContent = 'ПРЕДАТЕЛЬ (IMPOSTOR)';
      roleText.style.color = '#ff3333';
      roleDesc.textContent = 'Устраняйте экипаж, используйте вентиляцию и не дайте завершить задания!';
      btnKill.classList.remove('hidden');
      btnVent.classList.remove('hidden');
    } else {
      roleText.textContent = 'ЧЛЕН ЭКИПАЖА (CREWMATE)';
      roleText.style.color = '#00f0ff';
      roleDesc.textContent = 'Среди нас 1 тайный Предатель... Выполняйте задания и найдите его!';
      btnKill.classList.add('hidden');
      btnVent.classList.add('hidden');
    }

    introModal.classList.add('active');
    setTimeout(() => {
      introModal.classList.remove('active');
      gameState = 'PLAYING';
    }, 2800);
  }

  // Room Code Copy in HUD
  document.getElementById('hud-room-code-tag').addEventListener('click', () => {
    const text = document.getElementById('hud-room-code-tag').textContent.replace('КОМНАТА: ', '');
    navigator.clipboard.writeText(text).then(() => {
      showFloatingNotif(`Код ${text} скопирован в буфер!`);
    }).catch(() => {});
  });

  function showFloatingNotif(msg) {
    const notif = document.getElementById('game-notification');
    notif.textContent = msg;
    notif.classList.add('visible');
    setTimeout(() => notif.classList.remove('visible'), 2500);
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
      if (Math.hypot(player.x - t.x, player.y - t.y) < 65) {
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

    let nearestVictim = null;
    let minDist = 75;

    // Check bots
    botManager.bots.forEach(bot => {
      if (bot.isAlive) {
        const dist = Math.hypot(player.x - bot.x, player.y - bot.y);
        if (dist < minDist) {
          minDist = dist;
          nearestVictim = bot;
        }
      }
    });

    // Check remote friend
    network.remotePlayers.forEach(rp => {
      if (rp.isAlive) {
        const dist = Math.hypot(player.x - rp.x, player.y - rp.y);
        if (dist < minDist) {
          minDist = dist;
          nearestVictim = rp;
        }
      }
    });

    if (nearestVictim) {
      nearestVictim.isAlive = false;
      player.killCooldown = 22.0;
      botManager.deadBodies.push({
        x: nearestVictim.x,
        y: nearestVictim.y,
        color: nearestVictim.color,
        name: nearestVictim.name,
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

  // --- EMERGENCY MEETING & VOTING ---

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

    chatContainer.innerHTML = '';
    const discussions = botManager.generateDiscussion(reporter, bodyInfo);
    discussions.forEach(d => addMeetingChatMessage(d.sender, d.text));

    voteGrid.innerHTML = '';
    buildVoteCard(voteGrid, 'player', player.name, player.color, player.isAlive);
    
    network.remotePlayers.forEach(rp => {
      buildVoteCard(voteGrid, rp.id, rp.name, rp.color, rp.isAlive);
    });

    botManager.bots.forEach(bot => {
      buildVoteCard(voteGrid, bot.id, bot.name, bot.color, bot.isAlive);
    });

    const skipBtn = document.createElement('button');
    skipBtn.className = 'btn-skip-vote';
    skipBtn.textContent = 'ПРОПУСТИТЬ ГОЛОСОВАНИЕ (SKIP)';
    skipBtn.addEventListener('click', () => castVote('skip'));
    voteGrid.appendChild(skipBtn);

    meetingTimer = 30;
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

  function sendPlayerMeetingChat() {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';
    addMeetingChatMessage(player.name, text, true);

    setTimeout(() => {
      const reply = botManager.respondToPlayerChat(text);
      if (reply) addMeetingChatMessage(reply.sender, reply.text);
    }, 1000 + Math.random() * 800);
  }

  btnSendChat.addEventListener('click', sendPlayerMeetingChat);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendPlayerMeetingChat();
  });

  // HUD Quick Chat
  const hudChatBox = document.getElementById('hud-chat-input-box');
  const hudChatInput = document.getElementById('hud-chat-input');

  function openHudChat() {
    if (gameState !== 'PLAYING') return;
    hudChatBox.classList.remove('hidden');
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
      hudChatBox.classList.add('hidden');
      canvas.focus();
    } else if (e.key === 'Escape') {
      hudChatBox.classList.add('hidden');
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
        const targets = ['player', ...botManager.bots.filter(ob => ob.isAlive).map(ob => ob.id), 'skip'];
        const rnd = targets[Math.floor(Math.random() * targets.length)];
        votes[rnd] = (votes[rnd] || 0) + 1;
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
    const totalCrewTasks = 7;
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
    document.getElementById('game-over-title').textContent = title;
    document.getElementById('game-over-title').style.color = color;
    document.getElementById('game-over-desc').textContent = desc;
    overModal.classList.add('active');
  }

  document.getElementById('btn-play-again').addEventListener('click', () => {
    document.getElementById('modal-game-over').classList.remove('active');
    document.getElementById('screen-lobby').classList.remove('hidden');
    gameState = 'LOBBY';
  });

  // --- RENDER & PHYSICS LOOP ---

  const clock = new THREE.Clock();

  function loop() {
    requestAnimationFrame(loop);
    const delta = Math.min(clock.getDelta(), 0.08);

    if (gameState === 'PLAYING') {
      if (player.speechTimer > 0) {
        player.speechTimer -= delta;
        if (player.speechTimer <= 0) player.speechBubble = null;
      }

      // Player Movement Collision
      if (player.isAlive && !player.inVent) {
        let mx = 0, my = 0;
        if (keys.w) my -= 1;
        if (keys.s) my += 1;
        if (keys.a) mx -= 1;
        if (keys.d) mx += 1;

        if (mx !== 0 || my !== 0) {
          const len = Math.hypot(mx, my);
          const stepX = (mx / len) * player.speed;
          const stepY = (my / len) * player.speed;

          if (STATION_MAP.isWalkable(player.x + stepX, player.y + stepY, player.radius)) {
            player.x += stepX;
            player.y += stepY;
          } else if (STATION_MAP.isWalkable(player.x + stepX, player.y, player.radius)) {
            player.x += stepX;
          } else if (STATION_MAP.isWalkable(player.x, player.y + stepY, player.radius)) {
            player.y += stepY;
          }
        }
      }

      // Broadcast Local Player Coordinates and Host Bots
      network.broadcastPosition(
        player.x, 
        player.y, 
        player.isAlive, 
        network.isHost ? botManager.bots : null
      );

      if (player.isImpostor) {
        player.killCooldown = Math.max(0, player.killCooldown - delta);
        const cdText = document.getElementById('kill-cooldown-text');
        if (cdText) cdText.textContent = player.killCooldown > 0 ? Math.ceil(player.killCooldown) : 'ГОТОВО';
        btnKill.classList.toggle('ready', player.killCooldown <= 0);
      }

      // Nearby Prompts
      let nearTask = false;
      STATION_MAP.tasks.forEach(t => {
        if (Math.hypot(player.x - t.x, player.y - t.y) < 65) nearTask = true;
      });
      if (Math.hypot(player.x - STATION_MAP.emergencyTable.x, player.y - STATION_MAP.emergencyTable.y) < 70) nearTask = true;
      btnUse.classList.toggle('active-prompt', nearTask);

      let nearBody = false;
      botManager.deadBodies.forEach(b => {
        if (!b.reported && Math.hypot(player.x - b.x, player.y - b.y) < 90) nearBody = true;
      });
      btnReport.classList.toggle('active-prompt', nearBody);

      // Only Host runs bot simulation; Client receives synced bot positions
      if (network.isHost) {
        botManager.update(delta, player, (type, reporter, body) => {
          startEmergencyMeeting(type, reporter, body);
        });
      } else if (network.remoteBots && network.remoteBots.length > 0) {
        // Client mirrors host's bots
        network.remoteBots.forEach((rb, idx) => {
          if (botManager.bots[idx]) {
            botManager.bots[idx].x += (rb.x - botManager.bots[idx].x) * 0.35;
            botManager.bots[idx].y += (rb.y - botManager.bots[idx].y) * 0.35;
            botManager.bots[idx].isAlive = rb.isAlive;
            botManager.bots[idx].speechBubble = rb.speechBubble;
          }
        });
      }
    }

    renderCanvas();
    renderMinimap();
  }

  function renderCanvas() {
    ctx.fillStyle = '#05070c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2 - player.x, canvas.height / 2 - player.y);

    // 1. Spaceship Hull Background
    ctx.fillStyle = '#0f141f';
    STATION_MAP.rooms.forEach(r => ctx.fillRect(r.x - 12, r.y - 12, r.w + 24, r.h + 24));
    STATION_MAP.corridors.forEach(c => ctx.fillRect(c.x - 12, c.y - 12, c.w + 24, c.h + 24));

    // 2. Corridors
    ctx.fillStyle = '#1c2433';
    STATION_MAP.corridors.forEach(c => ctx.fillRect(c.x, c.y, c.w, c.h));

    // 3. Rooms
    STATION_MAP.rooms.forEach(r => {
      ctx.fillStyle = r.color;
      ctx.fillRect(r.x, r.y, r.w, r.h);

      ctx.strokeStyle = '#3d526e';
      ctx.lineWidth = 6;
      ctx.strokeRect(r.x, r.y, r.w, r.h);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(r.name, r.x + r.w / 2, r.y + 36);
    });

    // 4. Emergency Table
    ctx.fillStyle = '#151b24';
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
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('SOS', STATION_MAP.emergencyTable.x, STATION_MAP.emergencyTable.y + 4);

    // 5. Vents
    STATION_MAP.vents.forEach(v => {
      ctx.fillStyle = '#111111';
      ctx.fillRect(v.x - 20, v.y - 12, 40, 24);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(v.x - 20, v.y - 12, 40, 24);
    });

    // 6. Tasks
    STATION_MAP.tasks.forEach(t => {
      ctx.fillStyle = '#ffdd00';
      ctx.shadowColor = '#ffdd00';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#000';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', t.x, t.y + 5);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(t.x - 70, t.y - 32, 140, 20);
      ctx.fillStyle = '#ffdd00';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(t.name, t.x, t.y - 18);
    });

    // 7. Dead Bodies
    botManager.deadBodies.forEach(b => drawDeadBody(ctx, b.x, b.y, b.color));

    // 8. Remote Real-Time Players (Friend!)
    network.remotePlayers.forEach(rp => {
      if (rp.isAlive) {
        drawAstronaut(ctx, rp.x, rp.y, rp.color, rp.name, false, null);
      }
    });

    // 9. Bots
    botManager.bots.forEach(bot => {
      if (bot.isAlive) {
        drawAstronaut(ctx, bot.x, bot.y, bot.color, bot.name, false, bot.speechBubble);
      }
    });

    // 10. Local Player
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

  // --- MINIMAP RADAR ---
  const miniCanvas = document.getElementById('minimap-canvas');
  const mctx = miniCanvas ? miniCanvas.getContext('2d') : null;

  function renderMinimap() {
    if (!mctx) return;
    const mw = miniCanvas.width;
    const mh = miniCanvas.height;
    const sx = mw / STATION_MAP.width;
    const sy = mh / STATION_MAP.height;

    mctx.fillStyle = 'rgba(10, 15, 25, 0.85)';
    mctx.fillRect(0, 0, mw, mh);

    mctx.fillStyle = '#334460';
    STATION_MAP.rooms.forEach(r => mctx.fillRect(r.x * sx, r.y * sy, r.w * sx, r.h * sy));

    mctx.fillStyle = '#ffdd00';
    STATION_MAP.tasks.forEach(t => {
      mctx.beginPath();
      mctx.arc(t.x * sx, t.y * sy, 3, 0, Math.PI * 2);
      mctx.fill();
    });

    mctx.fillStyle = '#00f0ff';
    mctx.beginPath();
    mctx.arc(player.x * sx, player.y * sy, 4, 0, Math.PI * 2);
    mctx.fill();
  }

  loop();
});
