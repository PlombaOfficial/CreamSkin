import React, { useState, useEffect } from 'react';
import { Player } from '../entities/Player';
import { FurnaceContainer } from '../inventory/Containers';
import { ItemSlotView } from './ItemSlotView';
import { ItemStack } from '../types';
import { ITEM_DEFINITIONS } from '../inventory/ItemData';

interface FurnaceModalProps {
  player: Player;
  furnace: FurnaceContainer;
  onClose: () => void;
  onRefresh: () => void;
}

export const FurnaceModal: React.FC<FurnaceModalProps> = ({
  player,
  furnace,
  onClose,
  onRefresh,
}) => {
  const [heldCursorItem, setHeldCursorItem] = useState<ItemStack | null>(null);
  const [, setTick] = useState(0);

  // Poll furnace progress updates for animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleInputSlotClick = () => {
    if (!heldCursorItem) {
      if (furnace.input) {
        setHeldCursorItem(furnace.input);
        furnace.input = null;
      }
    } else {
      if (!furnace.input) {
        furnace.input = heldCursorItem;
        setHeldCursorItem(null);
      } else if (furnace.input.id === heldCursorItem.id) {
        const maxStack = ITEM_DEFINITIONS[furnace.input.id]?.maxStack || 64;
        const add = Math.min(heldCursorItem.count, maxStack - furnace.input.count);
        furnace.input.count += add;
        heldCursorItem.count -= add;
        if (heldCursorItem.count <= 0) setHeldCursorItem(null);
      } else {
        const temp = furnace.input;
        furnace.input = heldCursorItem;
        setHeldCursorItem(temp);
      }
    }
    onRefresh();
  };

  const handleFuelSlotClick = () => {
    if (!heldCursorItem) {
      if (furnace.fuel) {
        setHeldCursorItem(furnace.fuel);
        furnace.fuel = null;
      }
    } else {
      if (!furnace.fuel) {
        furnace.fuel = heldCursorItem;
        setHeldCursorItem(null);
      } else if (furnace.fuel.id === heldCursorItem.id) {
        const maxStack = ITEM_DEFINITIONS[furnace.fuel.id]?.maxStack || 64;
        const add = Math.min(heldCursorItem.count, maxStack - furnace.fuel.count);
        furnace.fuel.count += add;
        heldCursorItem.count -= add;
        if (heldCursorItem.count <= 0) setHeldCursorItem(null);
      } else {
        const temp = furnace.fuel;
        furnace.fuel = heldCursorItem;
        setHeldCursorItem(temp);
      }
    }
    onRefresh();
  };

  const handleOutputSlotClick = () => {
    if (furnace.output && !heldCursorItem) {
      setHeldCursorItem(furnace.output);
      furnace.output = null;
      onRefresh();
    }
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

  const burnPercent = furnace.maxBurnTime > 0 ? (furnace.burnTimeRemaining / furnace.maxBurnTime) * 100 : 0;
  const cookPercent = (furnace.cookProgress / furnace.cookTimeTotal) * 100;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="pixel-window" onClick={(e) => e.stopPropagation()}>
        <div className="window-header">
          <span>🔥 Stone Furnace</span>
          <button className="close-btn" onClick={handleClose}>✖</button>
        </div>

        {/* Smelting Forge Section */}
        <div className="crafting-section" style={{ justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            {/* Input Slot */}
            <div>
              <div style={{ fontSize: '9px', color: '#ffcc00', marginBottom: '2px' }}>Input</div>
              <ItemSlotView item={furnace.input} onClick={handleInputSlotClick} />
            </div>

            {/* Fire flame indicator */}
            <div style={{ fontSize: '18px', filter: furnace.isLit() ? 'drop-shadow(0 0 6px #ff5500)' : 'grayscale(1) opacity(0.3)' }}>
              🔥 {furnace.isLit() ? `${Math.round(burnPercent)}%` : ''}
            </div>

            {/* Fuel Slot */}
            <div>
              <div style={{ fontSize: '9px', color: '#ffcc00', marginBottom: '2px' }}>Fuel</div>
              <ItemSlotView item={furnace.fuel} onClick={handleFuelSlotClick} />
            </div>
          </div>

          {/* Progress Arrow */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 20px' }}>
            <span style={{ fontSize: '24px', color: furnace.cookProgress > 0 ? '#55ff55' : '#6d758f' }}>➔</span>
            <span style={{ fontSize: '9px', color: '#55ff55' }}>{Math.round(cookPercent)}%</span>
          </div>

          {/* Output Slot */}
          <div>
            <div style={{ fontSize: '9px', color: '#55ff55', marginBottom: '2px' }}>Output</div>
            <ItemSlotView item={furnace.output} onClick={handleOutputSlotClick} />
          </div>
        </div>

        {/* Player Inventory */}
        <div>
          <div style={{ fontSize: '10px', color: '#8d95ab', marginBottom: '6px' }}>Inventory</div>
          <div className="inventory-grid">
            {player.inventory.slots.slice(9, 36).map((item, idx) => (
              <ItemSlotView
                key={`furnace_player_inv_${idx + 9}`}
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
                key={`furnace_player_hotbar_${idx}`}
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
