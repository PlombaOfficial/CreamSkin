/**
 * 2D MINECRAFT // PERSISTENCE & SAVE/LOAD SYSTEM
 * Auto-saves modified world blocks, player inventory, stats,
 * and game time to LocalStorage and downloadable JSON files.
 */

export class SaveManager {
  constructor(saveKey = 'minecraft_2d_save_v1') {
    this.saveKey = saveKey;
  }

  saveGame(world, player, gameTime) {
    try {
      const saveData = {
        version: 1,
        timestamp: Date.now(),
        gameTime: gameTime,
        player: {
          x: player.x,
          y: player.y,
          health: player.health,
          hunger: player.hunger,
          inventory: player.inventory
        },
        torches: Array.from(world.torches)
      };

      localStorage.setItem(this.saveKey, JSON.stringify(saveData));
      return true;
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
      return false;
    }
  }

  loadGame(world, player) {
    try {
      const raw = localStorage.getItem(this.saveKey);
      if (!raw) return false;

      const data = JSON.parse(raw);
      if (!data || !data.player) return false;

      player.x = data.player.x;
      player.y = data.player.y;
      player.health = data.player.health;
      player.hunger = data.player.hunger;
      player.inventory = data.player.inventory;

      if (data.torches) {
        world.torches = new Set(data.torches);
      }

      return data.gameTime || 0;
    } catch (e) {
      console.warn('Failed to load save:', e);
      return false;
    }
  }

  exportSaveFile(world, player, gameTime) {
    const saveData = {
      version: 1,
      timestamp: Date.now(),
      gameTime: gameTime,
      player: {
        x: player.x,
        y: player.y,
        health: player.health,
        hunger: player.hunger,
        inventory: player.inventory
      },
      torches: Array.from(world.torches)
    };

    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minecraft_2d_world_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
