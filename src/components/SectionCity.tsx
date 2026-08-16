import React, { useState } from 'react';
import { CITY_SECTORS, CitySector } from '../data/abyssData';
import { SectorModal } from './SectorModal';
import { Radio, Crosshair, ChevronRight } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import './SectionCity.css';

export const SectionCity: React.FC = () => {
  const [selectedSector, setSelectedSector] = useState<CitySector | null>(null);
  const [hoveredSector, setHoveredSector] = useState<CitySector | null>(null);

  const handleSelectSector = (sec: CitySector) => {
    soundEngine.playSonarPing();
    setSelectedSector(sec);
  };

  const handleHoverSector = (sec: CitySector | null) => {
    if (sec) soundEngine.playTelemetryClick();
    setHoveredSector(sec);
  };

  return (
    <section id="city" className="abyss-city-section">
      <div className="section-container">
        {/* Section Header */}
        <div className="city-header-wrap">
          <div className="section-number">03 — THE CITY</div>
          <h2 className="section-title">THE CITY</h2>
          <p className="section-subtitle">
            A civilization hidden beneath four kilometers of water.
          </p>
          <p className="city-lead-desc">
            Acoustic bathymetry maps reveal an intricate megalithic metropolis spanning over eighteen square
            kilometers across the abyssal plain. Six primary operational sectors have been established by Expedition 07.
          </p>
        </div>

        {/* Master Interactive Map Container */}
        <div className="city-map-layout">
          {/* Left / Main: The Sonar Bathymetric Canvas Map */}
          <div className="sonar-map-viewport">
            <div className="sonar-map-stage">
              <img
                src="/images/bathy-sonar-map.jpg"
                alt="High resolution scientific bathymetric 3D sonar topography scan map of the ancient sunken city"
                className="sonar-map-base-img"
              />

              {/* Sonar sweep & contour grid overlay */}
              <div className="sonar-grid-overlay" />
              <div className="sonar-radar-radial-sweep" />

              {/* Interactive Sonar Nodes */}
              {CITY_SECTORS.map((sector) => {
                const isHovered = hoveredSector?.id === sector.id;
                return (
                  <button
                    key={sector.id}
                    className={`sonar-map-pin ${sector.status.toLowerCase()} ${isHovered ? 'hovered' : ''}`}
                    style={{ left: `${sector.x}%`, top: `${sector.y}%` }}
                    onClick={() => handleSelectSector(sector)}
                    onMouseEnter={() => handleHoverSector(sector)}
                    onMouseLeave={() => handleHoverSector(null)}
                    aria-label={`Inspect Sector ${sector.code} - ${sector.name}`}
                  >
                    <div className="sonar-pin-sonar-ring" />
                    <div className="sonar-pin-sonar-ring-2" />
                    <div className="sonar-pin-core">
                      <span className="pin-code">{sector.code}</span>
                    </div>

                    {/* Hover Floating Tooltip */}
                    <div className="sonar-pin-tooltip">
                      <span className="tooltip-sector-tag">SECTOR {sector.code}</span>
                      <span className="tooltip-sector-name">{sector.name}</span>
                      <span className="tooltip-sector-depth">{sector.depth}</span>
                    </div>
                  </button>
                );
              })}

              {/* Map Corner Metadata */}
              <div className="map-hud-top-left">
                <span className="hud-label">SONAR RESOLUTION: 0.05M</span>
                <span className="hud-label">FREQUENCY: 455 KHZ MULTIBEAM</span>
              </div>
              <div className="map-hud-bottom-right">
                <Crosshair size={14} className="hud-crosshair" />
                <span className="hud-label">ACOUSTIC DATUM: WGS84-BATHY</span>
              </div>
            </div>
          </div>

          {/* Right: Sector Directory Cards */}
          <div className="city-sectors-sidebar">
            <div className="sidebar-title-row">
              <span className="sidebar-title">OPERATIONAL SECTORS</span>
              <span className="sidebar-count">06 ZONES</span>
            </div>

            <div className="sectors-list">
              {CITY_SECTORS.map((sector) => {
                const isHovered = hoveredSector?.id === sector.id;
                return (
                  <div
                    key={sector.id}
                    className={`sector-sidebar-card interactive-card ${isHovered ? 'active' : ''}`}
                    onClick={() => handleSelectSector(sector)}
                    onMouseEnter={() => handleHoverSector(sector)}
                    onMouseLeave={() => handleHoverSector(null)}
                  >
                    <div className="sector-card-top">
                      <div className="sector-code-badge">
                        <span>{sector.code}</span>
                      </div>
                      <div className="sector-card-titles">
                        <h3 className="sector-name">{sector.name}</h3>
                        <span className="sector-depth-tag">DEPTH: {sector.depth}</span>
                      </div>
                      <ChevronRight size={14} className="sector-arrow" />
                    </div>

                    <div className="sector-card-telemetry">
                      <div className="sec-telemetry-item">
                        <span className="st-key">SIGNAL:</span>
                        <span className="st-val">{sector.lastSignal}</span>
                      </div>
                      <div className={`sec-status-chip ${sector.status.toLowerCase()}`}>
                        <span>{sector.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="sidebar-footnote">
              <Radio size={12} className="live-pulse-icon" />
              <span>CLICK ANY SECTOR TO RETRIEVE CLASSIFIED DOSSIER</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Modal Dossier */}
      <SectorModal sector={selectedSector} onClose={() => setSelectedSector(null)} />
    </section>
  );
};
