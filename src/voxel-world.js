/**
 * 3D MINECRAFT // OPTIMIZED VOXEL WORLD & CULLED FACE MESH BUILDER
 */

import { BLOCKS } from "./items-recipes.js";

export class VoxelWorld {
  constructor(sizeX = 64, sizeY = 32, sizeZ = 64, seed = 12345, dimension = 'overworld') {
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.sizeZ = sizeZ;
    this.seed = seed;
    this.dimension = dimension;

    this.voxels = new Uint8Array(sizeX * sizeY * sizeZ);
    this.generateTerrain();
  }

  getIndex(x, y, z) {
    if (x < 0 || x >= this.sizeX || y < 0 || y >= this.sizeY || z < 0 || z >= this.sizeZ) return -1;
    return y * (this.sizeX * this.sizeZ) + z * this.sizeX + x;
  }

  getVoxel(x, y, z) {
    const idx = this.getIndex(x, y, z);
    if (idx === -1) return BLOCKS.AIR;
    return this.voxels[idx];
  }

  setVoxel(x, y, z, blockId) {
    const idx = this.getIndex(x, y, z);
    if (idx === -1) return;
    this.voxels[idx] = blockId;
  }

  getHighestSolidY(x, z) {
    for (let y = this.sizeY - 1; y >= 0; y--) {
      const b = this.getVoxel(x, y, z);
      if (b !== BLOCKS.AIR && b !== BLOCKS.WATER && b !== BLOCKS.TORCH && b !== BLOCKS.OAK_LEAVES) {
        return y;
      }
    }
    return 10;
  }

  pseudoRandom(offset = 0) {
    const s = Math.sin(this.seed + offset) * 10000;
    return s - Math.floor(s);
  }

  generateTerrain() {
    const surfaceBase = 12;

    // Smooth pleasant hills
    for (let x = 0; x < this.sizeX; x++) {
      for (let z = 0; z < this.sizeZ; z++) {
        const n1 = Math.sin((x + this.seed) * 0.07) * Math.cos((z + this.seed) * 0.07) * 4.0;
        const n2 = Math.sin((x * 0.15) + (z * 0.15)) * 1.5;
        const height = Math.min(this.sizeY - 6, Math.max(6, Math.floor(surfaceBase + n1 + n2)));

        for (let y = 0; y < this.sizeY; y++) {
          if (y === 0) {
            this.setVoxel(x, y, z, BLOCKS.BEDROCK);
          } else if (y < height - 3) {
            this.setVoxel(x, y, z, BLOCKS.STONE);
          } else if (y < height) {
            this.setVoxel(x, y, z, BLOCKS.DIRT);
          } else if (y === height) {
            this.setVoxel(x, y, z, BLOCKS.GRASS);
          } else {
            this.setVoxel(x, y, z, BLOCKS.AIR);
          }
        }
      }
    }

    // Ore Clusters
    this.generateOreCluster(BLOCKS.COAL_ORE, 6, 2, 14, 20);
    this.generateOreCluster(BLOCKS.IRON_ORE, 4, 2, 10, 14);
    this.generateOreCluster(BLOCKS.GOLD_ORE, 3, 2, 7, 8);
    this.generateOreCluster(BLOCKS.DIAMOND_ORE, 2, 1, 5, 5);

    // Trees (spread peacefully around)
    for (let x = 6; x < this.sizeX - 6; x += 7) {
      for (let z = 6; z < this.sizeZ - 6; z += 7) {
        // Keep spawn (32, 32) clear
        if (Math.hypot(x - 32, z - 32) < 5) continue;

        if (this.pseudoRandom(x * 37 + z * 19) > 0.4) {
          const topY = this.getHighestSolidY(x, z);
          if (this.getVoxel(x, topY, z) === BLOCKS.GRASS) {
            this.growTree(x, topY + 1, z);
          }
        }
      }
    }
  }

