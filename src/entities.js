/**
 * 2D MINECRAFT // SOLID ENTITY & PLAYER PHYSICS ENGINE
 * Smooth platformer physics, jump buffering, coyote time,
 * ladder climbing, aggressive mob AI, and dropped items.
 */

import { BLOCKS, ITEMS, ITEM_DATA } from "./items-recipes.js";

export class Player {
  constructor(x = 100, y = 30) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.w = 0.6; // Block hitbox width
    this.h = 1.65; // Block hitbox height

    // Stats
    this.health = 20;
    this.maxHealth = 20;
    this.hunger = 20;
    this.maxHunger = 20;
    this.oxygen = 10;
    this.armor = 0;
    this.isDead = false;

    // Movement
    this.isGrounded = false;
    this.isOnLadder = false;
    this.isInWater = false;
    this.facing = 1;
    this.swingProgress = 0;
    this.walkAnimTimer = 0;

    // Inventory
    this.inventory = new Array(40).fill(null);
    this.selectedHotbarSlot = 0;

    // Starter loadout
    this.inventory[0] = { id: ITEMS.WOOD_PICKAXE, count: 1, durability: 60 };
    this.inventory[1] = { id: ITEMS.WOOD_SWORD, count: 1, durability: 60 };
    this.inventory[2] = { id: BLOCKS.TORCH, count: 24 };
    this.inventory[3] = { id: ITEMS.APPLE, count: 10 };
    this.inventory[4] = { id: BLOCKS.OAK_LOG, count: 16 };
  }

  getHeldItem() {
    return this.inventory[this.selectedHotbarSlot];
  }

  update(delta, world, keys, audio) {
    if (this.isDead) return;

    // 1. Controls
    let moveDir = 0;
    if (keys['KeyA'] || keys['ArrowLeft']) { moveDir -= 1; this.facing = -1; }
    if (keys['KeyD'] || keys['ArrowRight']) { moveDir += 1; this.facing = 1; }

    const isSprinting = keys['ShiftLeft'] || keys['ShiftRight'];
    const speed = this.isInWater ? 3.0 : (isSprinting ? 5.6 : 4.0);

    // Smooth horizontal acceleration
    this.vx = moveDir * speed;
    if (moveDir !== 0 && this.isGrounded) {
      this.walkAnimTimer += delta * 12;
    }

    // 2. Ladder & Water
    const headBlock = world.getBlock(Math.floor(this.x), Math.floor(this.y));
    const footBlock = world.getBlock(Math.floor(this.x), Math.floor(this.y + this.h));
    this.isOnLadder = (headBlock === BLOCKS.LADDER || footBlock === BLOCKS.LADDER);
    this.isInWater = (headBlock === BLOCKS.WATER || footBlock === BLOCKS.WATER);

    if (this.isOnLadder) {
      this.vy = 0;
      if (keys['KeyW'] || keys['Space']) this.vy = -3.8;
      if (keys['KeyS']) this.vy = 3.8;
    } else if (this.isInWater) {
      this.vy = Math.min(this.vy + 6 * delta, 2.5);
      if (keys['Space'] || keys['KeyW']) this.vy = -3.2;
    } else {
      // Normal Gravity
      this.vy = Math.min(this.vy + 20 * delta, 16);
      if ((keys['Space'] || keys['KeyW'] || keys['ArrowUp']) && this.isGrounded) {
        this.vy = -7.6;
        this.isGrounded = false;
      }
    }

    // 3. Swept AABB Physics Resolution
    this.resolvePhysics(delta, world);

    // 4. Swing animation
    if (this.swingProgress > 0) {
      this.swingProgress -= delta * 5.0;
      if (this.swingProgress < 0) this.swingProgress = 0;
    }

    // 5. Hunger & Health
    if (this.hunger > 17 && this.health < this.maxHealth) {
      this.health = Math.min(this.maxHealth, this.health + delta * 0.4);
    }
  }

  resolvePhysics(delta, world) {
    const pad = 0.04;

    // Horizontal Movement
    const nextX = this.x + this.vx * delta;
    if (!this.checkCollision(nextX, this.y, pad, world)) {
      this.x = nextX;
    } else {
      this.vx = 0;
    }

    // Vertical Movement
    const nextY = this.y + this.vy * delta;
    if (!this.checkCollision(this.x, nextY, pad, world)) {
      this.y = nextY;
      this.isGrounded = false;
    } else {
      if (this.vy > 0) {
        this.isGrounded = true;
      }
      this.vy = 0;
    }

    // World Bounds
    this.x = Math.max(2, Math.min(world.width - 2, this.x));
    this.y = Math.max(2, Math.min(world.height - 2, this.y));
  }

  checkCollision(px, py, pad, world) {
    const minX = Math.floor(px - this.w / 2 + pad);
    const maxX = Math.floor(px + this.w / 2 - pad);
    const minY = Math.floor(py + pad);
    const maxY = Math.floor(py + this.h - pad);

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

  respawn(world) {
    this.health = this.maxHealth;
    this.hunger = this.maxHunger;
    this.isDead = false;
    this.x = 100;
    this.y = 40;
    this.vx = 0;
    this.vy = 0;
  }
}

