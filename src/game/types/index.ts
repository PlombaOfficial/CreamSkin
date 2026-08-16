export enum BlockType {
  AIR = 0,
  GRASS = 1,
  DIRT = 2,
  STONE = 3,
  COBBLESTONE = 4,
  DEEPSLATE = 5,
  BEDROCK = 6,
  SAND = 7,
  SANDSTONE = 8,
  GRAVEL = 9,
  SNOW_GRASS = 10,
  SNOW = 11,
  ICE = 12,
  OAK_LOG = 13,
  BIRCH_LOG = 14,
  OAK_PLANKS = 15,
  BIRCH_PLANKS = 16,
  OAK_LEAVES = 17,
  BIRCH_LEAVES = 18,
  CACTUS = 19,
  COAL_ORE = 20,
  IRON_ORE = 21,
  GOLD_ORE = 22,
  DIAMOND_ORE = 23,
  REDSTONE_ORE = 24,
  EMERALD_ORE = 25,
  CRAFTING_TABLE = 26,
  FURNACE = 27,
  FURNACE_ACTIVE = 28,
  CHEST = 29,
  TORCH = 30,
  GLASS = 31,
  BRICK = 32,
  WATER = 33,
  LAVA = 34,
  WOOD_DOOR_LOWER = 35,
  WOOD_DOOR_UPPER = 36,
  LADDER = 37,
  TALL_GRASS = 38,
  FLOWER_RED = 39,
  FLOWER_YELLOW = 40,
  MUSHROOM_RED = 41,
  MUSHROOM_BROWN = 42,
  WHEAT_0 = 43,
  WHEAT_1 = 44,
  WHEAT_2 = 45,
  WHEAT_3 = 46,
}

export enum ItemCategory {
  BLOCK = 'block',
  TOOL = 'tool',
  WEAPON = 'weapon',
  ARMOR = 'armor',
  MATERIAL = 'material',
  FOOD = 'food',
}

export enum ToolType {
  NONE = 'none',
  PICKAXE = 'pickaxe',
  AXE = 'axe',
  SHOVEL = 'shovel',
  SWORD = 'sword',
  BOW = 'bow',
}

export enum ToolTier {
  HAND = 0,
  WOOD = 1,
  STONE = 2,
  IRON = 3,
  GOLD = 4,
  DIAMOND = 5,
}

export enum ArmorSlot {
  HELMET = 'helmet',
  CHESTPLATE = 'chestplate',
  LEGGINGS = 'leggings',
  BOOTS = 'boots',
}

export interface ItemStack {
  id: string;
  count: number;
  durability?: number;
  maxDurability?: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  category: ItemCategory;
  maxStack: number;
  blockType?: BlockType;
  toolType?: ToolType;
  toolTier?: ToolTier;
  miningSpeed?: number;
  attackDamage?: number;
  armorDefense?: number;
  armorSlot?: ArmorSlot;
  foodRestoration?: number;
  saturation?: number;
  smeltOutput?: string;
  smeltTime?: number;
  burnTime?: number; // In ticks for fuel
  spriteIndex: number;
}

export interface BlockDefinition {
  type: BlockType;
  name: string;
  isSolid: boolean;
  isLiquid: boolean;
  isTransparent: boolean;
  isLightEmitter?: boolean;
  lightEmission?: number;
  hardness: number; // break time base in ms
  requiredTool: ToolType;
  minToolTier: ToolTier;
  dropItemId: string;
  dropCount?: number;
  textureIndex: number;
  textureTop?: number;
  textureBottom?: number;
  soundType: 'grass' | 'stone' | 'wood' | 'sand' | 'snow' | 'glass' | 'cloth' | 'water';
}

export enum BiomeType {
  PLAINS = 'plains',
  FOREST = 'forest',
  BIRCH_FOREST = 'birch_forest',
  DESERT = 'desert',
  SNOW_TUNDRA = 'snow_tundra',
  DEEP_CAVERNS = 'deep_caverns',
  MAGMA_CORE = 'magma_core',
}

export enum WeatherType {
  CLEAR = 'clear',
  OVERCAST = 'overcast',
  RAIN = 'rain',
  THUNDER = 'thunder',
  SNOW = 'snow',
}

export enum EntityType {
  PLAYER = 'player',
  REMOTE_PLAYER = 'remote_player',
  ZOMBIE = 'zombie',
  SKELETON = 'skeleton',
  SLIME = 'slime',
  PIG = 'pig',
  SHEEP = 'sheep',
  ITEM_DROP = 'item_drop',
  ARROW = 'arrow',
}

export interface RecipePattern {
  id: string;
  width: number;
  height: number;
  pattern: (string | null)[]; // 2x2 or 3x3 array flattened
  result: ItemStack;
  shapeless?: boolean;
  requiredStation?: 'hand' | 'workbench' | 'furnace';
}

export interface ContainerSlot {
  item: ItemStack | null;
}

export interface FurnaceData {
  input: ItemStack | null;
  fuel: ItemStack | null;
  output: ItemStack | null;
  burnTimeRemaining: number;
  maxBurnTime: number;
  cookProgress: number;
  cookTimeTotal: number;
}

export interface ChestData {
  id: string;
  x: number;
  y: number;
  items: (ItemStack | null)[];
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  hunger: number;
  maxHunger: number;
  saturation: number;
  exhaustion: number;
  armor: number;
  air: number;
  maxAir: number;
  experience: number;
  level: number;
  xpToNextLevel: number;
  score: number;
}

export interface RemotePlayerState {
  uid: string;
  username: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facingLeft: boolean;
  selectedSlot: number;
  heldItemId: string | null;
  isMining: boolean;
  isWalking: boolean;
  health: number;
  skinColor: string;
  shirtColor: string;
  pantsColor: string;
  lastUpdated: number;
}

export interface ChatMessage {
  id: string;
  senderUid: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface BlockDelta {
  x: number;
  y: number;
  block: BlockType;
  wall?: number;
  playerUid: string;
  timestamp: number;
}
