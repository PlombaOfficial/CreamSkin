/**
 * 2D MINECRAFT // PROCEDURAL PIXEL-ART TEXTURE ATLAS
 * Generates authentic 16x16 pixel-art patterns for Grass, Dirt, Stone,
 * Cobblestone, Wood Logs, Planks, Leaves, Ores, Glass, Torches, and Steve.
 */

import { BLOCKS } from "./items-recipes.js";

export class TextureAtlas {
  constructor() {
    this.textures = new Map();
    this.generateAll();
  }

  generateAll() {
    this.textures.set(BLOCKS.GRASS, this.createGrassTexture());
    this.textures.set(BLOCKS.DIRT, this.createDirtTexture());
    this.textures.set(BLOCKS.STONE, this.createStoneTexture());
    this.textures.set(BLOCKS.COBBLESTONE, this.createCobbleTexture());
    this.textures.set(BLOCKS.OAK_LOG, this.createLogTexture());
    this.textures.set(BLOCKS.OAK_PLANKS, this.createPlanksTexture());
    this.textures.set(BLOCKS.OAK_LEAVES, this.createLeavesTexture());
    this.textures.set(BLOCKS.SAND, this.createSandTexture());
    this.textures.set(BLOCKS.BEDROCK, this.createBedrockTexture());
    
    // Ores
    this.textures.set(BLOCKS.COAL_ORE, this.createOreTexture('#222222', '#111111'));
    this.textures.set(BLOCKS.COPPER_ORE, this.createOreTexture('#d97d43', '#8c4820'));
    this.textures.set(BLOCKS.IRON_ORE, this.createOreTexture('#d8af93', '#9c7358'));
    this.textures.set(BLOCKS.GOLD_ORE, this.createOreTexture('#fcee4b', '#bfae18'));
    this.textures.set(BLOCKS.DIAMOND_ORE, this.createOreTexture('#5decf2', '#1aa8b3'));
    this.textures.set(BLOCKS.ANCIENT_DEBRIS, this.createOreTexture('#5c4238', '#38251e'));

    // Utilities
    this.textures.set(BLOCKS.CRAFTING_TABLE, this.createCraftingTableTexture());
    this.textures.set(BLOCKS.FURNACE, this.createFurnaceTexture());
    this.textures.set(BLOCKS.CHEST, this.createChestTexture());
    this.textures.set(BLOCKS.GLASS, this.createGlassTexture());
    this.textures.set(BLOCKS.TNT, this.createTNTTexture());
  }

  createCanvas() {
    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 16;
    return { canvas: c, ctx: c.getContext('2d') };
  }

  createGrassTexture() {
    const { canvas, ctx } = this.createCanvas();
    // Dirt base
    ctx.fillStyle = '#866043';
    ctx.fillRect(0, 0, 16, 16);
    // Darker dirt specks
    ctx.fillStyle = '#654832';
    ctx.fillRect(2, 6, 2, 2);
    ctx.fillRect(10, 12, 2, 2);
    ctx.fillRect(12, 7, 2, 2);

    // Lush Grass Top with hanging fringes
    ctx.fillStyle = '#5b8c32';
    ctx.fillRect(0, 0, 16, 4);
    ctx.fillRect(1, 4, 2, 2);
    ctx.fillRect(5, 4, 3, 3);
    ctx.fillRect(11, 4, 2, 2);
    ctx.fillRect(14, 4, 2, 1);

    // Bright Grass highlights
    ctx.fillStyle = '#73ab3e';
    ctx.fillRect(0, 0, 16, 1);
    ctx.fillRect(3, 1, 3, 1);
    ctx.fillRect(9, 1, 4, 1);

    return canvas;
  }

  createDirtTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#866043';
    ctx.fillRect(0, 0, 16, 16);

    ctx.fillStyle = '#654832';
    ctx.fillRect(2, 2, 3, 2);
    ctx.fillRect(9, 5, 2, 3);
    ctx.fillRect(4, 11, 3, 2);
    ctx.fillRect(12, 12, 2, 2);

    ctx.fillStyle = '#a07452';
    ctx.fillRect(7, 1, 2, 2);
    ctx.fillRect(1, 8, 2, 2);
    ctx.fillRect(11, 9, 2, 2);

