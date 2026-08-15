/**
 * 2D MINECRAFT // PROCEDURAL WORLD GENERATOR (WITH DETERMINISTIC SEED SUPPORT)
 */

import { BLOCKS } from "./items-recipes.js";

export class WorldGenerator {
  constructor(width = 450, height = 150, seed = 12345) {
    this.width = width;
    this.height = height;
    this.surfaceLevel = 50;
    this.seed = seed;
    this.blocks = new Uint8Array(width * height);
    this.backgroundWalls = new Uint8Array(width * height);
    this.lightMap = new Float32Array(width * height);
    this.torches = new Set();

    this.generate();
  }

  // Pseudo-random based on seed
  pseudoRandom(offset = 0) {
    const s = Math.sin(this.seed + offset) * 10000;
    return s - Math.floor(s);
  }

  getIndex(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return -1;
    return y * this.width + x;
  }

  getBlock(x, y) {
    const idx = this.getIndex(x, y);
    if (idx === -1) return BLOCKS.BEDROCK;
    return this.blocks[idx];
  }

  setBlock(x, y, blockId) {
    const idx = this.getIndex(x, y);
    if (idx === -1) return;
    this.blocks[idx] = blockId;

    if (blockId === BLOCKS.TORCH) {
      this.torches.add(`${x},${y}`);
    } else {
      this.torches.delete(`${x},${y}`);
    }
  }

  generate() {
    // 1. Surface Heightmap
    const heightMap = new Int32Array(this.width);
    for (let x = 0; x < this.width; x++) {
      const n1 = Math.sin((x + this.seed) * 0.04) * 8;
      const n2 = Math.sin((x + this.seed) * 0.12) * 3;
      const n3 = Math.cos((x + this.seed) * 0.015) * 12;
      heightMap[x] = Math.floor(this.surfaceLevel + n1 + n2 + n3);
    }

    // 2. Strata Layers
    for (let x = 0; x < this.width; x++) {
      const surfaceY = heightMap[x];

      for (let y = 0; y < this.height; y++) {
        const idx = this.getIndex(x, y);

        if (y < surfaceY) {
          this.blocks[idx] = BLOCKS.AIR;
        } else if (y === surfaceY) {
          this.blocks[idx] = BLOCKS.GRASS;
        } else if (y <= surfaceY + 4) {
          this.blocks[idx] = BLOCKS.DIRT;
          this.backgroundWalls[idx] = BLOCKS.DIRT;
        } else if (y < this.height - 2) {
          this.blocks[idx] = BLOCKS.STONE;
          this.backgroundWalls[idx] = BLOCKS.STONE;
        } else {
          this.blocks[idx] = BLOCKS.BEDROCK;
        }
      }
    }

    // 3. Carve Caves
    for (let x = 4; x < this.width - 4; x++) {
      for (let y = this.surfaceLevel + 6; y < this.height - 3; y++) {
        const caveNoise = Math.sin((x + this.seed) * 0.15) * Math.cos((y + this.seed) * 0.15) + Math.sin(x * 0.08 + y * 0.08);
        if (caveNoise > 0.82) {
          const idx = this.getIndex(x, y);
          if (y > 130 && this.pseudoRandom(x * 10 + y) < 0.35) {
            this.blocks[idx] = BLOCKS.LAVA;
          } else {
            this.blocks[idx] = BLOCKS.AIR;
          }
        }
      }
    }

    // 4. Generate Ore Clusters
    this.generateOreVeins(BLOCKS.COAL_ORE, 8, 45, 120, 0.025);
    this.generateOreVeins(BLOCKS.COPPER_ORE, 6, 55, 110, 0.02);
    this.generateOreVeins(BLOCKS.IRON_ORE, 5, 65, 135, 0.018);
    this.generateOreVeins(BLOCKS.GOLD_ORE, 4, 95, 145, 0.012);
    this.generateOreVeins(BLOCKS.DIAMOND_ORE, 3, 115, 148, 0.008);
    this.generateOreVeins(BLOCKS.ANCIENT_DEBRIS, 2, 140, 148, 0.004);

    // 5. Generate Trees
    for (let x = 6; x < this.width - 6; x += 5) {
      if (this.pseudoRandom(x * 17) > 0.4) {
        const surfaceY = heightMap[x];
        if (this.getBlock(x, surfaceY) === BLOCKS.GRASS) {
          this.growTree(x, surfaceY - 1);
        }
      }
    }
  }

  generateOreVeins(oreType, clusterSize, minY, maxY, density) {
    const totalTries = Math.floor(this.width * (maxY - minY) * density);
    for (let i = 0; i < totalTries; i++) {
      const rx = Math.floor(this.pseudoRandom(i * 13) * (this.width - 8)) + 4;
      const ry = Math.floor(this.pseudoRandom(i * 29) * (maxY - minY)) + minY;

      for (let c = 0; c < clusterSize; c++) {
        const ox = rx + Math.floor((this.pseudoRandom(i + c) - 0.5) * 3);
        const oy = ry + Math.floor((this.pseudoRandom(i * 2 + c) - 0.5) * 3);
        if (this.getBlock(ox, oy) === BLOCKS.STONE) {
          this.setBlock(ox, oy, oreType);
        }
      }
    }
  }

  growTree(baseX, baseY) {
    const height = 4 + Math.floor(this.pseudoRandom(baseX) * 3);

    for (let y = 0; y < height; y++) {
      this.setBlock(baseX, baseY - y, BLOCKS.OAK_LOG);
    }

    const topY = baseY - height;
    for (let lx = -2; lx <= 2; lx++) {
      for (let ly = -2; ly <= 1; ly++) {
        if (Math.abs(lx) === 2 && Math.abs(ly) === 2 && this.pseudoRandom(lx * ly) > 0.4) continue;
        const targetX = baseX + lx;
        const targetY = topY + ly;
        if (this.getBlock(targetX, targetY) === BLOCKS.AIR) {
          this.setBlock(targetX, targetY, BLOCKS.OAK_LEAVES);
        }
      }
    }
  }

  computeLighting(sunIntensity = 1.0, viewMinX, viewMaxX, viewMinY, viewMaxY) {
    const startX = Math.max(0, viewMinX - 10);
    const endX = Math.min(this.width - 1, viewMaxX + 10);
    const startY = Math.max(0, viewMinY - 10);
    const endY = Math.min(this.height - 1, viewMaxY + 10);

    for (let x = startX; x <= endX; x++) {
      let light = sunIntensity;
      for (let y = 0; y <= endY; y++) {
        const idx = this.getIndex(x, y);
        const b = this.blocks[idx];

        if (b !== BLOCKS.AIR && b !== BLOCKS.TORCH && b !== BLOCKS.GLASS && b !== BLOCKS.LADDER) {
          light = Math.max(0.08, light * 0.65);
        }

        this.lightMap[idx] = light;
      }
    }

    this.torches.forEach(key => {
      const [tx, ty] = key.split(',').map(Number);
      if (tx >= startX && tx <= endX && ty >= startY && ty <= endY) {
        this.propagateTorchLight(tx, ty, 1.0, 6);
      }
    });
  }

  propagateTorchLight(cx, cy, intensity, radius) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const dist = Math.hypot(dx, dy);
        if (dist <= radius) {
          const idx = this.getIndex(cx + dx, cy + dy);
          if (idx !== -1) {
            const torchVal = (1.0 - dist / radius) * intensity;
            this.lightMap[idx] = Math.max(this.lightMap[idx], torchVal);
          }
        }
      }
    }
  }
}
