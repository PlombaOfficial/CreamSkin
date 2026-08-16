import React, { useState, useEffect } from 'react';
import { SkinMetadata } from '../types';
import { skinService } from '../firebase/SkinService';

interface ProfileViewProps {
  onSelectSkin: (skin: SkinMetadata) => void;
  onEditSkin: (skin: SkinMetadata) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onSelectSkin, onEditSkin }) => {
  const user = skinService.currentUser;
  const profile = skinService.userProfile;
  const [mySkins, setMySkins] = useState<SkinMetadata[]>([]);
  const [activeTab, setActiveTab] = useState<'published' | 'liked'>('published');

  useEffect(() => {
    const loadMySkins = async () => {
      const all = await skinService.getPublicSkins();
      if (user) {
        setMySkins(all.filter((s) => s.authorUid === user.uid));
      } else {
        // Guest mode: load locally saved
        setMySkins(all.filter((s) => s.authorUid === 'guest' || s.authorUid === 'official'));
      }
    };
    loadMySkins();
  }, [user]);

  return (
    <div className="gallery-container" style={{ maxWidth: '1000px' }}>
      {/* Profile Header Banner */}
      <div className="section-box" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #10b981)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          👤
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>{profile?.username || 'Guest Crafter'}</h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
            {profile?.bio || 'Minecraft skin designer & 3D pixel artist.'}
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12px', color: '#cbd5e1' }}>
            <span>🎨 Published: <strong>{mySkins.length}</strong></span>
            <span>❤️ Liked: <strong>{profile?.likedSkinIds.length || 0}</strong></span>
            <span>🔑 Status: <strong>{user ? (user.isAnonymous ? 'Guest Account' : 'Registered') : 'Offline'}</strong></span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '24px', marginBottom: '16px' }}>
        <button
          className={`tool-btn-sm ${activeTab === 'published' ? 'active' : ''}`}
          style={{ padding: '8px 16px' }}
          onClick={() => setActiveTab('published')}
        >
          🎨 My Published Skins ({mySkins.length})
        </button>
      </div>

      {/* Grid */}
      {mySkins.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          You haven't published any skins yet. Create one in the Studio Editor and click Publish!
        </div>
      ) : (
        <div className="skins-grid">
          {mySkins.map((skin) => (
            <div key={skin.id} className="skin-card" onClick={() => onSelectSkin(skin)}>
              <div className="skin-card-preview">
                <img src={skin.base64Png} alt={skin.title} className="skin-card-img" />
              </div>
              <div className="skin-card-body">
                <div className="skin-card-title">{skin.title}</div>
                <div className="skin-card-meta">
                  <span>❤️ {skin.likesCount}</span>
                  <span>📥 {skin.downloadsCount}</span>
                  <span>🏷️ {skin.category}</span>
                </div>
                <button
                  className="tool-btn-sm"
                  style={{ marginTop: '8px', background: '#3b82f6', color: '#fff' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditSkin(skin);
                  }}
                >
                  🎨 Edit in Studio
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
