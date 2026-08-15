/**
 * AMONG US // CYBER STATION MAP WITH STRICT WALL COLLISIONS
 * Defines rooms, strict walkable corridors, solid impenetrable walls,
 * task stations, and vents.
 */

export const STATION_MAP = {
  width: 2000,
  height: 1400,

  // Walkable Rooms (X, Y, W, H, Color, Name)
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

  // Walkable Corridors connecting the rooms
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

  vents: [
    { id: 'v1', x: 1160, y: 200, room: 'cafeteria', connectsTo: ['v2'] },
    { id: 'v2', x: 1000, y: 620, room: 'admin', connectsTo: ['v1'] },
    { id: 'v3', x: 490, y: 590, room: 'electrical', connectsTo: ['v4'] },
    { id: 'v4', x: 520, y: 290, room: 'medbay', connectsTo: ['v3'] },
    { id: 'v5', x: 1540, y: 170, room: 'weapons', connectsTo: ['v6', 'v7'] },
    { id: 'v6', x: 1800, y: 540, room: 'navigation', connectsTo: ['v5', 'v7'] },
    { id: 'v7', x: 1540, y: 1000, room: 'shields', connectsTo: ['v5', 'v6'] }
  ],

  // Interactive Task Stations with Big Visible Markers
  tasks: [
    { id: 't_wires_elec', type: 'wires', name: 'Соединить провода', room: 'electrical', x: 620, y: 590 },
    { id: 't_wires_caf', type: 'wires', name: 'Соединить провода', room: 'cafeteria', x: 840, y: 200 },
    { id: 't_wires_nav', type: 'wires', name: 'Соединить провода', room: 'navigation', x: 1820, y: 680 },
    { id: 't_card_admin', type: 'card_swipe', name: 'Провести картой', room: 'admin', x: 1110, y: 720 },
    { id: 't_asteroids_wep', type: 'asteroids', name: 'Стрельба по астероидам', room: 'weapons', x: 1550, y: 220 },
    { id: 't_memory_reactor', type: 'reactor_memory', name: 'Запуск реактора', room: 'reactor', x: 160, y: 620 },
    { id: 't_o2_filter', type: 'o2_filter', name: 'Очистить фильтр O2', room: 'o2', x: 1390, y: 560 }
  ],

  // Strict Collision Check: Is (x, y) inside ANY walkable room or corridor?
  isWalkable(x, y, radius = 18) {
    // Check inside any room
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

    // Check inside any corridor
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
