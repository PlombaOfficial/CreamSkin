import { Entity } from './Entity';
import { EntityType } from '../types';
import { World } from '../world/World';
import { Player } from './Player';
import { audioManager } from '../audio/AudioManager';

export class Mob extends Entity {
  public targetPlayer: Player | null = null;
  public aiTimer: number = 0;
  public wanderDirection: number = 0;
  public attackCooldown: number = 0;
  public isHostile: boolean = false;
  public dropItemId: string = '';
  public dropXp: number = 2;

  constructor(id: string, type: EntityType, x: number, y: number) {
    super(id, type, x, y);
  }

  public updateAI(dt: number, player: Player, world: World) {
    this.targetPlayer = player;
    this.aiTimer += dt;
    if (this.attackCooldown > 0) {
      this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    }

    const distToPlayer = Math.hypot(this.x - player.x, this.y - player.y);

    if (this.isHostile) {
      // Aggro range = 12 blocks
      if (distToPlayer < 12.0 && !player.isDead) {
        // Move towards player
        const dx = player.x - this.x;
        this.vx = dx > 0 ? 2.8 : -2.8;
        this.facingLeft = dx < 0;

        // Jump over 1-block obstacles
        const frontBlockX = Math.floor(this.x + (this.facingLeft ? -0.8 : 0.8));
        const frontBlock = world.getBlock(frontBlockX, Math.floor(this.y + 0.2));
        if (frontBlock !== 0 && this.onGround) {
          this.vy = 7.5;
        }

        // Melee attack player
        if (distToPlayer < 1.2 && this.attackCooldown <= 0) {
          player.takeDamage(3, this.facingLeft ? -4 : 4);
          audioManager.playHurt(true);
          this.attackCooldown = 1.0;
        }
      } else {
        // Peaceful wander
        this.doWander(dt);
      }
    } else {
      // Passive mobs wander and run if hit
      if (this.hurtTimer > 0) {
        // Flee from player
        const dx = this.x - player.x;
        this.vx = dx > 0 ? 3.5 : -3.5;
        this.facingLeft = dx < 0;
      } else {
        this.doWander(dt);
      }
    }
  }

  private doWander(_dt: number) {
    if (this.aiTimer > 3.0) {
      this.aiTimer = 0;
      const r = Math.random();
      if (r < 0.35) this.wanderDirection = -1;
      else if (r < 0.7) this.wanderDirection = 1;
      else this.wanderDirection = 0;
    }

    if (this.wanderDirection !== 0) {
      this.vx = this.wanderDirection * 1.5;
      this.facingLeft = this.wanderDirection < 0;
    }
  }

  public override onDeath() {
    audioManager.playHurt(false);
  }
}

export class ZombieMob extends Mob {
  constructor(id: string, x: number, y: number) {
    super(id, EntityType.ZOMBIE, x, y);
    this.width = 0.8;
    this.height = 1.8;
    this.health = 20;
    this.maxHealth = 20;
    this.isHostile = true;
    this.dropItemId = 'coal';
    this.dropXp = 5;
  }
}

export class SkeletonMob extends Mob {
  public shootTimer = 0;

  constructor(id: string, x: number, y: number) {
    super(id, EntityType.SKELETON, x, y);
    this.width = 0.8;
    this.height = 1.8;
    this.health = 18;
    this.maxHealth = 18;
    this.isHostile = true;
    this.dropItemId = 'arrow';
    this.dropXp = 5;
  }
}

export class SlimeMob extends Mob {
  private jumpCooldown = 0;

  constructor(id: string, x: number, y: number) {
    super(id, EntityType.SLIME, x, y);
    this.width = 1.0;
    this.height = 0.9;
    this.health = 12;
    this.maxHealth = 12;
    this.isHostile = true;
    this.dropItemId = 'apple';
    this.dropXp = 3;
  }

  public override updateAI(dt: number, player: Player, _world: World) {
    this.targetPlayer = player;
    this.jumpCooldown += dt;

    const distToPlayer = Math.hypot(this.x - player.x, this.y - player.y);
    if (this.onGround && this.jumpCooldown > 1.2 && distToPlayer < 14) {
      this.jumpCooldown = 0;
      const dx = player.x - this.x;
      this.vx = dx > 0 ? 3.2 : -3.2;
      this.vy = 6.5;
      this.facingLeft = dx < 0;
    }

    if (distToPlayer < 1.0 && this.attackCooldown <= 0) {
      player.takeDamage(2, this.facingLeft ? -3 : 3);
      audioManager.playHurt(true);
      this.attackCooldown = 1.0;
    }
  }
}

export class PigMob extends Mob {
  constructor(id: string, x: number, y: number) {
    super(id, EntityType.PIG, x, y);
    this.width = 1.0;
    this.height = 0.9;
    this.health = 10;
    this.maxHealth = 10;
    this.isHostile = false;
    this.dropItemId = 'porkchop_raw';
    this.dropXp = 2;
  }
}

export class SheepMob extends Mob {
  constructor(id: string, x: number, y: number) {
    super(id, EntityType.SHEEP, x, y);
    this.width = 1.0;
    this.height = 1.0;
    this.health = 8;
    this.maxHealth = 8;
    this.isHostile = false;
    this.dropItemId = 'porkchop_raw';
    this.dropXp = 2;
  }
}
