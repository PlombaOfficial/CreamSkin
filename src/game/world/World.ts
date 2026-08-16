import { BlockType } from '../types';
import { Chunk } from './Chunk';
import { TerrainGenerator } from './TerrainGenerator';
import { LightingEngine } from '../lighting/LightingEngine';
import { ChestContainer, FurnaceContainer } from '../inventory/Containers';
import {
  CHUNK_WIDTH,
  CHUNK_HEIGHT,
  RENDER_CHUNK_RADIUS,
  UNLOAD_CHUNK_DISTANCE,
} from './WorldConstants';
import { BLOCK_DEFINITIONS } from '../inventory/ItemData';
import { audioManager } from '../audio/AudioManager';

export class World {
  public seed: number;
  public generator: TerrainGenerator;
  public lighting: LightingEngine;

  public chunks: Map<number, Chunk> = new Map();
  public modifiedChunks: Map<number, Chunk> = new Map(); // Preserves user edits

  public chests: Map<string, ChestContainer> = new Map();
  public furnaces: Map<string, FurnaceContainer> = new Map();

  private liquidTickCooldown = 0;

  constructor(seed: number = 777123) {
    this.seed = seed;
    this.generator = new TerrainGenerator(seed);
    this.lighting = new LightingEngine(this);
  }

  public getChunk(chunkX: number): Chunk | undefined {
    return this.chunks.get(chunkX);
  }

  public updateChunksAround(centerWorldX: number) {
    const centerChunkX = Math.floor(centerWorldX / (CHUNK_WIDTH * 16));

    // 1. Load missing chunks within radius
    for (let cx = centerChunkX - RENDER_CHUNK_RADIUS; cx <= centerChunkX + RENDER_CHUNK_RADIUS; cx++) {
      if (!this.chunks.has(cx)) {
        this.loadOrCreateChunk(cx);
      }
    }

    // 2. Unload far chunks
    for (const [cx, chunk] of this.chunks.entries()) {
      if (Math.abs(cx - centerChunkX) > UNLOAD_CHUNK_DISTANCE) {
        if (chunk.isModified) {
          this.modifiedChunks.set(cx, chunk);
        }
        this.chunks.delete(cx);
      }
    }
  }

  public loadOrCreateChunk(chunkX: number): Chunk {
    // Check if we have modified state cached
    let chunk = this.modifiedChunks.get(chunkX);
    if (!chunk) {
      chunk = this.generator.generateChunk(chunkX);
      this.lighting.computeInitialChunkLighting(chunk);
    }
    this.chunks.set(chunkX, chunk);
    return chunk;
  }

  public getBlock(worldX: number, worldY: number): BlockType {
    if (worldY < 0 || worldY >= CHUNK_HEIGHT) return BlockType.AIR;
    const chunkX = Math.floor(worldX / CHUNK_WIDTH);
    const localX = ((worldX % CHUNK_WIDTH) + CHUNK_WIDTH) % CHUNK_WIDTH;

    let chunk = this.chunks.get(chunkX);
    if (!chunk) {
      chunk = this.loadOrCreateChunk(chunkX);
    }
    return chunk.getBlock(localX, worldY);
  }

  public setBlock(worldX: number, worldY: number, type: BlockType): boolean {
    if (worldY < 0 || worldY >= CHUNK_HEIGHT) return false;
    const chunkX = Math.floor(worldX / CHUNK_WIDTH);
    const localX = ((worldX % CHUNK_WIDTH) + CHUNK_WIDTH) % CHUNK_WIDTH;

    let chunk = this.chunks.get(chunkX);
    if (!chunk) {
      chunk = this.loadOrCreateChunk(chunkX);
    }

    const changed = chunk.setBlock(localX, worldY, type);
    if (changed) {
      this.lighting.onBlockChanged(worldX, worldY, type);

      // Create/Remove containers if needed
      const key = `${worldX},${worldY}`;
      if (type === BlockType.CHEST && !this.chests.has(key)) {
        this.chests.set(key, new ChestContainer(key, worldX, worldY));
      } else if (type !== BlockType.CHEST && this.chests.has(key)) {
        this.chests.delete(key);
      }

      if ((type === BlockType.FURNACE || type === BlockType.FURNACE_ACTIVE) && !this.furnaces.has(key)) {
        this.furnaces.set(key, new FurnaceContainer(key, worldX, worldY));
      } else if (type !== BlockType.FURNACE && type !== BlockType.FURNACE_ACTIVE && this.furnaces.has(key)) {
        this.furnaces.delete(key);
      }
    }
    return changed;
  }

  public breakBlock(worldX: number, worldY: number): { dropId: string; dropCount: number } | null {
    const current = this.getBlock(worldX, worldY);
    if (current === BlockType.AIR || current === BlockType.BEDROCK) return null;

    const def = BLOCK_DEFINITIONS[current];
    const dropId = def ? def.dropItemId : '';
    const dropCount = def?.dropCount !== undefined ? (Math.random() < def.dropCount ? Math.ceil(def.dropCount) : 0) : 1;

    this.setBlock(worldX, worldY, BlockType.AIR);
    audioManager.playBlockBreak();

    return dropId ? { dropId, dropCount } : null;
  }

  public placeBlock(worldX: number, worldY: number, type: BlockType): boolean {
    const current = this.getBlock(worldX, worldY);
    if (current !== BlockType.AIR && current !== BlockType.WATER && current !== BlockType.TALL_GRASS) {
      return false;
    }

    const placed = this.setBlock(worldX, worldY, type);
    if (placed) {
      audioManager.playBlockPlace();
    }
    return placed;
  }

  public updateFurnaces() {
    for (const [key, furnace] of this.furnaces.entries()) {
      const wasLit = furnace.isLit();
      furnace.tick();
      const isLitNow = furnace.isLit();

      if (wasLit !== isLitNow) {
        const [fx, fy] = key.split(',').map(Number);
        this.setBlock(fx, fy, isLitNow ? BlockType.FURNACE_ACTIVE : BlockType.FURNACE);
      }
    }
  }

  public updateLiquids() {
    this.liquidTickCooldown++;
    if (this.liquidTickCooldown < 4) return;
    this.liquidTickCooldown = 0;

    // Simple cellular automaton liquid step in loaded chunks
    for (const chunk of this.chunks.values()) {
      const startWorldX = chunk.chunkX * CHUNK_WIDTH;
      for (let lx = 0; lx < CHUNK_WIDTH; lx++) {
        const wx = startWorldX + lx;
        for (let y = 1; y < CHUNK_HEIGHT - 1; y++) {
          const b = chunk.getBlock(lx, y);
          if (b === BlockType.WATER || b === BlockType.LAVA) {
            // Check downward flow
            const below = this.getBlock(wx, y - 1);
            if (below === BlockType.AIR) {
              this.setBlock(wx, y - 1, b);
            } else {
              // Spread sideways
              if (this.getBlock(wx - 1, y) === BlockType.AIR && Math.random() < 0.25) {
                this.setBlock(wx - 1, y, b);
              }
              if (this.getBlock(wx + 1, y) === BlockType.AIR && Math.random() < 0.25) {
                this.setBlock(wx + 1, y, b);
              }
            }
          }
        }
      }
    }
  }
}
