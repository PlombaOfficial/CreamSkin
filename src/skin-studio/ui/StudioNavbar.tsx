import React, { useState, useEffect } from 'react';
import { skinService } from '../firebase/SkinService';
import { creamSkinRadio } from '../audio/CreamSkinRadio';

interface StudioNavbarProps {
  activeTab: 'editor' | 'gallery' | 'trending' | 'latest' | 'templates' | 'profile' | 'plugin';
  onTabChange: (tab: 'editor' | 'gallery' | 'trending' | 'latest' | 'templates' | 'profile' | 'plugin') => void;
  onOpenAuth: () => void;
  onOpenPublish?: () => void;
  onOpenDMs: () => void;
}

export const StudioNavbar: React.FC<StudioNavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenAuth,
  onOpenPublish,
  onOpenDMs,
}) => {
  const user = skinService.currentUser;
  const profile = skinService.userProfile;

  // Radio Audio Player State
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(creamSkinRadio.getCurrentTrack());
  const [isMuted, setIsMuted] = useState(creamSkinRadio.getIsMuted());

  useEffect(() => {
    setIsPlayingMusic(creamSkinRadio.getIsPlaying());
  }, []);

  const handleTogglePlayMusic = () => {
    const active = creamSkinRadio.togglePlay();
    setIsPlayingMusic(active);
    setCurrentTrack(creamSkinRadio.getCurrentTrack());
  };

  const handleNextTrack = () => {
    const next = creamSkinRadio.nextTrack();
    setCurrentTrack(next);
    setIsPlayingMusic(creamSkinRadio.getIsPlaying());
  };

  const handleToggleMute = () => {
    const muted = creamSkinRadio.toggleMute();
    setIsMuted(muted);
  };

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
          🎨 Editor
        </button>
        <button
          className={`nav-tab-item ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => onTabChange('gallery')}
        >
          🌐 Explore
        </button>
        <button
          className={`nav-tab-item ${activeTab === 'trending' ? 'active' : ''}`}
          onClick={() => onTabChange('trending')}
        >
          🔥 Trending
        </button>
        <button
          className={`nav-tab-item ${activeTab === 'latest' ? 'active' : ''}`}
          onClick={() => onTabChange('latest')}
        >
          ⚡ Latest
        </button>
        <button
          className={`nav-tab-item ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => onTabChange('templates')}
        >
          📦 Templates
        </button>
        <button
          className={`nav-tab-item ${activeTab === 'plugin' ? 'active' : ''}`}
          onClick={() => onTabChange('plugin')}
        >
          🔌 Server
        </button>
        <button
          className={`nav-tab-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => onTabChange('profile')}
        >
          👤 Profile
        </button>
      </div>

      {/* Right Controls (Music, DMs, Publish, Account) */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* CreamSkin Radio Mini-Player */}
        <div className="radio-mini-widget">
          <button className="radio-btn" onClick={handleTogglePlayMusic} title={isPlayingMusic ? 'Pause Music' : 'Play Lo-Fi Music'}>
            {isPlayingMusic ? '⏸️' : '🎵'}
          </button>
          <span className="radio-track-title">{currentTrack.title}</span>
          <button className="radio-btn" onClick={handleNextTrack} title="Next Track">
            ⏭️
          </button>
          <button className="radio-btn" onClick={handleToggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* Direct Messages Button */}
        <button
          className="tool-btn-sm"
          style={{ background: '#1e293b' }}
          onClick={onOpenDMs}
          title="Direct Messages"
        >
          💬 DMs
        </button>

        {/* Publish Skin Trigger */}
        {activeTab === 'editor' && onOpenPublish && (
          <button
            className="tool-btn-sm"
            style={{ background: '#10b981', color: '#fff', padding: '6px 12px' }}
            onClick={onOpenPublish}
          >
            🚀 Publish
          </button>
        )}

        {/* Account / Auth */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
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
              Exit
            </button>
          </div>
        ) : (
          <button
            className="tool-btn-sm"
            style={{ background: '#3b82f6', color: '#fff' }}
            onClick={onOpenAuth}
          >
            🔑 Log In
          </button>
        )}
      </div>
    </nav>
  );
};
