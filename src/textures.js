/**
 * THE BACKROOMS // PROCEDURAL TEXTURE GENERATOR
 * Generates photorealistic retro textures for Backrooms Levels 0, 1, 2,
 * fluorescent ceiling lights, carpets, and hazmat suits using HTML5 Canvas.
 */

export class BackroomsTextures {
  constructor() {
    this.textures = {};
    this.materials = {};
    this.generateAll();
  }

  createCanvas(width = 256, height = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  generateAll() {
    // 1. Level 0: Iconic Yellow Wallpaper
    const wpCanvas = this.createCanvas(256, 256);
    const wpCtx = wpCanvas.getContext('2d');
    wpCtx.fillStyle = '#cca856';
    wpCtx.fillRect(0, 0, 256, 256);

    // Wallpaper subtle damask/striped pattern
    wpCtx.strokeStyle = '#b89240';
    wpCtx.lineWidth = 2;
    for (let x = 0; x < 256; x += 16) {
      wpCtx.beginPath();
      wpCtx.moveTo(x, 0);
      wpCtx.lineTo(x, 256);
      wpCtx.stroke();
    }
    // Water/mold stains on bottom
    const imgData = wpCtx.getImageData(0, 0, 256, 256);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 22;
      imgData.data[i] += noise;
      imgData.data[i + 1] += noise * 0.9;
      imgData.data[i + 2] += noise * 0.6;
    }
    wpCtx.putImageData(imgData, 0, 0);
    this.textures.level0_wallpaper = this.toThreeTexture(wpCanvas);

    // 2. Level 0: Damp Mold Carpet
    const carpetCanvas = this.createCanvas(256, 256);
    const cCtx = carpetCanvas.getContext('2d');
    cCtx.fillStyle = '#6b5c3e';
    cCtx.fillRect(0, 0, 256, 256);
    const cData = cCtx.getImageData(0, 0, 256, 256);
    for (let i = 0; i < cData.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 35;
      cData.data[i] = Math.max(0, Math.min(255, cData.data[i] + n));
      cData.data[i + 1] = Math.max(0, Math.min(255, cData.data[i + 1] + n * 0.8));
      cData.data[i + 2] = Math.max(0, Math.min(255, cData.data[i + 2] + n * 0.5));
    }
    cCtx.putImageData(cData, 0, 0);
    this.textures.level0_carpet = this.toThreeTexture(carpetCanvas);

    // 3. Ceiling Tile with Fluorescent Light
    const ceilCanvas = this.createCanvas(256, 256);
    const ceilCtx = ceilCanvas.getContext('2d');
    ceilCtx.fillStyle = '#8f8f82';
    ceilCtx.fillRect(0, 0, 256, 256);
    ceilCtx.strokeStyle = '#555548';
    ceilCtx.lineWidth = 4;
    ceilCtx.strokeRect(0, 0, 256, 256);

    // Embedded Fluorescent Lamp
    ceilCtx.fillStyle = '#ffffea';
    ceilCtx.fillRect(48, 64, 160, 128);
    ceilCtx.strokeStyle = '#333333';
    ceilCtx.strokeRect(48, 64, 160, 128);
    this.textures.ceiling_light = this.toThreeTexture(ceilCanvas);

    // 4. Level 1: Concrete Warehouse Wall
    const concreteCanvas = this.createCanvas(256, 256);
    const concCtx = concreteCanvas.getContext('2d');
    concCtx.fillStyle = '#6e706e';
    concCtx.fillRect(0, 0, 256, 256);
    const concData = concCtx.getImageData(0, 0, 256, 256);
    for (let i = 0; i < concData.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 28;
      concData.data[i] += n;
      concData.data[i + 1] += n;
      concData.data[i + 2] += n;
    }
    concCtx.putImageData(concData, 0, 0);
    this.textures.level1_concrete = this.toThreeTexture(concreteCanvas);

    // 5. Level 2: Rusty Metal Pipes Wall
    const rustCanvas = this.createCanvas(256, 256);
    const rustCtx = rustCanvas.getContext('2d');
    rustCtx.fillStyle = '#4a3d35';
    rustCtx.fillRect(0, 0, 256, 256);
    rustCtx.fillStyle = '#8a4b22';
    for (let i = 0; i < 20; i++) {
      rustCtx.fillRect(Math.random() * 240, Math.random() * 240, 30, 20);
    }
    this.textures.level2_rust = this.toThreeTexture(rustCanvas);

    // 6. Elevator Exit Door (with yellow hazard stripes)
    const doorCanvas = this.createCanvas(256, 256);
    const doorCtx = doorCanvas.getContext('2d');
    doorCtx.fillStyle = '#22262b';
    doorCtx.fillRect(0, 0, 256, 256);
    doorCtx.strokeStyle = '#444c56';
    doorCtx.lineWidth = 6;
    doorCtx.strokeRect(10, 10, 236, 236);

    // Hazard stripe band
    doorCtx.fillStyle = '#f0b400';
    doorCtx.fillRect(20, 20, 216, 32);
    doorCtx.fillStyle = '#000000';
    for (let x = 20; x < 236; x += 32) {
      doorCtx.beginPath();
      doorCtx.moveTo(x, 20);
      doorCtx.lineTo(x + 16, 52);
      doorCtx.lineTo(x + 24, 52);
      doorCtx.lineTo(x + 8, 20);
      doorCtx.fill();
    }
    this.textures.elevator_door = this.toThreeTexture(doorCanvas);

    // Build Three.js Materials
    this.materials.level0_wall = new THREE.MeshStandardMaterial({ map: this.textures.level0_wallpaper, roughness: 0.85 });
    this.materials.level0_floor = new THREE.MeshStandardMaterial({ map: this.textures.level0_carpet, roughness: 0.95 });
    this.materials.ceiling = new THREE.MeshStandardMaterial({ map: this.textures.ceiling_light, roughness: 0.7 });
    this.materials.level1_wall = new THREE.MeshStandardMaterial({ map: this.textures.level1_concrete, roughness: 0.9 });
    this.materials.level2_wall = new THREE.MeshStandardMaterial({ map: this.textures.level2_rust, metalness: 0.4, roughness: 0.7 });
    this.materials.door = new THREE.MeshStandardMaterial({ map: this.textures.elevator_door, metalness: 0.5, roughness: 0.6 });
  }

  toThreeTexture(canvas) {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }
}
