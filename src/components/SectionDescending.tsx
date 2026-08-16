import React, { useState } from 'react';
import { DESCENT_ZONES, DepthZone } from '../data/abyssData';
import { Gauge, Thermometer, Sun, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import './SectionDescending.css';

export const SectionDescending: React.FC = () => {
  const [activeZoneIndex, setActiveZoneIndex] = useState(4); // Default to The Sunken City (4,820m)
  const currentZone: DepthZone = DESCENT_ZONES[activeZoneIndex];

  const handleZoneSelect = (index: number) => {
    soundEngine.playDepthDescent();
    setActiveZoneIndex(index);
  };

  return (
    <section id="descending" className="abyss-descending-section">
      <div className="descending-ambient-gradient" style={{
        background: `radial-gradient(ellipse at 50% ${activeZoneIndex * 25}%, rgba(14, 32, 54, ${0.4 - activeZoneIndex * 0.08}), #020407 85%)`
      }} />

      <div className="section-container">
        {/* Section Title */}
        <div className="descending-header-wrap">
          <div className="section-number">02 — DESCENDING</div>
          <h2 className="section-title">THE BATHYMETRIC DESCENT</h2>
          <p className="section-subtitle">
            The ocean is not merely water—it is five distinct planetary layers of increasing darkness,
            crushing mass, and total silence.
          </p>
        </div>

        {/* Interactive Descent Explorer */}
        <div className="descent-interactive-panel">
          {/* Left: Depth Track / Level Selector */}
          <div className="descent-depth-nav">
            <div className="depth-nav-line" />
            {DESCENT_ZONES.map((zone, idx) => {
              const isSelected = idx === activeZoneIndex;
              return (
                <button
                  key={zone.depth}
                  className={`descent-zone-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleZoneSelect(idx)}
                >
                  <div className="zone-btn-indicator">
                    <span className="zone-dot" />
                  </div>
                  <div className="zone-btn-info">
                    <span className="zone-btn-depth">{zone.label}</span>
                    <span className="zone-btn-name">{zone.zoneName.split('/')[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Focused Depth Dossier Card */}
          <div className="descent-dossier-card">
            <div className="dossier-top-meta">
              <span className="dossier-layer-tag">
                ZONE 0{activeZoneIndex + 1} // {currentZone.zoneName}
              </span>
              <span className="dossier-depth-huge">{currentZone.depth.toLocaleString()} M</span>
            </div>

            <p className="dossier-description">{currentZone.description}</p>

            {/* Live Environmental Gauges Grid */}
            <div className="dossier-gauges-grid">
              <div className="gauge-metric-card">
                <div className="gauge-metric-icon">
                  <Gauge size={16} />
                </div>
                <div className="gauge-metric-text">
                  <span className="gauge-metric-label">HYDROSTATIC PRESSURE</span>
                  <span className="gauge-metric-val">{currentZone.pressure}</span>
                  <span className="gauge-metric-sub">{(currentZone.depth * 1.42).toFixed(0)} PSI</span>
                </div>
              </div>

              <div className="gauge-metric-card">
                <div className="gauge-metric-icon">
                  <Thermometer size={16} />
                </div>
                <div className="gauge-metric-text">
                  <span className="gauge-metric-label">WATER TEMPERATURE</span>
                  <span className="gauge-metric-val">{currentZone.temp}</span>
                  <span className="gauge-metric-sub">Near Freezing Benthic Point</span>
                </div>
              </div>

              <div className="gauge-metric-card">
                <div className="gauge-metric-icon">
                  <Sun size={16} />
                </div>
                <div className="gauge-metric-text">
                  <span className="gauge-metric-label">SOLAR PENETRATION</span>
                  <span className="gauge-metric-val">{currentZone.lightLevel}</span>
                  <span className="gauge-metric-sub">Optical Absorption Ratio</span>
                </div>
              </div>

              <div className="gauge-metric-card highlight">
                <div className="gauge-metric-icon">
                  <Sparkles size={16} />
                </div>
                <div className="gauge-metric-text">
                  <span className="gauge-metric-label">OBSERVED BIOLOGY</span>
                  <span className="gauge-metric-val-sm">{currentZone.fauna}</span>
                </div>
              </div>
            </div>

            {/* Depth Level Indicator Progress */}
            <div className="dossier-depth-slider-wrap">
              <div className="slider-label-row">
                <span>SURFACE (0M)</span>
                <span className="slider-current-tag">CURRENT: {currentZone.depth}M</span>
                <span>BENTHIC PLAIN (4,820M)</span>
              </div>
              <div className="slider-bar-track">
                <div
                  className="slider-bar-fill"
                  style={{ width: `${(currentZone.depth / 4820) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
