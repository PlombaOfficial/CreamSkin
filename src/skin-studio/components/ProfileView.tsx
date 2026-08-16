import React, { useState, useEffect } from 'react';
import { UserProfile, SkinMetadata } from '../types';
import { skinService } from '../firebase/SkinService';
import { LanguageCode } from '../i18n/translations';

interface ProfileViewProps {
  lang: LanguageCode;
  targetUid?: string;
  onSelectSkin: (skin: SkinMetadata) => void;
  onEditSkin: (skin: SkinMetadata) => void;
  onOpenAuth: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  targetUid,
  onSelectSkin,
  onEditSkin,
  onOpenAuth,
}) => {
  const currentUser = skinService.currentUser;
  const currentProfile = skinService.userProfile;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [publishedSkins, setPublishedSkins] = useState<SkinMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  const effectiveUid = targetUid || currentUser?.uid;

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      if (!effectiveUid) {
        setProfile(null);
        setLoading(false);
        return;
      }

      if (effectiveUid === currentUser?.uid && currentProfile) {
        setProfile(currentProfile);
      } else {
        const p = await skinService.getPublicUserProfile(effectiveUid);
        setProfile(p);
      }

      // Load skins by author
      const allSkins = await skinService.getPublicSkins('All', 'recent');
      const authorSkins = allSkins.filter((s) => s.authorUid === effectiveUid);
      setPublishedSkins(authorSkins);
      setLoading(false);
    };

    loadProfileData();
  }, [effectiveUid, currentUser, currentProfile]);

  if (!currentUser && !targetUid) {
    return (
      <div className="gallery-container">
        <div className="empty-state-box" style={{ maxWidth: '480px', margin: '40px auto' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>👤</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
            Guest User
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
            You are browsing CreamSkin in Guest Mode. Sign in or create a free account to publish your own skins, track favorites, and follow creators.
          </p>
          <button
            className="tool-btn-sm"
            style={{ background: '#2563eb', color: '#fff', padding: '8px 20px', fontSize: '13px' }}
            onClick={onOpenAuth}
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="gallery-container" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div className="gallery-container">
      {/* Profile Header Banner */}
      <div className="panel-box" style={{ padding: '20px', background: '#121722', marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          color: '#fff',
          fontWeight: 800,
        }}>
          {profile?.username ? profile.username.charAt(0).toUpperCase() : 'C'}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>
              {profile?.username || 'Crafter'}
            </h1>
            <span style={{ fontSize: '10px', background: '#1e3a8a', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px' }}>
              CreamSkin Creator
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            {profile?.bio || 'Minecraft skin designer & creator.'}
          </p>

          <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12px', color: '#cbd5e1' }}>
            <span>🎨 <strong>{publishedSkins.length}</strong> Skins Published</span>
            <span>👥 <strong>{profile?.followersCount || 0}</strong> Followers</span>
          </div>
        </div>
      </div>

      {/* Creator Works Grid */}
      <div style={{ marginBottom: '12px', fontSize: '15px', fontWeight: 700, color: '#fff' }}>
        Published Skins ({publishedSkins.length})
      </div>

      {publishedSkins.length === 0 ? (
        <div className="empty-state-box">
          <p style={{ fontSize: '13px' }}>No skins published by this creator yet.</p>
        </div>
      ) : (
        <div className="skins-grid">
          {publishedSkins.map((skin) => (
            <div
              key={skin.id}
              className="skin-card"
              onClick={() => onSelectSkin(skin)}
            >
              <div className="skin-card-preview">
                <img
                  src={skin.base64Png}
                  alt={skin.title}
                  className="skin-card-img"
                />
              </div>

              <div className="skin-card-body">
                <div className="skin-card-title">{skin.title}</div>
                <div style={{ fontSize: '11px', color: '#38bdf8' }}>
                  {skin.category} • <span style={{ textTransform: 'capitalize' }}>{skin.modelType}</span>
                </div>

                <div className="skin-card-meta" style={{ marginTop: '4px' }}>
                  <span>★ {skin.ratingAverage || 5.0}</span>
                  <span>❤️ {skin.likesCount}</span>
                  <span>📥 {skin.downloadsCount}</span>
                </div>

                <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                  <button
                    className="tool-btn-sm"
                    style={{ flex: 1, background: '#2563eb', color: '#fff' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditSkin(skin);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="tool-btn-sm"
                    style={{ background: '#10b981', color: '#fff' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      skinService.recordDownload(skin.id);
                      const a = document.createElement('a');
                      a.download = `${skin.title.replace(/\s+/g, '_')}.png`;
                      a.href = skin.base64Png;
                      a.click();
                    }}
                    title="Download 64x64 PNG"
                  >
                    📥
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
