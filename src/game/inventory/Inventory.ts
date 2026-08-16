import { ItemStack, ArmorSlot } from '../types';
import { ITEM_DEFINITIONS } from './ItemData';
import { CraftingManager } from './CraftingManager';

export class Inventory {
  // Slots 0-8: Hotbar
  // Slots 9-35: Main Inventory
  public slots: (ItemStack | null)[] = new Array(36).fill(null);

  // Armor slots: Helmet, Chestplate, Leggings, Boots
  public armor: Record<ArmorSlot, ItemStack | null> = {
    [ArmorSlot.HELMET]: null,
    [ArmorSlot.CHESTPLATE]: null,
    [ArmorSlot.LEGGINGS]: null,
    [ArmorSlot.BOOTS]: null,
  };

  // Crafting grid: 2x2 (4 slots) or 3x3 (9 slots)
  public craftingGrid: (ItemStack | null)[] = new Array(9).fill(null);
  public craftingResult: ItemStack | null = null;
  public craftingStation: 'hand' | 'workbench' = 'hand';

  // Selected hotbar index (0-8)
  public selectedSlot: number = 0;

  constructor() {
    this.giveStarterKit();
  }

  public giveStarterKit() {
    this.addItem({ id: 'wood_pickaxe', count: 1 });
    this.addItem({ id: 'wood_axe', count: 1 });
    this.addItem({ id: 'wood_sword', count: 1 });
    this.addItem({ id: 'apple', count: 6 });
    this.addItem({ id: 'torch', count: 16 });
  }

  public getSelectedItem(): ItemStack | null {
    return this.slots[this.selectedSlot];
  }

  public addItem(item: ItemStack): boolean {
    const def = ITEM_DEFINITIONS[item.id];
    const maxStack = def?.maxStack || 64;

    // 1. Try to stack into existing non-full slots
    for (let i = 0; i < 36; i++) {
      const current = this.slots[i];
      if (current && current.id === item.id && current.count < maxStack) {
        const canAdd = Math.min(item.count, maxStack - current.count);
        current.count += canAdd;
        item.count -= canAdd;
        if (item.count <= 0) return true;
      }
    }

    // 2. Try to place in first empty slot
    for (let i = 0; i < 36; i++) {
      if (!this.slots[i]) {
        const placeCount = Math.min(item.count, maxStack);
        this.slots[i] = { id: item.id, count: placeCount };
        item.count -= placeCount;
        if (item.count <= 0) return true;
      }
    }

    return item.count === 0;
  }

  public removeItem(slotIndex: number, count: number = 1): ItemStack | null {
    const current = this.slots[slotIndex];
    if (!current) return null;

    if (current.count <= count) {
      const removed = { ...current };
      this.slots[slotIndex] = null;
      return removed;
    } else {
      current.count -= count;
      return { id: current.id, count };
    }
  }

  public swapSlots(fromIndex: number, toIndex: number) {
    const temp = this.slots[fromIndex];
    this.slots[fromIndex] = this.slots[toIndex];
    this.slots[toIndex] = temp;
  }

  public updateCrafting() {
    const gridDim = this.craftingStation === 'workbench' ? 3 : 2;
    const match = CraftingManager.findRecipe(
      this.craftingGrid,
      gridDim,
      gridDim,
      this.craftingStation
    );
    this.craftingResult = match ? match.result : null;
  }

  public takeCraftingResult(): boolean {
    if (!this.craftingResult) return false;

    // Try to add to inventory
    const resultClone = { ...this.craftingResult };
    if (!this.addItem(resultClone)) {
      return false; // Inventory full
    }

    // Deduct 1 from each occupied crafting slot
    const maxSlots = this.craftingStation === 'workbench' ? 9 : 4;
    for (let i = 0; i < maxSlots; i++) {
      const item = this.craftingGrid[i];
      if (item && item.count > 0) {
        item.count--;
        if (item.count <= 0) {
          this.craftingGrid[i] = null;
        }
      }
    }

    this.updateCrafting();
    return true;
  }

  public clearCraftingGrid() {
    for (let i = 0; i < this.craftingGrid.length; i++) {
      if (this.craftingGrid[i]) {
        this.addItem(this.craftingGrid[i]!);
        this.craftingGrid[i] = null;
      }
    }
    this.craftingResult = null;
  }

  public serialize() {
    return {
      slots: this.slots,
      armor: this.armor,
      selectedSlot: this.selectedSlot,
    };
  }

  public deserialize(data: { slots: (ItemStack | null)[]; armor: Record<ArmorSlot, ItemStack | null>; selectedSlot?: number }) {
    if (data.slots && Array.isArray(data.slots)) {
      this.slots = data.slots;
    }
    if (data.armor) {
      this.armor = data.armor;
    }
    if (typeof data.selectedSlot === 'number') {
      this.selectedSlot = data.selectedSlot;
    }
  }
}
