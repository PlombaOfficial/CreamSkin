/**
 * NEO-CLICKER ONLINE // ITEMS, COSMETICS & COLLECTIBLES DATABASE
 * 10 Tiers of Long-Term Hardware, Relics, Profile Frames, Glowing Auras, and Titles.
 */

export const RARITY_CONFIG = {
  common: { name: 'Обычный', color: '#8899aa', glow: 'rgba(136, 153, 170, 0.3)' },
  rare: { name: 'Редкий', color: '#00d2ff', glow: 'rgba(0, 210, 255, 0.4)' },
  epic: { name: 'Эпический', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.5)' },
  legendary: { name: 'Легендарный', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)' },
  mythic: { name: 'Мифический', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.7)' },
  divine: { name: 'Божественный', color: '#00ffcc', glow: 'rgba(0, 255, 204, 0.85)' }
};

export const ITEMS_DATABASE = [
  // --- 10 TIERS OF LONG-TERM HARDWARE AUTO-MINERS ---
  {
    id: 'chip_v1',
    name: 'Кремниевый Чип v1',
    type: 'hardware',
    rarity: 'common',
    desc: 'Базовый микроконтроллер для майнинга. +2 NC/сек.',
    bonus: { autoIncome: 2 },
    basePrice: 50,
    icon: '💾'
  },
  {
    id: 'gpu_gtx',
    name: 'Видеокарта GTX-4060',
    type: 'hardware',
    rarity: 'common',
    desc: 'Домашняя видеокарта для хэширования. +12 NC/сек.',
    bonus: { autoIncome: 12 },
    basePrice: 250,
    icon: '📼'
  },
  {
    id: 'gpu_rtx',
    name: 'Квантовая Ферма RTX-9090',
    type: 'hardware',
    rarity: 'rare',
    desc: 'Мощный риг для параллельных вычислений. +80 NC/сек.',
    bonus: { autoIncome: 80 },
    basePrice: 1500,
    icon: '⚡'
  },
  {
    id: 'datacenter',
    name: 'Промышленный Дата-Центр',
    type: 'hardware',
    rarity: 'rare',
    desc: 'Стойка серверов в подземном бункере. +450 NC/сек.',
    bonus: { autoIncome: 450 },
    basePrice: 8000,
    icon: '🏢'
  },
  {
    id: 'ai_neural',
    name: 'Нейросеть GPT-Cyber',
    type: 'hardware',
    rarity: 'epic',
    desc: 'Автономный искусственный интеллект для трейдинга. +2,800 NC/сек.',
    bonus: { autoIncome: 2800 },
    basePrice: 45000,
    icon: '🧠'
  },
  {
    id: 'orbital_sat',
    name: 'Орбитальный Спутник Майнинга',
    type: 'hardware',
    rarity: 'epic',
    desc: 'Космический модуль на солнечной энергии. +18,000 NC/сек.',
    bonus: { autoIncome: 18000 },
    basePrice: 250000,
    icon: '🛰️'
  },
  {
    id: 'tokamak_reactor',
    name: 'Термоядерный Реактор "Токамак"',
    type: 'hardware',
    rarity: 'legendary',
    desc: 'Сверхмощный реактор синтеза энергии. +120,000 NC/сек.',
    bonus: { autoIncome: 120000 },
    basePrice: 1500000,
    icon: '⚛️'
  },
  {
    id: 'dyson_sphere',
    name: 'Сфера Дайсона "Солнце"',
    type: 'hardware',
    rarity: 'legendary',
    desc: 'Поглощает излучение звезды целиком. +900,000 NC/сек.',
    bonus: { autoIncome: 900000 },
    basePrice: 10000000,
    icon: '☀️'
  },
  {
    id: 'quantum_ai_core',
    name: 'Квантовый ИИ "Сингулярность"',
    type: 'hardware',
    rarity: 'mythic',
    desc: 'Вычисляет мультивселенные блоки. +7,500,000 NC/сек.',
    bonus: { autoIncome: 7500000 },
    basePrice: 75000000,
    icon: '🔮'
  },
  {
    id: 'galactic_rift',
    name: 'Межгалактический Разлом',
    type: 'hardware',
    rarity: 'divine',
    desc: 'Извлекает чистую темную материю из разлома космоса. +60,000,000 NC/сек.',
    bonus: { autoIncome: 60000000 },
    basePrice: 500000000,
    icon: '🌌'
  },

  // --- RELICS & CLICK ENHANCERS ---
  {
    id: 'cyber_glove',
    name: 'Перчатка Нейро-Клика',
    type: 'relic',
    rarity: 'rare',
    desc: 'Синхронизирует импульсы мозга с кликером. +25 к силе клика.',
    bonus: { clickPower: 25 },
    basePrice: 600,
    icon: '🧤'
  },
  {
    id: 'golden_touch',
    name: 'Печать Мидаса',
    type: 'relic',
    rarity: 'epic',
    desc: 'Каждый клик с шансом 12% приносит 5-кратную прибыль.',
    bonus: { critChance: 0.12, critMulti: 5 },
    basePrice: 8500,
    icon: '👑'
  },
  {
    id: 'chronos_relic',
    name: 'Осколок Времени',
    type: 'relic',
    rarity: 'legendary',
    desc: 'Ускоряет перезарядку серверных ивентов на 30%.',
    bonus: { eventCooldownRed: 0.3 },
    basePrice: 60000,
    icon: '⏳'
  },
  {
    id: 'divine_matrix',
    name: 'Код Первозданной Матрицы',
    type: 'relic',
    rarity: 'divine',
    desc: 'Удваивает вообще ВСЕ доходы на сервере навсегда.',
    bonus: { globalMultiplier: 2.0 },
    basePrice: 2500000,
    icon: '🌀'
  },

  // --- GLOWING PROFILE AURAS ---
  {
    id: 'aura_cyber',
    name: 'Аура: Неоновый Киберпанк',
    type: 'aura',
    rarity: 'rare',
    desc: 'Светящееся бирюзово-розовое поле вокруг профиля.',
    cssGlow: '0 0 20px #00f0ff, 0 0 40px #ff0077',
    basePrice: 2000,
    icon: '🌀'
  },
  {
    id: 'aura_fire',
    name: 'Аура: Пламя Феникса',
    type: 'aura',
    rarity: 'epic',
    desc: 'Пылающий огненный ореол вокруг аватара в чате.',
    cssGlow: '0 0 25px #ff5500, 0 0 50px #ffaa00',
    basePrice: 15000,
    icon: '🔥'
  },
  {
    id: 'aura_void',
    name: 'Аура: Тёмная Материя',
    type: 'aura',
    rarity: 'legendary',
    desc: 'Фиолетово-чёрная гравитационная воронка.',
    cssGlow: '0 0 30px #a855f7, 0 0 60px #4c1d95',
    basePrice: 85000,
    icon: '🖤'
  },
  {
    id: 'aura_god',
    name: 'Аура: Божественное Сияние',
    type: 'aura',
    rarity: 'divine',
    desc: 'Ослепительный золотой нимб высшего божества сервера.',
    cssGlow: '0 0 40px #ffd700, 0 0 80px #fff7aa',
    basePrice: 500000,
    icon: '✨'
  },

  // --- PROFILE FRAMES ---
  {
    id: 'frame_gold',
    name: 'Рамка: Золотой Лавр',
    type: 'frame',
    rarity: 'rare',
    desc: 'Элегантная золотая рамка вокруг аватара.',
    borderColor: '#ffd700',
    basePrice: 1800,
    icon: '🖼️'
  },
  {
    id: 'frame_dragon',
    name: 'Рамка: Драконья Чешуя',
    type: 'frame',
    rarity: 'epic',
    desc: 'Рамка с шипами и рубиновыми кристаллами.',
    borderColor: '#ef4444',
    basePrice: 12000,
    icon: '🐉'
  },
  {
    id: 'frame_cosmic',
    name: 'Рамка: Квантовый Разлом',
    type: 'frame',
    rarity: 'mythic',
    desc: 'Анимированная радужная рамка высшего ранга.',
    borderColor: '#ec4899',
    basePrice: 150000,
    icon: '💠'
  },

  // --- TITLES ---
  {
    id: 'title_tycoon',
    name: 'Титул: [Магнат]',
    type: 'title',
    rarity: 'rare',
    tagText: 'МАГНАТ',
    color: '#00d2ff',
    basePrice: 1000,
    icon: '💼'
  },
  {
    id: 'title_warlord',
    name: 'Титул: [Властелин]',
    type: 'title',
    rarity: 'epic',
    tagText: 'ВЛАСТЕЛИН',
    color: '#a855f7',
    basePrice: 8000,
    icon: '⚔️'
  },
  {
    id: 'title_legend',
    name: 'Титул: [Легенда Сервера]',
    type: 'title',
    rarity: 'mythic',
    tagText: 'ЛЕГЕНДА',
    color: '#f59e0b',
    basePrice: 200000,
    icon: '🏆'
  }
];
