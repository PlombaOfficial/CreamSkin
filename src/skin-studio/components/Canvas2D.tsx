import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SkinTextureBuffer } from '../engine/SkinTextureBuffer';
import { ToolConfig } from '../tools/ToolTypes';
import { ToolEngine } from '../tools/ToolEngine';
import { HistoryManager } from '../engine/HistoryManager';
import { SKIN_UV_REGIONS, findUVRegion } from '../engine/SkinUVMap';
import { ColorRGBA } from '../types';

interface Canvas2DProps {
  buffer: SkinTextureBuffer;
  toolConfig: ToolConfig;
  history: HistoryManager;
  onTextureChange: () => void;
  onColorPick: (color: ColorRGBA) => void;
}

export const Canvas2D: React.FC<Canvas2DProps> = ({
  buffer,
  toolConfig,
  history,
  onTextureChange,
  onColorPick,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const checkerboardCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [zoom, setZoom] = useState(8); // 8x scale = 512px
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [showGrid, setShowGrid] = useState(true);
  const [showUVLabels, setShowUVLabels] = useState(true);
  const [hoverRegion, setHoverRegion] = useState<string | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentCoord, setCurrentCoord] = useState<{ x: number; y: number } | null>(null);

  // Render Transparency Checkerboard Background
  const renderCheckerboard = useCallback(() => {
    const cb = checkerboardCanvasRef.current;
    if (!cb) return;
    const ctx = cb.getContext('2d');
    if (!ctx) return;

    cb.width = 64;
    cb.height = 64;
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#1e293b' : '#0f172a';
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, []);

  // Redraw 2D Pixel Canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 64, 64);
    const imgData = ctx.createImageData(64, 64);
    imgData.data.set(buffer.data);
    ctx.putImageData(imgData, 0, 0);
  }, [buffer]);

  // Redraw Grid & Guides Overlay
  const renderOverlay = useCallback(() => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    const size = 64 * zoom;
    overlay.width = size;
    overlay.height = size;
    ctx.clearRect(0, 0, size, size);

    // 1. Grid Lines
    if (showGrid && zoom >= 4) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 64; i++) {
        const p = i * zoom;
        ctx.beginPath();
        ctx.moveTo(p, 0); ctx.lineTo(p, size);
        ctx.moveTo(0, p); ctx.lineTo(size, p);
        ctx.stroke();
      }
    }

    // 2. UV Region Outlines
    if (showUVLabels) {
      for (const r of SKIN_UV_REGIONS) {
        const rx = r.x * zoom;
        const ry = r.y * zoom;
        const rw = r.w * zoom;
        const rh = r.h * zoom;

        ctx.strokeStyle = r.layer === 'overlay' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(rx + 0.5, ry + 0.5, rw - 1, rh - 1);
      }
    }

    // 3. Shape Preview on Drag
    if (isDrawing && drawStart && currentCoord) {
      const tool = toolConfig.activeTool;
      if (tool === 'line' || tool === 'rectangle' || tool === 'circle') {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        if (tool === 'line') {
          ctx.beginPath();
          ctx.moveTo((drawStart.x + 0.5) * zoom, (drawStart.y + 0.5) * zoom);
          ctx.lineTo((currentCoord.x + 0.5) * zoom, (currentCoord.y + 0.5) * zoom);
          ctx.stroke();
        } else if (tool === 'rectangle') {
          const minX = Math.min(drawStart.x, currentCoord.x) * zoom;
          const minY = Math.min(drawStart.y, currentCoord.y) * zoom;
          const rw = (Math.abs(currentCoord.x - drawStart.x) + 1) * zoom;
          const rh = (Math.abs(currentCoord.y - drawStart.y) + 1) * zoom;
          ctx.strokeRect(minX, minY, rw, rh);
        } else if (tool === 'circle') {
          const r = Math.hypot(currentCoord.x - drawStart.x, currentCoord.y - drawStart.y) * zoom;
          ctx.beginPath();
          ctx.arc((drawStart.x + 0.5) * zoom, (drawStart.y + 0.5) * zoom, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
  }, [zoom, showGrid, showUVLabels, isDrawing, drawStart, currentCoord, toolConfig.activeTool]);

  useEffect(() => {
    renderCheckerboard();
    renderCanvas();
    renderOverlay();
  }, [renderCheckerboard, renderCanvas, renderOverlay]);

  const getCanvasCoords = (clientX: number, clientY: number): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 64 / rect.width;
    const scaleY = 64 / rect.height;

    const x = Math.floor((clientX - rect.left) * scaleX);
    const y = Math.floor((clientY - rect.top) * scaleY);

    if (x >= 0 && x < 64 && y >= 0 && y < 64) {
      return { x, y };
    }
    return null;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || e.button === 2) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
      return;
    }

    if (e.button !== 0) return;

    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (!coords) return;

    if (toolConfig.activeTool === 'eyedropper') {
      const picked = buffer.getPixel(coords.x, coords.y);
      onColorPick(picked);
      return;
    }

    history.pushSnapshot(buffer);
    setIsDrawing(true);
    setDrawStart(coords);
    setCurrentCoord(coords);

    if (toolConfig.activeTool === 'fill') {
      ToolEngine.floodFill(
        buffer,
        coords.x,
        coords.y,
        toolConfig.primaryColor,
        toolConfig.activeLayer,
        toolConfig.activePart
      );
      renderCanvas();
      onTextureChange();
      setIsDrawing(false);
    } else if (toolConfig.activeTool === 'pencil' || toolConfig.activeTool === 'brush' || toolConfig.activeTool === 'eraser' || toolConfig.activeTool === 'noise') {
      ToolEngine.applyBrush(buffer, coords.x, coords.y, toolConfig);
      renderCanvas();
      onTextureChange();
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setPanX(e.clientX - panStart.x);
      setPanY(e.clientY - panStart.y);
      return;
    }

    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (coords) {
      const region = findUVRegion(coords.x, coords.y);
      setHoverRegion(region ? `${region.name} (${region.layer === 'overlay' ? 'Layer 2' : 'Base'})` : `Pixel X: ${coords.x} Y: ${coords.y}`);
    } else {
      setHoverRegion(null);
    }

    if (!isDrawing || !coords) return;
    setCurrentCoord(coords);

    const tool = toolConfig.activeTool;
    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser' || tool === 'noise') {
      ToolEngine.applyBrush(buffer, coords.x, coords.y, toolConfig);
      renderCanvas();
      onTextureChange();
    } else {
      renderOverlay();
    }
  };

  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDrawing && drawStart && currentCoord) {
      const tool = toolConfig.activeTool;
      if (tool === 'line') {
        ToolEngine.drawLine(buffer, drawStart.x, drawStart.y, currentCoord.x, currentCoord.y, toolConfig);
      } else if (tool === 'rectangle') {
        ToolEngine.drawRectangle(buffer, drawStart.x, drawStart.y, currentCoord.x, currentCoord.y, toolConfig, true);
      } else if (tool === 'circle') {
        const r = Math.round(Math.hypot(currentCoord.x - drawStart.x, currentCoord.y - drawStart.y));
        ToolEngine.drawCircle(buffer, drawStart.x, drawStart.y, r, toolConfig, true);
      }
      renderCanvas();
      onTextureChange();
    }

    setIsDrawing(false);
    setDrawStart(null);
    setCurrentCoord(null);
    renderOverlay();
  };

  return (
    <div
      ref={containerRef}
      className="canvas2d-viewport"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Zoom / Pan Toolbar */}
      <div className="canvas-controls-bar">
        <button className="tool-btn-sm" onClick={() => setZoom((z) => Math.min(16, z + 1))} title="Zoom In">➕</button>
        <span style={{ fontSize: '11px', color: '#fff', fontWeight: 600 }}>{zoom * 100}%</span>
        <button className="tool-btn-sm" onClick={() => setZoom((z) => Math.max(3, z - 1))} title="Zoom Out">➖</button>
        <button className={`tool-btn-sm ${showGrid ? 'active' : ''}`} onClick={() => setShowGrid(!showGrid)} title="Toggle Grid">▦ Grid</button>
        <button className={`tool-btn-sm ${showUVLabels ? 'active' : ''}`} onClick={() => setShowUVLabels(!showUVLabels)} title="Toggle UV Outlines">🏷️ UV</button>
        <button className="tool-btn-sm" onClick={() => { setPanX(0); setPanY(0); setZoom(8); }} title="Reset View">🎯</button>
        {hoverRegion && <span className="hover-region-badge">{hoverRegion}</span>}
      </div>

      {/* Render Canvas Stack (Checkerboard -> Main Pixels -> Overlay Grid) */}
      <div
        className="canvas-render-wrapper"
        style={{
          transform: `translate(${panX}px, ${panY}px)`,
          width: `${64 * zoom}px`,
          height: `${64 * zoom}px`,
        }}
      >
        <canvas
          ref={checkerboardCanvasRef}
          width={64}
          height={64}
          style={{ position: 'absolute', top: 0, left: 0, width: `${64 * zoom}px`, height: `${64 * zoom}px`, imageRendering: 'pixelated' }}
        />
        <canvas
          ref={canvasRef}
          width={64}
          height={64}
          className="canvas2d-main"
          style={{ position: 'relative', width: `${64 * zoom}px`, height: `${64 * zoom}px`, imageRendering: 'pixelated' }}
        />
        <canvas
          ref={overlayCanvasRef}
          className="canvas2d-overlay"
          style={{ width: `${64 * zoom}px`, height: `${64 * zoom}px` }}
        />
      </div>
    </div>
  );
};
