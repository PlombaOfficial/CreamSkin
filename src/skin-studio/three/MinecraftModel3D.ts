import * as THREE from 'three';
import { ModelType, BodyPart } from '../types';
import { SkinTextureBuffer } from '../engine/SkinTextureBuffer';

export class MinecraftModel3D {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;

  public skinCanvas: HTMLCanvasElement;
  public skinTexture: THREE.CanvasTexture;

  public characterGroup: THREE.Group;
  public headGroup: THREE.Group;
  public torsoGroup: THREE.Group;
  public rightArmGroup: THREE.Group;
  public leftArmGroup: THREE.Group;
  public rightLegGroup: THREE.Group;
  public leftLegGroup: THREE.Group;

  public overlayMeshes: THREE.Mesh[] = [];
  public modelType: ModelType = 'classic';

  public isAnimating: boolean = true;
  public animationType: 'idle' | 'walk' | 'tpose' = 'idle';
  private animTime = 0;

  // Interaction controls
  public isDragging = false;
  private prevMouseX = 0;
  private prevMouseY = 0;
  public rotX = 0.2;
  public rotY = -0.5;
  public distance = 42;

  constructor(container: HTMLElement, modelType: ModelType = 'classic') {
    this.container = container;
    this.modelType = modelType;

    // 1. Setup Canvas Texture (64x64)
    this.skinCanvas = document.createElement('canvas');
    this.skinCanvas.width = 64;
    this.skinCanvas.height = 64;
    this.skinTexture = new THREE.CanvasTexture(this.skinCanvas);
    this.skinTexture.magFilter = THREE.NearestFilter;
    this.skinTexture.minFilter = THREE.NearestFilter;
    this.skinTexture.colorSpace = THREE.SRGBColorSpace;

    // 2. Three.js Scene, Camera, Renderer
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / (container.clientHeight || 1),
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    // 3. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(15, 25, 20);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x99bbff, 0.6);
    dirLight2.position.set(-15, -10, -15);
    this.scene.add(dirLight2);

    // 4. Build Model Structure
    this.characterGroup = new THREE.Group();
    this.headGroup = new THREE.Group();
    this.torsoGroup = new THREE.Group();
    this.rightArmGroup = new THREE.Group();
    this.leftArmGroup = new THREE.Group();
    this.rightLegGroup = new THREE.Group();
    this.leftLegGroup = new THREE.Group();

    this.characterGroup.add(
      this.headGroup,
      this.torsoGroup,
      this.rightArmGroup,
      this.leftArmGroup,
      this.rightLegGroup,
      this.leftLegGroup
    );
    this.scene.add(this.characterGroup);

    this.buildCharacterMesh();
    this.setupEventListeners();
    this.updateCameraPosition();
  }

  public updateTextureFromBuffer(buffer: SkinTextureBuffer) {
    const ctx = this.skinCanvas.getContext('2d');
    if (!ctx) return;
    const imgData = ctx.createImageData(64, 64);
    imgData.data.set(buffer.data);
    ctx.putImageData(imgData, 0, 0);
    this.skinTexture.needsUpdate = true;
  }

  public setModelType(type: ModelType) {
    if (this.modelType !== type) {
      this.modelType = type;
      this.rebuildModel();
    }
  }

  public rebuildModel() {
    // Clear groups
    while (this.headGroup.children.length > 0) this.headGroup.remove(this.headGroup.children[0]);
    while (this.torsoGroup.children.length > 0) this.torsoGroup.remove(this.torsoGroup.children[0]);
    while (this.rightArmGroup.children.length > 0) this.rightArmGroup.remove(this.rightArmGroup.children[0]);
    while (this.leftArmGroup.children.length > 0) this.leftArmGroup.remove(this.leftArmGroup.children[0]);
    while (this.rightLegGroup.children.length > 0) this.rightLegGroup.remove(this.rightLegGroup.children[0]);
    while (this.leftLegGroup.children.length > 0) this.leftLegGroup.remove(this.leftLegGroup.children[0]);
    this.overlayMeshes = [];

    this.buildCharacterMesh();
  }

