/**
 * 3D CITY SANDBOX // HIGH-QUALITY 3D MODELS GENERATOR (THREE.JS)
 * Strictly NO VOXELS / NO CUBES: Beautiful, smooth, stylized low-poly 3D models
 * for Sport Cars, 4-Seater SUVs, Police Cruisers, City Skyscrapers, and Characters.
 */

export class CityModelFactory {
  // 1. SPORT CAR
  static createSportCar(colorHex = 0xff2222) {
    const car = new THREE.Group();
    car.userData = { type: 'sport', maxSpeed: 42, accel: 28, seats: 2, name: 'Спорткар' };

    const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.2, metalness: 0.7 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x1a2b3c, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.8 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });

    // Chassis / Base
    const chassisGeo = new THREE.BoxGeometry(2.0, 0.45, 4.4);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.45;
    car.add(chassis);

    // Hood & Nose
    const noseGeo = new THREE.BoxGeometry(1.9, 0.35, 1.4);
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.position.set(0, 0.45, 1.5);
    nose.rotation.x = -0.08;
    car.add(nose);

    // Cabin / Roof
    const cabinGeo = new THREE.BoxGeometry(1.7, 0.55, 2.0);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 0.88, -0.2);
    car.add(cabin);

    // Roof Top
    const roofGeo = new THREE.BoxGeometry(1.6, 0.08, 1.3);
    const roof = new THREE.Mesh(roofGeo, bodyMat);
    roof.position.set(0, 1.18, -0.25);
    car.add(roof);

    // Rear Spoiler
    const spoilerWing = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.06, 0.4), blackMat);
    spoilerWing.position.set(0, 0.95, -2.0);
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), blackMat);
    p1.position.set(0.65, 0.8, -2.0);
    const p2 = p1.clone();
    p2.position.x = -0.65;
    car.add(spoilerWing, p1, p2);

    // Headlights & Taillights
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.1), lightMat);
    hl1.position.set(0.7, 0.5, 2.2);
    const hl2 = hl1.clone();
    hl2.position.x = -0.7;

    const tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 0.1), tailMat);
    tl1.position.set(0.7, 0.55, -2.2);
    const tl2 = tl1.clone();
    tl2.position.x = -0.7;
    car.add(hl1, hl2, tl1, tl2);

    // Wheels (Cylinders with rims)
    const wheels = this.createWheels(1.1, 1.3, 0.38);
    car.add(...wheels.meshes);
    car.userData.wheels = wheels;

    return car;
  }

  // 2. SQUAD 4-SEATER SUV (For riding together with friends!)
  static createSUV(colorHex = 0x2e5c8a) {
    const car = new THREE.Group();
    car.userData = { type: 'suv', maxSpeed: 34, accel: 20, seats: 4, name: 'Внедорожник 4x4' };

    const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.3, metalness: 0.5 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x112233, roughness: 0.1, transparent: true, opacity: 0.85 });

    // Sturdy Body
    const bodyGeo = new THREE.BoxGeometry(2.3, 0.7, 4.8);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.75;
    car.add(body);

    // Tall Cabin for 4 Passengers
    const cabinGeo = new THREE.BoxGeometry(2.1, 0.95, 3.2);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 1.5, -0.4);
    car.add(cabin);

    // Roof & Luggage Rack
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.1, 3.2), bodyMat);
    roof.position.set(0, 2.0, -0.4);
    const rack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 2.6), blackMat);
    rack.position.set(0, 2.12, -0.4);
    car.add(roof, rack);

    // Front Bumper / Bullbar
    const bullbar = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.4, 0.2), blackMat);
    bullbar.position.set(0, 0.6, 2.45);
    car.add(bullbar);

    // Headlights
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    hl1.position.set(0.8, 0.8, 2.42);
    const hl2 = hl1.clone();
    hl2.position.x = -0.8;
    car.add(hl1, hl2);

    // Large 4x4 Offroad Wheels
    const wheels = this.createWheels(1.25, 1.45, 0.5);
    car.add(...wheels.meshes);
    car.userData.wheels = wheels;

    return car;
  }

  // 3. POLICE INTERCEPTOR WITH FLASHING SIREN LIGHTS
  static createPoliceCar() {
    const car = new THREE.Group();
    car.userData = { type: 'police', maxSpeed: 38, accel: 25, seats: 2, name: 'Полиция' };

    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.3 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x112233, roughness: 0.1, transparent: true, opacity: 0.85 });

    // Chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.5, 4.6), blackMat);
    chassis.position.y = 0.5;

    // White Doors & Roof
    const doors = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.48, 2.2), whiteMat);
    doors.position.set(0, 0.5, 0);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 2.2), glassMat);
    cabin.position.set(0, 1.0, -0.2);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.08, 1.6), whiteMat);
    roof.position.set(0, 1.32, -0.2);

    car.add(chassis, doors, cabin, roof);

    // Flashing Siren Lightbar
    const redLight = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.15, 0.25), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    redLight.position.set(-0.35, 1.44, -0.2);

    const blueLight = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.15, 0.25), new THREE.MeshBasicMaterial({ color: 0x0055ff }));
    blueLight.position.set(0.35, 1.44, -0.2);

    car.add(redLight, blueLight);
    car.userData.sirenLights = { red: redLight, blue: blueLight };

    // Wheels
    const wheels = this.createWheels(1.15, 1.35, 0.42);
    car.add(...wheels.meshes);
    car.userData.wheels = wheels;

    return car;
  }

  static createWheels(trackWidth, wheelbase, radius) {
    const wheelGeo = new THREE.CylinderGeometry(radius, radius, 0.32, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.2 });

    const createOne = (x, z) => {
      const g = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeo, tireMat);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.55, radius * 0.55, 0.34, 12), rimMat);
      rim.rotateZ(Math.PI / 2);
      g.add(tire, rim);
      g.position.set(x, radius, z);
      return g;
    };

    const fl = createOne(-trackWidth, wheelbase);
    const fr = createOne(trackWidth, wheelbase);
    const rl = createOne(-trackWidth, -wheelbase);
    const rr = createOne(trackWidth, -wheelbase);

    return {
      meshes: [fl, fr, rl, rr],
      fl, fr, rl, rr,
      radius
    };
  }

  // 4. SMOOTH HUMANOID CHARACTER (NOT A MINECRAFT CUBE)
  static createCharacter(colorHex = 0x00aaaa) {
    const group = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe0a880, roughness: 0.6 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.5 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x223344, roughness: 0.7 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.8 });

    // Head (Smooth Sphere)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), skinMat);
    head.position.y = 1.62;

    // Hair / Cap
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.23, 16, 12), hairMat);
    hair.position.set(0, 1.67, -0.03);
    hair.scale.set(1.02, 0.7, 1.05);

    // Torso / Jacket (Smooth Chamfered Shape)
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.65, 12), shirtMat);
    torso.position.y = 1.15;

    // Left & Right Arms
    const armGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.55, 8);
    const leftArm = new THREE.Mesh(armGeo, shirtMat);
    leftArm.position.set(-0.35, 1.1, 0);
    const rightArm = new THREE.Mesh(armGeo, shirtMat);
    rightArm.position.set(0.35, 1.1, 0);

    // Left & Right Legs
    const legGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.7, 8);
    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.set(-0.15, 0.45, 0);
    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.set(0.15, 0.45, 0);

    // Shoes
    const shoeGeo = new THREE.BoxGeometry(0.16, 0.12, 0.26);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(-0.15, 0.06, 0.04);
    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0.15, 0.06, 0.04);

    group.add(head, hair, torso, leftArm, rightArm, leftLeg, rightLeg, leftShoe, rightShoe);

    group.userData = {
      leftLeg, rightLeg, leftArm, rightArm,
      walkTimer: 0
    };

    return group;
  }

  // 5. CITY ROADS, SKYSCRAPERS & ENVIRONMENT
  static buildCity(scene) {
    const cityGroup = new THREE.Group();

    // Ground Asphalt Base
    const groundGeo = new THREE.PlaneGeometry(600, 600);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x22252a, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    cityGroup.add(ground);

    // Road Grid Layout
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x181a1f, roughness: 0.7 });
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });

    const roadWidth = 14;
    const blockSize = 80;
    const gridCount = 5;

    for (let gx = -gridCount; gx <= gridCount; gx++) {
      const rx = gx * blockSize;
      // North-South Road
      const rMeshZ = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, 600), roadMat);
      rMeshZ.rotation.x = -Math.PI / 2;
      rMeshZ.position.set(rx, 0.02, 0);
      cityGroup.add(rMeshZ);

      // East-West Road
      const rMeshX = new THREE.Mesh(new THREE.PlaneGeometry(600, roadWidth), roadMat);
      rMeshX.rotation.x = -Math.PI / 2;
      rMeshX.position.set(0, 0.02, rx);
      cityGroup.add(rMeshX);
    }

    // Skyscrapers & City Blocks
    const buildingColors = [0x3a4f66, 0x2d3a4a, 0x4a5f78, 0x1b2838, 0x334455, 0x50657b];
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xffe680 });

    for (let x = -gridCount; x < gridCount; x++) {
      for (let z = -gridCount; z < gridCount; z++) {
        const cx = x * blockSize + blockSize / 2;
        const cz = z * blockSize + blockSize / 2;

        // Skip spawn center for open driving plaza
        if (Math.abs(cx) < 30 && Math.abs(cz) < 30) continue;

        // 2-4 Buildings per block
        const bCount = 2 + Math.floor(Math.random() * 3);
        for (let b = 0; b < bCount; b++) {
          const bWidth = 18 + Math.random() * 12;
          const bDepth = 18 + Math.random() * 12;
          const bHeight = 25 + Math.random() * 75; // Tall skyscrapers!

          const bx = cx + (Math.random() - 0.5) * 30;
          const bz = cz + (Math.random() - 0.5) * 30;

          const bMat = new THREE.MeshStandardMaterial({
            color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
            roughness: 0.4,
            metalness: 0.3
          });

          const bMesh = new THREE.Mesh(new THREE.BoxGeometry(bWidth, bHeight, bDepth), bMat);
          bMesh.position.set(bx, bHeight / 2, bz);
          cityGroup.add(bMesh);

          // Glowing Neon Windows
          if (Math.random() > 0.3) {
            const win = new THREE.Mesh(new THREE.PlaneGeometry(bWidth * 0.85, bHeight * 0.85), windowMat);
            win.position.set(bx, bHeight / 2, bz + bDepth / 2 + 0.05);
            cityGroup.add(win);
          }
        }

        // Palm Trees on Sidewalks
        for (let p = 0; p < 4; p++) {
          const px = cx + (p % 2 === 0 ? -32 : 32);
          const pz = cz + (p < 2 ? -32 : 32);
          const palm = this.createPalmTree();
          palm.position.set(px, 0, pz);
          cityGroup.add(palm);
        }
      }
    }

    scene.add(cityGroup);
    return cityGroup;
  }

  static createPalmTree() {
    const palm = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6e4e30, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.6 });

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 6, 8), trunkMat);
    trunk.position.y = 3;
    trunk.rotation.z = (Math.random() - 0.5) * 0.15;
    palm.add(trunk);

    // Leaves
    for (let i = 0; i < 6; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3.5, 5), leafMat);
      leaf.position.set(0, 5.8, 0);
      leaf.rotation.z = Math.PI / 3;
      leaf.rotation.y = (i / 6) * Math.PI * 2;
      palm.add(leaf);
    }
    return palm;
  }
}
