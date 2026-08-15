/**
 * 3D MINECRAFT // 3D VOXEL MOBS, PROJECTILES & DROPPED ITEMS (THREE.JS)
 */

import { BLOCKS, ITEMS } from "./items-recipes.js";

export class Mob3D {
  constructor(type, x, y, z, scene) {
    this.type = type;
    this.pos = new THREE.Vector3(x, y, z);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.scene = scene;
    this.isDead = false;

    // Stats
    if (type === 'zombie') {
      this.health = 20; this.speed = 2.4; this.damage = 3.5;
    } else if (type === 'skeleton') {
      this.health = 18; this.speed = 2.0; this.shootCooldown = 2.5;
    } else if (type === 'creeper') {
      this.health = 16; this.speed = 2.8; this.fuseTimer = 0;
    } else if (type === 'spider') {
      this.health = 16; this.speed = 3.8; this.damage = 3.0;
    } else if (type === 'boss') {
      this.health = 250; this.maxHealth = 250; this.speed = 3.2; this.attackCooldown = 2.0;
    }

    this.mesh = this.createMesh();
    this.scene.add(this.mesh);
  }

  createMesh() {
    const group = new THREE.Group();

    if (this.type === 'zombie') {
      const headMat = new THREE.MeshLambertMaterial({ color: 0x497332 });
      const bodyMat = new THREE.MeshLambertMaterial({ color: 0x008888 });
      const legMat = new THREE.MeshLambertMaterial({ color: 0x2b3990 });

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), headMat);
      head.position.y = 1.5;
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.3), bodyMat);
      body.position.y = 0.9;
      const legs = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.3), legMat);
      legs.position.y = 0.35;

      group.add(head, body, legs);
    } else if (this.type === 'skeleton') {
      const boneMat = new THREE.MeshLambertMaterial({ color: 0xd9d9d9 });
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), boneMat);
      head.position.y = 1.5;
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.25), boneMat);
      body.position.y = 0.9;
      const legs = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.25), boneMat);
      legs.position.y = 0.35;
      group.add(head, body, legs);
    } else if (this.type === 'creeper') {
      const creepMat = new THREE.MeshLambertMaterial({ color: 0x00aa00 });
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), creepMat);
      head.position.y = 1.3;
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.3), creepMat);
      body.position.y = 0.6;
      group.add(head, body);
    } else if (this.type === 'boss') {
      const bossMat = new THREE.MeshLambertMaterial({ color: 0x140d1e });
      const head = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), bossMat);
      group.add(head);
    }

    return group;
  }

  update(delta, player, world, projectiles, droppedItems, audio) {
    if (this.isDead) return;

    const dx = player.pos.x - this.pos.x;
    const dz = player.pos.z - this.pos.z;
    const dist = Math.hypot(dx, dz);

    if (dist < 20 && dist > 0.5) {
      this.vel.x = (dx / dist) * this.speed;
      this.vel.z = (dz / dist) * this.speed;
      this.mesh.rotation.y = Math.atan2(dx, dz);

      // Jump over blocks
      const frontX = Math.floor(this.pos.x + (dx / dist) * 0.6);
      const frontZ = Math.floor(this.pos.z + (dz / dist) * 0.6);
      if (world.getVoxel(frontX, Math.floor(this.pos.y), frontZ) !== BLOCKS.AIR) {
        if (this.vel.y === 0) this.vel.y = 6.5;
      }

      // Attack
      if (dist < 1.4 && (this.type === 'zombie' || this.type === 'spider')) {
        player.takeDamage(this.damage, audio);
      }

      // Creeper Explode
      if (this.type === 'creeper') {
        if (dist < 2.5) {
          if (this.fuseTimer === 0 && audio) audio.playCreeperFuse();
          this.fuseTimer += delta;
          if (this.fuseTimer >= 1.3) this.explode(world, player, audio);
        }
      }
    } else {
      this.vel.x = 0;
      this.vel.z = 0;
    }

    if (this.type !== 'boss') {
      this.vel.y = Math.max(this.vel.y - 20 * delta, -15);
      this.pos.x += this.vel.x * delta;
      this.pos.z += this.vel.z * delta;
      this.pos.y += this.vel.y * delta;

      const groundY = Math.floor(this.pos.y);
      if (world.getVoxel(Math.floor(this.pos.x), groundY, Math.floor(this.pos.z)) !== BLOCKS.AIR) {
        this.pos.y = groundY + 1;
        this.vel.y = 0;
      }
    } else {
      this.pos.x += this.vel.x * delta;
      this.pos.z += this.vel.z * delta;
      this.pos.y = 18 + Math.sin(Date.now() * 0.002) * 4;
    }

    this.mesh.position.copy(this.pos);
  }

  explode(world, player, audio) {
    this.isDead = true;
    this.scene.remove(this.mesh);
    if (audio) audio.playExplosion();

    const rad = 3;
    const cx = Math.floor(this.pos.x);
    const cy = Math.floor(this.pos.y);
    const cz = Math.floor(this.pos.z);

    for (let x = cx - rad; x <= cx + rad; x++) {
      for (let y = cy - rad; y <= cy + rad; y++) {
        for (let z = cz - rad; z <= cz + rad; z++) {
          if (Math.hypot(x - cx, y - cy, z - cz) <= rad) {
            const b = world.getVoxel(x, y, z);
            if (b !== BLOCKS.BEDROCK && b !== BLOCKS.OBSIDIAN) {
              world.setVoxel(x, y, z, BLOCKS.AIR);
            }
          }
        }
      }
    }

    const dist = player.pos.distanceTo(this.pos);
    if (dist < 6.0) player.takeDamage((1.0 - dist / 6.0) * 16, audio);
  }

  takeDamage(amount, droppedItems, audio) {
    this.health -= amount;
    if (audio) audio.playHit();
    if (this.health <= 0) {
      this.isDead = true;
      this.scene.remove(this.mesh);
      if (this.type === 'zombie') {
        droppedItems.push(new DroppedItem3D(ITEMS.ROTTEN_FLESH, this.pos.x, this.pos.y + 0.5, this.pos.z, this.scene));
      } else if (this.type === 'boss') {
        droppedItems.push(new DroppedItem3D(ITEMS.NETHERITE_INGOT, this.pos.x, this.pos.y + 0.5, this.pos.z, this.scene, 4));
        droppedItems.push(new DroppedItem3D(ITEMS.DIAMOND, this.pos.x, this.pos.y + 0.5, this.pos.z, this.scene, 8));
      }
    }
  }
}

export class DroppedItem3D {
  constructor(itemId, x, y, z, scene, count = 1) {
    this.itemId = itemId;
    this.pos = new THREE.Vector3(x, y, z);
    this.count = count;
    this.scene = scene;
    this.isDead = false;
    this.rotTimer = 0;

    const geo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const mat = new THREE.MeshLambertMaterial({ color: 0x5decf2 });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(this.pos);
    this.scene.add(this.mesh);
  }

  update(delta, player, audio) {
    if (this.isDead) return;
    this.rotTimer += delta * 3;
    this.mesh.rotation.y = this.rotTimer;
    this.mesh.position.y = this.pos.y + Math.sin(this.rotTimer * 2) * 0.1;

    const dist = player.pos.distanceTo(this.pos);
    if (dist < 1.6) {
      this.isDead = true;
      this.scene.remove(this.mesh);
      this.giveToPlayer(player);
      if (audio) audio.playPop();
    }
  }

  giveToPlayer(player) {
    for (let i = 0; i < 36; i++) {
      const s = player.inventory[i];
      if (s && s.id === this.itemId && s.count < 64) {
        s.count += this.count;
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
