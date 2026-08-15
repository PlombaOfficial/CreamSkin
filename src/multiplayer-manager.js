/**
 * 2D MINECRAFT // BULLETPROOF MULTIPLAYER & PUBLIC SERVER BROWSER
 * Deduplicated chat, public lobby directory, host session heartbeats,
 * block sync, and player coordinate streaming.
 */

import { 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs,
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

    this.remotePlayers = new Map();
    this.unsubRoom = null;
    this.lastBroadcast = 0;
    this.processedChatIds = new Set();
    this.heartbeatInterval = null;
  }

  generateRoomCode() {
    return 'MC' + Math.floor(1000 + Math.random() * 9000);
  }

  formatCode(code) {
    return (code || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }

  // 1. CREATE PUBLIC MULTIPLAYER WORLD (HOST)
  async createWorld(playerName, playerColor, worldName = 'Мир Выживания', isPublic = true) {
    this.playerName = playerName || this.playerName;
    this.playerColor = playerColor || this.playerColor;
    this.isHost = true;
    this.roomId = this.generateRoomCode();
    this.worldSeed = Math.floor(Math.random() * 999999);

    const roomRef = doc(db, 'minecraft_rooms', this.roomId);
    await setDoc(roomRef, {
      status: 'PLAYING',
      hostId: this.playerId,
      hostName: this.playerName,
      worldName: worldName,
      worldSeed: this.worldSeed,
      isPublic: isPublic,
      players: [
        { id: this.playerId, name: this.playerName, color: this.playerColor, isHost: true }
      ],
      createdAt: serverTimestamp(),
      lastHeartbeat: Date.now()
    });

    // Start Host Heartbeat
    this.startHostHeartbeat();

    return { roomId: this.roomId, seed: this.worldSeed };
  }

  startHostHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      if (!this.roomId || !this.isHost) return;
      const roomRef = doc(db, 'minecraft_rooms', this.roomId);
      updateDoc(roomRef, {
        lastHeartbeat: Date.now()
      }).catch(() => {});
    }, 4000);

    window.addEventListener('beforeunload', () => {
      if (this.isHost && this.roomId) {
        const roomRef = doc(db, 'minecraft_rooms', this.roomId);
        updateDoc(roomRef, { status: 'CLOSED', isPublic: false }).catch(() => {});
      }
    });
  }

  // 2. JOIN WORLD (BY CODE OR FROM BROWSER)
  async joinWorld(roomCode, playerName, playerColor) {
    this.playerName = playerName || this.playerName;
    this.playerColor = playerColor || this.playerColor;
    this.isHost = false;
    this.roomId = this.formatCode(roomCode);

    const roomRef = doc(db, 'minecraft_rooms', this.roomId);
    const snap = await getDoc(roomRef);

    if (!snap.exists()) {
      throw new Error(`Мир ${this.roomId} не найден!`);
    }

    const data = snap.data();
    if (data.status === 'CLOSED') {
      throw new Error('Этот мир был закрыт хостом.');
    }

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

  // 3. BROWSE PUBLIC SERVERS
  async getPublicWorlds() {
    try {
      const q = query(
        collection(db, 'minecraft_rooms'), 
        where('isPublic', '==', true),
        where('status', '==', 'PLAYING')
      );
      const snapshot = await getDocs(q);
      const worlds = [];
      const now = Date.now();

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        // Check heartbeat freshness (within 20s)
        if (data.lastHeartbeat && (now - data.lastHeartbeat < 20000)) {
          worlds.push({
            roomId: docSnap.id,
            name: data.worldName || 'Мир Выживания',
            hostName: data.hostName || 'Хост',
            playerCount: data.players ? data.players.length : 1
          });
        }
      });
      return worlds;
    } catch (e) {
      console.warn('Get public worlds failed:', e);
      return [];
    }
  }

  // 4. LISTEN TO REALTIME WORLD
  listenToWorld(roomId, onBlockChange, onPlayersChange, onChatMessage, onHostLeft) {
    if (this.unsubRoom) this.unsubRoom();
    this.roomId = roomId;
    const roomRef = doc(db, 'minecraft_rooms', roomId);

    this.unsubRoom = onSnapshot(roomRef, (docSnap) => {
      if (!docSnap.exists()) {
        if (onHostLeft) onHostLeft();
        return;
      }
      const data = docSnap.data();

      if (data.status === 'CLOSED') {
        if (onHostLeft) onHostLeft();
        return;
      }

      // Blocks
      Object.keys(data).forEach(key => {
        if (key.startsWith('blk_')) {
          const [bx, by] = key.replace('blk_', '').split('_').map(Number);
          const blockId = data[key];
          if (onBlockChange) onBlockChange(bx, by, blockId);
        }
      });

      // Players
      Object.keys(data).forEach(key => {
        if (key.startsWith('pos_')) {
          const pId = key.replace('pos_', '');
          if (pId !== this.playerId) {
            this.remotePlayers.set(pId, data[key]);
          }
        }
      });
      if (onPlayersChange) onPlayersChange(this.remotePlayers);

      // Chat (Deduplicated with Unique ID)
      if (data.lastChat && data.lastChat.id) {
        if (!this.processedChatIds.has(data.lastChat.id)) {
          this.processedChatIds.add(data.lastChat.id);
          if (onChatMessage) onChatMessage(data.lastChat);
        }
      }
    }, (err) => {
      console.error('Multiplayer listen error:', err);
    });
  }

  // 5. BROADCASTS
  broadcastBlock(x, y, blockId) {
    if (!this.roomId) return;
    const roomRef = doc(db, 'minecraft_rooms', this.roomId);
    const key = `blk_${Math.round(x)}_${Math.round(y)}`;
    updateDoc(roomRef, { [key]: blockId }).catch(() => {});
  }

  broadcastPlayer(x, y, facing, heldId, isAlive) {
    if (!this.roomId) return;
    const now = performance.now();
    if (now - this.lastBroadcast < 80) return;
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

  sendChat(text) {
    if (!this.roomId || !text) return;
    const roomRef = doc(db, 'minecraft_rooms', this.roomId);
    const chatId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    this.processedChatIds.add(chatId);

    updateDoc(roomRef, {
      lastChat: {
        id: chatId,
        sender: this.playerName,
        text: text,
        timestamp: Date.now()
      }
    }).catch(() => {});
  }
}
