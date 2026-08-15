/**
 * NEO-CLICKER ONLINE // LEADERBOARDS, ACHIEVEMENTS & LIVE SERVER EVENTS
 * 4 Leaderboard ranks, achievement badges, Golden Meteors, x5 Rush Hour, and World Boss raids.
 */

export const ACHIEVEMENTS_LIST = [
  { id: 'first_click', name: 'Первый Кибер-Импульс', desc: 'Сделайте ваш самый первый клик.', icon: '👆', reward: 50 },
  { id: 'click_100', name: 'Мастер Мышки', desc: 'Совершите 100 кликов.', icon: '🖱️', reward: 250 },
  { id: 'click_1000', name: 'Нейронный Автоклик', desc: 'Совершите 1,000 кликов.', icon: '⚡', reward: 1500 },
  { id: 'coins_10k', name: 'Первый Капитал', desc: 'Заработайте 10,000 Нео-Коинов.', icon: '💰', reward: 1000 },
  { id: 'coins_1m', name: 'Крипто-Миллионер', desc: 'Заработайте 1,000,000 Нео-Коинов.', icon: '💎', reward: 25000 },
  { id: 'first_clan', name: 'Братство Синдиката', desc: 'Вступите в клан или создайте свой.', icon: '🛡️', reward: 500 },
  { id: 'prestige_1', name: 'Квантовое Перерождение', desc: 'Совершите 1-й Престиж.', icon: '🔮', reward: 5000 },
  { id: 'market_trader', name: 'Акула Рынка', desc: 'Купите или продайте предмет на рынке.', icon: '🏪', reward: 800 }
];

export class LeaderboardAndEventsEngine {
  constructor(onEventTriggerCallback) {
    this.onEventTrigger = onEventTriggerCallback;
    this.activeEvent = null; // null | { type: 'rush_hour' | 'meteor' | 'world_boss', duration: number, ... }
    this.bossHP = 0;
    this.bossMaxHP = 25000;

    this.simulatedLeaderboard = [
      { name: 'Alex_Pro', clan: 'CYBER', coins: 14500000, clicks: 42500, prestige: 5, title: 'МАГНАТ' },
      { name: 'FlameMaster', clan: 'FIRE', coins: 9800000, clicks: 38200, prestige: 4, title: 'ВЛАСТЕЛИН' },
      { name: 'SunGoddess', clan: 'FIRE', coins: 6200000, clicks: 29400, prestige: 3, title: 'ЛЕГЕНДА' },
      { name: 'Matrix_King', clan: 'CYBER', coins: 4100000, clicks: 21000, prestige: 2, title: null },
      { name: 'ByteHunter', clan: 'WOLF', coins: 1850000, clicks: 14200, prestige: 1, title: null }
    ];

    this.startEventTimer();
  }

  getRankings(category = 'coins', localPlayer) {
    const list = [...this.simulatedLeaderboard];

    // Include local player
    if (localPlayer) {
      list.push({
        name: localPlayer.name + ' (Вы)',
        clan: localPlayer.clanTag || null,
        coins: localPlayer.neoCoins,
        clicks: localPlayer.totalClicks,
        prestige: localPlayer.prestigeLevel,
        title: localPlayer.equippedTitle || null,
        isLocal: true
      });
    }

    if (category === 'coins') {
      list.sort((a, b) => b.coins - a.coins);
    } else if (category === 'clicks') {
      list.sort((a, b) => b.clicks - a.clicks);
    } else if (category === 'prestige') {
      list.sort((a, b) => b.prestige - a.prestige);
    }

    return list.slice(0, 10);
  }

  // --- SERVER EVENTS CYCLE ---

  startEventTimer() {
    // Check for random server event every 35 seconds
    setInterval(() => {
      if (this.activeEvent) return;

      const roll = Math.random();
      if (roll < 0.35) {
        this.triggerRushHourEvent();
      } else if (roll < 0.70) {
        this.triggerMeteorDrop();
      } else {
        this.triggerWorldBossEvent();
      }
    }, 38000);
  }

  triggerRushHourEvent() {
    this.activeEvent = {
      type: 'rush_hour',
      title: '⚡ СЕРВЕРНЫЙ ЧАС ПИК (x5 Клик на 45 сек)!',
      multiplier: 5,
      timeRemaining: 45
    };
    if (this.onEventTrigger) this.onEventTrigger('start', this.activeEvent);

    const timer = setInterval(() => {
      if (!this.activeEvent || this.activeEvent.type !== 'rush_hour') {
        clearInterval(timer);
        return;
      }
      this.activeEvent.timeRemaining--;
      if (this.activeEvent.timeRemaining <= 0) {
        clearInterval(timer);
        if (this.onEventTrigger) this.onEventTrigger('end', this.activeEvent);
        this.activeEvent = null;
      }
    }, 1000);
  }

  triggerMeteorDrop() {
    this.activeEvent = {
      type: 'meteor',
      title: '☄️ ЗОЛОТОЙ МЕТЕОР УПАЛ НА СЕРВЕР!',
      reward: 5000 + Math.round(Math.random() * 15000)
    };
    if (this.onEventTrigger) this.onEventTrigger('meteor', this.activeEvent);
  }

  triggerWorldBossEvent() {
    this.bossMaxHP = 25000;
    this.bossHP = this.bossMaxHP;
    this.activeEvent = {
      type: 'world_boss',
      title: '👾 МИРОВОЙ КИБЕР-БОСС "МЕХА-ТИРАН"',
      hp: this.bossHP,
      maxHp: this.bossMaxHP
    };
    if (this.onEventTrigger) this.onEventTrigger('boss_spawn', this.activeEvent);
  }

  damageBoss(amount) {
    if (!this.activeEvent || this.activeEvent.type !== 'world_boss') return null;
    this.bossHP -= amount;
    this.activeEvent.hp = this.bossHP;

    if (this.bossHP <= 0) {
      const reward = 30000;
      this.activeEvent = null;
      if (this.onEventTrigger) this.onEventTrigger('boss_defeat', { reward });
      return { defeated: true, reward };
    }
    return { defeated: false, hp: this.bossHP };
  }
}
