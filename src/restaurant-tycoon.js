/**
 * 3D PIZZERIA SIMULATOR // TYCOON & RESTAURANT UPGRADE ECONOMY
 * Manages money, daily shifts, restaurant reputation stars, and kitchen equipment upgrades.
 */

export class RestaurantTycoon {
  constructor() {
    this.money = 50;
    this.rating = 4.8;
    this.totalPizzasServed = 0;
    this.currentDay = 1;
    this.dayTimeRemaining = 120; // 2 minutes per day shift
    this.isShiftActive = true;

    // Upgrades unlocked
    this.upgrades = {
      turbo_oven: false,       // Oven bakes 40% faster
      golden_tables: false,    // Increases table customer tips
      jukebox: false,          // Increases customer patience
      arcade_machine: false,   // Attracts rich customers
      neon_sign: false         // Unlocks VIP Mafia & Food Critics
    };

    this.UPGRADE_CATALOG = [
      {
        id: 'turbo_oven',
        name: '🔥 Турбо-Печь "Вулкан"',
        cost: 120,
        desc: 'Выпекает пиццу на 40% быстрее (5 сек вместо 8 сек).'
      },
      {
        id: 'jukebox',
        name: '🎵 Музыкальный Автомат',
        cost: 150,
        desc: 'Приятная итальянская музыка увеличивает терпение гостей на 20 сек.'
      },
      {
        id: 'golden_tables',
        name: '🛋 Мягкие Диваны и Столы',
        cost: 200,
        desc: 'Уютный зал повышает чаевые гостей на +30%.'
      },
      {
        id: 'arcade_machine',
        name: '🕹 Ретро-Автомат "Pac-Pizza"',
        cost: 280,
        desc: 'Привлекает геймеров и студентов с крупными заказами.'
      },
      {
        id: 'neon_sign',
        name: '✨ Неоновая Вывеска "ITALIA"',
        cost: 350,
        desc: 'Привлекает VIP-критиков, блогеров и боссов мафии.'
      }
    ];

    this.loadData();
  }

  loadData() {
    try {
      const saved = localStorage.getItem('3d_pizzeria_save');
      if (saved) {
        const d = JSON.parse(saved);
        this.money = d.money || 50;
        this.rating = d.rating || 4.8;
        this.currentDay = d.currentDay || 1;
        this.upgrades = Object.assign(this.upgrades, d.upgrades || {});
      }
    } catch (e) {}
  }

  saveData() {
    try {
      const d = {
        money: this.money,
        rating: this.rating,
        currentDay: this.currentDay,
        upgrades: this.upgrades
      };
      localStorage.setItem('3d_pizzeria_save', JSON.stringify(d));
    } catch (e) {}
  }

  addEarnings(amount, stars) {
    this.money += amount;
    this.totalPizzasServed++;
    // Weighted rating adjustment
    this.rating = Math.max(1.0, Math.min(5.0, ((this.rating * 9 + stars) / 10).toFixed(1)));
    this.saveData();
  }

  buyUpgrade(id) {
    const item = this.UPGRADE_CATALOG.find(u => u.id === id);
    if (!item) return false;
    if (this.upgrades[id]) return false;
    if (this.money < item.cost) return false;

    this.money -= item.cost;
    this.upgrades[id] = true;
    this.saveData();
    return true;
  }
}
