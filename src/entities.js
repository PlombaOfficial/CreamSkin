/**
 * 2D MINECRAFT // COMPLETE ENTITY, MOB AI & COMBAT ENGINE
 * Player AABB physics, Zombie, Skeleton Archer, Exploding Creeper,
 * Spider Wall Climber, Wither Dragon Boss, Projectiles, and Dropped Items.
 */

import { BLOCKS, ITEMS, ITEM_DATA } from "./items-recipes.js";

export class Player {
  constructor(x = 225, y = 40) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.w = 0.65; // Block units
    this.h = 1.75;

    // Survival Stats
    this.health = 20; // 10 Hearts
    this.maxHealth = 20;
    this.hunger = 20; // 10 Drumsticks
    this.maxHunger = 20;
    this.oxygen = 10;
    this.armor = 0;
    this.isDead = false;

    // Movement & States
    this.isGrounded = false;
    this.isOnLadder = false;
    this.isInWater = false;
    this.isSprinting = false;
    this.facing = 1; // 1 right, -1 left
    this.swingProgress = 0;

    // Inventory: 9 Hotbar (0..8) + 27 Main (9..35) + 4 Armor (36..39)
    this.inventory = new Array(40).fill(null);
    this.selectedHotbarSlot = 0;

    // Starter tools
    this.inventory[0] = { id: ITEMS.WOOD_PICKAXE, count: 1, durability: 60 };
    this.inventory[1] = { id: ITEMS.WOOD_SWORD, count: 1, durability: 60 };
    this.inventory[2] = { id: BLOCKS.TORCH, count: 16 };
    this.inventory[3] = { id: ITEMS.APPLE, count: 8 };
  }

  getHeldItem() {
    return this.inventory[this.selectedHotbarSlot];
  }

  update(delta, world, keys, audio) {
    if (this.isDead) return;

    // 1. Horizontal Movement
    let moveDir = 0;
    if (keys['KeyA'] || keys['ArrowLeft']) { moveDir -= 1; this.facing = -1; }
    if (keys['KeyD'] || keys['ArrowRight']) { moveDir += 1; this.facing = 1; }

    const speed = this.isInWater ? 3.5 : (this.isSprinting ? 6.5 : 4.8);
    this.vx = moveDir * speed;

    // 2. Ladder & Water Physics
    const footBlock = world.getBlock(Math.floor(this.x), Math.floor(this.y + this.h));
    const centerBlock = world.getBlock(Math.floor(this.x), Math.floor(this.y + this.h * 0.5));

    this.isOnLadder = (centerBlock === BLOCKS.LADDER || footBlock === BLOCKS.LADDER);
    this.isInWater = (centerBlock === BLOCKS.WATER || centerBlock === BLOCKS.LAVA);

    if (this.isOnLadder) {
      this.vy = 0;
      if (keys['KeyW'] || keys['Space']) this.vy = -4.0;
      if (keys['KeyS']) this.vy = 4.0;
    } else if (this.isInWater) {
      this.vy = Math.min(this.vy + 8 * delta, 3.0); // Bouyancy
      if (keys['Space'] || keys['KeyW']) this.vy = -3.5;
    } else {
      // Normal Gravity
      this.vy += 22 * delta;
      if ((keys['Space'] || keys['KeyW']) && this.isGrounded) {
        this.vy = -8.2;
        this.isGrounded = false;
      }
    }

    // 3. Collision Resolution (AABB vs World Blocks)
    this.resolvePhysics(delta, world, audio);

    // 4. Swing animation
    if (this.swingProgress > 0) {
      this.swingProgress -= delta * 5.0;
      if (this.swingProgress < 0) this.swingProgress = 0;
    }

    // 5. Hunger & Health Regen
    if (this.hunger > 17 && this.health < this.maxHealth) {
      this.health = Math.min(this.maxHealth, this.health + delta * 0.5);
    }
  }

  resolvePhysics(delta, world, audio) {
    // Horizontal step
    const nextX = this.x + this.vx * delta;
    if (!this.checkBlockCollision(nextX, this.y, world)) {
      this.x = nextX;
    } else {
      this.vx = 0;
    }

    // Vertical step
    const nextY = this.y + this.vy * delta;
    if (!this.checkBlockCollision(this.x, nextY, world)) {
      this.y = nextY;
      this.isGrounded = false;
    } else {
      if (this.vy > 0) {
        this.isGrounded = true;
      }
      this.vy = 0;
    }
  }

  checkBlockCollision(px, py, world) {
    const minX = Math.floor(px - this.w / 2);
    const maxX = Math.floor(px + this.w / 2);
    const minY = Math.floor(py);
    const maxY = Math.floor(py + this.h);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const b = world.getBlock(x, y);
        if (
          b !== BLOCKS.AIR && 
          b !== BLOCKS.TORCH && 
          b !== BLOCKS.LADDER && 
          b !== BLOCKS.WATER && 
          b !== BLOCKS.LAVA
        ) {
          return true;
        }
      }
    }
    return false;
  }

  takeDamage(amount, audio) {
    if (this.isDead) return;
    const reduced = Math.max(1, amount - this.armor * 0.4);
    this.health -= reduced;
    if (audio) audio.playHit();

    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
    }
  }
}

