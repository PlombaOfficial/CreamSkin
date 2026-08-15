/**
 * NEO-CLICKER ONLINE // SOCIAL LIVE CHAT & DIRECT MESSAGING (PM) ENGINE
 * Global chat, @mentions, rich badges (Clan tag, title, frame, aura),
 * private 1-on-1 DMs, and live server broadcasts.
 */

export class SocialChatEngine {
  constructor(onNewMessageCallback) {
    this.onNewMessage = onNewMessageCallback;
    this.messages = [];
    this.privateMessages = new Map(); // targetPlayerName -> array of messages
    this.activePrivateTarget = null;
    this.unreadPMCount = 0;

    this.simulatedPlayers = [
      { name: 'Alex_Pro', clan: 'CYBER', title: 'МАГНАТ', color: '#00d2ff' },
      { name: 'FlameMaster', clan: 'FIRE', title: 'ВЛАСТЕЛИН', color: '#f59e0b' },
      { name: 'Matrix_King', clan: 'CYBER', title: null, color: '#a855f7' },
      { name: 'SunGoddess', clan: 'FIRE', title: 'ЛЕГЕНДА', color: '#ec4899' },
      { name: 'ByteHunter', clan: 'WOLF', title: null, color: '#00ffcc' },
      { name: 'CryptoWhale', clan: null, title: 'МАГНАТ', color: '#ffd700' }
    ];

    this.seedInitialMessages();
    this.startChatSimulation();
  }

  seedInitialMessages() {
    this.addSystemMessage('🚀 Сервер Neo-Clicker Online запущен! Добро пожаловать!');
    this.addChatMessage('Alex_Pro', 'CYBER', 'МАГНАТ', 'Всем привет! Наш клан [CYBER] ищет активных майнеров в топ-1!');
    this.addChatMessage('FlameMaster', 'FIRE', 'ВЛАСТЕЛИН', 'Ха, [FIRE] все равно заберет сегодняшний ивент World Boss!');
    this.addChatMessage('SunGoddess', 'FIRE', 'ЛЕГЕНДА', 'Выставила на рынок Перчатку Нейро-Клика со скидкой!');
  }

  addChatMessage(sender, clanTag, title, text, auraGlow = null) {
    const msg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      sender,
      clanTag,
      title,
      text,
      auraGlow,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'global'
    };

    this.messages.push(msg);
    if (this.messages.length > 100) this.messages.shift();
    if (this.onNewMessage) this.onNewMessage('global', msg);
    return msg;
  }

  addSystemMessage(text) {
    const msg = {
      id: 'sys_' + Date.now(),
      sender: 'СЕРВЕР',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'system'
    };
    this.messages.push(msg);
    if (this.onNewMessage) this.onNewMessage('global', msg);
  }

  // --- PRIVATE MESSAGING (PM) ---

  sendPrivateMessage(sender, recipient, text) {
    const msg = {
      id: 'pm_' + Date.now(),
      sender,
      recipient,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'private'
    };

    if (!this.privateMessages.has(recipient)) {
      this.privateMessages.set(recipient, []);
    }
    this.privateMessages.get(recipient).push(msg);

    if (this.activePrivateTarget !== recipient) {
      this.unreadPMCount++;
    }

    if (this.onNewMessage) this.onNewMessage('private', msg);
    return msg;
  }

  getPrivateConversation(targetName) {
    return this.privateMessages.get(targetName) || [];
  }

  // --- LIVELY SERVER BANTER SIMULATION ---

  startChatSimulation() {
    const banterPhrases = [
      'Кто пойдет в клан [CYBER]? Даем +45% к силе клика!',
      'Скупаю квантовые кристаллы по хорошему курсу в трейде!',
      'Только что выбил эпическую рамку Дракона! 🔥',
      'Где выгоднее фармить: на автокликерах или через криты?',
      'Скоро начнется ивент Золотой Метеор, готовьте пальцы!',
      'Кто продаст Осколок Времени? Предлагайте трейд в ЛС!',
      'Клан [FIRE] объявляет войну за топ-1 рейтинга!'
    ];

    setInterval(() => {
      if (Math.random() < 0.45) {
        const randUser = this.simulatedPlayers[Math.floor(Math.random() * this.simulatedPlayers.length)];
        const randText = banterPhrases[Math.floor(Math.random() * banterPhrases.length)];
        this.addChatMessage(randUser.name, randUser.clan, randUser.title, randText);
      }
    }, 12000);
  }
}
