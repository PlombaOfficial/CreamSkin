/**
 * THE BACKROOMS // FIRST-PERSON PLAYER CONTROLLER & SURVIVAL ENGINE
 * Handles PointerLock controls, flashlight battery, sanity, stamina,
 * item pickups (Almond Water, Batteries), and elevator interactions.
 */

export class PlayerController {
  constructor(camera, scene, world) {
    this.camera = camera;
    this.scene = scene;
    this.world = world;

    // Movement & Physics
    this.position = new THREE.Vector3(6, 1.6, 6);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.speed = 3.2;
    this.sprintSpeed = 5.8;
    this.crouchSpeed = 1.8;
    this.playerRadius = 0.45;

    // Survival Metrics
    this.battery = 100.0;
    this.sanity = 100.0;
    this.stamina = 100.0;
    this.isFlashlightOn = true;
    this.inventory = { almondWater: 1, batteries: 1 };

    // Controls input state
    this.keys = { forward: false, backward: false, left: false, right: false, sprint: false, crouch: false };
    this.isLocked = false;
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');

    // Flashlight SpotLight attached to player camera
    this.flashlight = new THREE.SpotLight(0xfffae0, 3.2, 22, Math.PI / 5, 0.45);
    this.flashlight.position.set(0.15, -0.2, -0.1);
    this.flashlight.target.position.set(0.15, -0.2, -10);
    this.camera.add(this.flashlight);
    this.camera.add(this.flashlight.target);

    // Ambient soft personal glow
    this.personalLight = new THREE.PointLight(0xfffae0, 0.25, 4);
    this.camera.add(this.personalLight);

    this.initListeners();
  }

