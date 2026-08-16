/**
 * Real Minecraft Java Edition Player API Service.
 * Fetches real public player skin data, textures, and UUIDs.
 */

export interface MinecraftPlayerProfile {
  uuid: string;
  username: string;
  skinUrl: string;
  base64Png?: string;
  modelType: 'classic' | 'slim';
}

// Curated list of well-known real Minecraft players for initial community showcase
export const FEATURED_REAL_PLAYERS = [
  'Notch',
  'jeb_',
  'Dinnerbone',
  'Technoblade',
  'DanTDM',
  'CaptainSparklez',
  'Mumbo',
  'Grian',
  'Dream',
  'Skeppy',
];

export class MinecraftApiService {
  private static skinCache = new Map<string, MinecraftPlayerProfile>();

  /**
   * Fetch player profile and real skin texture by Minecraft Java username
   */
  public static async getPlayerProfile(username: string): Promise<MinecraftPlayerProfile | null> {
    const cleanUsername = username.trim();
    if (!cleanUsername || cleanUsername.length > 16) return null;

    if (this.skinCache.has(cleanUsername.toLowerCase())) {
      return this.skinCache.get(cleanUsername.toLowerCase())!;
    }

    try {
      // 1. Try Ashcon Mojang API (CORS friendly, full texture data)
      const res = await fetch(`https://api.ashcon.app/mojang/v2/user/${encodeURIComponent(cleanUsername)}`);
      if (res.ok) {
        const data = await res.json();
        const profile: MinecraftPlayerProfile = {
          uuid: data.uuid,
          username: data.username,
          skinUrl: data.textures?.skin?.url || `https://crafatar.com/skins/${data.uuid}`,
          modelType: data.textures?.skin?.slim ? 'slim' : 'classic',
          base64Png: data.textures?.skin?.data ? `data:image/png;base64,${data.textures.skin.data}` : undefined,
        };

        // If base64 data not in payload, fetch raw image
        if (!profile.base64Png && profile.skinUrl) {
          profile.base64Png = await this.fetchImageAsBase64(profile.skinUrl);
        }

        this.skinCache.set(cleanUsername.toLowerCase(), profile);
        return profile;
      }
    } catch {
      // Fallback
    }

    try {
      // 2. Fallback: Minotar / Crafatar direct texture url
      const fallbackUrl = `https://minotar.net/skin/${encodeURIComponent(cleanUsername)}`;
      const base64 = await this.fetchImageAsBase64(fallbackUrl);

      if (base64) {
        const profile: MinecraftPlayerProfile = {
          uuid: cleanUsername.toLowerCase(),
          username: cleanUsername,
          skinUrl: fallbackUrl,
          base64Png: base64,
          modelType: 'classic',
        };
        this.skinCache.set(cleanUsername.toLowerCase(), profile);
        return profile;
      }
    } catch {}

    return null;
  }

  /**
   * Convert image URL to base64 Data URL for Three.js and Canvas editing
   */
  public static async fetchImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 64;
        canvas.height = img.height || 64;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(url);
        }
      };
      img.onerror = () => {
        resolve(url);
      };
      img.src = url;
    });
  }
}
