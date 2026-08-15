/**
 * NEO-CLICKER ONLINE // CORE CLICKER & LONG-TERM PROGRESSION ENGINE
 * 10-Tier hardware scaling, click multipliers, prestige, inventory, and zero-data-loss storage.
 */

import { ITEMS_DATABASE } from "./items-collectibles.js";

const SAVE_KEY = 'neo_clicker_save_v2';

export class ClickerCore {
  constructor() {
    this.name = this.generateUniqueDeviceNickname();
    this.neoCoins = 0;
    this.quantumCrystals = 0;
    this.totalClicks = 0;
    this.totalEarned = 0;

    // Upgrades
    this.clickLevel = 1;
    // Map of hardware tier counts: { chip_v1: 0, gpu_gtx: 0, ... }
    this.hardwareTiers = {};
    ITEMS_DATABASE.filter(i => i.type === 'hardware').forEach(h => {
      this.hardwareTiers[h.id] = 0;
    });

    this.prestigeLevel = 0;
    this.prestigeMultiplier = 1.0;

    // Inventory & Equipped Cosmetics
    this.inventory = [];
    this.equippedAura = null;
    this.equippedFrame = null;
    this.equippedTitle = null;

    // Clan membership
    this.clanId = null;

    // Stats
    this.createdDate = Date.now();
    this.lastTick = Date.now();

    this.loadFromStorage();
  }

  generateUniqueDeviceNickname() {
    const prefixes = ['Cyber', 'Neo', 'Quantum', 'Phantom', 'Glitch', 'Nexus', 'Titan', 'Viper', 'Shadow', 'Volt', 'Matrix', 'Pulse'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const uniqueId = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}_#${uniqueId}`;
  }

