import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Menu, X, Compass } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import './Navigation.css';

interface NavigationProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeSection, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMuted(soundEngine.getIsMuted());

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSoundToggle = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const navLinks = [
    { id: 'discovery', label: '01 DISCOVERY' },
    { id: 'descending', label: '02 DESCENT' },
    { id: 'city', label: '03 THE CITY' },
    { id: 'archive', label: '04 ARCHIVE' },
    { id: 'expedition', label: '05 EXPEDITION' },
    { id: 'signal', label: '06 LIVE SIGNAL' },
    { id: 'the-unknown', label: '07 THE UNKNOWN' }
  ];

  const handleLinkClick = (id: string) => {
    soundEngine.playTelemetryClick();
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className={`abyss-nav-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Brand */}
        <div className="nav-brand" onClick={() => handleLinkClick('hero')} role="button" tabIndex={0}>
          <span className="brand-logo">ABYSS</span>
          <div className="brand-badge">
            <span className="badge-dot active"></span>
            <span>EXPEDITION 07</span>
          </div>
        </div>

        {/* Desktop Links */}
        <nav className="nav-links-desktop" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                className={`nav-link-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleLinkClick(link.id)}
              >
                <span className="nav-link-text">{link.label}</span>
                {isActive && <span className="nav-active-pill" />}
              </button>
            );
          })}
        </nav>

        {/* Controls */}
        <div className="nav-controls">
          {/* Sound Synthesizer Toggle */}
          <button
            className={`btn-sound-control ${!isMuted ? 'active' : ''}`}
            onClick={handleSoundToggle}
            title={isMuted ? 'Enable Ambient Sonar & Audio' : 'Mute Ambient Audio'}
            aria-label="Toggle sound"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span className="sound-label">{isMuted ? 'AUDIO OFF' : 'AUDIO ON'}</span>
          </button>

          {/* Coordinates indicator */}
          <div className="nav-coords-badge">
            <Compass size={12} className="coords-icon" />
            <span>37°11′N 24°53′W</span>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <span className="mobile-drawer-title">MISSION DIRECTORY</span>
          <span className="mobile-drawer-depth">4,820 M DEPTH</span>
        </div>
        <div className="mobile-nav-links">
          {navLinks.map((link) => (
            <button
              key={link.id}
              className={`mobile-nav-item ${activeSection === link.id ? 'active' : ''}`}
              onClick={() => handleLinkClick(link.id)}
            >
              <span className="mobile-item-label">{link.label}</span>
              <span className="mobile-item-arrow">→</span>
            </button>
          ))}
        </div>
        <div className="mobile-drawer-footer">
          <button className="btn-sound-control mobile" onClick={handleSoundToggle}>
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{isMuted ? 'ENABLE OCEANIC AMBIENCE' : 'MUTE AUDIO'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
