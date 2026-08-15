/**
 * AMONG US // CYBER STATION MAP WITH WAYPOINT NAVIGATION GRAPH & STRICT COLLISIONS
 */

export const STATION_MAP = {
  width: 2000,
  height: 1400,

  // Walkable Rooms
  rooms: [
    { id: 'cafeteria', name: 'СТОЛОВАЯ', x: 800, y: 150, w: 400, h: 280, color: '#1e2b3d' },
    { id: 'weapons', name: 'ОРУЖЕЙНАЯ', x: 1350, y: 120, w: 260, h: 220, color: '#2d2238' },
    { id: 'navigation', name: 'НАВИГАЦИЯ', x: 1650, y: 500, w: 240, h: 240, color: '#1d3330' },
    { id: 'o2', name: 'КИСЛОРОД (O2)', x: 1250, y: 480, w: 200, h: 180, color: '#1e382b' },
    { id: 'shields', name: 'ЩИТЫ', x: 1350, y: 850, w: 260, h: 220, color: '#332b1e' },
    { id: 'admin', name: 'УПРАВЛЕНИЕ', x: 950, y: 580, w: 220, h: 200, color: '#2b2b38' },
    { id: 'storage', name: 'СКЛАД', x: 750, y: 850, w: 350, h: 280, color: '#262626' },
    { id: 'electrical', name: 'ЭЛЕКТРИКА', x: 450, y: 550, w: 240, h: 220, color: '#332b1e' },
    { id: 'medbay', name: 'МЕДПУНКТ', x: 480, y: 250, w: 220, h: 180, color: '#1e303d' },
    { id: 'reactor', name: 'РЕАКТОР', x: 100, y: 500, w: 240, h: 260, color: '#331e1e' },
    { id: 'upper_engine', name: 'ВЕРХНИЙ ДВИГАТЕЛЬ', x: 280, y: 200, w: 200, h: 180, color: '#22222b' },
    { id: 'lower_engine', name: 'НИЖНИЙ ДВИГАТЕЛЬ', x: 280, y: 850, w: 200, h: 180, color: '#22222b' }
  ],

  // Walkable Corridors
  corridors: [
    { x: 680, y: 250, w: 140, h: 80 },   // Medbay -> Cafeteria
    { x: 1180, y: 250, w: 190, h: 80 },  // Cafeteria -> Weapons
    { x: 1450, y: 320, w: 80, h: 200 },  // Weapons -> O2
    { x: 1430, y: 550, w: 240, h: 80 },  // O2 -> Navigation
    { x: 1450, y: 640, w: 80, h: 230 },  // O2 -> Shields
    { x: 1080, y: 760, w: 80, h: 110 },  // Admin -> Storage
    { x: 880, y: 410, w: 80, h: 200 },   // Cafeteria -> Admin
    { x: 670, y: 620, w: 300, h: 80 },   // Electrical -> Admin
    { x: 320, y: 590, w: 150, h: 80 },   // Reactor -> Electrical
    { x: 180, y: 360, w: 80, h: 160 },   // Upper Engine -> Reactor
    { x: 180, y: 740, w: 80, h: 130 },   // Lower Engine -> Reactor
    { x: 460, y: 880, w: 310, h: 80 }    // Lower Engine -> Storage
  ],

  emergencyTable: { x: 1000, y: 290, radius: 45 },

  // Waypoint Navigation Network for 100% Smooth Bot Pathfinding (NO WALL BUMPING)
  waypoints: [
    { id: 'wp_cafeteria', x: 1000, y: 290, links: ['wp_caf_left', 'wp_caf_right', 'wp_caf_bottom'] },
    { id: 'wp_caf_left', x: 750, y: 290, links: ['wp_cafeteria', 'wp_medbay'] },
    { id: 'wp_caf_right', x: 1250, y: 290, links: ['wp_cafeteria', 'wp_weapons'] },
    { id: 'wp_caf_bottom', x: 920, y: 500, links: ['wp_cafeteria', 'wp_admin'] },

    { id: 'wp_medbay', x: 590, y: 340, links: ['wp_caf_left', 'wp_upper_engine'] },
    { id: 'wp_upper_engine', x: 380, y: 290, links: ['wp_medbay', 'wp_reactor_top'] },
    { id: 'wp_reactor_top', x: 220, y: 450, links: ['wp_upper_engine', 'wp_reactor'] },
    { id: 'wp_reactor', x: 220, y: 630, links: ['wp_reactor_top', 'wp_reactor_bot', 'wp_electrical'] },
    { id: 'wp_reactor_bot', x: 220, y: 800, links: ['wp_reactor', 'wp_lower_engine'] },
    { id: 'wp_lower_engine', x: 380, y: 940, links: ['wp_reactor_bot', 'wp_storage_left'] },

    { id: 'wp_electrical', x: 570, y: 630, links: ['wp_reactor', 'wp_admin_left'] },
    { id: 'wp_admin_left', x: 800, y: 660, links: ['wp_electrical', 'wp_admin'] },
    { id: 'wp_admin', x: 1060, y: 680, links: ['wp_caf_bottom', 'wp_admin_left', 'wp_admin_bottom'] },
    { id: 'wp_admin_bottom', x: 1120, y: 820, links: ['wp_admin', 'wp_storage'] },

    { id: 'wp_storage_left', x: 600, y: 920, links: ['wp_lower_engine', 'wp_storage'] },
    { id: 'wp_storage', x: 920, y: 990, links: ['wp_storage_left', 'wp_admin_bottom'] },

    { id: 'wp_weapons', x: 1480, y: 230, links: ['wp_caf_right', 'wp_o2_top'] },
    { id: 'wp_o2_top', x: 1490, y: 420, links: ['wp_weapons', 'wp_o2'] },
    { id: 'wp_o2', x: 1350, y: 570, links: ['wp_o2_top', 'wp_nav_corridor', 'wp_shields_corridor'] },
    { id: 'wp_nav_corridor', x: 1550, y: 590, links: ['wp_o2', 'wp_navigation'] },
    { id: 'wp_navigation', x: 1770, y: 620, links: ['wp_nav_corridor'] },
    { id: 'wp_shields_corridor', x: 1490, y: 750, links: ['wp_o2', 'wp_shields'] },
    { id: 'wp_shields', x: 1480, y: 960, links: ['wp_shields_corridor'] }
  ],

  vents: [
    { id: 'v1', x: 1160, y: 200, room: 'cafeteria', connectsTo: ['v2'] },
    { id: 'v2', x: 1000, y: 620, room: 'admin', connectsTo: ['v1'] },
    { id: 'v3', x: 490, y: 590, room: 'electrical', connectsTo: ['v4'] },
    { id: 'v4', x: 520, y: 290, room: 'medbay', connectsTo: ['v3'] },
    { id: 'v5', x: 1540, y: 170, room: 'weapons', connectsTo: ['v6', 'v7'] },
    { id: 'v6', x: 1800, y: 540, room: 'navigation', connectsTo: ['v5', 'v7'] },
    { id: 'v7', x: 1540, y: 1000, room: 'shields', connectsTo: ['v5', 'v6'] }
  ],

  tasks: [
    { id: 't_wires_elec', type: 'wires', name: 'Соединить провода', room: 'electrical', x: 620, y: 590 },
    { id: 't_wires_caf', type: 'wires', name: 'Соединить провода', room: 'cafeteria', x: 840, y: 200 },
    { id: 't_wires_nav', type: 'wires', name: 'Соединить провода', room: 'navigation', x: 1820, y: 680 },
    { id: 't_card_admin', type: 'card_swipe', name: 'Провести картой', room: 'admin', x: 1110, y: 720 },
    { id: 't_asteroids_wep', type: 'asteroids', name: 'Стрельба по астероидам', room: 'weapons', x: 1550, y: 220 },
    { id: 't_memory_reactor', type: 'reactor_memory', name: 'Запуск реактора', room: 'reactor', x: 160, y: 620 },
    { id: 't_o2_filter', type: 'o2_filter', name: 'Очистить фильтр O2', room: 'o2', x: 1390, y: 560 }
  ],

  isWalkable(x, y, radius = 16) {
    for (let i = 0; i < this.rooms.length; i++) {
      const r = this.rooms[i];
      if (
        x - radius >= r.x &&
        x + radius <= r.x + r.w &&
        y - radius >= r.y &&
        y + radius <= r.y + r.h
      ) {
        return true;
      }
    }

    for (let i = 0; i < this.corridors.length; i++) {
      const c = this.corridors[i];
      if (
        x - radius >= c.x &&
        x + radius <= c.x + c.w &&
        y - radius >= c.y &&
        y + radius <= c.y + c.h
      ) {
        return true;
      }
    }

    return false;
  }
};
