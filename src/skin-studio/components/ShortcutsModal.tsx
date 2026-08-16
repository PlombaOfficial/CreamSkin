import React from 'react';

interface ShortcutsModalProps {
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ onClose }) => {
  const shortcuts = [
    { key: 'P', label: 'Pencil Tool', desc: 'Single-pixel drawing' },
    { key: 'B', label: 'Brush Tool', desc: 'Multi-pixel brush painting' },
    { key: 'E', label: 'Eraser Tool', desc: 'Erase pixels to transparency' },
    { key: 'G', label: 'Flood Fill', desc: 'Fill connected color areas' },
    { key: 'I', label: 'Eyedropper', desc: 'Sample color directly from canvas' },
    { key: 'L', label: 'Line Tool', desc: 'Draw straight lines' },
    { key: 'U', label: 'Rectangle', desc: 'Draw rectangle shapes' },
    { key: 'C', label: 'Circle', desc: 'Draw circle shapes' },
    { key: 'N', label: 'Texture Noise', desc: 'Add subtle pixel dithering' },
    { key: 'M', label: 'Mirror X', desc: 'Toggle horizontal symmetry' },
    { key: 'Ctrl + Z', label: 'Undo', desc: 'Revert last action' },
    { key: 'Ctrl + Shift + Z / Ctrl + Y', label: 'Redo', desc: 'Restore reverted action' },
    { key: 'Ctrl + S', label: 'Save / Download', desc: 'Download 64x64 skin PNG' },
    { key: 'Space + Drag / Middle Click', label: 'Pan Canvas', desc: 'Move canvas around viewport' },
    { key: '+ / - / Mouse Wheel', label: 'Zoom In / Out', desc: 'Scale canvas 50% to 800%' },
    { key: '0', label: 'Reset Zoom', desc: 'Reset scale to default 100%' },
    { key: '?', label: 'Shortcuts Guide', desc: 'Open this keyboard shortcuts window' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px', width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>⌨️ Keyboard Shortcuts</h2>
          <button className="tool-btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#111622',
                padding: '7px 12px',
                borderRadius: '6px',
                border: '1px solid var(--cs-border-subtle)',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9' }}>{sc.label}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{sc.desc}</div>
              </div>
              <kbd
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#38bdf8',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