    return canvas;
  }

  createStoneTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#737373';
    ctx.fillRect(0, 0, 16, 16);

    ctx.fillStyle = '#555555';
    ctx.fillRect(3, 3, 3, 2);
    ctx.fillRect(10, 8, 4, 2);
    ctx.fillRect(2, 12, 4, 2);

    ctx.fillStyle = '#8c8c8c';
    ctx.fillRect(7, 1, 3, 2);
    ctx.fillRect(1, 6, 2, 2);
    ctx.fillRect(11, 13, 3, 2);

    return canvas;
  }

  createCobbleTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#5c5c5c';
    ctx.fillRect(0, 0, 16, 16);

    // Stone block mortar seams
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, 7, 16, 1);
    ctx.fillRect(7, 0, 1, 7);
    ctx.fillRect(10, 8, 1, 8);

    ctx.fillStyle = '#7a7a7a';
    ctx.fillRect(1, 1, 5, 5);
    ctx.fillRect(9, 1, 6, 5);
    ctx.fillRect(1, 9, 8, 5);
    ctx.fillRect(12, 9, 3, 5);

    return canvas;
  }

  createLogTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#674d2b';
    ctx.fillRect(0, 0, 16, 16);

    // Vertical bark lines
    ctx.fillStyle = '#48351d';
    ctx.fillRect(3, 0, 2, 16);
    ctx.fillRect(9, 0, 2, 16);
    ctx.fillRect(14, 0, 1, 16);

    ctx.fillStyle = '#7d5e35';
    ctx.fillRect(1, 0, 1, 16);
    ctx.fillRect(6, 0, 2, 16);
    ctx.fillRect(12, 0, 1, 16);

    return canvas;
  }

  createPlanksTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#a0784a';
    ctx.fillRect(0, 0, 16, 16);

    // Plank seams
    ctx.fillStyle = '#6b4e2d';
    ctx.fillRect(0, 3, 16, 1);
    ctx.fillRect(0, 7, 16, 1);
    ctx.fillRect(0, 11, 16, 1);
    ctx.fillRect(0, 15, 16, 1);

    ctx.fillStyle = '#b88b56';
    ctx.fillRect(0, 0, 16, 1);
    ctx.fillRect(0, 4, 16, 1);
    ctx.fillRect(0, 8, 16, 1);
    ctx.fillRect(0, 12, 16, 1);

    return canvas;
  }

  createLeavesTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#2f5e18';
    ctx.fillRect(0, 0, 16, 16);

    ctx.fillStyle = '#427d24';
    ctx.fillRect(2, 2, 4, 3);
    ctx.fillRect(9, 1, 5, 4);
    ctx.fillRect(3, 9, 6, 4);
    ctx.fillRect(11, 10, 4, 3);

    ctx.fillStyle = '#1e3d10';
    ctx.fillRect(0, 6, 2, 2);
    ctx.fillRect(7, 6, 2, 2);
    ctx.fillRect(14, 4, 2, 2);

    return canvas;
  }

  createSandTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#d9cb91';
    ctx.fillRect(0, 0, 16, 16);

    ctx.fillStyle = '#c4b576';
    ctx.fillRect(3, 3, 2, 1);
    ctx.fillRect(10, 7, 2, 1);
    ctx.fillRect(4, 12, 2, 1);

    ctx.fillStyle = '#eee2a9';
    ctx.fillRect(8, 2, 2, 1);
    ctx.fillRect(1, 8, 2, 1);

    return canvas;
  }

  createBedrockTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(0, 0, 16, 16);

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(2, 2, 5, 4);
    ctx.fillRect(10, 4, 4, 5);
    ctx.fillRect(3, 10, 6, 4);

    ctx.fillStyle = '#383838';
    ctx.fillRect(8, 1, 2, 2);
    ctx.fillRect(1, 8, 2, 2);
    ctx.fillRect(12, 11, 2, 2);

    return canvas;
  }

  createOreTexture(gemColor, gemDark) {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#737373';
    ctx.fillRect(0, 0, 16, 16);

    ctx.fillStyle = '#555555';
    ctx.fillRect(3, 3, 3, 2);
    ctx.fillRect(10, 8, 4, 2);

    // Glowing Gem Clusters
    ctx.fillStyle = gemDark;
    ctx.fillRect(4, 4, 4, 4);
    ctx.fillRect(10, 9, 4, 4);

    ctx.fillStyle = gemColor;
    ctx.fillRect(5, 5, 2, 2);
    ctx.fillRect(11, 10, 2, 2);
    ctx.fillRect(2, 11, 3, 3);
    ctx.fillRect(8, 2, 3, 2);

    return canvas;
  }

  createCraftingTableTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#a0784a';
    ctx.fillRect(0, 0, 16, 16);

    ctx.fillStyle = '#4a331c';
    ctx.fillRect(0, 0, 16, 2);
    ctx.fillRect(0, 14, 16, 2);
    ctx.fillRect(0, 0, 2, 16);
    ctx.fillRect(14, 0, 2, 16);

    // Grid on side
    ctx.fillStyle = '#c79c65';
    ctx.fillRect(4, 4, 8, 8);
    ctx.fillStyle = '#3b2816';
    ctx.fillRect(7, 4, 1, 8);
    ctx.fillRect(4, 7, 8, 1);

    return canvas;
  }

  createFurnaceTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#5c5c5c';
    ctx.fillRect(0, 0, 16, 16);

    // Furnace mouth opening
    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(4, 6, 8, 6);
    // Fiery glow inside
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(5, 8, 6, 3);
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(6, 9, 4, 1);

    return canvas;
  }

  createChestTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#9e6d38';
    ctx.fillRect(0, 0, 16, 16);

    ctx.fillStyle = '#5a3d1c';
    ctx.strokeRect(1, 1, 14, 14);

    // Lock latch
    ctx.fillStyle = '#dcdcdc';
    ctx.fillRect(7, 6, 2, 4);

    return canvas;
  }

  createGlassTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = 'rgba(180, 220, 240, 0.4)';
    ctx.fillRect(0, 0, 16, 16);

    ctx.strokeStyle = '#c2e3f2';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 16, 16);

    // Glint
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, 3, 2, 2);
    ctx.fillRect(5, 5, 2, 2);

    return canvas;
  }

  createTNTTexture() {
    const { canvas, ctx } = this.createCanvas();
    ctx.fillStyle = '#d92b2b';
    ctx.fillRect(0, 0, 16, 16);

    // White center banner
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 5, 16, 6);

    // TNT Text
    ctx.fillStyle = '#000000';
    ctx.fillRect(2, 6, 3, 4);
    ctx.fillRect(7, 6, 2, 4);
    ctx.fillRect(11, 6, 3, 4);

    return canvas;
  }
}
