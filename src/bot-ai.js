/**
 * AMONG US // SMART BOT AI WITH STRICT MAP NAVIGATION
 * Bots strictly stay inside rooms and corridors, perform simulated tasks,
 * stalk victims when Impostor, report bodies, and engage in debate.
 */

export class BotManager {
  constructor(map, audio) {
    this.map = map;
    this.audio = audio;
    this.bots = [];
    this.deadBodies = [];
    
    this.botColors = [
      { id: 'blue', name: 'Синий', hex: '#132ed1' },
      { id: 'green', name: 'Зеленый', hex: '#117f2d' },
      { id: 'pink', name: 'Розовый', hex: '#ed54ba' },
      { id: 'orange', name: 'Оранжевый', hex: '#ef7d0d' },
      { id: 'yellow', name: 'Желтый', hex: '#f5f557' },
      { id: 'black', name: 'Черный', hex: '#3f474e' },
      { id: 'white', name: 'Белый', hex: '#d6e0f0' },
      { id: 'purple', name: 'Фиолетовый', hex: '#6b2fbb' },
      { id: 'cyan', name: 'Голубой', hex: '#38fedc' }
    ];

    this.initBots(6);
  }

  initBots(count = 6) {
    this.bots = [];
    this.deadBodies = [];

    for (let i = 0; i < count; i++) {
      const col = this.botColors[i % this.botColors.length];
      const startRoom = this.map.rooms[0]; // Cafeteria

      this.bots.push({
        id: 'bot_' + i,
        name: col.name,
        color: col.hex,
        isImpostor: false,
        isAlive: true,
        x: startRoom.x + 60 + Math.random() * (startRoom.w - 120),
        y: startRoom.y + 60 + Math.random() * (startRoom.h - 120),
        speed: 2.2,
        targetX: 1000,
        targetY: 290,
        state: 'IDLE',
        taskTimer: 0,
        killCooldown: 15.0,
        speechBubble: null,
        speechTimer: 0
      });
    }
  }

  update(delta, player, onEmergencyMeeting) {
    this.bots.forEach(bot => {
      if (!bot.isAlive) return;

      if (bot.speechTimer > 0) {
        bot.speechTimer -= delta;
        if (bot.speechTimer <= 0) bot.speechBubble = null;
      }

      if (bot.isImpostor) {
        bot.killCooldown = Math.max(0, bot.killCooldown - delta);
      }

      // Check dead bodies nearby
      this.deadBodies.forEach(body => {
        if (!body.reported && Math.hypot(bot.x - body.x, bot.y - body.y) < 80) {
          body.reported = true;
          if (onEmergencyMeeting) {
            onEmergencyMeeting('body', bot, body);
          }
        }
      });

      // AI State Machine
      if (bot.state === 'IDLE') {
        // Pick a random room or task as next destination
        const targetRoom = this.map.rooms[Math.floor(Math.random() * this.map.rooms.length)];
        bot.targetX = targetRoom.x + 40 + Math.random() * (targetRoom.w - 80);
        bot.targetY = targetRoom.y + 40 + Math.random() * (targetRoom.h - 80);
        bot.state = 'WALKING';
      } 
      else if (bot.state === 'WALKING') {
        const dx = bot.targetX - bot.x;
        const dy = bot.targetY - bot.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 12) {
          const stepX = (dx / dist) * bot.speed;
          const stepY = (dy / dist) * bot.speed;

          // Strict collision checking for bots
          if (this.map.isWalkable(bot.x + stepX, bot.y + stepY, 14)) {
            bot.x += stepX;
            bot.y += stepY;
          } else if (this.map.isWalkable(bot.x + stepX, bot.y, 14)) {
            bot.x += stepX;
          } else if (this.map.isWalkable(bot.x, bot.y + stepY, 14)) {
            bot.y += stepY;
          } else {
            // Reroute if stuck
            bot.state = 'IDLE';
          }
        } else {
          bot.state = 'TASK';
          bot.taskTimer = 4.0 + Math.random() * 4.0;
        }
      }
      else if (bot.state === 'TASK') {
        bot.taskTimer -= delta;

        // Impostor Kill Logic
        if (bot.isImpostor && bot.killCooldown <= 0) {
          const victims = this.bots.filter(b => b.isAlive && b.id !== bot.id && Math.hypot(b.x - bot.x, b.y - bot.y) < 65);
          if (victims.length === 1) {
            const vic = victims[0];
            vic.isAlive = false;
            bot.killCooldown = 22.0;
            this.deadBodies.push({ x: vic.x, y: vic.y, color: vic.color, name: vic.name, reported: false });
            if (this.audio) this.audio.playKill();
          }
        }

        if (bot.taskTimer <= 0) {
          bot.state = 'IDLE';
        }
      }
    });
  }

  generateDiscussion(reporterBot, bodyInfo) {
    const messages = [];

    if (bodyInfo) {
      messages.push({ sender: reporterBot.name, text: `Я нашел тело ${bodyInfo.name}!` });
    } else {
      messages.push({ sender: reporterBot.name, text: 'Срочное собрание! Кто-то ведет себя подозрительно.' });
    }

    const aliveBots = this.bots.filter(b => b.isAlive);
    const dialogueTemplates = [
      `Я был в Медпункте, делал сканирование.`,
      `Я чинил провода в Электрике, со мной никого не было.`,
      `Где было тело? Я был в Оружейной.`,
      `Скипаем голосование или есть точные улики?`,
      `Я видел, как кто-то быстро пробежал в сторону Реактора!`,
      `Голосуем аккуратно, если ошибемся — предатели победят.`
    ];

    aliveBots.slice(0, 4).forEach((bot, i) => {
      if (bot.id !== reporterBot.id) {
        messages.push({ sender: bot.name, text: dialogueTemplates[i % dialogueTemplates.length] });
      }
    });

    return messages;
  }

  respondToPlayerChat(playerText) {
    const aliveBots = this.bots.filter(b => b.isAlive);
    if (aliveBots.length === 0) return null;

    const randomBot = aliveBots[Math.floor(Math.random() * aliveBots.length)];
    const lower = playerText.toLowerCase();

    let response = 'Понял тебя. Давайте решать голосованием.';

    if (lower.includes('скип') || lower.includes('skip') || lower.includes('пропуск')) {
      response = 'Согласен, улик мало. Жмем SKIP!';
    } else if (lower.includes('синий') || lower.includes('синего') || lower.includes('blue')) {
      response = 'Синий реально подозрительный, я тоже за него!';
    } else if (lower.includes('красный') || lower.includes('красного') || lower.includes('red')) {
      response = 'Красный, почему ты так нервничаешь? Докажи, что ты невиновен!';
    } else if (lower.includes('зеленый') || lower.includes('зеленого') || lower.includes('green')) {
      response = 'Зеленый был со мной в Столовой, он чист!';
    } else if (lower.includes('люк') || lower.includes('вент') || lower.includes('vent')) {
      response = 'Кто-то прыгнул в люк?! Тогда точно голосуем за него!';
    } else {
      const genericResponses = [
        'Звучит убедительно, голосую с тобой.',
        'А у тебя есть доказательства?',
        'Я думаю, нам нужно проверить камеры.',
        'Голосуем быстрее, время идет!'
      ];
      response = genericResponses[Math.floor(Math.random() * genericResponses.length)];
    }

    return { sender: randomBot.name, text: response };
  }
}
