import { BlockType, BiomeType } from '../types';
import { SimplexNoise } from './Noise';
import { BiomeManager } from './BiomeManager';
import { Chunk } from './Chunk';
import {
  CHUNK_WIDTH,
  CHUNK_HEIGHT,
  LEVEL_BEDROCK,
  LEVEL_MAGMA_CORE,
  LEVEL_DEEPSLATE,
  LEVEL_SEA_LEVEL,
  LEVEL_SURFACE_BASE,
} from './WorldConstants';
import { pseudoRandom } from '../textures/ColorPalette';

export class TerrainGenerator {
  public seed: number;
  private heightNoise: SimplexNoise;
  private caveNoise1: SimplexNoise;
  private caveNoise2: SimplexNoise;
  private oreNoise: SimplexNoise;
  private biomeManager: BiomeManager;

  constructor(seed: number = 424242) {
    this.seed = seed;
    this.heightNoise = new SimplexNoise(seed);
    this.caveNoise1 = new SimplexNoise(seed + 1111);
    this.caveNoise2 = new SimplexNoise(seed + 2222);
    this.oreNoise = new SimplexNoise(seed + 3333);
    this.biomeManager = new BiomeManager(seed);
  }

  public generateChunk(chunkX: number): Chunk {
    const chunk = new Chunk(chunkX);
    const startWorldX = chunkX * CHUNK_WIDTH;

    for (let lx = 0; lx < CHUNK_WIDTH; lx++) {
      const worldX = startWorldX + lx;

      // 1. Calculate surface height with 4-octave fBm
      const baseElevation = this.heightNoise.fbm2D(worldX * 0.008, 0, 4, 2.0, 0.5);
      const surfaceHeight = Math.floor(LEVEL_SURFACE_BASE + baseElevation * 18);
      const biome = this.biomeManager.getBiomeAt(worldX, surfaceHeight);

      // 2. Fill column from bottom (Y=0) to top (Y=127)
      for (let y = 0; y < CHUNK_HEIGHT; y++) {
        let block: BlockType = BlockType.AIR;
        let wall: BlockType = BlockType.AIR;

        if (y === LEVEL_BEDROCK) {
          block = BlockType.BEDROCK;
        } else if (y <= 2 && pseudoRandom(worldX * 31 + y * 7) > 0.4) {
          block = BlockType.BEDROCK;
        } else if (y < surfaceHeight) {
          // Underground block selection
          if (y < LEVEL_MAGMA_CORE) {
            block = BlockType.DEEPSLATE;
            wall = BlockType.DEEPSLATE;
          } else if (y < LEVEL_DEEPSLATE) {
            block = BlockType.DEEPSLATE;
            wall = BlockType.DEEPSLATE;
          } else if (y < surfaceHeight - 4) {
            block = BlockType.STONE;
            wall = BlockType.STONE;
          } else {
            // Dirt / Sand near surface
            if (biome === BiomeType.DESERT) {
              block = BlockType.SANDSTONE;
            } else {
              block = BlockType.DIRT;
            }
          }

          // Ore Veins Distribution
          if (block === BlockType.STONE || block === BlockType.DEEPSLATE) {
            const oreVal = this.oreNoise.noise2D(worldX * 0.08, y * 0.08);
            const oreVal2 = this.oreNoise.noise2D(worldX * 0.12 + 50, y * 0.12 + 50);

            // Coal (Y: 20-100)
            if (y >= 20 && y <= 100 && oreVal > 0.62) {
              block = BlockType.COAL_ORE;
            }
            // Iron (Y: 10-60)
            else if (y >= 10 && y <= 60 && oreVal2 > 0.68) {
              block = BlockType.IRON_ORE;
            }
            // Gold (Y: 5-35)
            else if (y >= 5 && y <= 35 && oreVal > 0.74) {
              block = BlockType.GOLD_ORE;
            }
            // Redstone (Y: 0-25)
            else if (y <= 25 && oreVal2 > 0.76) {
              block = BlockType.REDSTONE_ORE;
            }
            // Diamond (Y: 0-18)
            else if (y <= 18 && oreVal > 0.82) {
              block = BlockType.DIAMOND_ORE;
            }
            // Emerald (Y: 40-90 rare)
            else if (y >= 40 && y <= 90 && oreVal < -0.84) {
              block = BlockType.EMERALD_ORE;
            }
          }

          // 3. 2D Worm Caves Carving
          const c1 = this.caveNoise1.noise2D(worldX * 0.035, y * 0.035);
          const c2 = this.caveNoise2.noise2D(worldX * 0.035 + 200, y * 0.035 + 200);
          const caveDensity = c1 * c1 + c2 * c2;

          if (caveDensity < 0.025 && y < surfaceHeight - 3 && y > 2) {
            if (y < LEVEL_MAGMA_CORE) {
              block = BlockType.LAVA;
            } else if (y < LEVEL_SEA_LEVEL - 8 && pseudoRandom(worldX * 19 + y) > 0.6) {
              block = BlockType.WATER;
            } else {
              block = BlockType.AIR;
            }
          }
        } else if (y === surfaceHeight) {
          // Top Surface Block
          if (surfaceHeight < LEVEL_SEA_LEVEL - 1) {
            block = BlockType.SAND; // Underwater seabed
          } else if (biome === BiomeType.DESERT) {
            block = BlockType.SAND;
          } else if (biome === BiomeType.SNOW_TUNDRA) {
            block = BlockType.SNOW_GRASS;
          } else {
            block = BlockType.GRASS;
          }
        } else {
          // Above surface
          if (y <= LEVEL_SEA_LEVEL) {
            block = BlockType.WATER;
          } else {
            block = BlockType.AIR;
          }
        }

        chunk.setBlock(lx, y, block);
        if (wall !== BlockType.AIR) {
          chunk.walls[chunk.getIndex(lx, y)] = wall;
        }
      }

      // 4. Plant Surface Foliage / Trees (if above sea level and not in cave)
      if (surfaceHeight >= LEVEL_SEA_LEVEL) {
        const rPlant = pseudoRandom(worldX * 97);
        if (biome === BiomeType.DESERT) {
          // Cacti
          if (rPlant > 0.94 && lx > 1 && lx < CHUNK_WIDTH - 2) {
            const cactusH = 2 + Math.floor(pseudoRandom(worldX * 13) * 3);
            for (let ch = 1; ch <= cactusH; ch++) {
              if (surfaceHeight + ch < CHUNK_HEIGHT) {
                chunk.setBlock(lx, surfaceHeight + ch, BlockType.CACTUS);
              }
            }
          }
        } else if (biome === BiomeType.SNOW_TUNDRA) {
          // Snow cover
          if (rPlant > 0.85 && lx > 2 && lx < CHUNK_WIDTH - 3) {
            this.generatePineTree(chunk, lx, surfaceHeight + 1);
          }
        } else {
          // Plains / Forest / Birch Forest
          const treeThreshold = biome === BiomeType.FOREST ? 0.72 : (biome === BiomeType.BIRCH_FOREST ? 0.75 : 0.88);
          if (rPlant > treeThreshold && lx >= 2 && lx <= CHUNK_WIDTH - 3) {
            const isBirch = biome === BiomeType.BIRCH_FOREST || pseudoRandom(worldX * 43) > 0.7;
            this.generateTree(chunk, lx, surfaceHeight + 1, isBirch);
          } else if (rPlant > 0.45) {
            // Flowers & Grass
            const fType = rPlant > 0.65 ? BlockType.TALL_GRASS : (rPlant > 0.55 ? BlockType.FLOWER_RED : BlockType.FLOWER_YELLOW);
            chunk.setBlock(lx, surfaceHeight + 1, fType);
          }
        }
      }
    }

    return chunk;
  }

