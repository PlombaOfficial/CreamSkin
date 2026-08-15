/**
 * NEO-CLICKER ONLINE // REAL FIREBASE FIRESTORE MULTIPLAYER ENGINE
 * Synchronizes real humans playing on different devices:
 * 1. Global Live Chat in real-time.
 * 2. Active Online Players list with live heartbeats.
 * 3. Live P2P Marketplace listings across all players.
 * 4. Real-time P2P Trade rooms.
 */

import { FIREBASE_CONFIG } from "./firebase-config.js";

export class RealMultiplayerSync {
  constructor(onRemoteChatMsg, onRemoteOnlinePlayers, onRemoteMarketUpdate) {
    this.onRemoteChatMsg = onRemoteChatMsg;
    this.onRemoteOnlinePlayers = onRemoteOnlinePlayers;
    this.onRemoteMarketUpdate = onRemoteMarketUpdate;
    this.db = null;
    this.isOnline = false;
    this.playerId = 'p_' + Math.random().toString(36).substr(2, 9);
    this.heartbeatTimer = null;

    this.initFirebase();
  }

  initFirebase() {
    try {
      if (window.firebase) {
        if (!firebase.apps.length) {
          firebase.initializeApp(FIREBASE_CONFIG);
        }
        this.db = firebase.firestore();
        this.isOnline = true;
        this.startListeners();
      }
    } catch (e) {
      console.warn('Firebase init fallback to local:', e);
    }
  }

  startListeners() {
    if (!this.db) return;

    // 1. Live Real Global Chat Listener
    try {
      this.db.collection('neo_chat')
        .orderBy('timestamp', 'desc')
        .limit(30)
        .onSnapshot(snapshot => {
          snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
              const data = change.doc.data();
              if (this.onRemoteChatMsg && data) {
                this.onRemoteChatMsg(data);
              }
            }
          });
        }, () => {});
    } catch (e) {}

    // 2. Live Online Players Listener
    try {
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;
      this.db.collection('neo_online')
        .where('lastSeen', '>=', fiveMinAgo)
        .onSnapshot(snapshot => {
          const players = [];
          snapshot.forEach(doc => players.push(doc.data()));
          if (this.onRemoteOnlinePlayers) {
            this.onRemoteOnlinePlayers(players);
          }
        }, () => {});
    } catch (e) {}

    // 3. Live Marketplace Listener
    try {
      this.db.collection('neo_market')
        .orderBy('time', 'desc')
        .limit(40)
        .onSnapshot(snapshot => {
          const listings = [];
          snapshot.forEach(doc => listings.push({ id: doc.id, ...doc.data() }));
          if (this.onRemoteMarketUpdate && listings.length > 0) {
            this.onRemoteMarketUpdate(listings);
          }
        }, () => {});
    } catch (e) {}
  }

  // --- ACTIONS ---

  broadcastChatMessage(sender, clanTag, title, text, channel = 'global') {
    if (!this.db) return;
    try {
      this.db.collection('neo_chat').add({
        channel,
        sender,
        clanTag: clanTag || null,
        title: title || null,
        text,
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }).catch(() => {});
    } catch (e) {}
  }

  sendHeartbeat(playerCore, clanSystem) {
    if (!this.db) return;
    const clan = clanSystem.clans.get(playerCore.clanId);
    const clanTag = clan ? clan.tag : null;

    try {
      this.db.collection('neo_online').doc(this.playerId).set({
        id: this.playerId,
        name: playerCore.name,
        clan: clanTag,
        title: playerCore.equippedTitle ? 'МАГНАТ' : null,
        level: playerCore.clickLevel,
        coins: playerCore.neoCoins,
        isReal: true,
        lastSeen: Date.now()
      }, { merge: true }).catch(() => {});
    } catch (e) {}
  }

  syncMarketListing(listing) {
    if (!this.db) return;
    try {
      this.db.collection('neo_market').doc(listing.id).set(listing).catch(() => {});
    } catch (e) {}
  }

  removeMarketListing(listingId) {
    if (!this.db) return;
    try {
      this.db.collection('neo_market').doc(listingId).delete().catch(() => {});
    } catch (e) {}
  }
}
