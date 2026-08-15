/**
 * 3D MINECRAFT // CALM 3D MOBS & DROPPED ITEMS
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
      this.health = 20; this.speed = 1.8; this.damage = 2.5;
    } else if (type === 'skeleton') {
      this.health = 18; this.speed = 1.5; this.shootCooldown = 3.0;
    } else if (type === 'creeper') {
      this.health = 16; this.speed = 1.9; this.fuseTimer = 0;
    } else if (type === 'spider') {
      this.health = 16; this.speed = 2.8; this.damage = 2.0;
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
      head.position.y = 1.45;
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.3), bodyMat);
      body.position.y = 0.85;
      const legs = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.6, 0.25), legMat);
      legs.position.y = 0.3;
      group.add(head, body, legs);
    } else if (this.type === 'creeper') {
      this.creepMat = new THREE.MeshLambertMaterial({ color: 0x00aa00 });
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), this.creepMat);
      head.position.y = 1.3;
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.3), this.creepMat);
      body.position.y = 0.6;
      group.add(head, body);
    }

    return group;
  }

  update(delta, player, world, projectiles, droppedItems, audio) {
    if (this.isDead) return;

    const dx = player.pos.x - this.pos.x;
    const dz = player.pos.z - this.pos.z;
    const dist = Math.hypot(dx, dz);

    // Only aggro if player is reasonably close
    if (dist < 18 && dist > 0.8) {
      this.vel.x = (dx / dist) * this.speed;
      this.vel.z = (dz / dist) * this.speed;
      this.mesh.rotation.y = Math.atan2(dx, dz);

      // Auto step / jump over 1-block terrain
      const frontX = Math.floor(this.pos.x + (dx / dist) * 0.6);
      const frontZ = Math.floor(this.pos.z + (dz / dist) * 0.6);
      if (world.getVoxel(frontX, Math.floor(this.pos.y), frontZ) !== BLOCKS.AIR) {
        if (this.vel.y === 0) this.vel.y = 6.0;
      }

      // Attack
      if (dist < 1.3 && this.type === 'zombie') {
        player.takeDamage(this.damage, audio);
      }

      // Creeper Fuse (graceful 2.5 second warning)
      if (this.type === 'creeper') {
        if (dist < 2.2) {
          if (this.fuseTimer === 0 && audio) audio.playCreeperFuse();
          this.fuseTimer += delta;
          if (this.creepMat) {
            this.creepMat.color.setHex(Math.floor(this.fuseTimer * 8) % 2 === 0 ? 0xffffff : 0x00aa00);
          }
          if (this.fuseTimer >= 2.2) this.explode(world, player, audio);
        } else {
          this.fuseTimer = Math.max(0, this.fuseTimer - delta);
          if (this.creepMat) this.creepMat.color.setHex(0x00aa00);
        }
      }
    } else {
      this.vel.x = 0;
      this.vel.z = 0;
    }

    // Physics
    this.vel.y = Math.max(this.vel.y - 20 * delta, -15);
    this.pos.x += this.vel.x * delta;
    this.pos.z += this.vel.z * delta;
    this.pos.y += this.vel.y * delta;

    const groundY = world.getHighestSolidY(Math.floor(this.pos.x), Math.floor(this.pos.z));
    if (this.pos.y <= groundY + 1.0) {
      this.pos.y = groundY + 1.0;
      this.vel.y = 0;
    }

    this.mesh.position.copy(this.pos);
  }

  explode(world, player, audio) {
    this.isDead = true;
    this.scene.remove(this.mesh);
    if (audio) audio.playExplosion();

    const rad = 2.5;
    const cx = Math.floor(this.pos.x);
    const cy = Math.floor(this.pos.y);
    const cz = Math.floor(this.pos.z);

    for (let x = cx - 2; x <= cx + 2; x++) {
      for (let y = cy - 2; y <= cy + 2; y++) {
        for (let z = cz - 2; z <= cz + 2; z++) {
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
    if (dist < 4.5) player.takeDamage((1.0 - dist / 4.5) * 12, audio);
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
    this.mesh.position.y = this.pos.y + Math.sin(this.rotTimer * 2) * 0.08;

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
