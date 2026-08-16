import React, { useState } from 'react';
import { ColorRGBA } from '../types';
import { PRESET_PALETTES } from './ColorPalettes';

interface ColorPickerProps {
  color: ColorRGBA;
  onChange: (color: ColorRGBA) => void;
}

export function rgbaToHex(c: ColorRGBA): string {
  const r = c.r.toString(16).padStart(2, '0');
  const g = c.g.toString(16).padStart(2, '0');
  const b = c.b.toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

export function hexToRgba(hex: string, alpha: number = 255): ColorRGBA {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
    a: alpha,
  };
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const [activePaletteIdx, setActivePaletteIdx] = useState(0);
  const [customSwatches, setCustomSwatches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('skin_custom_swatches');
      return saved ? JSON.parse(saved) : ['#ffffff', '#000000', '#3498db', '#e74c3c', '#2ecc71', '#f1c40f'];
    } catch {
      return ['#ffffff', '#000000', '#3498db', '#e74c3c', '#2ecc71', '#f1c40f'];
    }
  });

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onChange(hexToRgba(val, color.a));
    }
  };

  const handleAddSwatch = () => {
    const hex = rgbaToHex(color);
    if (!customSwatches.includes(hex)) {
      const updated = [hex, ...customSwatches.slice(0, 15)];
      setCustomSwatches(updated);
      localStorage.setItem('skin_custom_swatches', JSON.stringify(updated));
    }
  };

  const hexValue = rgbaToHex(color);

  return (
    <div className="color-picker-box">
      {/* Color Preview & Native Picker */}
      <div className="color-preview-row">
        <label className="color-preview-swatch" style={{ background: hexValue }}>
          <input
            type="color"
            value={hexValue}
            onChange={(e) => onChange(hexToRgba(e.target.value, color.a))}
            className="color-hidden-input"
          />
        </label>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            className="color-hex-input"
            value={hexValue}
            onChange={handleHexChange}
            maxLength={7}
          />
        </div>
        <button className="tool-btn" title="Add to My Palette" onClick={handleAddSwatch}>
          ➕
        </button>
      </div>

      {/* RGB Sliders */}
      <div className="slider-group">
        <div className="slider-row">
          <span style={{ color: '#ff5555' }}>R</span>
          <input
            type="range"
            min="0"
            max="255"
            value={color.r}
            onChange={(e) => onChange({ ...color, r: Number(e.target.value) })}
          />
          <span className="slider-val">{color.r}</span>
        </div>

        <div className="slider-row">
          <span style={{ color: '#55ff55' }}>G</span>
          <input
            type="range"
            min="0"
            max="255"
            value={color.g}
            onChange={(e) => onChange({ ...color, g: Number(e.target.value) })}
          />
          <span className="slider-val">{color.g}</span>
        </div>

        <div className="slider-row">
          <span style={{ color: '#55aaff' }}>B</span>
          <input
            type="range"
            min="0"
            max="255"
            value={color.b}
            onChange={(e) => onChange({ ...color, b: Number(e.target.value) })}
          />
          <span className="slider-val">{color.b}</span>
        </div>

        <div className="slider-row">
          <span style={{ color: '#ffcc00' }}>A</span>
          <input
            type="range"
            min="0"
            max="255"
            value={color.a}
            onChange={(e) => onChange({ ...color, a: Number(e.target.value) })}
          />
          <span className="slider-val">{Math.round((color.a / 255) * 100)}%</span>
        </div>
      </div>

      {/* Preset Palettes Tabs */}
      <div className="palette-section">
        <div className="palette-tabs">
          {PRESET_PALETTES.map((p, idx) => (
            <button
              key={p.name}
              className={`palette-tab-btn ${activePaletteIdx === idx ? 'active' : ''}`}
              onClick={() => setActivePaletteIdx(idx)}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="swatches-grid">
          {PRESET_PALETTES[activePaletteIdx].colors.map((c) => (
            <button
              key={c}
              className="swatch-btn"
              style={{ background: c }}
              onClick={() => onChange(hexToRgba(c, color.a))}
            />
          ))}
        </div>
      </div>

      {/* Custom Saved Swatches */}
      <div className="custom-swatches-section">
        <div style={{ fontSize: '11px', color: '#8d95ab', marginBottom: '4px' }}>Saved Swatches:</div>
        <div className="swatches-grid">
          {customSwatches.map((c, i) => (
            <button
              key={`custom_${i}`}
              className="swatch-btn"
              style={{ background: c }}
              onClick={() => onChange(hexToRgba(c, color.a))}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
