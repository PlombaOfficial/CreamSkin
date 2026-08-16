import { SkinTextureBuffer } from '../engine/SkinTextureBuffer';
import { ModelType } from '../types';

export interface SkinTemplate {
  id: string;
  name: string;
  category: string;
  modelType: ModelType;
  description: string;
  generate: () => SkinTextureBuffer;
}

export const SKIN_TEMPLATES: SkinTemplate[] = [
  {
    id: 'blank_classic',
    name: 'Blank Base (Classic)',
    category: 'Basic',
    modelType: 'classic',
    description: 'Clean blank 64x64 skin template with base skin tone ready for painting.',
    generate: () => {
      const buf = new SkinTextureBuffer();
      const skinColor = { r: 242, g: 193, b: 153, a: 255 };
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 32; x++) {
          buf.setPixel(x, y, skinColor);
        }
      }
      return buf;
    },
  },
  {
    id: 'blank_slim',
    name: 'Blank Base (Slim 3px)',
    category: 'Basic',
    modelType: 'slim',
    description: 'Clean blank 64x64 template configured for 3-pixel slim arms.',
    generate: () => {
      const buf = new SkinTextureBuffer();
      const skinColor = { r: 245, g: 200, b: 165, a: 255 };
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 32; x++) {
          buf.setPixel(x, y, skinColor);
        }
      }
      return buf;
    },
  },
  {
    id: 'classic_steve',
    name: 'Classic Steve',
    category: 'Default',
    modelType: 'classic',
    description: 'The iconic Minecraft Steve with cyan shirt, blue jeans, and brown shoes.',
    generate: () => {
      const buf = new SkinTextureBuffer();
      const skin = { r: 195, g: 139, b: 102, a: 255 };
      const hair = { r: 74, g: 50, b: 35, a: 255 };
      const cyanShirt = { r: 0, g: 168, b: 181, a: 255 };
      const blueJeans = { r: 43, g: 59, b: 122, a: 255 };
      const shoes = { r: 110, g: 110, b: 110, a: 255 };

      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 32; x++) {
          buf.setPixel(x, y, y < 4 ? hair : skin);
        }
      }
      buf.setPixel(10, 10, { r: 255, g: 255, b: 255, a: 255 });
      buf.setPixel(11, 10, { r: 40, g: 40, b: 180, a: 255 });
      buf.setPixel(13, 10, { r: 255, g: 255, b: 255, a: 255 });
      buf.setPixel(14, 10, { r: 40, g: 40, b: 180, a: 255 });

      for (let y = 16; y < 32; y++) {
        for (let x = 16; x < 40; x++) {
          buf.setPixel(x, y, cyanShirt);
        }
      }

      for (let y = 16; y < 32; y++) {
        for (let x = 40; x < 56; x++) {
          buf.setPixel(x, y, y < 20 ? cyanShirt : skin);
        }
        for (let x = 32; x < 48; x++) {
          buf.setPixel(x, y + 32, y < 20 ? cyanShirt : skin);
        }
      }

      for (let y = 16; y < 32; y++) {
        for (let x = 0; x < 16; x++) {
          buf.setPixel(x, y, y > 28 ? shoes : blueJeans);
        }
        for (let x = 16; x < 32; x++) {
          buf.setPixel(x, y + 32, y > 28 ? shoes : blueJeans);
        }
      }

      return buf;
    },
  },
  {
    id: 'cyber_ninja',
    name: 'Cyberpunk Neon Ninja',
    category: 'Sci-Fi',
    modelType: 'classic',
    description: 'Stealth combat suit with glowing neon cyan visor and carbon fiber plating.',
    generate: () => {
      const buf = new SkinTextureBuffer();
      const darkSuit = { r: 22, g: 24, b: 32, a: 255 };
      const neonCyan = { r: 0, g: 240, b: 255, a: 255 };
      const armorPlate = { r: 45, g: 49, b: 64, a: 255 };

      for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 64; x++) {
          buf.setPixel(x, y, darkSuit);
        }
      }

      for (let x = 9; x <= 14; x++) {
        buf.setPixel(x, 10, neonCyan);
      }

      for (let y = 20; y <= 30; y += 2) {
        buf.setPixel(23, y, neonCyan);
        buf.setPixel(24, y, neonCyan);
      }
      for (let x = 20; x <= 27; x++) {
        buf.setPixel(x, 22, armorPlate);
      }

      for (let x = 44; x <= 47; x++) {
        buf.setPixel(x, 26, neonCyan);
      }
      for (let x = 36; x <= 39; x++) {
        buf.setPixel(x, 58, neonCyan);
      }

      return buf;
    },
  },
  {
    id: 'golden_knight',
    name: 'Royal Golden Knight',
    category: 'Medieval',
    modelType: 'classic',
    description: 'Gleaming polished gold and steel armor with royal crimson cape and crown.',
    generate: () => {
      const buf = new SkinTextureBuffer();
      const gold = { r: 255, g: 204, b: 0, a: 255 };
      const darkGold = { r: 190, g: 145, b: 0, a: 255 };
      const steel = { r: 120, g: 125, b: 140, a: 255 };
      const crimson = { r: 180, g: 30, b: 40, a: 255 };

      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 32; x++) {
          buf.setPixel(x, y, steel);
        }
      }
      for (let x = 9; x <= 14; x++) {
        buf.setPixel(x, 10, { r: 20, g: 20, b: 25, a: 255 });
      }

      for (let x = 32; x < 64; x++) {
        buf.setPixel(x, 7, gold);
        if (x % 2 === 0) buf.setPixel(x, 6, darkGold);
      }

      for (let y = 16; y < 32; y++) {
        for (let x = 16; x < 40; x++) {
          buf.setPixel(x, y, x >= 32 ? crimson : gold);
        }
      }

      for (let y = 16; y < 32; y++) {
        for (let x = 40; x < 56; x++) buf.setPixel(x, y, steel);
        for (let x = 0; x < 16; x++) buf.setPixel(x, y, steel);
        for (let x = 32; x < 48; x++) buf.setPixel(x, y + 32, steel);
        for (let x = 16; x < 32; x++) buf.setPixel(x, y + 32, steel);
      }

      return buf;
    },
  },
  {
    id: 'mystic_wizard',
    name: 'Mystic Arcane Wizard',
    category: 'Fantasy',
    modelType: 'classic',
    description: 'Deep violet robes woven with arcane runes and cosmic star patterns.',
    generate: () => {
      const buf = new SkinTextureBuffer();
      const purple = { r: 85, g: 35, b: 145, a: 255 };
      const goldTrim = { r: 255, g: 215, b: 0, a: 255 };
      const skin = { r: 240, g: 195, b: 160, a: 255 };
      const beard = { r: 220, g: 220, b: 230, a: 255 };

      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 32; x++) buf.setPixel(x, y, skin);
      }
      for (let y = 11; y <= 15; y++) {
        for (let x = 8; x <= 15; x++) buf.setPixel(x, y, beard);
      }
      for (let y = 0; y < 16; y++) {
        for (let x = 32; x < 64; x++) {
          if (y < 9 || x < 40 || x > 47) buf.setPixel(x, y, purple);
        }
      }

      for (let y = 16; y < 32; y++) {
        for (let x = 16; x < 40; x++) buf.setPixel(x, y, purple);
        for (let x = 0; x < 16; x++) buf.setPixel(x, y, purple);
        for (let x = 40; x < 56; x++) buf.setPixel(x, y, purple);
        for (let x = 16; x < 32; x++) buf.setPixel(x, y + 32, purple);
        for (let x = 32; x < 48; x++) buf.setPixel(x, y + 32, purple);
      }

      for (let y = 16; y < 32; y++) {
        buf.setPixel(23, y, goldTrim);
        buf.setPixel(24, y, goldTrim);
      }

      return buf;
    },
  },
];
