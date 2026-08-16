import React, { useState } from 'react';

export const ServerIntegrationGuide: React.FC = () => {
  const [testSkinId, setTestSkinId] = useState('classic_steve');
  const [copied, setCopied] = useState(false);

  const handleCopyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="gallery-container" style={{ maxWidth: '900px' }}>
      <div className="gallery-hero" style={{ textAlign: 'left' }}>
        <h1 className="gallery-hero-title">MINECRAFT SERVER INTEGRATION</h1>
        <p style={{ color: '#94a3b8', fontSize: '15px' }}>
          Connect your Minecraft Java Edition server (Spigot, Paper, Purpur 1.16 - 1.20+) to allow players to equip Skin Studio skins in-game.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Step 1: Architecture Diagram */}
        <div className="section-box">
          <div className="section-header">1. How It Works</div>
          <div style={{
            background: '#0a0d14',
            padding: '16px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#38bdf8',
            lineHeight: '1.8',
          }}>
            [Skin Studio Web] ➔ [REST API JSON / Texture Payload] ➔ [SkinStudioPlugin.jar] ➔ [Minecraft Java Server]
          </div>
        </div>

        {/* Step 2: Commands */}
        <div className="section-box">
          <div className="section-header">2. In-Game Commands</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0d14', padding: '10px 14px', borderRadius: '8px' }}>
              <div>
                <code style={{ color: '#f59e0b', fontSize: '14px' }}>/skin &lt;id&gt;</code>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Apply skin from Skin Studio to your player</div>
              </div>
              <button className="tool-btn-sm" onClick={() => handleCopyCmd('/skin classic_steve')}>
                Copy
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0d14', padding: '10px 14px', borderRadius: '8px' }}>
              <div>
                <code style={{ color: '#f59e0b', fontSize: '14px' }}>/skin set &lt;id&gt;</code>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Permanently save and set player skin</div>
              </div>
              <button className="tool-btn-sm" onClick={() => handleCopyCmd('/skin set classic_steve')}>
                Copy
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0d14', padding: '10px 14px', borderRadius: '8px' }}>
              <div>
                <code style={{ color: '#f59e0b', fontSize: '14px' }}>/skin reset</code>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Reset player skin back to default original</div>
              </div>
              <button className="tool-btn-sm" onClick={() => handleCopyCmd('/skin reset')}>
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Step 3: Interactive Command Tester */}
        <div className="section-box">
          <div className="section-header">3. Test Command Generator</div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              className="color-hex-input"
              style={{ flex: 1 }}
              placeholder="Enter Skin ID (e.g. cyber_ninja, classic_steve)"
              value={testSkinId}
              onChange={(e) => setTestSkinId(e.target.value)}
            />
            <button
              className="tool-btn-sm"
              style={{ background: '#10b981', color: '#fff', padding: '10px 18px' }}
              onClick={() => handleCopyCmd(`/skin set ${testSkinId}`)}
            >
              {copied ? '✓ Copied!' : '📋 Copy Command'}
            </button>
          </div>
        </div>

        {/* Step 4: Plugin Installation */}
        <div className="section-box">
          <div className="section-header">4. Server Plugin Installation</div>
          <ol style={{ paddingLeft: '20px', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.8' }}>
            <li>Place <strong>SkinStudioPlugin.jar</strong> into your server's <code>/plugins/</code> directory.</li>
            <li>Restart or reload your Spigot / Paper server.</li>
            <li>Players can immediately type <code>/skin &lt;id&gt;</code> using any skin ID from the gallery!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
