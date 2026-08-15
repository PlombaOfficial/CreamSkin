/**
 * 3D CITY SANDBOX // THIRD-PERSON CHARACTER CONTROLLER & COMBAT
 * Smooth humanoid animations, third-person orbit camera, vehicle enter/exit, and shooting.
 */

import { CityModelFactory } from "./city-models.js";
import { WEAPONS } from "./weapons-combat.js";

export class CityPlayer {
  constructor(scene, camera, domElement, x = 0, y = 0, z = 0, colorHex = 0x00aaaa) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;

    this.id = 'p_' + Math.random().toString(36).substring(2, 7);
    this.name = 'Стив';
    this.colorHex = colorHex;

    // Transform
    this.pos = new THREE.Vector3(x, y, z);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.yaw = 0;
    this.pitch = 0.2;

    // Stats
    this.health = 100;
    this.maxHealth = 100;
    this.armor = 100;
    this.money = 2500;
    this.isDead = false;

    // State
    this.isInVehicle = false;
    this.currentVehicleId = null;

    // Weapons
    this.weapons = [WEAPONS[0], WEAPONS[1], WEAPONS[2], WEAPONS[3]];
    this.activeWeaponIdx = 1; // Start with 9mm Pistol
    this.lastShotTime = 0;

    // 3D Character Mesh
    this.mesh = CityModelFactory.createCharacter(colorHex);
    this.mesh.position.copy(this.pos);
    this.scene.add(this.mesh);

    // Pointer Lock
    this.isLocked = false;
    this.setupControls();
  }

  setupControls() {
    this.domElement.addEventListener('click', () => {
      if (!this.isLocked) this.domElement.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = (document.pointerLockElement === this.domElement);
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isLocked) return;
      const sens = 0.0024;
      this.yaw -= e.movementX * sens;
      this.pitch = Math.max(-0.6, Math.min(0.8, this.pitch + e.movementY * sens));
    });
  }

  requestLock() {
    if (!this.isLocked && this.domElement) this.domElement.requestPointerLock();
  }

  getActiveWeapon() {
    return this.weapons[this.activeWeaponIdx] || this.weapons[0];
  }

  shoot(scene, audio, policeSystem, remotePlayers, network) {
    if (this.isDead) return;
    const now = performance.now() / 1000;
    const wep = this.getActiveWeapon();
    if (now - this.lastShotTime < wep.fireRate) return;
    this.lastShotTime = now;

    if (audio) audio.playGunshot(wep.id);

    // Crime increases wanted stars if shooting in public!
    if (policeSystem) policeSystem.addCrime(1);

    // Bullet Raycast forward
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    const startPos = this.pos.clone().add(new THREE.Vector3(0, 1.3, 0));

    // Bullet Tracer Visual
    const tracerGeo = new THREE.CylinderGeometry(0.02, 0.02, 3, 4);
    tracerGeo.rotateX(Math.PI / 2);
    const tracerMat = new THREE.MeshBasicMaterial({ color: 0xffdd44 });
    const tracer = new THREE.Mesh(tracerGeo, tracerMat);
    tracer.position.copy(startPos).add(forward.clone().multiplyScalar(2.0));
    tracer.rotation.y = this.yaw;
    scene.add(tracer);

    setTimeout(() => scene.remove(tracer), 60);

    // Sync shoot event
    if (network) network.sendChat(`💥 выстрел из ${wep.name}`);
  }

  update(delta, keys, world) {
    if (this.isDead) return;

    if (this.isInVehicle) {
      // Character is inside vehicle, hide mesh or place in seat
      this.mesh.visible = false;
      return;
    }

    this.mesh.visible = true;

    // Direction from camera yaw
    const forward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    let mx = 0;
    let mz = 0;

    if (keys['KeyW'] || keys['ArrowUp']) { mx += forward.x; mz += forward.z; }
    if (keys['KeyS'] || keys['ArrowDown']) { mx -= forward.x; mz -= forward.z; }
    if (keys['KeyD'] || keys['ArrowRight']) { mx -= right.x; mz -= right.z; }
    if (keys['KeyA'] || keys['ArrowLeft']) { mx += right.x; mz += right.z; }

    const isSprinting = keys['ShiftLeft'] || keys['ShiftRight'];
    const speed = isSprinting ? 8.5 : 4.5;

    const moveLen = Math.hypot(mx, mz);
    if (moveLen > 0.001) {
      this.vel.x = (mx / moveLen) * speed;
      this.vel.z = (mz / moveLen) * speed;

      // Animate walking limbs
      this.mesh.userData.walkTimer += delta * (isSprinting ? 16 : 10);
      const swing = Math.sin(this.mesh.userData.walkTimer) * 0.55;
      this.mesh.userData.leftLeg.rotation.x = swing;
      this.mesh.userData.rightLeg.rotation.x = -swing;
      this.mesh.userData.leftArm.rotation.x = -swing;
      this.mesh.userData.rightArm.rotation.x = swing;

      this.mesh.rotation.y = Math.atan2(this.vel.x, this.vel.z);
    } else {
      this.vel.x = 0;
      this.vel.z = 0;
      this.mesh.userData.leftLeg.rotation.x = 0;
      this.mesh.userData.rightLeg.rotation.x = 0;
      this.mesh.userData.leftArm.rotation.x = 0;
      this.mesh.userData.rightArm.rotation.x = 0;
      this.mesh.rotation.y = this.yaw;
    }

    // Move on flat city ground
    this.pos.x += this.vel.x * delta;
    this.pos.z += this.vel.z * delta;
    this.pos.y = 0; // Solid city ground

    this.mesh.position.copy(this.pos);

    // Smooth Third-Person Orbit Camera
    const camDist = 4.2;
    const camHeight = 1.8 + this.pitch * 1.5;
    const camX = this.pos.x - Math.sin(this.yaw) * camDist;
    const camZ = this.pos.z - Math.cos(this.yaw) * camDist;

    this.camera.position.set(camX, this.pos.y + camHeight, camZ);
    this.camera.lookAt(this.pos.x, this.pos.y + 1.4, this.pos.z);
  }

  takeDamage(amount, audio) {
    if (this.isDead) return;
    if (this.armor > 0) {
      this.armor = Math.max(0, this.armor - amount * 0.6);
      this.health = Math.max(0, this.health - amount * 0.4);
    } else {
      this.health = Math.max(0, this.health - amount);
    }
    if (this.health <= 0) {
      this.isDead = true;
      this.respawn();
    }
  }

  respawn() {
    this.health = this.maxHealth;
    this.armor = 100;
    this.isDead = false;
    this.pos.set(0, 0, 0);
  }
}
