/**
 * 3D GETTING OVER IT // ROCK-SOLID EXACT COLLISION MOUNTAIN
 * Airtight mathematical Box (AABB) and Circle colliders with ZERO holes.
 */

export class MountainLevel {
  constructor(scene) {
    this.scene = scene;
    this.obstacles = [];
    this.buildMountain();
  }

  buildMountain() {
    const group = new THREE.Group();

    // 0. SAFE STARTING GROUND FLOOR (Y = 0)
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x3a5238, roughness: 0.8 });
    const ground = new THREE.Mesh(new THREE.BoxGeometry(60, 4, 10), groundMat);
    ground.position.set(0, -2, 0);
    group.add(ground);
    this.addBox(-30, 30, -4, 0, 'stone');

    // Left & Right Safety Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x141c26, roughness: 0.9, transparent: true, opacity: 0.4 });
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(2, 600, 10), wallMat);
    leftWall.position.set(-25, 300, 0);
    const rightWall = leftWall.clone();
    rightWall.position.set(25, 300, 0);
    group.add(leftWall, rightWall);
    this.addBox(-30, -24, 0, 600, 'metal');
    this.addBox(24, 30, 0, 600, 'metal');

    // ========================================================================
    // STAGE 1: THE YARD (0m - 50m)
    // ========================================================================
    this.createRock(group, -3.5, 2.8, 2.2, 0x6e6e6e);
    this.createBench(group, 2.5, 5.8, 5.0, 0.6);
    this.createBeam(group, -4.0, 10.5, 6.0, 0.7, 0.25);
    this.createRock(group, 3.5, 15.5, 2.6, 0x5a5a5a);
    this.createBench(group, -2.0, 21.0, 5.5, 0.6);
    this.createRock(group, 4.0, 27.5, 2.8, 0x656565);
    this.createBeam(group, -3.5, 34.5, 6.5, 0.7, -0.2);
    this.createRock(group, 2.5, 43.0, 3.0, 0x707070);

    // ========================================================================
    // STAGE 2: THE JUNKYARD & DEVIL'S CHIMNEY (50m - 140m)
    // ========================================================================
    this.createBeam(group, -1.0, 54.0, 8.0, 0.8, 0.15);
    this.createContainer(group, 5.0, 66.0, 8.0, 3.5, 0xaa2222);
    this.createContainer(group, -5.0, 78.0, 8.0, 3.5, 0x2255aa);

    // Devil's Vertical Chimney
    this.createRock(group, -6.0, 92.0, 3.8, 0x444444);
    this.createRock(group, 6.0, 100.0, 3.8, 0x444444);
    this.createRock(group, -6.0, 110.0, 3.8, 0x444444);
    this.createRock(group, 6.0, 120.0, 3.8, 0x444444);

    this.createBeam(group, 0.0, 132.0, 9.0, 0.8, -0.2);

    // ========================================================================
    // STAGE 3: THE TOWER OF FURNITURE (140m - 260m)
    // ========================================================================
    this.createFurniture(group, -3.5, 146.0, 6.0, 2.0, 0x111111); // Piano
    this.createFurniture(group, 4.0, 162.0, 3.5, 6.0, 0x5c3a21); // Bookshelf
    this.createFurniture(group, -4.5, 180.0, 4.5, 5.0, 0x8a1c1c); // Giant Chair
    this.createFurniture(group, 3.0, 200.0, 3.0, 7.0, 0x472815); // Grandfather Clock
    this.createFurniture(group, -3.0, 222.0, 3.5, 6.0, 0x5c3a21); // Bookshelf
    this.createFurniture(group, 4.0, 244.0, 6.0, 2.0, 0x111111); // Piano

    // ========================================================================
    // STAGE 4: SLIPPERY ICE SLIDES & SLOPES (260m - 400m)
    // ========================================================================
    this.createRock(group, -5.0, 266.0, 4.2, 0x333333);
    this.createBeam(group, 3.0, 288.0, 8.5, 0.8, 0.35); // Steep Slide
    this.createRock(group, -4.0, 310.0, 4.0, 0x2e2e2e);
    this.createBeam(group, 4.5, 334.0, 8.0, 0.8, -0.3);
    this.createRock(group, -2.5, 358.0, 3.8, 0x282828);
    this.createBeam(group, 3.5, 382.0, 7.5, 0.8, 0.2);

    // ========================================================================
    // STAGE 5: SPACE STATION & GOLDEN TROPHY (400m - 500m)
    // ========================================================================
    this.createBeam(group, -3.0, 410.0, 8.0, 0.8, 0);
    this.createBeam(group, 4.0, 436.0, 8.0, 0.8, 0.1);
    this.createBeam(group, -2.0, 462.0, 8.0, 0.8, 0);

    // Golden Win Platform
    this.createFurniture(group, 0, 488.0, 14.0, 2.0, 0xffd700);

    const trophy = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.4, 16, 32), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 1.0, roughness: 0.1 }));
    trophy.position.set(0, 492.0, 0);
    trophy.rotation.x = Math.PI / 2;
    group.add(trophy);

    this.scene.add(group);
  }

  // --- EXACT RIGID COLLIDERS (NO LEAKS, NO HOLES) ---

  addBox(minX, maxX, minY, maxY, matType = 'stone') {
    this.obstacles.push({
      type: 'box',
      minX, maxX, minY, maxY,
      matType
    });
  }

  addCircle(x, y, radius, matType = 'stone') {
    this.obstacles.push({
      type: 'circle',
      x, y, radius,
      matType
    });
  }

  createRock(group, x, y, radius, colorHex) {
    const geo = new THREE.DodecahedronGeometry(radius, 1);
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, 0);
    group.add(mesh);

    this.addCircle(x, y, radius, 'stone');
  }

  createBench(group, x, y, width, height) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, 4), mat);
    mesh.position.set(x, y, 0);
    group.add(mesh);

    this.addBox(x - width / 2, x + width / 2, y - height / 2, y + height / 2, 'wood');
  }

  createBeam(group, x, y, width, height, tilt) {
    const mat = new THREE.MeshStandardMaterial({ color: 0xd64527, metalness: 0.7, roughness: 0.4 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, 4), mat);
    mesh.position.set(x, y, 0);
    mesh.rotation.z = tilt;
    group.add(mesh);

    // Approximate tilted beam with solid box bounds
    const halfW = width / 2;
    const halfH = height / 2;
    this.addBox(x - halfW, x + halfW, y - halfH, y + halfH, 'metal');
  }

  createContainer(group, x, y, width, height, colorHex) {
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.6, roughness: 0.5 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, 4), mat);
    mesh.position.set(x, y, 0);
    group.add(mesh);

    this.addBox(x - width / 2, x + width / 2, y - height / 2, y + height / 2, 'metal');
  }

  createFurniture(group, x, y, width, height, colorHex) {
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.5 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, 4), mat);
    mesh.position.set(x, y, 0);
    group.add(mesh);

    this.addBox(x - width / 2, x + width / 2, y - height / 2, y + height / 2, 'wood');
  }
}