  generateOreCluster(oreType, clusterSize, minY, maxY, count) {
    for (let i = 0; i < count; i++) {
      const rx = Math.floor(Math.random() * (this.sizeX - 4)) + 2;
      const ry = Math.floor(Math.random() * (maxY - minY)) + minY;
      const rz = Math.floor(Math.random() * (this.sizeZ - 4)) + 2;

      for (let c = 0; c < clusterSize; c++) {
        const ox = rx + Math.floor((Math.random() - 0.5) * 2);
        const oy = ry + Math.floor((Math.random() - 0.5) * 2);
        const oz = rz + Math.floor((Math.random() - 0.5) * 2);
        if (this.getVoxel(ox, oy, oz) === BLOCKS.STONE) {
          this.setVoxel(ox, oy, oz, oreType);
        }
      }
    }
  }

  growTree(x, y, z) {
    const trunkHeight = 4;
    for (let ty = 0; ty < trunkHeight; ty++) {
      this.setVoxel(x, y + ty, z, BLOCKS.OAK_LOG);
    }

    const topY = y + trunkHeight;
    for (let lx = -2; lx <= 2; lx++) {
      for (let lz = -2; lz <= 2; lz++) {
        for (let ly = -2; ly <= 1; ly++) {
          if (Math.abs(lx) === 2 && Math.abs(lz) === 2 && Math.random() > 0.25) continue;
          if (this.getVoxel(x + lx, topY + ly, z + lz) === BLOCKS.AIR) {
            this.setVoxel(x + lx, topY + ly, z + lz, BLOCKS.OAK_LEAVES);
          }
        }
      }
    }
  }

