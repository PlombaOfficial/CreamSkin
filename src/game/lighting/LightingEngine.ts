import { BlockType } from '../types';
import { BLOCK_DEFINITIONS } from '../inventory/ItemData';
import { CHUNK_WIDTH, CHUNK_HEIGHT } from '../world/WorldConstants';
import { Chunk } from '../world/Chunk';

export interface WorldLightAccessor {
  getChunk(chunkX: number): Chunk | undefined;
  getBlock(worldX: number, worldY: number): BlockType;
}

export class LightingEngine {
  private world: WorldLightAccessor;

  constructor(world: WorldLightAccessor) {
    this.world = world;
  }

  /**
   * Recalculate skylight and block light for a newly loaded chunk
   */
  public computeInitialChunkLighting(chunk: Chunk) {
    const startWorldX = chunk.chunkX * CHUNK_WIDTH;

    // 1. Initial Skylight: Raycast down from Y=127 until solid block
    for (let lx = 0; lx < CHUNK_WIDTH; lx++) {
      let light = 15;
      for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
        const block = chunk.getBlock(lx, y);
        const def = BLOCK_DEFINITIONS[block];

        if (def && !def.isTransparent) {
          light = 0;
        } else if (def && def.isLiquid) {
          light = Math.max(0, light - 2);
        }

        chunk.setSkyLight(lx, y, light);

        // Check if block emits light
        if (def && def.isLightEmitter && def.lightEmission) {
          chunk.setBlockLight(lx, y, def.lightEmission);
        }
      }
    }

    // 2. Spread block light sources within this chunk
    for (let lx = 0; lx < CHUNK_WIDTH; lx++) {
      for (let y = 0; y < CHUNK_HEIGHT; y++) {
        const bl = chunk.getBlockLight(lx, y);
        if (bl > 0) {
          this.propagateBlockLight(startWorldX + lx, y, bl);
        }
      }
    }
  }

  /**
   * Fast BFS flood fill propagation for block light sources (e.g. torches)
   */
  public propagateBlockLight(startX: number, startY: number, initialLevel: number) {
    const queue: [number, number, number][] = [[startX, startY, initialLevel]];
    const visited = new Set<string>();
    visited.add(`${startX},${startY}`);

    while (queue.length > 0) {
      const [wx, wy, level] = queue.shift()!;
      if (level <= 1) continue;

      const neighbors = [
        [wx + 1, wy],
        [wx - 1, wy],
        [wx, wy + 1],
        [wx, wy - 1],
      ];

      for (const [nx, ny] of neighbors) {
        if (ny < 0 || ny >= CHUNK_HEIGHT) continue;
        const key = `${nx},${ny}`;
        if (visited.has(key)) continue;

        const nChunkX = Math.floor(nx / CHUNK_WIDTH);
        const nLocalX = ((nx % CHUNK_WIDTH) + CHUNK_WIDTH) % CHUNK_WIDTH;
        const chunk = this.world.getChunk(nChunkX);
        if (!chunk) continue;

        const block = chunk.getBlock(nLocalX, ny);
        const def = BLOCK_DEFINITIONS[block];
        if (def && !def.isTransparent) continue; // Light blocked by solid

        const currentLight = chunk.getBlockLight(nLocalX, ny);
        const newLight = level - 1;

        if (newLight > currentLight) {
          chunk.setBlockLight(nLocalX, ny, newLight);
          chunk.isDirty = true;
          visited.add(key);
          queue.push([nx, ny, newLight]);
        }
      }
    }
  }

  /**
   * Update lighting when a block is changed at (worldX, worldY)
   */
  public onBlockChanged(worldX: number, worldY: number, newBlock: BlockType) {
    const chunkX = Math.floor(worldX / CHUNK_WIDTH);
    const localX = ((worldX % CHUNK_WIDTH) + CHUNK_WIDTH) % CHUNK_WIDTH;
    const chunk = this.world.getChunk(chunkX);
    if (!chunk) return;

    const def = BLOCK_DEFINITIONS[newBlock];

    if (def.isLightEmitter && def.lightEmission) {
      chunk.setBlockLight(localX, worldY, def.lightEmission);
      this.propagateBlockLight(worldX, worldY, def.lightEmission);
    } else if (!def.isTransparent) {
      // Solid block placed: zero light here and update column skylight below
      chunk.setBlockLight(localX, worldY, 0);
      for (let y = worldY - 1; y >= 0; y--) {
        if (chunk.getSkyLight(localX, y) > 0) {
          chunk.setSkyLight(localX, y, 0);
          chunk.isDirty = true;
        } else {
          break;
        }
      }
    } else {
      // Block broken (turned to air): if exposed to sky, restore skylight downward
      let hasSkyAccess = true;
      for (let y = worldY + 1; y < CHUNK_HEIGHT; y++) {
        const b = chunk.getBlock(localX, y);
        const bDef = BLOCK_DEFINITIONS[b];
        if (bDef && !bDef.isTransparent) {
          hasSkyAccess = false;
          break;
        }
      }
      if (hasSkyAccess) {
        for (let y = worldY; y >= 0; y--) {
          const b = chunk.getBlock(localX, y);
          const bDef = BLOCK_DEFINITIONS[b];
          if (bDef && !bDef.isTransparent) break;
          chunk.setSkyLight(localX, y, 15);
          chunk.isDirty = true;
        }
      }
    }
  }
}
