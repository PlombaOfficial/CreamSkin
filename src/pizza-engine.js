/**
 * 3D PIZZERIA SIMULATOR // INTERACTIVE PIZZA COOKING & BAKING ENGINE
 * Full lifecycle of a pizza: Dough -> Sauce -> Cheese -> Toppings -> Oven Bake -> Slicing -> Boxing.
 */

import { RestaurantModelFactory } from "./restaurant-models.js";

export class PizzaEngine {
  constructor(scene) {
    this.scene = scene;
    this.currentPizza = null; // Currently being made on prep table
    this.ovenPizza = null;    // Currently inside the stone oven
    this.bakedPizza = null;   // Ready on slicing board

    this.ovenTimer = 0;
    this.ovenMaxTime = 8.0; // Seconds to perfect bake (can be upgraded)
    this.isBaking = false;

    // 3D Presentation Meshes
    this.prepPizzaGroup = new THREE.Group();
    this.prepPizzaGroup.position.set(-5.5, 1.28, -7);
    this.scene.add(this.prepPizzaGroup);

    this.ovenPizzaGroup = new THREE.Group();
    this.ovenPizzaGroup.position.set(0, 1.45, -10.5);
    this.scene.add(this.ovenPizzaGroup);

    this.slicePizzaGroup = new THREE.Group();
    this.slicePizzaGroup.position.set(5.5, 1.25, -7);
    this.scene.add(this.slicePizzaGroup);
  }

  // --- 1. PREP STATION ACTIONS ---

  startNewDough() {
    this.currentPizza = {
      dough: true,
      sauce: null,
      cheese: false,
      toppings: [],
      bakeState: 0.0, // 0 = raw, 1.0 = perfect, >1.3 = burnt
      slices: 0,
      boxed: false
    };
    this.renderPrepPizza();
    return true;
  }

  applySauce(type = 'red') {
    if (!this.currentPizza || this.currentPizza.sauce) return false;
    this.currentPizza.sauce = type;
    this.renderPrepPizza();
    return true;
  }

  addCheese() {
    if (!this.currentPizza || this.currentPizza.cheese) return false;
    this.currentPizza.cheese = true;
    this.renderPrepPizza();
    return true;
  }

  addTopping(toppingName) {
    if (!this.currentPizza) return false;
    if (!this.currentPizza.toppings.includes(toppingName)) {
      this.currentPizza.toppings.push(toppingName);
      this.renderPrepPizza();
      return true;
    }
    return false;
  }

  renderPrepPizza() {
    this.prepPizzaGroup.clear();
    if (this.currentPizza) {
      const mesh = RestaurantModelFactory.createPizza(this.currentPizza, this.currentPizza.bakeState);
      this.prepPizzaGroup.add(mesh);
    }
  }

  // --- 2. OVEN ACTIONS ---

  putPizzaInOven() {
    if (!this.currentPizza || this.ovenPizza) return false;
    this.ovenPizza = this.currentPizza;
    this.currentPizza = null;
    this.renderPrepPizza();

    this.ovenTimer = 0;
    this.isBaking = true;
    this.renderOvenPizza();
    return true;
  }

  takePizzaFromOven() {
    if (!this.ovenPizza || this.bakedPizza) return false;
    this.bakedPizza = this.ovenPizza;
    this.ovenPizza = null;
    this.isBaking = false;
    this.renderOvenPizza();
    this.renderSlicePizza();
    return true;
  }

  renderOvenPizza() {
    this.ovenPizzaGroup.clear();
    if (this.ovenPizza) {
      const mesh = RestaurantModelFactory.createPizza(this.ovenPizza, this.ovenPizza.bakeState);
      this.ovenPizzaGroup.add(mesh);
    }
  }

  // --- 3. SLICING & BOXING ---

  slicePizza() {
    if (!this.bakedPizza) return 0;
    if (this.bakedPizza.slices === 0) this.bakedPizza.slices = 4;
    else if (this.bakedPizza.slices === 4) this.bakedPizza.slices = 6;
    else if (this.bakedPizza.slices === 6) this.bakedPizza.slices = 8;
    return this.bakedPizza.slices;
  }

  boxAndServePizza() {
    if (!this.bakedPizza) return null;
    const served = this.bakedPizza;
    served.boxed = true;
    this.bakedPizza = null;
    this.renderSlicePizza();
    return served;
  }

  renderSlicePizza() {
    this.slicePizzaGroup.clear();
    if (this.bakedPizza) {
      const mesh = RestaurantModelFactory.createPizza(this.bakedPizza, this.bakedPizza.bakeState);
      this.slicePizzaGroup.add(mesh);
    }
  }

  // --- 4. GAME TICK & SCORING ---

  update(delta) {
    if (this.isBaking && this.ovenPizza) {
      this.ovenTimer += delta;
      this.ovenPizza.bakeState = this.ovenTimer / this.ovenMaxTime;

      // Sizzle / update oven visual
      if (Math.random() < 0.1) {
        this.renderOvenPizza();
      }
    }
  }

  evaluatePizza(order, cookedPizza) {
    if (!cookedPizza) return { score: 0, stars: 1, tips: 0, feedback: 'Пицца не была приготовлена!' };

    let points = 0;
    let maxPoints = 100;
    const details = [];

    // 1. Sauce (25%)
    if (cookedPizza.sauce === order.recipe.sauce) {
      points += 25;
    } else {
      details.push('Не тот соус');
    }

    // 2. Cheese (25%)
    if (Boolean(cookedPizza.cheese) === Boolean(order.recipe.cheese)) {
      points += 25;
    } else {
      details.push('Проблема с сыром');
    }

    // 3. Toppings Match (30%)
    const expected = order.recipe.toppings || [];
    const actual = cookedPizza.toppings || [];
    let topMatch = 0;
    expected.forEach(t => { if (actual.includes(t)) topMatch++; });
    const wrongTops = actual.filter(t => !expected.includes(t)).length;

    const topRatio = expected.length > 0 ? (topMatch / expected.length) : (actual.length === 0 ? 1 : 0);
    const topPoints = Math.max(0, topRatio * 30 - wrongTops * 10);
    points += Math.round(topPoints);

    // 4. Bake Quality (20%)
    if (cookedPizza.bakeState >= 0.8 && cookedPizza.bakeState <= 1.25) {
      points += 20; // Golden perfection
    } else if (cookedPizza.bakeState > 1.25) {
      points = Math.max(0, points - 25);
      details.push('Пицца подгорела!');
    } else {
      points += 5;
      details.push('Сыроватое тесто');
    }

    // Stars & Tip
    let stars = 1;
    if (points >= 90) stars = 5;
    else if (points >= 75) stars = 4;
    else if (points >= 55) stars = 3;
    else if (points >= 35) stars = 2;

    const basePrice = order.price || 18;
    const tip = stars === 5 ? Math.round(basePrice * 0.4) : (stars >= 4 ? Math.round(basePrice * 0.2) : 0);

    return {
      score: points,
      stars,
      payout: basePrice + tip,
      tip,
      details: details.length > 0 ? details.join(', ') : 'Идеальная пицца!'
    };
  }
}
