import { ColorRGBA, LayerType, BodyPart } from '../types';
import { findUVRegion } from './SkinUVMap';

export class SkinTextureBuffer {
  public readonly width = 64;
  public readonly height = 64;
  public data: Uint8ClampedArray;

  constructor(initialData?: Uint8ClampedArray) {
    this.data = initialData ? new Uint8ClampedArray(initialData) : new Uint8ClampedArray(64 * 64 * 4);
  }

  public getPixel(x: number, y: number): ColorRGBA {
    if (x < 0 || x >= 64 || y < 0 || y >= 64) {
      return { r: 0, g: 0, b: 0, a: 0 };
    }
    const idx = (y * 64 + x) * 4;
    return {
      r: this.data[idx],
      g: this.data[idx + 1],
      b: this.data[idx + 2],
      a: this.data[idx + 3],
    };
  }

  public setPixel(
    x: number,
    y: number,
    color: ColorRGBA,
    activeLayer: LayerType = 'both',
    activePart: BodyPart = 'all'
  ): boolean {
    if (x < 0 || x >= 64 || y < 0 || y >= 64) return false;

    const region = findUVRegion(x, y);
    if (region) {
      if (activeLayer !== 'both' && region.layer !== activeLayer) {
        return false;
      }
      if (activePart !== 'all' && region.part !== activePart) {
        return false;
      }
    }

    const idx = (y * 64 + x) * 4;
    this.data[idx] = color.r;
    this.data[idx + 1] = color.g;
    this.data[idx + 2] = color.b;
    this.data[idx + 3] = color.a;
    return true;
  }

  public clearPixel(x: number, y: number): boolean {
    if (x < 0 || x >= 64 || y < 0 || y >= 64) return false;
    const idx = (y * 64 + x) * 4;
    this.data[idx] = 0;
    this.data[idx + 1] = 0;
    this.data[idx + 2] = 0;
    this.data[idx + 3] = 0;
    return true;
  }

  public clone(): SkinTextureBuffer {
    return new SkinTextureBuffer(this.data);
  }

  public copyFrom(other: SkinTextureBuffer) {
    this.data.set(other.data);
  }

  public toBase64PNG(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const imgData = ctx.createImageData(64, 64);
    imgData.data.set(this.data);
    ctx.putImageData(imgData, 0, 0);

    return canvas.toDataURL('image/png');
  }

  public async loadFromBase64PNG(base64: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No 2d context');

        ctx.imageSmoothingEnabled = false;

        if (img.height === 32) {
          ctx.drawImage(img, 0, 0);
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(canvas, 40, 16, 16, 16, -48, 48, 16, 16);
          ctx.drawImage(canvas, 0, 16, 16, 16, -32, 48, 16, 16);
          ctx.restore();
        } else {
          ctx.drawImage(img, 0, 0, 64, 64);
        }

        const imgData = ctx.getImageData(0, 0, 64, 64);
        this.data.set(imgData.data);
        resolve();
      };
      img.onerror = () => reject('Failed to load image');
      img.src = base64;
    });
  }
}
