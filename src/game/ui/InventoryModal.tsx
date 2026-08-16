import React, { useState } from 'react';
import { Player } from '../entities/Player';
import { ItemSlotView } from './ItemSlotView';
import { ItemStack } from '../types';
import { CraftingManager } from '../inventory/CraftingManager';
import { ITEM_DEFINITIONS } from '../inventory/ItemData';

interface InventoryModalProps {
  player: Player;
  onClose: () => void;
  onRefresh: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  player,
  onClose,
  onRefresh,
}) => {
  const [heldCursorItem, setHeldCursorItem] = useState<ItemStack | null>(null);
  const isWorkbench = player.inventory.craftingStation === 'workbench';
  const gridDim = isWorkbench ? 3 : 2;
  const numGridSlots = gridDim * gridDim;

  const handleSlotClick = (slotIdx: number) => {
    const current = player.inventory.slots[slotIdx];

    if (!heldCursorItem) {
      if (current) {
        setHeldCursorItem(current);
        player.inventory.slots[slotIdx] = null;
      }
    } else {
      if (!current) {
        player.inventory.slots[slotIdx] = heldCursorItem;
        setHeldCursorItem(null);
      } else if (current.id === heldCursorItem.id) {
        const maxStack = ITEM_DEFINITIONS[current.id]?.maxStack || 64;
        const add = Math.min(heldCursorItem.count, maxStack - current.count);
        current.count += add;
        heldCursorItem.count -= add;
        if (heldCursorItem.count <= 0) {
          setHeldCursorItem(null);
        }
      } else {
        // Swap
        player.inventory.slots[slotIdx] = heldCursorItem;
        setHeldCursorItem(current);
      }
    }
    onRefresh();
  };

  const handleCraftingGridClick = (gridIdx: number) => {
    const current = player.inventory.craftingGrid[gridIdx];

    if (!heldCursorItem) {
      if (current) {
        setHeldCursorItem(current);
        player.inventory.craftingGrid[gridIdx] = null;
      }
    } else {
      if (!current) {
        player.inventory.craftingGrid[gridIdx] = { id: heldCursorItem.id, count: 1 };
        heldCursorItem.count--;
        if (heldCursorItem.count <= 0) {
          setHeldCursorItem(null);
        }
      } else if (current.id === heldCursorItem.id) {
        current.count++;
        heldCursorItem.count--;
        if (heldCursorItem.count <= 0) {
          setHeldCursorItem(null);
        }
      } else {
        player.inventory.craftingGrid[gridIdx] = heldCursorItem;
        setHeldCursorItem(current);
      }
    }

    player.inventory.updateCrafting();
    onRefresh();
  };

  const handleTakeCraftingResult = () => {
    if (!player.inventory.craftingResult) return;

    if (!heldCursorItem) {
      const res = { ...player.inventory.craftingResult };
      setHeldCursorItem(res);
      // Consume 1 ingredient from each grid slot
      for (let i = 0; i < numGridSlots; i++) {
        const item = player.inventory.craftingGrid[i];
        if (item && item.count > 0) {
          item.count--;
          if (item.count <= 0) player.inventory.craftingGrid[i] = null;
        }
      }
      player.inventory.updateCrafting();
      onRefresh();
    }
  };

  const handleQuickCraft = (recipeId: string) => {
    const recipe = CraftingManager.RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return;

    // Check if player has all ingredients in inventory
    const needed = new Map<string, number>();
    for (const item of recipe.pattern) {
      if (item) {
        needed.set(item, (needed.get(item) || 0) + 1);
      }
    }

    let canCraft = true;
    for (const [id, count] of needed.entries()) {
      let totalHave = 0;
      for (const slot of player.inventory.slots) {
        if (slot && slot.id === id) totalHave += slot.count;
      }
      if (totalHave < count) {
        canCraft = false;
        break;
      }
    }

    if (!canCraft) return;

    // Consume items
    for (const [id, count] of needed.entries()) {
      let remaining = count;
      for (let i = 0; i < player.inventory.slots.length; i++) {
        const slot = player.inventory.slots[i];
        if (slot && slot.id === id) {
          const take = Math.min(slot.count, remaining);
          slot.count -= take;
          remaining -= take;
          if (slot.count <= 0) player.inventory.slots[i] = null;
          if (remaining <= 0) break;
        }
      }
    }

    // Add result to inventory
    player.inventory.addItem({ ...recipe.result });
    onRefresh();
  };

  const handleClose = () => {
    if (heldCursorItem) {
      player.inventory.addItem(heldCursorItem);
      setHeldCursorItem(null);
    }
    player.inventory.clearCraftingGrid();
    player.inventory.craftingStation = 'hand';
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="pixel-window" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="window-header">
          <span>{isWorkbench ? '🔨 Workbench (3x3)' : '🎒 Inventory & Crafting'}</span>
          <button className="close-btn" onClick={handleClose}>✖</button>
        </div>

        {/* Top: Crafting Area */}
        <div className="crafting-section">
          <div>
            <div style={{ fontSize: '10px', color: '#ffcc00', marginBottom: '6px' }}>Crafting</div>
            <div className={isWorkbench ? 'crafting-grid-3x3' : 'crafting-grid-2x2'}>
              {Array.from({ length: numGridSlots }).map((_, i) => (
                <ItemSlotView
                  key={`craft_slot_${i}`}
                  item={player.inventory.craftingGrid[i]}
                  onClick={() => handleCraftingGridClick(i)}
                />
              ))}
            </div>
          </div>

          <div className="arrow-icon">➔</div>

          <div>
            <div style={{ fontSize: '10px', color: '#55ff55', marginBottom: '6px' }}>Result</div>
            <ItemSlotView
              item={player.inventory.craftingResult}
              onClick={handleTakeCraftingResult}
            />
          </div>

          {/* Quick Craft Recipes Panel */}
          <div style={{ marginLeft: 'auto', maxHeight: '120px', overflowY: 'auto' }}>
            <div style={{ fontSize: '9px', color: '#ffcc00', marginBottom: '4px' }}>Quick Recipes</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '200px' }}>
              {CraftingManager.RECIPES.slice(0, 10).map((r) => (
                <button
                  key={r.id}
                  className="top-bar-btn"
                  style={{ fontSize: '8px', padding: '3px 6px' }}
                  onClick={() => handleQuickCraft(r.id)}
                >
                  +{r.result.count} {r.result.id.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main 27 Inventory Slots */}
        <div>
          <div style={{ fontSize: '10px', color: '#8d95ab', marginBottom: '6px' }}>Storage</div>
          <div className="inventory-grid">
            {player.inventory.slots.slice(9, 36).map((item, idx) => (
              <ItemSlotView
                key={`main_inv_${idx + 9}`}
                item={item}
                onClick={() => handleSlotClick(idx + 9)}
              />
            ))}
          </div>
        </div>

        {/* Bottom 9 Hotbar Slots */}
        <div>
          <div style={{ fontSize: '10px', color: '#ffcc00', marginBottom: '6px' }}>Hotbar</div>
          <div className="inventory-grid">
            {player.inventory.slots.slice(0, 9).map((item, idx) => (
              <ItemSlotView
                key={`inv_hotbar_${idx}`}
                item={item}
                index={idx}
                showIndexBadge={true}
                onClick={() => handleSlotClick(idx)}
              />
            ))}
          </div>
        </div>

        {/* Floating Cursor Hand */}
        {heldCursorItem && (
          <div style={{ fontSize: '10px', color: '#55ff55' }}>
            Holding: {heldCursorItem.count}x {heldCursorItem.id} (Click slot to place)
          </div>
        )}
      </div>
    </div>
  );
};
