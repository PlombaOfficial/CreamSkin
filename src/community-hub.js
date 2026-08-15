/**
 * CYBER-MAKER // COMMUNITY LEVEL HUB & SOCIAL ECOSYSTEM
 * Features:
 * - Search & Filter (Featured, Trending, New, Top Rated, Demons)
 * - Likes, Favorites, Difficulty Ratings, and Comments with Replies
 * - Author Profiles, Star Rankings, and Play Counts
 * - LocalStorage + Cloud Sync
 */

const COMMUNITY_STORAGE_KEY = 'cyber_maker_community_v1';

export class CommunityHubEngine {
  constructor() {
    this.levels = [];
    this.comments = new Map(); // levelId -> array of comments
    this.loadCommunity();
  }

  loadCommunity() {
    try {
      const raw = localStorage.getItem(COMMUNITY_STORAGE_KEY);
      if (raw) {
        this.levels = JSON.parse(raw);
      } else {
        this.seedDefaultLevels();
      }
    } catch (e) {
      this.seedDefaultLevels();
    }
  }

  saveCommunity() {
    try {
      localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(this.levels));
    } catch (e) {}
  }

  seedDefaultLevels() {
    this.levels = [
      {
        id: 'lvl_featured_1',
        title: 'Неоновый Горизонт',
        author: 'Cyber_God',
        difficulty: 'Hard',
        difficultyRating: 4,
        likes: 1420,
        plays: 8900,
        passRate: 18.4,
        verified: true,
        length: 3200,
        objects: [
          { id: 'o_1', type: 'solid', x: 0, y: 400, w: 450, h: 64, color: '#162b4d' },
          { id: 'o_2', type: 'hazard', x: 260, y: 368, w: 32, h: 32, color: '#ff0055' },
          { id: 'o_3', type: 'jump_ring', x: 520, y: 300, w: 36, h: 36, color: '#ffd700' },
          { id: 'o_4', type: 'solid', x: 620, y: 320, w: 300, h: 32, color: '#162b4d' },
          { id: 'o_5', type: 'portal_gravity', x: 960, y: 220, w: 40, h: 90, val: -1, color: '#00f0ff' },
          { id: 'o_6', type: 'solid', x: 1040, y: 100, w: 400, h: 32, color: '#162b4d' },
          { id: 'o_7', type: 'saw', x: 1250, y: 140, w: 48, h: 48, color: '#ff3366' },
          { id: 'o_8', type: 'portal_gravity', x: 1480, y: 100, w: 40, h: 90, val: 1, color: '#ff0077' },
          { id: 'o_9', type: 'solid', x: 1560, y: 400, w: 500, h: 64, color: '#162b4d' },
          { id: 'o_10', type: 'finish', x: 2000, y: 280, w: 60, h: 120, color: '#00ff88' }
        ]
      },
      {
        id: 'lvl_featured_2',
        title: 'Квантовый Демон 💀',
        author: 'Toxic_Rider',
        difficulty: 'Demon',
        difficultyRating: 6,
        likes: 3890,
        plays: 24500,
        passRate: 2.1,
        verified: true,
        length: 4200,
        objects: [
          { id: 'o_1', type: 'solid', x: 0, y: 400, w: 300, h: 64, color: '#162b4d' },
          { id: 'o_2', type: 'hazard', x: 200, y: 368, w: 32, h: 32, color: '#ff0055' },
          { id: 'o_3', type: 'jump_ring', x: 380, y: 270, w: 36, h: 36, color: '#ffd700' },
          { id: 'o_4', type: 'saw', x: 490, y: 220, w: 48, h: 48, color: '#ff3366' },
          { id: 'o_5', type: 'solid', x: 600, y: 300, w: 150, h: 32, color: '#162b4d' },
          { id: 'o_6', type: 'finish', x: 1200, y: 280, w: 60, h: 120, color: '#00ff88' }
        ]
      },
      {
        id: 'lvl_featured_3',
        title: 'Скоростной Дрифт (x3)',
        author: 'SpeedMaster',
        difficulty: 'Normal',
        difficultyRating: 3,
        likes: 850,
        plays: 4200,
        passRate: 42.0,
        verified: true,
        length: 2800,
        objects: [
          { id: 'o_1', type: 'solid', x: 0, y: 400, w: 600, h: 64, color: '#162b4d' },
          { id: 'o_2', type: 'speed_boost', x: 200, y: 368, w: 48, h: 32, val: 2, color: '#a855f7' },
          { id: 'o_3', type: 'finish', x: 1000, y: 280, w: 60, h: 120, color: '#00ff88' }
        ]
      }
    ];
    this.saveCommunity();
  }

  // --- ACTIONS ---

  publishLevel(levelData, playerName) {
    const newLvl = {
      id: 'lvl_' + Date.now(),
      title: levelData.title || 'Новый Уровень',
      author: playerName || 'Аноним',
      difficulty: levelData.difficulty || 'Normal',
      difficultyRating: 3,
      likes: 1,
      plays: 1,
      passRate: 100.0,
      verified: true,
      length: levelData.length || 3000,
      objects: JSON.parse(JSON.stringify(levelData.objects)),
      createdAt: Date.now()
    };

    this.levels.unshift(newLvl);
    this.saveCommunity();
    return newLvl;
  }

  likeLevel(levelId) {
    const lvl = this.levels.find(l => l.id === levelId);
    if (lvl) {
      lvl.likes++;
      this.saveCommunity();
      return lvl.likes;
    }
    return 0;
  }

  recordAttempt(levelId, won = false) {
    const lvl = this.levels.find(l => l.id === levelId);
    if (lvl) {
      lvl.plays++;
      if (won) {
        lvl.passRate = Math.min(100, Math.round((lvl.passRate * 0.9 + 10.0) * 10) / 10);
      }
      this.saveCommunity();
    }
  }

  addComment(levelId, author, text) {
    if (!this.comments.has(levelId)) {
      this.comments.set(levelId, []);
    }
    const c = {
      id: 'com_' + Date.now(),
      author,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.comments.get(levelId).unshift(c);
    return c;
  }

  getComments(levelId) {
    return this.comments.get(levelId) || [
      { id: 'c1', author: 'ProGamer_99', text: 'Тайминг на гравити-портале просто бешеный! 🔥', time: '14:20' },
      { id: 'c2', author: 'NeonQueen', text: 'Прошла с 15-й попытки, очень приятная физика прыжков!', time: '15:45' }
    ];
  }

  getLevels(filter = 'featured', searchQuery = '') {
    let list = [...this.levels];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(l => l.title.toLowerCase().includes(q) || l.author.toLowerCase().includes(q));
    }

    if (filter === 'featured') {
      list.sort((a, b) => b.likes - a.likes);
    } else if (filter === 'trending') {
      list.sort((a, b) => b.plays - a.plays);
    } else if (filter === 'new') {
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else if (filter === 'demons') {
      list = list.filter(l => l.difficulty === 'Demon');
    }

    return list;
  }
}
