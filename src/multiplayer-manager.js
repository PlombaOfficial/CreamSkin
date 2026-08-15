/**
 * 2D MINECRAFT // REALTIME FIRESTORE MULTIPLAYER ENGINE
 * Realtime Block Placements/Breaking Sync, Seed Replication,
 * Player Movement Streaming, and In-Game Chat.
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

export class MinecraftMultiplayerManager {
  constructor() {
    this.roomId = null;
    this.playerId = 'p_' + Math.random().toString(36).substring(2, 8);
    this.playerName = 'Стив';
    this.playerColor = '#00aaaa';
    this.isHost = false;
    this.worldSeed = 12345;

    this.remotePlayers = new Map(); // pId -> { name, color, x, y, facing, heldId, isAlive }
    this.unsubRoom = null;
    this.lastBroadcast = 0;
    this.pendingBlockUpdates = [];
  }

  generateRoomCode() {
    return 'MC' + Math.floor(1000 + Math.random() * 9000);
  }

  formatCode(code) {
    return (code || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }

  // 1. CREATE MULTIPLAYER WORLD (HOST)
  async createWorld(playerName, playerColor) {
    this.playerName = playerName || this.playerName;
    this.playerColor = playerColor || this.playerColor;
    this.isHost = true;
    this.roomId = this.generateRoomCode();
    this.worldSeed = Math.floor(Math.random() * 999999);

    const roomRef = doc(db, 'minecraft_rooms', this.roomId);
    await setDoc(roomRef, {
      status: 'PLAYING',
      hostId: this.playerId,
      worldSeed: this.worldSeed,
      players: [
        { id: this.playerId, name: this.playerName, color: this.playerColor, isHost: true }
      ],
      createdAt: serverTimestamp()
    });

    return { roomId: this.roomId, seed: this.worldSeed };
  }

  // 2. JOIN MULTIPLAYER WORLD (FRIEND)
  async joinWorld(roomCode, playerName, playerColor) {
    this.playerName = playerName || this.playerName;
    this.playerColor = playerColor || this.playerColor;
    this.isHost = false;
    this.roomId = this.formatCode(roomCode);

    const roomRef = doc(db, 'minecraft_rooms', this.roomId);
    const snap = await getDoc(roomRef);

    if (!snap.exists()) {
      throw new Error(`Мир ${this.roomId} не найден! Проверьте правильность кода.`);
    }

    const data = snap.data();
    this.worldSeed = data.worldSeed || 12345;
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

    return { roomId: this.roomId, seed: this.worldSeed };
  }

  // 3. LISTEN TO REALTIME WORLD (BLOCKS + PLAYERS + CHAT)
  listenToWorld(roomId, onBlockChange, onPlayersChange, onChatMessage) {
    if (this.unsubRoom) this.unsubRoom();
    this.roomId = roomId;
    const roomRef = doc(db, 'minecraft_rooms', roomId);

    this.unsubRoom = onSnapshot(roomRef, (docSnap) => {
      if (!docSnap.exists()) return;
      const data = docSnap.data();

      // A. Extract and apply real-time Block Changes
      Object.keys(data).forEach(key => {
        if (key.startsWith('blk_')) {
          const [bx, by] = key.replace('blk_', '').split('_').map(Number);
          const blockId = data[key];
          if (onBlockChange) {
            onBlockChange(bx, by, blockId);
          }
        }
      });

      // B. Extract Remote Players Coordinates
      Object.keys(data).forEach(key => {
        if (key.startsWith('pos_')) {
          const pId = key.replace('pos_', '');
          if (pId !== this.playerId) {
            this.remotePlayers.set(pId, data[key]);
          }
        }
      });

      if (onPlayersChange) {
        onPlayersChange(this.remotePlayers);
      }

      // C. In-Game Chat
      if (data.lastChat && onChatMessage) {
        onChatMessage(data.lastChat);
      }
    }, (err) => {
      console.error('Multiplayer listen error:', err);
    });
  }

  // 4. BROADCAST BLOCK PLACED / BROKEN
  broadcastBlock(x, y, blockId) {
    if (!this.roomId) return;
    const roomRef = doc(db, 'minecraft_rooms', this.roomId);
    const key = `blk_${Math.round(x)}_${Math.round(y)}`;

    updateDoc(roomRef, {
      [key]: blockId
    }).catch(() => {});
  }

  // 5. BROADCAST PLAYER COORDINATES
  broadcastPlayer(x, y, facing, heldId, isAlive) {
    if (!this.roomId) return;
    const now = performance.now();
    if (now - this.lastBroadcast < 80) return; // ~12 updates/sec
    this.lastBroadcast = now;

    const roomRef = doc(db, 'minecraft_rooms', this.roomId);
    const key = `pos_${this.playerId}`;

    updateDoc(roomRef, {
      [key]: {
        id: this.playerId,
        name: this.playerName,
        color: this.playerColor,
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        facing: facing,
        heldId: heldId,
        isAlive: isAlive
      }
    }).catch(() => {});
  }

  // 6. SEND CHAT MESSAGE
  sendChat(text) {
    if (!this.roomId || !text) return;
    const roomRef = doc(db, 'minecraft_rooms', this.roomId);
    updateDoc(roomRef, {
      lastChat: {
        sender: this.playerName,
        text: text,
        timestamp: Date.now()
      }
    }).catch(() => {});
  }
}