  private generateTree(chunk: Chunk, lx: number, startY: number, isBirch: boolean) {
    const trunkHeight = 4 + Math.floor(pseudoRandom(lx * 23 + startY) * 3);
    const logBlock = isBirch ? BlockType.BIRCH_LOG : BlockType.OAK_LOG;
    const leavesBlock = isBirch ? BlockType.BIRCH_LEAVES : BlockType.OAK_LEAVES;

    // Trunk
    for (let dy = 0; dy < trunkHeight; dy++) {
      const y = startY + dy;
      if (y < CHUNK_HEIGHT) {
        chunk.setBlock(lx, y, logBlock);
      }
    }

    // Leaves Crown
    const crownCenterY = startY + trunkHeight;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = lx + dx;
        const ny = crownCenterY + dy;
        if (nx >= 0 && nx < CHUNK_WIDTH && ny < CHUNK_HEIGHT) {
          if (Math.abs(dx) === 2 && Math.abs(dy) === 2) {
            if (pseudoRandom(nx * 17 + ny) > 0.5) continue; // Round corners
          }
          if (chunk.getBlock(nx, ny) === BlockType.AIR) {
            chunk.setBlock(nx, ny, leavesBlock);
          }
        }
      }
    }
  }

  private generatePineTree(chunk: Chunk, lx: number, startY: number) {
    const trunkHeight = 5 + Math.floor(pseudoRandom(lx * 31 + startY) * 3);
    for (let dy = 0; dy < trunkHeight; dy++) {
      const y = startY + dy;
      if (y < CHUNK_HEIGHT) {
        chunk.setBlock(lx, y, BlockType.OAK_LOG);
      }
    }
    // Conical leaves
    for (let dy = 2; dy <= trunkHeight + 1; dy++) {
      const radius = dy > trunkHeight ? 1 : (dy % 2 === 0 ? 2 : 1);
      const ny = startY + dy;
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = lx + dx;
        if (nx >= 0 && nx < CHUNK_WIDTH && ny < CHUNK_HEIGHT) {
          if (chunk.getBlock(nx, ny) === BlockType.AIR) {
            chunk.setBlock(nx, ny, BlockType.OAK_LEAVES);
          }
        }
      }
    }
  }
}
