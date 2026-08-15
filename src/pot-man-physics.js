/**
 * 3D GETTING OVER IT // PURE BENNETT FODDY RIGID LEVER PHYSICS
 * 1. The mouse controls ONLY the hammer head offset relative to the shoulders.
 * 2. In free air: moving mouse swings the hammer; the pot does NOT move with the mouse!
 * 3. On ground/rock: pushing mouse INTO the rock levers and pushes the pot AWAY!
 * 4. Hooking a ledge: pulling mouse DOWN pulls the pot UP onto the ledge!
 * 5. Smooth frictionless pot sphere: never snags or gets stuck on corners.
 * 6. Floaty, pleasant, controllable low gravity (16.0).
 */

export class PotMan {
  constructor(scene, camera, domElement, spawnX = 0, spawnY = 1.0, spawnZ = 0, colorHex = 0x111111) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;

    // 1. Cauldron Body (Smooth round capsule/sphere - never snags)
    this.pos = new THREE.Vector3(spawnX, spawnY, spawnZ);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.potRadius = 0.65;

    // 2. Shoulders & Hammer Kinematics
    this.shoulderOffset = new THREE.Vector3(0, 0.95, 0);
    this.hammerHead = new THREE.Vector3(spawnX + 1.3, spawnY, 0);
    this.hammerRadius = 0.22;
    this.minArmLength = 0.75;
    this.maxArmLength = 2.15;

    // 3. Mouse Aim Offset (relative to shoulders in 2D plane)
    this.mouseOffset = new THREE.Vector2(1.3, -0.5);

    // State & Height
    this.heightScore = 0;
    this.maxHeightReached = 0;
    this.name = 'Диоген';

    // 3D Visual Meshes
    this.group = new THREE.Group();
    this.createModel(colorHex);
    this.scene.add(this.group);

