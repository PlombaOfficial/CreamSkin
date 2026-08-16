import { BlockType, ItemCategory, ItemDefinition, ToolTier, ToolType, BlockDefinition } from '../types';

export const ITEM_DEFINITIONS: Record<string, ItemDefinition> = {
  // --- Blocks as Items ---
  'grass': { id: 'grass', name: 'Grass Block', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.GRASS, spriteIndex: 1 },
  'dirt': { id: 'dirt', name: 'Dirt', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.DIRT, spriteIndex: 2 },
  'stone': { id: 'stone', name: 'Stone', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.STONE, spriteIndex: 3 },
  'cobblestone': { id: 'cobblestone', name: 'Cobblestone', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.COBBLESTONE, smeltOutput: 'stone', smeltTime: 180, spriteIndex: 4 },
  'deepslate': { id: 'deepslate', name: 'Deepslate', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.DEEPSLATE, spriteIndex: 5 },
  'bedrock': { id: 'bedrock', name: 'Bedrock', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.BEDROCK, spriteIndex: 6 },
  'sand': { id: 'sand', name: 'Sand', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.SAND, smeltOutput: 'glass', smeltTime: 180, spriteIndex: 7 },
  'sandstone': { id: 'sandstone', name: 'Sandstone', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.SANDSTONE, spriteIndex: 8 },
  'gravel': { id: 'gravel', name: 'Gravel', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.GRAVEL, spriteIndex: 9 },
  'snow_grass': { id: 'snow_grass', name: 'Snowy Grass', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.SNOW_GRASS, spriteIndex: 10 },
  'snow': { id: 'snow', name: 'Snow Block', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.SNOW, spriteIndex: 11 },
  'ice': { id: 'ice', name: 'Ice', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.ICE, spriteIndex: 12 },
  'oak_log': { id: 'oak_log', name: 'Oak Log', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.OAK_LOG, burnTime: 300, smeltOutput: 'coal', smeltTime: 180, spriteIndex: 13 },
  'birch_log': { id: 'birch_log', name: 'Birch Log', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.BIRCH_LOG, burnTime: 300, smeltOutput: 'coal', smeltTime: 180, spriteIndex: 14 },
  'oak_planks': { id: 'oak_planks', name: 'Oak Planks', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.OAK_PLANKS, burnTime: 200, spriteIndex: 15 },
  'birch_planks': { id: 'birch_planks', name: 'Birch Planks', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.BIRCH_PLANKS, burnTime: 200, spriteIndex: 16 },
  'oak_leaves': { id: 'oak_leaves', name: 'Oak Leaves', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.OAK_LEAVES, spriteIndex: 17 },
  'birch_leaves': { id: 'birch_leaves', name: 'Birch Leaves', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.BIRCH_LEAVES, spriteIndex: 18 },
  'cactus': { id: 'cactus', name: 'Cactus', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.CACTUS, spriteIndex: 19 },
  'coal_ore': { id: 'coal_ore', name: 'Coal Ore', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.COAL_ORE, spriteIndex: 20 },
  'iron_ore': { id: 'iron_ore', name: 'Iron Ore', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.IRON_ORE, smeltOutput: 'iron_ingot', smeltTime: 200, spriteIndex: 21 },
  'gold_ore': { id: 'gold_ore', name: 'Gold Ore', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.GOLD_ORE, smeltOutput: 'gold_ingot', smeltTime: 200, spriteIndex: 22 },
  'diamond_ore': { id: 'diamond_ore', name: 'Diamond Ore', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.DIAMOND_ORE, spriteIndex: 23 },
  'redstone_ore': { id: 'redstone_ore', name: 'Redstone Ore', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.REDSTONE_ORE, spriteIndex: 24 },
  'emerald_ore': { id: 'emerald_ore', name: 'Emerald Ore', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.EMERALD_ORE, spriteIndex: 25 },
  'crafting_table': { id: 'crafting_table', name: 'Crafting Table', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.CRAFTING_TABLE, burnTime: 300, spriteIndex: 26 },
  'furnace': { id: 'furnace', name: 'Furnace', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.FURNACE, spriteIndex: 27 },
  'chest': { id: 'chest', name: 'Chest', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.CHEST, burnTime: 300, spriteIndex: 29 },
  'torch': { id: 'torch', name: 'Torch', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.TORCH, spriteIndex: 30 },
  'glass': { id: 'glass', name: 'Glass', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.GLASS, spriteIndex: 31 },
  'brick': { id: 'brick', name: 'Bricks', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.BRICK, spriteIndex: 32 },
  'wood_door': { id: 'wood_door', name: 'Wooden Door', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.WOOD_DOOR_LOWER, burnTime: 200, spriteIndex: 35 },
  'ladder': { id: 'ladder', name: 'Ladder', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.LADDER, burnTime: 100, spriteIndex: 37 },
  'flower_red': { id: 'flower_red', name: 'Poppy', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.FLOWER_RED, spriteIndex: 39 },
  'flower_yellow': { id: 'flower_yellow', name: 'Dandelion', category: ItemCategory.BLOCK, maxStack: 64, blockType: BlockType.FLOWER_YELLOW, spriteIndex: 40 },
  'mushroom_red': { id: 'mushroom_red', name: 'Red Mushroom', category: ItemCategory.FOOD, maxStack: 64, blockType: BlockType.MUSHROOM_RED, foodRestoration: 1, saturation: 1, spriteIndex: 41 },
  'mushroom_brown': { id: 'mushroom_brown', name: 'Brown Mushroom', category: ItemCategory.FOOD, maxStack: 64, blockType: BlockType.MUSHROOM_BROWN, foodRestoration: 1, saturation: 1, spriteIndex: 42 },

  // --- Materials ---
  'stick': { id: 'stick', name: 'Stick', category: ItemCategory.MATERIAL, maxStack: 64, burnTime: 100, spriteIndex: 100 },
  'coal': { id: 'coal', name: 'Coal', category: ItemCategory.MATERIAL, maxStack: 64, burnTime: 1600, spriteIndex: 101 },
  'iron_ingot': { id: 'iron_ingot', name: 'Iron Ingot', category: ItemCategory.MATERIAL, maxStack: 64, spriteIndex: 102 },
  'gold_ingot': { id: 'gold_ingot', name: 'Gold Ingot', category: ItemCategory.MATERIAL, maxStack: 64, spriteIndex: 103 },
  'diamond': { id: 'diamond', name: 'Diamond', category: ItemCategory.MATERIAL, maxStack: 64, spriteIndex: 104 },
  'emerald': { id: 'emerald', name: 'Emerald', category: ItemCategory.MATERIAL, maxStack: 64, spriteIndex: 105 },
  'redstone': { id: 'redstone', name: 'Redstone Dust', category: ItemCategory.MATERIAL, maxStack: 64, spriteIndex: 106 },
  'wheat_seeds': { id: 'wheat_seeds', name: 'Wheat Seeds', category: ItemCategory.MATERIAL, maxStack: 64, spriteIndex: 107 },
  'wheat': { id: 'wheat', name: 'Wheat', category: ItemCategory.MATERIAL, maxStack: 64, spriteIndex: 108 },

  // --- Foods ---
  'apple': { id: 'apple', name: 'Apple', category: ItemCategory.FOOD, maxStack: 64, foodRestoration: 4, saturation: 2.4, spriteIndex: 110 },
  'bread': { id: 'bread', name: 'Bread', category: ItemCategory.FOOD, maxStack: 64, foodRestoration: 5, saturation: 6.0, spriteIndex: 111 },
  'porkchop_raw': { id: 'porkchop_raw', name: 'Raw Porkchop', category: ItemCategory.FOOD, maxStack: 64, foodRestoration: 3, saturation: 1.8, smeltOutput: 'porkchop_cooked', smeltTime: 150, spriteIndex: 112 },
  'porkchop_cooked': { id: 'porkchop_cooked', name: 'Cooked Porkchop', category: ItemCategory.FOOD, maxStack: 64, foodRestoration: 8, saturation: 12.8, spriteIndex: 113 },

  // --- Pickaxes ---
  'wood_pickaxe': { id: 'wood_pickaxe', name: 'Wooden Pickaxe', category: ItemCategory.TOOL, maxStack: 1, toolType: ToolType.PICKAXE, toolTier: ToolTier.WOOD, miningSpeed: 2.0, attackDamage: 2, burnTime: 200, spriteIndex: 120 },
  'stone_pickaxe': { id: 'stone_pickaxe', name: 'Stone Pickaxe', category: ItemCategory.TOOL, maxStack: 1, toolType: ToolType.PICKAXE, toolTier: ToolTier.STONE, miningSpeed: 4.0, attackDamage: 3, spriteIndex: 121 },
  'iron_pickaxe': { id: 'iron_pickaxe', name: 'Iron Pickaxe', category: ItemCategory.TOOL, maxStack: 1, toolType: ToolType.PICKAXE, toolTier: ToolTier.IRON, miningSpeed: 6.0, attackDamage: 4, spriteIndex: 122 },
  'gold_pickaxe': { id: 'gold_pickaxe', name: 'Golden Pickaxe', category: ItemCategory.TOOL, maxStack: 1, toolType: ToolType.PICKAXE, toolTier: ToolTier.GOLD, miningSpeed: 10.0, attackDamage: 3, spriteIndex: 123 },
  'diamond_pickaxe': { id: 'diamond_pickaxe', name: 'Diamond Pickaxe', category: ItemCategory.TOOL, maxStack: 1, toolType: ToolType.PICKAXE, toolTier: ToolTier.DIAMOND, miningSpeed: 8.0, attackDamage: 5, spriteIndex: 124 },

  // --- Axes ---
  'wood_axe': { id: 'wood_axe', name: 'Wooden Axe', category: ItemCategory.TOOL, maxStack: 1, toolType: ToolType.AXE, toolTier: ToolTier.WOOD, miningSpeed: 2.0, attackDamage: 4, burnTime: 200, spriteIndex: 125 },
  'stone_axe': { id: 'stone_axe', name: 'Stone Axe', category: ItemCategory.TOOL, maxStack: 1, toolType: ToolType.AXE, toolTier: ToolTier.STONE, miningSpeed: 4.0, attackDamage: 5, spriteIndex: 126 },
  'iron_axe': { id: 'iron_axe', name: 'Iron Axe', category: ItemCategory.TOOL, maxStack: 1, toolType: ToolType.AXE, toolTier: ToolTier.IRON, miningSpeed: 6.0, attackDamage: 6, spriteIndex: 127 },
  'gold_axe': { id: 'gold_axe', name: 'Golden Axe', category: ItemCategory.TOOL, maxStack: 1, toolType: ToolType.AXE, toolTier: ToolTier.GOLD, miningSpeed: 10.0, attackDamage: 4, spriteIndex: 128 },
  'diamond_axe': { id: 'diamond_axe', name: 'Diamond Axe', category: ItemCategory.TOOL, maxStack: 1, toolType: ToolType.AXE, toolTier: ToolTier.DIAMOND, miningSpeed: 8.0, attackDamage: 7, spriteIndex: 129 },

  // --- Shovels ---
  'wood_shovel': { id: 'wood_shovel', name: 'Wooden Shovel', category: ItemCategory.TOOL, maxStack: 1, toolType: ToolType.SHOVEL, toolTier: ToolTier.WOOD, miningSpeed: 2.0, attackDamage: 1.5, burnTime: 200, spriteIndex: 130 },
  'stone_shovel': { id: 'stone_shovel', name: 'Stone Shovel', category: ItemCategory.TOOL, maxStack: 1, toolType: ToolType.SHOVEL, toolTier: ToolTier.STONE, miningSpeed: 4.0, attackDamage: 2.5, spriteIndex: 131 },
  'iron_shovel': { id: 'iron_shovel', name: 'Iron Shovel', category: ItemCategory.TOOL, maxStack: 1, toolType: ToolType.SHOVEL, toolTier: ToolTier.IRON, miningSpeed: 6.0, attackDamage: 3.5, spriteIndex: 132 },
  'gold_shovel': { id: 'gold_shovel', name: 'Golden Shovel', category: ItemCategory.TOOL, maxStack: 1, toolType: ToolType.SHOVEL, toolTier: ToolTier.GOLD, miningSpeed: 10.0, attackDamage: 2.5, spriteIndex: 133 },
  'diamond_shovel': { id: 'diamond_shovel', name: 'Diamond Shovel', category: ItemCategory.TOOL, maxStack: 1, toolType: ToolType.SHOVEL, toolTier: ToolTier.DIAMOND, miningSpeed: 8.0, attackDamage: 4.5, spriteIndex: 134 },

  // --- Swords ---
  'wood_sword': { id: 'wood_sword', name: 'Wooden Sword', category: ItemCategory.WEAPON, maxStack: 1, toolType: ToolType.SWORD, toolTier: ToolTier.WOOD, miningSpeed: 1.5, attackDamage: 4, burnTime: 200, spriteIndex: 135 },
  'stone_sword': { id: 'stone_sword', name: 'Stone Sword', category: ItemCategory.WEAPON, maxStack: 1, toolType: ToolType.SWORD, toolTier: ToolTier.STONE, miningSpeed: 1.5, attackDamage: 5, spriteIndex: 136 },
  'iron_sword': { id: 'iron_sword', name: 'Iron Sword', category: ItemCategory.WEAPON, maxStack: 1, toolType: ToolType.SWORD, toolTier: ToolTier.IRON, miningSpeed: 1.5, attackDamage: 6, spriteIndex: 137 },
  'gold_sword': { id: 'gold_sword', name: 'Golden Sword', category: ItemCategory.WEAPON, maxStack: 1, toolType: ToolType.SWORD, toolTier: ToolTier.GOLD, miningSpeed: 1.5, attackDamage: 4, spriteIndex: 138 },
  'diamond_sword': { id: 'diamond_sword', name: 'Diamond Sword', category: ItemCategory.WEAPON, maxStack: 1, toolType: ToolType.SWORD, toolTier: ToolTier.DIAMOND, miningSpeed: 1.5, attackDamage: 8, spriteIndex: 139 },

  // --- Bow & Arrows ---
  'bow': { id: 'bow', name: 'Bow', category: ItemCategory.WEAPON, maxStack: 1, toolType: ToolType.BOW, attackDamage: 6, spriteIndex: 140 },
  'arrow': { id: 'arrow', name: 'Arrow', category: ItemCategory.MATERIAL, maxStack: 64, spriteIndex: 141 },
};

