/**
 * 3D PIZZERIA SIMULATOR // 4 DETAILED SEPARATE ROOMS & HIGH-POLY PROPS
 * 1. Dining Hall (Tables, booths, cash counter, neon signs, Italian paintings).
 * 2. Master Kitchen (Stone pizza oven with glowing fire, marble prep counter, slice table).
 * 3. Stock Warehouse (Sacks of flour, cardboard boxes, ingredient crates).
 * 4. Outdoor Street & Delivery Parking (Asphalt, street lamps, 3D delivery car).
 */

export class RestaurantModelFactory {
  static buildRestaurant(scene) {
    const restaurant = new THREE.Group();

    // Materials
    const floorTileMat = new THREE.MeshStandardMaterial({ color: 0x3d271d, roughness: 0.5 });
    const kitchenTileMat = new THREE.MeshStandardMaterial({ color: 0xd9d2c5, roughness: 0.4 });
    const warehouseFloorMat = new THREE.MeshStandardMaterial({ color: 0x303236, roughness: 0.8 });
    const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x1e2024, roughness: 0.8 });

    const wallBrickMat = new THREE.MeshStandardMaterial({ color: 0x8a3c26, roughness: 0.8 });
    const wallPlasterMat = new THREE.MeshStandardMaterial({ color: 0xe8dfd1, roughness: 0.7 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2c16, roughness: 0.6 });

    // ========================================================================
    // 1. FLOORS FOR 4 SEPARATE ROOMS
    // ========================================================================
    // Room 1: Dining Hall Floor (Z: -2 to 12)
    const diningFloor = new THREE.Mesh(new THREE.PlaneGeometry(32, 14), floorTileMat);
    diningFloor.rotation.x = -Math.PI / 2;
    diningFloor.position.set(0, 0, 5);
    restaurant.add(diningFloor);

    // Room 2: Kitchen Floor (Left Back, X: -16 to 0, Z: -14 to -2)
    const kitchenFloor = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), kitchenTileMat);
    kitchenFloor.rotation.x = -Math.PI / 2;
    kitchenFloor.position.set(-8, 0, -8);
    restaurant.add(kitchenFloor);

    // Room 3: Warehouse Floor (Right Back, X: 0 to 16, Z: -14 to -2)
    const warehouseFloor = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), warehouseFloorMat);
    warehouseFloor.rotation.x = -Math.PI / 2;
    warehouseFloor.position.set(8, 0, -8);
    restaurant.add(warehouseFloor);

    // Room 4: Outdoor Street & Driveway (Z: 12 to 34)
    const street = new THREE.Mesh(new THREE.PlaneGeometry(48, 22), asphaltMat);
    street.rotation.x = -Math.PI / 2;
    street.position.set(0, -0.01, 23);
    restaurant.add(street);

    // Sidewalk curb
    const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(34, 0.2, 3), new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.8 }));
    sidewalk.position.set(0, 0.1, 13.5);
    restaurant.add(sidewalk);

    // ========================================================================
    // 2. WALLS & INTERIOR PARTITIONS (SEPARATE ROOMS)
    // ========================================================================
    // Outer Back Wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(32, 5.5, 0.4), wallBrickMat);
    backWall.position.set(0, 2.75, -14);
    restaurant.add(backWall);

    // Outer Left Wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5.5, 26), wallBrickMat);
    leftWall.position.set(-16, 2.75, -1);
    restaurant.add(leftWall);

    // Outer Right Wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5.5, 26), wallBrickMat);
    rightWall.position.set(16, 2.75, -1);
    restaurant.add(rightWall);

    // Interior Partition Wall 1: Between Dining Hall and Kitchen/Warehouse (Z = -2)
    // Left section (above counter arch)
    const midWallLeft = new THREE.Mesh(new THREE.BoxGeometry(10, 5.5, 0.4), wallPlasterMat);
    midWallLeft.position.set(-11, 2.75, -2);
    const midWallRight = new THREE.Mesh(new THREE.BoxGeometry(10, 5.5, 0.4), wallPlasterMat);
    midWallRight.position.set(11, 2.75, -2);
    const midWallArch = new THREE.Mesh(new THREE.BoxGeometry(12, 1.8, 0.4), wallPlasterMat);
    midWallArch.position.set(0, 4.6, -2);
    restaurant.add(midWallLeft, midWallRight, midWallArch);

    // Interior Partition Wall 2: Between Kitchen and Warehouse (X = 0, Z: -14 to -2)
    const kitchenWarehouseWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5.5, 12), wallPlasterMat);
    kitchenWarehouseWall.position.set(0, 2.75, -8);
    restaurant.add(kitchenWarehouseWall);

    // Front Glass Wall with Entrance Doors (Z = 12)
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.35, roughness: 0.1 });
    const frontWallL = new THREE.Mesh(new THREE.BoxGeometry(12, 5.5, 0.2), glassMat);
    frontWallL.position.set(-10, 2.75, 12);
    const frontWallR = new THREE.Mesh(new THREE.BoxGeometry(12, 5.5, 0.2), glassMat);
    frontWallR.position.set(10, 2.75, 12);
    restaurant.add(frontWallL, frontWallR);

    // ========================================================================
    // 3. ROOM 1: DINING HALL & CASH REGISTER
    // ========================================================================
    // Order Counter
    const orderCounter = this.createOrderCounter();
    orderCounter.position.set(0, 0, -2);
    restaurant.add(orderCounter);

    // Dining Booths & Tables
    this.createDiningHallProps(restaurant);

    // Menu Board above counter
    const menuBoard = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.2, 0.1), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    menuBoard.position.set(0, 4.0, -1.7);
    restaurant.add(menuBoard);

    // ========================================================================
    // 4. ROOM 2: MASTER KITCHEN
    // ========================================================================
    // Stone Oven with glowing fire (Left Back Corner)
    const oven = this.createStoneOven();
    oven.position.set(-8, 0, -13);
    restaurant.add(oven);

    // Kitchen Prep Marble Counter
    const prepCounter = this.createKitchenPrepCounter();
    prepCounter.position.set(-13, 0, -8);
    prepCounter.rotation.y = Math.PI / 2;
    restaurant.add(prepCounter);

    // Slicing & Packing Table
    const sliceTable = this.createSliceTable();
    sliceTable.position.set(-3.5, 0, -8);
    sliceTable.rotation.y = -Math.PI / 2;
    restaurant.add(sliceTable);

    // ========================================================================
    // 5. ROOM 3: STOCK WAREHOUSE (Flour sacks, ingredient crates)
    // ========================================================================
    this.createWarehouseProps(restaurant);

    // ========================================================================
    // 6. ROOM 4: OUTDOOR DELIVERY CAR & STREET LAMPS
    // ========================================================================
    const deliveryVeh = this.createDeliveryVehicle();
    deliveryVeh.position.set(0, 0, 19);
    restaurant.add(deliveryVeh);

    // Street Lamps
    const lamp1 = this.createStreetLamp();
    lamp1.position.set(-12, 0, 14.5);
    const lamp2 = this.createStreetLamp();
    lamp2.position.set(12, 0, 14.5);
    restaurant.add(lamp1, lamp2);

    scene.add(restaurant);
    return { restaurant, deliveryVeh };
  }

  // --- ROOM BUILDERS & PROPS ---

  static createStoneOven() {
    const ovenGroup = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x4a2c20, roughness: 0.9 });
    const archMat = new THREE.MeshStandardMaterial({ color: 0x6e3b2b, roughness: 0.8 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x110b08, roughness: 0.95 });
    const fireMat = new THREE.MeshBasicMaterial({ color: 0xff5500 });

    // Stone Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.2, 3.8), stoneMat);
    base.position.y = 0.6;

    // Stone Arch Dome
    const dome = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 1.8, 16), stoneMat);
    dome.position.set(0, 2.1, 0);

    // Arch Opening
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 0.4), darkMat);
    mouth.position.set(0, 1.7, 1.8);

    // Glowing Orange Fire Bed
    const fire = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.3, 2.0), fireMat);
    fire.position.set(0, 1.35, 0.4);

    // Exhaust Chimney
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 2.6, 10), archMat);
    chimney.position.set(0, 4.0, -0.6);

    ovenGroup.add(base, dome, mouth, fire, chimney);
    return ovenGroup;
  }

  static createKitchenPrepCounter() {
    const counterGroup = new THREE.Group();
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.85, roughness: 0.25 });
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf0ece1, roughness: 0.3 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(6.0, 1.1, 1.8), steelMat);
    base.position.y = 0.55;

    const marble = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.12, 2.0), marbleMat);
    marble.position.y = 1.16;

    counterGroup.add(base, marble);

    // 6 Stainless Steel Ingredient Bins
    const trayCols = ['#cc1100', '#2e7d32', '#ffcc00', '#8a1818', '#d9cbb4', '#151515'];
    for (let i = 0; i < 6; i++) {
      const tray = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.65), steelMat);
      const px = -2.2 + i * 0.88;
      tray.position.set(px, 1.25, 0.45);

      const fill = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.55), new THREE.MeshStandardMaterial({ color: trayCols[i] }));
      fill.position.set(px, 1.28, 0.45);

      counterGroup.add(tray, fill);
    }
    return counterGroup;
  }

  static createSliceTable() {
    const tableGroup = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2c16, roughness: 0.6 });
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xc49a6c, roughness: 0.5 });
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xd9b784, roughness: 0.8 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.1, 1.8), woodMat);
    base.position.y = 0.55;

    const board = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.08, 24), boardMat);
    board.position.set(-0.8, 1.16, 0);

    for (let b = 0; b < 4; b++) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.14, 2.0), boxMat);
      box.position.set(1.1, 1.18 + b * 0.15, 0);
      tableGroup.add(box);
    }

    tableGroup.add(base, board);
    return tableGroup;
  }

  static createOrderCounter() {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.6 });
    const marbleTop = new THREE.MeshStandardMaterial({ color: 0xe8e2d5, roughness: 0.3 });
    const registerMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.8, roughness: 0.2 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(8.0, 1.1, 1.6), woodMat);
    base.position.y = 0.55;

    const top = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.1, 1.8), marbleTop);
    top.position.y = 1.15;

    const posTerminal = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.7), registerMat);
    posTerminal.position.set(0, 1.3, 0);

    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.06), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    screen.position.set(0, 1.62, 0.18);
    screen.rotation.x = -0.3;

    group.add(base, top, posTerminal, screen);
    return group;
  }

  static createDiningHallProps(restaurant) {
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x4a2c16, roughness: 0.6 });
    const clothMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.7 });
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x8a2318, roughness: 0.5 });

    const spots = [
      { x: -8, z: 4 }, { x: -8, z: 9 },
      { x: 8, z: 4 }, { x: 8, z: 9 }
    ];

    spots.forEach(p => {
      // Round Table
      const table = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.08, 16), clothMat);
      table.position.set(p.x, 1.1, p.z);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.1, 8), tableMat);
      leg.position.set(p.x, 0.55, p.z);
      restaurant.add(table, leg);

      // Cozy Leather Booth Seats
      const booth1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 0.8), leatherMat);
      booth1.position.set(p.x, 0.5, p.z - 1.5);
      const booth2 = booth1.clone();
      booth2.position.set(p.x, 0.5, p.z + 1.5);
      restaurant.add(booth1, booth2);
    });
  }

  static createWarehouseProps(restaurant) {
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.8, roughness: 0.3 });
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xb58b5a, roughness: 0.8 });
    const sackMat = new THREE.MeshStandardMaterial({ color: 0xddd0b8, roughness: 0.9 });

    // Metal Storage Racks
    for (let r = 0; r < 2; r++) {
      const rack = new THREE.Mesh(new THREE.BoxGeometry(6.0, 3.5, 1.2), rackMat);
      rack.position.set(8, 1.75, -12 + r * 5.0);
      restaurant.add(rack);

      // Ingredient Cardboard Boxes on Racks
      for (let b = 0; b < 6; b++) {
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.9), boxMat);
        const bx = 5.8 + (b % 3) * 1.8;
        const by = b < 3 ? 1.0 : 2.4;
        box.position.set(bx, by, -12 + r * 5.0);
        restaurant.add(box);
      }
    }

    // Sacks of Italian Flour
    for (let s = 0; s < 4; s++) {
      const sack = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.9, 8), sackMat);
      sack.position.set(13.5, 0.45, -8 + s * 1.1);
      restaurant.add(sack);
    }
  }

  static createDeliveryVehicle() {
    const carGroup = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd62828, roughness: 0.3, metalness: 0.6 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x112233, roughness: 0.1 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const pizzaBoxMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.5 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 3.8), bodyMat);
    body.position.y = 0.6;

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.7, 2.0), glassMat);
    cabin.position.set(0, 1.2, -0.2);

    const roofSign = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 1.0), pizzaBoxMat);
    roofSign.position.set(0, 1.7, -0.2);

    for (let i = 0; i < 4; i++) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16), wheelMat);
      wheel.rotation.z = Math.PI / 2;
      const wx = (i % 2 === 0) ? -1.05 : 1.05;
      const wz = (i < 2) ? 1.2 : -1.2;
      wheel.position.set(wx, 0.35, wz);
      carGroup.add(wheel);
    }

    carGroup.add(body, cabin, roofSign);
    return carGroup;
  }

  static createStreetLamp() {
    const lamp = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.3 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffeedd });

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 4.5, 8), metalMat);
    pole.position.y = 2.25;

    const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.6), lightMat);
    lantern.position.y = 4.6;

    lamp.add(pole, lantern);
    return lamp;
  }

  static createPizza(recipe = { sauce: 'red', cheese: true, toppings: ['pepperoni'] }, bakeState = 1.0) {
    const pizzaGroup = new THREE.Group();
    let crustColor = 0xf5deb3;
    if (bakeState >= 0.8 && bakeState <= 1.25) crustColor = 0xd49b4b;
    else if (bakeState > 1.25) crustColor = 0x221100;

    const crustMat = new THREE.MeshStandardMaterial({ color: crustColor, roughness: 0.8 });
    const crust = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.9, 0.06, 24), crustMat);
    pizzaGroup.add(crust);

    const lipMat = new THREE.MeshStandardMaterial({ color: crustColor, roughness: 0.7 });
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.08, 12, 24), lipMat);
    lip.rotation.x = Math.PI / 2;
    lip.position.y = 0.04;
    pizzaGroup.add(lip);

    if (recipe.sauce) {
      const sauceColor = recipe.sauce === 'green' ? 0x3d7a22 : (recipe.sauce === 'white' ? 0xfffae6 : 0xb31a00);
      const sauce = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.84, 0.02, 20), new THREE.MeshStandardMaterial({ color: sauceColor, roughness: 0.4 }));
      sauce.position.y = 0.04;
      pizzaGroup.add(sauce);
    }

    if (recipe.cheese) {
      const cheese = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.025, 20), new THREE.MeshStandardMaterial({ color: 0xffe066, roughness: 0.6 }));
      cheese.position.y = 0.05;
      pizzaGroup.add(cheese);
    }

    const toppings = recipe.toppings || [];
    toppings.forEach(t => {
      if (t === 'pepperoni') {
        const pepMat = new THREE.MeshStandardMaterial({ color: 0x8a1818, roughness: 0.5 });
        for (let i = 0; i < 7; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const rad = i === 6 ? 0 : 0.48;
          const pep = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 12), pepMat);
          pep.position.set(Math.cos(angle) * rad, 0.065, Math.sin(angle) * rad);
          pizzaGroup.add(pep);
        }
      } else if (t === 'mushrooms') {
        const mushMat = new THREE.MeshStandardMaterial({ color: 0xd9cbb4, roughness: 0.8 });
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 + 0.3;
          const mush = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.12), mushMat);
          mush.position.set(Math.cos(angle) * 0.52, 0.065, Math.sin(angle) * 0.52);
          pizzaGroup.add(mush);
        }
      } else if (t === 'basil') {
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x1e7e34, roughness: 0.6 });
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2 + 0.5;
          const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 5), leafMat);
          leaf.rotation.x = Math.PI / 2;
          leaf.position.set(Math.cos(angle) * 0.42, 0.07, Math.sin(angle) * 0.42);
          pizzaGroup.add(leaf);
        }
      } else if (t === 'olives') {
        const oliveMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.5 });
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + 0.2;
          const olive = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.03, 8, 12), oliveMat);
          olive.rotation.x = Math.PI / 2;
          olive.position.set(Math.cos(angle) * 0.6, 0.07, Math.sin(angle) * 0.6);
          pizzaGroup.add(olive);
        }
      }
    });

    return pizzaGroup;
  }

  static createCustomer(role = 'mafia', shirtColor = 0x222222) {
    const group = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xdfa67c, roughness: 0.6 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.5 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1c2430, roughness: 0.7 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x221100, roughness: 0.8 });

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), skinMat);
    head.position.y = 1.55;

    if (role === 'mafia') {
      const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 0.15, 12), new THREE.MeshStandardMaterial({ color: 0x111111 }));
      hat.position.set(0, 1.72, 0);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.03, 16), new THREE.MeshStandardMaterial({ color: 0x111111 }));
      brim.position.set(0, 1.66, 0);
      group.add(hat, brim);
    } else {
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.23, 14, 10), hairMat);
      hair.position.set(0, 1.6, -0.02);
      hair.scale.set(1.02, 0.75, 1.05);
      group.add(hair);
    }

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.65, 10), shirtMat);
    torso.position.y = 1.1;

    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.7, 8), pantsMat);
    leg1.position.set(-0.14, 0.42, 0);
    const leg2 = leg1.clone();
    leg2.position.set(0.14, 0.42, 0);

    group.add(head, torso, leg1, leg2);
    return group;
  }
}
