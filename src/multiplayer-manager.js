/**
 * 3D MINECRAFT // MULTIPLAYER MANAGER
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

  async createWorld(playerName, playerColor, worldName = '3D Мир', isPublic = true) {
    this.playerName = playerName || this.playerName;
    this.playerColor = playerColor || this.playerColor;
    this.isHost = true;
    this.roomId = this.generateRoomCode();
    this.worldSeed = Math.floor(Math.random() * 999999);

    if (db) {
      try {
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
        this.startHostHeartbeat();
      } catch (e) {
        console.warn('Firestore create world failed:', e);
      }
    }

    return { roomId: this.roomId, seed: this.worldSeed };
  }

  startHostHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      if (!this.roomId || !this.isHost || !db) return;
      const roomRef = doc(db, 'minecraft_rooms', this.roomId);
      updateDoc(roomRef, { lastHeartbeat: Date.now() }).catch(() => {});
    }, 4000);
  }

  async joinWorld(roomCode, playerName, playerColor) {
    this.playerName = playerName || this.playerName;
    this.playerColor = playerColor || this.playerColor;
    this.isHost = false;
    this.roomId = this.formatCode(roomCode);

    if (db) {
      try {
        const roomRef = doc(db, 'minecraft_rooms', this.roomId);
        const snap = await getDoc(roomRef);

        if (snap && snap.exists()) {
          const data = snap.data();
          this.worldSeed = data.worldSeed || 12345;
          const existingPlayers = data.players || [];
          const alreadyIn = existingPlayers.find(p => p.id === this.playerId);
          if (!alreadyIn) {
            existingPlayers.push({ id: this.playerId, name: this.playerName, color: this.playerColor, isHost: false });
            updateDoc(roomRef, { players: existingPlayers }).catch(() => {});
          }
        }
      } catch (e) {
        console.warn('Join world failed:', e);
      }
    }

    return { roomId: this.roomId, seed: this.worldSeed };
  }

  async getPublicWorlds() {
    if (!db) return [];
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
        if (data.lastHeartbeat && (now - data.lastHeartbeat < 25000)) {
          worlds.push({
            roomId: docSnap.id,
            name: data.worldName || '3D Мир',
            hostName: data.hostName || 'Хост',
            playerCount: data.players ? data.players.length : 1
          });
        }
      });
      return worlds;
    } catch (e) {
      return [];
    }
  }

  listenToWorld(roomId, onBlockChange, onPlayersChange, onChatMessage, onHostLeft) {
    if (!db) return;
    this.roomId = roomId;
    const roomRef = doc(db, 'minecraft_rooms', roomId);

    this.unsubRoom = onSnapshot(roomRef, (docSnap) => {
      if (!docSnap || !docSnap.exists()) return;
      const data = docSnap.data();
      if (data.status === 'CLOSED' && onHostLeft) onHostLeft();

      Object.keys(data).forEach(key => {
        if (key.startsWith('blk_')) {
          const [bx, by] = key.replace('blk_', '').split('_').map(Number);
          if (onBlockChange) onBlockChange(bx, by, data[key]);
        } else if (key.startsWith('pos_')) {
          const pId = key.replace('pos_', '');
          if (pId !== this.playerId) this.remotePlayers.set(pId, data[key]);
        }
      });

      if (onPlayersChange) onPlayersChange(this.remotePlayers);

      if (data.lastChat && data.lastChat.id) {
        if (!this.processedChatIds.has(data.lastChat.id)) {
          this.processedChatIds.add(data.lastChat.id);
          if (onChatMessage) onChatMessage(data.lastChat);
        }
      }
    }, () => {});
  }

  broadcastBlock(x, y, blockId) {
    if (!this.roomId || !db) return;
    const roomRef = doc(db, 'minecraft_rooms', this.roomId);
    const key = `blk_${Math.round(x)}_${Math.round(y)}`;
    updateDoc(roomRef, { [key]: blockId }).catch(() => {});
  }

  broadcastPlayer(x, y, facing, heldId, isAlive) {
    if (!this.roomId || !db) return;
    const now = performance.now();
    if (now - this.lastBroadcast < 80) return;
    this.lastBroadcast = now;

    const roomRef = doc(db, 'minecraft_rooms', this.roomId);
    updateDoc(roomRef, {
      [`pos_${this.playerId}`]: {
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
    if (!this.roomId || !text || !db) return;
    const roomRef = doc(db, 'minecraft_rooms', this.roomId);
    const chatId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    this.processedChatIds.add(chatId);

    updateDoc(roomRef, {
      lastChat: { id: chatId, sender: this.playerName, text: text, timestamp: Date.now() }
    }).catch(() => {});
  }
}