  initListeners() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));

    const canvas = document.getElementById('game-canvas');
    const startOverlay = document.getElementById('screen-lobby');

    canvas.addEventListener('click', () => {
      if (!this.isLocked && startOverlay.classList.contains('hidden')) {
        canvas.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = (document.pointerLockElement === canvas);
    });
  }

  onKeyDown(e) {
    if (e.code === 'KeyW') this.keys.forward = true;
    if (e.code === 'KeyS') this.keys.backward = true;
    if (e.code === 'KeyA') this.keys.left = true;
    if (e.code === 'KeyD') this.keys.right = true;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.keys.sprint = true;
    if (e.code === 'KeyC') this.keys.crouch = true;

    if (e.code === 'KeyF') {
      // Toggle Flashlight
      this.toggleFlashlight();
    }

    if (e.code === 'KeyE') {
      // Interact / Pick up / Drink Almond Water / Elevator
      this.interact();
    }

    if (e.code === 'Digit1') {
      // Drink Almond Water
      this.drinkAlmondWater();
    }

    if (e.code === 'Digit2') {
      // Use Battery
      this.useBattery();
    }
  }

  onKeyUp(e) {
    if (e.code === 'KeyW') this.keys.forward = false;
    if (e.code === 'KeyS') this.keys.backward = false;
    if (e.code === 'KeyA') this.keys.left = false;
    if (e.code === 'KeyD') this.keys.right = false;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.keys.sprint = false;
    if (e.code === 'KeyC') this.keys.crouch = false;
  }

  onMouseMove(e) {
    if (!this.isLocked) return;

    const movementX = e.movementX || 0;
    const movementY = e.movementY || 0;

    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= movementX * 0.0022;
    this.euler.x -= movementY * 0.0022;

    this.euler.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.euler.x));
    this.camera.quaternion.setFromEuler(this.euler);
  }

  toggleFlashlight() {
    if (this.battery <= 0) return;
    this.isFlashlightOn = !this.isFlashlightOn;
    this.flashlight.visible = this.isFlashlightOn;
    if (window.bcAudio) window.bcAudio.playFlashlightClick();
  }

  interact() {
    // 1. Check nearby pickups (Almond water, Battery)
    for (let i = 0; i < this.world.pickups.length; i++) {
      const p = this.world.pickups[i];
      if (!p.collected) {
        const dist = Math.hypot(this.position.x - p.x, this.position.z - p.z);
        if (dist < 1.8) {
          p.collected = true;
          this.world.worldGroup.remove(p.group);

          if (p.type === 'water') {
            this.inventory.almondWater++;
            if (window.showGameNotification) window.showGameNotification('+1 Миндальная Вода [Нажмите 1]');
          } else if (p.type === 'battery') {
            this.inventory.batteries++;
            if (window.showGameNotification) window.showGameNotification('+1 Батарейка [Нажмите 2]');
          }
          if (window.updateInventoryUI) window.updateInventoryUI(this.inventory);
          return;
        }
      }
    }

    // 2. Check Elevator Door exit
    if (this.world.elevatorMesh) {
      const dist = this.position.distanceTo(this.world.elevatorMesh.position);
      if (dist < 3.2) {
        if (window.onElevatorReached) {
          window.onElevatorReached(this.world.currentLevel + 1);
        }
      }
    }
  }

  drinkAlmondWater() {
    if (this.inventory.almondWater > 0 && this.sanity < 100) {
      this.inventory.almondWater--;
      this.sanity = Math.min(100, this.sanity + 40);
      if (window.bcAudio) window.bcAudio.playAlmondWater();
      if (window.updateInventoryUI) window.updateInventoryUI(this.inventory);
      if (window.showGameNotification) window.showGameNotification('Рассудок восстановлен!');
    }
  }

  useBattery() {
    if (this.inventory.batteries > 0 && this.battery < 100) {
      this.inventory.batteries--;
      this.battery = Math.min(100, this.battery + 50);
      this.isFlashlightOn = true;
      this.flashlight.visible = true;
      if (window.bcAudio) window.bcAudio.playFlashlightClick();
      if (window.updateInventoryUI) window.updateInventoryUI(this.inventory);
      if (window.showGameNotification) window.showGameNotification('Батарея фонарика заряжена!');
    }
  }

  update(delta) {
    // 1. Movement Speed & Stamina
    let curSpeed = this.speed;
    const isMoving = this.keys.forward || this.keys.backward || this.keys.left || this.keys.right;

    if (this.keys.sprint && isMoving && this.stamina > 0) {
      curSpeed = this.sprintSpeed;
      this.stamina = Math.max(0, this.stamina - delta * 25);
    } else {
      this.stamina = Math.min(100, this.stamina + delta * 15);
    }

    if (this.keys.crouch) {
      curSpeed = this.crouchSpeed;
    }

    // 2. Direction vector
    const moveDir = new THREE.Vector3();
    if (this.keys.forward) moveDir.z -= 1;
    if (this.keys.backward) moveDir.z += 1;
    if (this.keys.left) moveDir.x -= 1;
    if (this.keys.right) moveDir.x += 1;
    moveDir.normalize();

    const yaw = this.euler.y;

    if (moveDir.lengthSq() > 0) {
      const sin = Math.sin(yaw);
      const cos = Math.cos(yaw);
      const vx = (moveDir.x * cos + moveDir.z * sin) * curSpeed * delta;
      const vz = (-moveDir.x * sin + moveDir.z * cos) * curSpeed * delta;

      // Sliding collision resolution
      const nextX = this.position.x + vx;
      const nextZ = this.position.z + vz;

      if (!this.world.isWall(nextX, this.position.z)) this.position.x = nextX;
      if (!this.world.isWall(this.position.x, nextZ)) this.position.z = nextZ;

      // Footstep sound
      if (Math.random() < 0.08 && window.bcAudio) {
        window.bcAudio.playFootstep(this.world.currentLevel === 0 ? 'carpet' : 'concrete');
      }
    }

    // 3. Update Camera position
    this.camera.position.set(
      this.position.x,
      this.keys.crouch ? 1.0 : 1.65,
      this.position.z
    );

    // 4. Flashlight Battery Depletion
    if (this.isFlashlightOn) {
      this.battery = Math.max(0, this.battery - delta * 0.45); // ~3.5 minutes lifetime per battery
      if (this.battery <= 0) {
        this.isFlashlightOn = false;
        this.flashlight.visible = false;
      } else if (this.battery < 15 && Math.random() < 0.1) {
        // Low battery flicker
        this.flashlight.intensity = Math.random() < 0.3 ? 0.3 : 3.0;
      } else {
        this.flashlight.intensity = 3.2;
      }
    }

    // 5. Sanity Depletion (in darkness or high fear)
    if (!this.isFlashlightOn) {
      this.sanity = Math.max(0, this.sanity - delta * 1.5);
    } else {
      this.sanity = Math.max(0, this.sanity - delta * 0.15);
    }

    // Update Sanity Heartbeat Audio
    if (window.bcAudio) {
      window.bcAudio.updateSanityHeartbeat(this.sanity);
    }
  }
}