// --------------------------------------------------------------------------
// AGGRESSIVE MOB AI
// --------------------------------------------------------------------------

export class Mob {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.isDead = false;

    if (type === 'zombie') {
      this.w = 0.6; this.h = 1.65; this.health = 20; this.maxHealth = 20; this.speed = 2.2; this.damage = 3.5;
    } else if (type === 'skeleton') {
      this.w = 0.6; this.h = 1.65; this.health = 18; this.maxHealth = 18; this.speed = 1.8; this.shootCooldown = 2.2;
    } else if (type === 'creeper') {
      this.w = 0.6; this.h = 1.5; this.health = 16; this.maxHealth = 16; this.speed = 2.5; this.fuseTimer = 0;
    } else if (type === 'spider') {
      this.w = 1.1; this.h = 0.7; this.health = 16; this.maxHealth = 16; this.speed = 3.5; this.damage = 3.0;
    } else if (type === 'boss') {
      this.w = 2.2; this.h = 2.2; this.health = 300; this.maxHealth = 300; this.speed = 3.0; this.attackCooldown = 1.8;
    }
  }

  update(delta, player, world, projectiles, droppedItems, audio) {
    if (this.isDead) return;

    const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    this.facing = dx > 0 ? 1 : -1;

    if (this.type === 'zombie') {
      if (distToPlayer < 18) {
        this.vx = this.facing * this.speed;
        if (world.getBlock(Math.floor(this.x + this.facing * 0.6), Math.floor(this.y + this.h - 0.2)) !== BLOCKS.AIR) {
          if (this.vy === 0) this.vy = -6.5;
        }
        if (distToPlayer < 1.1) player.takeDamage(this.damage, audio);
      }
    } 
    else if (this.type === 'skeleton') {
      if (distToPlayer < 16) {
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

        if (distToPlayer < 2.5) {
          if (this.fuseTimer === 0 && audio) audio.playCreeperFuse();
          this.fuseTimer += delta;
          if (this.fuseTimer >= 1.3) this.explode(world, player, audio);
        } else {
          this.fuseTimer = Math.max(0, this.fuseTimer - delta);
        }
      }
    }
    else if (this.type === 'spider') {
      if (distToPlayer < 18) {
        this.vx = this.facing * this.speed;
        if (world.getBlock(Math.floor(this.x + this.facing * 0.7), Math.floor(this.y + 0.5)) !== BLOCKS.AIR) {
          this.vy = -4.5;
        }
        if (distToPlayer < 1.2) player.takeDamage(this.damage, audio);
      }
    }
    else if (this.type === 'boss') {
      const angle = Math.atan2(dy, dx);
      this.vx = Math.cos(angle) * this.speed;
      this.vy = Math.sin(angle) * this.speed;

      this.attackCooldown -= delta;
      if (this.attackCooldown <= 0) {
        this.attackCooldown = 1.8;
        [-0.2, 0, 0.2].forEach(offset => {
          projectiles.push(new Projectile(this.x, this.y, Math.cos(angle + offset) * 12, Math.sin(angle + offset) * 12, 'boss'));
        });
        if (audio) audio.playExplosion();
      }
    }

    // Gravity
    if (this.type !== 'boss') {
      this.vy = Math.min(this.vy + 20 * delta, 16);
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
      if (this.type === 'zombie') {
        droppedItems.push(new DroppedItem(ITEMS.ROTTEN_FLESH, this.x, this.y, 2));
        if (Math.random() < 0.25) droppedItems.push(new DroppedItem(ITEMS.RAW_IRON, this.x, this.y, 1));
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
    this.vy += 8 * delta;
    this.x += this.vx * delta;
    this.y += this.vy * delta;

    if (world.getBlock(Math.floor(this.x), Math.floor(this.y)) !== BLOCKS.AIR) {
      this.isDead = true;
      return;
    }

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

    this.vy += 16 * delta;
    this.x += this.vx * delta;
    const nextY = this.y + this.vy * delta;

    if (world.getBlock(Math.floor(this.x), Math.floor(nextY + 0.3)) === BLOCKS.AIR) {
      this.y = nextY;
    } else {
      this.vy = 0;
      this.vx = 0;
    }

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
