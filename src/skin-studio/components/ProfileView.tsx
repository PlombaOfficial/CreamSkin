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
  onOpenAvatarModal?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  targetUid,
  onSelectSkin,
  onEditSkin,
  onOpenAuth,
  onOpenAvatarModal,
}) => {
  const currentUser = skinService.currentUser;
  const currentProfile = skinService.userProfile;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [publishedSkins, setPublishedSkins] = useState<SkinMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  const effectiveUid = targetUid || currentUser?.uid;
  const isMyProfile = currentUser && (!targetUid || targetUid === currentUser.uid);

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
            You are browsing CreamSkin in Guest Mode. Sign in or create a free account to publish your own skins, track favorites, and customize your avatar.
          </p>
          <button
            className="mc-btn-primary"
            style={{ padding: '8px 20px', fontSize: '13px' }}
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

  const avatarSrc = (profile as any)?.avatarUrl || (currentUser ? localStorage.getItem(`avatar_${currentUser.uid}`) : null);

  return (
    <div className="gallery-container">
      <div className="panel-box" style={{ padding: '20px', background: '#17202c', marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        {avatarSrc ? (
          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '10px',
            border: '2px solid #38bdf8',
            overflow: 'hidden',
            background: '#12151d',
          }}>
            <img src={avatarSrc} alt="Avatar" style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }} />
          </div>
        ) : (
          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #5ba337, #38bdf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
            color: '#fff',
            fontWeight: 800,
          }}>
            {profile?.username ? profile.username.charAt(0).toUpperCase() : 'C'}
          </div>
        )}

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0 }}>
              {profile?.username || 'Crafter'}
            </h1>
            <span className="mc-badge green">
              Creator
            </span>
            {isMyProfile && onOpenAvatarModal && (
              <button
                className="mc-btn-secondary"
                style={{ fontSize: '10px', padding: '2px 8px', marginLeft: 'auto' }}
                onClick={onOpenAvatarModal}
              >
                ✏️ Change Avatar
              </button>
            )}
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', margin: 0 }}>
            {profile?.bio || 'Minecraft skin designer & creator.'}
          </p>

          <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12px', color: '#cbd5e1' }}>
            <span>🎨 <strong>{publishedSkins.length}</strong> Skins Published</span>
            <span>👥 <strong>{profile?.followersCount || 0}</strong> Followers</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '12px', fontSize: '15px', fontWeight: 700, color: '#fff' }}>
        Published Skins ({publishedSkins.length})
      </div>

      {publishedSkins.length === 0 ? (
        <div className="empty-state-box">
          <p style={{ fontSize: '13px' }}>Пока здесь нет опубликованных работ этого автора.</p>
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
                  <span>★ {skin.ratingAverage > 0 ? skin.ratingAverage : '—'}</span>
                  <span>❤️ {skin.likesCount}</span>
                  <span>📥 {skin.downloadsCount}</span>
                </div>

                <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                  <button
                    className="mc-btn-primary"
                    style={{ flex: 1, padding: '4px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditSkin(skin);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="mc-btn-secondary"
                    style={{ padding: '4px 8px' }}
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
