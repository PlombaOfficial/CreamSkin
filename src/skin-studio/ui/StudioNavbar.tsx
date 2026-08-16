import React, { useState, useEffect } from 'react';
import { skinService } from '../firebase/SkinService';
import { creamSkinRadio } from '../audio/CreamSkinRadio';
import { LanguageCode, LANGUAGES, getTranslation } from '../i18n/translations';

interface StudioNavbarProps {
  activeTab: 'editor' | 'gallery' | 'players' | 'trending' | 'templates' | 'profile' | 'plugin';
  lang: LanguageCode;
  onTabChange: (tab: 'editor' | 'gallery' | 'players' | 'trending' | 'templates' | 'profile' | 'plugin') => void;
  onLangChange: (lang: LanguageCode) => void;
  onOpenAuth: () => void;
  onOpenPublish?: () => void;
  onOpenDMs: () => void;
  onOpenTutorial: () => void;
}

export const StudioNavbar: React.FC<StudioNavbarProps> = ({
  activeTab,
  lang,
  onTabChange,
  onLangChange,
  onOpenAuth,
  onOpenPublish,
  onOpenDMs,
  onOpenTutorial,
}) => {
  const user = skinService.currentUser;
  const profile = skinService.userProfile;

  // Single Background Music Player State
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isMuted, setIsMuted] = useState(creamSkinRadio.getIsMuted());

  useEffect(() => {
    setIsPlayingMusic(creamSkinRadio.getIsPlaying());
  }, []);

  const handleTogglePlayMusic = () => {
    const active = creamSkinRadio.togglePlay();
    setIsPlayingMusic(active);
  };

  const handleToggleMute = () => {
    const muted = creamSkinRadio.toggleMute();
    setIsMuted(muted);
  };

  const t = (k: string) => getTranslation(lang, k);

  return (
    <nav className="studio-navbar">
      {/* Brand */}
      <div className="brand-wrapper" onClick={() => onTabChange('gallery')}>
        <div className="brand-badge">CS</div>
        <div className="brand-text">
          Cream<span>Skin</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-links-row">
        <button
          className={`nav-tab-item ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => onTabChange('editor')}
        >
          🎨 {t('nav.editor')}
        </button>
        <button
          className={`nav-tab-item ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => onTabChange('gallery')}
        >
          🌐 {t('nav.gallery')}
        </button>
        <button
          className={`nav-tab-item ${activeTab === 'players' ? 'active' : ''}`}
          onClick={() => onTabChange('players')}
        >
          👤 {t('nav.players')}
        </button>
        <button
          className={`nav-tab-item ${activeTab === 'trending' ? 'active' : ''}`}
          onClick={() => onTabChange('trending')}
        >
          🔥 {t('nav.trending')}
        </button>
        <button
          className={`nav-tab-item ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => onTabChange('templates')}
        >
          📦 {t('nav.templates')}
        </button>
        <button
          className={`nav-tab-item ${activeTab === 'plugin' ? 'active' : ''}`}
          onClick={() => onTabChange('plugin')}
        >
          🔌 {t('nav.server')}
        </button>
        <button
          className={`nav-tab-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => onTabChange('profile')}
        >
          👤 {t('nav.profile')}
        </button>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {/* Language Selector */}
        <select
          className="tool-btn-sm"
          value={lang}
          onChange={(e) => {
            const nextLang = e.target.value as LanguageCode;
            try {
              localStorage.setItem('creamskin_lang', nextLang);
            } catch {}
            onLangChange(nextLang);
          }}
          style={{ padding: '3px 6px', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} style={{ background: '#121722', color: '#fff' }}>
              {l.flag} {l.name}
            </option>
          ))}
        </select>

        {/* Tutorial Button */}
        <button
          className="tool-btn-sm"
          style={{ padding: '3px 6px' }}
          onClick={onOpenTutorial}
          title="Guide"
        >
          ❓
        </button>

        {/* Minimal Music Toggle (plays public/audio/music.mp3) */}
        <div className="radio-mini-widget">
          <button className="radio-btn" onClick={handleTogglePlayMusic} title={isPlayingMusic ? 'Pause Music' : 'Play Music (music.mp3)'}>
            {isPlayingMusic ? '⏸️' : '🎵'}
          </button>
          <button className="radio-btn" onClick={handleToggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* Community Chat & Messages */}
        <button
          className="tool-btn-sm"
          style={{ background: '#1e293b' }}
          onClick={onOpenDMs}
          title="Global Chat & Messages"
        >
          💬 {t('nav.dms')}
        </button>

        {/* Publish Skin Trigger */}
        {activeTab === 'editor' && onOpenPublish && (
          <button
            className="tool-btn-sm"
            style={{ background: '#10b981', color: '#fff', padding: '5px 10px' }}
            onClick={onOpenPublish}
          >
            🚀 {t('nav.publish')}
          </button>
        )}

        {/* Account / Auth */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>
              {profile?.username || 'Crafter'}
            </span>
            <button
              className="tool-btn-sm"
              style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
              onClick={async () => {
                await skinService.logout();
                window.location.reload();
              }}
            >
              {t('nav.exit')}
            </button>
          </div>
        ) : (
          <button
            className="tool-btn-sm"
            style={{ background: '#2563eb', color: '#fff' }}
            onClick={onOpenAuth}
          >
            🔑 {t('nav.login')}
          </button>
        )}
      </div>
    </nav>
  );
};
