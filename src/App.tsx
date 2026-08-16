import React, { useState, useMemo } from 'react';
import { HistoryManager } from './skin-studio/engine/HistoryManager';
import { ModelType, SkinMetadata, ReportItem } from './skin-studio/types';
import { StudioNavbar } from './skin-studio/ui/StudioNavbar';
import { EditorStudio } from './skin-studio/components/EditorStudio';
import { GalleryView } from './skin-studio/components/GalleryView';
import { SkinDetailModal } from './skin-studio/components/SkinDetailModal';
import { PublishModal } from './skin-studio/components/PublishModal';
import { ProfileView } from './skin-studio/components/ProfileView';
import { ServerIntegrationGuide } from './skin-studio/components/ServerIntegrationGuide';
import { AuthModal } from './skin-studio/components/AuthModal';
import { DirectMessagesModal } from './skin-studio/components/DirectMessagesModal';
import { ReportModal } from './skin-studio/components/ReportModal';
import { SKIN_TEMPLATES } from './skin-studio/templates/SkinTemplates';
import './skin-studio/ui/SkinStudio.css';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'gallery' | 'trending' | 'latest' | 'templates' | 'profile' | 'plugin'>('editor');
  const [modelType, setModelType] = useState<ModelType>('classic');

  // Core Skin Buffer & Undo/Redo Engine
  const buffer = useMemo(() => {
    const template = SKIN_TEMPLATES.find((t) => t.id === 'classic_steve') || SKIN_TEMPLATES[0];
    return template.generate();
  }, []);

  const history = useMemo(() => new HistoryManager(), []);

  // Modals & Popups State
  const [selectedSkin, setSelectedSkin] = useState<SkinMetadata | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDMsModal, setShowDMsModal] = useState(false);
  const [dmRecipient, setDmRecipient] = useState<{ uid: string; name: string } | null>(null);
  const [reportTarget, setReportTarget] = useState<{ type: ReportItem['targetType']; id: string } | null>(null);

  const handleEditSkin = async (skin: SkinMetadata) => {
    history.pushSnapshot(buffer);
    await buffer.loadFromBase64PNG(skin.base64Png);
    setModelType(skin.modelType);
    setSelectedSkin(null);
    setActiveTab('editor');
  };

  const handleLoadTemplateAndEdit = (templateId: string) => {
    const t = SKIN_TEMPLATES.find((x) => x.id === templateId);
    if (!t) return;
    history.pushSnapshot(buffer);
    const newBuf = t.generate();
    buffer.copyFrom(newBuf);
    setModelType(t.modelType);
    setActiveTab('editor');
  };

  const handleOpenDMsWithUser = (uid: string, name: string) => {
    setDmRecipient({ uid, name });
    setShowDMsModal(true);
  };

  return (
    <div className="studio-app">
      {/* Top Navbar */}
      <StudioNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenPublish={() => setShowPublishModal(true)}
        onOpenDMs={() => {
          setDmRecipient(null);
          setShowDMsModal(true);
        }}
      />

      {/* Main Tab Views */}
      {activeTab === 'editor' && (
        <EditorStudio
          buffer={buffer}
          history={history}
          modelType={modelType}
          onModelTypeChange={setModelType}
          onOpenPublish={() => setShowPublishModal(true)}
        />
      )}

      {activeTab === 'gallery' && (
        <GalleryView
          initialSortBy="popular"
          onSelectSkin={(skin) => setSelectedSkin(skin)}
          onEditSkin={handleEditSkin}
        />
      )}

      {activeTab === 'trending' && (
        <GalleryView
          initialSortBy="trending"
          onSelectSkin={(skin) => setSelectedSkin(skin)}
          onEditSkin={handleEditSkin}
        />
      )}

      {activeTab === 'latest' && (
        <GalleryView
          initialSortBy="recent"
          onSelectSkin={(skin) => setSelectedSkin(skin)}
          onEditSkin={handleEditSkin}
        />
      )}

      {activeTab === 'templates' && (
        <div className="gallery-container">
          <div className="gallery-hero">
            <h1 className="gallery-hero-title">STARTER TEMPLATES</h1>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              Choose a starter skin and customize every pixel in the CreamSkin Editor.
            </p>
          </div>

          <div className="skins-grid">
            {SKIN_TEMPLATES.map((t) => {
              const previewBuffer = t.generate();
              const base64 = previewBuffer.toBase64PNG();
              return (
                <div
                  key={t.id}
                  className="skin-card"
                  onClick={() => handleLoadTemplateAndEdit(t.id)}
                >
                  <div className="skin-card-preview">
                    <img src={base64} alt={t.name} className="skin-card-img" />
                  </div>
                  <div className="skin-card-body">
                    <div className="skin-card-title">{t.name}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.description}</div>
                    <button
                      className="tool-btn-sm"
                      style={{ marginTop: '8px', background: '#10b981', color: '#fff' }}
                      onClick={() => handleLoadTemplateAndEdit(t.id)}
                    >
                      🎨 Start Editing
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'plugin' && <ServerIntegrationGuide />}

      {activeTab === 'profile' && (
        <ProfileView
          onSelectSkin={(skin) => setSelectedSkin(skin)}
          onEditSkin={handleEditSkin}
        />
      )}

      {/* Modals */}
      {selectedSkin && (
        <SkinDetailModal
          skin={selectedSkin}
          onClose={() => setSelectedSkin(null)}
          onEditInStudio={handleEditSkin}
          onOpenDMsWithAuthor={handleOpenDMsWithUser}
          onOpenReport={(type, id) => setReportTarget({ type, id })}
        />
      )}

      {showPublishModal && (
        <PublishModal
          buffer={buffer}
          modelType={modelType}
          onClose={() => setShowPublishModal(false)}
          onSuccess={(skinId) => {
            setShowPublishModal(false);
            setActiveTab('gallery');
            alert(`🎉 Skin published successfully to CreamSkin community! ID: ${skinId}`);
          }}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}

      {showDMsModal && (
        <DirectMessagesModal
          initialRecipientUid={dmRecipient?.uid || 'official'}
          initialRecipientName={dmRecipient?.name || 'CreamSkin Team'}
          onClose={() => setShowDMsModal(false)}
        />
      )}

      {reportTarget && (
        <ReportModal
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
};