export const BLOCK_DEFINITIONS: Record<BlockType, BlockDefinition> = {
  [BlockType.AIR]: {
    type: BlockType.AIR, name: 'Air', isSolid: false, isLiquid: false, isTransparent: true,
    hardness: 0, requiredTool: ToolType.NONE, minToolTier: ToolTier.HAND, dropItemId: '', textureIndex: 0, soundType: 'grass'
  },
  [BlockType.GRASS]: {
    type: BlockType.GRASS, name: 'Grass Block', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 600, requiredTool: ToolType.SHOVEL, minToolTier: ToolTier.HAND, dropItemId: 'dirt', textureIndex: 1, soundType: 'grass'
  },
  [BlockType.DIRT]: {
    type: BlockType.DIRT, name: 'Dirt', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 500, requiredTool: ToolType.SHOVEL, minToolTier: ToolTier.HAND, dropItemId: 'dirt', textureIndex: 2, soundType: 'grass'
  },
  [BlockType.STONE]: {
    type: BlockType.STONE, name: 'Stone', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 1500, requiredTool: ToolType.PICKAXE, minToolTier: ToolTier.WOOD, dropItemId: 'cobblestone', textureIndex: 3, soundType: 'stone'
  },
  [BlockType.COBBLESTONE]: {
    type: BlockType.COBBLESTONE, name: 'Cobblestone', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 2000, requiredTool: ToolType.PICKAXE, minToolTier: ToolTier.WOOD, dropItemId: 'cobblestone', textureIndex: 4, soundType: 'stone'
  },
  [BlockType.DEEPSLATE]: {
    type: BlockType.DEEPSLATE, name: 'Deepslate', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 3000, requiredTool: ToolType.PICKAXE, minToolTier: ToolTier.WOOD, dropItemId: 'deepslate', textureIndex: 5, soundType: 'stone'
  },
  [BlockType.BEDROCK]: {
    type: BlockType.BEDROCK, name: 'Bedrock', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: -1, requiredTool: ToolType.NONE, minToolTier: ToolTier.HAND, dropItemId: '', textureIndex: 6, soundType: 'stone'
  },
  [BlockType.SAND]: {
    type: BlockType.SAND, name: 'Sand', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 500, requiredTool: ToolType.SHOVEL, minToolTier: ToolTier.HAND, dropItemId: 'sand', textureIndex: 7, soundType: 'sand'
  },
  [BlockType.SANDSTONE]: {
    type: BlockType.SANDSTONE, name: 'Sandstone', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 1000, requiredTool: ToolType.PICKAXE, minToolTier: ToolTier.WOOD, dropItemId: 'sandstone', textureIndex: 8, soundType: 'stone'
  },
  [BlockType.GRAVEL]: {
    type: BlockType.GRAVEL, name: 'Gravel', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 600, requiredTool: ToolType.SHOVEL, minToolTier: ToolTier.HAND, dropItemId: 'gravel', textureIndex: 9, soundType: 'sand'
  },
  [BlockType.SNOW_GRASS]: {
    type: BlockType.SNOW_GRASS, name: 'Snowy Grass', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 600, requiredTool: ToolType.SHOVEL, minToolTier: ToolTier.HAND, dropItemId: 'dirt', textureIndex: 10, soundType: 'snow'
  },
  [BlockType.SNOW]: {
    type: BlockType.SNOW, name: 'Snow Block', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 300, requiredTool: ToolType.SHOVEL, minToolTier: ToolTier.HAND, dropItemId: 'snow', textureIndex: 11, soundType: 'snow'
  },
  [BlockType.ICE]: {
    type: BlockType.ICE, name: 'Ice', isSolid: true, isLiquid: false, isTransparent: true,
    hardness: 500, requiredTool: ToolType.PICKAXE, minToolTier: ToolTier.WOOD, dropItemId: 'ice', textureIndex: 12, soundType: 'glass'
  },
  [BlockType.OAK_LOG]: {
    type: BlockType.OAK_LOG, name: 'Oak Log', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 2000, requiredTool: ToolType.AXE, minToolTier: ToolTier.HAND, dropItemId: 'oak_log', textureIndex: 13, soundType: 'wood'
  },
  [BlockType.BIRCH_LOG]: {
    type: BlockType.BIRCH_LOG, name: 'Birch Log', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 2000, requiredTool: ToolType.AXE, minToolTier: ToolTier.HAND, dropItemId: 'birch_log', textureIndex: 14, soundType: 'wood'
  },
  [BlockType.OAK_PLANKS]: {
    type: BlockType.OAK_PLANKS, name: 'Oak Planks', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 1500, requiredTool: ToolType.AXE, minToolTier: ToolTier.HAND, dropItemId: 'oak_planks', textureIndex: 15, soundType: 'wood'
  },
  [BlockType.BIRCH_PLANKS]: {
    type: BlockType.BIRCH_PLANKS, name: 'Birch Planks', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 1500, requiredTool: ToolType.AXE, minToolTier: ToolTier.HAND, dropItemId: 'birch_planks', textureIndex: 16, soundType: 'wood'
  },
  [BlockType.OAK_LEAVES]: {
    type: BlockType.OAK_LEAVES, name: 'Oak Leaves', isSolid: false, isLiquid: false, isTransparent: true,
    hardness: 200, requiredTool: ToolType.NONE, minToolTier: ToolTier.HAND, dropItemId: 'apple', dropCount: 0.1, textureIndex: 17, soundType: 'grass'
  },
  [BlockType.BIRCH_LEAVES]: {
    type: BlockType.BIRCH_LEAVES, name: 'Birch Leaves', isSolid: false, isLiquid: false, isTransparent: true,
    hardness: 200, requiredTool: ToolType.NONE, minToolTier: ToolTier.HAND, dropItemId: '', textureIndex: 18, soundType: 'grass'
  },
  [BlockType.CACTUS]: {
    type: BlockType.CACTUS, name: 'Cactus', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 400, requiredTool: ToolType.NONE, minToolTier: ToolTier.HAND, dropItemId: 'cactus', textureIndex: 19, soundType: 'wood'
  },
  [BlockType.COAL_ORE]: {
    type: BlockType.COAL_ORE, name: 'Coal Ore', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 3000, requiredTool: ToolType.PICKAXE, minToolTier: ToolTier.WOOD, dropItemId: 'coal', textureIndex: 20, soundType: 'stone'
  },
  [BlockType.IRON_ORE]: {
    type: BlockType.IRON_ORE, name: 'Iron Ore', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 3500, requiredTool: ToolType.PICKAXE, minToolTier: ToolTier.STONE, dropItemId: 'iron_ore', textureIndex: 21, soundType: 'stone'
  },
  [BlockType.GOLD_ORE]: {
    type: BlockType.GOLD_ORE, name: 'Gold Ore', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 3500, requiredTool: ToolType.PICKAXE, minToolTier: ToolTier.IRON, dropItemId: 'gold_ore', textureIndex: 22, soundType: 'stone'
  },
  [BlockType.DIAMOND_ORE]: {
    type: BlockType.DIAMOND_ORE, name: 'Diamond Ore', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 4000, requiredTool: ToolType.PICKAXE, minToolTier: ToolTier.IRON, dropItemId: 'diamond', textureIndex: 23, soundType: 'stone'
  },
  [BlockType.REDSTONE_ORE]: {
    type: BlockType.REDSTONE_ORE, name: 'Redstone Ore', isSolid: true, isLiquid: false, isTransparent: false,
    isLightEmitter: true, lightEmission: 9, hardness: 3500, requiredTool: ToolType.PICKAXE, minToolTier: ToolTier.IRON, dropItemId: 'redstone', dropCount: 4, textureIndex: 24, soundType: 'stone'
  },
  [BlockType.EMERALD_ORE]: {
    type: BlockType.EMERALD_ORE, name: 'Emerald Ore', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 4000, requiredTool: ToolType.PICKAXE, minToolTier: ToolTier.IRON, dropItemId: 'emerald', textureIndex: 25, soundType: 'stone'
  },
  [BlockType.CRAFTING_TABLE]: {
    type: BlockType.CRAFTING_TABLE, name: 'Crafting Table', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 2500, requiredTool: ToolType.AXE, minToolTier: ToolTier.HAND, dropItemId: 'crafting_table', textureIndex: 26, soundType: 'wood'
  },
  [BlockType.FURNACE]: {
    type: BlockType.FURNACE, name: 'Furnace', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 3500, requiredTool: ToolType.PICKAXE, minToolTier: ToolTier.WOOD, dropItemId: 'furnace', textureIndex: 27, soundType: 'stone'
  },
  [BlockType.FURNACE_ACTIVE]: {
    type: BlockType.FURNACE_ACTIVE, name: 'Furnace (Lit)', isSolid: true, isLiquid: false, isTransparent: false,
    isLightEmitter: true, lightEmission: 13, hardness: 3500, requiredTool: ToolType.PICKAXE, minToolTier: ToolTier.WOOD, dropItemId: 'furnace', textureIndex: 28, soundType: 'stone'
  },
  [BlockType.CHEST]: {
    type: BlockType.CHEST, name: 'Chest', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 2500, requiredTool: ToolType.AXE, minToolTier: ToolTier.HAND, dropItemId: 'chest', textureIndex: 29, soundType: 'wood'
  },
  [BlockType.TORCH]: {
    type: BlockType.TORCH, name: 'Torch', isSolid: false, isLiquid: false, isTransparent: true,
    isLightEmitter: true, lightEmission: 14, hardness: 100, requiredTool: ToolType.NONE, minToolTier: ToolTier.HAND, dropItemId: 'torch', textureIndex: 30, soundType: 'wood'
  },
  [BlockType.GLASS]: {
    type: BlockType.GLASS, name: 'Glass', isSolid: true, isLiquid: false, isTransparent: true,
    hardness: 300, requiredTool: ToolType.NONE, minToolTier: ToolTier.HAND, dropItemId: '', textureIndex: 31, soundType: 'glass'
  },
  [BlockType.BRICK]: {
    type: BlockType.BRICK, name: 'Bricks', isSolid: true, isLiquid: false, isTransparent: false,
    hardness: 2000, requiredTool: ToolType.PICKAXE, minToolTier: ToolTier.WOOD, dropItemId: 'brick', textureIndex: 32, soundType: 'stone'
  },
  [BlockType.WATER]: {
    type: BlockType.WATER, name: 'Water', isSolid: false, isLiquid: true, isTransparent: true,
    hardness: -1, requiredTool: ToolType.NONE, minToolTier: ToolTier.HAND, dropItemId: '', textureIndex: 33, soundType: 'water'
  },
  [BlockType.LAVA]: {
    type: BlockType.LAVA, name: 'Lava', isSolid: false, isLiquid: true, isTransparent: false,
    isLightEmitter: true, lightEmission: 15, hardness: -1, requiredTool: ToolType.NONE, minToolTier: ToolTier.HAND, dropItemId: '', textureIndex: 34, soundType: 'stone'
  },
  [BlockType.WOOD_DOOR_LOWER]: {
    type: BlockType.WOOD_DOOR_LOWER, name: 'Wooden Door', isSolid: false, isLiquid: false, isTransparent: true,
    hardness: 2000, requiredTool: ToolType.AXE, minToolTier: ToolTier.HAND, dropItemId: 'wood_door', textureIndex: 35, soundType: 'wood'
  },
  [BlockType.WOOD_DOOR_UPPER]: {
    type: BlockType.WOOD_DOOR_UPPER, name: 'Wooden Door (Top)', isSolid: false, isLiquid: false, isTransparent: true,
    hardness: 2000, requiredTool: ToolType.AXE, minToolTier: ToolTier.HAND, dropItemId: '', textureIndex: 36, soundType: 'wood'
  },
  [BlockType.LADDER]: {
    type: BlockType.LADDER, name: 'Ladder', isSolid: false, isLiquid: false, isTransparent: true,
    hardness: 400, requiredTool: ToolType.AXE, minToolTier: ToolTier.HAND, dropItemId: 'ladder', textureIndex: 37, soundType: 'wood'
  },
  [BlockType.TALL_GRASS]: {
    type: BlockType.TALL_GRASS, name: 'Tall Grass', isSolid: false, isLiquid: false, isTransparent: true,
    hardness: 50, requiredTool: ToolType.NONE, minToolTier: ToolTier.HAND, dropItemId: 'wheat_seeds', dropCount: 0.25, textureIndex: 38, soundType: 'grass'
  },
  [BlockType.FLOWER_RED]: {
    type: BlockType.FLOWER_RED, name: 'Poppy', isSolid: false, isLiquid: false, isTransparent: true,
    hardness: 50, requiredTool: ToolType.NONE, minToolTier: ToolTier.HAND, dropItemId: 'flower_red', textureIndex: 39, soundType: 'grass'
  },
  [BlockType.FLOWER_YELLOW]: {
    type: BlockType.FLOWER_YELLOW, name: 'Dandelion', isSolid: false, isLiquid: false, isTransparent: true,
    hardness: 50, requiredTool: ToolType.NONE, minToolTier: ToolTier.HAND, dropItemId: 'flower_yellow', textureIndex: 40, soundType: 'grass'
  },
  [BlockType.MUSHROOM_RED]: {
    type: BlockType.MUSHROOM_RED, name: 'Red Mushroom', isSolid: false, isLiquid: false, isTransparent: true,
    hardness: 50, requiredTool: ToolType.NONE, minToolTier: ToolTier.HAND, dropItemId: 'mushroom_red', textureIndex: 41, soundType: 'grass'
  },
  [BlockType.MUSHROOM_BROWN]: {
    type: BlockType.MUSHROOM_BROWN, name: 'Brown Mushroom', isSolid: false, isLiquid: false, isTransparent: true,
    hardness: 50, requiredTool: ToolType.NONE, minToolTier: ToolTier.HAND, dropItemId: 'mushroom_brown', textureIndex: 42, soundType: 'grass'
  },
  [BlockType.WHEAT_0]: {
    type: BlockType.WHEAT_0, name: 'Wheat Stage 1', isSolid: false, isLiquid: false, isTransparent: true,
    hardness: 50, requiredTool: ToolType.NONE, minToolTier: ToolTier.HAND, dropItemId: 'wheat_seeds', textureIndex: 43, soundType: 'grass'
  },
  [BlockType.WHEAT_1]: {
    type: BlockType.WHEAT_1, name: 'Wheat Stage 2', isSolid: false, isLiquid: false, isTransparent: true,
    hardness: 50, requiredTool: ToolType.NONE, minToolTier: ToolTier.HAND, dropItemId: 'wheat_seeds', textureIndex: 44, soundType: 'grass'
  },
  [BlockType.WHEAT_2]: {
    type: BlockType.WHEAT_2, name: 'Wheat Stage 3', isSolid: false, isLiquid: false, isTransparent: true,
    hardness: 50, requiredTool: ToolType.NONE, minToolTier: ToolTier.HAND, dropItemId: 'wheat_seeds', textureIndex: 45, soundType: 'grass'
  },
  [BlockType.WHEAT_3]: {
    type: BlockType.WHEAT_3, name: 'Ripe Wheat', isSolid: false, isLiquid: false, isTransparent: true,
    hardness: 50, requiredTool: ToolType.NONE, minToolTier: ToolTier.HAND, dropItemId: 'wheat', dropCount: 1, textureIndex: 46, soundType: 'grass'
  },
};
