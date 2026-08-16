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
  const [sortBy, setSortBy] = useState<'popular' | 'trending' | 'recent' | 'downloads'>('recent');

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
      likesCount: 0,
      downloadsCount: 0,
      viewsCount: 0,
      ratingAverage: 0,
      ratingCount: 0,
      base64Png: player.base64Png || player.skinUrl,
      previewUrl: player.base64Png || player.skinUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    onSelectSkin(skinMeta);
  };

  const handleAddCustomGenre = () => {
    if (!newCatInput.trim()) return;
    const updated = skinService.addCustomCategory(newCatInput);
    setCategories(updated);
    setCategory(newCatInput.trim());
    setNewCatInput('');
    setShowAddCat(false);
  };

  return (
    <div className="gallery-container">
      <div className="gallery-mode-switch-bar">
        <button
          className={`gallery-mode-pill ${activeMode === 'community' ? 'active' : ''}`}
          onClick={() => setActiveMode('community')}
        >
          🌐 {t('nav.gallery')}
        </button>
        <button
          className={`gallery-mode-pill ${activeMode === 'players' ? 'active' : ''}`}
          onClick={() => setActiveMode('players')}
        >
          👤 {t('nav.players')}
        </button>
        <button
          className={`gallery-mode-pill ${activeMode === 'trending' ? 'active' : ''}`}
          onClick={() => setActiveMode('trending')}
        >
          🔥 {t('nav.trending')}
        </button>
        <button
          className={`gallery-mode-pill ${activeMode === 'latest' ? 'active' : ''}`}
          onClick={() => setActiveMode('latest')}
        >
          ✨ {t('gallery.newest')}
        </button>
      </div>

      {activeMode === 'players' ? (
        <div className="player-search-section">
          <div className="gallery-hero">
            <h1 className="gallery-hero-title">{t('players.title')}</h1>
            <p className="gallery-hero-desc">{t('players.subtitle')}</p>
          </div>

          <form onSubmit={handleSearchPlayer} className="player-search-form">
            <input
              type="text"
              className="player-search-input"
              placeholder={t('players.searchPlaceholder')}
              value={playerUsername}
              onChange={(e) => setPlayerUsername(e.target.value)}
            />
            <button type="submit" className="mc-btn-primary" disabled={isSearchingPlayer}>
              {isSearchingPlayer ? t('players.searching') : '🔍 ' + (lang === 'ru' ? 'Найти' : 'Search')}
            </button>
          </form>

          {playerError && (
            <div className="player-error-box">
              ⚠️ {playerError}
            </div>
          )}

          {foundPlayer && (
            <div className="found-player-card">
              <div className="found-player-preview">
                <img
                  src={foundPlayer.base64Png || foundPlayer.skinUrl}
                  alt={foundPlayer.username}
                  className="found-player-img"
                />
              </div>
              <div className="found-player-info">
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  {foundPlayer.username}
                </h3>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  Model: <span style={{ color: '#38bdf8' }}>{foundPlayer.modelType.toUpperCase()}</span> • UUID: {foundPlayer.uuid.slice(0, 8)}...
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button className="mc-btn-primary" onClick={() => handlePlayerToSkin(foundPlayer)}>
                    👁️ 3D View & Details
                  </button>
                  <button
                    className="mc-btn-secondary"
                    onClick={() => {
                      const skinMeta: SkinMetadata = {
                        id: `mc_${foundPlayer.uuid}`,
                        title: `${foundPlayer.username}'s Skin`,
                        description: `Official Minecraft Java skin of ${foundPlayer.username}.`,
                        authorUid: 'mojang',
                        authorName: foundPlayer.username,
                        modelType: foundPlayer.modelType,
                        category: 'Java Player',
                        tags: ['minecraft', 'java', foundPlayer.username.toLowerCase()],
                        likesCount: 0,
                        downloadsCount: 0,
                        viewsCount: 0,
                        ratingAverage: 0,
                        ratingCount: 0,
                        base64Png: foundPlayer.base64Png || foundPlayer.skinUrl,
                        previewUrl: foundPlayer.base64Png || foundPlayer.skinUrl,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                      };
                      onEditSkin(skinMeta);
                    }}
                  >
                    🎨 Edit / Remix
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '30px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#cbd5e1', marginBottom: '12px', textTransform: 'uppercase' }}>
              🌟 Popular Minecraft Creators & Players
            </h3>
            <div className="featured-players-grid">
              {featuredPlayers.map((p) => (
                <div key={p.uuid} className="featured-player-pill" onClick={() => handlePlayerToSkin(p)}>
                  <img
                    src={`https://mc-heads.net/avatar/${p.username}/32`}
                    alt={p.username}
                    className="player-avatar-sm"
                  />
                  <span>{p.username}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="gallery-hero">
            <h1 className="gallery-hero-title">
              {activeMode === 'trending' ? '🔥 TRENDING SKINS' : activeMode === 'latest' ? '✨ NEW RELEASES' : t('gallery.title')}
            </h1>
            <p className="gallery-hero-desc">{t('gallery.subtitle')}</p>
          </div>

          <div className="gallery-search-bar">
            <input
              type="text"
              className="gallery-search-input"
              placeholder={t('gallery.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="gallery-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="recent">{t('gallery.newest')}</option>
              <option value="popular">{t('gallery.popular')}</option>
              <option value="trending">{t('gallery.trending')}</option>
              <option value="downloads">{t('gallery.downloads')}</option>
            </select>
          </div>

          <div className="categories-filter-row">
            {categories.map((c) => (
              <button
                key={c}
                className={`category-pill ${category.toLowerCase() === c.toLowerCase() ? 'active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
            <button
              className="category-pill add-cat-btn"
              onClick={() => setShowAddCat(!showAddCat)}
              title="Add Custom Category / Genre"
            >
              + Add Genre
            </button>
          </div>

          {showAddCat && (
            <div className="add-category-box">
              <input
                type="text"
                placeholder="Enter custom genre name (e.g. Cyber, Steampunk, Horror)..."
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="mc-btn-primary" onClick={handleAddCustomGenre}>
                ✓ Save Genre
              </button>
              <button className="tool-btn-sm" onClick={() => setShowAddCat(false)}>
                ✕
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
              Loading skins...
            </div>
          ) : skins.length === 0 ? (
            <div className="empty-state-box">
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎨</div>
              <p style={{ fontSize: '14px', color: '#f1f5f9', fontWeight: 600, marginBottom: '4px' }}>
                Пока здесь нет опубликованных работ
              </p>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
                Вы можете стать первым автором, создав скин в 3D-редакторе!
              </p>
              <button className="mc-btn-primary" onClick={() => (window as any).creamskin_nav_editor && (window as any).creamskin_nav_editor()}>
                {t('gallery.createFirst')}
              </button>
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
                    <img src={skin.base64Png} alt={skin.title} className="skin-card-img" />
                    <span className="skin-card-model-badge">{skin.modelType.toUpperCase()}</span>
                  </div>

                  <div className="skin-card-body">
                    <div className="skin-card-title">{skin.title}</div>
                    <div style={{ fontSize: '11px', color: '#38bdf8' }}>by {skin.authorName}</div>

                    <div className="skin-card-meta">
                      <span>❤️ {skin.likesCount}</span>
                      <span>★ {skin.ratingAverage > 0 ? skin.ratingAverage : '—'}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                      <button
                        className="mc-btn-primary"
                        style={{ flex: 1, padding: '5px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSkin(skin);
                        }}
                      >
                        🎨 Remix / Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
