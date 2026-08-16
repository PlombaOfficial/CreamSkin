import React from 'react';
import { GameEngine } from '../GameEngine';

interface TouchControlsProps {
  engine: GameEngine;
  onOpenInventory: () => void;
  onOpenChat: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  engine,
  onOpenInventory,
  onOpenChat,
}) => {
  return (
    <div className="mobile-controls">
      {/* D-Pad Left & Right */}
      <div className="dpad-container">
        <button
          className="touch-btn"
          onTouchStart={(e) => {
            e.preventDefault();
            engine.keys.left = true;
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            engine.keys.left = false;
          }}
        >
          ◀
        </button>

        <button
          className="touch-btn"
          onTouchStart={(e) => {
            e.preventDefault();
            engine.keys.right = true;
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            engine.keys.right = false;
          }}
        >
          ▶
        </button>
      </div>

      {/* Action Buttons */}
      <div className="actions-container">
        <div className="action-row">
          <button className="touch-btn" onClick={onOpenChat}>
            💬
          </button>
          <button className="touch-btn" onClick={onOpenInventory}>
            🎒
          </button>
        </div>

        <div className="action-row">
          <button
            className="touch-btn action-btn-large"
            style={{ background: 'rgba(231, 76, 60, 0.85)' }}
            onTouchStart={(e) => {
              e.preventDefault();
              engine.isMouseDownLeft = true;
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              engine.isMouseDownLeft = false;
            }}
          >
            ⛏️ MINE
          </button>

          <button
            className="touch-btn action-btn-large"
            style={{ background: 'rgba(46, 204, 113, 0.85)' }}
            onTouchStart={(e) => {
              e.preventDefault();
              const cursor = engine.getCursorWorldCoords();
              const cam = engine.renderer.camera;
              const screen = cam.worldToScreen(cursor.wx + 0.5, cursor.wy + 0.5);
              engine.handleRightClick(screen.sx, screen.sy);
            }}
          >
            📦 USE
          </button>

          <button
            className="touch-btn action-btn-large"
            style={{ background: 'rgba(52, 152, 219, 0.85)' }}
            onTouchStart={(e) => {
              e.preventDefault();
              engine.keys.jump = true;
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              engine.keys.jump = false;
            }}
          >
            ▲ JUMP
          </button>
        </div>
      </div>
    </div>
  );
};
