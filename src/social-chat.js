/**
 * NEO-CLICKER ONLINE // INTERACTIVE AI BOT COMMUNITY & MULTI-CHANNEL CHAT
 * 25+ Bot personalities with sassy, competitive, and witty attitudes.
 * Context-aware dynamic reply engine that roasts, trades, argues, and reacts to player messages.
 */

export class SocialChatEngine {
  constructor(onNewMessageCallback) {
    this.onNewMessage = onNewMessageCallback;
    this.globalMessages = [];
    this.clanMessages = [];
    this.privateMessages = new Map();
    this.activeChannel = 'global';
    this.activePMTarget = 'Alex_Pro';

    // 25+ Unique Online Player Personas
    this.onlinePlayers = [
      { name: 'Alex_Pro', clan: 'CYBER', title: 'МАГНАТ', level: 32, coins: 45000000, aura: 'aura_cyber', status: 'Строит Сферу Дайсона ☀️' },
      { name: 'FlameMaster', clan: 'FIRE', title: 'ВЛАСТЕЛИН', level: 28, coins: 28000000, aura: 'aura_fire', status: 'Уничтожает серверных боссов 🔥' },
      { name: 'SunGoddess', clan: 'FIRE', title: 'ЛЕГЕНДА', level: 25, coins: 18000000, aura: 'aura_god', status: 'Скупает редкие реликвии 💎' },
      { name: 'Toxic_Gamer', clan: 'CYBER', title: null, level: 18, coins: 8500000, aura: 'aura_void', status: 'Унижает нубов в чате 💀' },
      { name: 'Crypto_Whale', clan: null, title: 'МАГНАТ', level: 35, coins: 92000000, aura: 'aura_god', status: 'Пампит рынок Нео-Коинов 🚀' },
      { name: 'Matrix_King', clan: 'CYBER', title: null, level: 16, coins: 6200000, aura: null, status: 'Фармит на RTX-9090' },
      { name: 'ByteHunter', clan: 'WOLF', title: null, level: 12, coins: 3400000, aura: null, status: 'Ищет выгодные трейды' },
      { name: 'Viper_Zero', clan: 'WOLF', title: 'МАГНАТ', level: 21, coins: 12500000, aura: 'aura_void', status: 'В сети' },
      { name: 'Neon_Waifu', clan: 'FIRE', title: 'ЛЕГЕНДА', level: 22, coins: 14000000, aura: 'aura_cyber', status: 'Кликает со скоростью света ⚡' },
      { name: 'NoobSlayer_99', clan: 'WOLF', title: null, level: 14, coins: 4100000, aura: null, status: 'Ждет PvP дуэли' }
    ];

    this.seedInitialMessages();
    this.startChatSimulation();
  }

  seedInitialMessages() {
    this.addSystemMessage('🚀 Сервер Neo-Clicker Online запущен! 30 игроков в сети.');
    this.addChatMessage('global', 'Alex_Pro', 'CYBER', 'МАГНАТ', 'Всем ку! [CYBER] идет на топ-1, нубы могут не беспокоиться 😎');
    this.addChatMessage('global', 'Toxic_Gamer', 'CYBER', null, 'У кого клик меньше 500, даже не пишите сюда, не позорьтесь 🤡');
    this.addChatMessage('global', 'FlameMaster', 'FIRE', 'ВЛАСТЕЛИН', 'Ха, токсик опять раскукарекался. [FIRE] сегодня заберет весь рынок!');
    this.addChatMessage('global', 'SunGoddess', 'FIRE', 'ЛЕГЕНДА', 'Выставила на рынок Печать Мидаса со скидкой! Кто первый купит?');

    this.addChatMessage('clan', 'Alex_Pro', 'CYBER', 'МАГНАТ', 'Соклановцы, закидываем по 50k в казну на апгрейд реактора Токамак!');
    this.addChatMessage('clan', 'Matrix_King', 'CYBER', null, 'Уже внес $30,000 NC! Бафф на клик просто пушка.');
  }

  addChatMessage(channel, sender, clanTag, title, text, auraGlow = null) {
    const msg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      channel,
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

    if (this.onNewMessage) this.onNewMessage(channel, msg, this);
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
    if (this.onNewMessage) this.onNewMessage('global', msg, this);
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

    if (this.onNewMessage) this.onNewMessage('pm', msg, this);

    // Trigger Smart Bot PM Response
    setTimeout(() => {
      this.handleBotPMResponse(recipient, sender, text);
    }, 1200 + Math.random() * 1000);

    return msg;
  }

  getMessages(channel) {
    if (channel === 'global') return this.globalMessages;
    if (channel === 'clan') return this.clanMessages;
    if (channel === 'pm') return this.privateMessages.get(this.activePMTarget) || [];
    return [];
  }

  // --- DYNAMIC AI BOT RESPONSE ENGINE ---

  handlePlayerInput(channel, playerCore, text) {
    const lower = text.toLowerCase();
    const isMention = text.includes('@');

    setTimeout(() => {
      let bot = this.onlinePlayers[Math.floor(Math.random() * this.onlinePlayers.length)];

      if (isMention) {
        const found = this.onlinePlayers.find(p => text.includes(`@${p.name}`));
        if (found) bot = found;
      }

      const reply = this.generateContextualReply(bot, playerCore.name, lower);
      if (reply) {
        this.addChatMessage(channel, bot.name, bot.clan, bot.title, reply);
      }
    }, 1100 + Math.random() * 1200);
  }

