import React, { useState } from 'react';
import { Eye, FileText, ChevronRight, ShieldAlert } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import './SectionDiscovery.css';

export const SectionDiscovery: React.FC = () => {
  const [expandedReport, setExpandedReport] = useState(false);

  const toggleReport = () => {
    soundEngine.playTelemetryClick();
    setExpandedReport(!expandedReport);
  };

  return (
    <section id="discovery" className="abyss-discovery-section">
      <div className="section-container">
        {/* Editorial Header */}
        <div className="discovery-header-wrap">
          <div className="section-number">01 — THE DISCOVERY</div>
          <h2 className="discovery-headline">
            WE FOUND SOMETHING THAT WASN'T SUPPOSED TO EXIST.
          </h2>
          <p className="discovery-deck">
            On April 14, 2049, an ultra-deep bathymetric multi-beam sonar sweep over the Mid-Atlantic Abyssal
            Plain registered a geometric anomaly measuring over 18 square kilometers. At four thousand eight hundred
            and twenty meters beneath the surface, natural geology had ceased.
          </p>
        </div>

        {/* Asymmetrical Editorial Grid */}
        <div className="discovery-grid">
          {/* Main Visual Column */}
          <div className="discovery-visual-card">
            <div className="discovery-image-frame">
              <img
                src="/images/discovery-submersible.jpg"
                alt="Research submarine exploring colossal submerged archway at 4820m depth"
                className="discovery-img"
              />
              <div className="img-corner-bracket top-left" />
              <div className="img-corner-bracket top-right" />
              <div className="img-corner-bracket bottom-left" />
              <div className="img-corner-bracket bottom-right" />

              <div className="image-caption-bar">
                <div className="caption-tag">
                  <Eye size={12} />
                  <span>RECORDING // DSV ODYSSEY DIVE 01</span>
                </div>
                <span className="caption-time">DEPTH: 4,820 M // TIME: 03:44 UTC</span>
              </div>
            </div>

            <div className="discovery-image-subtext">
              <span className="subtext-marker">FIG. 1.04</span>
              <p>
                First visual contact with the Western Gateway Colonnade. The cyclopean archway stands 34 meters
                tall, exhibiting precision dry-stone joinery impervious to benthic sediment abrasion.
              </p>
            </div>
          </div>

          {/* Metadata & Narrative Column */}
          <div className="discovery-info-column">
            {/* 4 Metadata Chips */}
            <div className="discovery-meta-grid">
              <div className="meta-card">
                <span className="meta-card-label">DISCOVERED</span>
                <span className="meta-card-value">2049</span>
                <span className="meta-card-sub">APRIL 14 // 02:18 UTC</span>
              </div>

              <div className="meta-card">
                <span className="meta-card-label">DEPTH</span>
                <span className="meta-card-value">4,820 M</span>
                <span className="meta-card-sub">483.4 ATMOSPHERES</span>
              </div>

              <div className="meta-card">
                <span className="meta-card-label">LOCATION</span>
                <span className="meta-card-value">UNKNOWN</span>
                <span className="meta-card-sub">MID-ATLANTIC TRENCH</span>
              </div>

              <div className="meta-card highlight">
                <span className="meta-card-label">STATUS</span>
                <span className="meta-card-value">INVESTIGATION</span>
                <span className="meta-card-sub">EXPEDITION 07 ACTIVE</span>
              </div>
            </div>

            {/* Narrative Editorial Card */}
            <div className="discovery-narrative-card">
              <div className="narrative-card-header">
                <div className="card-stamp">
                  <ShieldAlert size={14} className="stamp-icon" />
                  <span>CLASSIFIED SCIENTIFIC MEMO</span>
                </div>
                <span className="card-dossier-id">REF: ABYSS-2049-DOC-01</span>
              </div>

              <h3 className="narrative-title">The First Acoustic Refraction</h3>
              <p className="narrative-body">
                Initial hydrophone ping analysis revealed that the submerged structures were not formed by volcanic
                cooling or tectonic fracturing. The avenues, plazas, and towering monolithic columns form a precise
                geometric grid oriented directly toward the North Magnetic Pole of 12,000 BCE.
              </p>

              {expandedReport && (
                <div className="narrative-expanded-content">
                  <p>
                    Spectral analysis of recovered stone core samples revealed an impossible alloy: metamorphic basalt
                    impregnated with a non-degrading metallic silicate matrix. The city's monumental architecture has
                    withstood crushing hydrostatic pressures exceeding 7,000 PSI without structural collapse.
                  </p>
                  <p>
                    More disconcerting is the continuous 14.2 Hz acoustic resonance echoing from the central temple
                    foundations—a low-frequency infrasonic carrier wave that matches no known volcanic or biological
                    phenomenon.
                  </p>
                </div>
              )}

              <button className="btn-ghost narrative-expand-btn" onClick={toggleReport}>
                <FileText size={14} />
                <span>{expandedReport ? 'COLLAPSE BRIEFING' : 'READ FULL DISCOVERY DOSSIER'}</span>
                <ChevronRight size={14} className={`chevron ${expandedReport ? 'rotated' : ''}`} />
              </button>
            </div>

            {/* Telemetry Footer Callout */}
            <div className="discovery-callout-footer">
              <div className="callout-col">
                <span className="callout-key">SECTOR INTEGRITY:</span>
                <span className="callout-val">94.2% INTACT</span>
              </div>
              <div className="callout-col">
                <span className="callout-key">SURVEY COVERAGE:</span>
                <span className="callout-val">12% MAPPED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
