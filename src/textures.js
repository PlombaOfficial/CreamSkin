/**
 * 3D MINECRAFT // PROCEDURAL 3D TEXTURE ATLAS FOR THREE.JS
 * Generates a unified pixel-perfect texture atlas for all voxel cube faces.
 */

import { BLOCKS, ITEMS } from "./items-recipes.js";

export class VoxelTextureAtlas {
  constructor() {
    this.tileSize = 16;
    this.atlasCols = 8;
    this.atlasRows = 8;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.tileSize * this.atlasCols; // 128px
    this.canvas.height = this.tileSize * this.atlasRows; // 128px
    this.ctx = this.canvas.getContext('2d');

    this.tileIndices = {}; // Block face -> { col, row }
    this.generateAtlas();

    this.threeTexture = new THREE.CanvasTexture(this.canvas);
    this.threeTexture.magFilter = THREE.NearestFilter;
    this.threeTexture.minFilter = THREE.NearestFilter;
    this.threeTexture.generateMipmaps = false;
  }

  generateAtlas() {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;

    // Define Face Coordinates in Atlas
    const map = [
      // row 0
      { id: 'grass_top', draw: (c) => this.drawGrassTop(c) },
      { id: 'grass_side', draw: (c) => this.drawGrassSide(c) },
      { id: 'dirt', draw: (c) => this.drawDirt(c) },
      { id: 'stone', draw: (c) => this.drawStone(c) },
      { id: 'cobblestone', draw: (c) => this.drawCobble(c) },
      { id: 'wood_side', draw: (c) => this.drawWoodSide(c) },
      { id: 'wood_top', draw: (c) => this.drawWoodTop(c) },
      { id: 'planks', draw: (c) => this.drawPlanks(c) },

      // row 1
      { id: 'leaves', draw: (c) => this.drawLeaves(c) },
      { id: 'sand', draw: (c) => this.drawSand(c) },
      { id: 'glass', draw: (c) => this.drawGlass(c) },
      { id: 'bedrock', draw: (c) => this.drawBedrock(c) },
      { id: 'coal_ore', draw: (c) => this.drawOre(c, '#222', '#111') },
      { id: 'copper_ore', draw: (c) => this.drawOre(c, '#d97d43', '#8c4820') },
      { id: 'iron_ore', draw: (c) => this.drawOre(c, '#d8af93', '#9c7358') },
      { id: 'gold_ore', draw: (c) => this.drawOre(c, '#fcee4b', '#bfae18') },

      // row 2
      { id: 'diamond_ore', draw: (c) => this.drawOre(c, '#5decf2', '#1aa8b3') },
      { id: 'obsidian', draw: (c) => this.drawObsidian(c) },
      { id: 'netherrack', draw: (c) => this.drawNetherrack(c) },
      { id: 'glowstone', draw: (c) => this.drawGlowstone(c) },
      { id: 'crafting_top', draw: (c) => this.drawCraftingTop(c) },
      { id: 'crafting_side', draw: (c) => this.drawCraftingSide(c) },
      { id: 'furnace_front', draw: (c) => this.drawFurnaceFront(c) },
      { id: 'furnace_side', draw: (c) => this.drawStone(c) },

      // row 3
      { id: 'chest_top', draw: (c) => this.drawChestTop(c) },
      { id: 'chest_side', draw: (c) => this.drawChestSide(c) },
      { id: 'tnt_side', draw: (c) => this.drawTNT(c) },
      { id: 'tnt_top', draw: (c) => this.drawPlanks(c) },
      { id: 'water', draw: (c) => this.drawWater(c) },
      { id: 'lava', draw: (c) => this.drawLava(c) }
    ];

    map.forEach((item, idx) => {
      const col = idx % this.atlasCols;
      const row = Math.floor(idx / this.atlasCols);
      this.tileIndices[item.id] = { col, row };

      const c = document.createElement('canvas');
      c.width = 16;
      c.height = 16;
      item.draw(c.getContext('2d'));
      ctx.drawImage(c, col * this.tileSize, row * this.tileSize);
    });
  }

  getUVs(faceId) {
    const tile = this.tileIndices[faceId] || this.tileIndices['stone'];
    const u0 = tile.col / this.atlasCols;
    const v0 = 1.0 - (tile.row + 1) / this.atlasRows;
    const u1 = (tile.col + 1) / this.atlasCols;
    const v1 = 1.0 - tile.row / this.atlasRows;

    return [u0, v0, u1, v1];
  }

  // Drawers
  drawGrassTop(ctx) {
    ctx.fillStyle = '#5b8c32'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#73ab3e'; ctx.fillRect(2, 2, 4, 3); ctx.fillRect(9, 7, 5, 4);
  }

  drawGrassSide(ctx) {
    ctx.fillStyle = '#866043'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#5b8c32'; ctx.fillRect(0, 0, 16, 4);
    ctx.fillRect(1, 4, 2, 2); ctx.fillRect(6, 4, 3, 3); ctx.fillRect(12, 4, 2, 2);
  }