    this.isLocked = false;
    this.setupMouse();
  }

  createModel(colorHex) {
    // Cast-iron Smooth Cauldron
    const potMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.45, metalness: 0.8 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.9, roughness: 0.3 });

    const potBase = new THREE.Mesh(new THREE.SphereGeometry(this.potRadius, 20, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), potMat);
    potBase.position.y = 0.35;
    potBase.rotation.x = Math.PI;

    const potRim = new THREE.Mesh(new THREE.TorusGeometry(this.potRadius, 0.08, 12, 24), rimMat);
    potRim.position.y = 0.68;
    potRim.rotation.x = Math.PI / 2;
    this.group.add(potBase, potRim);

    // Muscular Character
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xdca578, roughness: 0.5 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x332211, roughness: 0.8 });

    this.torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.75, 12), skinMat);
    this.torso.position.y = 0.98;

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), skinMat);
    head.position.y = 1.48;

    const beard = new THREE.Mesh(new THREE.SphereGeometry(0.23, 12, 8), hairMat);
    beard.position.set(0, 1.42, 0.06);
    beard.scale.set(0.85, 0.65, 0.85);
    this.group.add(this.torso, head, beard);

    // Sledgehammer Mesh
    this.hammerMesh = new THREE.Group();
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xa66a38, roughness: 0.7 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.85, roughness: 0.25 });

    this.shaftMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 1.0, 8), shaftMat);
    this.shaftMesh.rotation.z = Math.PI / 2;

    this.headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.46, 0.36), headMat);

    this.hammerMesh.add(this.shaftMesh, this.headMesh);
    this.scene.add(this.hammerMesh);
  }

  setupMouse() {
    this.domElement.addEventListener('click', () => {
      if (!this.isLocked) this.domElement.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = (document.pointerLockElement === this.domElement);
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isLocked) return;
      // Mouse movement directly updates the target hammer offset from shoulders
      const sens = 0.0075;
      this.mouseOffset.x += e.movementX * sens;
      this.mouseOffset.y -= e.movementY * sens; // Invert screen Y

      const len = this.mouseOffset.length();
      if (len > this.maxArmLength) {
        this.mouseOffset.normalize().multiplyScalar(this.maxArmLength);
      }
    });
  }

  requestLock() {
    if (!this.isLocked && this.domElement) this.domElement.requestPointerLock();
  }

  update(delta, obstacles, audio) {
    // 1. Calculate Desired Hammer Head Offset from Shoulders
    const armLen = Math.max(this.minArmLength, Math.min(this.maxArmLength, this.mouseOffset.length()));
    const armDir = this.mouseOffset.clone().normalize();
    const desiredOffset = new THREE.Vector3(armDir.x * armLen, armDir.y * armLen, 0);

    const shoulder = this.pos.clone().add(this.shoulderOffset);
    const desiredHeadPos = shoulder.clone().add(desiredOffset);

    // 2. Check if Desired Hammer Head penetrates any obstacle
    let deepestPenetration = 0;
    let contactPoint = null;
    let contactNormal = null;

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      const hit = this.testPointObstacle(desiredHeadPos, this.hammerRadius, obs);
      if (hit && hit.penetration > deepestPenetration) {
        deepestPenetration = hit.penetration;
        contactPoint = hit.surfacePoint;
        contactNormal = hit.normal;
      }
    }

    // 3. FULCRUM KINEMATICS:
    if (deepestPenetration > 0 && contactPoint) {
      // Hammer head is anchored at the rock surface
      this.hammerHead.copy(contactPoint);

      // Desired new shoulder position such that distance to contactPoint is desiredOffset
      const newShoulder = contactPoint.clone().sub(desiredOffset);
      const newPotPos = newShoulder.sub(this.shoulderOffset);

      // Displace cauldron by leverage
      const displacement = newPotPos.clone().sub(this.pos);
      this.pos.add(displacement);

      // Velocity transferred from leverage stroke
      const leverageVel = displacement.clone().divideScalar(Math.max(delta, 0.001));
      leverageVel.clampLength(0, 16.0); // Maximum comfortable vault speed
      this.vel.lerp(leverageVel, 0.55);
      this.vel.x *= 0.92;
    } else {
      // Hammer is in free air!
      this.hammerHead.copy(desiredHeadPos);

      // Apply Floaty Low Gravity (16.0)
      this.vel.y = Math.max(this.vel.y - 16.0 * delta, -28.0);
      this.vel.x *= 0.985;

      this.pos.x += this.vel.x * delta;
      this.pos.y += this.vel.y * delta;
    }

    // 4. Smooth Frictionless Cauldron Collision (Never snags or sticks on corners)
    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      const hit = this.testPointObstacle(this.pos, this.potRadius, obs);
      if (hit) {
        // Push pot out along surface normal
        this.pos.copy(hit.surfacePoint);

        // Cancel inward velocity & slide smoothly
        const vDotN = this.vel.dot(hit.normal);
        if (vDotN < 0) {
          this.vel.sub(hit.normal.clone().multiplyScalar(vDotN));
        }
        this.vel.x *= 0.95; // Low sliding friction
      }
    }

    // Ground Floor at Y = 0
    if (this.pos.y < this.potRadius) {
      this.pos.y = this.potRadius;
      if (this.vel.y < 0) this.vel.y = 0;
      this.vel.x *= 0.92;
    }

    // Safety Side Bounds
    if (this.pos.x < -24) { this.pos.x = -24; this.vel.x = 0; }
    if (this.pos.x > 24) { this.pos.x = 24; this.vel.x = 0; }
    this.pos.z = 0;
    this.hammerHead.z = 0;

    // 5. Update Height Score
    this.heightScore = Math.max(0, Math.round(this.pos.y * 2));
    if (this.heightScore > this.maxHeightReached) {
      this.maxHeightReached = this.heightScore;
    }

    // 6. Update 3D Visual Meshes
    this.group.position.copy(this.pos);

    const curShoulder = this.pos.clone().add(this.shoulderOffset);
    const actualArm = this.hammerHead.clone().sub(curShoulder);
    const actualLen = actualArm.length();
    const midPoint = curShoulder.clone().add(actualArm.clone().multiplyScalar(0.5));

    this.hammerMesh.position.copy(midPoint);
    this.hammerMesh.rotation.z = Math.atan2(actualArm.y, actualArm.x);

    this.shaftMesh.scale.set(1, actualLen, 1);
    this.headMesh.position.set(actualLen * 0.5, 0, 0);

    this.torso.rotation.z = Math.atan2(actualArm.y, actualArm.x) * 0.12;

    // 7. Smooth 2.5D Camera Tracking
    const targetCamY = this.pos.y + 2.0;
    const targetCamX = this.pos.x * 0.3;
    this.camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, 13.0), 0.15);
    this.camera.lookAt(targetCamX, targetCamY - 0.3, 0);
  }

  // Exact Mathematical Collision Test against Box or Circle
  testPointObstacle(point, radius, obs) {
    if (obs.type === 'box') {
      const cx = Math.max(obs.minX, Math.min(obs.maxX, point.x));
      const cy = Math.max(obs.minY, Math.min(obs.maxY, point.y));
      const dx = point.x - cx;
      const dy = point.y - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < radius) {
        const normal = dist > 0.001 ? new THREE.Vector3(dx / dist, dy / dist, 0) : new THREE.Vector3(0, 1, 0);
        const surfacePoint = new THREE.Vector3(cx, cy, 0).add(normal.clone().multiplyScalar(radius));
        return { penetration: radius - dist, normal, surfacePoint };
      }
    } else if (obs.type === 'circle') {
      const dx = point.x - obs.x;
      const dy = point.y - obs.y;
      const dist = Math.hypot(dx, dy);
      const minDist = obs.radius + radius;

      if (dist < minDist) {
        const normal = dist > 0.001 ? new THREE.Vector3(dx / dist, dy / dist, 0) : new THREE.Vector3(0, 1, 0);
        const surfacePoint = new THREE.Vector3(obs.x, obs.y, 0).add(normal.clone().multiplyScalar(minDist));
        return { penetration: minDist - dist, normal, surfacePoint };
      }
    }
    return null;
  }
}
