import { Camera } from './Camera';
import { World } from '../world/World';
import { Player } from '../entities/Player';
import { Mob } from '../entities/Mobs';
import { ItemDrop } from '../entities/ItemDrop';
import { ParticleSystem } from '../entities/ParticleSystem';
import { WeatherEngine } from '../weather/WeatherEngine';
import { textureAtlas, TILE_SIZE } from '../textures/TextureAtlas';
import { BLOCK_SIZE, CHUNK_WIDTH, CHUNK_HEIGHT } from '../world/WorldConstants';
import { BlockType, RemotePlayerState } from '../types';

export class GameRenderer {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public camera: Camera;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not create Canvas 2D context');
    this.ctx = context;
    this.camera = new Camera();
  }

  public render(
    world: World,
    player: Player,
    mobs: Mob[],
    itemDrops: ItemDrop[],
    remotePlayers: RemotePlayerState[],
    particles: ParticleSystem,
    weather: WeatherEngine,
    cursorWorldX: number,
    cursorWorldY: number
  ) {
    const ctx = this.ctx;
    const cam = this.camera;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.imageSmoothingEnabled = false;

    // 1. Draw Parallax Sky & Celestial Bodies
    this.renderSky(weather);

    // 2. Determine visible world bounds
    const topLeft = cam.screenToWorld(0, 0);
    const bottomRight = cam.screenToWorld(w, h);

    const minWX = Math.floor(topLeft.wx) - 1;
    const maxWX = Math.ceil(bottomRight.wx) + 1;
    const minWY = Math.max(0, Math.floor(bottomRight.wy) - 1);
    const maxWY = Math.min(CHUNK_HEIGHT - 1, Math.ceil(topLeft.wy) + 1);

    const skyAmbient = weather.getSkyColor().ambientLight;

    // 3. Render Background Walls
    for (let wx = minWX; wx <= maxWX; wx++) {
      const cx = Math.floor(wx / CHUNK_WIDTH);
      const lx = ((wx % CHUNK_WIDTH) + CHUNK_WIDTH) % CHUNK_WIDTH;
      const chunk = world.getChunk(cx);
      if (!chunk) continue;

      for (let wy = minWY; wy <= maxWY; wy++) {
        const wall = chunk.walls[chunk.getIndex(lx, wy)] as BlockType;
        if (wall !== BlockType.AIR && chunk.getBlock(lx, wy) === BlockType.AIR) {
          const { sx, sy } = cam.worldToScreen(wx, wy);
          const size = BLOCK_SIZE * cam.zoom;
          const coords = textureAtlas.getSpriteCoords(`block_${wall}`);
          ctx.save();
          ctx.globalAlpha = 0.55;
          ctx.drawImage(
            textureAtlas.canvas,
            coords.x, coords.y, TILE_SIZE, TILE_SIZE,
            sx, sy - size, size + 0.5, size + 0.5
          );
          ctx.restore();
        }
      }
    }

    // 4. Render Foreground Blocks
    for (let wx = minWX; wx <= maxWX; wx++) {
      const cx = Math.floor(wx / CHUNK_WIDTH);
      const lx = ((wx % CHUNK_WIDTH) + CHUNK_WIDTH) % CHUNK_WIDTH;
      const chunk = world.getChunk(cx);
      if (!chunk) continue;

      for (let wy = minWY; wy <= maxWY; wy++) {
        const block = chunk.getBlock(lx, wy);
        if (block === BlockType.AIR) continue;

        const { sx, sy } = cam.worldToScreen(wx, wy);
        const size = BLOCK_SIZE * cam.zoom;
        const coords = textureAtlas.getSpriteCoords(`block_${block}`);

        ctx.drawImage(
          textureAtlas.canvas,
          coords.x, coords.y, TILE_SIZE, TILE_SIZE,
          sx, sy - size, size + 0.5, size + 0.5
        );
      }
    }

    // 5. Render 2D Smooth Lighting Overlay Pass
    for (let wx = minWX; wx <= maxWX; wx++) {
      const cx = Math.floor(wx / CHUNK_WIDTH);
      const lx = ((wx % CHUNK_WIDTH) + CHUNK_WIDTH) % CHUNK_WIDTH;
      const chunk = world.getChunk(cx);
      if (!chunk) continue;

      for (let wy = minWY; wy <= maxWY; wy++) {
        const skyL = chunk.getSkyLight(lx, wy);
        const blkL = chunk.getBlockLight(lx, wy);
        const effectiveLight = Math.max(skyL * skyAmbient, blkL);

        // Darkness factor: 0 (fully lit) to 0.94 (nearly pitch black)
        const darkness = Math.max(0, 1.0 - (effectiveLight / 15.0));

        if (darkness > 0.05) {
          const { sx, sy } = cam.worldToScreen(wx, wy);
          const size = BLOCK_SIZE * cam.zoom;
          ctx.fillStyle = `rgba(5, 7, 15, ${darkness * 0.93})`;
          ctx.fillRect(sx, sy - size, size + 0.5, size + 0.5);
        }
      }
    }

    // 6. Render Mining Target Selection & Cracking Overlay
    if (cursorWorldX >= minWX && cursorWorldX <= maxWX && cursorWorldY >= minWY && cursorWorldY <= maxWY) {
      const block = world.getBlock(cursorWorldX, cursorWorldY);
      if (block !== BlockType.AIR) {
        const { sx, sy } = cam.worldToScreen(cursorWorldX, cursorWorldY);
        const size = BLOCK_SIZE * cam.zoom;

        // Selection border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = Math.max(1, cam.zoom * 0.6);
        ctx.strokeRect(sx + 0.5, sy - size + 0.5, size - 1, size - 1);

        // Break progress cracks
        if (player.isMining && player.miningTargetX === cursorWorldX && player.miningTargetY === cursorWorldY) {
          const stage = Math.min(9, Math.floor(player.breakProgress * 10));
          const crackCoords = textureAtlas.getSpriteCoords(`break_${stage}`);
          ctx.drawImage(
            textureAtlas.canvas,
            crackCoords.x, crackCoords.y, TILE_SIZE, TILE_SIZE,
            sx, sy - size, size, size
          );
        }
      }
    }

    // 7. Render Item Drops
    for (const drop of itemDrops) {
      if (drop.isDead) continue;
      const { sx, sy } = cam.worldToScreen(drop.x, drop.y + Math.sin(drop.hoverTime) * 0.1);
      const size = 10 * cam.zoom;
      const coords = textureAtlas.getSpriteCoords(`item_${drop.item.id}`) || textureAtlas.getSpriteCoords(`block_${drop.item.id}`);

      ctx.drawImage(
        textureAtlas.canvas,
        coords.x, coords.y, TILE_SIZE, TILE_SIZE,
        sx - size / 2, sy - size, size, size
      );
    }

    // 8. Render Mobs
    for (const mob of mobs) {
      if (mob.isDead) continue;
      this.renderMob(mob);
    }

    // 9. Render Remote Multiplayer Players
    for (const rp of remotePlayers) {
      this.renderRemotePlayer(rp);
    }

    // 10. Render Local Player
    if (!player.isDead) {
      this.renderPlayer(player);
    }

    // 11. Render Particles
    for (const p of particles.particles) {
      const { sx, sy } = cam.worldToScreen(p.x, p.y);
      ctx.fillStyle = p.color;
      const pSize = p.size * (cam.zoom / 2.5);
      ctx.fillRect(sx, sy, pSize, pSize);
    }

    // 12. Render Weather (Rain & Splashes)
    this.renderWeatherOverlay(weather);
  }

  private renderSky(weather: WeatherEngine) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const colors = weather.getSkyColor();

    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, colors.top);
    gradient.addColorStop(1, colors.bottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Draw Sun & Moon
    const timeNorm = weather.timeOfDay / 24000; // 0 to 1
    const celestialAngle = timeNorm * Math.PI * 2 - Math.PI / 2;

    const sunX = w / 2 + Math.cos(celestialAngle) * (w * 0.45);
    const sunY = h * 0.7 + Math.sin(celestialAngle) * (h * 0.55);

    const moonX = w / 2 + Math.cos(celestialAngle + Math.PI) * (w * 0.45);
    const moonY = h * 0.7 + Math.sin(celestialAngle + Math.PI) * (h * 0.55);

    // Sun
    if (sunY < h * 0.85) {
      ctx.fillStyle = '#fff4a3';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 22 * (this.camera.zoom / 2.5), 0, Math.PI * 2);
      ctx.fill();
    }

    // Moon
    if (moonY < h * 0.85) {
      ctx.fillStyle = '#e8ecf8';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 18 * (this.camera.zoom / 2.5), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderPlayer(player: Player) {
    const ctx = this.ctx;
    const cam = this.camera;
    const { sx, sy } = cam.worldToScreen(player.x, player.y);
    const w = player.width * BLOCK_SIZE * cam.zoom;
    const h = player.height * BLOCK_SIZE * cam.zoom;

    ctx.save();
    ctx.translate(sx, sy);
    if (player.facingLeft) {
      ctx.scale(-1, 1);
    }

    // Hurt flash
    if (player.hurtTimer > 0) {
      ctx.filter = 'brightness(1.8) sepia(1) hue-rotate(-50deg) saturate(5)';
    }

    const walkFrame = Math.abs(player.vx) > 0.5 ? (Math.sin(player.walkCycle) > 0 ? 'player_walk_1' : 'player_walk_2') : 'player_idle';
    const coords = textureAtlas.getSpriteCoords(`entity_${walkFrame}`);

    ctx.drawImage(
      textureAtlas.canvas,
      coords.x, coords.y, TILE_SIZE, TILE_SIZE,
      -w / 2, -h, w, h
    );

    // Render Held Item in Hand with Swing Animation
    const held = player.inventory.getSelectedItem();
    if (held) {
      const itemCoords = textureAtlas.getSpriteCoords(`item_${held.id}`) || textureAtlas.getSpriteCoords(`block_${held.id}`);
      ctx.save();
      const swingAngle = player.isMining ? Math.sin(player.swingProgress * Math.PI) * 1.2 : 0;
      ctx.translate(w * 0.25, -h * 0.45);
      ctx.rotate(swingAngle);
      const itemSize = 14 * cam.zoom;
      ctx.drawImage(
        textureAtlas.canvas,
        itemCoords.x, itemCoords.y, TILE_SIZE, TILE_SIZE,
        -itemSize / 4, -itemSize / 2, itemSize, itemSize
      );
      ctx.restore();
    }

    ctx.restore();
  }

  private renderRemotePlayer(rp: RemotePlayerState) {
    const ctx = this.ctx;
    const cam = this.camera;
    const { sx, sy } = cam.worldToScreen(rp.x, rp.y);
    const w = 0.8 * BLOCK_SIZE * cam.zoom;
    const h = 1.8 * BLOCK_SIZE * cam.zoom;

    ctx.save();
    ctx.translate(sx, sy);
    if (rp.facingLeft) {
      ctx.scale(-1, 1);
    }

    const coords = textureAtlas.getSpriteCoords('entity_player_idle');
    ctx.drawImage(
      textureAtlas.canvas,
      coords.x, coords.y, TILE_SIZE, TILE_SIZE,
      -w / 2, -h, w, h
    );

    // Name tag above head
    ctx.restore();
    ctx.save();
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    const textW = ctx.measureText(rp.username).width;
    ctx.fillRect(sx - textW / 2 - 4, sy - h - 18, textW + 8, 14);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(rp.username, sx, sy - h - 7);
    ctx.restore();
  }

  private renderMob(mob: Mob) {
    const ctx = this.ctx;
    const cam = this.camera;
    const { sx, sy } = cam.worldToScreen(mob.x, mob.y);
    const w = mob.width * BLOCK_SIZE * cam.zoom;
    const h = mob.height * BLOCK_SIZE * cam.zoom;

    ctx.save();
    ctx.translate(sx, sy);
    if (mob.facingLeft) {
      ctx.scale(-1, 1);
    }

    if (mob.hurtTimer > 0) {
      ctx.filter = 'brightness(1.8) sepia(1) hue-rotate(-50deg) saturate(5)';
    }

    const coords = textureAtlas.getSpriteCoords(`entity_${mob.type}`);
    ctx.drawImage(
      textureAtlas.canvas,
      coords.x, coords.y, TILE_SIZE, TILE_SIZE,
      -w / 2, -h, w, h
    );

    ctx.restore();
  }

  private renderWeatherOverlay(weather: WeatherEngine) {
    const ctx = this.ctx;
    const cam = this.camera;

    // Rain lines
    ctx.strokeStyle = 'rgba(180, 210, 255, 0.7)';
    ctx.lineWidth = Math.max(1, cam.zoom * 0.4);
    ctx.beginPath();

    for (const p of weather.rainParticles) {
      const { sx, sy } = cam.worldToScreen(p.x, p.y);
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + p.vx * cam.zoom, sy + p.length * cam.zoom);
    }
    ctx.stroke();

    // Splashes
    ctx.fillStyle = 'rgba(200, 230, 255, 0.85)';
    for (const sp of weather.splashParticles) {
      const { sx, sy } = cam.worldToScreen(sp.x, sp.y);
      ctx.fillRect(sx, sy, 2 * cam.zoom, 2 * cam.zoom);
    }
  }
}
