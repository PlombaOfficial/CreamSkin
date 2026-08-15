/**
 * 2D MINECRAFT // COMPLETE ITEM, BLOCK & RECIPE REGISTRY (WITH NETHER & PORTALS)
 */

export const BLOCKS = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  COBBLESTONE: 4,
  OAK_LOG: 5,
  OAK_LEAVES: 6,
  OAK_PLANKS: 7,
  SAND: 8,
  GRAVEL: 9,
  BEDROCK: 10,
  
  // Ores
  COAL_ORE: 11,
  COPPER_ORE: 12,
  IRON_ORE: 13,
  GOLD_ORE: 14,
  REDSTONE_ORE: 15,
  DIAMOND_ORE: 16,
  OBSIDIAN: 17,
  ANCIENT_DEBRIS: 18,
  
  // Stations & Utilities
  CRAFTING_TABLE: 19,
  FURNACE: 20,
  CHEST: 21,
  TORCH: 22,
  LADDER: 23,
  DOOR_WOOD: 24,
  GLASS: 25,
  TNT: 26,
  
  // Liquids
  WATER: 27,
  LAVA: 28,

  // Nether Dimension
  NETHERRACK: 29,
  GLOWSTONE: 30,
  NETHER_PORTAL: 31
};

export const ITEMS = {
  // Resources
  STICK: 101,
  COAL: 102,
  RAW_COPPER: 103,
  COPPER_INGOT: 104,
  RAW_IRON: 105,
  IRON_INGOT: 106,
  RAW_GOLD: 107,
  GOLD_INGOT: 108,
  DIAMOND: 109,
  NETHERITE_SCRAP: 110,
  NETHERITE_INGOT: 111,
  BONE: 112,
  STRING: 113,
  GUNPOWDER: 114,
  ROTTEN_FLESH: 115,
  
  // Food
  APPLE: 201,
  RAW_BEEF: 202,
  COOKED_STEAK: 203,
  BREAD: 204,
  GOLDEN_APPLE: 205,
  
  // Wooden Tools
  WOOD_SWORD: 301,
  WOOD_PICKAXE: 302,
  WOOD_AXE: 303,
  
  // Stone Tools
  STONE_SWORD: 311,
  STONE_PICKAXE: 312,
  STONE_AXE: 313,
  
  // Iron Tools & Armor
  IRON_SWORD: 321,
  IRON_PICKAXE: 322,
  IRON_AXE: 323,
  IRON_HELMET: 325,
  IRON_CHESTPLATE: 326,
  IRON_LEGGINGS: 327,
  IRON_BOOTS: 328,
  BOW: 333,
  ARROW: 334,
  
  // Diamond Tools & Armor
  DIAMOND_SWORD: 341,
  DIAMOND_PICKAXE: 342,
  DIAMOND_AXE: 343,
  DIAMOND_HELMET: 345,
  DIAMOND_CHESTPLATE: 346,
  DIAMOND_LEGGINGS: 347,
  DIAMOND_BOOTS: 348,
  
  // Netherite End-Game Tier
  NETHERITE_SWORD: 351,
  NETHERITE_PICKAXE: 352,
  NETHERITE_ARMOR: 353,
  
  // Boss & Dimension
  EYE_OF_ENDER: 401,
  FLINT_AND_STEEL: 402,
  NETHER_STAR: 403
};

