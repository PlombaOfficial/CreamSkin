import { SkinTextureBuffer } from '../engine/SkinTextureBuffer';
import { ColorRGBA } from '../types';
import { ToolConfig } from './ToolTypes';
import { findUVRegion } from '../engine/SkinUVMap';

export class ToolEngine {
  public static applyBrush(
    buffer: SkinTextureBuffer,
    cx: number,
    cy: number,
    config: ToolConfig
  ) {
    const radius = Math.floor(config.brushSize / 2);
    const color = config.primaryColor;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const px = cx + dx;
        const py = cy + dy;

        let finalColor = color;
        if (config.activeTool === 'noise' && config.noiseAmount > 0) {
          const delta = (Math.random() - 0.5) * config.noiseAmount * 2;
          finalColor = {
            r: Math.max(0, Math.min(255, Math.round(color.r + delta))),
            g: Math.max(0, Math.min(255, Math.round(color.g + delta))),
            b: Math.max(0, Math.min(255, Math.round(color.b + delta))),
            a: color.a,
          };
        }

        if (config.activeTool === 'eraser') {
          buffer.clearPixel(px, py);
        } else {
          buffer.setPixel(px, py, finalColor, config.activeLayer, config.activePart);
        }

        if (config.symmetryX) {
          const region = findUVRegion(px, py);
          if (region) {
            const relX = px - region.x;
            const symX = region.x + (region.w - 1 - relX);
            if (config.activeTool === 'eraser') {
              buffer.clearPixel(symX, py);
            } else {
              buffer.setPixel(symX, py, finalColor, config.activeLayer, config.activePart);
            }
          }
        }
      }
    }
  }

  public static drawLine(
    buffer: SkinTextureBuffer,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    config: ToolConfig
  ) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let cx = x0;
    let cy = y0;

    while (true) {
      this.applyBrush(buffer, cx, cy, config);
      if (cx === x1 && cy === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        cx += sx;
      }
      if (e2 < dx) {
        err += dx;
        cy += sy;
      }
    }
  }

  public static drawRectangle(
    buffer: SkinTextureBuffer,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    config: ToolConfig,
    fill: boolean = true
  ) {
    const minX = Math.min(x0, x1);
    const maxX = Math.max(x0, x1);
    const minY = Math.min(y0, y1);
    const maxY = Math.max(y0, y1);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (fill || x === minX || x === maxX || y === minY || y === maxY) {
          this.applyBrush(buffer, x, y, config);
        }
      }
    }
  }

  public static drawCircle(
    buffer: SkinTextureBuffer,
    cx: number,
    cy: number,
    r: number,
    config: ToolConfig,
    fill: boolean = true
  ) {
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        const d = Math.hypot(x - cx, y - cy);
        if (fill ? d <= r : Math.abs(d - r) < 0.75) {
          this.applyBrush(buffer, x, y, config);
        }
      }
    }
  }

  public static floodFill(
    buffer: SkinTextureBuffer,
    startX: number,
    startY: number,
    fillColor: ColorRGBA,
    activeLayer: ToolConfig['activeLayer'],
    activePart: ToolConfig['activePart']
  ) {
    const target = buffer.getPixel(startX, startY);
    if (
      target.r === fillColor.r &&
      target.g === fillColor.g &&
      target.b === fillColor.b &&
      target.a === fillColor.a
    ) {
      return;
    }

    const queue: [number, number][] = [[startX, startY]];
    const visited = new Uint8Array(64 * 64);
    visited[startY * 64 + startX] = 1;

    const startRegion = findUVRegion(startX, startY);

    while (queue.length > 0) {
      const [cx, cy] = queue.shift()!;
      const current = buffer.getPixel(cx, cy);

      if (
        current.r === target.r &&
        current.g === target.g &&
        current.b === target.b &&
        current.a === target.a
      ) {
        buffer.setPixel(cx, cy, fillColor, activeLayer, activePart);

        const neighbors: [number, number][] = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1],
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < 64 && ny >= 0 && ny < 64) {
            const idx = ny * 64 + nx;
            if (!visited[idx]) {
              visited[idx] = 1;
              if (startRegion) {
                const nRegion = findUVRegion(nx, ny);
                if (nRegion !== startRegion) continue;
              }
              queue.push([nx, ny]);
            }
          }
        }
      }
    }
  }
}
