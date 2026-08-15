/**
 * NEO-CLICKER ONLINE // BILATERAL P2P TRADE & OPEN MARKETPLACE ENGINE
 * 1. 2-Sided Secure Bilateral Trade Window (Items + Coins).
 * 2. Global Player Marketplace for listing & purchasing items with search & filters.
 */

import { ITEMS_DATABASE } from "./items-collectibles.js";

const MARKET_STORAGE_KEY = 'neo_marketplace_db_v2';

export class TradeMarketEngine {
  constructor() {
    this.marketListings = [];
    this.activeTrade = null;
    this.loadMarket();
  }

  loadMarket() {
    try {
      const raw = localStorage.getItem(MARKET_STORAGE_KEY);
      if (raw) {
        this.marketListings = JSON.parse(raw);
      } else {
        this.seedDefaultMarket();
      }
    } catch (e) {
      this.seedDefaultMarket();
    }
  }

  saveMarket() {
    try {
      localStorage.setItem(MARKET_STORAGE_KEY, JSON.stringify(this.marketListings));
    } catch (e) {}
  }

  seedDefaultMarket() {
    this.marketListings = [
      { id: 'm_1', seller: 'Alex_Pro', itemId: 'gpu_rtx', price: 320, time: Date.now() },
      { id: 'm_2', seller: 'FlameMaster', itemId: 'cyber_glove', price: 180, time: Date.now() },
      { id: 'm_3', seller: 'SunGoddess', itemId: 'aura_cyber', price: 950, time: Date.now() },
      { id: 'm_4', seller: 'Matrix_King', itemId: 'frame_gold', price: 750, time: Date.now() },
      { id: 'm_5', seller: 'ByteHunter', itemId: 'title_tycoon', price: 450, time: Date.now() }
    ];
    this.saveMarket();
  }

  // --- MARKETPLACE ACTIONS ---

  createListing(sellerName, itemId, price) {
    const listing = {
      id: 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      seller: sellerName,
      itemId,
      price: Math.max(1, Math.round(price)),
      time: Date.now()
    };
    this.marketListings.unshift(listing);
    this.saveMarket();
    return listing;
  }

  buyListing(listingId, buyerCore) {
    const idx = this.marketListings.findIndex(l => l.id === listingId);
    if (idx === -1) return { success: false, msg: 'Товар уже продан или снят!' };

    const listing = this.marketListings[idx];
    if (buyerCore.neoCoins < listing.price) {
      return { success: false, msg: 'Недостаточно Нео-Коинов для покупки!' };
    }

    // Process Transaction
    buyerCore.neoCoins -= listing.price;
    buyerCore.addItem(listing.itemId);

    this.marketListings.splice(idx, 1);
    this.saveMarket();

    return {
      success: true,
      msg: `Вы успешно приобрели предмет на рынке за $${listing.price} NC!`,
      item: ITEMS_DATABASE.find(i => i.id === listing.itemId)
    };
  }

  // --- BILATERAL P2P TRADE SYSTEM ---

  startTrade(playerA_Name, playerB_Name) {
    this.activeTrade = {
      id: 'trade_' + Date.now(),
      partyA: {
        name: playerA_Name,
        coins: 0,
        items: [],
        ready: false,
        confirmed: false
      },
      partyB: {
        name: playerB_Name,
        coins: 0,
        items: [],
        ready: false,
        confirmed: false
      },
      status: 'active' // 'active', 'completed', 'cancelled'
    };
    return this.activeTrade;
  }

  setOffer(isPartyA, coins, items) {
    if (!this.activeTrade || this.activeTrade.status !== 'active') return;
    const party = isPartyA ? this.activeTrade.partyA : this.activeTrade.partyB;

    party.coins = Math.max(0, Math.round(coins));
    party.items = Array.isArray(items) ? items : [];

    // Reset ready states if offer changes (anti-scam safeguard)
    this.activeTrade.partyA.ready = false;
    this.activeTrade.partyB.ready = false;
    this.activeTrade.partyA.confirmed = false;
    this.activeTrade.partyB.confirmed = false;
  }

  setReady(isPartyA) {
    if (!this.activeTrade) return;
    const party = isPartyA ? this.activeTrade.partyA : this.activeTrade.partyB;
    party.ready = !party.ready;
  }

  confirmTrade(isPartyA, playerCore) {
    if (!this.activeTrade) return false;
    const party = isPartyA ? this.activeTrade.partyA : this.activeTrade.partyB;
    const otherParty = isPartyA ? this.activeTrade.partyB : this.activeTrade.partyA;

    if (!party.ready || !otherParty.ready) return false;
    party.confirmed = true;

    if (this.activeTrade.partyA.confirmed && this.activeTrade.partyB.confirmed) {
      // Execute Atomic Transfer
      this.activeTrade.status = 'completed';

      // Deduct local player assets & give partner assets
      playerCore.neoCoins -= this.activeTrade.partyA.coins;
      this.activeTrade.partyA.items.forEach(it => playerCore.removeItem(it));

      playerCore.neoCoins += this.activeTrade.partyB.coins;
      this.activeTrade.partyB.items.forEach(it => playerCore.addItem(it));

      return true;
    }
    return false;
  }

  cancelTrade() {
    if (this.activeTrade) {
      this.activeTrade.status = 'cancelled';
      this.activeTrade = null;
    }
  }
}
