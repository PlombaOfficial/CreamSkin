/**
 * NEO-CLICKER ONLINE // DYNAMIC 30-PLAYER LEADERBOARD & PVP DUEL ENGINE
 * 30 active simulated players dynamically mining coins and climbing ranks.
 * Live takeover alerts, Golden Meteors, x5 Rush Hour, and PvP Click Duels!
 */

export class LeaderboardAndEventsEngine {
  constructor(onEventTriggerCallback) {
    this.onEventTrigger = onEventTriggerCallback;
    this.activeEvent = null;
    this.bossHP = 0;
    this.bossMaxHP = 35000;

    // 30 Dynamic Server Players
    this.leaderboardPool = [
      { name: 'Crypto_Whale', clan: 'CYBER', coins: 94000000, clicks: 125000, prestige: 8, title: 'МАГНАТ', rate: 25000 },
      { name: 'Alex_Pro', clan: 'CYBER', coins: 48000000, clicks: 92000, prestige: 6, title: 'МАГНАТ', rate: 12000 },
      { name: 'FlameMaster', clan: 'FIRE', coins: 31000000, clicks: 84000, prestige: 5, title: 'ВЛАСТЕЛИН', rate: 8500 },
      { name: 'SunGoddess', clan: 'FIRE', coins: 21000000, clicks: 68000, prestige: 4, title: 'ЛЕГЕНДА', rate: 5200 },
      { name: 'Neon_Waifu', clan: 'FIRE', coins: 16000000, clicks: 54000, prestige: 4, title: 'ЛЕГЕНДА', rate: 4100 },
      { name: 'Viper_Zero', clan: 'WOLF', coins: 13500000, clicks: 46000, prestige: 3, title: 'МАГНАТ', rate: 3200 },
      { name: 'Toxic_Gamer', clan: 'CYBER', coins: 9200000, clicks: 39000, prestige: 3, title: null, rate: 2100 },
      { name: 'Matrix_King', clan: 'CYBER', coins: 6800000, clicks: 31000, prestige: 2, title: null, rate: 1400 },
      { name: 'NoobSlayer_99', clan: 'WOLF', coins: 4500000, clicks: 24000, prestige: 2, title: null, rate: 950 },
      { name: 'ByteHunter', clan: 'WOLF', coins: 3600000, clicks: 19000, prestige: 1, title: null, rate: 750 },
      { name: 'Shadow_Ninja', clan: 'WOLF', coins: 2800000, clicks: 16000, prestige: 1, title: null, rate: 550 },
      { name: 'Quantum_Dev', clan: 'CYBER', coins: 2100000, clicks: 13000, prestige: 1, title: 'МАГНАТ', rate: 420 },
      { name: 'Cyber_Fox', clan: 'FIRE', coins: 1500000, clicks: 9500, prestige: 1, title: null, rate: 310 },
      { name: 'Glitch_Runner', clan: null, coins: 980000, clicks: 7200, prestige: 0, title: null, rate: 180 },
      { name: 'Pixel_Lord', clan: null, coins: 620000, clicks: 5100, prestige: 0, title: null, rate: 110 },
      { name: 'NeoMiner_01', clan: null, coins: 350000, clicks: 3200, prestige: 0, title: null, rate: 65 },
      { name: 'Kvant_Master', clan: null, coins: 180000, clicks: 1900, prestige: 0, title: null, rate: 35 },
      { name: 'Zero_One', clan: null, coins: 95000, clicks: 1100, prestige: 0, title: null, rate: 18 },
      { name: 'SpeedClicker', clan: null, coins: 45000, clicks: 650, prestige: 0, title: null, rate: 8 },
      { name: 'Novice_Bot', clan: null, coins: 15000, clicks: 250, prestige: 0, title: null, rate: 3 }
    ];

    this.startDynamicSimulation();
    this.startEventTimer();
  }

  startDynamicSimulation() {
    // Dynamic background tick: bots earn coins and increase clicks
    setInterval(() => {
      this.leaderboardPool.forEach(p => {
        p.coins += p.rate;
        p.clicks += Math.floor(Math.random() * 3);
      });
    }, 2000);
  }

  getRankings(category = 'coins', localPlayer) {
    const list = this.leaderboardPool.map(p => ({ ...p }));

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

    return list;
  }

  // --- SERVER EVENTS CYCLE ---

  startEventTimer() {
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
    }, 35000);
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
      reward: 15000 + Math.round(Math.random() * 35000)
    };
    if (this.onEventTrigger) this.onEventTrigger('meteor', this.activeEvent);
  }

  triggerWorldBossEvent() {
    this.bossMaxHP = 35000;
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
      const reward = 50000;
      this.activeEvent = null;
      if (this.onEventTrigger) this.onEventTrigger('boss_defeat', { reward });
      return { defeated: true, reward };
    }
    return { defeated: false, hp: this.bossHP };
  }
}
