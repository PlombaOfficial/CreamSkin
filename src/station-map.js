/**
 * AMONG US // CYBER STATION MAP ENGINE
 * Defines rooms, corridors, collision walls, task consoles, and vent networks.
 */

export const STATION_MAP = {
  width: 2400,
  height: 1600,

  rooms: [
    { id: 'cafeteria', name: 'Столовая', x: 1000, y: 300, w: 450, h: 320, color: '#3a4f66' },
    { id: 'weapons', name: 'Оружейная', x: 1650, y: 250, w: 320, h: 260, color: '#4a3f55' },
    { id: 'navigation', name: 'Навигация', x: 2000, y: 650, w: 280, h: 280, color: '#3a5a55' },
    { id: 'shields', name: 'Щиты', x: 1650, y: 1050, w: 300, h: 260, color: '#554f3a' },
    { id: 'o2', name: 'Кислород (O2)', x: 1500, y: 650, w: 240, h: 200, color: '#3a664a' },
    { id: 'admin', name: 'Управление', x: 1200, y: 750, w: 260, h: 240, color: '#4a4a55' },
    { id: 'storage', name: 'Склад', x: 950, y: 1050, w: 400, h: 320, color: '#444444' },
    { id: 'electrical', name: 'Электрика', x: 600, y: 700, w: 300, h: 260, color: '#554a3a' },
    { id: 'medbay', name: 'Медпункт', x: 650, y: 400, w: 280, h: 220, color: '#3a5566' },
    { id: 'reactor', name: 'Реактор', x: 150, y: 650, w: 280, h: 300, color: '#553a3a' },
    { id: 'upper_engine', name: 'Верхний Двигатель', x: 400, y: 320, w: 240, h: 220, color: '#3a3a44' },
    { id: 'lower_engine', name: 'Нижний Двигатель', x: 400, y: 1050, w: 240, h: 220, color: '#3a3a44' }
  ],

  corridors: [
    { x: 700, y: 350, w: 350, h: 80 },
    { x: 1400, y: 350, w: 300, h: 80 },
    { x: 1800, y: 450, w: 100, h: 250 },
    { x: 1800, y: 850, w: 100, h: 250 },
    { x: 1300, y: 600, w: 80, h: 200 },
    { x: 1100, y: 600, w: 80, h: 500 },
    { x: 1300, y: 950, w: 80, h: 150 },
    { x: 850, y: 800, w: 150, h: 80 },
    { x: 400, y: 500, w: 80, h: 600 },
    { x: 250, y: 750, w: 200, h: 80 }
  ],

  emergencyTable: { x: 1225, y: 460, radius: 45 },

  vents: [
    { id: 'v_cafeteria', room: 'cafeteria', x: 1400, y: 330, connectsTo: ['v_admin'] },
    { id: 'v_admin', room: 'admin', x: 1240, y: 780, connectsTo: ['v_cafeteria'] },
    { id: 'v_electrical', room: 'electrical', x: 640, y: 730, connectsTo: ['v_medbay'] },
    { id: 'v_medbay', room: 'medbay', x: 680, y: 430, connectsTo: ['v_electrical'] },
    { id: 'v_weapons', room: 'weapons', x: 1900, y: 280, connectsTo: ['v_navigation', 'v_shields'] },
    { id: 'v_navigation', room: 'navigation', x: 2220, y: 680, connectsTo: ['v_weapons', 'v_shields'] },
    { id: 'v_shields', room: 'shields', x: 1900, y: 1250, connectsTo: ['v_weapons', 'v_navigation'] },
    { id: 'v_reactor', room: 'reactor', x: 200, y: 680, connectsTo: ['v_upper_engine', 'v_lower_engine'] },
    { id: 'v_upper_engine', room: 'upper_engine', x: 440, y: 350, connectsTo: ['v_reactor'] },
    { id: 'v_lower_engine', room: 'lower_engine', x: 440, y: 1220, connectsTo: ['v_reactor'] }
  ],

  tasks: [
    { id: 'task_wires_elec', type: 'wires', room: 'electrical', name: 'Соединить провода', x: 840, y: 730 },
    { id: 'task_wires_caf', type: 'wires', room: 'cafeteria', name: 'Соединить провода', x: 1040, y: 340 },
    { id: 'task_wires_nav', type: 'wires', room: 'navigation', name: 'Соединить провода', x: 2150, y: 880 },
    { id: 'task_card_admin', type: 'card_swipe', room: 'admin', name: 'Провести картой', x: 1400, y: 880 },
    { id: 'task_asteroids_wep', type: 'asteroids', room: 'weapons', name: 'Уничтожить астероиды', x: 1900, y: 360 },
    { id: 'task_memory_reactor', type: 'reactor_memory', room: 'reactor', name: 'Запустить реактор', x: 200, y: 780 },
    { id: 'task_o2_filter', type: 'o2_filter', room: 'o2', name: 'Очистить фильтр O2', x: 1680, y: 740 },
    { id: 'task_scan_medbay', type: 'scan', room: 'medbay', name: 'Био-сканирование', x: 880, y: 460 }
  ]
};
