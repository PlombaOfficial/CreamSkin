import React, { useEffect, useState } from 'react';
import { SkinMetadata, CommentItem } from '../types';
import { skinService } from '../firebase/SkinService';
import { SkinTextureBuffer } from '../engine/SkinTextureBuffer';
import { ModelViewer3D } from './ModelViewer3D';
import { LanguageCode, getTranslation } from '../i18n/translations';

interface SkinDetailModalProps {
  skin: SkinMetadata;
  lang: LanguageCode;
  onClose: () => void;
  onEditInStudio: (skin: SkinMetadata) => void;
  onOpenAuth: () => void;
  onOpenDMsWithAuthor?: (authorUid: string, authorName: string) => void;
  onOpenReport?: (targetType: 'skin', targetId: string) => void;
  onViewAuthorProfile?: (authorUid: string, authorName: string) => void;
}

export const SkinDetailModal: React.FC<SkinDetailModalProps> = ({
  skin,
  lang,
  onClose,
  onEditInStudio,
  onOpenAuth,
  onOpenDMsWithAuthor,
  onOpenReport,
  onViewAuthorProfile,
}) => {
  const t = (k: string) => getTranslation(lang, k);
  const user = skinService.currentUser;

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState('');
  const [likesCount, setLikesCount] = useState(skin.likesCount);
  const [hasLiked, setHasLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [guestNotice, setGuestNotice] = useState<string | null>(null);

  const [userRating, setUserRating] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [ratingAvg, setRatingAvg] = useState(skin.ratingAverage || 0);
  const [ratingCount, setRatingCount] = useState(skin.ratingCount || 0);

  const [buffer, setBuffer] = useState<SkinTextureBuffer>(() => new SkinTextureBuffer());
  const [textureVersion, setTextureVersion] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const buf = new SkinTextureBuffer();
    buf.loadFromBase64PNG(skin.base64Png).then(() => {
      if (isMounted) {
        setBuffer(buf);
        setTextureVersion((v) => v + 1);
      }
    }).catch(() => {
      if (isMounted) {
        setBuffer(buf);
        setTextureVersion((v) => v + 1);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [skin.base64Png]);

  useEffect(() => {
    const unsub = skinService.subscribeToComments(skin.id, (list) => {
      setComments(list);
    });

    if (skinService.userProfile) {
      setIsFavorite(skinService.userProfile.favoriteSkinIds.includes(skin.id));
      setIsFollowingAuthor(skinService.userProfile.followingUids.includes(skin.authorUid));
    }

    return () => unsub();
  }, [skin.id, skin.authorUid]);

  const requireAuthAction = (actionName: string, callback: () => void) => {
    if (!user) {
      setGuestNotice(`Please sign in to ${actionName}.`);
      return;
    }
    setGuestNotice(null);
    callback();
  };

  const handleLike = () => {
    requireAuthAction('like this skin', async () => {
      if (hasLiked) return;
      setHasLiked(true);
      setLikesCount((c) => c + 1);
      await skinService.likeSkin(skin.id);
    });
  };

  const handleToggleFavorite = () => {
    requireAuthAction('favorite this skin', async () => {
      const next = await skinService.toggleFavorite(skin.id);
      setIsFavorite(next);
    });
  };

  const handleToggleFollow = () => {
    requireAuthAction('follow creators', async () => {
      const next = await skinService.toggleFollowUser(skin.authorUid);
      setIsFollowingAuthor(next);
    });
  };

  const handleRate = (stars: number) => {
    requireAuthAction('rate skins', async () => {
      setUserRating(stars);
      const updated = await skinService.rateSkin(skin.id, stars);
      setRatingAvg(updated.average);
      setRatingCount(updated.count);
    });
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    requireAuthAction('post comments', async () => {
      await skinService.addComment(skin.id, commentText);
      setCommentText('');
    });
  };

  const handleCopyServerCommand = () => {
    const cmd = `/skin set ${skin.id}`;
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleDownload = () => {
    skinService.recordDownload(skin.id);
    const a = document.createElement('a');
    a.download = `${skin.title.replace(/\s+/g, '_')}_${skin.modelType}.png`;
    a.href = skin.base64Png;
    a.click();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px', width: '92%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{skin.title}</h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', fontSize: '12px', color: '#94a3b8' }}>
              <span>
                by{' '}
                <strong
                  style={{ color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => onViewAuthorProfile && onViewAuthorProfile(skin.authorUid, skin.authorName)}
                >
                  {skin.authorName}
                </strong>
              </span>
              {skin.authorUid !== 'mojang' && skin.authorUid !== 'guest' && (
                <button
                  className="mc-btn-secondary"
                  style={{ padding: '2px 8px', fontSize: '11px' }}
                  onClick={handleToggleFollow}
                >
                  {isFollowingAuthor ? '✓ Following' : '+ Follow'}
                </button>
              )}
              {onOpenDMsWithAuthor && skin.authorUid !== 'mojang' && (
                <button
                  className="mc-btn-secondary"
                  style={{ padding: '2px 8px', fontSize: '11px' }}
                  onClick={() => requireAuthAction('send messages', () => onOpenDMsWithAuthor(skin.authorUid, skin.authorName))}
                >
                  💬 Message
                </button>
              )}
            </div>
          </div>
          <button className="tool-btn-sm" onClick={onClose}>✕</button>
        </div>

        {guestNotice && (
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6', color: '#93c5fd', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🔒 {guestNotice}</span>
            <button className="mc-btn-primary" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={onOpenAuth}>
              Sign In
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', minHeight: '360px' }}>
          <div style={{ height: '360px', borderRadius: '8px', overflow: 'hidden', background: '#0b0f17', border: '1px solid var(--cs-border)' }}>
            <ModelViewer3D
              buffer={buffer}
              modelType={skin.modelType}
              textureVersion={textureVersion}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {skin.description && (
              <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                {skin.description}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#121722', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--cs-border-subtle)' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>{t('modal.rating')}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <div className="star-rating-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star-icon ${(hoverStar || userRating || Math.round(ratingAvg)) >= star ? 'filled' : ''}`}
                        onMouseEnter={() => setHoverStar(star)}
                        onMouseLeave={() => setHoverStar(0)}
                        onClick={() => handleRate(star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b' }}>
                    {ratingAvg > 0 ? ratingAvg : '—'} <span style={{ color: '#64748b', fontSize: '11px' }}>({ratingCount})</span>
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className={`mc-btn-secondary ${hasLiked ? 'active' : ''}`}
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                  onClick={handleLike}
                  title="Like"
                >
                  ❤️ {likesCount}
                </button>
                <button
                  className={`mc-btn-secondary ${isFavorite ? 'active' : ''}`}
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                  onClick={handleToggleFavorite}
                  title="Favorite"
                >
                  {isFavorite ? '⭐ Saved' : '☆ Save'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="mc-btn-primary"
                style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                onClick={handleDownload}
              >
                📥 {t('modal.download')}
              </button>
              <button
                className="mc-btn-secondary"
                style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                onClick={() => {
                  onEditInStudio(skin);
                  onClose();
                }}
              >
                🎨 {t('modal.edit')}
              </button>
            </div>

            <div className="panel-box" style={{ background: '#0a0d14' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#f59e0b', marginBottom: '2px' }}>
                ⚡ {t('modal.serverCmd').toUpperCase()}
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <code style={{
                  flex: 1,
                  background: '#141a29',
                  color: '#38bdf8',
                  padding: '6px 10px',
                  borderRadius: '5px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}>
                  /skin set {skin.id}
                </code>
                <button
                  className="mc-btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                  onClick={handleCopyServerCommand}
                >
                  {copiedCmd ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="panel-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="panel-header" style={{ marginBottom: '2px' }}>
                <span>💬 {t('modal.comments')} ({comments.length})</span>
                {onOpenReport && (
                  <button
                    className="tool-btn-sm"
                    style={{ fontSize: '10px', padding: '2px 6px', background: 'transparent', color: '#ef4444' }}
                    onClick={() => requireAuthAction('report content', () => onOpenReport('skin', skin.id))}
                  >
                    🚩 Report
                  </button>
                )}
              </div>

              <div style={{ flex: 1, maxHeight: '110px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {comments.length === 0 ? (
                  <span style={{ fontSize: '11px', color: '#64748b' }}>No comments yet.</span>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} style={{ background: '#111622', padding: '4px 8px', borderRadius: '5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#38bdf8' }}>
                        <strong>{c.authorName}</strong>
                        <span style={{ color: '#64748b' }}>{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#f1f5f9', marginTop: '1px' }}>{c.text}</div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#111622',
                    border: '1px solid var(--cs-border-subtle)',
                    color: '#fff',
                    padding: '5px 8px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    outline: 'none',
                  }}
                />
                <button type="submit" className="mc-btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                  {t('modal.post')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
