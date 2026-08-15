/**
 * AMONG US // SMART BOT AI WITH WAYPOINT GRAPH PATHFINDING
 * Bots find exact paths through corridors between rooms using BFS pathfinding.
 * Speeds are balanced, bots do tasks, stalk victims, report bodies, and vote.
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
      const startWp = this.map.waypoints[0]; // Cafeteria

      this.bots.push({
        id: 'bot_' + i,
        name: col.name,
        color: col.hex,
        isImpostor: false,
        isAlive: true,
        x: startWp.x + (Math.random() - 0.5) * 80,
        y: startWp.y + (Math.random() - 0.5) * 80,
        speed: 3.0, // Balanced smooth speed
        path: [], // Array of waypoints to follow
        currentWpIndex: 0,
        state: 'IDLE',
        taskTimer: 0,
        killCooldown: 15.0,
        speechBubble: null,
        speechTimer: 0
      });
    }
  }

  // Find nearest waypoint to coordinate (x, y)
  findNearestWaypoint(x, y) {
    let nearest = this.map.waypoints[0];
    let minDist = Infinity;
    this.map.waypoints.forEach(wp => {
      const d = Math.hypot(wp.x - x, wp.y - y);
      if (d < minDist) {
        minDist = d;
        nearest = wp;
      }
    });
    return nearest;
  }

  // BFS Pathfinding on waypoint network
  findPath(startWp, targetWp) {
    if (startWp.id === targetWp.id) return [targetWp];

    const queue = [[startWp]];
    const visited = new Set([startWp.id]);

    while (queue.length > 0) {
      const currentPath = queue.shift();
      const lastNode = currentPath[currentPath.length - 1];

      for (let i = 0; i < lastNode.links.length; i++) {
        const neighborId = lastNode.links[i];
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          const neighborNode = this.map.waypoints.find(w => w.id === neighborId);
          if (neighborNode) {
            const newPath = [...currentPath, neighborNode];
            if (neighborId === targetWp.id) {
              return newPath;
            }
            queue.push(newPath);
          }
        }
      }
    }
    return [targetWp];
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
        if (!body.reported && Math.hypot(bot.x - body.x, bot.y - body.y) < 85) {
          body.reported = true;
          if (onEmergencyMeeting) {
            onEmergencyMeeting('body', bot, body);
          }
        }
      });

      // AI State Machine
      if (bot.state === 'IDLE') {
        const randomTargetWp = this.map.waypoints[Math.floor(Math.random() * this.map.waypoints.length)];
        const currentNearWp = this.findNearestWaypoint(bot.x, bot.y);
        bot.path = this.findPath(currentNearWp, randomTargetWp);
        bot.currentWpIndex = 0;
        bot.state = 'WALKING';
      } 
      else if (bot.state === 'WALKING') {
        if (bot.path && bot.path.length > 0 && bot.currentWpIndex < bot.path.length) {
          const targetWp = bot.path[bot.currentWpIndex];
          const dx = targetWp.x - bot.x;
          const dy = targetWp.y - bot.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 8) {
            bot.x += (dx / dist) * bot.speed;
            bot.y += (dy / dist) * bot.speed;
          } else {
            bot.currentWpIndex++;
            if (bot.currentWpIndex >= bot.path.length) {
              bot.state = 'TASK';
              bot.taskTimer = 4.0 + Math.random() * 4.0;
            }
          }
        } else {
          bot.state = 'IDLE';
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
