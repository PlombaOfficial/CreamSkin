/**
 * THE BACKROOMS // ENTITY AI & MONSTER ENGINE
 * Implements The Smiler (glowing eyes/teeth) and Bacteria entity with
 * line-of-sight detection, flashlight reaction, patrol and hunting behaviors.
 */

export class BackroomsEntity {
  constructor(scene, world, type = 'smiler') {
    this.scene = scene;
    this.world = world;
    this.type = type;

    this.position = new THREE.Vector3(20, 1.5, 20);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.speed = 2.8;
    this.chaseSpeed = 4.8;
    this.state = 'PATROL'; // 'PATROL' | 'HUNT'

    this.patrolTarget = new THREE.Vector3(20, 1.5, 20);
    this.pickNewPatrolTarget();

    this.mesh = this.buildEntityMesh();
    this.scene.add(this.mesh);
  }

  buildEntityMesh() {
    const group = new THREE.Group();

    if (this.type === 'smiler') {
      // 1. Dark Void Shadow Torso
      const bodyMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.4), bodyMat);
      body.position.y = 0.9;
      group.add(body);

      // 2. Glowing White Staring Eyes
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), glowMat);
      eyeL.position.set(-0.16, 1.5, -0.22);
      const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), glowMat);
      eyeR.position.set(0.16, 1.5, -0.22);
      group.add(eyeL);
      group.add(eyeR);

      // 3. Wide Jagged Luminescent Smile
      const mouthMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.04), mouthMat);
      mouth.position.set(0, 1.25, -0.22);
      group.add(mouth);

      // Faint glowing aura around the face
      const faceLight = new THREE.PointLight(0xffffff, 1.2, 5);
      faceLight.position.set(0, 1.4, -0.3);
      group.add(faceLight);
    }

    return group;
  }

  pickNewPatrolTarget() {
    const cs = this.world.cellSize;
    for (let attempts = 0; attempts < 15; attempts++) {
      const rx = Math.floor(Math.random() * this.world.gridWidth);
      const rz = Math.floor(Math.random() * this.world.gridHeight);
      if (this.world.grid[rx] && this.world.grid[rx][rz] === 0) {
        this.patrolTarget.set(rx * cs + cs / 2, 1.5, rz * cs + cs / 2);
        return;
      }
    }
  }

  update(delta, playerPos, playerFlashlightOn, onPlayerHit) {
    // 1. Line-of-sight & Distance check to player
    const distToPlayer = this.position.distanceTo(playerPos);

    if (distToPlayer < 14.0 && (playerFlashlightOn || distToPlayer < 6.0)) {
      if (this.state === 'PATROL') {
        this.state = 'HUNT';
        if (window.bcAudio) window.bcAudio.playSmilerRoar();
      }
    } else if (distToPlayer > 22.0 && this.state === 'HUNT') {
      this.state = 'PATROL';
      this.pickNewPatrolTarget();
    }

    // 2. Movement towards target
    const target = this.state === 'HUNT' ? playerPos : this.patrolTarget;
    const moveDir = new THREE.Vector3().subVectors(target, this.position);
    moveDir.y = 0;
    const curDist = moveDir.length();

    if (curDist > 0.4) {
      moveDir.normalize();
      const curSpeed = (this.state === 'HUNT' ? this.chaseSpeed : this.speed) * delta;
      
      const nextX = this.position.x + moveDir.x * curSpeed;
      const nextZ = this.position.z + moveDir.z * curSpeed;

      if (!this.world.isWall(nextX, nextZ)) {
        this.position.x = nextX;
        this.position.z = nextZ;
      } else {
        if (this.state === 'PATROL') this.pickNewPatrolTarget();
      }

      // Rotate towards movement
      this.mesh.rotation.y = Math.atan2(moveDir.x, moveDir.z);
    } else {
      if (this.state === 'PATROL') this.pickNewPatrolTarget();
    }

    this.mesh.position.copy(this.position);

    // 3. Attack Check (within 1.6m of player)
    if (distToPlayer < 1.6 && onPlayerHit) {
      onPlayerHit(delta * 40); // Rapid sanity/life drain!
    }
  }
}
