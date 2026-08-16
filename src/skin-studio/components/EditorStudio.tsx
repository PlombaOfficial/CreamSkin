import React, { useState, useEffect } from 'react';
import { SkinTextureBuffer } from '../engine/SkinTextureBuffer';
import { HistoryManager } from '../engine/HistoryManager';
import { ToolConfig, DEFAULT_TOOL_CONFIG } from '../tools/ToolTypes';
import { ModelType, ToolType } from '../types';
import { Canvas2D } from './Canvas2D';
import { ModelViewer3D } from './ModelViewer3D';
import { ColorPicker } from '../colors/ColorPicker';
import { SKIN_TEMPLATES } from '../templates/SkinTemplates';

interface EditorStudioProps {
  buffer: SkinTextureBuffer;
  history: HistoryManager;
  modelType: ModelType;
  onModelTypeChange: (type: ModelType) => void;
  onOpenPublish: () => void;
}

export const EditorStudio: React.FC<EditorStudioProps> = ({
  buffer,
  history,
  modelType,
  onModelTypeChange,
  onOpenPublish,
}) => {
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
    link.download = `minecraft-skin-${modelType}-${Date.now()}.png`;
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

  const handleLoadTemplate = (templateId: string) => {
    const t = SKIN_TEMPLATES.find((x) => x.id === templateId);
    if (!t) return;
    history.pushSnapshot(buffer);
    const newBuf = t.generate();
    buffer.copyFrom(newBuf);
    onModelTypeChange(t.modelType);
    setTextureVersion((v) => v + 1);
  };

  return (
    <div className="editor-layout">
      {/* LEFT SIDEBAR: Tools & Layers */}
      <aside className="editor-sidebar">
        {/* Tools Palette */}
        <div className="section-box">
          <div className="section-header">
            <span>Drawing Tools</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                className="tool-btn-sm"
                onClick={handleUndo}
                disabled={!history.canUndo()}
                title="Undo (Ctrl+Z)"
              >
                ↩️
              </button>
              <button
                className="tool-btn-sm"
                onClick={handleRedo}
                disabled={!history.canRedo()}
                title="Redo (Ctrl+Y)"
              >
                ↪️
              </button>
            </div>
          </div>

          <div className="tools-grid">
            <button
              className={`tool-btn ${toolConfig.activeTool === 'pencil' ? 'active' : ''}`}
              onClick={() => handleToolSelect('pencil')}
              title="Pencil (1px)"
            >
              <span>✏️</span>
              <span className="tool-btn-label">Pencil</span>
            </button>
            <button
              className={`tool-btn ${toolConfig.activeTool === 'brush' ? 'active' : ''}`}
              onClick={() => handleToolSelect('brush')}
              title="Brush (Multi-pixel)"
            >
              <span>🖌️</span>
              <span className="tool-btn-label">Brush</span>
            </button>
            <button
              className={`tool-btn ${toolConfig.activeTool === 'eraser' ? 'active' : ''}`}
              onClick={() => handleToolSelect('eraser')}
              title="Eraser"
            >
              <span>🧹</span>
              <span className="tool-btn-label">Eraser</span>
            </button>
            <button
              className={`tool-btn ${toolConfig.activeTool === 'fill' ? 'active' : ''}`}
              onClick={() => handleToolSelect('fill')}
              title="Paint Bucket (Flood Fill)"
            >
              <span>🪣</span>
              <span className="tool-btn-label">Fill</span>
            </button>
            <button
              className={`tool-btn ${toolConfig.activeTool === 'eyedropper' ? 'active' : ''}`}
              onClick={() => handleToolSelect('eyedropper')}
              title="Color Picker"
            >
              <span>🧪</span>
              <span className="tool-btn-label">Picker</span>
            </button>
            <button
              className={`tool-btn ${toolConfig.activeTool === 'line' ? 'active' : ''}`}
              onClick={() => handleToolSelect('line')}
              title="Line Tool"
            >
              <span>📏</span>
              <span className="tool-btn-label">Line</span>
            </button>
            <button
              className={`tool-btn ${toolConfig.activeTool === 'rectangle' ? 'active' : ''}`}
              onClick={() => handleToolSelect('rectangle')}
              title="Rectangle Tool"
            >
              <span>⬛</span>
              <span className="tool-btn-label">Rect</span>
            </button>
            <button
              className={`tool-btn ${toolConfig.activeTool === 'circle' ? 'active' : ''}`}
              onClick={() => handleToolSelect('circle')}
              title="Circle Tool"
            >
              <span>⚪</span>
              <span className="tool-btn-label">Circle</span>
            </button>
            <button
              className={`tool-btn ${toolConfig.activeTool === 'noise' ? 'active' : ''}`}
              onClick={() => handleToolSelect('noise')}
              title="Texture Noise / Shading Shader"
              style={{ gridColumn: 'span 4' }}
            >
              <span>✨ Noise / Texture Shader</span>
            </button>
          </div>
        </div>

        {/* Brush & Mirror Controls */}
        <div className="section-box">
          <div className="section-header">Tool Modifiers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Brush Size:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4].map((s) => (
                  <button
                    key={s}
                    className={`tool-btn-sm ${toolConfig.brushSize === s ? 'active' : ''}`}
                    onClick={() => setToolConfig((c) => ({ ...c, brushSize: s }))}
                  >
                    {s}px
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Mirror Symmetry:</span>
              <button
                className={`tool-btn-sm ${toolConfig.symmetryX ? 'active' : ''}`}
                onClick={() => setToolConfig((c) => ({ ...c, symmetryX: !c.symmetryX }))}
              >
                {toolConfig.symmetryX ? '🪞 X: ON' : '🪞 X: OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Active Layer & Model Target */}
        <div className="section-box">
          <div className="section-header">Target Layer</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
            <button
              className={`tool-btn-sm ${toolConfig.activeLayer === 'base' ? 'active' : ''}`}
              onClick={() => setToolConfig((c) => ({ ...c, activeLayer: 'base' }))}
            >
              Base (L1)
            </button>
            <button
              className={`tool-btn-sm ${toolConfig.activeLayer === 'overlay' ? 'active' : ''}`}
              onClick={() => setToolConfig((c) => ({ ...c, activeLayer: 'overlay' }))}
            >
              Outer (L2)
            </button>
            <button
              className={`tool-btn-sm ${toolConfig.activeLayer === 'both' ? 'active' : ''}`}
              onClick={() => setToolConfig((c) => ({ ...c, activeLayer: 'both' }))}
            >
              Both
            </button>
          </div>

          <div style={{ marginTop: '12px' }}>
            <div className="section-header">Model Geometry</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              <button
                className={`tool-btn-sm ${modelType === 'classic' ? 'active' : ''}`}
                onClick={() => onModelTypeChange('classic')}
              >
                Classic (4px)
              </button>
              <button
                className={`tool-btn-sm ${modelType === 'slim' ? 'active' : ''}`}
                onClick={() => onModelTypeChange('slim')}
              >
                Slim / Alex (3px)
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* CENTER WORKSPACE: 2D UV Canvas & 3D Interactive Model */}
      <main className="editor-workspace">
        <Canvas2D
          buffer={buffer}
          toolConfig={toolConfig}
          history={history}
          onTextureChange={handleTextureChange}
          onColorPick={(color) => setToolConfig((c) => ({ ...c, primaryColor: color }))}
        />

        <ModelViewer3D
          buffer={buffer}
          modelType={modelType}
          onModelTypeChange={onModelTypeChange}
          textureVersion={textureVersion}
        />
      </main>

      {/* RIGHT SIDEBAR: Colors, Files & Templates */}
      <aside className="editor-sidebar-right">
        {/* Color Palette & Picker */}
        <div className="section-box">
          <div className="section-header">Color Palette</div>
          <ColorPicker
            color={toolConfig.primaryColor}
            onChange={(color) => setToolConfig((c) => ({ ...c, primaryColor: color }))}
          />
        </div>

        {/* File Actions */}
        <div className="section-box">
          <div className="section-header">Save & Export</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              className="tool-btn-sm"
              style={{ background: '#10b981', color: '#fff', padding: '10px' }}
              onClick={handleDownloadPNG}
            >
              💾 Download 64×64 PNG
            </button>

            <label
              className="tool-btn-sm"
              style={{ textAlign: 'center', cursor: 'pointer', padding: '10px' }}
            >
              📥 Import Skin PNG
              <input
                type="file"
                accept="image/png"
                style={{ display: 'none' }}
                onChange={handleImportPNG}
              />
            </label>

            <button
              className="tool-btn-sm"
              style={{ background: '#3b82f6', color: '#fff', padding: '10px' }}
              onClick={onOpenPublish}
            >
              🚀 Publish to Community Gallery
            </button>
          </div>
        </div>

        {/* Starter Templates */}
        <div className="section-box">
          <div className="section-header">Starter Templates</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {SKIN_TEMPLATES.map((t) => (
              <button
                key={t.id}
                className="tool-btn-sm"
                style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}
                onClick={() => handleLoadTemplate(t.id)}
              >
                <span>{t.name}</span>
                <span style={{ color: '#94a3b8', fontSize: '10px' }}>{t.category}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};