  private buildCharacterMesh() {
    const isSlim = this.modelType === 'slim';
    const armW = isSlim ? 3 : 4;

    const baseMat = new THREE.MeshLambertMaterial({
      map: this.skinTexture,
      transparent: false,
      side: THREE.FrontSide,
    });

    const overlayMat = new THREE.MeshLambertMaterial({
      map: this.skinTexture,
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    });

    // --- HEAD (8x8x8) ---
    const headGeom = this.createBoxGeometry(8, 8, 8, 0, 0, 8, 8, 8);
    const headMesh = new THREE.Mesh(headGeom, baseMat);
    headMesh.position.set(0, 4, 0);
    this.headGroup.position.set(0, 12, 0);
    this.headGroup.add(headMesh);

    const hatGeom = this.createBoxGeometry(8.75, 8.75, 8.75, 32, 0, 8, 8, 8);
    const hatMesh = new THREE.Mesh(hatGeom, overlayMat);
    hatMesh.position.set(0, 4, 0);
    this.headGroup.add(hatMesh);
    this.overlayMeshes.push(hatMesh);

    // --- TORSO (8x12x4) ---
    const torsoGeom = this.createBoxGeometry(8, 12, 4, 16, 16, 8, 12, 4);
    const torsoMesh = new THREE.Mesh(torsoGeom, baseMat);
    torsoMesh.position.set(0, 6, 0);
    this.torsoGroup.position.set(0, 0, 0);
    this.torsoGroup.add(torsoMesh);

    const jacketGeom = this.createBoxGeometry(8.65, 12.65, 4.65, 16, 32, 8, 12, 4);
    const jacketMesh = new THREE.Mesh(jacketGeom, overlayMat);
    jacketMesh.position.set(0, 6, 0);
    this.torsoGroup.add(jacketMesh);
    this.overlayMeshes.push(jacketMesh);

    // --- RIGHT ARM (4x12x4 or 3x12x4) ---
    const rArmGeom = this.createBoxGeometry(armW, 12, 4, 40, 16, armW, 12, 4);
    const rArmMesh = new THREE.Mesh(rArmGeom, baseMat);
    rArmMesh.position.set(-armW / 2, -4, 0);
    this.rightArmGroup.position.set(-4, 10, 0);
    this.rightArmGroup.add(rArmMesh);

    const rSleeveGeom = this.createBoxGeometry(armW + 0.65, 12.65, 4.65, 40, 32, armW, 12, 4);
    const rSleeveMesh = new THREE.Mesh(rSleeveGeom, overlayMat);
    rSleeveMesh.position.set(-armW / 2, -4, 0);
    this.rightArmGroup.add(rSleeveMesh);
    this.overlayMeshes.push(rSleeveMesh);

    // --- LEFT ARM (4x12x4 or 3x12x4) ---
    const lArmGeom = this.createBoxGeometry(armW, 12, 4, 32, 48, armW, 12, 4);
    const lArmMesh = new THREE.Mesh(lArmGeom, baseMat);
    lArmMesh.position.set(armW / 2, -4, 0);
    this.leftArmGroup.position.set(4, 10, 0);
    this.leftArmGroup.add(lArmMesh);

    const lSleeveGeom = this.createBoxGeometry(armW + 0.65, 12.65, 4.65, 48, 48, armW, 12, 4);
    const lSleeveMesh = new THREE.Mesh(lSleeveGeom, overlayMat);
    lSleeveMesh.position.set(armW / 2, -4, 0);
    this.leftArmGroup.add(lSleeveMesh);
    this.overlayMeshes.push(lSleeveMesh);

    // --- RIGHT LEG (4x12x4) ---
    const rLegGeom = this.createBoxGeometry(4, 12, 4, 0, 16, 4, 12, 4);
    const rLegMesh = new THREE.Mesh(rLegGeom, baseMat);
    rLegMesh.position.set(0, -6, 0);
    this.rightLegGroup.position.set(-2, 0, 0);
    this.rightLegGroup.add(rLegMesh);

    const rPantGeom = this.createBoxGeometry(4.65, 12.65, 4.65, 0, 32, 4, 12, 4);
    const rPantMesh = new THREE.Mesh(rPantGeom, overlayMat);
    rPantMesh.position.set(0, -6, 0);
    this.rightLegGroup.add(rPantMesh);
    this.overlayMeshes.push(rPantMesh);

    // --- LEFT LEG (4x12x4) ---
    const lLegGeom = this.createBoxGeometry(4, 12, 4, 16, 48, 4, 12, 4);
    const lLegMesh = new THREE.Mesh(lLegGeom, baseMat);
    lLegMesh.position.set(0, -6, 0);
    this.leftLegGroup.position.set(2, 0, 0);
    this.leftLegGroup.add(lLegMesh);

    const lPantGeom = this.createBoxGeometry(4.65, 12.65, 4.65, 0, 48, 4, 12, 4);
    const lPantMesh = new THREE.Mesh(lPantGeom, overlayMat);
    lPantMesh.position.set(0, -6, 0);
    this.leftLegGroup.add(lPantMesh);
    this.overlayMeshes.push(lPantMesh);
  }

