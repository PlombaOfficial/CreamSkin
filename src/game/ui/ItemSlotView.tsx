import React, { useEffect, useRef } from 'react';
import { ItemStack } from '../types';
import { ITEM_DEFINITIONS } from '../inventory/ItemData';
import { textureAtlas, TILE_SIZE } from '../textures/TextureAtlas';

interface ItemSlotProps {
  item: ItemStack | null;
  index?: number;
  isSelected?: boolean;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  showIndexBadge?: boolean;
}

export const ItemSlotView: React.FC<ItemSlotProps> = ({
  item,
  index,
  isSelected,
  onClick,
  onContextMenu,
  showIndexBadge,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    if (item) {
      const coords = textureAtlas.getSpriteCoords(`item_${item.id}`) || textureAtlas.getSpriteCoords(`block_${item.id}`);
      ctx.drawImage(
        textureAtlas.canvas,
        coords.x, coords.y, TILE_SIZE, TILE_SIZE,
        0, 0, canvas.width, canvas.height
      );
    }
  }, [item]);

  const def = item ? ITEM_DEFINITIONS[item.id] : null;

  return (
    <div
      className={`item-slot ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        if (onContextMenu) onContextMenu(e);
      }}
      title={def ? `${def.name} (${item?.count})` : undefined}
    >
      {showIndexBadge && index !== undefined && (
        <span className="slot-index-badge">{(index % 9) + 1}</span>
      )}
      {item && (
        <>
          <canvas ref={canvasRef} width={30} height={30} className="slot-item-img" />
          {item.count > 1 && <span className="slot-count-badge">{item.count}</span>}
        </>
      )}
    </div>
  );
};
