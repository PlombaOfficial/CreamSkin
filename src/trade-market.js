/**
 * NEO-CLICKER ONLINE // BILATERAL P2P TRADE & OPEN MARKETPLACE ENGINE
 * 1. Interactive 2-Sided Secure Bilateral Trade with Item Slot Staging.
 * 2. Global Player Marketplace for listing & purchasing items with category filters.
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
      { id: 'm_1', seller: 'Alex_Pro', itemId: 'gpu_rtx', price: 1400, time: Date.now() },
      { id: 'm_2', seller: 'FlameMaster', itemId: 'cyber_glove', price: 550, time: Date.now() },
      { id: 'm_3', seller: 'SunGoddess', itemId: 'golden_touch', price: 8000, time: Date.now() },
      { id: 'm_4', seller: 'Matrix_King', itemId: 'aura_cyber', price: 1900, time: Date.now() },
      { id: 'm_5', seller: 'ByteHunter', itemId: 'frame_gold', price: 1700, time: Date.now() }
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

  // --- INTERACTIVE BILATERAL P2P TRADE SYSTEM ---

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
        coins: 1500,
        items: ['gpu_rtx'],
        ready: true,
        confirmed: false
      },
      status: 'active'
    };
    return this.activeTrade;
  }

  addItemToTrade(itemId, playerCore) {
    if (!this.activeTrade || this.activeTrade.status !== 'active') return;
    if (!playerCore.inventory.includes(itemId)) return;

    this.activeTrade.partyA.items.push(itemId);
    this.resetReadyStates();
  }

  removeItemFromTrade(index) {
    if (!this.activeTrade || this.activeTrade.status !== 'active') return;
    if (index >= 0 && index < this.activeTrade.partyA.items.length) {
      this.activeTrade.partyA.items.splice(index, 1);
      this.resetReadyStates();
    }
  }

  setCoinsOffer(amount) {
    if (!this.activeTrade || this.activeTrade.status !== 'active') return;
    this.activeTrade.partyA.coins = Math.max(0, Math.round(amount));
    this.resetReadyStates();
  }

  resetReadyStates() {
    if (this.activeTrade) {
      this.activeTrade.partyA.ready = false;
      this.activeTrade.partyB.ready = false;
      this.activeTrade.partyA.confirmed = false;
      this.activeTrade.partyB.confirmed = false;

      // Bot adjusts its counter-offer and sets ready after a brief moment
      setTimeout(() => {
        if (this.activeTrade) {
          this.activeTrade.partyB.ready = true;
        }
      }, 800);
    }
  }

  toggleReady() {
    if (!this.activeTrade) return;
    this.activeTrade.partyA.ready = !this.activeTrade.partyA.ready;
  }

  canConfirm() {
    if (!this.activeTrade) return false;
    return this.activeTrade.partyA.ready && this.activeTrade.partyB.ready;
  }

  confirmAndExecuteTrade(playerCore) {
    if (!this.canConfirm()) return false;

    const trade = this.activeTrade;
    if (playerCore.neoCoins < trade.partyA.coins) {
      alert('У вас недостаточно монет для этого предложения!');
      return false;
    }

    trade.status = 'completed';

    // Transfer A -> Deduct coins & items
    playerCore.neoCoins -= trade.partyA.coins;
    trade.partyA.items.forEach(itId => playerCore.removeItem(itId));

    // Transfer B -> Give partner coins & items
    playerCore.neoCoins += trade.partyB.coins;
    trade.partyB.items.forEach(itId => playerCore.addItem(itId));

    return true;
  }

  cancelTrade() {
    if (this.activeTrade) {
      this.activeTrade.status = 'cancelled';
      this.activeTrade = null;
    }
  }
}
