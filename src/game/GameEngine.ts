import { World } from './world/World';
import { Player } from './entities/Player';
import { Mob, ZombieMob, SkeletonMob, SlimeMob, PigMob, SheepMob } from './entities/Mobs';
import { ItemDrop } from './entities/ItemDrop';
import { ParticleSystem } from './entities/ParticleSystem';
import { WeatherEngine } from './weather/WeatherEngine';
import { GameRenderer } from './renderer/GameRenderer';
import { audioManager } from './audio/AudioManager';
import { firebaseService } from './multiplayer/FirebaseService';
import { saveManager } from './world/SaveManager';
import { BlockType, RemotePlayerState } from './types';
import { ITEM_DEFINITIONS } from './inventory/ItemData';

export interface GameUIState {
  isInventoryOpen: boolean;
  isChestOpen: boolean;
  isFurnaceOpen: boolean;
  activeChestKey: string | null;
  activeFurnaceKey: string | null;
  isPaused: boolean;
  isDead: boolean;
  isChatOpen: boolean;
  isSettingsOpen: boolean;
}

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public renderer: GameRenderer;
  public world: World;
  public player: Player;
  public mobs: Mob[] = [];
  public itemDrops: ItemDrop[] = [];
  public remotePlayers: RemotePlayerState[] = [];
  public particles: ParticleSystem;
  public weather: WeatherEngine;

  public isRunning = false;
  private lastFrameTime = 0;

  // Input states
  public keys = {
    left: false,
    right: false,
    jump: false,
    sprint: false,
  };
  public mouseScreenX = 0;
  public mouseScreenY = 0;
  public isMouseDownLeft = false;
  public isMouseDownRight = false;

  // UI modal flags
  public uiState: GameUIState = {
    isInventoryOpen: false,
    isChestOpen: false,
    isFurnaceOpen: false,
    activeChestKey: null,
    activeFurnaceKey: null,
    isPaused: false,
    isDead: false,
    isChatOpen: false,
    isSettingsOpen: false,
  };

  public onUIStateChange: ((state: GameUIState) => void) | null = null;
  public onStatsChange: (() => void) | null = null;

  private mobSpawnTimer = 0;
  private autoSaveTimer = 0;

  constructor(canvas: HTMLCanvasElement, seed: number = 554433) {
    this.canvas = canvas;
    this.renderer = new GameRenderer(canvas);
    this.world = new World(seed);
    this.player = new Player(0, 80);
    this.particles = new ParticleSystem();
    this.weather = new WeatherEngine();

    this.initWorldAndPlayer();
    this.setupNetworkListeners();
  }

  private initWorldAndPlayer() {
    // Find highest surface point for safe initial spawn
    this.world.updateChunksAround(0);
    let spawnY = 80;
    for (let y = 120; y >= 0; y--) {
      const b = this.world.getBlock(0, y);
      if (b !== BlockType.AIR && b !== BlockType.WATER) {
        spawnY = y + 2;
        break;
      }
    }
    this.player.x = 0;
    this.player.y = spawnY;
    this.player.spawnX = 0;
    this.player.spawnY = spawnY;
    this.renderer.camera.x = this.player.x * 16;
    this.renderer.camera.y = this.player.y * 16;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    saveManager.init();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  public stop() {
    this.isRunning = false;
  }

  private gameLoop(timestamp: number) {
    if (!this.isRunning) return;

    const dt = Math.min(0.1, (timestamp - this.lastFrameTime) / 1000);
    this.lastFrameTime = timestamp;

    if (!this.uiState.isPaused) {
      this.update(dt);
    }
    this.render();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(dt: number) {
    // 1. Process Player Input & Physics
    if (!this.isAnyModalOpen()) {
      this.player.handleInput(this.keys, dt);
    } else {
      this.player.vx = 0;
    }

    this.player.update(dt, this.world);
    this.world.updateChunksAround(this.player.x * 16);

    // Update Death state
    if (this.player.isDead && !this.uiState.isDead) {
      this.setUIState({ isDead: true });
    }

    // 2. Mining and Interaction
    const cursor = this.getCursorWorldCoords();
    if (this.isMouseDownLeft && !this.isAnyModalOpen()) {
      // Check if clicking on mob first (attack)
      const hitMob = this.findMobAt(cursor.wx, cursor.wy);
      if (hitMob && !hitMob.isDead) {
        const held = this.player.inventory.getSelectedItem();
        const def = held ? ITEM_DEFINITIONS[held.id] : null;
        const dmg = def?.attackDamage || 1.5;
        const kb = this.player.facingLeft ? -6 : 6;
        if (hitMob.takeDamage(dmg, kb)) {
          audioManager.playHurt(false);
          this.particles.spawnCrit(hitMob.x, hitMob.y + 0.8);
          this.player.swingProgress = 0.5;
          if (hitMob.isDead) {
            this.player.addExperience(hitMob.dropXp);
            if (hitMob.dropItemId) {
              this.spawnItemDrop(hitMob.dropItemId, 1, hitMob.x, hitMob.y + 0.5);
            }
          }
        }
      } else {
        // Mine block
        this.player.startMining(cursor.wx, cursor.wy);
      }
    } else {
      this.player.stopMining();
    }

    this.player.updateMining(this.world, dt, (drop, tx, ty) => {
      const bColor = '#888888';
      this.particles.spawnBlockDebris(tx + 0.5, ty + 0.5, bColor, 10);
      if (drop && drop.dropCount > 0) {
        this.spawnItemDrop(drop.dropId, drop.dropCount, tx + 0.5, ty + 0.5);
      }
      // Record block delta for multiplayer sync
      firebaseService.recordBlockDelta({
        x: tx,
        y: ty,
        block: BlockType.AIR,
        playerUid: firebaseService.currentUser?.uid || 'local',
        timestamp: Date.now(),
      });
    });

    // 3. Update Mobs
    for (let i = this.mobs.length - 1; i >= 0; i--) {
      const mob = this.mobs[i];
      mob.updateAI(dt, this.player, this.world);
      mob.update(dt, this.world);
      if (mob.isDead) {
        this.mobs.splice(i, 1);
      }
    }

    // 4. Update Item Drops & Magnet
    for (let i = this.itemDrops.length - 1; i >= 0; i--) {
      const drop = this.itemDrops[i];
      drop.update(dt, this.world);
      drop.updateMagnet(this.player, dt);
      if (drop.isDead) {
        this.itemDrops.splice(i, 1);
      }
    }

    // 5. Update Particles & Weather
    this.particles.update(dt);
    this.weather.update(
      dt,
      this.renderer.camera.x / 16,
      this.renderer.camera.y / 16,
      this.canvas.width / (16 * this.renderer.camera.zoom),
      this.canvas.height / (16 * this.renderer.camera.zoom)
    );

    // 6. Update World Machines (Furnaces, Liquids)
    this.world.updateFurnaces();
    this.world.updateLiquids();

    // 7. Dynamic Mob Spawner (cap at 15 mobs)
    this.mobSpawnTimer += dt;
    if (this.mobSpawnTimer >= 5.0 && this.mobs.length < 15) {
      this.mobSpawnTimer = 0;
      this.trySpawnMob();
    }

    // 8. Follow camera
    this.renderer.camera.follow(this.player.x, this.player.y + 0.9, dt);

    // 9. Sync local state to Firebase Multiplayer
    firebaseService.syncPlayerState({
      x: this.player.x,
      y: this.player.y,
      vx: this.player.vx,
      vy: this.player.vy,
      facingLeft: this.player.facingLeft,
      selectedSlot: this.player.inventory.selectedSlot,
      heldItemId: this.player.inventory.getSelectedItem()?.id || null,
      isMining: this.player.isMining,
      isWalking: Math.abs(this.player.vx) > 0.2,
      health: this.player.health,
      skinColor: '#f8d0a8',
      shirtColor: '#3498db',
      pantsColor: '#2980b9',
    });

    // 10. Auto-save game to IndexedDB every 25 seconds
    this.autoSaveTimer += dt;
    if (this.autoSaveTimer >= 25.0) {
      this.autoSaveTimer = 0;
      saveManager.saveGame('world_primary', this.world, this.player);
    }

    if (this.onStatsChange) {
      this.onStatsChange();
    }
  }

  private render() {
    const cursor = this.getCursorWorldCoords();
    this.renderer.render(
      this.world,
      this.player,
      this.mobs,
      this.itemDrops,
      this.remotePlayers,
      this.particles,
      this.weather,
      cursor.wx,
      cursor.wy
    );
  }

  private trySpawnMob() {
    const spawnSide = Math.random() > 0.5 ? 1 : -1;
    const spawnDistance = 14 + Math.random() * 8;
    const spawnX = Math.floor(this.player.x + spawnSide * spawnDistance);

    // Find surface Y at spawnX
    let surfaceY = -1;
    for (let y = 120; y >= 2; y--) {
      const b = this.world.getBlock(spawnX, y);
      if (b !== BlockType.AIR && b !== BlockType.WATER) {
        surfaceY = y + 1;
        break;
      }
    }

    if (surfaceY < 0) return;

    const isNight = this.weather.timeOfDay > 13000 || this.weather.timeOfDay < 1000;
    const chunkX = Math.floor(spawnX / 16);
    const localX = ((spawnX % 16) + 16) % 16;
    const chunk = this.world.getChunk(chunkX);
    const skyL = chunk ? chunk.getSkyLight(localX, surfaceY) : 15;
    const blkL = chunk ? chunk.getBlockLight(localX, surfaceY) : 0;
    const lightLevel = Math.max(skyL * this.weather.getSkyColor().ambientLight, blkL);

    const mobId = `mob_${Date.now()}_${Math.random()}`;

    if (isNight || lightLevel < 7) {
      // Hostile mobs
      const r = Math.random();
      if (r < 0.5) {
        this.mobs.push(new ZombieMob(mobId, spawnX + 0.5, surfaceY));
      } else if (r < 0.8) {
        this.mobs.push(new SkeletonMob(mobId, spawnX + 0.5, surfaceY));
      } else {
        this.mobs.push(new SlimeMob(mobId, spawnX + 0.5, surfaceY));
      }
    } else {
      // Passive mobs
      if (Math.random() > 0.5) {
        this.mobs.push(new PigMob(mobId, spawnX + 0.5, surfaceY));
      } else {
        this.mobs.push(new SheepMob(mobId, spawnX + 0.5, surfaceY));
      }
    }
  }

  public spawnItemDrop(itemId: string, count: number, x: number, y: number) {
    const drop = new ItemDrop(`drop_${Date.now()}_${Math.random()}`, { id: itemId, count }, x, y);
    this.itemDrops.push(drop);
  }

  private findMobAt(wx: number, wy: number): Mob | null {
    for (const mob of this.mobs) {
      if (mob.getBoundingBox().contains(wx, wy)) {
        return mob;
      }
    }
    return null;
  }

  public handleRightClick(screenX: number, screenY: number) {
    if (this.isAnyModalOpen()) return;
    const cam = this.renderer.camera;
    const worldCoords = cam.screenToWorld(screenX, screenY);
    const wx = Math.floor(worldCoords.wx);
    const wy = Math.floor(worldCoords.wy);

    const clickedBlock = this.world.getBlock(wx, wy);

    // 1. Check interactive containers / workbenches
    if (clickedBlock === BlockType.CRAFTING_TABLE) {
      this.player.inventory.craftingStation = 'workbench';
      this.setUIState({ isInventoryOpen: true });
      audioManager.playChest();
      return;
    }

    if (clickedBlock === BlockType.CHEST) {
      const key = `${wx},${wy}`;
      this.setUIState({ isChestOpen: true, activeChestKey: key });
      audioManager.playChest();
      return;
    }

    if (clickedBlock === BlockType.FURNACE || clickedBlock === BlockType.FURNACE_ACTIVE) {
      const key = `${wx},${wy}`;
      this.setUIState({ isFurnaceOpen: true, activeFurnaceKey: key });
      audioManager.playChest();
      return;
    }

    // 2. Check food consumption
    const held = this.player.inventory.getSelectedItem();
    if (held) {
      const def = ITEM_DEFINITIONS[held.id];
      if (def?.foodRestoration) {
        if (this.player.eatFood(held.id)) {
          this.player.inventory.removeItem(this.player.inventory.selectedSlot, 1);
          return;
        }
      }

      // 3. Place block if held item is a block
      if (def?.blockType !== undefined && def.blockType !== BlockType.AIR) {
        // Place in adjacent empty tile
        let targetX = wx;
        let targetY = wy;

        if (clickedBlock !== BlockType.AIR && clickedBlock !== BlockType.WATER && clickedBlock !== BlockType.TALL_GRASS) {
          // Determine side from offset
          const subX = worldCoords.wx - wx;
          const subY = worldCoords.wy - wy;
          if (subX > 0.8) targetX++;
          else if (subX < 0.2) targetX--;
          else if (subY > 0.8) targetY++;
          else if (subY < 0.2) targetY--;
        }

        // Don't place inside player body
        const playerBox = this.player.getBoundingBox();
        const testBox = { minX: targetX, minY: targetY, maxX: targetX + 1, maxY: targetY + 1 };
        const overlapsPlayer = (
          playerBox.minX < testBox.maxX &&
          playerBox.maxX > testBox.minX &&
          playerBox.minY < testBox.maxY &&
          playerBox.maxY > testBox.minY
        );

        if (!overlapsPlayer) {
          if (this.world.placeBlock(targetX, targetY, def.blockType)) {
            this.player.inventory.removeItem(this.player.inventory.selectedSlot, 1);
            firebaseService.recordBlockDelta({
              x: targetX,
              y: targetY,
              block: def.blockType,
              playerUid: firebaseService.currentUser?.uid || 'local',
              timestamp: Date.now(),
            });
          }
        }
      }
    }
  }

  public getCursorWorldCoords(): { wx: number; wy: number } {
    const coords = this.renderer.camera.screenToWorld(this.mouseScreenX, this.mouseScreenY);
    return {
      wx: Math.floor(coords.wx),
      wy: Math.floor(coords.wy),
    };
  }

  public isAnyModalOpen(): boolean {
    return (
      this.uiState.isInventoryOpen ||
      this.uiState.isChestOpen ||
      this.uiState.isFurnaceOpen ||
      this.uiState.isPaused ||
      this.uiState.isDead ||
      this.uiState.isChatOpen ||
      this.uiState.isSettingsOpen
    );
  }

  public setUIState(newState: Partial<GameUIState>) {
    this.uiState = { ...this.uiState, ...newState };
    if (this.onUIStateChange) {
      this.onUIStateChange(this.uiState);
    }
  }

  private setupNetworkListeners() {
    firebaseService.subscribeToPlayers((players) => {
      this.remotePlayers = players;
    });

    firebaseService.subscribeToBlockDeltas((delta) => {
      this.world.setBlock(delta.x, delta.y, delta.block);
    });
  }
}
