import React, { useState, useEffect } from 'react';
import { SkinTextureBuffer } from '../engine/SkinTextureBuffer';
import { HistoryManager } from '../engine/HistoryManager';
import { ToolConfig, DEFAULT_TOOL_CONFIG } from '../tools/ToolTypes';
import { ModelType, ToolType } from '../types';
import { Canvas2D } from './Canvas2D';
import { ModelViewer3D } from './ModelViewer3D';
import { ColorPicker } from '../colors/ColorPicker';
import { LanguageCode, getTranslation } from '../i18n/translations';

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

  // Global Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (history.redo(buffer)) setTextureVersion((v) => v + 1);
        } else {
          if (history.undo(buffer)) setTextureVersion((v) => v + 1);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (history.redo(buffer)) setTextureVersion((v) => v + 1);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleDownloadPNG();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buffer, history]);

  const handleTextureChange = () => {
    setTextureVersion((v) => v + 1);
  };

  const handleToolSelect = (tool: ToolType) => {
    setToolConfig((c) => ({ ...c, activeTool: tool }));
  };

  const handleUndo = () => {
    if (history.undo(buffer)) setTextureVersion((v) => v + 1);
  };

  const handleRedo = () => {
    if (history.redo(buffer)) setTextureVersion((v) => v + 1);
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
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="editor-clean-layout">
      {/* 1. SLIM LEFT TOOLBAR (Icon-only with clean tooltips) */}
      <aside className="editor-slim-toolbar">
        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'pencil' ? 'active' : ''}`}
          onClick={() => handleToolSelect('pencil')}
          title={`${t('editor.pencil')} (Pencil 1px)`}
        >
          ✏️
        </button>
        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'brush' ? 'active' : ''}`}
          onClick={() => handleToolSelect('brush')}
          title={`${t('editor.brush')} (Brush)`}
        >
          🖌️
        </button>
        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'eraser' ? 'active' : ''}`}
          onClick={() => handleToolSelect('eraser')}
          title={`${t('editor.eraser')} (Eraser)`}
        >
          🧹
        </button>
        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'fill' ? 'active' : ''}`}
          onClick={() => handleToolSelect('fill')}
          title={`${t('editor.fill')} (Flood Fill)`}
        >
          🪣
        </button>
        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'eyedropper' ? 'active' : ''}`}
          onClick={() => handleToolSelect('eyedropper')}
          title={`${t('editor.picker')} (Eyedropper)`}
        >
          🧪
        </button>
        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'line' ? 'active' : ''}`}
          onClick={() => handleToolSelect('line')}
          title={`${t('editor.line')} (Line Tool)`}
        >
          📏
        </button>
        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'rectangle' ? 'active' : ''}`}
          onClick={() => handleToolSelect('rectangle')}
          title={`${t('editor.rect')} (Rectangle)`}
        >
          ⬛
        </button>
        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'circle' ? 'active' : ''}`}
          onClick={() => handleToolSelect('circle')}
          title={`${t('editor.circle')} (Circle)`}
        >
          ⚪
        </button>
        <button
          className={`tool-icon-btn ${toolConfig.activeTool === 'noise' ? 'active' : ''}`}
          onClick={() => handleToolSelect('noise')}
          title={`${t('editor.noise')} (Texture Dither)`}
        >
          ✨
        </button>

        <div className="toolbar-divider" />

        <button
          className={`tool-icon-btn ${toolConfig.symmetryX ? 'active' : ''}`}
          onClick={() => setToolConfig((c) => ({ ...c, symmetryX: !c.symmetryX }))}
          title={`${t('editor.symmetry')} (Mirror X)`}
        >
          🪞
        </button>

        <div className="toolbar-divider" />

        <button
          className="tool-icon-btn"
          onClick={handleUndo}
          disabled={!history.canUndo()}
          title="Undo (Ctrl+Z)"
        >
          ↩
        </button>
        <button
          className="tool-icon-btn"
          onClick={handleRedo}
          disabled={!history.canRedo()}
          title="Redo (Ctrl+Y)"
        >
          ↪
        </button>
      </aside>

      {/* 2. CENTER CANVAS AREA */}
      <main className="editor-main-canvas-area">
        {/* Top Floating Controls Strip */}
        <div className="canvas-header-strip">
          {/* Layer Selector */}
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

          {/* Brush Size */}
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

          {/* Model Type */}
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

          {/* Action Export Buttons */}
          <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
            <label className="tool-btn-sm" style={{ cursor: 'pointer', background: '#1e293b' }}>
              📥 {t('editor.importPng')}
              <input
                type="file"
                accept="image/png"
                style={{ display: 'none' }}
                onChange={handleImportPNG}
              />
            </label>
            <button
              className="tool-btn-sm"
              style={{ background: '#10b981', color: '#fff' }}
              onClick={handleDownloadPNG}
            >
              💾 {t('editor.downloadPng')}
            </button>
            <button
              className="tool-btn-sm"
              style={{ background: '#2563eb', color: '#fff' }}
              onClick={onOpenPublish}
            >
              🚀 {t('nav.publish')}
            </button>
          </div>
        </div>

        {/* 2D Drawing Canvas Viewport */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <Canvas2D
            buffer={buffer}
            toolConfig={toolConfig}
            history={history}
            onTextureChange={handleTextureChange}
            onColorPick={(color) => setToolConfig((c) => ({ ...c, primaryColor: color }))}
          />
        </div>
      </main>

      {/* 3. RIGHT SIDEBAR: 3D Viewport & Color Picker */}
      <aside className="editor-sidebar-clean-right">
        {/* 3D Model Live Viewport */}
        <div style={{ height: '320px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          <ModelViewer3D
            buffer={buffer}
            modelType={modelType}
            textureVersion={textureVersion}
          />
        </div>

        {/* Compact Color Palette & Picker */}
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
    </div>
  );
};
