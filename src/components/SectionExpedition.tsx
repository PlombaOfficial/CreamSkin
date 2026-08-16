import React, { useState } from 'react';
import { EXPEDITION_VESSELS, EXPEDITION_CREW } from '../data/abyssData';
import { Anchor, Users, ShieldCheck, Activity, Cpu, Wrench } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import './SectionExpedition.css';

export const SectionExpedition: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vessels' | 'crew' | 'equipment'>('vessels');
  const [activeVesselIndex, setActiveVesselIndex] = useState(0);

  const handleTabChange = (tab: 'vessels' | 'crew' | 'equipment') => {
    soundEngine.playTelemetryClick();
    setActiveTab(tab);
  };

  const handleVesselChange = (idx: number) => {
    soundEngine.playTelemetryClick();
    setActiveVesselIndex(idx);
  };

  const currentVessel = EXPEDITION_VESSELS[activeVesselIndex];

  return (
    <section id="expedition" className="abyss-expedition-section">
      <div className="section-container">
        {/* Section Header */}
        <div className="expedition-header-wrap">
          <div className="section-number">05 — EXPEDITION</div>
          <h2 className="section-title">HUMANS & MACHINES IN THE DEEP</h2>
          <p className="section-subtitle">
            The engineering and scientific corps operating beneath six hundred atmospheres.
          </p>
        </div>

        {/* 4 Big Metrics Banner */}
        <div className="expedition-metrics-strip">
          <div className="exp-metric-box">
            <span className="exp-metric-label">DEEP SEA VEHICLE</span>
            <span className="exp-metric-val">A-07 TRITON</span>
            <span className="exp-metric-sub">CLASS-IV TITANIUM HULL</span>
          </div>

          <div className="exp-metric-box">
            <span className="exp-metric-label">DEPTH RATING</span>
            <span className="exp-metric-val">6,000 M</span>
            <span className="exp-metric-sub">580 ATM TESTED</span>
          </div>

          <div className="exp-metric-box">
            <span className="exp-metric-label">SCIENTIFIC CREW</span>
            <span className="exp-metric-val">14 RESEARCHERS</span>
            <span className="exp-metric-sub">6 DEEP SPECIALIZATIONS</span>
          </div>

          <div className="exp-metric-box highlight">
            <span className="exp-metric-label">MISSION DURATION</span>
            <span className="exp-metric-val">183 DAYS</span>
            <span className="exp-metric-sub">ON-STATION CONTINUOUS</span>
          </div>
        </div>

        {/* Navigation Switcher Tabs */}
        <div className="expedition-tabs-row">
          <button
            className={`exp-tab-btn ${activeTab === 'vessels' ? 'active' : ''}`}
            onClick={() => handleTabChange('vessels')}
          >
            <Anchor size={14} />
            <span>SUBMERSIBLES & COMMAND</span>
          </button>
          <button
            className={`exp-tab-btn ${activeTab === 'crew' ? 'active' : ''}`}
            onClick={() => handleTabChange('crew')}
          >
            <Users size={14} />
            <span>SCIENTIFIC PERSONNEL</span>
          </button>
          <button
            className={`exp-tab-btn ${activeTab === 'equipment' ? 'active' : ''}`}
            onClick={() => handleTabChange('equipment')}
          >
            <Cpu size={14} />
            <span>BENTHIC EQUIPMENT</span>
          </button>
        </div>

        {/* Tab 1: Vessels & Craft */}
        {activeTab === 'vessels' && (
          <div className="vessels-showcase-wrap">
            <div className="vessel-selector-buttons">
              {EXPEDITION_VESSELS.map((v, i) => (
                <button
                  key={v.id}
                  className={`v-select-btn ${activeVesselIndex === i ? 'active' : ''}`}
                  onClick={() => handleVesselChange(i)}
                >
                  <span>{v.title}</span>
                </button>
              ))}
            </div>

            <div className="vessel-dossier-grid">
              <div className="vessel-image-pane">
                <img src={currentVessel.image} alt={currentVessel.title} className="vessel-img" />
                <div className="vessel-img-tag">
                  <Activity size={12} />
                  <span>{currentVessel.classification}</span>
                </div>
              </div>

              <div className="vessel-info-pane">
                <div className="vessel-title-block">
                  <span className="vessel-type-kicker">{currentVessel.type}</span>
                  <h3 className="vessel-main-title">{currentVessel.title}</h3>
                </div>

                <p className="vessel-desc-text">{currentVessel.description}</p>

                <div className="vessel-specs-table">
                  <div className="specs-table-head">TECHNICAL SPECIFICATIONS</div>
                  <div className="specs-grid">
                    {currentVessel.specs.map((sp, idx) => (
                      <div key={idx} className="spec-item">
                        <span className="sp-lbl">{sp.label}:</span>
                        <span className="sp-val">{sp.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Crew Personnel */}
        {activeTab === 'crew' && (
          <div className="crew-showcase-grid">
            {EXPEDITION_CREW.map((member, idx) => (
              <div key={idx} className="crew-card">
                <div className="crew-card-header">
                  <span className="crew-dive-count">{member.dives} DIVES</span>
                  <ShieldCheck size={14} className="crew-shield" />
                </div>
                <h3 className="crew-name">{member.name}</h3>
                <span className="crew-role">{member.role}</span>
                <span className="crew-org">{member.organization}</span>
                <p className="crew-note">"{member.note}"</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Benthic Equipment */}
        {activeTab === 'equipment' && (
          <div className="equipment-grid">
            <div className="equip-card">
              <div className="equip-icon"><Cpu size={20} /></div>
              <h4 className="equip-title">NERID-4 AUTONOMOUS BENTHIC CRAWLER</h4>
              <p className="equip-desc">
                Heavy-duty titanium crawler that navigates the sea floor autonomously, mapping cyclopean
                foundations and drilling 2-meter core samples using diamond-matrix ultrasonic bits.
              </p>
              <div className="equip-meta">AUTONOMY: 120 HOURS // MAX DEPTH: 7,000M</div>
            </div>

            <div className="equip-card">
              <div className="equip-icon"><Activity size={20} /></div>
              <h4 className="equip-title">32-CHANNEL TOWED HYDROPHONE ARRAY</h4>
              <p className="equip-desc">
                Ultra-low frequency seismic listening line towed at 4,500m depth, capturing infrasonic
                vibrations, acoustic resonances, and structural reflections from the city core.
              </p>
              <div className="equip-meta">FREQUENCY BAND: 0.1 HZ – 48 KHZ</div>
            </div>

            <div className="equip-card">
              <div className="equip-icon"><Wrench size={20} /></div>
              <h4 className="equip-title">EXO-DEEP ATMOSPHERIC DIVING SUIT</h4>
              <p className="equip-desc">
                Hard-suit atmospheric system allowing specialized divers to operate at atmospheric pressure
                without decompression requirements for precision manipulation in Sector 01 chambers.
              </p>
              <div className="equip-meta">INTEGRITY: 600 ATM // DIVE TIME: 8 HOURS</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
