/**
 * 3D CITY SANDBOX // POLICE AI & WANTED STARS SYSTEM (★★★★★)
 * Wanted levels, police cruisers dispatch, siren sound modulation,
 * and high-speed car chases.
 */

import { CityModelFactory } from "./city-models.js";

export class PoliceSystem {
  constructor(scene, vehicleManager) {
    this.scene = scene;
    this.vehicleManager = vehicleManager;
    this.wantedLevel = 0; // 0..5 Stars
    this.cooldownTimer = 0;
    this.policeUnits = []; // Active AI police cruisers
    this.sirenAudioOsc = null;
  }

  addCrime(amount = 1) {
    this.wantedLevel = Math.min(5, this.wantedLevel + amount);
    this.cooldownTimer = 20; // 20 seconds before stars decay
    this.spawnPoliceUnits();
    this.updateHUD();
  }

  spawnPoliceUnits() {
    // Determine target count based on wanted stars
    const targetCount = this.wantedLevel * 2;

    while (this.policeUnits.length < targetCount) {
      const mesh = CityModelFactory.createPoliceCar();
      const angle = Math.random() * Math.PI * 2;
      const spawnDist = 60 + Math.random() * 30;

      const px = Math.cos(angle) * spawnDist;
      const pz = Math.sin(angle) * spawnDist;

      const v = this.vehicleManager.addVehicle(`cop_${Date.now()}_${Math.random()}`, mesh, px, 0, pz);
      v.isPoliceAI = true;
      this.policeUnits.push(v);
    }
  }

  update(delta, player, audio) {
    if (this.wantedLevel > 0) {
      this.cooldownTimer -= delta;
      if (this.cooldownTimer <= 0) {
        this.wantedLevel = Math.max(0, this.wantedLevel - 1);
        this.cooldownTimer = 15;
        this.updateHUD();
      }
    }

    // AI Police Navigation & Chase
    this.policeUnits.forEach(cop => {
      const dx = player.pos.x - cop.pos.x;
      const dz = player.pos.z - cop.pos.z;
      const dist = Math.hypot(dx, dz);

      if (this.wantedLevel > 0 && dist < 180) {
        // Calculate angle to player
        const targetYaw = Math.atan2(dx, dz);
        let angleDiff = targetYaw - cop.yaw;

        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        cop.steer = Math.max(-0.6, Math.min(0.6, angleDiff * 1.5));
        cop.yaw += cop.steer * 2.0 * delta;

        // Drive towards player
        cop.speed = Math.min(cop.speed + 18 * delta, cop.maxSpeed);

        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), cop.yaw);
        cop.pos.add(forward.multiplyScalar(cop.speed * delta));
        cop.mesh.position.copy(cop.pos);
        cop.mesh.rotation.y = cop.yaw;

        // Flash sirens
        if (cop.sirenLights) {
          cop.sirenTimer += delta * 10;
          const flash = Math.floor(cop.sirenTimer) % 2 === 0;
          cop.sirenLights.red.visible = flash;
          cop.sirenLights.blue.visible = !flash;
        }

        // Ramming player
        if (dist < 4.0) {
          if (audio) audio.playCarCrash();
          player.takeDamage(10 * delta, audio);
        }
      } else {
        // Slow down if no active crime
        cop.speed *= Math.pow(0.5, delta);
      }
    });

    this.updateHUD();
  }

  updateHUD() {
    const starEl = document.getElementById('hud-wanted-stars');
    if (starEl) {
      starEl.textContent = '★'.repeat(this.wantedLevel) + '☆'.repeat(5 - this.wantedLevel);
      starEl.className = this.wantedLevel > 0 ? 'wanted-active' : 'wanted-zero';
    }
  }
}
