import React from 'react';
import { skinService } from '../firebase/SkinService';

interface StudioNavbarProps {
  activeTab: 'editor' | 'gallery' | 'templates' | 'profile' | 'plugin';
  onTabChange: (tab: 'editor' | 'gallery' | 'templates' | 'profile' | 'plugin') => void;
  onOpenAuth: () => void;
  onOpenPublish?: () => void;
}

export const StudioNavbar: React.FC<StudioNavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenAuth,
  onOpenPublish,
}) => {
  const user = skinService.currentUser;
  const profile = skinService.userProfile;

  return (
    <nav className="studio-navbar">
      {/* Brand & Logo */}
      <div className="nav-brand" onClick={() => onTabChange('gallery')}>
        <div className="nav-logo-badge">64×64</div>
        <div>
          <div className="nav-title">MINECRAFT SKIN STUDIO</div>
          <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>PRO EDITION</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => onTabChange('editor')}
        >
          🎨 Studio Editor
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => onTabChange('gallery')}
        >
          🌐 Explore Gallery
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => onTabChange('templates')}
        >
          ⚡ Templates
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'plugin' ? 'active' : ''}`}
          onClick={() => onTabChange('plugin')}
        >
          🔌 Server Plugin
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => onTabChange('profile')}
        >
          👤 My Profile
        </button>
      </div>

      {/* Right Side Actions */}
      <div className="nav-actions">
        {onOpenPublish && activeTab === 'editor' && (
          <button
            className="tool-btn-sm"
            style={{ background: '#10b981', color: '#fff', padding: '8px 14px' }}
            onClick={onOpenPublish}
          >
            🚀 Publish Skin
          </button>
        )}

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              Sign Out
            </button>
          </div>
        ) : (
          <button
            className="tool-btn-sm"
            style={{ background: '#3b82f6', color: '#fff', padding: '8px 14px' }}
            onClick={onOpenAuth}
          >
            🔑 Sign In / Guest
          </button>
        )}
      </div>
    </nav>
  );
};
