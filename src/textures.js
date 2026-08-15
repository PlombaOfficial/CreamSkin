/**
 * 2D MINECRAFT // MASTER PROCEDURAL PIXEL-ART TEXTURE ENGINE
 * Zero emojis! Generates 16x16 pixel-art canvas textures for every block,
 * tool tier, weapon, piece of armor, resource, food, and item.
 */

import { BLOCKS, ITEMS } from "./items-recipes.js";

export class TextureAtlas {
  constructor() {
    this.blockTextures = new Map();
    this.itemTextures = new Map();
    this.generateAll();
  }

  createCanvas(w = 16, h = 16) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return { canvas: c, ctx: c.getContext('2d') };
  }

  generateAll() {
    // 1. BLOCKS
    this.blockTextures.set(BLOCKS.GRASS, this.createGrassTexture());
    this.blockTextures.set(BLOCKS.DIRT, this.createDirtTexture());
    this.blockTextures.set(BLOCKS.STONE, this.createStoneTexture());
    this.blockTextures.set(BLOCKS.COBBLESTONE, this.createCobbleTexture());
    this.blockTextures.set(BLOCKS.OAK_LOG, this.createLogTexture());
    this.blockTextures.set(BLOCKS.OAK_PLANKS, this.createPlanksTexture());
    this.blockTextures.set(BLOCKS.OAK_LEAVES, this.createLeavesTexture());
    this.blockTextures.set(BLOCKS.SAND, this.createSandTexture());
    this.blockTextures.set(BLOCKS.BEDROCK, this.createBedrockTexture());
    
    // Ores
    this.blockTextures.set(BLOCKS.COAL_ORE, this.createOreTexture('#222', '#111'));
    this.blockTextures.set(BLOCKS.COPPER_ORE, this.createOreTexture('#d97d43', '#8c4820'));
    this.blockTextures.set(BLOCKS.IRON_ORE, this.createOreTexture('#d8af93', '#9c7358'));
    this.blockTextures.set(BLOCKS.GOLD_ORE, this.createOreTexture('#fcee4b', '#bfae18'));
    this.blockTextures.set(BLOCKS.DIAMOND_ORE, this.createOreTexture('#5decf2', '#1aa8b3'));
    this.blockTextures.set(BLOCKS.OBSIDIAN, this.createObsidianTexture());
    this.blockTextures.set(BLOCKS.ANCIENT_DEBRIS, this.createOreTexture('#5c4238', '#38251e'));

    // Nether Blocks
    this.blockTextures.set(BLOCKS.NETHERRACK, this.createNetherrackTexture());
    this.blockTextures.set(BLOCKS.GLOWSTONE, this.createGlowstoneTexture());
    this.blockTextures.set(BLOCKS.NETHER_PORTAL, this.createPortalTexture());

    // Functional Blocks
    this.blockTextures.set(BLOCKS.CRAFTING_TABLE, this.createCraftingTableTexture());
    this.blockTextures.set(BLOCKS.FURNACE, this.createFurnaceTexture());
    this.blockTextures.set(BLOCKS.CHEST, this.createChestTexture());
    this.blockTextures.set(BLOCKS.TORCH, this.createTorchTexture());
    this.blockTextures.set(BLOCKS.LADDER, this.createLadderTexture());
    this.blockTextures.set(BLOCKS.GLASS, this.createGlassTexture());
    this.blockTextures.set(BLOCKS.TNT, this.createTNTTexture());
    this.blockTextures.set(BLOCKS.WATER, this.createLiquidTexture('#2f5bb8'));
    this.blockTextures.set(BLOCKS.LAVA, this.createLiquidTexture('#e64e17'));

    // 2. ITEMS & TOOLS (PIXEL ART)
    this.itemTextures.set(ITEMS.STICK, this.createStickTexture());
    this.itemTextures.set(ITEMS.COAL, this.createCoalTexture());
    this.itemTextures.set(ITEMS.RAW_IRON, this.createRawOreTexture('#d8af93'));
    this.itemTextures.set(ITEMS.IRON_INGOT, this.createIngotTexture('#d8d8d8', '#ffffff'));
    this.itemTextures.set(ITEMS.RAW_GOLD, this.createRawOreTexture('#fcee4b'));
    this.itemTextures.set(ITEMS.GOLD_INGOT, this.createIngotTexture('#fcee4b', '#fff888'));
    this.itemTextures.set(ITEMS.DIAMOND, this.createDiamondGemTexture());
    this.itemTextures.set(ITEMS.NETHERITE_SCRAP, this.createRawOreTexture('#59443b'));
    this.itemTextures.set(ITEMS.NETHERITE_INGOT, this.createIngotTexture('#3a322d', '#544a43'));
    this.itemTextures.set(ITEMS.BONE, this.createBoneTexture());
    this.itemTextures.set(ITEMS.STRING, this.createStringTexture());
    this.itemTextures.set(ITEMS.GUNPOWDER, this.createGunpowderTexture());
    this.itemTextures.set(ITEMS.ROTTEN_FLESH, this.createFleshTexture());

    // Food
    this.itemTextures.set(ITEMS.APPLE, this.createAppleTexture('#d92b2b'));
    this.itemTextures.set(ITEMS.RAW_BEEF, this.createMeatTexture('#9e3838'));
    this.itemTextures.set(ITEMS.COOKED_STEAK, this.createMeatTexture('#6b3620'));
    this.itemTextures.set(ITEMS.BREAD, this.createBreadTexture());
    this.itemTextures.set(ITEMS.GOLDEN_APPLE, this.createAppleTexture('#fcee4b'));

    // Tools & Weapons
    this.itemTextures.set(ITEMS.WOOD_SWORD, this.createSwordTexture('#a0784a'));
    this.itemTextures.set(ITEMS.WOOD_PICKAXE, this.createPickaxeTexture('#a0784a'));
    this.itemTextures.set(ITEMS.WOOD_AXE, this.createAxeTexture('#a0784a'));
    this.itemTextures.set(ITEMS.STONE_SWORD, this.createSwordTexture('#737373'));
    this.itemTextures.set(ITEMS.STONE_PICKAXE, this.createPickaxeTexture('#737373'));
    this.itemTextures.set(ITEMS.STONE_AXE, this.createAxeTexture('#737373'));
    this.itemTextures.set(ITEMS.IRON_SWORD, this.createSwordTexture('#d8d8d8'));
    this.itemTextures.set(ITEMS.IRON_PICKAXE, this.createPickaxeTexture('#d8d8d8'));
    this.itemTextures.set(ITEMS.IRON_AXE, this.createAxeTexture('#d8d8d8'));
    this.itemTextures.set(ITEMS.DIAMOND_SWORD, this.createSwordTexture('#5decf2'));
    this.itemTextures.set(ITEMS.DIAMOND_PICKAXE, this.createPickaxeTexture('#5decf2'));
    this.itemTextures.set(ITEMS.DIAMOND_AXE, this.createAxeTexture('#5decf2'));
    this.itemTextures.set(ITEMS.NETHERITE_SWORD, this.createSwordTexture('#3a322d'));
    this.itemTextures.set(ITEMS.NETHERITE_PICKAXE, this.createPickaxeTexture('#3a322d'));

    // Armor & Bow
    this.itemTextures.set(ITEMS.IRON_HELMET, this.createArmorTexture('helmet', '#d8d8d8'));
    this.itemTextures.set(ITEMS.IRON_CHESTPLATE, this.createArmorTexture('chest', '#d8d8d8'));
    this.itemTextures.set(ITEMS.IRON_LEGGINGS, this.createArmorTexture('legs', '#d8d8d8'));
    this.itemTextures.set(ITEMS.IRON_BOOTS, this.createArmorTexture('boots', '#d8d8d8'));
    this.itemTextures.set(ITEMS.DIAMOND_HELMET, this.createArmorTexture('helmet', '#5decf2'));
    this.itemTextures.set(ITEMS.DIAMOND_CHESTPLATE, this.createArmorTexture('chest', '#5decf2'));
    this.itemTextures.set(ITEMS.DIAMOND_LEGGINGS, this.createArmorTexture('legs', '#5decf2'));
    this.itemTextures.set(ITEMS.DIAMOND_BOOTS, this.createArmorTexture('boots', '#5decf2'));
    this.itemTextures.set(ITEMS.NETHERITE_ARMOR, this.createArmorTexture('chest', '#3a322d'));
    this.itemTextures.set(ITEMS.BOW, this.createBowTexture());
    this.itemTextures.set(ITEMS.ARROW, this.createArrowTexture());
    this.itemTextures.set(ITEMS.EYE_OF_ENDER, this.createEnderEyeTexture());
  }

  // --- BLOCK TEXTURES ---
  createGrassTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#866043'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#654832'; ctx.fillRect(2, 6, 2, 2); ctx.fillRect(10, 12, 2, 2);
    ctx.fillStyle = '#5b8c32'; ctx.fillRect(0, 0, 16, 4);
    ctx.fillRect(1, 4, 2, 2); ctx.fillRect(5, 4, 3, 3); ctx.fillRect(11, 4, 2, 2);
    ctx.fillStyle = '#73ab3e'; ctx.fillRect(0, 0, 16, 1); ctx.fillRect(4, 1, 3, 1);
    return canvas;
  }

  createDirtTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#866043'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#654832'; ctx.fillRect(2, 2, 3, 2); ctx.fillRect(9, 5, 2, 3); ctx.fillRect(4, 11, 3, 2);
    ctx.fillStyle = '#a07452'; ctx.fillRect(7, 1, 2, 2); ctx.fillRect(1, 8, 2, 2);
    return canvas;
  }

  createStoneTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#737373'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#555555'; ctx.fillRect(3, 3, 3, 2); ctx.fillRect(10, 8, 4, 2); ctx.fillRect(2, 12, 4, 2);
    ctx.fillStyle = '#8c8c8c'; ctx.fillRect(7, 1, 3, 2); ctx.fillRect(1, 6, 2, 2);
    return canvas;
  }

  createCobbleTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#5c5c5c'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#3a3a3a'; ctx.fillRect(0, 7, 16, 1); ctx.fillRect(7, 0, 1, 7); ctx.fillRect(10, 8, 1, 8);
    ctx.fillStyle = '#7a7a7a'; ctx.fillRect(1, 1, 5, 5); ctx.fillRect(9, 1, 6, 5); ctx.fillRect(1, 9, 8, 5);
    return canvas;
  }

  createLogTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#674d2b'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#48351d'; ctx.fillRect(3, 0, 2, 16); ctx.fillRect(9, 0, 2, 16);
    ctx.fillStyle = '#7d5e35'; ctx.fillRect(1, 0, 1, 16); ctx.fillRect(6, 0, 2, 16);
    return canvas;
  }

  createPlanksTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#a0784a'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#6b4e2d'; ctx.fillRect(0, 3, 16, 1); ctx.fillRect(0, 7, 16, 1); ctx.fillRect(0, 11, 16, 1);
    ctx.fillStyle = '#b88b56'; ctx.fillRect(0, 0, 16, 1); ctx.fillRect(0, 4, 16, 1); ctx.fillRect(0, 8, 16, 1);
    return canvas;
  }

  createLeavesTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#2f5e18'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#427d24'; ctx.fillRect(2, 2, 4, 3); ctx.fillRect(9, 1, 5, 4); ctx.fillRect(3, 9, 6, 4);
    ctx.fillStyle = '#1e3d10'; ctx.fillRect(0, 6, 2, 2); ctx.fillRect(7, 6, 2, 2);
    return canvas;
  }

  createSandTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#d9cb91'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#c4b576'; ctx.fillRect(3, 3, 2, 1); ctx.fillRect(10, 7, 2, 1);
    ctx.fillStyle = '#eee2a9'; ctx.fillRect(8, 2, 2, 1);
    return canvas;
  }

  createBedrockTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#1c1c1c'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(2, 2, 5, 4); ctx.fillRect(10, 4, 4, 5);
    ctx.fillStyle = '#383838'; ctx.fillRect(8, 1, 2, 2);
    return canvas;
  }

  createOreTexture(gemColor, gemDark) {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#737373'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#555555'; ctx.fillRect(3, 3, 3, 2); ctx.fillRect(10, 8, 4, 2);
    ctx.fillStyle = gemDark; ctx.fillRect(4, 4, 4, 4); ctx.fillRect(10, 9, 4, 4);
    ctx.fillStyle = gemColor; ctx.fillRect(5, 5, 2, 2); ctx.fillRect(11, 10, 2, 2); ctx.fillRect(2, 11, 3, 3);
    return canvas;
  }

  createObsidianTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#140c1e'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#261738'; ctx.fillRect(2, 2, 4, 3); ctx.fillRect(9, 8, 5, 4);
    ctx.fillStyle = '#4c2d73'; ctx.fillRect(4, 3, 1, 1); ctx.fillRect(11, 9, 1, 1);
    return canvas;
  }

  createNetherrackTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#661616'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#450d0d'; ctx.fillRect(2, 3, 4, 3); ctx.fillRect(8, 9, 5, 3);
    ctx.fillStyle = '#8a2323'; ctx.fillRect(6, 1, 3, 2); ctx.fillRect(1, 11, 3, 2);
    return canvas;
  }

  createGlowstoneTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#f0a73a'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#fce46c'; ctx.fillRect(2, 2, 5, 4); ctx.fillRect(9, 8, 5, 5);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(4, 3, 2, 2); ctx.fillRect(11, 9, 2, 2);
    return canvas;
  }

  createPortalTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#491070'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#7a1dbd'; ctx.fillRect(2, 0, 4, 16); ctx.fillRect(10, 0, 4, 16);
    ctx.fillStyle = '#b846ff'; ctx.fillRect(4, 4, 8, 8);
    return canvas;
  }

  createCraftingTableTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#a0784a'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#4a331c'; ctx.strokeRect(1, 1, 14, 14);
    ctx.fillStyle = '#c79c65'; ctx.fillRect(4, 4, 8, 8);
    ctx.fillStyle = '#3b2816'; ctx.fillRect(7, 4, 1, 8); ctx.fillRect(4, 7, 8, 1);
    return canvas;
  }

  createFurnaceTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#5c5c5c'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#1c1c1c'; ctx.fillRect(4, 6, 8, 6);
    ctx.fillStyle = '#ff6600'; ctx.fillRect(5, 8, 6, 3);
    ctx.fillStyle = '#ffff00'; ctx.fillRect(6, 9, 4, 1);
    return canvas;
  }

  createChestTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#9e6d38'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#5a3d1c'; ctx.strokeRect(1, 1, 14, 14);
    ctx.fillStyle = '#dcdcdc'; ctx.fillRect(7, 6, 2, 4);
    return canvas;
  }

  createTorchTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#674d2b'; ctx.fillRect(7, 6, 2, 10);
    ctx.fillStyle = '#ff9900'; ctx.fillRect(6, 3, 4, 4);
    ctx.fillStyle = '#ffff55'; ctx.fillRect(7, 2, 2, 3);
    return canvas;
  }

  createLadderTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#7d5830';
    ctx.fillRect(2, 0, 2, 16); ctx.fillRect(12, 0, 2, 16);
    ctx.fillRect(2, 3, 12, 2); ctx.fillRect(2, 8, 12, 2); ctx.fillRect(2, 13, 12, 2);
    return canvas;
  }

  createGlassTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = 'rgba(180, 220, 240, 0.4)'; ctx.fillRect(0, 0, 16, 16);
    ctx.strokeStyle = '#c2e3f2'; ctx.strokeRect(0, 0, 16, 16);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(3, 3, 2, 2); ctx.fillRect(5, 5, 2, 2);
    return canvas;
  }

  createTNTTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#d92b2b'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 5, 16, 6);
    ctx.fillStyle = '#000000'; ctx.fillRect(2, 6, 3, 4); ctx.fillRect(7, 6, 2, 4); ctx.fillRect(11, 6, 3, 4);
    return canvas;
  }

  createLiquidTexture(color) {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = color; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(2, 3, 5, 2); ctx.fillRect(9, 7, 5, 2);
    return canvas;
  }

  // --- ITEM TEXTURES (NO EMOJIS) ---

  createStickTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#674d2b';
    for (let i = 0; i < 12; i++) ctx.fillRect(14 - i, 2 + i, 2, 2);
    return canvas;
  }

  createCoalTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#1c1c1c'; ctx.fillRect(4, 4, 8, 8);
    ctx.fillStyle = '#333333'; ctx.fillRect(5, 5, 4, 4);
    return canvas;
  }

  createRawOreTexture(color) {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = color; ctx.fillRect(4, 4, 8, 8);
    ctx.fillStyle = '#555555'; ctx.fillRect(3, 5, 2, 4); ctx.fillRect(9, 8, 2, 3);
    return canvas;
  }

  createIngotTexture(baseColor, highlight) {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = baseColor; ctx.fillRect(3, 6, 10, 5);
    ctx.fillStyle = highlight; ctx.fillRect(4, 6, 8, 2);
    return canvas;
  }

  createDiamondGemTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#5decf2';
    ctx.beginPath(); ctx.moveTo(8, 2); ctx.lineTo(13, 7); ctx.lineTo(8, 14); ctx.lineTo(3, 7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.fillRect(7, 5, 2, 3);
    return canvas;
  }

  createSwordTexture(bladeColor) {
    const { canvas, ctx } = this.createCanvas();
    // Blade
    ctx.fillStyle = bladeColor;
    for (let i = 0; i < 8; i++) ctx.fillRect(13 - i, 2 + i, 2, 2);
    // Guard
    ctx.fillStyle = '#555555'; ctx.fillRect(4, 11, 4, 2); ctx.fillRect(5, 10, 2, 4);
    // Handle
    ctx.fillStyle = '#674d2b'; ctx.fillRect(2, 13, 2, 2);
    return canvas;
  }

  createPickaxeTexture(headColor) {
    const { canvas, ctx } = this.createCanvas();
    // Handle
    ctx.fillStyle = '#674d2b';
    for (let i = 0; i < 10; i++) ctx.fillRect(12 - i, 4 + i, 2, 2);
    // Pick Head
    ctx.fillStyle = headColor;
    ctx.fillRect(8, 2, 6, 3); ctx.fillRect(13, 4, 2, 4); ctx.fillRect(4, 6, 3, 2);
    return canvas;
  }

  createAxeTexture(headColor) {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#674d2b';
    for (let i = 0; i < 10; i++) ctx.fillRect(12 - i, 4 + i, 2, 2);
    ctx.fillStyle = headColor;
    ctx.fillRect(8, 2, 5, 5); ctx.fillRect(6, 4, 3, 4);
    return canvas;
  }

  createArmorTexture(type, color) {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = color;
    if (type === 'helmet') {
      ctx.fillRect(3, 3, 10, 8); ctx.clearRect(6, 7, 4, 4);
    } else if (type === 'chest') {
      ctx.fillRect(2, 3, 12, 10); ctx.clearRect(6, 3, 4, 4);
    } else if (type === 'legs') {
      ctx.fillRect(3, 2, 10, 12); ctx.clearRect(7, 5, 2, 9);
    } else { // Boots
      ctx.fillRect(3, 6, 4, 7); ctx.fillRect(9, 6, 4, 7);
    }
    return canvas;
  }

  createBowTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#674d2b'; ctx.fillRect(3, 3, 3, 10);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(6, 3, 1, 10);
    return canvas;
  }

  createArrowTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#737373'; ctx.fillRect(12, 2, 2, 2);
    ctx.fillStyle = '#674d2b'; for (let i = 0; i < 8; i++) ctx.fillRect(11 - i, 3 + i, 1, 1);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(3, 11, 2, 2);
    return canvas;
  }

  createAppleTexture(color) {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = color; ctx.fillRect(4, 5, 8, 8);
    ctx.fillStyle = '#2f5e18'; ctx.fillRect(8, 2, 2, 3);
    return canvas;
  }

  createMeatTexture(color) {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = color; ctx.fillRect(4, 5, 9, 6);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(2, 7, 3, 2);
    return canvas;
  }

  createBreadTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#b8864b'; ctx.fillRect(3, 6, 10, 5);
    ctx.fillStyle = '#6e451b'; ctx.fillRect(5, 7, 2, 3); ctx.fillRect(9, 7, 2, 3);
    return canvas;
  }

  createBoneTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#e8e8e8'; ctx.fillRect(5, 5, 6, 6);
    ctx.fillRect(3, 3, 3, 3); ctx.fillRect(10, 10, 3, 3);
    return canvas;
  }

  createStringTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, 4, 3, 2); ctx.fillRect(7, 6, 3, 2); ctx.fillRect(9, 9, 3, 2);
    return canvas;
  }

  createGunpowderTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#555555'; ctx.fillRect(4, 5, 8, 6);
    ctx.fillStyle = '#333333'; ctx.fillRect(6, 6, 4, 3);
    return canvas;
  }

  createFleshTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#6e3827'; ctx.fillRect(4, 5, 8, 7);
    ctx.fillStyle = '#3d6e27'; ctx.fillRect(6, 6, 3, 3);
    return canvas;
  }

  createEnderEyeTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#166e5d'; ctx.beginPath(); ctx.arc(8, 8, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#cc2b2b'; ctx.fillRect(7, 5, 2, 6);
    return canvas;
  }
}
