import React, { useState } from 'react';
import { Player } from '../entities/Player';
import { ChestContainer } from '../inventory/Containers';
import { ItemSlotView } from './ItemSlotView';
import { ItemStack } from '../types';
import { ITEM_DEFINITIONS } from '../inventory/ItemData';

interface ChestModalProps {
  player: Player;
  chest: ChestContainer;
  onClose: () => void;
  onRefresh: () => void;
}

export const ChestModal: React.FC<ChestModalProps> = ({
  player,
  chest,
  onClose,
  onRefresh,
}) => {
  const [heldCursorItem, setHeldCursorItem] = useState<ItemStack | null>(null);

  const handleChestSlotClick = (idx: number) => {
    const current = chest.items[idx];

    if (!heldCursorItem) {
      if (current) {
        setHeldCursorItem(current);
        chest.items[idx] = null;
      }
    } else {
      if (!current) {
        chest.items[idx] = heldCursorItem;
        setHeldCursorItem(null);
      } else if (current.id === heldCursorItem.id) {
        const maxStack = ITEM_DEFINITIONS[current.id]?.maxStack || 64;
        const add = Math.min(heldCursorItem.count, maxStack - current.count);
        current.count += add;
        heldCursorItem.count -= add;
        if (heldCursorItem.count <= 0) setHeldCursorItem(null);
      } else {
        chest.items[idx] = heldCursorItem;
        setHeldCursorItem(current);
      }
    }
    onRefresh();
  };

  const handlePlayerSlotClick = (idx: number) => {
    const current = player.inventory.slots[idx];

    if (!heldCursorItem) {
      if (current) {
        setHeldCursorItem(current);
        player.inventory.slots[idx] = null;
      }
    } else {
      if (!current) {
        player.inventory.slots[idx] = heldCursorItem;
        setHeldCursorItem(null);
      } else if (current.id === heldCursorItem.id) {
        const maxStack = ITEM_DEFINITIONS[current.id]?.maxStack || 64;
        const add = Math.min(heldCursorItem.count, maxStack - current.count);
        current.count += add;
        heldCursorItem.count -= add;
        if (heldCursorItem.count <= 0) setHeldCursorItem(null);
      } else {
        player.inventory.slots[idx] = heldCursorItem;
        setHeldCursorItem(current);
      }
    }
    onRefresh();
  };

  const handleClose = () => {
    if (heldCursorItem) {
      player.inventory.addItem(heldCursorItem);
      setHeldCursorItem(null);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="pixel-window" onClick={(e) => e.stopPropagation()}>
        <div className="window-header">
          <span>📦 Wooden Chest</span>
          <button className="close-btn" onClick={handleClose}>✖</button>
        </div>

        {/* 27 Chest Slots */}
        <div>
          <div style={{ fontSize: '10px', color: '#ffcc00', marginBottom: '6px' }}>Chest Contents (27 Slots)</div>
          <div className="inventory-grid">
            {chest.items.map((item, idx) => (
              <ItemSlotView
                key={`chest_slot_${idx}`}
                item={item}
                onClick={() => handleChestSlotClick(idx)}
              />
            ))}
          </div>
        </div>

        {/* Player Inventory */}
        <div>
          <div style={{ fontSize: '10px', color: '#8d95ab', marginBottom: '6px' }}>Player Inventory</div>
          <div className="inventory-grid">
            {player.inventory.slots.slice(9, 36).map((item, idx) => (
              <ItemSlotView
                key={`chest_player_inv_${idx + 9}`}
                item={item}
                onClick={() => handlePlayerSlotClick(idx + 9)}
              />
            ))}
          </div>
        </div>

        {/* Player Hotbar */}
        <div>
          <div style={{ fontSize: '10px', color: '#ffcc00', marginBottom: '6px' }}>Hotbar</div>
          <div className="inventory-grid">
            {player.inventory.slots.slice(0, 9).map((item, idx) => (
              <ItemSlotView
                key={`chest_player_hotbar_${idx}`}
                item={item}
                index={idx}
                showIndexBadge={true}
                onClick={() => handlePlayerSlotClick(idx)}
              />
            ))}
          </div>
        </div>

        {heldCursorItem && (
          <div style={{ fontSize: '10px', color: '#55ff55' }}>
            Holding: {heldCursorItem.count}x {heldCursorItem.id} (Click slot to deposit)
          </div>
        )}
      </div>
    </div>
  );
};
