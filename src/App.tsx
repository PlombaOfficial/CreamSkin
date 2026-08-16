import React, { useState, useMemo, useEffect } from 'react';
import { HistoryManager } from './skin-studio/engine/HistoryManager';
import { ModelType, SkinMetadata, ReportItem } from './skin-studio/types';
import { LanguageCode } from './skin-studio/i18n/translations';
import { StudioNavbar } from './skin-studio/ui/StudioNavbar';
import { EditorStudio } from './skin-studio/components/EditorStudio';
import { GalleryView } from './skin-studio/components/GalleryView';
import { ContestsView } from './skin-studio/components/ContestsView';
import { SkinDetailModal } from './skin-studio/components/SkinDetailModal';
import { PublishModal } from './skin-studio/components/PublishModal';
import { ProfileView } from './skin-studio/components/ProfileView';
import { ServerIntegrationGuide } from './skin-studio/components/ServerIntegrationGuide';
import { AuthModal } from './skin-studio/components/AuthModal';
import { DirectMessagesModal } from './skin-studio/components/DirectMessagesModal';
import { ReportModal } from './skin-studio/components/ReportModal';
import { OnboardingModal } from './skin-studio/components/OnboardingModal';
import { AdminPanel } from './skin-studio/components/AdminPanel';
import { AvatarModal } from './skin-studio/components/AvatarModal';
import { SKIN_TEMPLATES } from './skin-studio/templates/SkinTemplates';
import './skin-studio/ui/SkinStudio.css';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'gallery' | 'players' | 'contests' | 'trending' | 'templates' | 'profile' | 'plugin'>('editor');
  const [modelType, setModelType] = useState<ModelType>('classic');
  const [lang, setLang] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('creamskin_lang');
      if (saved) return saved as LanguageCode;
    } catch {}
    return 'ru';
  });

  // Core Skin Buffer & Undo/Redo Engine
  const buffer = useMemo(() => {
    const template = SKIN_TEMPLATES.find((t) => t.id === 'classic_steve') || SKIN_TEMPLATES[0];
    return template.generate();
  }, []);

  const history = useMemo(() => new HistoryManager(), []);

  // Modals & Popups State
  const [selectedSkin, setSelectedSkin] = useState<SkinMetadata | null>(null);
  const [selectedProfileUid, setSelectedProfileUid] = useState<string | undefined>(undefined);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDMsModal, setShowDMsModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [dmRecipient, setDmRecipient] = useState<{ uid: string; name: string } | null>(null);
  const [reportTarget, setReportTarget] = useState<{ type: ReportItem['targetType']; id: string } | null>(null);

  // Check if first-time user
  useEffect(() => {
    try {
      const seen = localStorage.getItem('creamskin_tutorial_seen');
      if (!seen) {
        setShowOnboarding(true);
      }
    } catch {}
  }, []);

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

  const handleViewAuthorProfile = (authorUid: string) => {
    setSelectedSkin(null);
    setSelectedProfileUid(authorUid);
    setActiveTab('profile');
  };

  return (
    <div className="studio-app">
      {/* Top Navbar */}
      <StudioNavbar
        activeTab={activeTab}
        lang={lang}
        onTabChange={(tab) => {
          if (tab === 'profile') setSelectedProfileUid(undefined);
          setActiveTab(tab);
        }}
        onLangChange={setLang}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenPublish={() => setShowPublishModal(true)}
        onOpenDMs={() => {
          setDmRecipient(null);
          setShowDMsModal(true);
        }}
        onOpenTutorial={() => setShowOnboarding(true)}
        onOpenAdminPanel={() => setShowAdminPanel(true)}
      />

      {/* Main Tab Views */}
      {activeTab === 'editor' && (
        <EditorStudio
          buffer={buffer}
          history={history}
          modelType={modelType}
          lang={lang}
          onModelTypeChange={setModelType}
          onOpenPublish={() => setShowPublishModal(true)}
        />
      )}

      {activeTab === 'gallery' && (
        <GalleryView
          lang={lang}
          initialMode="community"
          onSelectSkin={(skin) => setSelectedSkin(skin)}
          onEditSkin={handleEditSkin}
        />
      )}

      {activeTab === 'contests' && (
        <ContestsView
          lang={lang}
          onSelectSkin={(skin) => setSelectedSkin(skin)}
          onEditSkin={handleEditSkin}
          onOpenCreateSkin={() => setActiveTab('editor')}
        />
      )}

      {activeTab === 'players' && (
        <GalleryView
          lang={lang}
          initialMode="players"
          onSelectSkin={(skin) => setSelectedSkin(skin)}
          onEditSkin={handleEditSkin}
        />
      )}

      {activeTab === 'trending' && (
        <GalleryView
          lang={lang}
          initialMode="trending"
          onSelectSkin={(skin) => setSelectedSkin(skin)}
          onEditSkin={handleEditSkin}
        />
      )}

      {activeTab === 'templates' && (
        <div className="gallery-container">
          <div className="gallery-hero">
            <h1 className="gallery-hero-title">Starter Templates</h1>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>
              Select a starter template to open directly in the CreamSkin Editor.
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
                      className="mc-btn-primary"
                      style={{ marginTop: '8px', width: '100%' }}
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
          lang={lang}
          targetUid={selectedProfileUid}
          onSelectSkin={(skin) => setSelectedSkin(skin)}
          onEditSkin={handleEditSkin}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenAvatarModal={() => setShowAvatarModal(true)}
        />
      )}

      {/* Modals */}
      {selectedSkin && (
        <SkinDetailModal
          skin={selectedSkin}
          lang={lang}
          onClose={() => setSelectedSkin(null)}
          onEditInStudio={handleEditSkin}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenDMsWithAuthor={handleOpenDMsWithUser}
          onOpenReport={(type, id) => setReportTarget({ type, id })}
          onViewAuthorProfile={handleViewAuthorProfile}
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
          initialRecipientUid={dmRecipient?.uid}
          initialRecipientName={dmRecipient?.name}
          lang={lang}
          onClose={() => setShowDMsModal(false)}
          onOpenAuth={() => setShowAuthModal(true)}
        />
      )}

      {reportTarget && (
        <ReportModal
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          onClose={() => setReportTarget(null)}
        />
      )}

      {showOnboarding && (
        <OnboardingModal
          lang={lang}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      {showAdminPanel && (
        <AdminPanel
          onClose={() => setShowAdminPanel(false)}
        />
      )}

      {showAvatarModal && (
        <AvatarModal
          currentBuffer={buffer}
          onClose={() => setShowAvatarModal(false)}
          onAvatarSaved={() => {
            alert('🎉 Avatar saved to your profile!');
          }}
        />
      )}
    </div>
  );
};
