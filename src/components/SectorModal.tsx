import React, { useEffect } from 'react';
import { CitySector } from '../data/abyssData';
import { X, Activity, Radio, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import './SectorModal.css';

interface SectorModalProps {
  sector: CitySector | null;
  onClose: () => void;
}

export const SectorModal: React.FC<SectorModalProps> = ({ sector, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (sector) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [sector, onClose]);

  if (!sector) return null;

  return (
    <div className="sector-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="sector-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header-bar">
          <div className="modal-header-tag">
            <span className="modal-sector-code">SECTOR {sector.code}</span>
            <span className="modal-header-divider">/</span>
            <span className="modal-sector-name">{sector.name}</span>
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Close sector dossier">
            <X size={18} />
          </button>
        </div>

        {/* Status & Coordinates Strip */}
        <div className="modal-telemetry-strip">
          <div className="telemetry-pill">
            <MapPin size={12} />
            <span>{sector.coordinates}</span>
          </div>
          <div className="telemetry-pill">
            <Activity size={12} />
            <span>DEPTH: {sector.depth}</span>
          </div>
          <div className="telemetry-pill">
            <Radio size={12} />
            <span>SIGNAL: {sector.lastSignal}</span>
          </div>
          <div className={`status-pill ${sector.status.toLowerCase()}`}>
            {sector.status === 'UNEXPLORED' ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
            <span>STATUS: {sector.status}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body-scroll">
          <div className="modal-section-block">
            <h4 className="modal-block-title">ARCHITECTURAL OVERVIEW</h4>
            <p className="modal-block-body">{sector.description}</p>
          </div>

          <div className="modal-section-block">
            <h4 className="modal-block-title">GEOLOGICAL & BATHYMETRIC NOTES</h4>
            <p className="modal-block-body geological">{sector.geologicalNote}</p>
          </div>

          <div className="modal-section-block">
            <h4 className="modal-block-title">EXPEDITION FINDINGS & ANOMALIES</h4>
            <ul className="modal-findings-list">
              {sector.findings.map((item, i) => (
                <li key={i} className="finding-item">
                  <span className="finding-bullet">0{i + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="modal-footer-stats">
            <div className="f-stat">
              <span className="f-stat-key">ACOUSTIC FREQ:</span>
              <span className="f-stat-val">{sector.acousticFreq}</span>
            </div>
            <div className="f-stat">
              <span className="f-stat-key">SURVEY CLEARANCE:</span>
              <span className="f-stat-val">LEVEL 4 SCIENTIFIC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
