import React, { useState } from 'react';

interface MainMenuProps {
  onStartSingleplayer: (seed: number) => void;
  onOpenAuth: () => void;
  onInstallPWA?: () => void;
  canInstallPWA?: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartSingleplayer,
  onOpenAuth,
  onInstallPWA,
  canInstallPWA,
}) => {
  const [seedInput, setSeedInput] = useState<string>('777123');

  const handleStart = () => {
    const seed = parseInt(seedInput) || Math.floor(Math.random() * 999999);
    onStartSingleplayer(seed);
  };

  const handleRandomSeed = () => {
    setSeedInput(String(Math.floor(Math.random() * 900000 + 100000)));
  };

  return (
    <div className="modal-backdrop" style={{ background: 'linear-gradient(180deg, #0d1117 0%, #161b26 100%)' }}>
      <div className="pixel-window" style={{ width: '480px', textAlign: 'center' }}>
        {/* Title */}
        <div style={{ margin: '10px 0 20px 0' }}>
          <h1 style={{ color: '#55ff55', fontSize: '20px', letterSpacing: '2px', textShadow: '3px 3px #000, 0 0 12px rgba(85,255,85,0.4)', margin: 0 }}>
            MINECRAFT 2D
          </h1>
          <div style={{ color: '#ffcc00', fontSize: '11px', marginTop: '6px' }}>
            ★ FULL SANDBOX EDITION ★
          </div>
        </div>

        {/* Seed Input */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '4px', textAlign: 'left' }}>
          <div style={{ fontSize: '10px', color: '#ffcc00', marginBottom: '6px' }}>World Seed:</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="chat-input"
              style={{ flex: 1 }}
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
              placeholder="Enter numeric seed"
            />
            <button className="top-bar-btn" onClick={handleRandomSeed}>🎲 Random</button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            className="top-bar-btn"
            style={{ padding: '12px', fontSize: '12px', background: '#27ae60', borderColor: '#2ecc71' }}
            onClick={handleStart}
          >
            ▶ Play Singleplayer Sandbox
          </button>

          <button
            className="top-bar-btn"
            style={{ padding: '12px', fontSize: '12px', background: '#2980b9', borderColor: '#3498db' }}
            onClick={() => {
              onOpenAuth();
            }}
          >
            🌐 Join Multiplayer Server
          </button>

          {canInstallPWA && onInstallPWA && (
            <button
              className="top-bar-btn"
              style={{ padding: '10px', fontSize: '11px', background: '#8e44ad', borderColor: '#9b59b6' }}
              onClick={onInstallPWA}
            >
              📲 Install as App (PWA)
            </button>
          )}
        </div>

        {/* Keybindings guide summary */}
        <div style={{ fontSize: '9px', color: '#8d95ab', marginTop: '8px', lineHeight: '1.5' }}>
          [WASD/Arrows] Move & Jump • [Left Click] Mine/Attack • [Right Click] Place/Eat • [E] Inventory • [C] Chat
        </div>
      </div>
    </div>
  );
};