// --------------------------------------------------------------------------
// AGGRESSIVE MOB AI: ZOMBIE, SKELETON, CREEPER, SPIDER & WITHER BOSS
// --------------------------------------------------------------------------

export class Mob {
  constructor(type, x, y) {
    this.type = type; // 'zombie' | 'skeleton' | 'creeper' | 'spider' | 'boss'
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.isDead = false;

    if (type === 'zombie') {
      this.w = 0.65; this.h = 1.8; this.health = 20; this.maxHealth = 20; this.speed = 2.4; this.damage = 3.5;
    } else if (type === 'skeleton') {
      this.w = 0.65; this.h = 1.8; this.health = 18; this.maxHealth = 18; this.speed = 2.0; this.shootCooldown = 2.0;
    } else if (type === 'creeper') {
      this.w = 0.65; this.h = 1.6; this.health = 16; this.maxHealth = 16; this.speed = 2.8; this.fuseTimer = 0;
    } else if (type === 'spider') {
      this.w = 1.2; this.h = 0.8; this.health = 16; this.maxHealth = 16; this.speed = 3.8; this.damage = 3.0;
    } else if (type === 'boss') {
      this.w = 2.4; this.h = 2.4; this.health = 250; this.maxHealth = 250; this.speed = 3.2; this.attackCooldown = 1.5;
    }
  }

  update(delta, player, world, projectiles, droppedItems, audio) {
    if (this.isDead) return;

    const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    this.facing = dx > 0 ? 1 : -1;

    // AI Behaviors
    if (this.type === 'zombie') {
      if (distToPlayer < 18) {
        this.vx = this.facing * this.speed;
        // Jump over 1-block obstacles
        if (world.getBlock(Math.floor(this.x + this.facing * 0.6), Math.floor(this.y + this.h - 0.2)) !== BLOCKS.AIR) {
          if (this.vy === 0) this.vy = -6.5;
        }
        // Attack player
        if (distToPlayer < 1.1) {
          player.takeDamage(this.damage, audio);
        }
      }
    } 
    else if (this.type === 'skeleton') {
      if (distToPlayer < 16) {
        // Keep 6-8 blocks distance
        if (distToPlayer < 6) this.vx = -this.facing * this.speed;
        else if (distToPlayer > 10) this.vx = this.facing * this.speed;
        else this.vx = 0;

        this.shootCooldown -= delta;
        if (this.shootCooldown <= 0) {
          this.shootCooldown = 2.2;
          const angle = Math.atan2(dy, dx);
          projectiles.push(new Projectile(this.x, this.y + 0.8, Math.cos(angle) * 14, Math.sin(angle) * 14, 'enemy'));
          if (audio) audio.playBowShoot();
        }
      }
    }
    else if (this.type === 'creeper') {
      if (distToPlayer < 16) {
        this.vx = this.facing * this.speed;
        if (world.getBlock(Math.floor(this.x + this.facing * 0.6), Math.floor(this.y + this.h - 0.2)) !== BLOCKS.AIR) {
          if (this.vy === 0) this.vy = -6.5;
        }

        // Hiss & Explode
        if (distToPlayer < 2.5) {
          if (this.fuseTimer === 0 && audio) audio.playCreeperFuse();
          this.fuseTimer += delta;
          if (this.fuseTimer >= 1.3) {
            this.explode(world, player, audio);
          }
        } else {
          this.fuseTimer = Math.max(0, this.fuseTimer - delta);
        }
      }
    }
    else if (this.type === 'spider') {
      if (distToPlayer < 18) {
        this.vx = this.facing * this.speed;
        // Climb vertical walls smoothly!
        if (world.getBlock(Math.floor(this.x + this.facing * 0.7), Math.floor(this.y + 0.5)) !== BLOCKS.AIR) {
          this.vy = -4.5;
        }
        if (distToPlayer < 1.2) {
          player.takeDamage(this.damage, audio);
        }
      }
    }
    else if (this.type === 'boss') {
      // Flying Wither Dragon Boss
      const angle = Math.atan2(dy, dx);
      this.vx = Math.cos(angle) * this.speed;
      this.vy = Math.sin(angle) * this.speed;

      this.attackCooldown -= delta;
      if (this.attackCooldown <= 0) {
        this.attackCooldown = 1.8;
        // Shoot 3 Wither Skull fireballs
        [-0.2, 0, 0.2].forEach(offset => {
          projectiles.push(new Projectile(this.x, this.y, Math.cos(angle + offset) * 12, Math.sin(angle + offset) * 12, 'boss'));
        });
        if (audio) audio.playExplosion();
      }
    }

    // Gravity (except flying Boss)
    if (this.type !== 'boss') {
      this.vy += 22 * delta;
      // Physics step
      const nextX = this.x + this.vx * delta;
      if (world.getBlock(Math.floor(nextX), Math.floor(this.y + this.h * 0.5)) === BLOCKS.AIR) {
        this.x = nextX;
      }
      const nextY = this.y + this.vy * delta;
      if (world.getBlock(Math.floor(this.x), Math.floor(nextY + this.h)) === BLOCKS.AIR) {
        this.y = nextY;
      } else {
        this.vy = 0;
      }
    } else {
      this.x += this.vx * delta;
      this.y += this.vy * delta;
    }
  }

