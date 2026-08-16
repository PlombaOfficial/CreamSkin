import { ItemStack, RecipePattern } from '../types';

export class CraftingManager {
  public static readonly RECIPES: RecipePattern[] = [
    // --- 2x2 Basic Recipes ---
    // Oak Planks from Oak Log
    {
      id: 'oak_planks_from_log',
      width: 1,
      height: 1,
      pattern: ['oak_log'],
      result: { id: 'oak_planks', count: 4 },
      requiredStation: 'hand',
    },
    // Birch Planks from Birch Log
    {
      id: 'birch_planks_from_log',
      width: 1,
      height: 1,
      pattern: ['birch_log'],
      result: { id: 'birch_planks', count: 4 },
      requiredStation: 'hand',
    },
    // Sticks from 2 Planks
    {
      id: 'sticks_from_oak_planks',
      width: 1,
      height: 2,
      pattern: ['oak_planks', 'oak_planks'],
      result: { id: 'stick', count: 4 },
      requiredStation: 'hand',
    },
    {
      id: 'sticks_from_birch_planks',
      width: 1,
      height: 2,
      pattern: ['birch_planks', 'birch_planks'],
      result: { id: 'stick', count: 4 },
      requiredStation: 'hand',
    },
    // Crafting Table from 4 Planks
    {
      id: 'crafting_table_from_oak',
      width: 2,
      height: 2,
      pattern: ['oak_planks', 'oak_planks', 'oak_planks', 'oak_planks'],
      result: { id: 'crafting_table', count: 1 },
      requiredStation: 'hand',
    },
    // Torches (Coal + Stick)
    {
      id: 'torches_from_coal',
      width: 1,
      height: 2,
      pattern: ['coal', 'stick'],
      result: { id: 'torch', count: 4 },
      requiredStation: 'hand',
    },
    // Wooden Pickaxe (2x2 simplified or 3x3)
    {
      id: 'wood_pickaxe_2x2',
      width: 2,
      height: 2,
      pattern: ['oak_planks', 'oak_planks', null, 'stick'],
      result: { id: 'wood_pickaxe', count: 1 },
      requiredStation: 'hand',
    },
    // Wooden Sword (2x2)
    {
      id: 'wood_sword_2x2',
      width: 1,
      height: 2,
      pattern: ['oak_planks', 'stick'],
      result: { id: 'wood_sword', count: 1 },
      requiredStation: 'hand',
    },

    // --- 3x3 Workbench Recipes ---
    // Furnace (8 Cobblestone around hole)
    {
      id: 'furnace',
      width: 3,
      height: 3,
      pattern: [
        'cobblestone', 'cobblestone', 'cobblestone',
        'cobblestone', null,          'cobblestone',
        'cobblestone', 'cobblestone', 'cobblestone'
      ],
      result: { id: 'furnace', count: 1 },
      requiredStation: 'workbench',
    },
    // Chest (8 Planks around hole)
    {
      id: 'chest',
      width: 3,
      height: 3,
      pattern: [
        'oak_planks', 'oak_planks', 'oak_planks',
        'oak_planks', null,         'oak_planks',
        'oak_planks', 'oak_planks', 'oak_planks'
      ],
      result: { id: 'chest', count: 1 },
      requiredStation: 'workbench',
    },
    // Wooden Door
    {
      id: 'wood_door',
      width: 2,
      height: 3,
      pattern: [
        'oak_planks', 'oak_planks',
        'oak_planks', 'oak_planks',
        'oak_planks', 'oak_planks'
      ],
      result: { id: 'wood_door', count: 3 },
      requiredStation: 'workbench',
    },
    // Ladder
    {
      id: 'ladder',
      width: 3,
      height: 3,
      pattern: [
        'stick', null,    'stick',
        'stick', 'stick', 'stick',
        'stick', null,    'stick'
      ],
      result: { id: 'ladder', count: 3 },
      requiredStation: 'workbench',
    },

    // Pickaxes (3x3)
    {
      id: 'wood_pickaxe_3x3',
      width: 3,
      height: 3,
      pattern: [
        'oak_planks', 'oak_planks', 'oak_planks',
        null,         'stick',      null,
        null,         'stick',      null
      ],
      result: { id: 'wood_pickaxe', count: 1 },
      requiredStation: 'workbench',
    },
    {
      id: 'stone_pickaxe',
      width: 3,
      height: 3,
      pattern: [
        'cobblestone', 'cobblestone', 'cobblestone',
        null,          'stick',       null,
        null,          'stick',       null
      ],
      result: { id: 'stone_pickaxe', count: 1 },
      requiredStation: 'workbench',
    },
    {
      id: 'iron_pickaxe',
      width: 3,
      height: 3,
      pattern: [
        'iron_ingot', 'iron_ingot', 'iron_ingot',
        null,         'stick',      null,
        null,         'stick',      null
      ],
      result: { id: 'iron_pickaxe', count: 1 },
      requiredStation: 'workbench',
    },
    {
      id: 'gold_pickaxe',
      width: 3,
      height: 3,
      pattern: [
        'gold_ingot', 'gold_ingot', 'gold_ingot',
        null,         'stick',      null,
        null,         'stick',      null
      ],
      result: { id: 'gold_pickaxe', count: 1 },
      requiredStation: 'workbench',
    },
    {
      id: 'diamond_pickaxe',
      width: 3,
      height: 3,
      pattern: [
        'diamond', 'diamond', 'diamond',
        null,      'stick',   null,
        null,      'stick',   null
      ],
      result: { id: 'diamond_pickaxe', count: 1 },
      requiredStation: 'workbench',
    },

    // Swords (3x3)
    {
      id: 'stone_sword',
      width: 1,
      height: 3,
      pattern: [
        'cobblestone',
        'cobblestone',
        'stick'
      ],
      result: { id: 'stone_sword', count: 1 },
      requiredStation: 'workbench',
    },
    {
      id: 'iron_sword',
      width: 1,
      height: 3,
      pattern: [
        'iron_ingot',
        'iron_ingot',
        'stick'
      ],
      result: { id: 'iron_sword', count: 1 },
      requiredStation: 'workbench',
    },
    {
      id: 'diamond_sword',
      width: 1,
      height: 3,
      pattern: [
        'diamond',
        'diamond',
        'stick'
      ],
      result: { id: 'diamond_sword', count: 1 },
      requiredStation: 'workbench',
    },

    // Axes (3x3)
    {
      id: 'wood_axe',
      width: 2,
      height: 3,
      pattern: [
        'oak_planks', 'oak_planks',
        'oak_planks', 'stick',
        null,         'stick'
      ],
      result: { id: 'wood_axe', count: 1 },
      requiredStation: 'workbench',
    },
    {
      id: 'stone_axe',
      width: 2,
      height: 3,
      pattern: [
        'cobblestone', 'cobblestone',
        'cobblestone', 'stick',
        null,          'stick'
      ],
      result: { id: 'stone_axe', count: 1 },
      requiredStation: 'workbench',
    },
    {
      id: 'iron_axe',
      width: 2,
      height: 3,
      pattern: [
        'iron_ingot', 'iron_ingot',
        'iron_ingot', 'stick',
        null,         'stick'
      ],
      result: { id: 'iron_axe', count: 1 },
      requiredStation: 'workbench',
    },
    {
      id: 'diamond_axe',
      width: 2,
      height: 3,
      pattern: [
        'diamond', 'diamond',
        'diamond', 'stick',
        null,      'stick'
      ],
      result: { id: 'diamond_axe', count: 1 },
      requiredStation: 'workbench',
    },

    // Shovels
    {
      id: 'wood_shovel',
      width: 1,
      height: 3,
      pattern: ['oak_planks', 'stick', 'stick'],
      result: { id: 'wood_shovel', count: 1 },
      requiredStation: 'workbench',
    },
    {
      id: 'stone_shovel',
      width: 1,
      height: 3,
      pattern: ['cobblestone', 'stick', 'stick'],
      result: { id: 'stone_shovel', count: 1 },
      requiredStation: 'workbench',
    },
    {
      id: 'iron_shovel',
      width: 1,
      height: 3,
      pattern: ['iron_ingot', 'stick', 'stick'],
      result: { id: 'iron_shovel', count: 1 },
      requiredStation: 'workbench',
    },
    {
      id: 'diamond_shovel',
      width: 1,
      height: 3,
      pattern: ['diamond', 'stick', 'stick'],
      result: { id: 'diamond_shovel', count: 1 },
      requiredStation: 'workbench',
    },

    // Bread (3 Wheat)
    {
      id: 'bread',
      width: 3,
      height: 1,
      pattern: ['wheat', 'wheat', 'wheat'],
      result: { id: 'bread', count: 1 },
      requiredStation: 'workbench',
    },

    // Bow & Arrow
    {
      id: 'bow',
      width: 3,
      height: 3,
      pattern: [
        null,    'stick', 'stick',
        'stick', null,    'stick',
        null,    'stick', 'stick'
      ],
      result: { id: 'bow', count: 1 },
      requiredStation: 'workbench',
    },
    {
      id: 'arrow',
      width: 1,
      height: 3,
      pattern: ['flint', 'stick', 'apple'],
      result: { id: 'arrow', count: 4 },
      requiredStation: 'workbench',
    },
  ];