  drawDirt(ctx) {
    ctx.fillStyle = '#866043'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#654832'; ctx.fillRect(2, 2, 3, 2); ctx.fillRect(9, 5, 2, 3);
  }

  drawStone(ctx) {
    ctx.fillStyle = '#737373'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#555555'; ctx.fillRect(3, 3, 3, 2); ctx.fillRect(10, 8, 4, 2);
  }

  drawCobble(ctx) {
    ctx.fillStyle = '#5c5c5c'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#3a3a3a'; ctx.fillRect(0, 7, 16, 1); ctx.fillRect(7, 0, 1, 7);
    ctx.fillStyle = '#7a7a7a'; ctx.fillRect(1, 1, 5, 5); ctx.fillRect(9, 1, 6, 5);
  }

  drawWoodSide(ctx) {
    ctx.fillStyle = '#674d2b'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#48351d'; ctx.fillRect(3, 0, 2, 16); ctx.fillRect(9, 0, 2, 16);
  }

  drawWoodTop(ctx) {
    ctx.fillStyle = '#674d2b'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#9e7344'; ctx.fillRect(2, 2, 12, 12);
    ctx.fillStyle = '#674d2b'; ctx.fillRect(5, 5, 6, 6);
  }

  drawPlanks(ctx) {
    ctx.fillStyle = '#a0784a'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#6b4e2d'; ctx.fillRect(0, 3, 16, 1); ctx.fillRect(0, 7, 16, 1); ctx.fillRect(0, 11, 16, 1);
  }

  drawLeaves(ctx) {
    ctx.fillStyle = '#2f5e18'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#427d24'; ctx.fillRect(2, 2, 4, 3); ctx.fillRect(9, 1, 5, 4);
  }

  drawSand(ctx) {
    ctx.fillStyle = '#d9cb91'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#c4b576'; ctx.fillRect(3, 3, 2, 1); ctx.fillRect(10, 7, 2, 1);
  }

  drawGlass(ctx) {
    ctx.fillStyle = 'rgba(180, 220, 240, 0.4)'; ctx.fillRect(0, 0, 16, 16);
    ctx.strokeStyle = '#c2e3f2'; ctx.strokeRect(0, 0, 16, 16);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(3, 3, 2, 2);
  }

  drawBedrock(ctx) {
    ctx.fillStyle = '#1c1c1c'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(2, 2, 5, 4); ctx.fillRect(10, 4, 4, 5);
  }

  drawOre(ctx, gemColor, gemDark) {
    this.drawStone(ctx);
    ctx.fillStyle = gemDark; ctx.fillRect(4, 4, 4, 4); ctx.fillRect(10, 9, 4, 4);
    ctx.fillStyle = gemColor; ctx.fillRect(5, 5, 2, 2); ctx.fillRect(11, 10, 2, 2);
  }

  drawObsidian(ctx) {
    ctx.fillStyle = '#140c1e'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#261738'; ctx.fillRect(2, 2, 4, 3);
  }

  drawNetherrack(ctx) {
    ctx.fillStyle = '#661616'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#450d0d'; ctx.fillRect(2, 3, 4, 3);
  }

  drawGlowstone(ctx) {
    ctx.fillStyle = '#f0a73a'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#fce46c'; ctx.fillRect(2, 2, 5, 4); ctx.fillRect(9, 8, 5, 5);
  }

  drawCraftingTop(ctx) {
    ctx.fillStyle = '#a0784a'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#4a331c'; ctx.strokeRect(1, 1, 14, 14);
    ctx.fillStyle = '#c79c65'; ctx.fillRect(4, 4, 8, 8);
    ctx.fillStyle = '#3b2816'; ctx.fillRect(7, 4, 1, 8); ctx.fillRect(4, 7, 8, 1);
  }

  drawCraftingSide(ctx) {
    this.drawPlanks(ctx);
    ctx.fillStyle = '#4a331c'; ctx.fillRect(2, 4, 4, 8);
  }

  drawFurnaceFront(ctx) {
    this.drawStone(ctx);
    ctx.fillStyle = '#1c1c1c'; ctx.fillRect(4, 6, 8, 6);
    ctx.fillStyle = '#ff6600'; ctx.fillRect(5, 8, 6, 3);
  }

  drawChestTop(ctx) {
    ctx.fillStyle = '#9e6d38'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#5a3d1c'; ctx.strokeRect(1, 1, 14, 14);
  }

  drawChestSide(ctx) {
    this.drawChestTop(ctx);
    ctx.fillStyle = '#dcdcdc'; ctx.fillRect(7, 6, 2, 4);
  }

  drawTNT(ctx) {
    ctx.fillStyle = '#d92b2b'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 5, 16, 6);
    ctx.fillStyle = '#000000'; ctx.fillRect(2, 6, 3, 4);
  }

  drawWater(ctx) {
    ctx.fillStyle = '#2f5bb8'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; ctx.fillRect(2, 3, 5, 2);
  }

  drawLava(ctx) {
    ctx.fillStyle = '#e64e17'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#fce46c'; ctx.fillRect(3, 4, 4, 2);
  }
}