  // Culled Face Mesh Geometry
  buildGeometry(atlas) {
    const positions = [];
    const normals = [];
    const uvs = [];

    const isTransparent = (b) => (b === BLOCKS.AIR || b === BLOCKS.GLASS || b === BLOCKS.WATER || b === BLOCKS.TORCH);

    for (let y = 0; y < this.sizeY; y++) {
      for (let z = 0; z < this.sizeZ; z++) {
        for (let x = 0; x < this.sizeX; x++) {
          const b = this.getVoxel(x, y, z);
          if (b === BLOCKS.AIR) continue;

          // +Y (TOP)
          if (isTransparent(this.getVoxel(x, y + 1, z))) {
            this.addFace(positions, normals, uvs, atlas, b, 'top', x, y, z, 0, 1, 0);
          }
          // -Y (BOTTOM)
          if (isTransparent(this.getVoxel(x, y - 1, z))) {
            this.addFace(positions, normals, uvs, atlas, b, 'bottom', x, y, z, 0, -1, 0);
          }
          // +X (RIGHT)
          if (isTransparent(this.getVoxel(x + 1, y, z))) {
            this.addFace(positions, normals, uvs, atlas, b, 'side', x, y, z, 1, 0, 0);
          }
          // -X (LEFT)
          if (isTransparent(this.getVoxel(x - 1, y, z))) {
            this.addFace(positions, normals, uvs, atlas, b, 'side', x, y, z, -1, 0, 0);
          }
          // +Z (FRONT)
          if (isTransparent(this.getVoxel(x, y, z + 1))) {
            this.addFace(positions, normals, uvs, atlas, b, 'side', x, y, z, 0, 0, 1);
          }
          // -Z (BACK)
          if (isTransparent(this.getVoxel(x, y, z - 1))) {
            this.addFace(positions, normals, uvs, atlas, b, 'side', x, y, z, 0, 0, -1);
          }
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    return geometry;
  }

  addFace(pos, norm, uvs, atlas, blockId, faceType, x, y, z, nx, ny, nz) {
    let faceKey = 'stone';

    if (blockId === BLOCKS.GRASS) faceKey = faceType === 'top' ? 'grass_top' : (faceType === 'bottom' ? 'dirt' : 'grass_side');
    else if (blockId === BLOCKS.DIRT) faceKey = 'dirt';
    else if (blockId === BLOCKS.STONE) faceKey = 'stone';
    else if (blockId === BLOCKS.COBBLESTONE) faceKey = 'cobblestone';
    else if (blockId === BLOCKS.OAK_LOG) faceKey = (faceType === 'top' || faceType === 'bottom') ? 'wood_top' : 'wood_side';
    else if (blockId === BLOCKS.OAK_PLANKS) faceKey = 'planks';
    else if (blockId === BLOCKS.OAK_LEAVES) faceKey = 'leaves';
    else if (blockId === BLOCKS.SAND) faceKey = 'sand';
    else if (blockId === BLOCKS.BEDROCK) faceKey = 'bedrock';
    else if (blockId === BLOCKS.COAL_ORE) faceKey = 'coal_ore';
    else if (blockId === BLOCKS.COPPER_ORE) faceKey = 'copper_ore';
    else if (blockId === BLOCKS.IRON_ORE) faceKey = 'iron_ore';
    else if (blockId === BLOCKS.GOLD_ORE) faceKey = 'gold_ore';
    else if (blockId === BLOCKS.DIAMOND_ORE) faceKey = 'diamond_ore';
    else if (blockId === BLOCKS.OBSIDIAN) faceKey = 'obsidian';
    else if (blockId === BLOCKS.NETHERRACK) faceKey = 'netherrack';
    else if (blockId === BLOCKS.GLOWSTONE) faceKey = 'glowstone';
    else if (blockId === BLOCKS.CRAFTING_TABLE) faceKey = faceType === 'top' ? 'crafting_top' : 'crafting_side';
    else if (blockId === BLOCKS.FURNACE) faceKey = faceType === 'side' ? 'furnace_front' : 'furnace_side';
    else if (blockId === BLOCKS.CHEST) faceKey = faceType === 'top' ? 'chest_top' : 'chest_side';
    else if (blockId === BLOCKS.GLASS) faceKey = 'glass';
    else if (blockId === BLOCKS.TNT) faceKey = faceType === 'top' ? 'tnt_top' : 'tnt_side';
    else if (blockId === BLOCKS.WATER) faceKey = 'water';
    else if (blockId === BLOCKS.LAVA) faceKey = 'lava';

    const [u0, v0, u1, v1] = atlas.getUVs(faceKey);

    let v = [];
    if (ny === 1) { // TOP
      v = [
        [x, y + 1, z + 1], [x + 1, y + 1, z + 1], [x + 1, y + 1, z],
        [x, y + 1, z + 1], [x + 1, y + 1, z], [x, y + 1, z]
      ];
    } else if (ny === -1) { // BOTTOM
      v = [
        [x, y, z], [x + 1, y, z], [x + 1, y, z + 1],
        [x, y, z], [x + 1, y, z + 1], [x, y, z + 1]
      ];
    } else if (nx === 1) { // RIGHT
      v = [
        [x + 1, y, z + 1], [x + 1, y, z], [x + 1, y + 1, z],
        [x + 1, y, z + 1], [x + 1, y + 1, z], [x + 1, y + 1, z + 1]
      ];
    } else if (nx === -1) { // LEFT
      v = [
        [x, y, z], [x, y, z + 1], [x, y + 1, z + 1],
        [x, y, z], [x, y + 1, z + 1], [x, y + 1, z]
      ];
    } else if (nz === 1) { // FRONT
      v = [
        [x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1],
        [x, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]
      ];
    } else if (nz === -1) { // BACK
      v = [
        [x + 1, y, z], [x, y, z], [x, y + 1, z],
        [x + 1, y, z], [x, y + 1, z], [x + 1, y + 1, z]
      ];
    }

    v.forEach(pt => {
      pos.push(pt[0], pt[1], pt[2]);
      norm.push(nx, ny, nz);
    });

    uvs.push(
      u0, v0, u1, v0, u1, v1,
      u0, v0, u1, v1, u0, v1
    );
  }
}
