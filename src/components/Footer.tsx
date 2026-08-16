import React, { useState } from 'react';
import { Compass, Anchor, ArrowUp, Send, Check } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import './Footer.css';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    soundEngine.playTelemetryClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    soundEngine.playSonarPing();
    setSubscribed(true);
  };

  return (
    <footer className="abyss-footer">
      <div className="section-container">
        {/* Top Massive Brand Block */}
        <div className="footer-top-grid">
          <div className="footer-brand-col">
            <h2 className="footer-giant-logo">ABYSS</h2>
            <p className="footer-tagline">THE CITY BENEATH THE WORLD.</p>
            <p className="footer-mission-text">
              An international benthic archaeological research initiative cataloging the cyclopean
              structures of the Atlantic abyssal plain.
            </p>
          </div>

          {/* Quick Navigation Directory */}
          <div className="footer-links-col">
            <span className="footer-col-heading">MISSION DIRECTORY</span>
            <ul className="footer-links-list">
              <li>
                <button className="footer-nav-btn" onClick={() => onNavigate('discovery')}>
                  01 — THE DISCOVERY
                </button>
              </li>
              <li>
                <button className="footer-nav-btn" onClick={() => onNavigate('descending')}>
                  02 — BATHYMETRIC DESCENT
                </button>
              </li>
              <li>
                <button className="footer-nav-btn" onClick={() => onNavigate('city')}>
                  03 — THE CITY MAP
                </button>
              </li>
              <li>
                <button className="footer-nav-btn" onClick={() => onNavigate('archive')}>
                  04 — CLASSIFIED ARCHIVE
                </button>
              </li>
              <li>
                <button className="footer-nav-btn" onClick={() => onNavigate('expedition')}>
                  05 — EXPEDITION VESSELS & CREW
                </button>
              </li>
              <li>
                <button className="footer-nav-btn" onClick={() => onNavigate('the-unknown')}>
                  07 — THE UNKNOWN
                </button>
              </li>
            </ul>
          </div>

          {/* Classification & Dispatch Subscription */}
          <div className="footer-dispatch-col">
            <span className="footer-col-heading">EXPEDITION DISPATCHES</span>
            <p className="dispatch-text">
              Receive encrypted Level 4 research updates, specimen scans, and bathymetric sonar discoveries.
            </p>

            {subscribed ? (
              <div className="dispatch-success-box">
                <Check size={14} className="check-icon" />
                <span>FREQUENCY LINK ESTABLISHED. CLEARANCE GRANTED.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="dispatch-form">
                <input
                  type="email"
                  placeholder="Enter researcher email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="dispatch-input"
                  required
                />
                <button type="submit" className="dispatch-submit-btn" aria-label="Subscribe to dispatches">
                  <Send size={14} />
                </button>
              </form>
            )}

            <div className="footer-telemetry-badge">
              <div className="f-tele-row">
                <Compass size={12} className="f-tele-icon" />
                <span>37° 11′ 42″ N, 24° 53′ 18″ W</span>
              </div>
              <div className="f-tele-row">
                <Anchor size={12} className="f-tele-icon" />
                <span>DEPTH: 4,820 M // STATUS: ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Back to Top Bar */}
        <div className="footer-bottom-row">
          <div className="footer-legal">
            <span>© 2049 ABYSS RESEARCH INITIATIVE. ALL ARCHIVAL DATA CLASSIFIED LEVEL 4.</span>
            <span className="legal-sep">•</span>
            <span>RESTRICTED SCIENTIFIC ACCESS PROTOCOL</span>
          </div>

          <button className="footer-back-to-top-btn" onClick={scrollToTop} aria-label="Ascend to ocean surface">
            <span>ASCEND TO SURFACE</span>
            <div className="ascend-arrow-circle">
              <ArrowUp size={14} />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
};
