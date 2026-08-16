import { BlockType } from '../types';
import { CHUNK_WIDTH, CHUNK_HEIGHT } from './WorldConstants';

export class Chunk {
  public chunkX: number;
  public blocks: Uint8Array; // 16 * 128
  public walls: Uint8Array;  // Background wall blocks (for caves/houses)
  public lightMap: Uint8Array; // 16 * 128, lower 4 bits: block light, upper 4 bits: sky light
  public isDirty = true;
  public isModified = false;

  constructor(chunkX: number) {
    this.chunkX = chunkX;
    this.blocks = new Uint8Array(CHUNK_WIDTH * CHUNK_HEIGHT);
    this.walls = new Uint8Array(CHUNK_WIDTH * CHUNK_HEIGHT);
    this.lightMap = new Uint8Array(CHUNK_WIDTH * CHUNK_HEIGHT);
  }

  public getIndex(localX: number, y: number): number {
    return y * CHUNK_WIDTH + localX;
  }

  public getBlock(localX: number, y: number): BlockType {
    if (localX < 0 || localX >= CHUNK_WIDTH || y < 0 || y >= CHUNK_HEIGHT) {
      return BlockType.AIR;
    }
    return this.blocks[this.getIndex(localX, y)] as BlockType;
  }

  public setBlock(localX: number, y: number, type: BlockType): boolean {
    if (localX < 0 || localX >= CHUNK_WIDTH || y < 0 || y >= CHUNK_HEIGHT) {
      return false;
    }
    const idx = this.getIndex(localX, y);
    if (this.blocks[idx] !== type) {
      this.blocks[idx] = type;
      this.isDirty = true;
      this.isModified = true;
      return true;
    }
    return false;
  }

  public getSkyLight(localX: number, y: number): number {
    if (localX < 0 || localX >= CHUNK_WIDTH || y < 0 || y >= CHUNK_HEIGHT) return 15;
    return (this.lightMap[this.getIndex(localX, y)] >> 4) & 0x0f;
  }

  public setSkyLight(localX: number, y: number, light: number) {
    if (localX < 0 || localX >= CHUNK_WIDTH || y < 0 || y >= CHUNK_HEIGHT) return;
    const idx = this.getIndex(localX, y);
    const blockLight = this.lightMap[idx] & 0x0f;
    this.lightMap[idx] = ((light & 0x0f) << 4) | blockLight;
  }

  public getBlockLight(localX: number, y: number): number {
    if (localX < 0 || localX >= CHUNK_WIDTH || y < 0 || y >= CHUNK_HEIGHT) return 0;
    return this.lightMap[this.getIndex(localX, y)] & 0x0f;
  }

  public setBlockLight(localX: number, y: number, light: number) {
    if (localX < 0 || localX >= CHUNK_WIDTH || y < 0 || y >= CHUNK_HEIGHT) return;
    const idx = this.getIndex(localX, y);
    const skyLight = this.lightMap[idx] & 0xf0;
    this.lightMap[idx] = skyLight | (light & 0x0f);
  }

  public serialize(): { chunkX: number; blocks: number[]; walls: number[] } {
    return {
      chunkX: this.chunkX,
      blocks: Array.from(this.blocks),
      walls: Array.from(this.walls),
    };
  }

  public deserialize(data: { blocks: number[]; walls?: number[] }) {
    if (data.blocks) {
      this.blocks = new Uint8Array(data.blocks);
    }
    if (data.walls) {
      this.walls = new Uint8Array(data.walls);
    }
    this.isDirty = true;
  }
}
