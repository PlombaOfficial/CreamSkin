/**
 * NEO-CLICKER ONLINE // REAL FIREBASE FIRESTORE MULTIPLAYER ENGINE
 * Synchronizes real humans playing on different devices:
 * 1. Global Live Chat in real-time.
 * 2. Active Online Players list with live heartbeats.
 * 3. Live P2P Marketplace listings across all players.
 */

import {
  db,
  collection,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit
} from "./firebase-config.js";

export class RealMultiplayerSync {
  constructor(onRemoteChatMsg, onRemoteOnlinePlayers, onRemoteMarketUpdate) {
    this.onRemoteChatMsg = onRemoteChatMsg;
    this.onRemoteOnlinePlayers = onRemoteOnlinePlayers;
    this.onRemoteMarketUpdate = onRemoteMarketUpdate;
    this.playerId = 'p_' + Math.random().toString(36).substr(2, 9);

    this.startListeners();
  }

  startListeners() {
    if (!db) return;

    // 1. Live Real Global Chat Listener
    try {
      const chatQuery = query(collection(db, 'neo_chat'), orderBy('timestamp', 'desc'), limit(30));
      onSnapshot(chatQuery, snapshot => {
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
      const onlineQuery = query(collection(db, 'neo_online'), where('lastSeen', '>=', fiveMinAgo));
      onSnapshot(onlineQuery, snapshot => {
        const players = [];
        snapshot.forEach(docSnap => players.push(docSnap.data()));
        if (this.onRemoteOnlinePlayers && players.length > 0) {
          this.onRemoteOnlinePlayers(players);
        }
      }, () => {});
    } catch (e) {}

    // 3. Live Marketplace Listener
    try {
      const marketQuery = query(collection(db, 'neo_market'), orderBy('time', 'desc'), limit(40));
      onSnapshot(marketQuery, snapshot => {
        const listings = [];
        snapshot.forEach(docSnap => listings.push({ id: docSnap.id, ...docSnap.data() }));
        if (this.onRemoteMarketUpdate && listings.length > 0) {
          this.onRemoteMarketUpdate(listings);
        }
      }, () => {});
    } catch (e) {}
  }

  // --- ACTIONS ---

  broadcastChatMessage(sender, clanTag, title, text, channel = 'global') {
    if (!db) return;
    try {
      addDoc(collection(db, 'neo_chat'), {
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
    if (!db) return;
    const clan = clanSystem.clans.get(playerCore.clanId);
    const clanTag = clan ? clan.tag : null;

    try {
      setDoc(doc(db, 'neo_online', this.playerId), {
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
    if (!db) return;
    try {
      setDoc(doc(db, 'neo_market', listing.id), listing).catch(() => {});
    } catch (e) {}
  }

  removeMarketListing(listingId) {
    if (!db) return;
    try {
      deleteDoc(doc(db, 'neo_market', listingId)).catch(() => {});
    } catch (e) {}
  }
}
