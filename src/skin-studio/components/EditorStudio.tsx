import React, { useState, useEffect } from 'react';
import { SkinTextureBuffer } from '../engine/SkinTextureBuffer';
import { HistoryManager } from '../engine/HistoryManager';
import { ToolConfig, DEFAULT_TOOL_CONFIG } from '../tools/ToolTypes';
import { ModelType, ToolType, BodyPart } from '../types';
import { Canvas2D } from './Canvas2D';
import { ModelViewer3D } from './ModelViewer3D';
import { ColorPicker } from '../colors/ColorPicker';
import { LanguageCode, getTranslation } from '../i18n/translations';
import { AvatarModal } from './AvatarModal';
import { ShortcutsModal } from './ShortcutsModal';
import { SKIN_TEMPLATES } from '../templates/SkinTemplates';

interface EditorStudioProps {
  buffer: SkinTextureBuffer;
  history: HistoryManager;
  modelType: ModelType;
  lang: LanguageCode;
  onModelTypeChange: (type: ModelType) => void;
  onOpenPublish: () => void;
}

export const EditorStudio: React.FC<EditorStudioProps> = ({
  buffer,
  history,
  modelType,
  lang,
  onModelTypeChange,
  onOpenPublish,
}) => {
  const t = (k: string) => getTranslation(lang, k);

  const [toolConfig, setToolConfig] = useState<ToolConfig>(DEFAULT_TOOL_CONFIG);
  const [textureVersion, setTextureVersion] = useState(0);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showNewSkinModal, setShowNewSkinModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<'canvas' | '3d' | 'colors'>('canvas');
  const [eyedropperPickedHex, setEyedropperPickedHex] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('creamskin_draft_skin_v2');
      if (savedDraft) {
        buffer.loadFromBase64PNG(savedDraft).then(() => {
          setTextureVersion((v) => v + 1);
        });
      }
    } catch {}
  }, [buffer]);

  const saveDraft = () => {
    try {
      const b64 = buffer.toBase64PNG();
      localStorage.setItem('creamskin_draft_skin_v2', b64);
    } catch {}
  };

  const handleTextureChange = () => {
    setTextureVersion((v) => v + 1);
    saveDraft();
  };

  const handleToolSelect = (tool: ToolType) => {
    setToolConfig((c) => ({ ...c, activeTool: tool }));
    setEyedropperPickedHex(null);
  };

  const handleBodyPartSelect = (part: BodyPart) => {
    setToolConfig((c) => ({ ...c, activePart: part }));
  };

  const handleUndo = () => {
    if (history.undo(buffer)) {
      setTextureVersion((v) => v + 1);
      saveDraft();
    }
  };

  const handleRedo = () => {
    if (history.redo(buffer)) {
      setTextureVersion((v) => v + 1);
      saveDraft();
    }
  };

  const handleDownloadPNG = () => {
    const dataUrl = buffer.toBase64PNG();
    const link = document.createElement('a');
    link.download = `skin_${modelType}_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleImportPNG = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        history.pushSnapshot(buffer);
        await buffer.loadFromBase64PNG(reader.result);
        setTextureVersion((v) => v + 1);
        saveDraft();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = SKIN_TEMPLATES.find((x) => x.id === templateId);
    if (!template) return;
    history.pushSnapshot(buffer);
    const newBuf = template.generate();
    buffer.copyFrom(newBuf);
    onModelTypeChange(template.modelType);
    setTextureVersion((v) => v + 1);
    saveDraft();
    setShowNewSkinModal(false);
  };

  const handleClearCanvas = () => {
    if (!confirm(lang === 'ru' ? 'Очистить холст и начать с чистого листа?' : 'Clear canvas and start fresh?')) return;
    history.pushSnapshot(buffer);
    buffer.clear();
    setTextureVersion((v) => v + 1);
    saveDraft();
    setShowNewSkinModal(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleDownloadPNG();
      } else if (e.key === '?' || e.key === 'F1' || ((e.ctrlKey || e.metaKey) && e.key === '/')) {
        e.preventDefault();
        setShowShortcutsModal(true);
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'p': handleToolSelect('pencil'); break;
          case 'b': handleToolSelect('brush'); break;
          case 'e': handleToolSelect('eraser'); break;
          case 'g': handleToolSelect('fill'); break;
          case 'i': handleToolSelect('eyedropper'); break;
          case 'l': handleToolSelect('line'); break;
          case 'u': handleToolSelect('rectangle'); break;
          case 'c': handleToolSelect('circle'); break;
          case 'n': handleToolSelect('noise'); break;
          case 'm': setToolConfig((c) => ({ ...c, symmetryX: !c.symmetryX })); break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buffer, history, modelType]);

  const getToolDescription = () => {
    switch (toolConfig.activeTool) {
      case 'eyedropper':
        return lang === 'ru'
          ? '🧪 Пипетка (I): Нажмите на любой пиксель на холсте, чтобы скопировать цвет'
          : '🧪 Eyedropper (I): Tap any pixel on the canvas to sample its color';
      case 'pencil':
        return lang === 'ru'
          ? '✏️ Карандаш (P): Попиксельное точное рисование (1px)'
          : '✏️ Pencil (P): Pixel-precise drawing (1px)';
      case 'brush':
        return lang === 'ru'
          ? `🖌️ Кисть (B): Рисование с выбранным размером (${toolConfig.brushSize}px)`
          : `🖌️ Brush (B): Freehand painting (${toolConfig.brushSize}px)`;
      case 'eraser':
        return lang === 'ru'
          ? '🧹 Ластик (E): Стирает пиксели до прозрачности на верхнем слое'
          : '🧹 Eraser (E): Erases pixels to transparency';
      case 'fill':
        return lang === 'ru'
          ? '🪣 Заливка (G): Заполняет цветом всю область'
          : '🪣 Flood Fill (G): Fills connected color area';
      case 'line':
        return lang === 'ru'
          ? '📏 Линия (L): Зажмите и протяните для прямой линии'
          : '📏 Line Tool (L): Drag to draw straight line';
      case 'rectangle':
        return lang === 'ru'
          ? '⬛ Прямоугольник (U): Зажмите и протяните для прямоугольника'
          : '⬛ Rectangle (U): Drag to draw rectangle';
      case 'circle':
        return lang === 'ru'
          ? '⚪ Круг (C): Зажмите и протяните для рисования круга'
          : '⚪ Circle (C): Drag to draw circle';
      case 'noise':
        return lang === 'ru'
          ? '✨ Шум (N): Текстурирование и пиксельные полутона'
          : '✨ Noise (N): Pixel shading dithering';
      default:
        return '';
    }
  };

  const bodyPartsList: { part: BodyPart; labelRu: string; labelEn: string }[] = [
    { part: 'all', labelRu: 'Всё тело', labelEn: 'All Body' },
    { part: 'head', labelRu: 'Голова', labelEn: 'Head' },
    { part: 'torso', labelRu: 'Тело', labelEn: 'Torso' },
    { part: 'rightArm', labelRu: 'Прав. рука', labelEn: 'R. Arm' },
    { part: 'leftArm', labelRu: 'Лев. рука', labelEn: 'L. Arm' },
    { part: 'rightLeg', labelRu: 'Прав. нога', labelEn: 'R. Leg' },
    { part: 'leftLeg', labelRu: 'Лев. нога', labelEn: 'L. Leg' },
  ];

  return (
    <div className="editor-clean-layout">
      <aside className="editor-slim-toolbar">
        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'pencil' ? 'active' : ''}`}
          onClick={() => handleToolSelect('pencil')}
          title="Pencil (P)"
        >
          <span>✏️</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Карандаш' : 'Pencil'}</span>
        </button>

        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'brush' ? 'active' : ''}`}
          onClick={() => handleToolSelect('brush')}
          title="Brush (B)"
        >
          <span>🖌️</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Кисть' : 'Brush'}</span>
        </button>

        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'eraser' ? 'active' : ''}`}
          onClick={() => handleToolSelect('eraser')}
          title="Eraser (E)"
        >
          <span>🧹</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Ластик' : 'Eraser'}</span>
        </button>

        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'fill' ? 'active' : ''}`}
          onClick={() => handleToolSelect('fill')}
          title="Fill (G)"
        >
          <span>🪣</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Заливка' : 'Fill'}</span>
        </button>

        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'eyedropper' ? 'active' : ''}`}
          onClick={() => handleToolSelect('eyedropper')}
          title="Eyedropper (I)"
        >
          <span>🧪</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Пипетка' : 'Picker'}</span>
        </button>

        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'line' ? 'active' : ''}`}
          onClick={() => handleToolSelect('line')}
          title="Line (L)"
        >
          <span>📏</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Линия' : 'Line'}</span>
        </button>

        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'rectangle' ? 'active' : ''}`}
          onClick={() => handleToolSelect('rectangle')}
          title="Rectangle (U)"
        >
          <span>⬛</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Прямоуг' : 'Rect'}</span>
        </button>

        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'circle' ? 'active' : ''}`}
          onClick={() => handleToolSelect('circle')}
          title="Circle (C)"
        >
          <span>⚪</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Круг' : 'Circle'}</span>
        </button>

        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'noise' ? 'active' : ''}`}
          onClick={() => handleToolSelect('noise')}
          title="Noise Shading (N)"
        >
          <span>✨</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Шум' : 'Noise'}</span>
        </button>

        <div className="toolbar-divider" />

        <button
          className={`tool-icon-btn ${toolConfig.symmetryX ? 'active' : ''}`}
          onClick={() => setToolConfig((c) => ({ ...c, symmetryX: !c.symmetryX }))}
          title="Mirror X (M)"
        >
          <span>🪞</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Зеркало' : 'Mirror'}</span>
        </button>

        <div className="toolbar-divider" />

        <button
          className="tool-icon-btn"
          onClick={handleUndo}
          disabled={!history.canUndo()}
          title="Undo (Ctrl+Z)"
        >
          <span>↩</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Назад' : 'Undo'}</span>
        </button>
        <button
          className="tool-icon-btn"
          onClick={handleRedo}
          disabled={!history.canRedo()}
          title="Redo (Ctrl+Y)"
        >
          <span>↪</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Вперед' : 'Redo'}</span>
        </button>
      </aside>

      <main className="editor-main-canvas-area">
        <div className="canvas-header-strip">
          <button
            className="mc-btn-primary"
            style={{ fontSize: '11px', padding: '4px 10px' }}
            onClick={() => setShowNewSkinModal(true)}
            title="Create new skin or switch template"
          >
            📄 {lang === 'ru' ? 'Новый / Сменить скин' : 'New / Change Skin'}
          </button>

          <div className="segmented-control">
            <button
              className={`seg-btn ${toolConfig.activeLayer === 'base' ? 'active' : ''}`}
              onClick={() => setToolConfig((c) => ({ ...c, activeLayer: 'base' }))}
              title="Base Layer 1"
            >
              {t('editor.baseLayer')}
            </button>
            <button
              className={`seg-btn ${toolConfig.activeLayer === 'overlay' ? 'active' : ''}`}
              onClick={() => setToolConfig((c) => ({ ...c, activeLayer: 'overlay' }))}
              title="Overlay Outer Layer 2"
            >
              {t('editor.outerLayer')}
            </button>
            <button
              className={`seg-btn ${toolConfig.activeLayer === 'both' ? 'active' : ''}`}
              onClick={() => setToolConfig((c) => ({ ...c, activeLayer: 'both' }))}
              title="Both Layers"
            >
              {t('editor.bothLayers')}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{t('editor.brushSize')}:</span>
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                className={`tool-btn-sm ${toolConfig.brushSize === s ? 'active' : ''}`}
                style={{ padding: '3px 7px' }}
                onClick={() => setToolConfig((c) => ({ ...c, brushSize: s }))}
              >
                {s}px
              </button>
            ))}
          </div>

          <div className="segmented-control">
            <button
              className={`seg-btn ${modelType === 'classic' ? 'active' : ''}`}
              onClick={() => onModelTypeChange('classic')}
            >
              {t('editor.classic')}
            </button>
            <button
              className={`seg-btn ${modelType === 'slim' ? 'active' : ''}`}
              onClick={() => onModelTypeChange('slim')}
            >
              {t('editor.slim')}
            </button>
          </div>

          <div className="mobile-view-tabs">
            <button
              className={`seg-btn ${mobileTab === 'canvas' ? 'active' : ''}`}
              onClick={() => setMobileTab('canvas')}
            >
              2D
            </button>
            <button
              className={`seg-btn ${mobileTab === '3d' ? 'active' : ''}`}
              onClick={() => setMobileTab('3d')}
            >
              3D
            </button>
            <button
              className={`seg-btn ${mobileTab === 'colors' ? 'active' : ''}`}
              onClick={() => setMobileTab('colors')}
            >
              🎨
            </button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginLeft: 'auto', alignItems: 'center' }}>
            <button
              className="mc-btn-secondary"
              style={{ fontSize: '11px', padding: '4px 8px' }}
              onClick={() => setShowShortcutsModal(true)}
              title="Keyboard Shortcuts (?)"
            >
              ⌨️ Shortcuts
            </button>
            <button
              className="mc-btn-secondary"
              style={{ fontSize: '11px', padding: '4px 8px' }}
              onClick={() => setShowAvatarModal(true)}
              title="Set Avatar from Skin"
            >
              👤 Avatar
            </button>
            <label className="mc-btn-secondary" style={{ cursor: 'pointer', fontSize: '11px', padding: '4px 8px' }}>
              📥 {t('editor.importPng')}
              <input
                type="file"
                accept="image/png"
                style={{ display: 'none' }}
                onChange={handleImportPNG}
              />
            </label>
            <button
              className="mc-btn-secondary"
              style={{ fontSize: '11px', padding: '4px 8px' }}
              onClick={handleDownloadPNG}
              title="Download 64x64 PNG (Ctrl+S)"
            >
              💾 {t('editor.downloadPng')}
            </button>
            <button
              className="mc-btn-primary"
              style={{ fontSize: '11px', padding: '4px 10px' }}
              onClick={onOpenPublish}
            >
              🚀 {t('nav.publish')}
            </button>
          </div>
        </div>

        <div className="body-parts-selector-bar">
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginRight: '4px' }}>
            {lang === 'ru' ? 'Часть тела:' : 'Part:'}
          </span>
          {bodyPartsList.map((bp) => (
            <button
              key={bp.part}
              className={`part-pill-btn ${toolConfig.activePart === bp.part ? 'active' : ''}`}
              onClick={() => handleBodyPartSelect(bp.part)}
            >
              {lang === 'ru' ? bp.labelRu : bp.labelEn}
            </button>
          ))}
        </div>

        <div className="tool-status-banner">
          <span>{getToolDescription()}</span>
          {eyedropperPickedHex && (
            <span className="eyedropper-tag" style={{ background: eyedropperPickedHex }}>
              Picked: {eyedropperPickedHex}
            </span>
          )}
        </div>

        <div className={`editor-mobile-viewport ${mobileTab !== 'canvas' ? 'hide-on-mobile' : ''}`} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <Canvas2D
            buffer={buffer}
            toolConfig={toolConfig}
            history={history}
            textureVersion={textureVersion}
            onTextureChange={handleTextureChange}
            onColorPick={(color) => {
              const hex = `#${((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1)}`;
              setToolConfig((c) => ({ ...c, primaryColor: color }));
              setEyedropperPickedHex(hex);
            }}
          />
        </div>

        {mobileTab === '3d' && (
          <div className="mobile-only-3d-pane">
            <ModelViewer3D
              buffer={buffer}
              modelType={modelType}
              textureVersion={textureVersion}
            />
          </div>
        )}

        {mobileTab === 'colors' && (
          <div className="mobile-only-colors-pane">
            <ColorPicker
              color={toolConfig.primaryColor}
              onChange={(color) => setToolConfig((c) => ({ ...c, primaryColor: color }))}
            />
          </div>
        )}
      </main>

      <aside className="editor-sidebar-clean-right">
        <div style={{ height: '320px', borderRadius: '4px', overflow: 'hidden' }}>
          <ModelViewer3D
            buffer={buffer}
            modelType={modelType}
            textureVersion={textureVersion}
          />
        </div>

        <div className="panel-box" style={{ flex: 1, overflowY: 'auto' }}>
          <div className="panel-header">
            <span>{t('editor.colorPalette')}</span>
          </div>
          <ColorPicker
            color={toolConfig.primaryColor}
            onChange={(color) => setToolConfig((c) => ({ ...c, primaryColor: color }))}
          />
        </div>
      </aside>

      {showNewSkinModal && (
        <div className="modal-overlay" onClick={() => setShowNewSkinModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>
                📄 {lang === 'ru' ? 'Создать новый скин или выбрать шаблон' : 'Create New Skin or Select Template'}
              </h2>
              <button className="tool-btn-sm" onClick={() => setShowNewSkinModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                className="mc-btn-danger"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={handleClearCanvas}
              >
                🧹 {lang === 'ru' ? 'Очистить холст' : 'Clear Canvas'}
              </button>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mc-diamond)', marginTop: '8px' }}>
              {lang === 'ru' ? 'Доступные шаблоны и основы:' : 'Available Templates & Bases:'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
              {SKIN_TEMPLATES.map((tmpl) => {
                const previewBuf = tmpl.generate();
                const previewImg = previewBuf.toBase64PNG();
                return (
                  <div
                    key={tmpl.id}
                    className="skin-card"
                    style={{ cursor: 'pointer', padding: '8px', alignItems: 'center', textAlign: 'center' }}
                    onClick={() => handleLoadTemplate(tmpl.id)}
                  >
                    <img
                      src={previewImg}
                      alt={tmpl.name}
                      style={{ width: '80px', height: '80px', imageRendering: 'pixelated', margin: '0 auto 6px auto' }}
                    />
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{tmpl.name}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{tmpl.modelType.toUpperCase()}</div>
                    <button
                      className="mc-btn-primary"
                      style={{ marginTop: '8px', width: '100%', fontSize: '11px', padding: '4px' }}
                      onClick={() => handleLoadTemplate(tmpl.id)}
                    >
                      {lang === 'ru' ? 'Выбрать' : 'Select'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showAvatarModal && (
        <AvatarModal
          currentBuffer={buffer}
          onClose={() => setShowAvatarModal(false)}
          onAvatarSaved={() => {}}
        />
      )}

      {showShortcutsModal && (
        <ShortcutsModal onClose={() => setShowShortcutsModal(false)} />
      )}
    </div>
  );
};
