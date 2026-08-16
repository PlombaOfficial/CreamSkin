import React, { useEffect, useState, useMemo } from 'react';
import { SkinMetadata, CommentItem } from '../types';
import { skinService } from '../firebase/SkinService';
import { SkinTextureBuffer } from '../engine/SkinTextureBuffer';
import { ModelViewer3D } from './ModelViewer3D';

interface SkinDetailModalProps {
  skin: SkinMetadata;
  onClose: () => void;
  onEditInStudio: (skin: SkinMetadata) => void;
  onOpenDMsWithAuthor?: (authorUid: string, authorName: string) => void;
  onOpenReport?: (targetType: 'skin', targetId: string) => void;
}

export const SkinDetailModal: React.FC<SkinDetailModalProps> = ({
  skin,
  onClose,
  onEditInStudio,
  onOpenDMsWithAuthor,
  onOpenReport,
}) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState('');
  const [likesCount, setLikesCount] = useState(skin.likesCount);
  const [hasLiked, setHasLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Ratings
  const [userRating, setUserRating] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [ratingAvg, setRatingAvg] = useState(skin.ratingAverage || 5.0);
  const [ratingCount, setRatingCount] = useState(skin.ratingCount || 1);

  // Load texture buffer for 3D Viewer
  const buffer = useMemo(() => {
    const buf = new SkinTextureBuffer();
    buf.loadFromBase64PNG(skin.base64Png);
    return buf;
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

  const handleLike = async () => {
    if (hasLiked) return;
    setHasLiked(true);
    setLikesCount((c) => c + 1);
    await skinService.likeSkin(skin.id);
  };

  const handleToggleFavorite = async () => {
    const next = await skinService.toggleFavorite(skin.id);
    setIsFavorite(next);
  };

  const handleToggleFollow = async () => {
    const next = await skinService.toggleFollowUser(skin.authorUid);
    setIsFollowingAuthor(next);
  };

  const handleRate = async (stars: number) => {
    setUserRating(stars);
    const updated = await skinService.rateSkin(skin.id, stars);
    setRatingAvg(updated.average);
    setRatingCount(updated.count);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await skinService.addComment(skin.id, commentText);
    setCommentText('');
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
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{skin.title}</h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px', fontSize: '12px', color: '#94a3b8' }}>
              <span>by <strong style={{ color: '#38bdf8' }}>{skin.authorName}</strong></span>
              {skin.authorUid !== 'official' && (
                <button
                  className="tool-btn-sm"
                  style={{ padding: '2px 8px', fontSize: '10px', background: isFollowingAuthor ? '#2563eb' : '#334155' }}
                  onClick={handleToggleFollow}
                >
                  {isFollowingAuthor ? '✓ Following' : '+ Follow'}
                </button>
              )}
              {onOpenDMsWithAuthor && skin.authorUid !== 'official' && (
                <button
                  className="tool-btn-sm"
                  style={{ padding: '2px 8px', fontSize: '10px' }}
                  onClick={() => onOpenDMsWithAuthor(skin.authorUid, skin.authorName)}
                >
                  💬 Message
                </button>
              )}
            </div>
          </div>
          <button className="tool-btn-sm" onClick={onClose} style={{ fontSize: '14px' }}>✕</button>
        </div>

        {/* Main Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', minHeight: '360px' }}>
          {/* 3D Interactive Model */}
          <div style={{ height: '360px', borderRadius: '10px', overflow: 'hidden' }}>
            <ModelViewer3D
              buffer={buffer}
              modelType={skin.modelType}
              textureVersion={1}
            />
          </div>

          {/* Details & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
              {skin.description}
            </p>

            {/* Rating Stars & Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111622', padding: '8px 12px', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Community Rating</div>
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
                    {ratingAvg} <span style={{ color: '#64748b', fontSize: '11px' }}>({ratingCount})</span>
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className={`tool-btn-sm ${hasLiked ? 'active' : ''}`}
                  onClick={handleLike}
                  title="Like Skin"
                >
                  ❤️ {likesCount}
                </button>
                <button
                  className={`tool-btn-sm ${isFavorite ? 'active' : ''}`}
                  onClick={handleToggleFavorite}
                  title="Favorite Skin"
                >
                  {isFavorite ? '⭐ Saved' : '☆ Favorite'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="tool-btn-sm"
                style={{ flex: 1, background: '#10b981', color: '#fff', padding: '8px' }}
                onClick={handleDownload}
              >
                📥 Download PNG
              </button>
              <button
                className="tool-btn-sm"
                style={{ flex: 1, background: '#3b82f6', color: '#fff', padding: '8px' }}
                onClick={() => {
                  onEditInStudio(skin);
                  onClose();
                }}
              >
                🎨 Edit in Studio
              </button>
            </div>

            {/* Minecraft Server In-game Command */}
            <div className="panel-box" style={{ background: '#0a0d14' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#f59e0b', marginBottom: '2px' }}>
                ⚡ EQUIP ON MINECRAFT SERVER
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <code style={{
                  flex: 1,
                  background: '#141a29',
                  color: '#38bdf8',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}>
                  /skin set {skin.id}
                </code>
                <button
                  className="tool-btn-sm"
                  style={{ background: copiedCmd ? '#10b981' : '#1e293b' }}
                  onClick={handleCopyServerCommand}
                >
                  {copiedCmd ? '✓' : '📋 Copy'}
                </button>
              </div>
            </div>

            {/* Comments Stream */}
            <div className="panel-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="panel-header">
                <span>💬 Comments ({comments.length})</span>
                {onOpenReport && (
                  <button
                    className="tool-btn-sm"
                    style={{ fontSize: '9px', padding: '2px 6px', background: 'transparent', color: '#ef4444' }}
                    onClick={() => onOpenReport('skin', skin.id)}
                  >
                    🚩 Report
                  </button>
                )}
              </div>

              <div style={{ flex: 1, maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {comments.length === 0 ? (
                  <span style={{ fontSize: '11px', color: '#64748b' }}>No comments yet. Be the first to review!</span>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} style={{ background: '#111622', padding: '5px 8px', borderRadius: '6px' }}>
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
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    padding: '5px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    outline: 'none',
                  }}
                />
                <button type="submit" className="tool-btn-sm" style={{ background: '#3b82f6', color: '#fff' }}>
                  Post
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
