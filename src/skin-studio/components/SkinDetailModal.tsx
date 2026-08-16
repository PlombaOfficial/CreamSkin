import React, { useEffect, useState, useMemo } from 'react';
import { SkinMetadata, CommentItem } from '../types';
import { skinService } from '../firebase/SkinService';
import { SkinTextureBuffer } from '../engine/SkinTextureBuffer';
import { ModelViewer3D } from './ModelViewer3D';

interface SkinDetailModalProps {
  skin: SkinMetadata;
  onClose: () => void;
  onEditInStudio: (skin: SkinMetadata) => void;
}

export const SkinDetailModal: React.FC<SkinDetailModalProps> = ({
  skin,
  onClose,
  onEditInStudio,
}) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState('');
  const [likesCount, setLikesCount] = useState(skin.likesCount);
  const [hasLiked, setHasLiked] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

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
    return () => unsub();
  }, [skin.id]);

  const handleLike = async () => {
    if (hasLiked) return;
    setHasLiked(true);
    setLikesCount((c) => c + 1);
    await skinService.likeSkin(skin.id);
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
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{skin.title}</h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Created by <strong style={{ color: '#38bdf8' }}>{skin.authorName}</strong> • {skin.category} • {skin.modelType} model
            </span>
          </div>
          <button className="tool-btn-sm" onClick={onClose} style={{ fontSize: '14px' }}>✕</button>
        </div>

        {/* Modal Main Content (3D Viewer Left + Details & Comments Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', minHeight: '360px' }}>
          {/* 3D Interactive Model */}
          <div style={{ height: '360px', borderRadius: '12px', overflow: 'hidden' }}>
            <ModelViewer3D
              buffer={buffer}
              modelType={skin.modelType}
              textureVersion={1}
            />
          </div>

          {/* Details, Actions & Minecraft Server Integration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
              {skin.description}
            </p>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="tool-btn-sm"
                style={{ flex: 1, background: '#10b981', color: '#fff', padding: '10px' }}
                onClick={handleDownload}
              >
                📥 Download 64×64 PNG
              </button>
              <button
                className="tool-btn-sm"
                style={{ flex: 1, background: '#3b82f6', color: '#fff', padding: '10px' }}
                onClick={() => {
                  onEditInStudio(skin);
                  onClose();
                }}
              >
                🎨 Open in Studio
              </button>
              <button
                className={`tool-btn-sm ${hasLiked ? 'active' : ''}`}
                style={{ padding: '10px 14px' }}
                onClick={handleLike}
              >
                ❤️ {likesCount}
              </button>
            </div>

            {/* Minecraft Java Server Integration Box */}
            <div className="section-box" style={{ background: '#0f172a' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', marginBottom: '4px' }}>
                ⚡ EQUIP ON MINECRAFT SERVER
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>
                Use our Spigot/Paper server plugin command:
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <code style={{
                  flex: 1,
                  background: '#1e293b',
                  color: '#38bdf8',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}>
                  /skin set {skin.id}
                </code>
                <button
                  className="tool-btn-sm"
                  style={{ background: copiedCmd ? '#10b981' : '#334155' }}
                  onClick={handleCopyServerCommand}
                >
                  {copiedCmd ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="section-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="section-header">💬 Comments ({comments.length})</div>

              <div style={{ flex: 1, maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {comments.length === 0 ? (
                  <span style={{ fontSize: '11px', color: '#64748b' }}>No comments yet. Be the first to comment!</span>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} style={{ background: '#1e293b', padding: '6px 10px', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#38bdf8' }}>
                        <strong>{c.authorName}</strong>
                        <span style={{ color: '#64748b' }}>{new Date(c.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#f1f5f9', marginTop: '2px' }}>{c.text}</div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: '#fff',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
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
