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

const CATEGORIES = ['All', 'Default', 'Fantasy', 'Sci-Fi', 'Medieval', 'Anime', 'Cute', 'Mobs'];

export const GalleryView: React.FC<GalleryViewProps> = ({
  lang,
  initialMode = 'community',
  onSelectSkin,
  onEditSkin,
}) => {
  const t = (k: string) => getTranslation(lang, k);

  const [activeMode, setActiveMode] = useState<'community' | 'players' | 'trending' | 'latest'>(initialMode);
  const [skins, setSkins] = useState<SkinMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'trending' | 'recent' | 'downloads'>('popular');

  // Minecraft Player Search
  const [playerUsername, setPlayerUsername] = useState('');
  const [isSearchingPlayer, setIsSearchingPlayer] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [foundPlayer, setFoundPlayer] = useState<MinecraftPlayerProfile | null>(null);
  const [featuredPlayers, setFeaturedPlayers] = useState<MinecraftPlayerProfile[]>([]);

  useEffect(() => {
    setActiveMode(initialMode);
  }, [initialMode]);

  // Load Community Skins
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

  // Load Featured Real Minecraft Players on mount
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
      likesCount: 100,
      downloadsCount: 500,
      viewsCount: 1200,
      ratingAverage: 5.0,
      ratingCount: 20,
      base64Png: player.base64Png || player.skinUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    onSelectSkin(skinMeta);
  };

  return (
    <div className="gallery-container">
      {/* Header */}
      <div className="gallery-hero">
        <h1 className="gallery-hero-title">
          {activeMode === 'players'
            ? t('players.title')
            : activeMode === 'trending'
            ? t('gallery.trending')
            : activeMode === 'latest'
            ? t('gallery.newest')
            : t('gallery.title')}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '13px' }}>
          {activeMode === 'players' ? t('players.subtitle') : t('gallery.subtitle')}
        </p>
      </div>

      {/* Mode Sub-Tabs (Community vs Real Minecraft Players) */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        <button
          className={`tool-btn-sm ${activeMode === 'community' ? 'active' : ''}`}
          onClick={() => setActiveMode('community')}
        >
          🌐 {t('nav.gallery')}
        </button>
        <button
          className={`tool-btn-sm ${activeMode === 'players' ? 'active' : ''}`}
          onClick={() => setActiveMode('players')}
        >
          👤 {t('nav.players')}
        </button>
        <button
          className={`tool-btn-sm ${activeMode === 'trending' ? 'active' : ''}`}
          onClick={() => setActiveMode('trending')}
        >
          🔥 {t('gallery.trending')}
        </button>
        <button
          className={`tool-btn-sm ${activeMode === 'latest' ? 'active' : ''}`}
          onClick={() => setActiveMode('latest')}
        >
          ⚡ {t('gallery.newest')}
        </button>
      </div>

      {/* VIEW: REAL MINECRAFT PLAYERS SEARCH */}
      {activeMode === 'players' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Player Search Form */}
          <form onSubmit={handleSearchPlayer} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="search-input-box"
              style={{ flex: 1 }}
              placeholder={t('players.searchPlaceholder')}
              value={playerUsername}
              onChange={(e) => setPlayerUsername(e.target.value)}
            />
            <button
              type="submit"
              disabled={isSearchingPlayer}
              className="tool-btn-sm"
              style={{ background: '#2563eb', color: '#fff', padding: '8px 16px' }}
            >
              {isSearchingPlayer ? t('players.searching') : 'Search Player'}
            </button>
          </form>

          {playerError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>
              {playerError}
            </div>
          )}

          {/* Searched Player Result */}
          {foundPlayer && (
            <div className="panel-box" style={{ padding: '16px', background: '#121722', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <img
                src={foundPlayer.base64Png || foundPlayer.skinUrl}
                alt={foundPlayer.username}
                style={{ width: '90px', height: '90px', imageRendering: 'pixelated' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{foundPlayer.username}</h3>
                  <span style={{ fontSize: '10px', background: '#2563eb', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                    Minecraft Java Profile
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  UUID: {foundPlayer.uuid} • Model: {foundPlayer.modelType}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button
                    className="tool-btn-sm"
                    style={{ background: '#10b981', color: '#fff' }}
                    onClick={() => handlePlayerToSkin(foundPlayer)}
                  >
                    🔍 Inspect in 3D
                  </button>
                  <button
                    className="tool-btn-sm"
                    style={{ background: '#2563eb', color: '#fff' }}
                    onClick={() => {
                      const skinMeta: SkinMetadata = {
                        id: `mc_${foundPlayer.uuid}`,
                        title: `${foundPlayer.username}'s Skin`,
                        description: `Official Minecraft Java Edition skin of ${foundPlayer.username}.`,
                        authorUid: 'mojang',
                        authorName: foundPlayer.username,
                        modelType: foundPlayer.modelType,
                        category: 'Java Player',
                        tags: ['minecraft', 'java'],
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
                    🎨 Edit in Studio
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Featured Minecraft Creators Feed */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>
              ⭐ Featured Minecraft Java Creators
            </h3>
            <div className="skins-grid">
              {featuredPlayers.map((p) => (
                <div
                  key={p.uuid}
                  className="skin-card"
                  onClick={() => handlePlayerToSkin(p)}
                >
                  <div className="skin-card-preview">
                    <img
                      src={p.base64Png || p.skinUrl}
                      alt={p.username}
                      className="skin-card-img"
                    />
                  </div>
                  <div className="skin-card-body">
                    <div className="skin-card-title">{p.username}</div>
                    <div style={{ fontSize: '11px', color: '#38bdf8' }}>Minecraft Java Player</div>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                      <button
                        className="tool-btn-sm"
                        style={{ flex: 1, background: '#2563eb', color: '#fff' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayerToSkin(p);
                        }}
                      >
                        Inspect 3D
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* VIEW: COMMUNITY SKINS */
        <div>
          {/* Filters Row */}
          <div className="gallery-filters-row">
            <input
              type="text"
              className="search-input-box"
              placeholder={t('gallery.search')}
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
              style={{ padding: '6px 10px' }}
            >
              <option value="popular">{t('gallery.popular')}</option>
              <option value="trending">{t('gallery.trending')}</option>
              <option value="recent">{t('gallery.newest')}</option>
              <option value="downloads">{t('gallery.downloads')}</option>
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              Loading skins...
            </div>
          ) : skins.length === 0 ? (
            <div className="empty-state-box">
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎨</div>
              <p style={{ fontSize: '14px', marginBottom: '12px' }}>{t('gallery.empty')}</p>
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
      )}
    </div>
  );
};
