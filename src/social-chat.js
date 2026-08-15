/**
 * NEO-CLICKER ONLINE // SOCIAL MULTI-CHANNEL LIVE CHAT & PM ENGINE
 * 1. Global Channel (Server-wide chat & broadcasts).
 * 2. Dedicated Clan Channel (Private alliance chat between clanmates).
 * 3. Direct 1-on-1 Private Messages (PMs).
 * 4. Active Online Players list with Live Status.
 */

export class SocialChatEngine {
  constructor(onNewMessageCallback) {
    this.onNewMessage = onNewMessageCallback;
    this.globalMessages = [];
    this.clanMessages = [];
    this.privateMessages = new Map(); // targetName -> []
    this.activeChannel = 'global'; // 'global' | 'clan' | 'pm'
    this.activePMTarget = 'Alex_Pro';

    this.onlinePlayers = [
      { name: 'Alex_Pro', clan: 'CYBER', title: 'МАГНАТ', level: 24, coins: 14500000, aura: 'aura_cyber', status: 'Майнит на RTX-9090' },
      { name: 'FlameMaster', clan: 'FIRE', title: 'ВЛАСТЕЛИН', level: 19, coins: 9800000, aura: 'aura_fire', status: 'Готовит атаку на босса' },
      { name: 'SunGoddess', clan: 'FIRE', title: 'ЛЕГЕНДА', level: 16, coins: 6200000, aura: null, status: 'Торгует на рынке' },
      { name: 'Matrix_King', clan: 'CYBER', title: null, level: 12, coins: 4100000, aura: null, status: 'В сети' },
      { name: 'ByteHunter', clan: 'WOLF', title: null, level: 8, coins: 1850000, aura: null, status: 'Ищет трейд' },
      { name: 'Viper_Zero', clan: 'WOLF', title: 'МАГНАТ', level: 14, coins: 5200000, aura: 'aura_void', status: 'В сети' }
    ];

    this.seedInitialMessages();
    this.startChatSimulation();
  }

  seedInitialMessages() {
    this.addSystemMessage('🚀 Сервер Neo-Clicker Online запущен! Добро пожаловать!');
    this.addChatMessage('global', 'Alex_Pro', 'CYBER', 'МАГНАТ', 'Всем привет! Наш клан [CYBER] ищет активных майнеров в топ-1!');
    this.addChatMessage('global', 'FlameMaster', 'FIRE', 'ВЛАСТЕЛИН', 'Ха, [FIRE] все равно заберет сегодняшний ивент World Boss!');
    this.addChatMessage('global', 'SunGoddess', 'FIRE', 'ЛЕГЕНДА', 'Выставила на рынок Перчатку Нейро-Клика со скидкой!');

    // Clan initial messages
    this.addChatMessage('clan', 'Alex_Pro', 'CYBER', 'МАГНАТ', 'Братья по клану, не забывайте вносить монеты в казну на прокачку x2 клика!');
    this.addChatMessage('clan', 'Matrix_King', 'CYBER', null, 'Уже закинул $15,000 NC в банк!');
  }

  addChatMessage(channel, sender, clanTag, title, text, auraGlow = null) {
    const msg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      channel, // 'global' | 'clan' | 'pm'
      sender,
      clanTag,
      title,
      text,
      auraGlow,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (channel === 'global') {
      this.globalMessages.push(msg);
      if (this.globalMessages.length > 80) this.globalMessages.shift();
    } else if (channel === 'clan') {
      this.clanMessages.push(msg);
      if (this.clanMessages.length > 80) this.clanMessages.shift();
    }

    if (this.onNewMessage) this.onNewMessage(channel, msg);
    return msg;
  }

  addSystemMessage(text) {
    const msg = {
      id: 'sys_' + Date.now(),
      channel: 'global',
      sender: 'СЕРВЕР',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    };
    this.globalMessages.push(msg);
    if (this.onNewMessage) this.onNewMessage('global', msg);
  }

  sendPrivateMessage(sender, recipient, text) {
    const msg = {
      id: 'pm_' + Date.now(),
      channel: 'pm',
      sender,
      recipient,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (!this.privateMessages.has(recipient)) {
      this.privateMessages.set(recipient, []);
    }
    this.privateMessages.get(recipient).push(msg);

    if (this.onNewMessage) this.onNewMessage('pm', msg);
    return msg;
  }

  getMessages(channel, clanId = null) {
    if (channel === 'global') return this.globalMessages;
    if (channel === 'clan') return this.clanMessages;
    if (channel === 'pm') return this.privateMessages.get(this.activePMTarget) || [];
    return [];
  }

  startChatSimulation() {
    const globalPhrases = [
      'Кто пойдет в клан [CYBER]? Даем мощный буст к клику!',
      'Скупаю квантовые кристаллы по хорошему курсу в трейде!',
      'Только что выбил эпическую рамку Дракона! 🔥',
      'Где выгоднее фармить: на дата-центрах или через криты?',
      'Скоро начнется ивент Золотой Метеор, готовьте пальцы!',
      'Кто продаст Осколок Времени? Предлагайте трейд в ЛС!'
    ];

    const clanPhrases = [
      'Парни, копим еще 20к в казну на апгрейд пассивного дохода!',
      'Я поставил спутник майнинга на орбиту, доход попер!',
      'Наш клан сегодня на 1 месте по трофеям! Так держать!'
    ];

    setInterval(() => {
      if (Math.random() < 0.45) {
        const randUser = this.onlinePlayers[Math.floor(Math.random() * this.onlinePlayers.length)];
        const randText = globalPhrases[Math.floor(Math.random() * globalPhrases.length)];
        this.addChatMessage('global', randUser.name, randUser.clan, randUser.title, randText);
      }

      if (Math.random() < 0.3) {
        const randUser = this.onlinePlayers.find(p => p.clan === 'CYBER') || this.onlinePlayers[0];
        const randText = clanPhrases[Math.floor(Math.random() * clanPhrases.length)];
        this.addChatMessage('clan', randUser.name, randUser.clan, randUser.title, randText);
      }
    }, 14000);
  }
}