  saveToStorage() {
    try {
      const data = {
        version: 2,
        name: this.name,
        neoCoins: this.neoCoins,
        quantumCrystals: this.quantumCrystals,
        totalClicks: this.totalClicks,
        totalEarned: this.totalEarned,
        clickLevel: this.clickLevel,
        hardwareTiers: this.hardwareTiers,
        prestigeLevel: this.prestigeLevel,
        prestigeMultiplier: this.prestigeMultiplier,
        inventory: this.inventory,
        equippedAura: this.equippedAura,
        equippedFrame: this.equippedFrame,
        equippedTitle: this.equippedTitle,
        clanId: this.clanId,
        createdDate: this.createdDate
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem('neo_clicker_save_v1');
      if (raw) {
        const data = JSON.parse(raw);
        this.name = data.name || this.name || this.generateUniqueDeviceNickname();
        this.neoCoins = Math.max(0, Number(data.neoCoins) || 0);
        this.quantumCrystals = Math.max(0, Number(data.quantumCrystals) || 0);
        this.totalClicks = Number(data.totalClicks) || 0;
        this.totalEarned = Number(data.totalEarned) || this.neoCoins;
        this.clickLevel = Math.max(1, Number(data.clickLevel) || 1);

        if (data.hardwareTiers && typeof data.hardwareTiers === 'object') {
          this.hardwareTiers = Object.assign(this.hardwareTiers, data.hardwareTiers);
        } else if (data.autoMinersCount) {
          this.hardwareTiers['chip_v1'] = Number(data.autoMinersCount) || 0;
        }

        this.prestigeLevel = Number(data.prestigeLevel) || 0;
        this.prestigeMultiplier = Math.max(1.0, Number(data.prestigeMultiplier) || 1.0);
        this.inventory = Array.isArray(data.inventory) ? data.inventory : [];
        this.equippedAura = data.equippedAura || null;
        this.equippedFrame = data.equippedFrame || null;
        this.equippedTitle = data.equippedTitle || null;
        this.clanId = data.clanId || null;
        this.createdDate = data.createdDate || Date.now();
      } else {
        this.neoCoins = 15;
        this.saveToStorage();
      }
    } catch (e) {
      console.warn('Storage load failed:', e);
    }
  }

  exportSaveString() {
    this.saveToStorage();
    return btoa(unescape(encodeURIComponent(localStorage.getItem(SAVE_KEY))));
  }

  importSaveString(encodedStr) {
    try {
      const decoded = decodeURIComponent(escape(atob(encodedStr.trim())));
      JSON.parse(decoded);
      localStorage.setItem(SAVE_KEY, decoded);
      this.loadFromStorage();
      return true;
    } catch (e) {
      return false;
    }
  }

  // --- INCOME CALCULATIONS ---

  getClickPower(clanBonus = 0) {
    let power = this.clickLevel * (1 + (this.clickLevel - 1) * 0.3);

    this.inventory.forEach(itemId => {
      const item = ITEMS_DATABASE.find(i => i.id === itemId);
      if (item && item.bonus && item.bonus.clickPower) {
        power += item.bonus.clickPower;
      }
    });

    power *= this.prestigeMultiplier;
    power *= (1 + clanBonus);

    if (this.inventory.includes('divine_matrix')) power *= 2.0;

    return Math.max(1, Math.round(power));
  }

  getAutoIncomePerSec(clanBonus = 0) {
    let income = 0;

    // Calculate from hardware tiers
    ITEMS_DATABASE.filter(i => i.type === 'hardware').forEach(h => {
      const count = this.hardwareTiers[h.id] || 0;
      if (count > 0 && h.bonus && h.bonus.autoIncome) {
        income += count * h.bonus.autoIncome;
      }
    });

    income *= this.prestigeMultiplier;
    income *= (1 + clanBonus);

    if (this.inventory.includes('divine_matrix')) income *= 2.0;

    return Math.round(income * 10) / 10;
  }

  // --- UPGRADES ---

  performClick(clanBonus = 0) {
    let amount = this.getClickPower(clanBonus);

    if (this.inventory.includes('golden_touch') && Math.random() < 0.12) {
      amount *= 5;
    }

    this.neoCoins += amount;
    this.totalEarned += amount;
    this.totalClicks++;
    this.saveToStorage();
    return amount;
  }

  upgradeClick() {
    const cost = this.getClickUpgradeCost();
    if (this.neoCoins >= cost) {
      this.neoCoins -= cost;
      this.clickLevel++;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  getClickUpgradeCost() {
    return Math.round(15 * Math.pow(1.32, this.clickLevel - 1));
  }

  buyHardwareTier(hardwareId) {
    const hardware = ITEMS_DATABASE.find(i => i.id === hardwareId);
    if (!hardware) return false;

    const cost = this.getHardwareCost(hardwareId);
    if (this.neoCoins >= cost) {
      this.neoCoins -= cost;
      this.hardwareTiers[hardwareId] = (this.hardwareTiers[hardwareId] || 0) + 1;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  getHardwareCost(hardwareId) {
    const hardware = ITEMS_DATABASE.find(i => i.id === hardwareId);
    if (!hardware) return 999999;
    const count = this.hardwareTiers[hardwareId] || 0;
    return Math.round(hardware.basePrice * Math.pow(1.22, count));
  }

  canPrestige() {
    const required = 100000 * Math.pow(3.0, this.prestigeLevel);
    return this.neoCoins >= required;
  }

  getPrestigeCost() {
    return Math.round(100000 * Math.pow(3.0, this.prestigeLevel));
  }

  doPrestige() {
    const req = this.getPrestigeCost();
    if (this.neoCoins >= req) {
      this.prestigeLevel++;
      this.prestigeMultiplier += 0.5;
      this.quantumCrystals += 75 * this.prestigeLevel;
      this.neoCoins = 0;
      this.clickLevel = 1;
      Object.keys(this.hardwareTiers).forEach(k => this.hardwareTiers[k] = 0);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  addItem(itemId) {
    this.inventory.push(itemId);
    this.saveToStorage();
  }

  removeItem(itemId) {
    const idx = this.inventory.indexOf(itemId);
    if (idx !== -1) {
      this.inventory.splice(idx, 1);
      if (this.equippedAura === itemId) this.equippedAura = null;
      if (this.equippedFrame === itemId) this.equippedFrame = null;
      if (this.equippedTitle === itemId) this.equippedTitle = null;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  equipCosmetic(itemId) {
    const item = ITEMS_DATABASE.find(i => i.id === itemId);
    if (!item) return;

    if (item.type === 'aura') {
      this.equippedAura = (this.equippedAura === itemId) ? null : itemId;
    } else if (item.type === 'frame') {
      this.equippedFrame = (this.equippedFrame === itemId) ? null : itemId;
    } else if (item.type === 'title') {
      this.equippedTitle = (this.equippedTitle === itemId) ? null : itemId;
    }
    this.saveToStorage();
  }

  update(clanBonus = 0) {
    const now = Date.now();
    const delta = (now - this.lastTick) / 1000;
    this.lastTick = now;

    if (delta > 0 && delta < 60) {
      const income = this.getAutoIncomePerSec(clanBonus) * delta;
      if (income > 0) {
        this.neoCoins += income;
        this.totalEarned += income;
      }
    }
  }
}