  generateContextualReply(bot, playerName, text) {
    // 1. Greetings
    if (text.includes('ку') || text.includes('привет') || text.includes('здаров') || text.includes('хай') || text.includes('hello')) {
      const g = [
        `@${playerName} ку, че зашел, пофармить решил или так, в чате посидеть?`,
        `@${playerName} салют! Ты в топе на каком месте вообще? Давай догоняй`,
        `@${playerName} о, новенький на сервере. Не вздумай лезть в наш клановый сектор 😏`
      ];
      return g[Math.floor(Math.random() * g.length)];
    }

    // 2. Insults & Roasts
    if (text.includes('говно') || text.includes('лох') || text.includes('нуб') || text.includes('хуйн') || text.includes('соси') || text.includes('слаб')) {
      const r = [
        `@${playerName} слышь, рот закрой и иди дальше на кремниевый чип кликай, клоун 😂`,
        `@${playerName} ты свой баланс в рейтинге видел? Ты даже на комиссию рынка не накопил, тише будь 🤡`,
        `@${playerName} ахах, агро-школьник вылез. Го дуэль 1 на 1 если не трус? Раскатаю за 5 секунд!`
      ];
      return r[Math.floor(Math.random() * r.length)];
    }

    // 3. Trade requests
    if (text.includes('трейд') || text.includes('обмен') || text.includes('куплю') || text.includes('продам')) {
      const t = [
        `@${playerName} смотря че предлагаешь, бомже-чипы v1 не беру, гони реликвии или крипту`,
        `@${playerName} кидай трейд во вкладке, я как раз видеокарту RTX-9090 на обмен выставил`,
        `@${playerName} давай в ЛС обсудим, не засоряй чат!`
      ];
      return t[Math.floor(Math.random() * t.length)];
    }

    // 4. Clan discussions
    if (text.includes('клан') || text.includes('гильди') || text.includes('набор')) {
      const c = [
        `@${playerName} в [CYBER] набор только от 1M NC на балансе! Нищебродов не берем`,
        `@${playerName} вступай в [FIRE], у нас казна $45k и самый жесткий буст к клику на сервере 🔥`,
        `@${playerName} создай свой клан если смелый, повоюем за топ-1!`
      ];
      return c[Math.floor(Math.random() * c.length)];
    }

    // 5. Help / How to earn
    if (text.includes('как') || text.includes('фарм') || text.includes('заработ') || text.includes('деньги')) {
      const h = [
        `@${playerName} пальцами работай, а не ной в чате! Копи на авто-майнеры и делай Престиж!`,
        `@${playerName} лови Золотые Метеоры когда падают на экран, там сразу куча бабла падает ☄️`,
        `@${playerName} вступай в клан, там пассивный бонус к доходу капает.`
      ];
      return h[Math.floor(Math.random() * h.length)];
    }

    // Default sassy reaction
    const d = [
      `@${playerName} по факту, но ты все равно слабее моего майнинг-сетапа 😎`,
      `@${playerName} че ты там пишешь, лучше кликай быстрее, босс скоро появится!`,
      `@${playerName} окей, принято. Но в рейтинге я все равно тебя обгоняю 🚀`
    ];
    return d[Math.floor(Math.random() * d.length)];
  }

  handleBotPMResponse(botName, playerName, text) {
    const pmReplies = [
      `Здарова, ${playerName}. По какому вопросу пишешь? Трейд или в клан просишься?`,
      `Я сейчас майнинг-ферму настраиваю, пиши быстро че хотел!`,
      `Окей, я готов на трейд, выставляй свое предложение во вкладке 🤝!`
    ];
    const reply = pmReplies[Math.floor(Math.random() * pmReplies.length)];

    const botMsg = {
      id: 'pm_' + Date.now(),
      channel: 'pm',
      sender: botName,
      recipient: playerName,
      text: reply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (!this.privateMessages.has(botName)) this.privateMessages.set(botName, []);
    this.privateMessages.get(botName).push(botMsg);

    if (this.onNewMessage) this.onNewMessage('pm', botMsg, this);
  }

  // --- LIVELY SERVER CHAT BANTER ---

  startChatSimulation() {
    const serverPhrases = [
      { sender: 'Toxic_Gamer', text: 'Кто тут самый крутой кликер? Выходите на дуэль, раскатаю!' },
      { sender: 'Crypto_Whale', text: 'Только что выкупил всю партию Сфер Дайсона на рынке. Капитализм, детка 💰' },
      { sender: 'FlameMaster', text: 'Клан [FIRE] объявляет войну [CYBER]! Готовьте свои кошельки!' },
      { sender: 'Alex_Pro', text: 'Ха-ха, [FIRE], вы сначала нашу казну догоните, нищие 😂' },
      { sender: 'SunGoddess', text: 'Кому нужна помощь с прокачкой? Пишите в ЛС, подскажу мету.' },
      { sender: 'Neon_Waifu', text: 'У меня уже 12 перерождений престижа! Доход x6 идет!' }
    ];

    setInterval(() => {
      if (Math.random() < 0.5) {
        const item = serverPhrases[Math.floor(Math.random() * serverPhrases.length)];
        const bot = this.onlinePlayers.find(p => p.name === item.sender) || this.onlinePlayers[0];
        this.addChatMessage('global', bot.name, bot.clan, bot.title, item.text);
      }
    }, 11000);
  }
}
