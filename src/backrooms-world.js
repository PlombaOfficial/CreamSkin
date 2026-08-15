/**
 * THE BACKROOMS // MULTI-LEVEL MAZE GENERATOR & WORLD BUILDER
 * Generates Level 0 (Lobby), Level 1 (Warehouse), and Level 2 (Pipes),
 * along with pickups (Almond Water, Batteries), keycards, and elevator exits.
 */

export class BackroomsWorld {
  constructor(scene, textures) {
    this.scene = scene;
    this.textures = textures;
    this.currentLevel = 0;

    this.worldGroup = new THREE.Group();
    this.scene.add(this.worldGroup);

    this.cellSize = 4.0; // 4 meters per maze cell
    this.wallHeight = 3.2;
    this.gridWidth = 20;
    this.gridHeight = 20;

    // 2D Collision Grid (1 = Wall, 0 = Walkable, 2 = Elevator Exit)
    this.grid = [];
    this.pickups = []; // { mesh, type: 'water'|'battery'|'keycard', x, z, collected }
    this.lights = [];
    this.elevatorMesh = null;

    this.buildLevel(0);
  }

  clearWorld() {
    while (this.worldGroup.children.length > 0) {
      const obj = this.worldGroup.children[0];
      this.worldGroup.remove(obj);
    }
    this.pickups = [];
    this.lights = [];
  }

  buildLevel(levelNum = 0) {
    this.clearWorld();
    this.currentLevel = levelNum;

    // Generate maze layout (1 = Wall, 0 = Corridor)
    this.grid = this.generateMaze(this.gridWidth, this.gridHeight, levelNum);

    const wallMat = levelNum === 0 
      ? this.textures.materials.level0_wall 
      : (levelNum === 1 ? this.textures.materials.level1_wall : this.textures.materials.level2_wall);
    
    const floorMat = levelNum === 0 
      ? this.textures.materials.level0_floor 
      : this.textures.materials.level1_wall;

    const ceilMat = this.textures.materials.ceiling;

    const wallGeo = new THREE.BoxGeometry(this.cellSize, this.wallHeight, this.cellSize);
    const floorGeo = new THREE.PlaneGeometry(this.gridWidth * this.cellSize, this.gridHeight * this.cellSize);

    // 1. Large Floor Plane
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set((this.gridWidth * this.cellSize) / 2, 0, (this.gridHeight * this.cellSize) / 2);
    floorMesh.receiveShadow = true;
    this.worldGroup.add(floorMesh);

    // 2. Large Ceiling Plane
    const ceilMesh = new THREE.Mesh(floorGeo, ceilMat);
    ceilMesh.rotation.x = Math.PI / 2;
    ceilMesh.position.set((this.gridWidth * this.cellSize) / 2, this.wallHeight, (this.gridHeight * this.cellSize) / 2);
    this.worldGroup.add(ceilMesh);

    // 3. Walls
    for (let x = 0; x < this.gridWidth; x++) {
      for (let z = 0; z < this.gridHeight; z++) {
        const cell = this.grid[x][z];

        if (cell === 1) {
          const wall = new THREE.Mesh(wallGeo, wallMat);
          wall.position.set(
            x * this.cellSize + this.cellSize / 2,
            this.wallHeight / 2,
            z * this.cellSize + this.cellSize / 2
          );
          wall.castShadow = true;
          wall.receiveShadow = true;
          this.worldGroup.add(wall);
        } else if (cell === 0) {
          // Add ceiling fluorescent point light in some rooms
          if (x % 3 === 0 && z % 3 === 0) {
            const lightColor = levelNum === 0 ? 0xffea88 : (levelNum === 1 ? 0xd0e0ff : 0xff7744);
            const light = new THREE.PointLight(lightColor, 1.2, 12);
            light.position.set(
              x * this.cellSize + this.cellSize / 2,
              this.wallHeight - 0.2,
              z * this.cellSize + this.cellSize / 2
            );
            this.worldGroup.add(light);
            this.lights.push(light);
          }

          // Spawn Pickups (Almond water, Battery)
          if (Math.random() < 0.07 && (x > 2 || z > 2)) {
            const type = Math.random() < 0.6 ? 'water' : 'battery';
            this.spawnPickup(x * this.cellSize + this.cellSize / 2, z * this.cellSize + this.cellSize / 2, type);
          }
        } else if (cell === 2) {
          // Elevator Exit Room!
          this.spawnElevator(x * this.cellSize + this.cellSize / 2, z * this.cellSize + this.cellSize / 2);
        }
      }
    }
  }

  generateMaze(w, h, level) {
    const grid = Array(w).fill(0).map(() => Array(h).fill(1));

    // Simple procedural corridor carver
    for (let x = 1; x < w - 1; x++) {
      for (let z = 1; z < h - 1; z++) {
        if (x % 2 === 1 || z % 2 === 1) {
          grid[x][z] = 0; // Corridor
        }
        // Random open rooms (iconic Backrooms irregular layout)
        if (Math.random() < 0.4) {
          grid[x][z] = 0;
        }
      }
    }

    // Start spawn point is always open
    grid[1][1] = 0;
    grid[1][2] = 0;
    grid[2][1] = 0;

    // Exit elevator at far end
    grid[w - 2][h - 2] = 2;
    grid[w - 2][h - 3] = 0;
    grid[w - 3][h - 2] = 0;

    return grid;
  }

  spawnPickup(x, z, type) {
    const group = new THREE.Group();

    if (type === 'water') {
      // Almond Water Bottle
      const bottleMat = new THREE.MeshStandardMaterial({ color: 0xeed8aa, roughness: 0.3 });
      const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.5, 12), bottleMat);
      bottle.position.y = 0.25;
      group.add(bottle);
    } else if (type === 'battery') {
      // Flashlight Battery Pack
      const batMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.7, roughness: 0.2 });
      const bat = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 0.15), batMat);
      bat.position.y = 0.18;
      group.add(bat);
    }

    group.position.set(x, 0, z);
    this.worldGroup.add(group);
    this.pickups.push({ group, type, x, z, collected: false });
  }

  spawnElevator(x, z) {
    const doorMat = this.textures.materials.door;
    const elevatorDoor = new THREE.Mesh(new THREE.BoxGeometry(this.cellSize * 0.9, this.wallHeight, 0.2), doorMat);
    elevatorDoor.position.set(x, this.wallHeight / 2, z);
    this.worldGroup.add(elevatorDoor);
    this.elevatorMesh = elevatorDoor;

    // Green elevator beacon light
    const beacon = new THREE.PointLight(0x00ff88, 2.0, 10);
    beacon.position.set(x, this.wallHeight - 0.4, z);
    this.worldGroup.add(beacon);
  }

  isWall(worldX, worldZ) {
    const gx = Math.floor(worldX / this.cellSize);
    const gz = Math.floor(worldZ / this.cellSize);

    if (gx < 0 || gx >= this.gridWidth || gz < 0 || gz >= this.gridHeight) {
      return true;
    }
    return this.grid[gx][gz] === 1;
  }

  update(delta) {
    // Spin floating pickups gently
    this.pickups.forEach((p) => {
      if (!p.collected) {
        p.group.rotation.y += delta * 1.5;
      }
    });

    // Flickering fluorescent lights
    if (Math.random() < 0.05 && this.lights.length > 0) {
      const idx = Math.floor(Math.random() * this.lights.length);
      const l = this.lights[idx];
      l.intensity = Math.random() < 0.3 ? 0.2 : 1.4;
    }
  }
}
