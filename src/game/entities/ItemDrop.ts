import { Entity } from './Entity';
import { EntityType, ItemStack } from '../types';
import { World } from '../world/World';
import { Player } from './Player';
import { audioManager } from '../audio/AudioManager';

export class ItemDrop extends Entity {
  public item: ItemStack;
  public pickupDelay: number = 0.5; // Delay before player can pick up
  public hoverTime: number = 0;
  public despawnTimer: number = 300; // 5 minutes

  constructor(id: string, item: ItemStack, x: number, y: number, vx: number = 0, vy: number = 3) {
    super(id, EntityType.ITEM_DROP, x, y);
    this.item = item;
    this.width = 0.4;
    this.height = 0.4;
    this.vx = vx;
    this.vy = vy;
  }

  public override update(dt: number, world: World) {
    super.update(dt, world);
    this.hoverTime += dt * 4;

    if (this.pickupDelay > 0) {
      this.pickupDelay = Math.max(0, this.pickupDelay - dt);
    }
    this.despawnTimer -= dt;
    if (this.despawnTimer <= 0) {
      this.isDead = true;
    }
  }

  public updateMagnet(player: Player, dt: number): boolean {
    if (this.pickupDelay > 0 || this.isDead || player.isDead) return false;

    const dx = player.x - this.x;
    const dy = (player.y + 0.8) - this.y;
    const dist = Math.hypot(dx, dy);

    // Magnet radius = 2.8 blocks
    if (dist < 2.8) {
      const pullSpeed = 8.0 * (1.0 - dist / 2.8) + 2.0;
      this.vx += (dx / dist) * pullSpeed * dt * 5;
      this.vy += (dy / dist) * pullSpeed * dt * 5;
    }

    // Pickup range = 0.8 blocks
    if (dist < 0.8) {
      const added = player.inventory.addItem({ ...this.item });
      if (added) {
        audioManager.playPickup();
        this.isDead = true;
        return true;
      }
    }
    return false;
  }

  public override onDeath() {}
}
