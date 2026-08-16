import React, { useState } from 'react';
import { GameEngine } from '../GameEngine';
import { audioSynthesizer } from '../audio/AudioSynthesizer';
import { saveManager } from '../world/SaveManager';

interface PauseMenuProps {
  engine: GameEngine;
  onResume: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ engine, onResume }) => {
  const [sfxVol, setSfxVol] = useState(audioSynthesizer.sfxVolume * 100);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = async () => {
    setSaveStatus('Saving world to storage...');
    const ok = await saveManager.saveGame('world_primary', engine.world, engine.player);
    setSaveStatus(ok ? 'World saved successfully! ✅' : 'Save failed ❌');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="modal-backdrop" onClick={onResume}>
      <div className="pixel-window" style={{ width: '420px' }} onClick={(e) => e.stopPropagation()}>
        <div className="window-header">
          <span>⏸️ Game Menu</span>
          <button className="close-btn" onClick={onResume}>✖</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="top-bar-btn" style={{ padding: '10px' }} onClick={onResume}>
            ▶ Back to Game
          </button>

          <button className="top-bar-btn" style={{ padding: '10px', background: '#2980b9' }} onClick={handleSave}>
            💾 Save World Progress
          </button>

          {saveStatus && (
            <div style={{ fontSize: '10px', color: '#55ff55', textAlign: 'center' }}>
              {saveStatus}
            </div>
          )}

          {/* Volume Settings */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: '#ffcc00', marginBottom: '8px' }}>Audio Volume</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px' }}>
              <span>SFX:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={sfxVol}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSfxVol(val);
                  audioSynthesizer.setSfxVolume(val / 100);
                }}
              />
              <span>{Math.round(sfxVol)}%</span>
            </div>
          </div>

          {/* Keybindings Reference */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px', fontSize: '9px', lineHeight: '1.6' }}>
            <div style={{ color: '#ffcc00', marginBottom: '4px' }}>Controls:</div>
            <div>[A / D] or [◀ / ▶]: Move Left / Right</div>
            <div>[W] or [Space]: Jump / Swim Up</div>
            <div>[Shift]: Sprint</div>
            <div>[Left Click]: Mine Block / Attack Mob</div>
            <div>[Right Click]: Place Block / Open Container / Eat</div>
            <div>[1 - 9] or [Scroll]: Select Hotbar Slot</div>
            <div>[E]: Open Inventory & Crafting</div>
            <div>[C]: Open Global Chat</div>
            <div>[ESC]: Pause Menu</div>
          </div>

          <div style={{ fontSize: '9px', color: '#6d758f', textAlign: 'center' }}>
            Seed: {engine.world.seed}
          </div>
        </div>
      </div>
    </div>
  );
};
