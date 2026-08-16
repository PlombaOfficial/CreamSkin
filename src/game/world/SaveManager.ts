import { World } from './World';
import { Player } from '../entities/Player';

export class SaveManager {
  private dbName = 'Minecraft2DSandboxDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  public async init(): Promise<void> {
    return new Promise((resolve) => {
      const req = indexedDB.open(this.dbName, this.dbVersion);

      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('world_saves')) {
          db.createObjectStore('world_saves', { keyPath: 'id' });
        }
      };

      req.onsuccess = () => {
        this.db = req.result;
        resolve();
      };

      req.onerror = () => {
        console.warn('IndexedDB opening failed, falling back to LocalStorage');
        resolve();
      };
    });
  }

  public async saveGame(worldId: string, world: World, player: Player): Promise<boolean> {
    const saveData = {
      id: worldId,
      seed: world.seed,
      player: {
        x: player.x,
        y: player.y,
        health: player.health,
        hunger: player.hunger,
        experience: player.experience,
        level: player.level,
        inventory: player.inventory.serialize(),
      },
      modifiedChunks: Array.from(world.modifiedChunks.values()).map(c => c.serialize()),
      chests: Array.from(world.chests.values()).map(c => c.toJSON()),
      furnaces: Array.from(world.furnaces.values()).map(f => f.toJSON()),
      savedAt: Date.now(),
    };

    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db!.transaction('world_saves', 'readwrite');
        const store = tx.objectStore('world_saves');
        const req = store.put(saveData);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } else {
      try {
        localStorage.setItem(`save_${worldId}`, JSON.stringify(saveData));
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  public async loadGame(worldId: string): Promise<any | null> {
    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db!.transaction('world_saves', 'readonly');
        const store = tx.objectStore('world_saves');
        const req = store.get(worldId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } else {
      const raw = localStorage.getItem(`save_${worldId}`);
      return raw ? JSON.parse(raw) : null;
    }
  }
}

export const saveManager = new SaveManager();
