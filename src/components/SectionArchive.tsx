import React, { useState } from 'react';
import { ARCHIVE_ARTIFACTS, ArchiveArtifact } from '../data/abyssData';
import { ArtifactModal } from './ArtifactModal';
import { Database, Search, ArrowUpRight } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import './SectionArchive.css';

export const SectionArchive: React.FC = () => {
  const [selectedArtifact, setSelectedArtifact] = useState<ArchiveArtifact | null>(null);

  const handleOpenArtifact = (art: ArchiveArtifact) => {
    soundEngine.playSonarPing(650);
    setSelectedArtifact(art);
  };

  return (
    <section id="archive" className="abyss-archive-section">
      <div className="section-container">
        {/* Section Header */}
        <div className="archive-header-wrap">
          <div className="section-number">04 — ARCHIVE</div>
          <h2 className="section-title">CLASSIFIED SPECIMEN VAULT</h2>
          <p className="section-subtitle">
            Cataloged artifacts recovered from depth horizons between 4,700m and 4,910m.
          </p>
          <p className="archive-lead-desc">
            All recovered physical objects are maintained in pressurized, temperature-stabilized nitrogen
            cleanroom chambers aboard R/V Oceanus Explorer. Optical spectroscopy and ultrasonic resonance
            tests remain classified under Level 4 scientific clearance.
          </p>
        </div>

        {/* Asymmetrical Non-Standard Artifact Layout */}
        <div className="archive-asymmetric-layout">
          {/* Top Featured Hero Object: Object 001 */}
          <div
            className="archive-featured-card interactive-card"
            onClick={() => handleOpenArtifact(ARCHIVE_ARTIFACTS[0])}
          >
            <div className="featured-img-wrap">
              <img
                src={ARCHIVE_ARTIFACTS[0].image}
                alt={ARCHIVE_ARTIFACTS[0].name}
                className="featured-specimen-img"
              />
              <div className="specimen-badge-pill">
                <Database size={11} />
                <span>ARCHIVAL REGISTRY // {ARCHIVE_ARTIFACTS[0].code}</span>
              </div>
            </div>

            <div className="featured-content-wrap">
              <div className="featured-top-meta">
                <span className="featured-code">{ARCHIVE_ARTIFACTS[0].code}</span>
                <span className="featured-status">{ARCHIVE_ARTIFACTS[0].status}</span>
              </div>

              <h3 className="featured-name">{ARCHIVE_ARTIFACTS[0].name}</h3>
              <p className="featured-category">{ARCHIVE_ARTIFACTS[0].category}</p>

              <p className="featured-desc">{ARCHIVE_ARTIFACTS[0].description}</p>

              <div className="featured-data-strip">
                <div className="f-data-box">
                  <span className="f-label">DEPTH</span>
                  <span className="f-val">{ARCHIVE_ARTIFACTS[0].depth}</span>
                </div>
                <div className="f-data-box">
                  <span className="f-label">DISCOVERED</span>
                  <span className="f-val">{ARCHIVE_ARTIFACTS[0].discovered}</span>
                </div>
                <div className="f-data-box">
                  <span className="f-label">DENSITY</span>
                  <span className="f-val">{ARCHIVE_ARTIFACTS[0].spectroscopy.density}</span>
                </div>
              </div>

              <button className="btn-editorial inspect-btn">
                <span>INSPECT SPECIMEN DOSSIER</span>
                <ArrowUpRight size={15} />
              </button>
            </div>
          </div>

          {/* Staggered Row for Objects 002, 003, 004 */}
          <div className="archive-staggered-grid">
            {ARCHIVE_ARTIFACTS.slice(1).map((art, idx) => (
              <div
                key={art.id}
                className={`archive-card-staggered interactive-card card-${idx + 2}`}
                onClick={() => handleOpenArtifact(art)}
              >
                <div className="staggered-card-img-wrap">
                  <img src={art.image} alt={art.name} className="staggered-card-img" />
                  <div className="card-depth-watermark">{art.depth}</div>
                  <div className="card-hover-inspect">
                    <Search size={14} />
                    <span>EXAMINE</span>
                  </div>
                </div>

                <div className="staggered-card-info">
                  <div className="staggered-card-header">
                    <span className="staggered-code">{art.code}</span>
                    <span className="staggered-status-tag">{art.status}</span>
                  </div>

                  <h3 className="staggered-name">{art.name}</h3>
                  <span className="staggered-cat">{art.category}</span>

                  <div className="staggered-meta-row">
                    <div className="s-meta-item">
                      <span className="sm-k">DEPTH:</span>
                      <span className="sm-v">{art.depth}</span>
                    </div>
                    <div className="s-meta-item">
                      <span className="sm-k">AGE:</span>
                      <span className="sm-v">{art.age}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Artifact Detailed Modal */}
      <ArtifactModal artifact={selectedArtifact} onClose={() => setSelectedArtifact(null)} />
    </section>
  );
};
