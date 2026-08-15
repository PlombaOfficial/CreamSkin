/**
 * 3D MINECRAFT // FIRST-PERSON PLAYER CONTROLLER & SMOOTH PHYSICS
 * Proper 'YXZ' camera Euler rotation, auto-step ledge climbing,
 * continuous ground checking, and jump buffer.
 */

import { BLOCKS, ITEMS, ITEM_DATA } from "./items-recipes.js";

export class Player3D {
  constructor(camera, domElement, spawnX = 32, spawnY = 16, spawnZ = 32) {
    this.camera = camera;
    this.domElement = domElement;

    // Transform
    this.pos = new THREE.Vector3(spawnX, spawnY, spawnZ);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.yaw = 0;
    this.pitch = 0;

    // Set rotation order to YXZ (Minecraft FPS standard)
    this.camera.rotation.order = 'YXZ';

    // Hitbox
    this.w = 0.55;
    this.h = 1.75;
    this.eyeHeight = 1.55;

    // Stats
    this.health = 20;
    this.maxHealth = 20;
    this.hunger = 20;
    this.maxHunger = 20;
    this.isGrounded = true;
    this.isDead = false;

    // Animation
    this.walkBobTimer = 0;
    this.swingProgress = 0;

    // Inventory
    this.inventory = new Array(40).fill(null);
    this.selectedHotbarSlot = 0;

    // Starter tools & items
    this.inventory[0] = { id: ITEMS.IRON_PICKAXE, count: 1 };
    this.inventory[1] = { id: ITEMS.IRON_SWORD, count: 1 };
    this.inventory[2] = { id: BLOCKS.TORCH, count: 32 };
    this.inventory[3] = { id: ITEMS.APPLE, count: 16 };
    this.inventory[4] = { id: BLOCKS.OAK_PLANKS, count: 64 };
    this.inventory[5] = { id: BLOCKS.COBBLESTONE, count: 32 };

    this.isLocked = false;
    this.setupPointerLock();
  }

  getHeldItem() {
    return this.inventory[this.selectedHotbarSlot];
  }

  setupPointerLock() {
    document.addEventListener('pointerlockchange', () => {
      this.isLocked = (document.pointerLockElement === this.domElement);
      const tip = document.getElementById('hud-lock-overlay');
      if (tip) {
        if (this.isLocked) tip.classList.add('hidden');
        else tip.classList.remove('hidden');
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isLocked) return;
      const sens = 0.0022;
      this.yaw -= e.movementX * sens;
      this.pitch -= e.movementY * sens;
      this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch));
    });
  }

  requestLock() {
    if (!this.isLocked && this.domElement) {
      this.domElement.requestPointerLock();
    }
  }

  update(delta, world, keys, audio) {
    if (this.isDead) return;

    // 1. Direction vectors
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    let moveX = 0;
    let moveZ = 0;

    if (keys['KeyW'] || keys['ArrowUp']) { moveX += forward.x; moveZ += forward.z; }
    if (keys['KeyS'] || keys['ArrowDown']) { moveX -= forward.x; moveZ -= forward.z; }
    if (keys['KeyD'] || keys['ArrowRight']) { moveX += right.x; moveZ += right.z; }
    if (keys['KeyA'] || keys['ArrowLeft']) { moveX -= right.x; moveZ -= right.z; }

    const isSprinting = keys['ShiftLeft'] || keys['ShiftRight'];
    const speed = isSprinting ? 6.5 : 4.6;

    const moveLen = Math.hypot(moveX, moveZ);
    if (moveLen > 0.001) {
      this.vel.x = (moveX / moveLen) * speed;
      this.vel.z = (moveZ / moveLen) * speed;
      if (this.isGrounded) this.walkBobTimer += delta * 11;
    } else {
      this.vel.x = 0;
      this.vel.z = 0;
    }

    // 2. Gravity & Jump
    this.vel.y = Math.max(this.vel.y - 22 * delta, -20);
    if (keys['Space'] && this.isGrounded) {
      this.vel.y = 7.5;
      this.isGrounded = false;
      if (audio) audio.playSwing();
    }

    // 3. Movement with Auto-Step Ledge Climbing
    this.resolveMovement(delta, world);

    // 4. Camera Transform (Order YXZ prevents gimbal distortion!)
    const bob = Math.sin(this.walkBobTimer) * 0.04;
    this.camera.position.set(this.pos.x, this.pos.y + this.eyeHeight + bob, this.pos.z);
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    // 5. Swing animation
    if (this.swingProgress > 0) {
      this.swingProgress -= delta * 4.5;
      if (this.swingProgress < 0) this.swingProgress = 0;
    }
  }

  resolveMovement(delta, world) {
    const pad = 0.05;

    // --- X Axis ---
    const nextX = this.pos.x + this.vel.x * delta;
    if (!this.checkCollision(nextX, this.pos.y, this.pos.z, pad, world)) {
      this.pos.x = nextX;
    } else {
      // Auto-step 1 block up if obstacle is low
      if (this.isGrounded && !this.checkCollision(nextX, this.pos.y + 1.05, this.pos.z, pad, world)) {
        this.pos.y += 1.05;
        this.pos.x = nextX;
      } else {
        this.vel.x = 0;
      }
    }

    // --- Z Axis ---
    const nextZ = this.pos.z + this.vel.z * delta;
    if (!this.checkCollision(this.pos.x, this.pos.y, nextZ, pad, world)) {
      this.pos.z = nextZ;
    } else {
      // Auto-step 1 block up if obstacle is low
      if (this.isGrounded && !this.checkCollision(this.pos.x, this.pos.y + 1.05, nextZ, pad, world)) {
        this.pos.y += 1.05;
        this.pos.z = nextZ;
      } else {
        this.vel.z = 0;
      }
    }

    // --- Y Axis (Gravity / Jump) ---
    const nextY = this.pos.y + this.vel.y * delta;
    if (!this.checkCollision(this.pos.x, nextY, this.pos.z, pad, world)) {
      this.pos.y = nextY;
      this.isGrounded = false;
    } else {
      if (this.vel.y < 0) {
        this.isGrounded = true;
        // Snap to voxel surface
        this.pos.y = Math.floor(this.pos.y + 0.1);
      }
      this.vel.y = 0;
    }
  }

  checkCollision(px, py, pz, pad, world) {
    const minX = Math.floor(px - this.w / 2 + pad);
    const maxX = Math.floor(px + this.w / 2 - pad);
    const minY = Math.floor(py);
    const maxY = Math.floor(py + this.h - pad);
    const minZ = Math.floor(pz - this.w / 2 + pad);
    const maxZ = Math.floor(pz + this.w / 2 - pad);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const b = world.getVoxel(x, y, z);
          if (b !== BLOCKS.AIR && b !== BLOCKS.WATER && b !== BLOCKS.TORCH) {
            return true;
          }
        }
      }
    }
    return false;
  }

  takeDamage(amount, audio) {
    if (this.isDead) return;
    this.health = Math.max(0, this.health - amount);
    if (audio) audio.playHit();
    if (this.health <= 0) {
      this.isDead = true;
    }
  }

  respawn(world) {
    this.health = this.maxHealth;
    this.hunger = this.maxHunger;
    this.isDead = false;
    const spawnY = world.getHighestSolidY(32, 32) + 1.1;
    this.pos.set(32, spawnY, 32);
    this.vel.set(0, 0, 0);
  }
}
