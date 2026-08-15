/**
 * 2D MINECRAFT // LOCAL DEVICE PROFILE & MULTI-WORLD STORAGE ENGINE
 * Saves user nickname/skin profile, multiple saved worlds on device,
 * and handles import/export.
 */

export class SaveManager {
  constructor() {
    this.profileKey = 'mc_user_profile_v1';
    this.worldsListKey = 'mc_saved_worlds_list_v1';
  }

  // Profile (Nickname & Skin)
  saveProfile(name, color) {
    localStorage.setItem(this.profileKey, JSON.stringify({ name, color }));
  }

  loadProfile() {
    try {
      const raw = localStorage.getItem(this.profileKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { name: 'Стив', color: '#00aaaa' };
  }

  // Multi-World Device Storage
  listWorlds() {
    try {
      const raw = localStorage.getItem(this.worldsListKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }

  saveWorld(worldId, worldName, seed, world, player, gameTime, dimension) {
    try {
      const worlds = this.listWorlds();
      const existingIdx = worlds.findIndex(w => w.id === worldId);

      const worldMeta = {
        id: worldId,
        name: worldName,
        seed: seed,
        dimension: dimension || 'overworld',
        lastPlayed: Date.now(),
        playerHealth: player.health,
        gameTime: gameTime
      };

      if (existingIdx !== -1) worlds[existingIdx] = worldMeta;
      else worlds.unshift(worldMeta);

      localStorage.setItem(this.worldsListKey, JSON.stringify(worlds));

      // Detailed World Content
      const worldContent = {
        seed: seed,
        gameTime: gameTime,
        dimension: dimension,
        player: {
          x: player.x,
          y: player.y,
          health: player.health,
          hunger: player.hunger,
          inventory: player.inventory
        },
        torches: Array.from(world.torches)
      };

      localStorage.setItem(`mc_world_data_${worldId}`, JSON.stringify(worldContent));
      return true;
    } catch (e) {
      console.warn('World save failed:', e);
      return false;
    }
  }

  loadWorld(worldId) {
    try {
      const raw = localStorage.getItem(`mc_world_data_${worldId}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  deleteWorld(worldId) {
    try {
      let worlds = this.listWorlds();
      worlds = worlds.filter(w => w.id !== worldId);
      localStorage.setItem(this.worldsListKey, JSON.stringify(worlds));
      localStorage.removeItem(`mc_world_data_${worldId}`);
    } catch (e) {}
  }
}
