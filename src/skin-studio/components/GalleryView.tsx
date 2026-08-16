import React, { useState, useEffect } from 'react';
import { SkinMetadata } from '../types';
import { skinService } from '../firebase/SkinService';

interface GalleryViewProps {
  onSelectSkin: (skin: SkinMetadata) => void;
  onEditSkin: (skin: SkinMetadata) => void;
}

const CATEGORIES = ['All', 'Default', 'Basic', 'Sci-Fi', 'Medieval', 'Fantasy', 'Anime', 'Cute'];

export const GalleryView: React.FC<GalleryViewProps> = ({ onSelectSkin, onEditSkin }) => {
  const [skins, setSkins] = useState<SkinMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'downloads'>('popular');

  const loadSkins = async () => {
    setLoading(true);
    const data = await skinService.getPublicSkins(category, sortBy, search);
    setSkins(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSkins();
  }, [category, sortBy, search]);

  return (
    <div className="gallery-container">
      {/* Hero Header */}
      <div className="gallery-hero">
        <h1 className="gallery-hero-title">DISCOVER MINECRAFT SKINS</h1>
        <p style={{ color: '#94a3b8', fontSize: '15px' }}>
          Explore, customize in 3D, download standard 64×64 PNGs, and equip on Minecraft servers.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="gallery-filters-row">
        <input
          type="text"
          className="search-input-box"
          placeholder="🔍 Search by name, creator, or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="category-pills">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`cat-pill ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <select
          className="tool-btn-sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          style={{ padding: '8px 12px' }}
        >
          <option value="popular">🔥 Most Popular</option>
          <option value="recent">⚡ Newest</option>
          <option value="downloads">📥 Most Downloaded</option>
        </select>
      </div>

      {/* Skins Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          Loading community skins...
        </div>
      ) : skins.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          No skins found matching your criteria. Try another search or category!
        </div>
      ) : (
        <div className="skins-grid">
          {skins.map((skin) => (
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
                  by {skin.authorName} • <span style={{ textTransform: 'capitalize' }}>{skin.modelType}</span>
                </div>

                <div className="skin-card-meta" style={{ marginTop: '6px' }}>
                  <span>❤️ {skin.likesCount}</span>
                  <span>📥 {skin.downloadsCount}</span>
                  <span>🏷️ {skin.category}</span>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <button
                    className="tool-btn-sm"
                    style={{ flex: 1, background: '#3b82f6', color: '#fff' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditSkin(skin);
                    }}
                  >
                    🎨 Edit in Studio
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
