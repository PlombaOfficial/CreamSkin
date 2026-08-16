import { World } from '../world/World';
import { AABB } from './AABB';
import { BLOCK_DEFINITIONS } from '../inventory/ItemData';

export const GRAVITY = -28.0; // blocks per second squared
export const WATER_GRAVITY = -6.0;
export const TERMINAL_VELOCITY = -32.0;

export class PhysicsEngine {
  public static updateEntityPhysics(
    entity: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      width: number;
      height: number;
      onGround: boolean;
      inWater: boolean;
    },
    world: World,
    dt: number
  ) {
    // Clamp dt to avoid tunneling
    const delta = Math.min(dt, 0.05);

    // 1. Check if entity is submerged in water
    const blockAtCenter = world.getBlock(Math.floor(entity.x), Math.floor(entity.y + entity.height / 2));
    const defCenter = BLOCK_DEFINITIONS[blockAtCenter];
    entity.inWater = !!(defCenter && defCenter.isLiquid);

    // 2. Apply Gravity
    const grav = entity.inWater ? WATER_GRAVITY : GRAVITY;
    entity.vy += grav * delta;
    if (entity.vy < TERMINAL_VELOCITY) entity.vy = TERMINAL_VELOCITY;

    // Apply drag
    const dragX = entity.inWater ? 0.75 : (entity.onGround ? 0.82 : 0.94);
    entity.vx *= Math.pow(dragX, delta * 60);

    // 3. Move X and resolve horizontal collisions
    const newX = entity.x + entity.vx * delta;
    const boxX = new AABB(
      newX - entity.width / 2,
      entity.y,
      newX + entity.width / 2,
      entity.y + entity.height
    );

    let collidedX = false;
    const minBlockX = Math.floor(boxX.minX);
    const maxBlockX = Math.floor(boxX.maxX);
    const minBlockY = Math.floor(boxX.minY);
    const maxBlockY = Math.floor(boxX.maxY);

    for (let bx = minBlockX; bx <= maxBlockX; bx++) {
      for (let by = minBlockY; by <= maxBlockY; by++) {
        const b = world.getBlock(bx, by);
        const def = BLOCK_DEFINITIONS[b];
        if (def && def.isSolid) {
          const tileBox = new AABB(bx, by, bx + 1, by + 1);
          if (boxX.intersects(tileBox)) {
            collidedX = true;
            break;
          }
        }
      }
      if (collidedX) break;
    }

    if (!collidedX) {
      entity.x = newX;
    } else {
      // Step-up mechanic: check if stepping 1 block up is clear
      const stepBox = new AABB(
        newX - entity.width / 2,
        entity.y + 1.05,
        newX + entity.width / 2,
        entity.y + entity.height + 1.05
      );
      let stepBlocked = false;
      for (let bx = Math.floor(stepBox.minX); bx <= Math.floor(stepBox.maxX); bx++) {
        for (let by = Math.floor(stepBox.minY); by <= Math.floor(stepBox.maxY); by++) {
          const b = world.getBlock(bx, by);
          const def = BLOCK_DEFINITIONS[b];
          if (def && def.isSolid) {
            stepBlocked = true;
            break;
          }
        }
        if (stepBlocked) break;
      }

      if (!stepBlocked && entity.onGround) {
        entity.x = newX;
        entity.y += 1.05;
      } else {
        entity.vx = 0;
      }
    }

    // 4. Move Y and resolve vertical collisions
    const newY = entity.y + entity.vy * delta;
    const boxY = new AABB(
      entity.x - entity.width / 2,
      newY,
      entity.x + entity.width / 2,
      newY + entity.height
    );

    let collidedY = false;
    entity.onGround = false;

    const minBY = Math.floor(boxY.minY);
    const maxBY = Math.floor(boxY.maxY);
    const minBX = Math.floor(boxY.minX);
    const maxBX = Math.floor(boxY.maxX);

    for (let bx = minBX; bx <= maxBX; bx++) {
      for (let by = minBY; by <= maxBY; by++) {
        const b = world.getBlock(bx, by);
        const def = BLOCK_DEFINITIONS[b];
        if (def && def.isSolid) {
          const tileBox = new AABB(bx, by, bx + 1, by + 1);
          if (boxY.intersects(tileBox)) {
            collidedY = true;
            if (entity.vy < 0) {
              // Hit ground
              entity.y = by + 1;
              entity.vy = 0;
              entity.onGround = true;
            } else if (entity.vy > 0) {
              // Bonk ceiling
              entity.y = by - entity.height;
              entity.vy = 0;
            }
            break;
          }
        }
      }
      if (collidedY) break;
    }

    if (!collidedY) {
      entity.y = newY;
    }
  }
}
