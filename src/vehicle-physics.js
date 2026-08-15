/**
 * 3D CITY SANDBOX // VEHICLE DRIVING & SQUAD PASSENGER SYSTEM
 * Realistic arcade physics: acceleration, handbrake drifting, wheel turning,
 * camera follow, and multi-player seating (Driver + 3 Passengers).
 */

export class VehicleManager {
  constructor(scene) {
    this.scene = scene;
    this.vehicles = [];
    this.activeVehicle = null; // Car currently driven by local player
    this.activeSeat = -1;      // 0 = Driver, 1..3 = Passenger
  }

  addVehicle(id, mesh, x, y, z, yaw = 0) {
    mesh.position.set(x, y, z);
    mesh.rotation.y = yaw;
    this.scene.add(mesh);

    const v = {
      id: id,
      mesh: mesh,
      type: mesh.userData.type || 'sport',
      maxSpeed: mesh.userData.maxSpeed || 36,
      accel: mesh.userData.accel || 22,
      seats: mesh.userData.seats || 2,
      speed: 0,
      steer: 0,
      yaw: yaw,
      pos: new THREE.Vector3(x, y, z),
      driver: null,       // Local/remote player ID
      passengers: [null, null, null], // Up to 3 passenger player IDs
      wheels: mesh.userData.wheels,
      sirenLights: mesh.userData.sirenLights,
      sirenTimer: 0
    };

    this.vehicles.push(v);
    return v;
  }

  tryEnterVehicle(player, audio) {
    // If already in vehicle, exit
    if (this.activeVehicle) {
      this.exitVehicle(player);
      return;
    }

    // Find closest vehicle within 3.5 meters
    let closest = null;
    let minDist = 3.8;

    this.vehicles.forEach(v => {
      const d = player.pos.distanceTo(v.pos);
      if (d < minDist) {
        minDist = d;
        closest = v;
      }
    });

    if (!closest) return;

    // Check if driver seat is free
    if (!closest.driver) {
      closest.driver = player.id || 'local_player';
      this.activeVehicle = closest;
      this.activeSeat = 0;
      player.isInVehicle = true;
      player.currentVehicleId = closest.id;
      if (audio) audio.playCarDoor();
      return;
    }

    // Check if passenger seat is free (up to 3 passengers)
    for (let s = 0; s < closest.seats - 1; s++) {
      if (!closest.passengers[s]) {
        closest.passengers[s] = player.id || 'local_player';
        this.activeVehicle = closest;
        this.activeSeat = s + 1;
        player.isInVehicle = true;
        player.currentVehicleId = closest.id;
        if (audio) audio.playCarDoor();
        return;
      }
    }
  }

  exitVehicle(player) {
    if (!this.activeVehicle) return;

    if (this.activeSeat === 0) {
      this.activeVehicle.driver = null;
    } else {
      this.activeVehicle.passengers[this.activeSeat - 1] = null;
    }

    // Position player next to the driver door
    const exitOffset = new THREE.Vector3(-1.8, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.activeVehicle.yaw);
    player.pos.copy(this.activeVehicle.pos).add(exitOffset);
    player.pos.y = 0.8;
    player.isInVehicle = false;
    player.currentVehicleId = null;

    this.activeVehicle = null;
    this.activeSeat = -1;
  }

  update(delta, keys, camera, player, audio) {
    // 1. Update driven vehicle
    if (this.activeVehicle && this.activeSeat === 0) {
      const v = this.activeVehicle;

      // Throttle & Reverse
      if (keys['KeyW'] || keys['ArrowUp']) {
        v.speed = Math.min(v.speed + v.accel * delta, v.maxSpeed);
      } else if (keys['KeyS'] || keys['ArrowDown']) {
        v.speed = Math.max(v.speed - v.accel * delta, -v.maxSpeed * 0.4);
      } else {
        // Natural friction deceleration
        v.speed *= Math.pow(0.2, delta);
        if (Math.abs(v.speed) < 0.1) v.speed = 0;
      }

      // Steering
      const steerTarget = (keys['KeyA'] || keys['ArrowLeft']) ? 0.65 : ((keys['KeyD'] || keys['ArrowRight']) ? -0.65 : 0);
      v.steer += (steerTarget - v.steer) * 12 * delta;

      // Handbrake Drift
      const isDrifting = keys['Space'];
      if (isDrifting && Math.abs(v.speed) > 10) {
        v.speed *= 0.98;
      }

      // Turn vehicle based on speed and steer angle
      if (Math.abs(v.speed) > 0.5) {
        const turnFactor = isDrifting ? 1.8 : 1.1;
        v.yaw += v.steer * (v.speed / v.maxSpeed) * turnFactor * delta * 2.8;
      }

      // Move in 3D
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), v.yaw);
      v.pos.add(forward.multiplyScalar(v.speed * delta));
      v.mesh.position.copy(v.pos);
      v.mesh.rotation.y = v.yaw;

      // Animate front wheel turning
      if (v.wheels) {
        v.wheels.fl.rotation.y = v.steer;
        v.wheels.fr.rotation.y = v.steer;
        const spinDelta = (v.speed * delta) / (v.wheels.radius || 0.4);
        v.wheels.meshes.forEach(w => w.children[0].rotation.x += spinDelta);
      }

      // Police Siren Flashing
      if (v.sirenLights) {
        v.sirenTimer += delta * 8;
        const flash = Math.floor(v.sirenTimer) % 2 === 0;
        v.sirenLights.red.visible = flash;
        v.sirenLights.blue.visible = !flash;
      }

      // Update Player position inside car
      player.pos.copy(v.pos);

      // Smooth Chase Camera
      const camDist = 7.0;
      const camHeight = 3.2;
      const camBack = new THREE.Vector3(0, camHeight, -camDist).applyAxisAngle(new THREE.Vector3(0, 1, 0), v.yaw);
      const targetCamPos = v.pos.clone().add(camBack);

      camera.position.lerp(targetCamPos, 0.15);
      const lookTarget = v.pos.clone().add(new THREE.Vector3(0, 1.2, 0));
      camera.lookAt(lookTarget);
    } 
    // 2. Update Passenger Camera
    else if (this.activeVehicle && this.activeSeat > 0) {
      const v = this.activeVehicle;
      player.pos.copy(v.pos);

      const camBack = new THREE.Vector3(0, 3.2, -6.5).applyAxisAngle(new THREE.Vector3(0, 1, 0), v.yaw);
      camera.position.lerp(v.pos.clone().add(camBack), 0.2);
      camera.lookAt(v.pos.clone().add(new THREE.Vector3(0, 1.0, 0)));
    }
  }
}
