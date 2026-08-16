import { BlockType } from '../types';
import { PALETTE, setPixel, pseudoRandom } from './ColorPalette';

export const TILE_SIZE = 16;

export class TextureAtlas {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private spriteLocations: Map<string, { x: number; y: number }> = new Map();
  private nextSlotX = 0;
  private nextSlotY = 0;
  private readonly atlasCols = 32;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.atlasCols * TILE_SIZE; // 512px
    this.canvas.height = 32 * TILE_SIZE; // 512px
    const context = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Could not get 2D context for TextureAtlas');
    this.ctx = context;
    this.ctx.imageSmoothingEnabled = false;

    this.generateAllTextures();
  }

  public getSpriteCoords(key: string): { x: number; y: number } {
    const loc = this.spriteLocations.get(key);
    if (!loc) {
      // Fallback
      return { x: 0, y: 0 };
    }
    return loc;
  }

  private allocateSlot(key: string): { x: number; y: number } {
    const x = this.nextSlotX * TILE_SIZE;
    const y = this.nextSlotY * TILE_SIZE;
    this.spriteLocations.set(key, { x, y });

    this.nextSlotX++;
    if (this.nextSlotX >= this.atlasCols) {
      this.nextSlotX = 0;
      this.nextSlotY++;
    }
    return { x, y };
  }

  private generateAllTextures() {
    this.generateBlocks();
    this.drawBreakOverlays();
    this.drawItems();
    this.drawEntities();
    this.drawParticles();
  }

  private generateBlocks() {
    // 1. GRASS
    this.drawBlock(BlockType.GRASS, (ctx) => {
      // Dirt base
      this.drawDirtPattern(ctx);
      // Grass top layer with blades
      for (let x = 0; x < 16; x++) {
        const bladeDepth = 3 + Math.floor(pseudoRandom(x * 7) * 3);
        for (let y = 0; y < bladeDepth; y++) {
          const col = y === 0 ? PALETTE.grassBright : (y === 1 ? PALETTE.grassNormal : PALETTE.grassDark);
          setPixel(ctx, x, y, col);
        }
      }
    });

    // 2. DIRT
    this.drawBlock(BlockType.DIRT, (ctx) => {
      this.drawDirtPattern(ctx);
    });

    // 3. STONE
    this.drawBlock(BlockType.STONE, (ctx) => {
      this.drawStonePattern(ctx, PALETTE.stoneLight, PALETTE.stoneNormal, PALETTE.stoneDark);
    });

    // 4. COBBLESTONE
    this.drawBlock(BlockType.COBBLESTONE, (ctx) => {
      ctx.fillStyle = PALETTE.stoneDark;
      ctx.fillRect(0, 0, 16, 16);
      // Irregular stone bricks with mortar
      const stones = [
        [1, 1, 6, 4], [8, 1, 7, 3],
        [1, 6, 4, 4], [6, 5, 5, 5], [12, 5, 3, 5],
        [1, 11, 7, 4], [9, 11, 6, 4]
      ];
      for (const [sx, sy, sw, sh] of stones) {
        ctx.fillStyle = PALETTE.stoneNormal;
        ctx.fillRect(sx, sy, sw, sh);
        ctx.fillStyle = PALETTE.stoneLight;
        ctx.fillRect(sx, sy, sw - 1, 1);
        ctx.fillRect(sx, sy, 1, sh - 1);
      }
    });

    // 5. DEEPSLATE
    this.drawBlock(BlockType.DEEPSLATE, (ctx) => {
      this.drawStonePattern(ctx, PALETTE.deepslateLight, PALETTE.deepslateNormal, PALETTE.deepslateDark);
      // Slate striations
      ctx.fillStyle = PALETTE.deepslateDark;
      for (let y = 2; y < 16; y += 4) {
        for (let x = 0; x < 16; x++) {
          if (pseudoRandom(x * 13 + y) > 0.3) setPixel(ctx, x, y, PALETTE.deepslateDark);
        }
      }
    });

    // 6. BEDROCK
    this.drawBlock(BlockType.BEDROCK, (ctx) => {
      ctx.fillStyle = PALETTE.bedrock;
      ctx.fillRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const r = pseudoRandom(x * 37 + y * 91);
          if (r > 0.6) setPixel(ctx, x, y, PALETTE.deepslateDark);
          else if (r > 0.4) setPixel(ctx, x, y, PALETTE.deepslateNormal);
        }
      }
    });

    // 7. SAND
    this.drawBlock(BlockType.SAND, (ctx) => {
      ctx.fillStyle = PALETTE.sandNormal;
      ctx.fillRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const r = pseudoRandom(x * 19 + y * 23);
          if (r > 0.7) setPixel(ctx, x, y, PALETTE.sandLight);
          else if (r < 0.3) setPixel(ctx, x, y, PALETTE.sandDark);
        }
      }
    });

    // 8. SANDSTONE
    this.drawBlock(BlockType.SANDSTONE, (ctx) => {
      ctx.fillStyle = PALETTE.sandNormal;
      ctx.fillRect(0, 0, 16, 16);
      // Horizontal carved strata
      ctx.fillStyle = PALETTE.sandDark;
      ctx.fillRect(0, 4, 16, 1);
      ctx.fillRect(0, 9, 16, 1);
      ctx.fillRect(0, 14, 16, 1);
      ctx.fillStyle = PALETTE.sandLight;
      ctx.fillRect(0, 5, 16, 1);
      ctx.fillRect(0, 10, 16, 1);
    });

    // 9. GRAVEL
    this.drawBlock(BlockType.GRAVEL, (ctx) => {
      ctx.fillStyle = PALETTE.stoneNormal;
      ctx.fillRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const r = pseudoRandom(x * 41 + y * 67);
          if (r > 0.75) setPixel(ctx, x, y, PALETTE.stoneLight);
          else if (r > 0.5) setPixel(ctx, x, y, PALETTE.dirtLight);
          else if (r < 0.25) setPixel(ctx, x, y, PALETTE.stoneDark);
        }
      }
    });

    // 10. SNOW GRASS
    this.drawBlock(BlockType.SNOW_GRASS, (ctx) => {
      this.drawDirtPattern(ctx);
      ctx.fillStyle = PALETTE.snowPure;
      ctx.fillRect(0, 0, 16, 3);
      for (let x = 0; x < 16; x++) {
        if (pseudoRandom(x * 11) > 0.4) setPixel(ctx, x, 3, PALETTE.snowPure);
        if (pseudoRandom(x * 17) > 0.7) setPixel(ctx, x, 4, PALETTE.snowShade);
      }
    });

    // 11. SNOW
    this.drawBlock(BlockType.SNOW, (ctx) => {
      ctx.fillStyle = PALETTE.snowPure;
      ctx.fillRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          if (pseudoRandom(x * 13 + y * 29) > 0.8) setPixel(ctx, x, y, PALETTE.snowShade);
        }
      }
    });

    // 12. ICE
    this.drawBlock(BlockType.ICE, (ctx) => {
      ctx.fillStyle = PALETTE.iceBase;
      ctx.fillRect(0, 0, 16, 16);
      // Ice crystal cracks & sheen
      ctx.fillStyle = PALETTE.iceGlint;
      ctx.beginPath();
      ctx.moveTo(2, 2); ctx.lineTo(7, 7);
      ctx.moveTo(10, 3); ctx.lineTo(14, 7);
      ctx.moveTo(4, 11); ctx.lineTo(8, 15);
      ctx.strokeStyle = PALETTE.iceGlint;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.strokeStyle = PALETTE.iceDeep;
      ctx.beginPath();
      ctx.moveTo(8, 7); ctx.lineTo(13, 12);
      ctx.stroke();
    });

    // 13. OAK LOG
    this.drawBlock(BlockType.OAK_LOG, (ctx) => {
      ctx.fillStyle = PALETTE.oakBarkNormal;
      ctx.fillRect(0, 0, 16, 16);
      for (let x = 0; x < 16; x += 4) {
        ctx.fillStyle = PALETTE.oakBarkDark;
        ctx.fillRect(x, 0, 1, 16);
        ctx.fillStyle = PALETTE.oakBarkLight;
        ctx.fillRect(x + 1, 0, 1, 16);
      }
      for (let y = 0; y < 16; y += 3) {
        for (let x = 0; x < 16; x++) {
          if (pseudoRandom(x * 5 + y * 13) > 0.7) setPixel(ctx, x, y, PALETTE.oakBarkDark);
        }
      }
    });

    // 14. BIRCH LOG
    this.drawBlock(BlockType.BIRCH_LOG, (ctx) => {
      ctx.fillStyle = PALETTE.birchBarkLight;
      ctx.fillRect(0, 0, 16, 16);
      // Dark birch bark notches
      const notches = [[2, 3], [3, 3], [9, 7], [10, 7], [11, 7], [4, 12], [5, 12], [13, 14]];
      ctx.fillStyle = PALETTE.birchBarkDark;
      for (const [nx, ny] of notches) {
        ctx.fillRect(nx, ny, 2, 1);
      }
    });

    // 15. OAK PLANKS
    this.drawBlock(BlockType.OAK_PLANKS, (ctx) => {
      ctx.fillStyle = PALETTE.oakWoodNormal;
      ctx.fillRect(0, 0, 16, 16);
      // 4 horizontal boards
      for (let y = 0; y < 16; y += 4) {
        ctx.fillStyle = PALETTE.oakWoodDark;
        ctx.fillRect(0, y, 16, 1);
        ctx.fillStyle = PALETTE.oakWoodLight;
        ctx.fillRect(0, y + 1, 16, 1);
      }
      // Vertical seam lines & nails
      ctx.fillStyle = PALETTE.oakWoodDark;
      ctx.fillRect(6, 0, 1, 4);
      ctx.fillRect(11, 4, 1, 4);
      ctx.fillRect(4, 8, 1, 4);
      ctx.fillRect(12, 12, 1, 4);
    });

    // 16. BIRCH PLANKS
    this.drawBlock(BlockType.BIRCH_PLANKS, (ctx) => {
      ctx.fillStyle = PALETTE.birchWoodNormal;
      ctx.fillRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y += 4) {
        ctx.fillStyle = PALETTE.birchWoodDark;
        ctx.fillRect(0, y, 16, 1);
        ctx.fillStyle = PALETTE.birchWoodLight;
        ctx.fillRect(0, y + 1, 16, 1);
      }
    });

    // 17. OAK LEAVES
    this.drawBlock(BlockType.OAK_LEAVES, (ctx) => {
      ctx.fillStyle = PALETTE.grassDark;
      ctx.fillRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const r = pseudoRandom(x * 31 + y * 47);
          if (r > 0.65) setPixel(ctx, x, y, PALETTE.grassBright);
          else if (r > 0.35) setPixel(ctx, x, y, PALETTE.grassNormal);
          else if (r < 0.15) {
            // Cutout transparent leaf hole
            ctx.clearRect(x, y, 1, 1);
          }
        }
      }
    });

    // 18. BIRCH LEAVES
    this.drawBlock(BlockType.BIRCH_LEAVES, (ctx) => {
      ctx.fillStyle = PALETTE.grassNormal;
      ctx.fillRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const r = pseudoRandom(x * 23 + y * 59);
          if (r > 0.65) setPixel(ctx, x, y, PALETTE.grassBirch);
          else if (r < 0.15) ctx.clearRect(x, y, 1, 1);
        }
      }
    });

    // 19. CACTUS
    this.drawBlock(BlockType.CACTUS, (ctx) => {
      ctx.fillStyle = PALETTE.grassDark;
      ctx.fillRect(0, 0, 16, 16);
      // Vertical ridges
      for (let x = 2; x < 16; x += 4) {
        ctx.fillStyle = PALETTE.grassBright;
        ctx.fillRect(x, 0, 2, 16);
      }
      // Spikes
      ctx.fillStyle = '#ffffff';
      const spikes = [[0, 3], [15, 5], [0, 9], [15, 11], [0, 14]];
      for (const [sx, sy] of spikes) {
        setPixel(ctx, sx, sy, '#ffffff');
      }
    });

    // 20. COAL ORE
    this.drawBlock(BlockType.COAL_ORE, (ctx) => {
      this.drawStonePattern(ctx, PALETTE.stoneLight, PALETTE.stoneNormal, PALETTE.stoneDark);
      this.drawOreFlecks(ctx, PALETTE.oreCoal, PALETTE.oreCoalGlint);
    });

    // 21. IRON ORE
    this.drawBlock(BlockType.IRON_ORE, (ctx) => {
      this.drawStonePattern(ctx, PALETTE.stoneLight, PALETTE.stoneNormal, PALETTE.stoneDark);
      this.drawOreFlecks(ctx, PALETTE.oreIron, PALETTE.oreIronGlint);
    });

    // 22. GOLD ORE
    this.drawBlock(BlockType.GOLD_ORE, (ctx) => {
      this.drawStonePattern(ctx, PALETTE.stoneLight, PALETTE.stoneNormal, PALETTE.stoneDark);
      this.drawOreFlecks(ctx, PALETTE.oreGold, PALETTE.oreGoldGlint);
    });

    // 23. DIAMOND ORE
    this.drawBlock(BlockType.DIAMOND_ORE, (ctx) => {
      this.drawStonePattern(ctx, PALETTE.stoneLight, PALETTE.stoneNormal, PALETTE.stoneDark);
      this.drawOreFlecks(ctx, PALETTE.oreDiamond, PALETTE.oreDiamondGlint);
    });

    // 24. REDSTONE ORE
    this.drawBlock(BlockType.REDSTONE_ORE, (ctx) => {
      this.drawStonePattern(ctx, PALETTE.stoneLight, PALETTE.stoneNormal, PALETTE.stoneDark);
      this.drawOreFlecks(ctx, PALETTE.oreRedstone, PALETTE.oreRedstoneGlint);
    });

    // 25. EMERALD ORE
    this.drawBlock(BlockType.EMERALD_ORE, (ctx) => {
      this.drawStonePattern(ctx, PALETTE.stoneLight, PALETTE.stoneNormal, PALETTE.stoneDark);
      this.drawOreFlecks(ctx, PALETTE.oreEmerald, PALETTE.oreEmeraldGlint);
    });

    // 26. CRAFTING TABLE
    this.drawBlock(BlockType.CRAFTING_TABLE, (ctx) => {
      ctx.fillStyle = PALETTE.oakWoodNormal;
      ctx.fillRect(0, 0, 16, 16);
      // Border frame
      ctx.fillStyle = PALETTE.oakWoodDark;
      ctx.strokeRect(0.5, 0.5, 15, 15);
      // Tool silhouettes on side
      // Saw / Hammer / Grid
      ctx.fillStyle = PALETTE.stoneDark;
      ctx.fillRect(3, 4, 3, 8); // Saw blade
      ctx.fillStyle = PALETTE.oakBarkNormal;
      ctx.fillRect(3, 12, 3, 2); // Handle
      // Pliers
      ctx.fillStyle = PALETTE.oreIron;
      ctx.fillRect(9, 4, 4, 2);
      ctx.fillRect(10, 6, 2, 6);
    });

    // 27. FURNACE
    this.drawBlock(BlockType.FURNACE, (ctx) => {
      this.drawStonePattern(ctx, PALETTE.stoneLight, PALETTE.stoneNormal, PALETTE.stoneDark);
      // Front opening (arch)
      ctx.fillStyle = PALETTE.bedrock;
      ctx.fillRect(3, 6, 10, 8);
      ctx.fillRect(4, 5, 8, 1);
      ctx.fillRect(5, 4, 6, 1);
    });

    // 28. FURNACE ACTIVE
    this.drawBlock(BlockType.FURNACE_ACTIVE, (ctx) => {
      this.drawStonePattern(ctx, PALETTE.stoneLight, PALETTE.stoneNormal, PALETTE.stoneDark);
      // Glowing Fire
      ctx.fillStyle = PALETTE.lavaCrust;
      ctx.fillRect(3, 6, 10, 8);
      ctx.fillStyle = PALETTE.lavaSurface;
      ctx.fillRect(4, 7, 8, 6);
      ctx.fillStyle = PALETTE.lavaCore;
      ctx.fillRect(6, 9, 4, 3);
    });

    // 29. CHEST
    this.drawBlock(BlockType.CHEST, (ctx) => {
      ctx.fillStyle = PALETTE.oakWoodNormal;
      ctx.fillRect(0, 0, 16, 16);
      // Dark border & metal latch
      ctx.fillStyle = PALETTE.oakWoodDark;
      ctx.strokeRect(0.5, 0.5, 15, 15);
      ctx.fillRect(0, 5, 16, 1); // Lid seam
      // Iron clasp
      ctx.fillStyle = PALETTE.stoneLight;
      ctx.fillRect(7, 4, 2, 4);
      ctx.fillStyle = PALETTE.bedrock;
      setPixel(ctx, 7, 5, PALETTE.bedrock);
    });

    // 30. TORCH
    this.drawBlock(BlockType.TORCH, (ctx) => {
      // Stick
      ctx.fillStyle = PALETTE.oakWoodDark;
      ctx.fillRect(7, 6, 2, 10);
      // Coal tip
      ctx.fillStyle = PALETTE.oreCoal;
      ctx.fillRect(7, 4, 2, 2);
      // Flame
      ctx.fillStyle = PALETTE.torchGlow;
      ctx.fillRect(6, 2, 4, 3);
      ctx.fillStyle = PALETTE.torchCore;
      ctx.fillRect(7, 2, 2, 2);
    });

    // 31. GLASS
    this.drawBlock(BlockType.GLASS, (ctx) => {
      ctx.fillStyle = PALETTE.glassFrame;
      ctx.strokeRect(0.5, 0.5, 15, 15);
      ctx.fillStyle = 'rgba(230, 245, 255, 0.2)';
      ctx.fillRect(1, 1, 14, 14);
      // Diagonal glint
      ctx.fillStyle = PALETTE.glassGlint;
      setPixel(ctx, 3, 3, PALETTE.glassGlint);
      setPixel(ctx, 4, 4, PALETTE.glassGlint);
      setPixel(ctx, 5, 5, PALETTE.glassGlint);
      setPixel(ctx, 11, 11, PALETTE.glassGlint);
      setPixel(ctx, 12, 12, PALETTE.glassGlint);
    });

    // 32. BRICK
    this.drawBlock(BlockType.BRICK, (ctx) => {
      ctx.fillStyle = PALETTE.brickMortar;
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = PALETTE.brickRed;
      // Row 1
      ctx.fillRect(0, 0, 7, 3); ctx.fillRect(8, 0, 8, 3);
      // Row 2
      ctx.fillRect(0, 4, 3, 3); ctx.fillRect(4, 4, 7, 3); ctx.fillRect(12, 4, 4, 3);
      // Row 3
      ctx.fillRect(0, 8, 7, 3); ctx.fillRect(8, 8, 8, 3);
      // Row 4
      ctx.fillRect(0, 12, 3, 4); ctx.fillRect(4, 12, 7, 4); ctx.fillRect(12, 12, 4, 4);
    });

    // 33. WATER
    this.drawBlock(BlockType.WATER, (ctx) => {
      ctx.fillStyle = 'rgba(40, 120, 220, 0.75)';
      ctx.fillRect(0, 0, 16, 16);
      // Subtle waves
      ctx.fillStyle = 'rgba(90, 170, 255, 0.85)';
      ctx.fillRect(2, 3, 4, 1);
      ctx.fillRect(9, 3, 5, 1);
      ctx.fillRect(0, 9, 6, 1);
      ctx.fillRect(11, 9, 4, 1);
    });

    // 34. LAVA
    this.drawBlock(BlockType.LAVA, (ctx) => {
      ctx.fillStyle = PALETTE.lavaSurface;
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = PALETTE.lavaCore;
      ctx.fillRect(2, 2, 5, 3);
      ctx.fillRect(9, 7, 4, 4);
      ctx.fillStyle = PALETTE.lavaCrust;
      ctx.fillRect(1, 10, 3, 3);
      ctx.fillRect(12, 1, 3, 2);
    });

    // 35. WOOD DOOR LOWER
    this.drawBlock(BlockType.WOOD_DOOR_LOWER, (ctx) => {
      ctx.fillStyle = PALETTE.oakWoodNormal;
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = PALETTE.oakWoodDark;
      ctx.strokeRect(1.5, 1.5, 13, 13);
      // Iron handle
      ctx.fillStyle = PALETTE.stoneDark;
      ctx.fillRect(12, 3, 2, 4);
    });

    // 36. WOOD DOOR UPPER
    this.drawBlock(BlockType.WOOD_DOOR_UPPER, (ctx) => {
      ctx.fillStyle = PALETTE.oakWoodNormal;
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = PALETTE.oakWoodDark;
      ctx.strokeRect(1.5, 1.5, 13, 13);
      // Window panes
      ctx.fillStyle = PALETTE.glassFrame;
      ctx.fillRect(4, 4, 3, 4);
      ctx.fillRect(9, 4, 3, 4);
    });

    // 37. LADDER
    this.drawBlock(BlockType.LADDER, (ctx) => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = PALETTE.oakWoodNormal;
      // Vertical posts
      ctx.fillRect(2, 0, 2, 16);
      ctx.fillRect(12, 0, 2, 16);
      // Horizontal rungs
      ctx.fillRect(4, 2, 8, 2);
      ctx.fillRect(4, 7, 8, 2);
      ctx.fillRect(4, 12, 8, 2);
    });

    // 38. TALL GRASS
    this.drawBlock(BlockType.TALL_GRASS, (ctx) => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = PALETTE.grassNormal;
      const blades = [[3, 6, 2, 10], [7, 2, 2, 14], [11, 4, 2, 12]];
      for (const [bx, by, bw, bh] of blades) {
        ctx.fillRect(bx, by, bw, bh);
      }
      ctx.fillStyle = PALETTE.grassBright;
      setPixel(ctx, 3, 6, PALETTE.grassBright);
      setPixel(ctx, 7, 2, PALETTE.grassBright);
      setPixel(ctx, 11, 4, PALETTE.grassBright);
    });

    // 39. FLOWER RED
    this.drawBlock(BlockType.FLOWER_RED, (ctx) => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = PALETTE.grassNormal;
      ctx.fillRect(7, 6, 2, 10);
      // Red Petals
      ctx.fillStyle = PALETTE.oreRedstone;
      ctx.fillRect(5, 2, 6, 4);
      ctx.fillRect(6, 1, 4, 6);
      // Yellow Center
      ctx.fillStyle = PALETTE.oreGold;
      ctx.fillRect(7, 3, 2, 2);
    });

    // 40. FLOWER YELLOW
    this.drawBlock(BlockType.FLOWER_YELLOW, (ctx) => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = PALETTE.grassNormal;
      ctx.fillRect(7, 7, 2, 9);
      // Dandelion petals
      ctx.fillStyle = PALETTE.oreGold;
      ctx.fillRect(5, 3, 6, 4);
      ctx.fillRect(6, 2, 4, 6);
      ctx.fillStyle = PALETTE.sandLight;
      ctx.fillRect(7, 4, 2, 2);
    });

    // 41. MUSHROOM RED
    this.drawBlock(BlockType.MUSHROOM_RED, (ctx) => {
      ctx.clearRect(0, 0, 16, 16);
      // Stem
      ctx.fillStyle = PALETTE.birchBarkLight;
      ctx.fillRect(7, 9, 2, 7);
      // Cap
      ctx.fillStyle = PALETTE.oreRedstone;
      ctx.fillRect(4, 4, 8, 5);
      ctx.fillRect(5, 3, 6, 1);
      // White spots
      ctx.fillStyle = '#ffffff';
      setPixel(ctx, 5, 5, '#ffffff');
      setPixel(ctx, 8, 4, '#ffffff');
      setPixel(ctx, 10, 6, '#ffffff');
    });

    // 42. MUSHROOM BROWN
    this.drawBlock(BlockType.MUSHROOM_BROWN, (ctx) => {
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = PALETTE.birchBarkLight;
      ctx.fillRect(7, 9, 2, 7);
      ctx.fillStyle = PALETTE.dirtDark;
      ctx.fillRect(3, 5, 10, 4);
    });

    // 43-46. WHEAT CROPS
    for (let stage = 0; stage < 4; stage++) {
      const type = (BlockType.WHEAT_0 + stage) as BlockType;
      this.drawBlock(type, (ctx) => {
        ctx.clearRect(0, 0, 16, 16);
        const col = stage === 3 ? PALETTE.sandNormal : PALETTE.grassNormal;
        const h = 4 + stage * 3;
        ctx.fillStyle = col;
        ctx.fillRect(4, 16 - h, 2, h);
        ctx.fillRect(8, 16 - h - 1, 2, h + 1);
        ctx.fillRect(12, 16 - h, 2, h);
      });
    }
  }

  private drawBreakOverlays() {
    // 10 stages of cracking overlays
    for (let stage = 0; stage < 10; stage++) {
      const slot = this.allocateSlot(`break_${stage}`);
      this.ctx.save();
      this.ctx.translate(slot.x, slot.y);
      this.ctx.clearRect(0, 0, 16, 16);

      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();

      const numCracks = stage + 2;
      for (let i = 0; i < numCracks; i++) {
        const x1 = Math.floor(pseudoRandom(i * 13 + stage * 7) * 14) + 1;
        const y1 = Math.floor(pseudoRandom(i * 29 + stage * 11) * 14) + 1;
        const x2 = x1 + Math.floor((pseudoRandom(i * 47) - 0.5) * 8);
        const y2 = y1 + Math.floor((pseudoRandom(i * 53) - 0.5) * 8);
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
      }
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  private drawItems() {
    const tiers = [
      { name: 'wood', col: PALETTE.oakWoodNormal, lightCol: PALETTE.oakWoodLight },
      { name: 'stone', col: PALETTE.stoneNormal, lightCol: PALETTE.stoneLight },
      { name: 'iron', col: PALETTE.oreIronGlint, lightCol: '#ffffff' },
      { name: 'gold', col: PALETTE.oreGold, lightCol: PALETTE.oreGoldGlint },
      { name: 'diamond', col: PALETTE.oreDiamond, lightCol: PALETTE.oreDiamondGlint },
    ];

    // Tools: Pickaxe, Axe, Shovel, Sword
    for (const t of tiers) {
      // Pickaxe
      this.drawItem(`${t.name}_pickaxe`, (ctx) => {
        this.drawToolHandle(ctx);
        // Pick head
        ctx.fillStyle = t.col;
        ctx.fillRect(8, 2, 6, 2);
        ctx.fillRect(12, 4, 2, 4);
        ctx.fillRect(6, 2, 3, 2);
        ctx.fillRect(4, 4, 2, 2);
        ctx.fillStyle = t.lightCol;
        setPixel(ctx, 12, 2, t.lightCol);
        setPixel(ctx, 13, 3, t.lightCol);
      });

      // Axe
      this.drawItem(`${t.name}_axe`, (ctx) => {
        this.drawToolHandle(ctx);
        ctx.fillStyle = t.col;
        ctx.fillRect(7, 2, 5, 4);
        ctx.fillRect(6, 4, 4, 3);
        ctx.fillStyle = t.lightCol;
        ctx.fillRect(8, 2, 3, 1);
      });

      // Shovel
      this.drawItem(`${t.name}_shovel`, (ctx) => {
        this.drawToolHandle(ctx);
        ctx.fillStyle = t.col;
        ctx.fillRect(10, 2, 4, 4);
        ctx.fillStyle = t.lightCol;
        ctx.fillRect(11, 2, 2, 1);
      });

      // Sword
      this.drawItem(`${t.name}_sword`, (ctx) => {
        // Handle
        ctx.fillStyle = PALETTE.oakBarkDark;
        ctx.fillRect(2, 12, 3, 3);
        // Guard
        ctx.fillStyle = PALETTE.oakWoodDark;
        ctx.fillRect(4, 10, 4, 2);
        ctx.fillRect(3, 11, 2, 2);
        // Blade (diagonal)
        ctx.fillStyle = t.col;
        for (let i = 0; i < 7; i++) {
          ctx.fillRect(6 + i, 8 - i, 2, 2);
        }
        ctx.fillStyle = t.lightCol;
        for (let i = 0; i < 7; i++) {
          setPixel(ctx, 6 + i, 8 - i, t.lightCol);
        }
      });
    }

    // Bow & Arrow
    this.drawItem('bow', (ctx) => {
      ctx.strokeStyle = PALETTE.oakWoodNormal;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(3, 13); ctx.lineTo(13, 3);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(3, 13); ctx.lineTo(2, 8); ctx.lineTo(8, 2); ctx.lineTo(13, 3);
      ctx.stroke();
    });

    this.drawItem('arrow', (ctx) => {
      ctx.fillStyle = PALETTE.oakWoodNormal;
      ctx.fillRect(4, 4, 8, 8);
      // Arrowhead
      ctx.fillStyle = PALETTE.stoneLight;
      ctx.fillRect(11, 3, 3, 3);
      // Feather
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, 12, 3, 3);
    });

    // Basic Materials
    this.drawItem('stick', (ctx) => {
      ctx.fillStyle = PALETTE.oakWoodNormal;
      for (let i = 0; i < 10; i++) {
        setPixel(ctx, 3 + i, 13 - i, PALETTE.oakWoodNormal);
        setPixel(ctx, 4 + i, 13 - i, PALETTE.oakWoodDark);
      }
    });

    this.drawItem('coal', (ctx) => {
      ctx.fillStyle = PALETTE.oreCoal;
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillRect(6, 2, 4, 12);
      ctx.fillStyle = PALETTE.oreCoalGlint;
      ctx.fillRect(6, 4, 2, 2);
    });

    this.drawItem('iron_ingot', (ctx) => {
      ctx.fillStyle = PALETTE.stoneLight;
      ctx.fillRect(3, 5, 10, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, 6, 8, 2);
    });

    this.drawItem('gold_ingot', (ctx) => {
      ctx.fillStyle = PALETTE.oreGold;
      ctx.fillRect(3, 5, 10, 6);
      ctx.fillStyle = PALETTE.oreGoldGlint;
      ctx.fillRect(4, 6, 8, 2);
    });

    this.drawItem('diamond', (ctx) => {
      ctx.fillStyle = PALETTE.oreDiamond;
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillRect(6, 2, 4, 12);
      ctx.fillStyle = PALETTE.oreDiamondGlint;
      ctx.fillRect(5, 5, 4, 3);
    });

    this.drawItem('emerald', (ctx) => {
      ctx.fillStyle = PALETTE.oreEmerald;
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillStyle = PALETTE.oreEmeraldGlint;
      ctx.fillRect(6, 3, 4, 10);
    });

    this.drawItem('redstone', (ctx) => {
      ctx.fillStyle = PALETTE.oreRedstone;
      ctx.fillRect(5, 5, 6, 6);
      ctx.fillRect(3, 7, 10, 2);
      ctx.fillStyle = PALETTE.oreRedstoneGlint;
      setPixel(ctx, 7, 7, PALETTE.oreRedstoneGlint);
    });

    this.drawItem('apple', (ctx) => {
      ctx.fillStyle = PALETTE.oreRedstone;
      ctx.fillRect(4, 5, 8, 8);
      ctx.fillRect(5, 4, 6, 10);
      // Stem & Leaf
      ctx.fillStyle = PALETTE.oakWoodDark;
      setPixel(ctx, 8, 2, PALETTE.oakWoodDark);
      ctx.fillStyle = PALETTE.grassBright;
      setPixel(ctx, 9, 2, PALETTE.grassBright);
    });

    this.drawItem('bread', (ctx) => {
      ctx.fillStyle = PALETTE.oakWoodNormal;
      ctx.fillRect(2, 6, 12, 5);
      ctx.fillStyle = PALETTE.oakWoodLight;
      ctx.fillRect(4, 7, 8, 2);
    });

    this.drawItem('porkchop_raw', (ctx) => {
      ctx.fillStyle = '#f89a9e';
      ctx.fillRect(3, 5, 10, 7);
      ctx.fillStyle = '#ffffff'; // Fat / bone
      ctx.fillRect(4, 6, 2, 2);
    });

    this.drawItem('porkchop_cooked', (ctx) => {
      ctx.fillStyle = '#a65437';
      ctx.fillRect(3, 5, 10, 7);
      ctx.fillStyle = '#7a3b25';
      ctx.fillRect(5, 6, 6, 2);
    });
  }

  private drawEntities() {
    // Player Character Sprites
    this.drawEntitySprite('player_idle', (ctx) => {
      this.drawHumanoid(ctx, '#f8d0a8', '#3498db', '#2980b9', '#333333', false);
    });

    this.drawEntitySprite('player_walk_1', (ctx) => {
      this.drawHumanoid(ctx, '#f8d0a8', '#3498db', '#2980b9', '#333333', true, 1);
    });

    this.drawEntitySprite('player_walk_2', (ctx) => {
      this.drawHumanoid(ctx, '#f8d0a8', '#3498db', '#2980b9', '#333333', true, -1);
    });

    // Zombie
    this.drawEntitySprite('zombie', (ctx) => {
      this.drawHumanoid(ctx, '#4e8c3b', '#27ae60', '#1b4d3e', '#1e382b', false, 0, true);
    });

    // Skeleton
    this.drawEntitySprite('skeleton', (ctx) => {
      ctx.fillStyle = '#e8e8e8';
      // Head
      ctx.fillRect(5, 1, 6, 6);
      // Dark eye sockets
      ctx.fillStyle = '#111111';
      ctx.fillRect(6, 3, 2, 2);
      ctx.fillRect(9, 3, 2, 2);
      // Ribs
      ctx.fillStyle = '#d0d0d0';
      ctx.fillRect(7, 7, 2, 6);
      ctx.fillRect(5, 8, 6, 1);
      ctx.fillRect(5, 10, 6, 1);
      // Legs
      ctx.fillStyle = '#e8e8e8';
      ctx.fillRect(5, 13, 2, 6);
      ctx.fillRect(9, 13, 2, 6);
    });

    // Slime
    this.drawEntitySprite('slime', (ctx) => {
      ctx.fillStyle = 'rgba(78, 204, 88, 0.85)';
      ctx.fillRect(2, 4, 12, 11);
      ctx.fillStyle = '#278b32';
      ctx.fillRect(4, 7, 2, 3);
      ctx.fillRect(10, 7, 2, 3);
      ctx.fillRect(7, 11, 2, 1);
    });

    // Pig
    this.drawEntitySprite('pig', (ctx) => {
      ctx.fillStyle = '#f8a5a8';
      // Body
      ctx.fillRect(2, 6, 12, 6);
      // Head
      ctx.fillRect(10, 4, 5, 5);
      // Snout
      ctx.fillStyle = '#ea8387';
      ctx.fillRect(13, 6, 3, 2);
      // Eyes
      ctx.fillStyle = '#111111';
      setPixel(ctx, 12, 5, '#111111');
      // Legs
      ctx.fillStyle = '#d97b80';
      ctx.fillRect(3, 12, 2, 4);
      ctx.fillRect(6, 12, 2, 4);
      ctx.fillRect(9, 12, 2, 4);
      ctx.fillRect(12, 12, 2, 4);
    });

    // Sheep
    this.drawEntitySprite('sheep', (ctx) => {
      ctx.fillStyle = '#f0f0f0';
      // Fluffy wool body
      ctx.fillRect(2, 4, 12, 8);
      // Head
      ctx.fillStyle = '#f8d0a8';
      ctx.fillRect(11, 5, 4, 4);
      ctx.fillStyle = '#111111';
      setPixel(ctx, 13, 6, '#111111');
      // Legs
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(3, 12, 2, 4);
      ctx.fillRect(6, 12, 2, 4);
      ctx.fillRect(9, 12, 2, 4);
      ctx.fillRect(12, 12, 4, 4);
    });
  }

  private drawParticles() {
    // XP Orb
    this.drawParticleSprite('xp_orb', (ctx) => {
      ctx.fillStyle = '#99ff33';
      ctx.fillRect(5, 5, 6, 6);
      ctx.fillStyle = '#ffff66';
      ctx.fillRect(6, 6, 4, 4);
      ctx.fillStyle = '#ffffff';
      setPixel(ctx, 7, 7, '#ffffff');
    });

    // Spark / Torch Ember
    this.drawParticleSprite('spark', (ctx) => {
      ctx.fillStyle = PALETTE.torchGlow;
      ctx.fillRect(6, 6, 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7, 7, 2, 2);
    });

    // Rain Splash
    this.drawParticleSprite('splash', (ctx) => {
      ctx.fillStyle = 'rgba(120, 190, 255, 0.9)';
      ctx.fillRect(6, 10, 4, 2);
      ctx.fillRect(4, 7, 2, 2);
      ctx.fillRect(10, 7, 2, 2);
    });
  }

  // Helpers
  private drawBlock(type: BlockType, drawer: (ctx: CanvasRenderingContext2D) => void) {
    const slot = this.allocateSlot(`block_${type}`);
    this.ctx.save();
    this.ctx.translate(slot.x, slot.y);
    drawer(this.ctx);
    this.ctx.restore();
  }

  private drawItem(id: string, drawer: (ctx: CanvasRenderingContext2D) => void) {
    const slot = this.allocateSlot(`item_${id}`);
    this.ctx.save();
    this.ctx.translate(slot.x, slot.y);
    drawer(this.ctx);
    this.ctx.restore();
  }

  private drawEntitySprite(id: string, drawer: (ctx: CanvasRenderingContext2D) => void) {
    const slot = this.allocateSlot(`entity_${id}`);
    this.ctx.save();
    this.ctx.translate(slot.x, slot.y);
    drawer(this.ctx);
    this.ctx.restore();
  }

  private drawParticleSprite(id: string, drawer: (ctx: CanvasRenderingContext2D) => void) {
    const slot = this.allocateSlot(`particle_${id}`);
    this.ctx.save();
    this.ctx.translate(slot.x, slot.y);
    drawer(this.ctx);
    this.ctx.restore();
  }

  private drawDirtPattern(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = PALETTE.dirtNormal;
    ctx.fillRect(0, 0, 16, 16);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const r = pseudoRandom(x * 17 + y * 31);
        if (r > 0.7) setPixel(ctx, x, y, PALETTE.dirtLight);
        else if (r < 0.3) setPixel(ctx, x, y, PALETTE.dirtDark);
      }
    }
  }

  private drawStonePattern(
    ctx: CanvasRenderingContext2D,
    light: string,
    norm: string,
    dark: string
  ) {
    ctx.fillStyle = norm;
    ctx.fillRect(0, 0, 16, 16);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const r = pseudoRandom(x * 29 + y * 73);
        if (r > 0.72) setPixel(ctx, x, y, light);
        else if (r < 0.28) setPixel(ctx, x, y, dark);
      }
    }
  }

  private drawOreFlecks(ctx: CanvasRenderingContext2D, oreCol: string, glintCol: string) {
    const flecks = [
      [3, 3, 3, 2], [10, 4, 3, 3],
      [4, 10, 3, 3], [10, 11, 2, 2]
    ];
    for (const [fx, fy, fw, fh] of flecks) {
      ctx.fillStyle = oreCol;
      ctx.fillRect(fx, fy, fw, fh);
      ctx.fillStyle = glintCol;
      setPixel(ctx, fx + 1, fy, glintCol);
    }
  }

  private drawToolHandle(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = PALETTE.oakWoodDark;
    for (let i = 0; i < 9; i++) {
      ctx.fillRect(3 + i, 12 - i, 2, 2);
    }
  }

  private drawHumanoid(
    ctx: CanvasRenderingContext2D,
    skinColor: string,
    shirtColor: string,
    pantsColor: string,
    hairColor: string,
    isWalking: boolean,
    walkPhase: number = 0,
    outstretchedArms: boolean = false
  ) {
    // Head & Hair
    ctx.fillStyle = hairColor;
    ctx.fillRect(5, 0, 6, 3);
    ctx.fillStyle = skinColor;
    ctx.fillRect(5, 2, 6, 4);
    // Eyes
    ctx.fillStyle = '#ffffff';
    setPixel(ctx, 8, 3, '#ffffff');
    setPixel(ctx, 10, 3, '#ffffff');
    ctx.fillStyle = '#333333';
    setPixel(ctx, 9, 3, '#333333');
    setPixel(ctx, 11, 3, '#333333');

    // Torso / Shirt
    ctx.fillStyle = shirtColor;
    ctx.fillRect(5, 6, 6, 5);

    // Arms
    if (outstretchedArms) {
      ctx.fillStyle = skinColor;
      ctx.fillRect(10, 6, 5, 3);
    } else {
      ctx.fillStyle = skinColor;
      ctx.fillRect(3, 6, 2, 5);
      ctx.fillRect(11, 6, 2, 5);
    }

    // Legs / Pants
    ctx.fillStyle = pantsColor;
    if (!isWalking) {
      ctx.fillRect(5, 11, 2, 5);
      ctx.fillRect(9, 11, 2, 5);
    } else if (walkPhase > 0) {
      ctx.fillRect(4, 11, 2, 5);
      ctx.fillRect(10, 11, 2, 5);
    } else {
      ctx.fillRect(6, 11, 2, 5);
      ctx.fillRect(8, 11, 2, 5);
    }
  }
}

export const textureAtlas = new TextureAtlas();
