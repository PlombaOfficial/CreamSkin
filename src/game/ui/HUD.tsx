import React from 'react';
import { Player } from '../entities/Player';
import { WeatherEngine } from '../weather/WeatherEngine';
import { ItemSlotView } from './ItemSlotView';
import { ITEM_DEFINITIONS } from '../inventory/ItemData';

interface HUDProps {
  player: Player;
  weather: WeatherEngine;
  onlineCount: number;
  onOpenInventory: () => void;
  onOpenChat: () => void;
  onOpenPause: () => void;
  onSelectSlot: (slot: number) => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  weather,
  onlineCount,
  onOpenInventory,
  onOpenChat,
  onOpenPause,
  onSelectSlot,
}) => {
  const stats = player.getStats();
  const selectedItem = player.inventory.getSelectedItem();
  const itemDef = selectedItem ? ITEM_DEFINITIONS[selectedItem.id] : null;

  // Render 10 hearts
  const renderHearts = () => {
    const hearts = [];
    const maxHearts = 10;
    const hp = Math.max(0, Math.min(20, stats.health));

    for (let i = 0; i < maxHearts; i++) {
      const heartVal = hp - i * 2;
      let heartIcon = '❤️';
      if (heartVal >= 2) heartIcon = '❤️';
      else if (heartVal === 1) heartIcon = '💔';
      else heartIcon = '🖤';

      hearts.push(
        <span key={`heart_${i}`} style={{ fontSize: '14px' }}>
          {heartIcon}
        </span>
      );
    }
    return hearts;
  };

  // Render 10 drumsticks
  const renderHunger = () => {
    const drumsticks = [];
    const maxDrumsticks = 10;
    const hg = Math.max(0, Math.min(20, stats.hunger));

    for (let i = 0; i < maxDrumsticks; i++) {
      const val = hg - i * 2;
      let icon = '🍗';
      if (val >= 2) icon = '🍗';
      else if (val === 1) icon = '🍖';
      else icon = '🦴';

      drumsticks.push(
        <span key={`hunger_${i}`} style={{ fontSize: '14px' }}>
          {icon}
        </span>
      );
    }
    return drumsticks;
  };

  const xpPercent = Math.min(100, (stats.experience / Math.max(1, stats.xpToNextLevel)) * 100);

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <span>📍 X: {Math.floor(player.x)} Y: {Math.floor(player.y)}</span>
        <span>⏱️ Day {weather.dayCount} ({weather.weather.toUpperCase()})</span>
        <span>👥 Online: {onlineCount + 1}</span>
        <button className="top-bar-btn" onClick={onOpenChat}>💬 Chat [C]</button>
        <button className="top-bar-btn" onClick={onOpenInventory}>🎒 Bag [E]</button>
        <button className="top-bar-btn" onClick={onOpenPause}>⚙️ Menu [ESC]</button>
      </div>

      {/* Main HUD */}
      <div className="hud-layer">
        {/* Selected Item Tooltip */}
        {itemDef && (
          <div style={{ color: '#ffcc00', fontSize: '11px', textShadow: '1px 1px #000' }}>
            {itemDef.name}
          </div>
        )}

        {/* Health & Hunger */}
        <div className="status-bars-row">
          <div className="hearts-container">{renderHearts()}</div>
          <div className="hunger-container">{renderHunger()}</div>
        </div>

        {/* Oxygen Bubbles when underwater */}
        {player.inWater && (
          <div style={{ color: '#55ffff', fontSize: '10px' }}>
            🫧 Air: {Math.max(0, stats.air)}/20
          </div>
        )}

        {/* XP Bar */}
        <div className="xp-container">
          <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
          <span className="xp-level-badge">{stats.level}</span>
        </div>

        {/* Hotbar */}
        <div className="hotbar-container">
          {player.inventory.slots.slice(0, 9).map((item, idx) => (
            <ItemSlotView
              key={`hotbar_${idx}`}
              item={item}
              index={idx}
              showIndexBadge={true}
              isSelected={player.inventory.selectedSlot === idx}
              onClick={() => onSelectSlot(idx)}
            />
          ))}
        </div>
      </div>
    </>
  );
};
