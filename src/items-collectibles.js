/**
 * NEO-CLICKER ONLINE // ITEMS, COSMETICS & COLLECTIBLES DATABASE
 * 40+ Items: Hardware Chips, Ancient Relics, Profile Frames, Glowing Auras, and Titles.
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
  // --- HARDWARE AUTO-MINERS & CHIPS ---
  {
    id: 'chip_v1',
    name: 'Кремниевый Чип v1',
    type: 'hardware',
    rarity: 'common',
    desc: 'Базовый микроконтроллер для майнинга. +5 NC/сек.',
    bonus: { autoIncome: 5 },
    basePrice: 50,
    icon: '💾'
  },
  {
    id: 'gpu_rtx',
    name: 'Квантовая Видеокарта RTX-9090',
    type: 'hardware',
    rarity: 'rare',
    desc: 'Мощный видеочип для параллельных вычислений. +35 NC/сек.',
    bonus: { autoIncome: 35 },
    basePrice: 350,
    icon: '⚡'
  },
  {
    id: 'asic_rig',
    name: 'ASIC-Ферма "Атлант"',
    type: 'hardware',
    rarity: 'epic',
    desc: 'Промышленная майнинг-стойка с водяным охлаждением. +180 NC/сек.',
    bonus: { autoIncome: 180 },
    basePrice: 1800,
    icon: '🏭'
  },
  {
    id: 'quantum_core',
    name: 'Квантовое Ядро "Сингулярность"',
    type: 'hardware',
    rarity: 'legendary',
    desc: 'Вычисляет блоки в 5 параллельных вселенных. +1,200 NC/сек.',
    bonus: { autoIncome: 1200 },
    basePrice: 12000,
    icon: '🔮'
  },
  {
    id: 'dyson_grid',
    name: 'Сфера Дайсона "Солнечный Пульсар"',
    type: 'hardware',
    rarity: 'mythic',
    desc: 'Поглощает энергию целой звезды для генерации капитала. +10,000 NC/сек.',
    bonus: { autoIncome: 10000 },
    basePrice: 100000,
    icon: '☀️'
  },

  // --- RELICS & CLICK ENHANCERS ---
  {
    id: 'cyber_glove',
    name: 'Перчатка Нейро-Клика',
    type: 'relic',
    rarity: 'rare',
    desc: 'Синхронизирует импульсы мозга с кликером. +15 к силе клика.',
    bonus: { clickPower: 15 },
    basePrice: 200,
    icon: '🧤'
  },
  {
    id: 'golden_touch',
    name: 'Печать Мидаса',
    type: 'relic',
    rarity: 'epic',
    desc: 'Каждый клик с шансом 10% приносит 5-кратную прибыль.',
    bonus: { critChance: 0.1, critMulti: 5 },
    basePrice: 2500,
    icon: '👑'
  },
  {
    id: 'chronos_relic',
    name: 'Осколок Времени',
    type: 'relic',
    rarity: 'legendary',
    desc: 'Ускоряет перезарядку серверных ивентов на 30%.',
    bonus: { eventCooldownRed: 0.3 },
    basePrice: 15000,
    icon: '⏳'
  },
  {
    id: 'divine_matrix',
    name: 'Код Первозданной Матрицы',
    type: 'relic',
    rarity: 'divine',
    desc: 'Удваивает вообще ВСЕ доходы на сервере навсегда.',
    bonus: { globalMultiplier: 2.0 },
    basePrice: 500000,
    icon: '🌌'
  },

  // --- GLOWING PROFILE AURAS ---
  {
    id: 'aura_cyber',
    name: 'Аура: Неоновый Киберпанк',
    type: 'aura',
    rarity: 'rare',
    desc: 'Светящееся бирюзово-розовое поле вокруг профиля.',
    cssGlow: '0 0 20px #00f0ff, 0 0 40px #ff0077',
    basePrice: 1000,
    icon: '🌀'
  },
  {
    id: 'aura_fire',
    name: 'Аура: Пламя Феникса',
    type: 'aura',
    rarity: 'epic',
    desc: 'Пылающий огненный ореол вокруг аватара в чате.',
    cssGlow: '0 0 25px #ff5500, 0 0 50px #ffaa00',
    basePrice: 5000,
    icon: '🔥'
  },
  {
    id: 'aura_void',
    name: 'Аура: Тёмная Материя',
    type: 'aura',
    rarity: 'legendary',
    desc: 'Фиолетово-чёрная гравитационная воронка.',
    cssGlow: '0 0 30px #a855f7, 0 0 60px #4c1d95',
    basePrice: 25000,
    icon: '🖤'
  },
  {
    id: 'aura_god',
    name: 'Аура: Божественное Сияние',
    type: 'aura',
    rarity: 'divine',
    desc: 'Ослепительный золотой нимб высшего божества сервера.',
    cssGlow: '0 0 40px #ffd700, 0 0 80px #fff7aa',
    basePrice: 200000,
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
    basePrice: 800,
    icon: '🖼️'
  },
  {
    id: 'frame_dragon',
    name: 'Рамка: Драконья Чешуя',
    type: 'frame',
    rarity: 'epic',
    desc: 'Рамка с шипами и рубиновыми кристаллами.',
    borderColor: '#ef4444',
    basePrice: 4000,
    icon: '🐉'
  },
  {
    id: 'frame_cosmic',
    name: 'Рамка: Квантовый Разлом',
    type: 'frame',
    rarity: 'mythic',
    desc: 'Анимированная радужная рамка высшего ранга.',
    borderColor: '#ec4899',
    basePrice: 50000,
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
    basePrice: 500,
    icon: '💼'
  },
  {
    id: 'title_warlord',
    name: 'Титул: [Властелин]',
    type: 'title',
    rarity: 'epic',
    tagText: 'ВЛАСТЕЛИН',
    color: '#a855f7',
    basePrice: 3000,
    icon: '⚔️'
  },
  {
    id: 'title_legend',
    name: 'Титул: [Легенда Сервера]',
    type: 'title',
    rarity: 'mythic',
    tagText: 'ЛЕГЕНДА',
    color: '#f59e0b',
    basePrice: 75000,
    icon: '🏆'
  }
];
