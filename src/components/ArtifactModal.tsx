import React, { useEffect } from 'react';
import { ArchiveArtifact } from '../data/abyssData';
import { X, FileSpreadsheet, Eye } from 'lucide-react';
import './ArtifactModal.css';

interface ArtifactModalProps {
  artifact: ArchiveArtifact | null;
  onClose: () => void;
}

export const ArtifactModal: React.FC<ArtifactModalProps> = ({ artifact, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (artifact) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [artifact, onClose]);

  if (!artifact) return null;

  return (
    <div className="artifact-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="artifact-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="art-modal-header">
          <div className="art-modal-title-group">
            <span className="art-modal-code">{artifact.code}</span>
            <span className="art-modal-name">{artifact.name}</span>
          </div>
          <button className="art-modal-close-btn" onClick={onClose} aria-label="Close artifact inspection">
            <X size={18} />
          </button>
        </div>

        {/* Modal Main Grid */}
        <div className="art-modal-grid">
          {/* Visual Column */}
          <div className="art-modal-visual-col">
            <div className="art-modal-img-frame">
              <img src={artifact.image} alt={artifact.name} className="art-modal-img" />
              <div className="art-modal-tag-pill">
                <Eye size={12} />
                <span>FORENSIC MACRO SCAN</span>
              </div>
            </div>
            <div className="art-dimensions-badge">
              <span className="dim-label">SPECIMEN DIMENSIONS:</span>
              <span className="dim-val">{artifact.dimensions}</span>
            </div>
          </div>

          {/* Details Column */}
          <div className="art-modal-info-col">
            <div className="art-meta-pills-row">
              <div className="art-pill">
                <span className="art-pill-k">DEPTH:</span>
                <span className="art-pill-v">{artifact.depth}</span>
              </div>
              <div className="art-pill">
                <span className="art-pill-k">DISCOVERED:</span>
                <span className="art-pill-v">{artifact.discovered}</span>
              </div>
              <div className="art-pill status">
                <span className="art-pill-k">STATUS:</span>
                <span className="art-pill-v highlight">{artifact.status}</span>
              </div>
            </div>

            <div className="art-info-block">
              <h4 className="art-block-heading">CLASSIFIED DESCRIPTION</h4>
              <p className="art-block-text">{artifact.description}</p>
            </div>

            <div className="art-info-block">
              <h4 className="art-block-heading">CURATOR / FORENSIC LAB LOG</h4>
              <p className="art-block-text log">{artifact.curatorLog}</p>
            </div>

            <div className="art-spectroscopy-card">
              <div className="spec-card-header">
                <FileSpreadsheet size={13} className="spec-icon" />
                <span>SPECTROSCOPIC & ELEMENTAL ANALYSIS</span>
              </div>
              <div className="spec-data-rows">
                <div className="spec-row">
                  <span className="spec-k">DENSITY:</span>
                  <span className="spec-v">{artifact.spectroscopy.density}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-k">GAMMA EMISSION:</span>
                  <span className="spec-v">{artifact.spectroscopy.radiation}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-k">MATRIX COMPOSITION:</span>
                  <span className="spec-v">{artifact.spectroscopy.composition}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-k">ACOUSTIC SIGNATURE:</span>
                  <span className="spec-v">{artifact.acousticSignature}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
