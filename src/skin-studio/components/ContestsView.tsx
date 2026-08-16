import React, { useState, useEffect } from 'react';
import { SkinMetadata } from '../types';
import { skinService } from '../firebase/SkinService';
import { LanguageCode } from '../i18n/translations';

interface ContestItem {
  id: string;
  title: string;
  description: string;
  theme: string;
  deadline: string;
  prize: string;
  category: string;
}

const DEFAULT_CONTESTS: ContestItem[] = [
  {
    id: 'contest_medieval',
    title: '🏰 Medieval Champions Contest',
    description: 'Design the most epic medieval knight, royal monarch, or mysterious wizard skin! Top voted skins receive golden badges.',
    theme: 'Medieval / Fantasy',
    deadline: '7 days remaining',
    prize: '👑 Golden Creator Crown & Featured Spotlight',
    category: 'Medieval',
  },
  {
    id: 'contest_cyber',
    title: '⚡ Neon Cyberpunk 2077',
    description: 'Create futuristic cyber warriors, holographic androids, or neon hackers.',
    theme: 'Sci-Fi / Cyberpunk',
    deadline: '14 days remaining',
    prize: '💎 Diamond Badge & Global Community Highlight',
    category: 'Sci-Fi',
  },
];

interface ContestsViewProps {
  lang: LanguageCode;
  onSelectSkin: (skin: SkinMetadata) => void;
  onEditSkin: (skin: SkinMetadata) => void;
  onOpenCreateSkin: () => void;
}

export const ContestsView: React.FC<ContestsViewProps> = ({
  onSelectSkin,
  onEditSkin,
  onOpenCreateSkin,
}) => {
  const [activeContestId, setActiveContestId] = useState<string>(DEFAULT_CONTESTS[0].id);
  const [skins, setSkins] = useState<SkinMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  const activeContest = DEFAULT_CONTESTS.find((c) => c.id === activeContestId) || DEFAULT_CONTESTS[0];

  useEffect(() => {
    const loadContestSkins = async () => {
      setLoading(true);
      const allSkins = await skinService.getPublicSkins('All', 'popular');
      // Filter skins related to contest theme or sort by likes
      const contestSkins = allSkins.filter(
        (s) =>
          s.category.toLowerCase() === activeContest.category.toLowerCase() ||
          s.tags.some((t) => t.toLowerCase().includes(activeContest.category.toLowerCase()))
      );

      // If no specific category skins, show top liked skins
      setSkins(contestSkins.length > 0 ? contestSkins : allSkins.slice(0, 12));
      setLoading(false);
    };

    loadContestSkins();
  }, [activeContestId, activeContest.category]);

  return (
    <div className="gallery-container">
      {/* Contest Header Banner */}
      <div className="mc-contest-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
              <span className="mc-badge gold">🏆 ACTIVE CONTEST</span>
              <span className="mc-badge cyan">⏳ {activeContest.deadline}</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fbb034', marginBottom: '6px' }}>
              {activeContest.title}
            </h1>
            <p style={{ fontSize: '13px', color: '#cbd5e1', maxWidth: '650px', lineHeight: '1.5' }}>
              {activeContest.description}
            </p>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#4ade80', fontWeight: 600 }}>
              🎁 Prize: {activeContest.prize}
            </div>
          </div>

          <button
            className="mc-btn-primary"
            style={{ padding: '10px 20px', fontSize: '13px' }}
            onClick={onOpenCreateSkin}
          >
            🎨 Submit Your Skin to Contest
          </button>
        </div>

        {/* Contest Switcher Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
          {DEFAULT_CONTESTS.map((c) => (
            <button
              key={c.id}
              className={`mc-btn-secondary ${activeContestId === c.id ? 'active' : ''}`}
              onClick={() => setActiveContestId(c.id)}
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Grid (Sorted by Likes & Ratings) */}
      <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
          🏅 Live Contest Leaderboard (Ranked by Community Likes)
        </h2>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
          {skins.length} entries submitted
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          Loading contest entries...
        </div>
      ) : skins.length === 0 ? (
        <div className="empty-state-box">
          <div style={{ fontSize: '30px', marginBottom: '8px' }}>🏆</div>
          <p style={{ fontSize: '14px', marginBottom: '12px' }}>No entries submitted for this contest yet!</p>
          <button className="mc-btn-primary" onClick={onOpenCreateSkin}>
            Be the First to Submit
          </button>
        </div>
      ) : (
        <div className="skins-grid">
          {skins.map((skin, idx) => {
            const rankBadge = idx === 0 ? '🥇 1st Place' : idx === 1 ? '🥈 2nd Place' : idx === 2 ? '🥉 3rd Place' : `#${idx + 1}`;
            return (
              <div
                key={skin.id}
                className="skin-card"
                onClick={() => onSelectSkin(skin)}
                style={{
                  border: idx === 0 ? '1px solid #fbb034' : idx === 1 ? '1px solid #94a3b8' : idx === 2 ? '1px solid #d97706' : undefined,
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  background: idx === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  zIndex: 2,
                }}>
                  {rankBadge}
                </div>

                <div className="skin-card-preview">
                  <img src={skin.base64Png} alt={skin.title} className="skin-card-img" />
                </div>

                <div className="skin-card-body">
                  <div className="skin-card-title">{skin.title}</div>
                  <div style={{ fontSize: '11px', color: '#38bdf8' }}>by {skin.authorName}</div>

                  <div className="skin-card-meta" style={{ marginTop: '4px' }}>
                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>❤️ {skin.likesCount} Likes</span>
                    <span>★ {skin.ratingAverage || 5.0}</span>
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
                      Remix / Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
