import React, { useState, useEffect } from 'react';
import { skinService } from '../firebase/SkinService';
import { SkinMetadata, ReportItem } from '../types';
import { collection, getDocs, deleteDoc, doc, limit, query } from 'firebase/firestore';
import { firestore } from '../firebase/FirebaseConfig';

export const ADMIN_EMAIL = 'PlombaIGuess@gmail.com';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const user = skinService.currentUser;
  const userProfile = skinService.userProfile;
  const isSuperAdmin =
    user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
    userProfile?.username?.toLowerCase() === 'plombaiguess' ||
    user?.email?.toLowerCase().startsWith('plombaiguess');

  const [activeTab, setActiveTab] = useState<'reports' | 'skins' | 'contests'>('reports');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [skins, setSkins] = useState<SkinMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Reports & Skins
  useEffect(() => {
    if (!isSuperAdmin) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Load reports
        const repCol = collection(firestore, 'reports');
        const repSnap = await getDocs(query(repCol, limit(50)));
        const repList: ReportItem[] = [];
        repSnap.forEach((d) => repList.push(d.data() as ReportItem));
        setReports(repList);
      } catch {}

      // Load skins
      const allSkins = await skinService.getPublicSkins('All', 'recent');
      setSkins(allSkins);
      setLoading(false);
    };

    loadData();
  }, [isSuperAdmin]);

  const handleDeleteSkin = async (skinId: string) => {
    if (!confirm(`Are you sure you want to permanently delete skin ID: ${skinId}?`)) return;
    try {
      await deleteDoc(doc(firestore, 'skins', skinId));
      setSkins((list) => list.filter((s) => s.id !== skinId));
      alert('Skin successfully deleted by Admin.');
    } catch {
      alert('Could not delete skin from database.');
    }
  };

  const handleDismissReport = async (repId: string) => {
    try {
      await deleteDoc(doc(firestore, 'reports', repId));
      setReports((list) => list.filter((r) => r.id !== repId));
    } catch {
      setReports((list) => list.filter((r) => r.id !== repId));
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-dialog" style={{ maxWidth: '420px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🛡️</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444' }}>Admin Access Restricted</h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
            Only the head administrator ({ADMIN_EMAIL}) has access to the moderation panel.
          </p>
          <button className="mc-btn-primary" style={{ marginTop: '14px' }} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '850px', height: '620px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="mc-badge gold">👑 SUPER ADMIN</span>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>CreamSkin Master Control</h2>
          </div>
          <button className="tool-btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className={`mc-btn-secondary ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            🚩 Reports ({reports.length})
          </button>
          <button
            className={`mc-btn-secondary ${activeTab === 'skins' ? 'active' : ''}`}
            onClick={() => setActiveTab('skins')}
          >
            🎨 Manage Skins ({skins.length})
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading Admin Console...</div>
          ) : activeTab === 'reports' ? (
            <div>
              {reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#10b981' }}>
                  ✓ No pending moderation reports. The community is clean!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {reports.map((r) => (
                    <div key={r.id} className="panel-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span className="mc-badge red">{r.reason.toUpperCase()}</span>
                          <strong style={{ fontSize: '13px', color: '#fff' }}>{r.targetType.toUpperCase()}: {r.targetId}</strong>
                        </div>
                        <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
                          {r.details || 'No additional details provided by reporter.'}
                        </p>
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                          Reporter: {r.reporterUid} • {new Date(r.timestamp).toLocaleString()}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        {r.targetType === 'skin' && (
                          <button
                            className="mc-btn-danger"
                            onClick={() => handleDeleteSkin(r.targetId)}
                          >
                            🗑️ Delete Skin
                          </button>
                        )}
                        <button
                          className="mc-btn-secondary"
                          onClick={() => handleDismissReport(r.id)}
                        >
                          ✓ Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {skins.map((s) => (
                <div key={s.id} className="panel-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <img src={s.base64Png} alt={s.title} style={{ width: '36px', height: '36px', imageRendering: 'pixelated' }} />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#fff' }}>{s.title}</strong>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        by {s.authorName} ({s.authorUid}) • ❤️ {s.likesCount} • 📥 {s.downloadsCount}
                      </div>
                    </div>
                  </div>

                  <button
                    className="mc-btn-danger"
                    onClick={() => handleDeleteSkin(s.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