export const ITEM_DATA = {
  [BLOCKS.GRASS]: { name: 'Блок травы', isBlock: true, hardness: 0.6, drop: BLOCKS.DIRT, color: '#5b8c32' },
  [BLOCKS.DIRT]: { name: 'Земля', isBlock: true, hardness: 0.5, drop: BLOCKS.DIRT, color: '#866043' },
  [BLOCKS.STONE]: { name: 'Камень', isBlock: true, hardness: 1.5, drop: BLOCKS.COBBLESTONE, reqTool: 'pickaxe', color: '#737373' },
  [BLOCKS.COBBLESTONE]: { name: 'Булыжник', isBlock: true, hardness: 1.5, drop: BLOCKS.COBBLESTONE, reqTool: 'pickaxe', color: '#5e5e5e' },
  [BLOCKS.OAK_LOG]: { name: 'Дубовое бревно', isBlock: true, hardness: 1.2, drop: BLOCKS.OAK_LOG, color: '#674d2b' },
  [BLOCKS.OAK_LEAVES]: { name: 'Листва', isBlock: true, hardness: 0.2, drop: ITEMS.APPLE, dropChance: 0.15, color: '#35631b' },
  [BLOCKS.OAK_PLANKS]: { name: 'Дубовые доски', isBlock: true, hardness: 1.0, drop: BLOCKS.OAK_PLANKS, color: '#a0784a' },
  [BLOCKS.SAND]: { name: 'Песок', isBlock: true, hardness: 0.5, drop: BLOCKS.SAND, color: '#d9cb91' },
  [BLOCKS.GRAVEL]: { name: 'Гравий', isBlock: true, hardness: 0.6, drop: BLOCKS.GRAVEL, color: '#7a7674' },
  [BLOCKS.BEDROCK]: { name: 'Бедрок', isBlock: true, hardness: Infinity, color: '#111111' },

  // Ores
  [BLOCKS.COAL_ORE]: { name: 'Угольная руда', isBlock: true, hardness: 2.0, drop: ITEMS.COAL, reqTier: 0, color: '#2b2b2b' },
  [BLOCKS.COPPER_ORE]: { name: 'Медная руда', isBlock: true, hardness: 2.5, drop: ITEMS.RAW_COPPER, reqTier: 1, color: '#b86a42' },
  [BLOCKS.IRON_ORE]: { name: 'Железная руда', isBlock: true, hardness: 3.0, drop: ITEMS.RAW_IRON, reqTier: 1, color: '#d8af93' },
  [BLOCKS.GOLD_ORE]: { name: 'Золотая руда', isBlock: true, hardness: 3.0, drop: ITEMS.RAW_GOLD, reqTier: 2, color: '#fcee4b' },
  [BLOCKS.DIAMOND_ORE]: { name: 'Алмазная руда', isBlock: true, hardness: 4.0, drop: ITEMS.DIAMOND, reqTier: 2, color: '#5decf2' },
  [BLOCKS.OBSIDIAN]: { name: 'Обсидиан', isBlock: true, hardness: 8.0, drop: BLOCKS.OBSIDIAN, reqTier: 3, color: '#1a1029' },
  [BLOCKS.ANCIENT_DEBRIS]: { name: 'Древние обломки (Незерит)', isBlock: true, hardness: 9.0, drop: ITEMS.NETHERITE_SCRAP, reqTier: 3, color: '#59443b' },

  // Nether Blocks
  [BLOCKS.NETHERRACK]: { name: 'Незерак (Адский камень)', isBlock: true, hardness: 0.8, drop: BLOCKS.NETHERRACK, color: '#661616' },
  [BLOCKS.GLOWSTONE]: { name: 'Светокамень (Глоустоун)', isBlock: true, hardness: 0.6, drop: BLOCKS.GLOWSTONE, isLight: true, color: '#f0a73a' },
  [BLOCKS.NETHER_PORTAL]: { name: 'Портал в Незер (Ад)', isBlock: true, hardness: 0.1, isPortal: true, color: '#b846ff' },

  // Stations
  [BLOCKS.CRAFTING_TABLE]: { name: 'Верстак (3x3)', isBlock: true, hardness: 1.2, drop: BLOCKS.CRAFTING_TABLE, color: '#b08453' },
  [BLOCKS.FURNACE]: { name: 'Печь', isBlock: true, hardness: 2.0, drop: BLOCKS.FURNACE, color: '#4a4a4a' },
  [BLOCKS.CHEST]: { name: 'Сундук', isBlock: true, hardness: 1.2, drop: BLOCKS.CHEST, color: '#9e6d38' },
  [BLOCKS.TORCH]: { name: 'Факел', isBlock: true, hardness: 0.1, drop: BLOCKS.TORCH, isLight: true, color: '#ffb300' },
  [BLOCKS.LADDER]: { name: 'Лестница', isBlock: true, hardness: 0.3, drop: BLOCKS.LADDER, color: '#9e7344' },
  [BLOCKS.DOOR_WOOD]: { name: 'Дверь', isBlock: true, hardness: 1.0, drop: BLOCKS.DOOR_WOOD, color: '#875d33' },
  [BLOCKS.GLASS]: { name: 'Стекло', isBlock: true, hardness: 0.3, color: '#c2e3f2' },
  [BLOCKS.TNT]: { name: 'Динамит (TNT)', isBlock: true, hardness: 0.1, drop: BLOCKS.TNT, color: '#d92b2b' },

  // Resources
  [ITEMS.STICK]: { name: 'Палка' },
  [ITEMS.COAL]: { name: 'Уголь' },
  [ITEMS.RAW_IRON]: { name: 'Сырое железо' },
  [ITEMS.IRON_INGOT]: { name: 'Железный слиток' },
  [ITEMS.RAW_GOLD]: { name: 'Сырое золото' },
  [ITEMS.GOLD_INGOT]: { name: 'Золотой слиток' },
  [ITEMS.DIAMOND]: { name: 'Алмаз' },
  [ITEMS.NETHERITE_SCRAP]: { name: 'Незеритовый скрап' },
  [ITEMS.NETHERITE_INGOT]: { name: 'Незеритовый слиток' },
  [ITEMS.GUNPOWDER]: { name: 'Порох' },
  [ITEMS.BONE]: { name: 'Кость' },
  [ITEMS.STRING]: { name: 'Нить' },
  [ITEMS.ROTTEN_FLESH]: { name: 'Гнилая плоть' },

  // Food
  [ITEMS.APPLE]: { name: 'Яблоко', food: 4, health: 2 },
  [ITEMS.RAW_BEEF]: { name: 'Сырое мясо', food: 3 },
  [ITEMS.COOKED_STEAK]: { name: 'Жареный стейк', food: 8, health: 6 },
  [ITEMS.BREAD]: { name: 'Хлеб', food: 5, health: 3 },
  [ITEMS.GOLDEN_APPLE]: { name: 'Золотое яблоко (Реген)', food: 10, health: 20 },

  // Weapons & Tools
  [ITEMS.WOOD_SWORD]: { name: 'Деревянный меч', type: 'weapon', damage: 4, speed: 1.0, durability: 60 },
  [ITEMS.WOOD_PICKAXE]: { name: 'Деревянная кирка', type: 'pickaxe', tier: 0, speed: 1.5, durability: 60 },
  [ITEMS.WOOD_AXE]: { name: 'Деревянный топор', type: 'axe', speed: 1.5, durability: 60 },
  [ITEMS.STONE_SWORD]: { name: 'Каменный меч', type: 'weapon', damage: 5.5, speed: 1.1, durability: 132 },
  [ITEMS.STONE_PICKAXE]: { name: 'Каменная кирка', type: 'pickaxe', tier: 1, speed: 2.2, durability: 132 },
  [ITEMS.STONE_AXE]: { name: 'Каменный топор', type: 'axe', speed: 2.2, durability: 132 },
  [ITEMS.IRON_SWORD]: { name: 'Железный меч', type: 'weapon', damage: 7.0, speed: 1.3, durability: 250 },
  [ITEMS.IRON_PICKAXE]: { name: 'Железная кирка', type: 'pickaxe', tier: 2, speed: 3.5, durability: 250 },
  [ITEMS.IRON_AXE]: { name: 'Железный топор', type: 'axe', speed: 3.5, durability: 250 },
  [ITEMS.IRON_HELMET]: { name: 'Железный шлем', type: 'armor', armor: 2, durability: 165 },
  [ITEMS.IRON_CHESTPLATE]: { name: 'Железный нагрудник', type: 'armor', armor: 6, durability: 240 },
  [ITEMS.IRON_LEGGINGS]: { name: 'Железные поножи', type: 'armor', armor: 5, durability: 225 },
  [ITEMS.IRON_BOOTS]: { name: 'Железные ботинки', type: 'armor', armor: 2, durability: 195 },
  [ITEMS.BOW]: { name: 'Лук', type: 'ranged', damage: 8, durability: 384 },
  [ITEMS.ARROW]: { name: 'Стрела' },
  [ITEMS.DIAMOND_SWORD]: { name: 'Алмазный меч', type: 'weapon', damage: 10.0, speed: 1.5, durability: 1561 },
  [ITEMS.DIAMOND_PICKAXE]: { name: 'Алмазная кирка', type: 'pickaxe', tier: 3, speed: 5.5, durability: 1561 },
  [ITEMS.DIAMOND_AXE]: { name: 'Алмазный топор', type: 'axe', speed: 5.5, durability: 1561 },
  [ITEMS.DIAMOND_HELMET]: { name: 'Алмазный шлем', type: 'armor', armor: 3, durability: 363 },
  [ITEMS.DIAMOND_CHESTPLATE]: { name: 'Алмазный нагрудник', type: 'armor', armor: 8, durability: 528 },
  [ITEMS.DIAMOND_LEGGINGS]: { name: 'Алмазные поножи', type: 'armor', armor: 6, durability: 495 },
  [ITEMS.DIAMOND_BOOTS]: { name: 'Алмазные ботинки', type: 'armor', armor: 3, durability: 429 },
  [ITEMS.NETHERITE_SWORD]: { name: 'Незеритовый меч Бога', type: 'weapon', damage: 16.0, speed: 1.8, durability: 3000 },
  [ITEMS.NETHERITE_PICKAXE]: { name: 'Незеритовая кирка Бога', type: 'pickaxe', tier: 4, speed: 8.5, durability: 3000 },
  [ITEMS.NETHERITE_ARMOR]: { name: 'Незеритовая броня Бога', type: 'armor', armor: 14, durability: 3000 },
  
  // Boss & Portal
  [ITEMS.EYE_OF_ENDER]: { name: 'Око Края (Призыв Босса)' },
  [ITEMS.FLINT_AND_STEEL]: { name: 'Огниво (Зажечь Портал в Ад)' },
  [ITEMS.NETHER_STAR]: { name: 'Звезда Незера (Трофей Босса)' }
};

