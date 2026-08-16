import { BLOCK_SIZE } from '../world/WorldConstants';

export class Camera {
  public x: number = 0;
  public y: number = 0;
  public zoom: number = 3.0; // Pixel art zoom scale
  public viewportWidth: number = 800;
  public viewportHeight: number = 600;

  constructor() {}

  public resize(width: number, height: number) {
    this.viewportWidth = width;
    this.viewportHeight = height;
    // Auto-adjust zoom for screen size (crisp integer scaling)
    if (width < 600) {
      this.zoom = 2.0;
    } else if (width > 1600) {
      this.zoom = 3.5;
    } else {
      this.zoom = 2.75;
    }
  }

  public follow(targetX: number, targetY: number, dt: number) {
    // Smooth camera lag
    const targetPxX = targetX * BLOCK_SIZE;
    const targetPxY = targetY * BLOCK_SIZE;

    const lerpSpeed = 8.0;
    this.x += (targetPxX - this.x) * Math.min(1.0, dt * lerpSpeed);
    this.y += (targetPxY - this.y) * Math.min(1.0, dt * lerpSpeed);
  }

  public worldToScreen(worldX: number, worldY: number): { sx: number; sy: number } {
    const pxX = worldX * BLOCK_SIZE;
    const pxY = worldY * BLOCK_SIZE;

    const sx = (pxX - this.x) * this.zoom + this.viewportWidth / 2;
    // Invert Y because canvas Y grows downwards
    const sy = (this.y - pxY) * this.zoom + this.viewportHeight / 2;

    return { sx, sy };
  }

  public screenToWorld(screenX: number, screenY: number): { wx: number; wy: number } {
    const pxX = (screenX - this.viewportWidth / 2) / this.zoom + this.x;
    const pxY = this.y - (screenY - this.viewportHeight / 2) / this.zoom;

    return {
      wx: pxX / BLOCK_SIZE,
      wy: pxY / BLOCK_SIZE,
    };
  }
}
