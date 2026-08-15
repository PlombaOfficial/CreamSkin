/**
 * AMONG US // BULLETPROOF REALTIME FIRESTORE MULTIPLAYER ENGINE
 * Single-Document Realtime Sync for Rooms, Lobby, Match Start, and Live Coordinates.
 */

import { 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp 
} from "./firebase-config.js";

export class MultiplayerManager {
  constructor() {
    this.roomId = null;
    this.playerId = 'p_' + Math.random().toString(36).substring(2, 8);
    this.playerName = 'Оператор';
    this.playerColor = '#c51111';
    this.isHost = false;

    // Remote Players State
    this.remotePlayers = new Map(); // pId -> { name, color, x, y, isAlive }
    this.remoteBots = []; // Synced from Host if client
    this.unsubRoom = null;
    this.lastBroadcast = 0;
  }

  generateRoomCode() {
    return 'BCK' + Math.floor(1000 + Math.random() * 9000);
  }

  formatCode(code) {
    return (code || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }

  // 1. CREATE ROOM (HOST)
  async createRoom(playerName, playerColor) {
    this.playerName = playerName || this.playerName;
    this.playerColor = playerColor || this.playerColor;
    this.isHost = true;
    this.roomId = this.generateRoomCode();

    const roomRef = doc(db, 'backrooms_rooms', this.roomId);
    await setDoc(roomRef, {
      status: 'LOBBY',
      hostId: this.playerId,
      players: [
        { id: this.playerId, name: this.playerName, color: this.playerColor, isHost: true }
      ],
      secretPick: 0,
      createdAt: serverTimestamp()
    });

    return this.roomId;
  }

  // 2. JOIN ROOM (FRIEND)
  async joinRoom(roomCode, playerName, playerColor) {
    this.playerName = playerName || this.playerName;
    this.playerColor = playerColor || this.playerColor;
    this.isHost = false;
    this.roomId = this.formatCode(roomCode);

    const roomRef = doc(db, 'backrooms_rooms', this.roomId);
    const snap = await getDoc(roomRef);

    if (!snap.exists()) {
      throw new Error(`Комната ${this.roomId} не найдена! Проверьте правильность кода.`);
    }

    const data = snap.data();
    const existingPlayers = data.players || [];

    const alreadyIn = existingPlayers.find(p => p.id === this.playerId);
    if (!alreadyIn) {
      existingPlayers.push({
        id: this.playerId,
        name: this.playerName,
        color: this.playerColor,
        isHost: false
      });
      await updateDoc(roomRef, { players: existingPlayers });
    }

    return this.roomId;
  }

  // 3. LISTEN TO ROOM (LOBBY + GAME START + LIVE PLAYER COORDINATES)
  listenToRoom(roomId, onPlayersChanged, onGameStarted, onSyncReceived) {
    if (this.unsubRoom) this.unsubRoom();
    this.roomId = roomId;
    const roomRef = doc(db, 'backrooms_rooms', roomId);

    this.unsubRoom = onSnapshot(roomRef, (docSnap) => {
      if (!docSnap.exists()) return;
      const data = docSnap.data();

      // A. Lobby player updates
      if (onPlayersChanged && data.players) {
        onPlayersChanged(data.players);
      }

      // B. Game start signal
      if (data.status === 'PLAYING' && onGameStarted) {
        onGameStarted(data);
      }

      // C. Live Player & Bot Coordinates Sync
      Object.keys(data).forEach(key => {
        if (key.startsWith('pos_')) {
          const pId = key.replace('pos_', '');
          if (pId !== this.playerId) {
            const pInfo = data[key];
            this.remotePlayers.set(pId, pInfo);
          }
        }
      });

      if (!this.isHost && data.syncedBots) {
        this.remoteBots = data.syncedBots;
      }

      if (onSyncReceived) {
        onSyncReceived(this.remotePlayers, this.remoteBots);
      }
    }, (err) => {
      console.error('Firestore listen error:', err);
    });
  }

  // 4. START MATCH IN FIRESTORE
  async startMatchInFirestore(secretPick) {
    if (!this.roomId) return;
    const roomRef = doc(db, 'backrooms_rooms', this.roomId);
    await updateDoc(roomRef, {
      status: 'PLAYING',
      secretPick: secretPick
    });
  }

  // 5. BROADCAST LIVE COORDINATES
  broadcastPosition(x, y, isAlive, bots = null) {
    if (!this.roomId) return;
    const now = performance.now();
    if (now - this.lastBroadcast < 80) return; // ~12 updates/sec
    this.lastBroadcast = now;

    const roomRef = doc(db, 'backrooms_rooms', this.roomId);
    const updatePayload = {
      ['pos_' + this.playerId]: {
        id: this.playerId,
        name: this.playerName,
        color: this.playerColor,
        x: Math.round(x),
        y: Math.round(y),
        isAlive: isAlive
      }
    };

    if (this.isHost && bots) {
      updatePayload.syncedBots = bots.map(b => ({
        id: b.id,
        name: b.name,
        color: b.color,
        x: Math.round(b.x),
        y: Math.round(b.y),
        isAlive: b.isAlive,
        isImpostor: b.isImpostor,
        speechBubble: b.speechBubble
      }));
    }

    updateDoc(roomRef, updatePayload).catch(() => {});
  }
}
