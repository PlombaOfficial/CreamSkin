import React, { useState, useEffect } from 'react';
import { skinService } from '../firebase/SkinService';
import { SkinMetadata, ReportItem, DirectMessage } from '../types';
import { collection, getDocs, deleteDoc, doc, limit, query, orderBy } from 'firebase/firestore';
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

  const [activeTab, setActiveTab] = useState<'reports' | 'skins' | 'categories' | 'chat'>('reports');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [skins, setSkins] = useState<SkinMetadata[]>([]);
  const [chatMessages, setChatMessages] = useState<DirectMessage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSuperAdmin) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const repCol = collection(firestore, 'reports');
        const repSnap = await getDocs(query(repCol, limit(50)));
        const repList: ReportItem[] = [];
        repSnap.forEach((d) => repList.push(d.data() as ReportItem));
        setReports(repList);
      } catch {}

      const allSkins = await skinService.getPublicSkins('All', 'recent');
      setSkins(allSkins);

      setCategories(skinService.getCategories());

      try {
        const chatCol = collection(firestore, 'global_chat');
        const chatSnap = await getDocs(query(chatCol, orderBy('timestamp', 'desc'), limit(50)));
        const msgList: DirectMessage[] = [];
        chatSnap.forEach((d) => {
          const msg = d.data() as DirectMessage;
          msg.id = d.id;
          msgList.push(msg);
        });
        setChatMessages(msgList);
      } catch {}

      setLoading(false);
    };

    loadData();
  }, [isSuperAdmin]);

  const handleDeleteSkin = async (skinId: string) => {
    if (!confirm(`Permanently delete skin: ${skinId}?`)) return;
    await skinService.deleteSkin(skinId);
    setSkins((list) => list.filter((s) => s.id !== skinId));
  };

  const handleDismissReport = async (repId: string) => {
    try {
      await deleteDoc(doc(firestore, 'reports', repId));
      setReports((list) => list.filter((r) => r.id !== repId));
    } catch {
      setReports((list) => list.filter((r) => r.id !== repId));
    }
  };

  const handleDeleteChatMessage = async (msgId: string) => {
    await skinService.deleteGlobalChatMessage(msgId);
    setChatMessages((list) => list.filter((m) => m.id !== msgId));
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const updated = skinService.addCustomCategory(newCatName.trim());
    setCategories(updated);
    setNewCatName('');
  };

  const handleDeleteCategory = (cat: string) => {
    const updated = skinService.deleteCustomCategory(cat);
    setCategories(updated);
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
      <div className="modal-dialog" style={{ maxWidth: '900px', height: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--cs-border-subtle)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="mc-badge gold">SUPER ADMIN</span>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>CreamSkin Master Control</h2>
          </div>
          <button className="tool-btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
            🎨 Skins ({skins.length})
          </button>
          <button
            className={`mc-btn-secondary ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            🏷️ Genres & Categories ({categories.length})
          </button>
          <button
            className={`mc-btn-secondary ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Chat Moderation ({chatMessages.length})
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading Admin Console...</div>
          ) : activeTab === 'reports' ? (
            <div>
              {reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#10b981' }}>
                  No pending moderation reports.
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
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'skins' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {skins.map((s) => (
                <div key={s.id} className="panel-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <img src={s.base64Png} alt={s.title} style={{ width: '36px', height: '36px', imageRendering: 'pixelated' }} />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#fff' }}>{s.title}</strong>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Genre: <span style={{ color: '#38bdf8' }}>{s.category}</span> • by {s.authorName} • ❤️ {s.likesCount} • 📥 {s.downloadsCount}
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
          ) : activeTab === 'categories' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Enter new genre name (e.g. Cyberpunk, Steampunk, Animals)..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="mc-btn-primary">
                  + Add Genre
                </button>
              </form>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                {categories.map((cat) => (
                  <div key={cat} className="panel-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{cat}</span>
                    {cat !== 'All' && (
                      <button
                        className="tool-btn-sm"
                        style={{ padding: '2px 6px', color: '#ef4444' }}
                        onClick={() => handleDeleteCategory(cat)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No chat messages recorded.</div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="panel-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px', color: '#38bdf8' }}>
                        <strong>{msg.senderName}</strong>
                        <span style={{ color: '#64748b' }}>({msg.senderUid})</span>
                        <span style={{ color: '#64748b' }}>{new Date(msg.timestamp).toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#f8fafc', marginTop: '2px' }}>{msg.text}</div>
                    </div>
                    <button
                      className="mc-btn-danger"
                      style={{ padding: '3px 8px', fontSize: '10px' }}
                      onClick={() => handleDeleteChatMessage(msg.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