  /**
   * Resolves crafting output given a grid matrix of item IDs
   */
  public static findRecipe(
    grid: (ItemStack | null)[],
    gridWidth: number,
    gridHeight: number,
    station: 'hand' | 'workbench'
  ): { recipe: RecipePattern; result: ItemStack } | null {
    // 1. Trim empty rows and columns to find active bounding box
    let minX = gridWidth;
    let maxX = -1;
    let minY = gridHeight;
    let maxY = -1;

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const item = grid[y * gridWidth + x];
        if (item && item.count > 0) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX === -1) return null; // empty grid

    const activeW = maxX - minX + 1;
    const activeH = maxY - minY + 1;

    // Build flattened active pattern
    const activePattern: (string | null)[] = [];
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const item = grid[y * gridWidth + x];
        activePattern.push(item && item.count > 0 ? item.id : null);
      }
    }

    for (const recipe of this.RECIPES) {
      if (recipe.requiredStation === 'workbench' && station === 'hand') {
        continue;
      }
      if (recipe.width === activeW && recipe.height === activeH) {
        let match = true;
        for (let i = 0; i < activePattern.length; i++) {
          if (activePattern[i] !== recipe.pattern[i]) {
            match = false;
            break;
          }
        }
        if (match) {
          return { recipe, result: { ...recipe.result } };
        }
      }
    }

    return null;
  }
}
