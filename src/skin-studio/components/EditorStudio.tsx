import React, { useState, useEffect } from 'react';
import { SkinTextureBuffer } from '../engine/SkinTextureBuffer';
import { HistoryManager } from '../engine/HistoryManager';
import { ToolConfig, DEFAULT_TOOL_CONFIG } from '../tools/ToolTypes';
import { ModelType, ToolType } from '../types';
import { Canvas2D } from './Canvas2D';
import { ModelViewer3D } from './ModelViewer3D';
import { ColorPicker } from '../colors/ColorPicker';
import { LanguageCode, getTranslation } from '../i18n/translations';
import { AvatarModal } from './AvatarModal';

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (history.redo(buffer)) {
            setTextureVersion((v) => v + 1);
            saveDraft();
          }
        } else {
          if (history.undo(buffer)) {
            setTextureVersion((v) => v + 1);
            saveDraft();
          }
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (history.redo(buffer)) {
          setTextureVersion((v) => v + 1);
          saveDraft();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleDownloadPNG();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buffer, history]);

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

  const getToolDescription = () => {
    switch (toolConfig.activeTool) {
      case 'eyedropper':
        return lang === 'ru'
          ? '🧪 Пипетка: Нажмите на любой пиксель на холсте, чтобы скопировать его цвет'
          : '🧪 Eyedropper: Tap any pixel on the canvas to sample its color';
      case 'pencil':
        return lang === 'ru'
          ? '✏️ Карандаш (1px): Точное попиксельное рисование'
          : '✏️ Pencil (1px): Pixel-precise drawing';
      case 'brush':
        return lang === 'ru'
          ? `🖌️ Кисть (${toolConfig.brushSize}px): Рисование с выбранным размером кисти`
          : `🖌️ Brush (${toolConfig.brushSize}px): Freehand painting with brush radius`;
      case 'eraser':
        return lang === 'ru'
          ? '🧹 Ластик: Стирает пиксели до прозрачности на верхнем слое'
          : '🧹 Eraser: Erases pixels to transparency on overlay layer';
      case 'fill':
        return lang === 'ru'
          ? '🪣 Заливка: Заполняет цветом всю соединенную область'
          : '🪣 Flood Fill: Fills connected color area';
      case 'line':
        return lang === 'ru'
          ? '📏 Линия: Зажмите и протяните для прямой линии'
          : '📏 Line Tool: Drag to draw straight lines';
      case 'rectangle':
        return lang === 'ru'
          ? '⬛ Прямоугольник: Зажмите и протяните для рисования прямоугольника'
          : '⬛ Rectangle: Drag to draw filled rectangle';
      case 'circle':
        return lang === 'ru'
          ? '⚪ Круг: Зажмите и протяните для рисования круга'
          : '⚪ Circle: Drag to draw circle';
      case 'noise':
        return lang === 'ru'
          ? '✨ Текстурный шум: Создает естественные полутона и градиент Minecraft'
          : '✨ Texture Noise: Adds subtle shading dithering';
      default:
        return '';
    }
  };

  return (
    <div className="editor-clean-layout">
      <aside className="editor-slim-toolbar">
        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'pencil' ? 'active' : ''}`}
          onClick={() => handleToolSelect('pencil')}
          title={`${t('editor.pencil')} (1px)`}
        >
          <span>✏️</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Карандаш' : 'Pencil'}</span>
        </button>

        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'eyedropper' ? 'active' : ''}`}
          onClick={() => handleToolSelect('eyedropper')}
          title={`${t('editor.picker')} (Eyedropper)`}
        >
          <span>🧪</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Пипетка' : 'Picker'}</span>
        </button>

        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'fill' ? 'active' : ''}`}
          onClick={() => handleToolSelect('fill')}
          title={`${t('editor.fill')} (Fill)`}
        >
          <span>🪣</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Заливка' : 'Fill'}</span>
        </button>

        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'eraser' ? 'active' : ''}`}
          onClick={() => handleToolSelect('eraser')}
          title={`${t('editor.eraser')} (Eraser)`}
        >
          <span>🧹</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Ластик' : 'Eraser'}</span>
        </button>

        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'brush' ? 'active' : ''}`}
          onClick={() => handleToolSelect('brush')}
          title={`${t('editor.brush')} (Brush)`}
        >
          <span>🖌️</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Кисть' : 'Brush'}</span>
        </button>

        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'line' ? 'active' : ''}`}
          onClick={() => handleToolSelect('line')}
          title={`${t('editor.line')} (Line)`}
        >
          <span>📏</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Линия' : 'Line'}</span>
        </button>

        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'rectangle' ? 'active' : ''}`}
          onClick={() => handleToolSelect('rectangle')}
          title={`${t('editor.rect')} (Rectangle)`}
        >
          <span>⬛</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Прямоуг' : 'Rect'}</span>
        </button>

        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'circle' ? 'active' : ''}`}
          onClick={() => handleToolSelect('circle')}
          title={`${t('editor.circle')} (Circle)`}
        >
          <span>⚪</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Круг' : 'Circle'}</span>
        </button>

        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'noise' ? 'active' : ''}`}
          onClick={() => handleToolSelect('noise')}
          title={`${t('editor.noise')} (Texture Noise)`}
        >
          <span>✨</span>
          <span className="tool-btn-label">{lang === 'ru' ? 'Шум' : 'Noise'}</span>
        </button>

        <div className="toolbar-divider" />

        <button
          className={`tool-icon-btn ${toolConfig.symmetryX ? 'active' : ''}`}
          onClick={() => setToolConfig((c) => ({ ...c, symmetryX: !c.symmetryX }))}
          title={`${t('editor.symmetry')} (Mirror X)`}
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
          <div className="segmented-control">
            <button
              className={`seg-btn ${toolConfig.activeLayer === 'base' ? 'active' : ''}`}
              onClick={() => setToolConfig((c) => ({ ...c, activeLayer: 'base' }))}
            >
              {t('editor.baseLayer')}
            </button>
            <button
              className={`seg-btn ${toolConfig.activeLayer === 'overlay' ? 'active' : ''}`}
              onClick={() => setToolConfig((c) => ({ ...c, activeLayer: 'overlay' }))}
            >
              {t('editor.outerLayer')}
            </button>
            <button
              className={`seg-btn ${toolConfig.activeLayer === 'both' ? 'active' : ''}`}
              onClick={() => setToolConfig((c) => ({ ...c, activeLayer: 'both' }))}
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

          <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto', alignItems: 'center' }}>
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
        <div style={{ height: '320px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #3b4252' }}>
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

      {showAvatarModal && (
        <AvatarModal
          currentBuffer={buffer}
          onClose={() => setShowAvatarModal(false)}
          onAvatarSaved={() => {}}
        />
      )}
    </div>
  );
};