  explode(world, player, audio) {
    this.isDead = true;
    if (audio) audio.playExplosion();

    const rad = 3;
    const cx = Math.floor(this.x);
    const cy = Math.floor(this.y);

    for (let x = cx - rad; x <= cx + rad; x++) {
      for (let y = cy - rad; y <= cy + rad; y++) {
        if (Math.hypot(x - cx, y - cy) <= rad) {
          const b = world.getBlock(x, y);
          if (b !== BLOCKS.BEDROCK && b !== BLOCKS.OBSIDIAN) {
            world.setBlock(x, y, BLOCKS.AIR);
          }
        }
      }
    }

    const dist = Math.hypot(player.x - this.x, player.y - this.y);
    if (dist < 5.0) {
      player.takeDamage((1.0 - dist / 5.0) * 18, audio);
    }
  }

  takeDamage(amount, droppedItems, audio) {
    this.health -= amount;
    if (audio) audio.playHit();

    if (this.health <= 0) {
      this.isDead = true;
      // Drop loot
      if (this.type === 'zombie') {
        droppedItems.push(new DroppedItem(ITEMS.ROTTEN_FLESH, this.x, this.y, 2));
        if (Math.random() < 0.2) droppedItems.push(new DroppedItem(ITEMS.RAW_IRON, this.x, this.y, 1));
      } else if (this.type === 'skeleton') {
        droppedItems.push(new DroppedItem(ITEMS.BONE, this.x, this.y, 2));
        droppedItems.push(new DroppedItem(ITEMS.ARROW, this.x, this.y, 3));
      } else if (this.type === 'creeper') {
        droppedItems.push(new DroppedItem(ITEMS.GUNPOWDER, this.x, this.y, 2));
      } else if (this.type === 'spider') {
        droppedItems.push(new DroppedItem(ITEMS.STRING, this.x, this.y, 2));
      } else if (this.type === 'boss') {
        droppedItems.push(new DroppedItem(ITEMS.NETHERITE_INGOT, this.x, this.y, 4));
        droppedItems.push(new DroppedItem(ITEMS.DIAMOND, this.x, this.y, 12));
      }
    }
  }
}

// --------------------------------------------------------------------------
// PROJECTILES & DROPPED ITEMS
// --------------------------------------------------------------------------

export class Projectile {
  constructor(x, y, vx, vy, source = 'player') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.source = source;
    this.isDead = false;
  }

  update(delta, world, player, mobs, audio) {
    if (this.isDead) return;
    this.vy += 8 * delta; // Arrow gravity
    this.x += this.vx * delta;
    this.y += this.vy * delta;

    // Block collision
    if (world.getBlock(Math.floor(this.x), Math.floor(this.y)) !== BLOCKS.AIR) {
      this.isDead = true;
      return;
    }

    // Hit entity
    if (this.source === 'player') {
      mobs.forEach(mob => {
        if (!mob.isDead && Math.hypot(mob.x - this.x, mob.y - this.y) < 1.0) {
          mob.takeDamage(9, [], audio);
          this.isDead = true;
        }
      });
    } else {
      if (Math.hypot(player.x - this.x, player.y - this.y) < 0.8) {
        player.takeDamage(this.source === 'boss' ? 7 : 4, audio);
        this.isDead = true;
      }
    }
  }
}

export class DroppedItem {
  constructor(itemId, x, y, count = 1) {
    this.itemId = itemId;
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = -3.0;
    this.count = count;
    this.isDead = false;
    this.floatTimer = Math.random() * 10;
  }

  update(delta, world, player, audio) {
    if (this.isDead) return;
    this.floatTimer += delta;

    // Gravity & Ground collision
    this.vy += 16 * delta;
    this.x += this.vx * delta;
    const nextY = this.y + this.vy * delta;

    if (world.getBlock(Math.floor(this.x), Math.floor(nextY + 0.3)) === BLOCKS.AIR) {
      this.y = nextY;
    } else {
      this.vy = 0;
      this.vx = 0;
    }

    // Magnet attract to player
    const dist = Math.hypot(player.x - this.x, (player.y + 0.8) - this.y);
    if (dist < 2.5) {
      this.x += ((player.x - this.x) / dist) * 8 * delta;
      this.y += (((player.y + 0.8) - this.y) / dist) * 8 * delta;

      if (dist < 0.7) {
        this.isDead = true;
        this.giveToPlayer(player);
        if (audio) audio.playPop();
      }
    }
  }

  giveToPlayer(player) {
    for (let i = 0; i < 36; i++) {
      const slot = player.inventory[i];
      if (slot && slot.id === this.itemId && slot.count < 64) {
        slot.count += this.count;
        return;
      }
    }
    for (let i = 0; i < 36; i++) {
      if (!player.inventory[i]) {
        player.inventory[i] = { id: this.itemId, count: this.count };
        return;
      }
    }
  }
}