  /**
   * Helper to map official Minecraft box face UVs (+X, -X, +Y, -Y, +Z, -Z)
   */
  private createBoxGeometry(
    w: number,
    h: number,
    d: number,
    u: number,
    v: number,
    uw: number,
    uh: number,
    ud: number
  ): THREE.BufferGeometry {
    const geometry = new THREE.BoxGeometry(w, h, d);
    const uvs: number[] = [];

    // Face UV mapping in Minecraft 64x64 texture coords
    // 0: Right (+X)
    // 1: Left (-X)
    // 2: Top (+Y)
    // 3: Bottom (-Y)
    // 4: Front (+Z)
    // 5: Back (-Z)
    const faces = [
      { x: u, y: v + ud, w: ud, h: uh }, // Right
      { x: u + ud + uw, y: v + ud, w: ud, h: uh }, // Left
      { x: u + ud, y: v, w: uw, h: ud }, // Top
      { x: u + ud + uw, y: v, w: uw, h: ud }, // Bottom
      { x: u + ud, y: v + ud, w: uw, h: uh }, // Front
      { x: u + ud * 2 + uw, y: v + ud, w: uw, h: uh }, // Back
    ];

    for (const f of faces) {
      const u0 = f.x / 64;
      const v0 = 1 - (f.y + f.h) / 64;
      const u1 = (f.x + f.w) / 64;
      const v1 = 1 - f.y / 64;

      // 4 UV vertices per face
      uvs.push(u0, v1, u1, v1, u0, v0, u1, v0);
    }

    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    return geometry;
  }

  public setPartVisibility(part: BodyPart, visible: boolean) {
    switch (part) {
      case 'head': this.headGroup.visible = visible; break;
      case 'torso': this.torsoGroup.visible = visible; break;
      case 'rightArm': this.rightArmGroup.visible = visible; break;
      case 'leftArm': this.leftArmGroup.visible = visible; break;
      case 'rightLeg': this.rightLegGroup.visible = visible; break;
      case 'leftLeg': this.leftLegGroup.visible = visible; break;
      case 'all':
        this.headGroup.visible = visible;
        this.torsoGroup.visible = visible;
        this.rightArmGroup.visible = visible;
        this.leftArmGroup.visible = visible;
        this.rightLegGroup.visible = visible;
        this.leftLegGroup.visible = visible;
        break;
    }
  }

  public setOverlayVisibility(visible: boolean) {
    for (const mesh of this.overlayMeshes) {
      mesh.visible = visible;
    }
  }

  public update(dt: number) {
    if (this.isAnimating) {
      this.animTime += dt;

      if (this.animationType === 'idle') {
        const breath = Math.sin(this.animTime * 2.5) * 0.04;
        this.headGroup.rotation.x = breath * 0.5;
        this.torsoGroup.position.y = breath * 0.5;
        this.rightArmGroup.rotation.z = -0.06 + breath * 0.3;
        this.leftArmGroup.rotation.z = 0.06 - breath * 0.3;
        this.rightArmGroup.rotation.x = 0;
        this.leftArmGroup.rotation.x = 0;
        this.rightLegGroup.rotation.x = 0;
        this.leftLegGroup.rotation.x = 0;
      } else if (this.animationType === 'walk') {
        const walk = Math.sin(this.animTime * 6) * 0.55;
        this.headGroup.rotation.x = 0;
        this.rightArmGroup.rotation.x = -walk;
        this.leftArmGroup.rotation.x = walk;
        this.rightLegGroup.rotation.x = walk;
        this.leftLegGroup.rotation.x = -walk;
        this.rightArmGroup.rotation.z = -0.08;
        this.leftArmGroup.rotation.z = 0.08;
      } else {
        // T-Pose
        this.headGroup.rotation.set(0, 0, 0);
        this.rightArmGroup.rotation.set(0, 0, -Math.PI / 2.2);
        this.leftArmGroup.rotation.set(0, 0, Math.PI / 2.2);
        this.rightLegGroup.rotation.set(0, 0, 0);
        this.leftLegGroup.rotation.set(0, 0, 0);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  public resize() {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private updateCameraPosition() {
    this.camera.position.x = this.distance * Math.sin(this.rotY) * Math.cos(this.rotX);
    this.camera.position.y = this.distance * Math.sin(this.rotX) + 6;
    this.camera.position.z = this.distance * Math.cos(this.rotY) * Math.cos(this.rotX);
    this.camera.lookAt(0, 6, 0);
  }

  private setupEventListeners() {
    const el = this.renderer.domElement;

    el.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevMouseX;
      const dy = e.clientY - this.prevMouseY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      this.rotY -= dx * 0.01;
      this.rotX += dy * 0.01;
      this.rotX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.rotX));
      this.updateCameraPosition();
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.distance += e.deltaY * 0.04;
      this.distance = Math.max(15, Math.min(80, this.distance));
      this.updateCameraPosition();
    }, { passive: false });

    // Touch controls for mobile 3D orbit
    let touchStartX = 0;
    let touchStartY = 0;
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    });

    el.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;

        this.rotY -= dx * 0.01;
        this.rotX += dy * 0.01;
        this.rotX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.rotX));
        this.updateCameraPosition();
      }
    });
  }

  public takeSnapshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  public destroy() {
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
