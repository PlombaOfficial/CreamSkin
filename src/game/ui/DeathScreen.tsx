import React from 'react';
import { Player } from '../entities/Player';

interface DeathScreenProps {
  player: Player;
  onRespawn: () => void;
}

export const DeathScreen: React.FC<DeathScreenProps> = ({ player, onRespawn }) => {
  return (
    <div className="modal-backdrop" style={{ background: 'rgba(120, 10, 10, 0.85)' }}>
      <div className="pixel-window" style={{ textAlign: 'center', borderColor: '#e74c3c' }}>
        <h1 style={{ color: '#ff4444', fontSize: '24px', margin: '0 0 12px 0' }}>YOU DIED!</h1>
        <p style={{ fontSize: '11px', color: '#ffaaaa' }}>
          Death location: X: {Math.floor(player.x)} Y: {Math.floor(player.y)}
        </p>
        <p style={{ fontSize: '12px', color: '#ffcc00', margin: '16px 0' }}>
          Score: {player.score} | Level: {player.level}
        </p>
        <button
          className="top-bar-btn"
          style={{ padding: '10px 24px', fontSize: '13px', background: '#27ae60', borderColor: '#2ecc71', margin: '0 auto' }}
          onClick={onRespawn}
        >
          🔄 Respawn
        </button>
      </div>
    </div>
  );
};
