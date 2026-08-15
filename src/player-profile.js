/**
 * CYBER-MAKER // PLAYER PROFILE, CUSTOMIZATION & ACHIEVEMENTS ENGINE
 */

const PROFILE_STORAGE_KEY = 'cyber_maker_profile_v1';

export class PlayerProfileEngine {
  constructor() {
    this.name = 'Cyber_Player#' + Math.floor(1000 + Math.random() * 9000);
    this.stars = 45;
    this.demonsBeaten = 2;
    this.levelsCompleted = 8;
    this.totalAttempts = 142;
    this.likesReceived = 64;

    // Customization
    this.skinColor = '#00f0ff';
    this.secondaryColor = '#ff0077';
    this.trailType = 'echo';

    this.achievements = [
      { id: 'ach_1', name: '⚡ Первый Прыжок', desc: 'Совершите свой первый прыжок в игре', unlocked: true },
      { id: 'ach_2', name: '💨 Мастер Рывка', desc: 'Используйте Air Dash 50 раз', unlocked: true },
      { id: 'ach_3', name: '💀 Убийца Демонов', desc: 'Пройдите уровень сложности Demon', unlocked: true },
      { id: 'ach_4', name: '🛠️ Архитектор', desc: 'Создайте и верифицируйте уровень в редакторе', unlocked: false },
      { id: 'ach_5', name: '🌟 Звездный Автор', desc: 'Получите 100 лайков на созданных уровнях', unlocked: false }
    ];

    this.loadProfile();
  }

  loadProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        Object.assign(this, d);
      }
    } catch (e) {}
  }

  saveProfile() {
    try {
      const data = {
        name: this.name,
        stars: this.stars,
        demonsBeaten: this.demonsBeaten,
        levelsCompleted: this.levelsCompleted,
        totalAttempts: this.totalAttempts,
        likesReceived: this.likesReceived,
        skinColor: this.skinColor,
        secondaryColor: this.secondaryColor,
        trailType: this.trailType,
        achievements: this.achievements
      };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  recordLevelWin(difficulty) {
    this.levelsCompleted++;
    this.stars += (difficulty === 'Demon' ? 10 : (difficulty === 'Hard' ? 5 : 2));
    if (difficulty === 'Demon') this.demonsBeaten++;
    this.saveProfile();
  }
}
