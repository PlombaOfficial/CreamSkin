import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import './DepthGauge.css';

export const DepthGauge: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentDepth, setCurrentDepth] = useState(0);
  const [pressureAtm, setPressureAtm] = useState(1);
  const [waterTemp, setWaterTemp] = useState(24.2);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;
      
      setScrollProgress(progress);
      
      // Calculate realistic bathymetric depth (0m to 4,913m)
      const depth = Math.round(progress * 4913);
      setCurrentDepth(depth);

      // Pressure in ATM: 1 ATM at surface + ~1 ATM per 10m
      const atm = (1 + depth / 10).toFixed(1);
      setPressureAtm(Number(atm));

      // Temperature drops from 24.2°C down to 2.1°C non-linearly
      const temp = (24.2 - (progress * 22.1)).toFixed(1);
      setWaterTemp(Number(temp));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const depthMarkers = [
    { label: '0M', depth: 0, title: 'SURFACE' },
    { label: '500M', depth: 500, title: 'TWILIGHT' },
    { label: '1.2KM', depth: 1200, title: 'MIDNIGHT' },
    { label: '2.8KM', depth: 2800, title: 'ABYSSAL' },
    { label: '4.8KM', depth: 4820, title: 'THE CITY' }
  ];

  return (
    <aside className="abyss-depth-gauge" aria-label="Bathymetric Depth Gauge">
      <div className="gauge-frame">
        {/* Top Header */}
        <div className="gauge-header">
          <span className="gauge-axis-label">DEPTH SOUNDING</span>
          <div className="gauge-current-val">
            <span className="depth-num">{currentDepth.toLocaleString()}</span>
            <span className="depth-unit">M</span>
          </div>
        </div>

        {/* Vertical Scale Track */}
        <div className="gauge-track-wrap">
          <div className="gauge-track-line">
            <div
              className="gauge-track-fill"
              style={{ height: `${scrollProgress * 100}%` }}
            />
            <div
              className="gauge-track-cursor"
              style={{ top: `${scrollProgress * 100}%` }}
            >
              <div className="cursor-indicator-diamond" />
            </div>
          </div>

          <div className="gauge-markers">
            {depthMarkers.map((marker) => {
              const markerPos = (marker.depth / 4913) * 100;
              const isPassed = currentDepth >= marker.depth;
              return (
                <div
                  key={marker.label}
                  className={`depth-marker-node ${isPassed ? 'passed' : ''}`}
                  style={{ top: `${markerPos}%` }}
                  title={`${marker.title} (${marker.label})`}
                >
                  <span className="marker-tick" />
                  <span className="marker-label">{marker.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Telemetry Footer */}
        <div className="gauge-telemetry">
          <div className="telemetry-mini-row">
            <span className="t-label">PRESS:</span>
            <span className="t-val">{pressureAtm} ATM</span>
          </div>
          <div className="telemetry-mini-row">
            <span className="t-label">TEMP:</span>
            <span className="t-val">{waterTemp}°C</span>
          </div>
          {currentDepth > 4000 && (
            <div className="gauge-alert-pill">
              <ShieldAlert size={10} />
              <span>BENTHIC ZONE</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
