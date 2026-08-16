import React, { useState } from 'react';
import { SkinTextureBuffer } from '../engine/SkinTextureBuffer';
import { ModelType } from '../types';
import { skinService } from '../firebase/SkinService';

interface PublishModalProps {
  buffer: SkinTextureBuffer;
  modelType: ModelType;
  onClose: () => void;
  onSuccess: (skinId: string) => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  buffer,
  modelType,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Fantasy');
  const [tags, setTags] = useState('custom, pixelart, minecraft');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('Please provide a title for your skin.');

    setIsSubmitting(true);
    const base64Png = buffer.toBase64PNG();
    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);

    try {
      const skinId = await skinService.publishSkin(
        title,
        description,
        category,
        tagList,
        modelType,
        base64Png
      );
      setIsSubmitting(false);
      onSuccess(skinId);
    } catch (err) {
      setIsSubmitting(false);
      alert('Failed to publish skin. Please try again.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>🚀 Publish Skin to Community</h2>
          <button className="tool-btn-sm" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Skin Title *</label>
            <input
              type="text"
              required
              className="color-hex-input"
              style={{ marginTop: '4px' }}
              placeholder="e.g. Cyber Dragon Knight"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Description</label>
            <textarea
              className="color-hex-input"
              rows={3}
              style={{ marginTop: '4px', resize: 'none' }}
              placeholder="Tell other crafters about your skin design..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Category</label>
              <select
                className="color-hex-input"
                style={{ marginTop: '4px' }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Gaming">Gaming</option>
                <option value="Anime">Anime</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Medieval">Medieval</option>
                <option value="Cute">Cute</option>
                <option value="Mobs">Mobs</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Model Type</label>
              <input
                type="text"
                disabled
                className="color-hex-input"
                style={{ marginTop: '4px', opacity: 0.7 }}
                value={modelType === 'classic' ? 'Classic (4px)' : 'Slim (3px)'}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Tags (comma separated)</label>
            <input
              type="text"
              className="color-hex-input"
              style={{ marginTop: '4px' }}
              placeholder="knight, gold, cape, armor"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button type="button" className="tool-btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="tool-btn-sm"
              disabled={isSubmitting}
              style={{ background: '#10b981', color: '#fff', padding: '8px 16px' }}
            >
              {isSubmitting ? 'Publishing...' : '🚀 Publish Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
