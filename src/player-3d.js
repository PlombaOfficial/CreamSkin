/**
 * 3D MINECRAFT // 3D FIRST-PERSON PLAYER CONTROLS & AABB PHYSICS
 * PointerLock mouse look, AABB voxel collision, walking bobbing,
 * jump buffering, and 3D tool viewmodel.
 */

import { BLOCKS, ITEMS, ITEM_DATA } from "./items-recipes.js";

export class Player3D {
  constructor(camera, domElement, spawnX = 32, spawnY = 20, spawnZ = 32) {
    this.camera = camera;
    this.domElement = domElement;

    // Transform
    this.pos = new THREE.Vector3(spawnX, spawnY, spawnZ);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.yaw = 0;
    this.pitch = 0;

    // Dimensions
    this.w = 0.6;
    this.h = 1.8;
    this.eyeHeight = 1.6;

    // Stats
    this.health = 20;
    this.maxHealth = 20;
    this.hunger = 20;
    this.maxHunger = 20;
    this.isGrounded = false;
    this.isDead = false;

    // Animation
    this.walkBobTimer = 0;
    this.swingProgress = 0;

    // Inventory
    this.inventory = new Array(40).fill(null);
    this.selectedHotbarSlot = 0;

    // Starter items
    this.inventory[0] = { id: ITEMS.WOOD_PICKAXE, count: 1, durability: 60 };
    this.inventory[1] = { id: ITEMS.WOOD_SWORD, count: 1, durability: 60 };
    this.inventory[2] = { id: BLOCKS.TORCH, count: 32 };
    this.inventory[3] = { id: ITEMS.APPLE, count: 12 };
    this.inventory[4] = { id: BLOCKS.OAK_PLANKS, count: 32 };

    // Setup Pointer Lock
    this.isLocked = false;
    this.setupPointerLock();
  }

  getHeldItem() {
    return this.inventory[this.selectedHotbarSlot];
  }

  setupPointerLock() {
    this.domElement.addEventListener('click', () => {
      if (!this.isLocked) {
        this.domElement.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = (document.pointerLockElement === this.domElement);
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isLocked) return;
      const sens = 0.0022;
      this.yaw -= e.movementX * sens;
      this.pitch -= e.movementY * sens;
      this.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.pitch));
    });
  }

  update(delta, world, keys, audio) {
    if (this.isDead) return;

    // 1. Direction vectors from Yaw
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    let moveX = 0;
    let moveZ = 0;

    if (keys['KeyW'] || keys['ArrowUp']) { moveX += forward.x; moveZ += forward.z; }
    if (keys['KeyS'] || keys['ArrowDown']) { moveX -= forward.x; moveZ -= forward.z; }
    if (keys['KeyD'] || keys['ArrowRight']) { moveX += right.x; moveZ += right.z; }
    if (keys['KeyA'] || keys['ArrowLeft']) { moveX -= right.x; moveZ -= right.z; }

    const isSprinting = keys['ShiftLeft'] || keys['ShiftRight'];
    const speed = isSprinting ? 6.5 : 4.5;

    const moveLen = Math.hypot(moveX, moveZ);
    if (moveLen > 0.001) {
      this.vel.x = (moveX / moveLen) * speed;
      this.vel.z = (moveZ / moveLen) * speed;
      if (this.isGrounded) this.walkBobTimer += delta * 12;
    } else {
      this.vel.x = 0;
      this.vel.z = 0;
    }

    // 2. Gravity & Jump
    this.vel.y = Math.max(this.vel.y - 24 * delta, -20);
    if ((keys['Space']) && this.isGrounded) {
      this.vel.y = 8.5;
      this.isGrounded = false;
    }

    // 3. 3D Collision Step
    this.resolveCollision(delta, world);

    // 4. Update Camera Position & Rotation
    const bobOffset = Math.sin(this.walkBobTimer) * 0.05;
    this.camera.position.set(this.pos.x, this.pos.y + this.eyeHeight + bobOffset, this.pos.z);
    this.camera.rotation.set(0, 0, 0);
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    // 5. Swing animation
    if (this.swingProgress > 0) {
      this.swingProgress -= delta * 5.0;
      if (this.swingProgress < 0) this.swingProgress = 0;
    }
  }

  resolveCollision(delta, world) {
    const pad = 0.02;

    // X step
    const nextX = this.pos.x + this.vel.x * delta;
    if (!this.checkVoxelOverlap(nextX, this.pos.y, this.pos.z, pad, world)) {
      this.pos.x = nextX;
    } else {
      this.vel.x = 0;
    }

    // Z step
    const nextZ = this.pos.z + this.vel.z * delta;
    if (!this.checkVoxelOverlap(this.pos.x, this.pos.y, nextZ, pad, world)) {
      this.pos.z = nextZ;
    } else {
      this.vel.z = 0;
    }

    // Y step
    const nextY = this.pos.y + this.vel.y * delta;
    if (!this.checkVoxelOverlap(this.pos.x, nextY, this.pos.z, pad, world)) {
      this.pos.y = nextY;
      this.isGrounded = false;
    } else {
      if (this.vel.y < 0) this.isGrounded = true;
      this.vel.y = 0;
    }
  }

  checkVoxelOverlap(px, py, pz, pad, world) {
    const minX = Math.floor(px - this.w / 2 + pad);
    const maxX = Math.floor(px + this.w / 2 - pad);
    const minY = Math.floor(py + pad);
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
    if (this.health <= 0) this.isDead = true;
  }

  respawn(world) {
    this.health = this.maxHealth;
    this.hunger = this.maxHunger;
    this.isDead = false;
    this.pos.set(32, 22, 32);
    this.vel.set(0, 0, 0);
  }
}
