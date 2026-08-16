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
  textureVersion: number;
  onTextureChange: () => void;
  onColorPick: (color: ColorRGBA) => void;
}

const ZOOM_STEPS = [50, 75, 100, 125, 150, 200, 300, 400, 600, 800];
const BASE_PIXEL_SIZE = 6;

export const Canvas2D: React.FC<Canvas2DProps> = ({
  buffer,
  toolConfig,
  history,
  textureVersion,
  onTextureChange,
  onColorPick,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const checkerboardCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const [showGrid, setShowGrid] = useState(true);
  const [showUVLabels, setShowUVLabels] = useState(true);
  const [hoverRegion, setHoverRegion] = useState<string | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentCoord, setCurrentCoord] = useState<{ x: number; y: number } | null>(null);

  const pixelSize = (BASE_PIXEL_SIZE * zoomPercent) / 100;
  const canvasDisplaySize = 64 * pixelSize;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 64, 64);
    const imgData = ctx.createImageData(64, 64);
    imgData.data.set(buffer.data);
    ctx.putImageData(imgData, 0, 0);
  }, [buffer, textureVersion]);

  const renderOverlay = useCallback(() => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    const size = canvasDisplaySize;
    overlay.width = size;
    overlay.height = size;
    ctx.clearRect(0, 0, size, size);

    if (toolConfig.activePart !== 'all') {
      for (const r of SKIN_UV_REGIONS) {
        if (r.part !== toolConfig.activePart) {
          const rx = r.x * pixelSize;
          const ry = r.y * pixelSize;
          const rw = r.w * pixelSize;
          const rh = r.h * pixelSize;
          ctx.fillStyle = 'rgba(10, 14, 22, 0.65)';
          ctx.fillRect(rx, ry, rw, rh);
        }
      }
    }

    if (showGrid && pixelSize >= 3) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 64; i++) {
        const p = i * pixelSize;
        ctx.beginPath();
        ctx.moveTo(p, 0); ctx.lineTo(p, size);
        ctx.moveTo(0, p); ctx.lineTo(size, p);
        ctx.stroke();
      }
    }

    if (showUVLabels) {
      for (const r of SKIN_UV_REGIONS) {
        const rx = r.x * pixelSize;
        const ry = r.y * pixelSize;
        const rw = r.w * pixelSize;
        const rh = r.h * pixelSize;

        const isSelectedPart = toolConfig.activePart === 'all' || toolConfig.activePart === r.part;

        if (isSelectedPart) {
          ctx.strokeStyle = r.layer === 'overlay' ? '#38bdf8' : '#f59e0b';
          ctx.lineWidth = toolConfig.activePart === r.part ? 2 : 1;
        } else {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
          ctx.lineWidth = 1;
        }

        ctx.strokeRect(rx + 0.5, ry + 0.5, rw - 1, rh - 1);
      }
    }

    if (isDrawing && drawStart && currentCoord) {
      const tool = toolConfig.activeTool;
      if (tool === 'line' || tool === 'rectangle' || tool === 'circle') {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        if (tool === 'line') {
          ctx.beginPath();
          ctx.moveTo((drawStart.x + 0.5) * pixelSize, (drawStart.y + 0.5) * pixelSize);
          ctx.lineTo((currentCoord.x + 0.5) * pixelSize, (currentCoord.y + 0.5) * pixelSize);
          ctx.stroke();
        } else if (tool === 'rectangle') {
          const minX = Math.min(drawStart.x, currentCoord.x) * pixelSize;
          const minY = Math.min(drawStart.y, currentCoord.y) * pixelSize;
          const rw = (Math.abs(currentCoord.x - drawStart.x) + 1) * pixelSize;
          const rh = (Math.abs(currentCoord.y - drawStart.y) + 1) * pixelSize;
          ctx.strokeRect(minX, minY, rw, rh);
        } else if (tool === 'circle') {
          const r = Math.hypot(currentCoord.x - drawStart.x, currentCoord.y - drawStart.y) * pixelSize;
          ctx.beginPath();
          ctx.arc((drawStart.x + 0.5) * pixelSize, (drawStart.y + 0.5) * pixelSize, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
  }, [canvasDisplaySize, pixelSize, showGrid, showUVLabels, isDrawing, drawStart, currentCoord, toolConfig.activeTool, toolConfig.activePart]);

  useEffect(() => {
    renderCheckerboard();
    renderCanvas();
    renderOverlay();
  }, [renderCheckerboard, renderCanvas, renderOverlay, textureVersion]);

  const handleZoomIn = () => {
    setZoomPercent((curr) => {
      const next = ZOOM_STEPS.find((s) => s > curr);
      return next !== undefined ? next : curr;
    });
  };

  const handleZoomOut = () => {
    setZoomPercent((curr) => {
      const prev = [...ZOOM_STEPS].reverse().find((s) => s < curr);
      return prev !== undefined ? prev : curr;
    });
  };

  const handleResetZoom = () => {
    setZoomPercent(100);
    setPanX(0);
    setPanY(0);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

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
    if (e.button === 1 || (e.button === 0 && (e.altKey || isSpacePressed))) {
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
      setHoverRegion(region ? `${region.name} (${region.layer === 'overlay' ? 'Layer 2' : 'Base'})` : `X: ${coords.x}, Y: ${coords.y}`);
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
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="canvas-controls-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button className="tool-btn-sm" onClick={handleZoomOut} title="Zoom Out (-)">
            ➖
          </button>
          <button
            className="tool-btn-sm"
            onClick={handleResetZoom}
            title="Reset to 100% (0)"
            style={{ minWidth: '54px', fontWeight: 700, fontSize: '11px', color: '#38bdf8' }}
          >
            {zoomPercent}%
          </button>
          <button className="tool-btn-sm" onClick={handleZoomIn} title="Zoom In (+)">
            ➕
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            className={`tool-btn-sm ${showGrid ? 'active' : ''}`}
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Pixel Grid"
          >
            ▦ Grid
          </button>
          <button
            className={`tool-btn-sm ${showUVLabels ? 'active' : ''}`}
            onClick={() => setShowUVLabels(!showUVLabels)}
            title="Toggle UV Outlines"
          >
            🏷️ UV
          </button>
          <button
            className="tool-btn-sm"
            onClick={handleResetZoom}
            title="Reset Pan & Zoom"
          >
            🎯
          </button>
        </div>

        {hoverRegion && <span className="hover-region-badge">{hoverRegion}</span>}
      </div>

      <div
        className="canvas-render-wrapper"
        style={{
          transform: `translate(${panX}px, ${panY}px)`,
          width: `${canvasDisplaySize}px`,
          height: `${canvasDisplaySize}px`,
        }}
      >
        <canvas
          ref={checkerboardCanvasRef}
          width={64}
          height={64}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${canvasDisplaySize}px`,
            height: `${canvasDisplaySize}px`,
            imageRendering: 'pixelated',
          }}
        />
        <canvas
          ref={canvasRef}
          width={64}
          height={64}
          className="canvas2d-main"
          style={{
            position: 'relative',
            width: `${canvasDisplaySize}px`,
            height: `${canvasDisplaySize}px`,
            imageRendering: 'pixelated',
          }}
        />
        <canvas
          ref={overlayCanvasRef}
          className="canvas2d-overlay"
          style={{ width: `${canvasDisplaySize}px`, height: `${canvasDisplaySize}px` }}
        />
      </div>
    </div>
  );
};
