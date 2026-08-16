import React, { useState, useEffect } from 'react';
import { SkinMetadata } from '../types';
import { skinService } from '../firebase/SkinService';
import { MinecraftApiService, MinecraftPlayerProfile, FEATURED_REAL_PLAYERS } from '../services/MinecraftApiService';
import { LanguageCode, getTranslation } from '../i18n/translations';

interface GalleryViewProps {
  lang: LanguageCode;
  initialMode?: 'community' | 'players' | 'trending' | 'latest';
  onSelectSkin: (skin: SkinMetadata) => void;
  onEditSkin: (skin: SkinMetadata) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  lang,
  initialMode = 'community',
  onSelectSkin,
  onEditSkin,
}) => {
  const t = (k: string) => getTranslation(lang, k);

  const [activeMode, setActiveMode] = useState<'community' | 'players' | 'trending' | 'latest'>(initialMode);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState('All');
  const [skins, setSkins] = useState<SkinMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'trending' | 'recent' | 'downloads'>('popular');

  const [playerUsername, setPlayerUsername] = useState('');
  const [isSearchingPlayer, setIsSearchingPlayer] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [foundPlayer, setFoundPlayer] = useState<MinecraftPlayerProfile | null>(null);
  const [featuredPlayers, setFeaturedPlayers] = useState<MinecraftPlayerProfile[]>([]);
  const [newCatInput, setNewCatInput] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  useEffect(() => {
    setActiveMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    setCategories(skinService.getCategories());
  }, []);

  useEffect(() => {
    const loadSkins = async () => {
      setLoading(true);
      const effectiveSort = activeMode === 'trending' ? 'trending' : activeMode === 'latest' ? 'recent' : sortBy;
      const data = await skinService.getPublicSkins(category, effectiveSort, search);
      setSkins(data);
      setLoading(false);
    };
    loadSkins();
  }, [category, sortBy, search, activeMode]);

  useEffect(() => {
    const loadFeatured = async () => {
      const list: MinecraftPlayerProfile[] = [];
      for (const name of FEATURED_REAL_PLAYERS) {
        const p = await MinecraftApiService.getPlayerProfile(name);
        if (p) list.push(p);
      }
      setFeaturedPlayers(list);
    };
    loadFeatured();
  }, []);

  const handleSearchPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerUsername.trim()) return;

    setIsSearchingPlayer(true);
    setPlayerError(null);
    setFoundPlayer(null);

    const profile = await MinecraftApiService.getPlayerProfile(playerUsername.trim());
    setIsSearchingPlayer(false);

    if (profile) {
      setFoundPlayer(profile);
    } else {
      setPlayerError(t('players.notFound'));
    }
  };

  const handlePlayerToSkin = (player: MinecraftPlayerProfile) => {
    const skinMeta: SkinMetadata = {
      id: `mc_${player.uuid}`,
      title: `${player.username}'s Skin`,
      description: `Official Minecraft Java Edition skin of ${player.username}.`,
      authorUid: 'mojang',
      authorName: player.username,
      modelType: player.modelType,
      category: 'Java Player',
      tags: ['minecraft', 'java', player.username.toLowerCase()],
      likesCount: 120,
      downloadsCount: 500,
      viewsCount: 1400,
      ratingAverage: 5.0,
      ratingCount: 24,
      base64Png: player.base64Png || player.skinUrl,
      previewUrl: player.base64Png || player.skinUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    onSelectSkin(skinMeta);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    const updated = skinService.addCustomCategory(newCatInput.trim());
    setCategories(updated);
    setCategory(newCatInput.trim());
    setNewCatInput('');
    setShowAddCat(false);
  };

  return (
    <div className="gallery-container">
      <div className="gallery-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="gallery-hero-title">
              {activeMode === 'players'
                ? t('players.title')
                : activeMode === 'trending'
                ? t('nav.trending')
                : t('gallery.title')}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '13px', maxWidth: '600px' }}>
              {activeMode === 'players'
                ? t('players.subtitle')
                : t('gallery.subtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className={`mc-btn-secondary ${activeMode === 'community' ? 'active' : ''}`}
              onClick={() => setActiveMode('community')}
            >
              🌐 {t('nav.gallery')}
            </button>
            <button
              className={`mc-btn-secondary ${activeMode === 'players' ? 'active' : ''}`}
              onClick={() => setActiveMode('players')}
            >
              👤 {t('nav.players')}
            </button>
            <button
              className={`mc-btn-secondary ${activeMode === 'trending' ? 'active' : ''}`}
              onClick={() => setActiveMode('trending')}
            >
              🔥 {t('nav.trending')}
            </button>
          </div>
        </div>
      </div>

      {activeMode === 'players' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <form onSubmit={handleSearchPlayer} style={{ display: 'flex', gap: '8px', maxWidth: '500px' }}>
            <input
              type="text"
              placeholder={t('players.searchPlaceholder')}
              value={playerUsername}
              onChange={(e) => setPlayerUsername(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="mc-btn-primary" disabled={isSearchingPlayer}>
              {isSearchingPlayer ? 'Searching...' : t('players.searchBtn')}
            </button>
          </form>

          {playerError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>
              {playerError}
            </div>
          )}

          {foundPlayer && (
            <div className="panel-box" style={{ padding: '16px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <img
                src={foundPlayer.base64Png || foundPlayer.skinUrl}
                alt={foundPlayer.username}
                style={{ width: '80px', height: '80px', imageRendering: 'pixelated' }}
              />
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{foundPlayer.username}</h2>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  Model: <span style={{ textTransform: 'capitalize' }}>{foundPlayer.modelType}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button className="mc-btn-primary" onClick={() => handlePlayerToSkin(foundPlayer)}>
                    View Skin
                  </button>
                  <button
                    className="mc-btn-secondary"
                    onClick={() => {
                      const skinMeta: SkinMetadata = {
                        id: `mc_${foundPlayer.uuid}`,
                        title: `${foundPlayer.username}'s Skin`,
                        description: `Official skin of ${foundPlayer.username}.`,
                        authorUid: 'mojang',
                        authorName: foundPlayer.username,
                        modelType: foundPlayer.modelType,
                        category: 'Java Player',
                        tags: ['minecraft'],
                        likesCount: 0,
                        downloadsCount: 0,
                        viewsCount: 0,
                        ratingAverage: 5.0,
                        ratingCount: 1,
                        base64Png: foundPlayer.base64Png || foundPlayer.skinUrl,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                      };
                      onEditSkin(skinMeta);
                    }}
                  >
                    Edit in Studio
                  </button>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
              {t('players.featured')}
            </h3>
            <div className="skins-grid">
              {featuredPlayers.map((p) => (
                <div key={p.uuid} className="skin-card" onClick={() => handlePlayerToSkin(p)}>
                  <div className="skin-card-preview">
                    <img src={p.base64Png || p.skinUrl} alt={p.username} className="skin-card-img" />
                  </div>
                  <div className="skin-card-body">
                    <div className="skin-card-title">{p.username}</div>
                    <div style={{ fontSize: '11px', color: '#38bdf8' }}>Official Java Skin</div>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                      <button
                        className="mc-btn-primary"
                        style={{ flex: 1, padding: '4px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayerToSkin(p);
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="gallery-filters-row">
            <input
              type="search"
              className="search-input-box"
              placeholder={t('gallery.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="category-pills">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`cat-pill ${category === c ? 'active' : ''}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}

              {showAddCat ? (
                <form onSubmit={handleAddCategory} style={{ display: 'inline-flex', gap: '4px' }}>
                  <input
                    type="text"
                    placeholder="New Genre..."
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    style={{ padding: '2px 8px', fontSize: '11px', width: '110px' }}
                  />
                  <button type="submit" className="mc-btn-primary" style={{ padding: '2px 8px', fontSize: '11px' }}>
                    +
                  </button>
                  <button type="button" className="tool-btn-sm" style={{ padding: '2px 6px' }} onClick={() => setShowAddCat(false)}>
                    ✕
                  </button>
                </form>
              ) : (
                <button
                  className="cat-pill"
                  style={{ background: 'rgba(91, 163, 55, 0.15)', color: '#86efac', border: '1px dashed #5ba337' }}
                  onClick={() => setShowAddCat(true)}
                  title="Add Custom Category / Genre"
                >
                  + Add Genre
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{ padding: '6px 10px', fontSize: '12px' }}
            >
              <option value="popular">{t('gallery.popular')}</option>
              <option value="recent">{t('gallery.recent')}</option>
              <option value="downloads">{t('gallery.downloads')}</option>
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
              Loading skins...
            </div>
          ) : skins.length === 0 ? (
            <div className="empty-state-box">
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📦</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                {t('gallery.noSkins')}
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                Try searching for a different term or select another category above.
              </p>
            </div>
          ) : (
            <div className="skins-grid">
              {skins.map((skin) => (
                <div key={skin.id} className="skin-card" onClick={() => onSelectSkin(skin)}>
                  <div className="skin-card-preview">
                    <img src={skin.base64Png} alt={skin.title} className="skin-card-img" />
                  </div>
                  <div className="skin-card-body">
                    <div className="skin-card-title">{skin.title}</div>
                    <div style={{ fontSize: '11px', color: '#38bdf8' }}>by {skin.authorName}</div>
                    <div className="skin-card-meta" style={{ marginTop: '4px' }}>
                      <span style={{ color: '#e5a93b' }}>★ {skin.ratingAverage || 5.0}</span>
                      <span>❤️ {skin.likesCount}</span>
                      <span>📥 {skin.downloadsCount}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                      <button
                        className="mc-btn-primary"
                        style={{ flex: 1, padding: '4px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSkin(skin);
                        }}
                      >
                        View
                      </button>
                      <button
                        className="mc-btn-secondary"
                        style={{ padding: '4px 8px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSkin(skin);
                        }}
                        title="Edit / Remix"
                      >
                        🎨
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
