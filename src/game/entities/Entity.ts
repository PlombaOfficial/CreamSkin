import { EntityType } from '../types';
import { AABB } from '../physics/AABB';
import { World } from '../world/World';
import { PhysicsEngine } from '../physics/PhysicsEngine';

export abstract class Entity {
  public id: string;
  public type: EntityType;
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public width: number = 0.8;
  public height: number = 1.8;

  public onGround: boolean = false;
  public inWater: boolean = false;
  public facingLeft: boolean = false;

  public health: number = 20;
  public maxHealth: number = 20;
  public isDead: boolean = false;
  public hurtTimer: number = 0; // Flash red on damage

  constructor(id: string, type: EntityType, x: number, y: number) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
  }

  public getBoundingBox(): AABB {
    return new AABB(
      this.x - this.width / 2,
      this.y,
      this.x + this.width / 2,
      this.y + this.height
    );
  }

  public takeDamage(amount: number, knockbackX: number = 0): boolean {
    if (this.isDead || this.hurtTimer > 0) return false;

    this.health = Math.max(0, this.health - amount);
    this.hurtTimer = 0.25; // 250ms immunity / flash
    this.vx += knockbackX;
    this.vy += 4.5; // slight pop upwards

    if (this.health <= 0) {
      this.isDead = true;
      this.onDeath();
    }
    return true;
  }

  public update(dt: number, world: World) {
    if (this.hurtTimer > 0) {
      this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    }
    PhysicsEngine.updateEntityPhysics(this, world, dt);
  }

  public abstract onDeath(): void;
}