export const CRAFTING_RECIPES = [
  // 2x2
  { result: BLOCKS.OAK_PLANKS, count: 4, inputs: [BLOCKS.OAK_LOG] },
  { result: ITEMS.STICK, count: 4, inputs: [BLOCKS.OAK_PLANKS, BLOCKS.OAK_PLANKS] },
  { result: BLOCKS.TORCH, count: 4, inputs: [ITEMS.COAL, ITEMS.STICK] },
  { result: BLOCKS.CRAFTING_TABLE, count: 1, inputs: [BLOCKS.OAK_PLANKS, BLOCKS.OAK_PLANKS, BLOCKS.OAK_PLANKS, BLOCKS.OAK_PLANKS] },

  // Tools
  { result: ITEMS.WOOD_PICKAXE, count: 1, reqTable: true, inputs: [BLOCKS.OAK_PLANKS, BLOCKS.OAK_PLANKS, BLOCKS.OAK_PLANKS, ITEMS.STICK, ITEMS.STICK] },
  { result: ITEMS.WOOD_SWORD, count: 1, reqTable: true, inputs: [BLOCKS.OAK_PLANKS, BLOCKS.OAK_PLANKS, ITEMS.STICK] },
  { result: ITEMS.WOOD_AXE, count: 1, reqTable: true, inputs: [BLOCKS.OAK_PLANKS, BLOCKS.OAK_PLANKS, BLOCKS.OAK_PLANKS, ITEMS.STICK, ITEMS.STICK] },
  { result: ITEMS.STONE_PICKAXE, count: 1, reqTable: true, inputs: [BLOCKS.COBBLESTONE, BLOCKS.COBBLESTONE, BLOCKS.COBBLESTONE, ITEMS.STICK, ITEMS.STICK] },
  { result: ITEMS.STONE_SWORD, count: 1, reqTable: true, inputs: [BLOCKS.COBBLESTONE, BLOCKS.COBBLESTONE, ITEMS.STICK] },
  { result: BLOCKS.FURNACE, count: 1, reqTable: true, inputs: [BLOCKS.COBBLESTONE, BLOCKS.COBBLESTONE, BLOCKS.COBBLESTONE, BLOCKS.COBBLESTONE, BLOCKS.COBBLESTONE, BLOCKS.COBBLESTONE, BLOCKS.COBBLESTONE, BLOCKS.COBBLESTONE] },
  { result: BLOCKS.CHEST, count: 1, reqTable: true, inputs: [BLOCKS.OAK_PLANKS, BLOCKS.OAK_PLANKS, BLOCKS.OAK_PLANKS, BLOCKS.OAK_PLANKS, BLOCKS.OAK_PLANKS, BLOCKS.OAK_PLANKS, BLOCKS.OAK_PLANKS, BLOCKS.OAK_PLANKS] },
  { result: BLOCKS.LADDER, count: 3, reqTable: true, inputs: [ITEMS.STICK, ITEMS.STICK, ITEMS.STICK, ITEMS.STICK, ITEMS.STICK] },

  // Iron Tier
  { result: ITEMS.IRON_PICKAXE, count: 1, reqTable: true, inputs: [ITEMS.IRON_INGOT, ITEMS.IRON_INGOT, ITEMS.IRON_INGOT, ITEMS.STICK, ITEMS.STICK] },
  { result: ITEMS.IRON_SWORD, count: 1, reqTable: true, inputs: [ITEMS.IRON_INGOT, ITEMS.IRON_INGOT, ITEMS.STICK] },
  { result: ITEMS.IRON_HELMET, count: 1, reqTable: true, inputs: [ITEMS.IRON_INGOT, ITEMS.IRON_INGOT, ITEMS.IRON_INGOT, ITEMS.IRON_INGOT, ITEMS.IRON_INGOT] },
  { result: ITEMS.IRON_CHESTPLATE, count: 1, reqTable: true, inputs: [ITEMS.IRON_INGOT, ITEMS.IRON_INGOT, ITEMS.IRON_INGOT, ITEMS.IRON_INGOT, ITEMS.IRON_INGOT, ITEMS.IRON_INGOT, ITEMS.IRON_INGOT, ITEMS.IRON_INGOT] },
  { result: ITEMS.IRON_LEGGINGS, count: 1, reqTable: true, inputs: [ITEMS.IRON_INGOT, ITEMS.IRON_INGOT, ITEMS.IRON_INGOT, ITEMS.IRON_INGOT, ITEMS.IRON_INGOT, ITEMS.IRON_INGOT, ITEMS.IRON_INGOT] },
  { result: ITEMS.IRON_BOOTS, count: 1, reqTable: true, inputs: [ITEMS.IRON_INGOT, ITEMS.IRON_INGOT, ITEMS.IRON_INGOT, ITEMS.IRON_INGOT] },
  { result: ITEMS.BOW, count: 1, reqTable: true, inputs: [ITEMS.STICK, ITEMS.STICK, ITEMS.STICK, ITEMS.STRING, ITEMS.STRING, ITEMS.STRING] },
  { result: ITEMS.ARROW, count: 4, reqTable: true, inputs: [ITEMS.STICK, ITEMS.BONE] },
  { result: BLOCKS.TNT, count: 1, reqTable: true, inputs: [ITEMS.GUNPOWDER, ITEMS.GUNPOWDER, ITEMS.GUNPOWDER, ITEMS.GUNPOWDER, BLOCKS.SAND, BLOCKS.SAND, BLOCKS.SAND, BLOCKS.SAND] },
  { result: ITEMS.FLINT_AND_STEEL, count: 1, reqTable: true, inputs: [ITEMS.IRON_INGOT, BLOCKS.GRAVEL] },

  // Diamond & Netherite Tier
  { result: ITEMS.DIAMOND_PICKAXE, count: 1, reqTable: true, inputs: [ITEMS.DIAMOND, ITEMS.DIAMOND, ITEMS.DIAMOND, ITEMS.STICK, ITEMS.STICK] },
  { result: ITEMS.DIAMOND_SWORD, count: 1, reqTable: true, inputs: [ITEMS.DIAMOND, ITEMS.DIAMOND, ITEMS.STICK] },
  { result: ITEMS.DIAMOND_CHESTPLATE, count: 1, reqTable: true, inputs: [ITEMS.DIAMOND, ITEMS.DIAMOND, ITEMS.DIAMOND, ITEMS.DIAMOND, ITEMS.DIAMOND, ITEMS.DIAMOND, ITEMS.DIAMOND, ITEMS.DIAMOND] },
  { result: ITEMS.NETHERITE_INGOT, count: 1, reqTable: true, inputs: [ITEMS.NETHERITE_SCRAP, ITEMS.NETHERITE_SCRAP, ITEMS.GOLD_INGOT, ITEMS.GOLD_INGOT] },
  { result: ITEMS.NETHERITE_SWORD, count: 1, reqTable: true, inputs: [ITEMS.DIAMOND_SWORD, ITEMS.NETHERITE_INGOT] },
  { result: ITEMS.NETHERITE_PICKAXE, count: 1, reqTable: true, inputs: [ITEMS.DIAMOND_PICKAXE, ITEMS.NETHERITE_INGOT] },
  { result: ITEMS.NETHERITE_ARMOR, count: 1, reqTable: true, inputs: [ITEMS.DIAMOND_CHESTPLATE, ITEMS.NETHERITE_INGOT] },
  
  // Nether Portal Frame & Boss
  { result: BLOCKS.NETHER_PORTAL, count: 1, reqTable: true, inputs: [BLOCKS.OBSIDIAN, BLOCKS.OBSIDIAN, BLOCKS.OBSIDIAN, BLOCKS.OBSIDIAN, ITEMS.FLINT_AND_STEEL] },
  { result: ITEMS.EYE_OF_ENDER, count: 1, reqTable: true, inputs: [ITEMS.DIAMOND, ITEMS.GOLD_INGOT, ITEMS.BONE] }
];
