import { ChestData, FurnaceData, ItemStack } from '../types';
import { ITEM_DEFINITIONS } from './ItemData';

export class ChestContainer {
  public id: string;
  public x: number;
  public y: number;
  public items: (ItemStack | null)[];

  constructor(id: string, x: number, y: number, items?: (ItemStack | null)[]) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.items = items || new Array(27).fill(null);
  }

  public addItem(item: ItemStack): boolean {
    const def = ITEM_DEFINITIONS[item.id];
    const maxStack = def?.maxStack || 64;

    for (let i = 0; i < 27; i++) {
      const current = this.items[i];
      if (current && current.id === item.id && current.count < maxStack) {
        const canAdd = Math.min(item.count, maxStack - current.count);
        current.count += canAdd;
        item.count -= canAdd;
        if (item.count <= 0) return true;
      }
    }

    for (let i = 0; i < 27; i++) {
      if (!this.items[i]) {
        const placeCount = Math.min(item.count, maxStack);
        this.items[i] = { id: item.id, count: placeCount };
        item.count -= placeCount;
        if (item.count <= 0) return true;
      }
    }

    return item.count === 0;
  }

  public toJSON(): ChestData {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      items: this.items,
    };
  }
}

export class FurnaceContainer {
  public id: string;
  public x: number;
  public y: number;
  public input: ItemStack | null = null;
  public fuel: ItemStack | null = null;
  public output: ItemStack | null = null;
  public burnTimeRemaining = 0;
  public maxBurnTime = 0;
  public cookProgress = 0;
  public cookTimeTotal = 200; // ~10 seconds at 20 ticks/sec

  constructor(id: string, x: number, y: number, data?: Partial<FurnaceData>) {
    this.id = id;
    this.x = x;
    this.y = y;
    if (data) {
      this.input = data.input || null;
      this.fuel = data.fuel || null;
      this.output = data.output || null;
      this.burnTimeRemaining = data.burnTimeRemaining || 0;
      this.maxBurnTime = data.maxBurnTime || 0;
      this.cookProgress = data.cookProgress || 0;
    }
  }

  public isLit(): boolean {
    return this.burnTimeRemaining > 0;
  }

  public tick() {
    // 1. Burn timer countdown
    if (this.burnTimeRemaining > 0) {
      this.burnTimeRemaining--;
    }

    const inputDef = this.input ? ITEM_DEFINITIONS[this.input.id] : null;
    const canSmelt = inputDef && inputDef.smeltOutput;

    // Check if output slot can receive smelt result
    const canOutput = canSmelt && (!this.output || (this.output.id === inputDef.smeltOutput && this.output.count < 64));

    // 2. Consume fuel if not burning and work is pending
    if (this.burnTimeRemaining <= 0 && canOutput && this.fuel && this.fuel.count > 0) {
      const fuelDef = ITEM_DEFINITIONS[this.fuel.id];
      if (fuelDef && fuelDef.burnTime && fuelDef.burnTime > 0) {
        this.burnTimeRemaining = fuelDef.burnTime;
        this.maxBurnTime = fuelDef.burnTime;
        this.fuel.count--;
        if (this.fuel.count <= 0) {
          this.fuel = null;
        }
      }
    }

    // 3. Cook progress
    if (this.burnTimeRemaining > 0 && canOutput) {
      this.cookProgress++;
      if (this.cookProgress >= (inputDef?.smeltTime || this.cookTimeTotal)) {
        this.cookProgress = 0;
        // Complete smelting
        if (!this.output) {
          this.output = { id: inputDef!.smeltOutput!, count: 1 };
        } else {
          this.output.count++;
        }
        // Deduct input
        this.input!.count--;
        if (this.input!.count <= 0) {
          this.input = null;
        }
      }
    } else if (!canOutput) {
      if (this.cookProgress > 0) {
        this.cookProgress = Math.max(0, this.cookProgress - 2);
      }
    }
  }

  public toJSON(): FurnaceData {
    return {
      input: this.input,
      fuel: this.fuel,
      output: this.output,
      burnTimeRemaining: this.burnTimeRemaining,
      maxBurnTime: this.maxBurnTime,
      cookProgress: this.cookProgress,
      cookTimeTotal: this.cookTimeTotal,
    };
  }
}
