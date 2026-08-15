/**
 * AMONG US // REALTIME FIRESTORE MULTIPLAYER ENGINE
 * Synchronizes Lobby Waiting Room, Room Status, Roles, and Live Coordinates.
 */

import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  onSnapshot, 
  deleteDoc, 
  serverTimestamp,
  addDoc
} from "./firebase-config.js";

export class MultiplayerManager {
  constructor() {
    this.roomId = null;
    this.playerId = 'p_' + Math.random().toString(36).substring(2, 8);
    this.playerName = 'Оператор';
    this.playerColor = '#c51111';
    this.isHost = false;

    // Remote Players Coordinates & State
    this.remotePlayers = new Map(); // pId -> { name, color, x, y, isAlive }
    this.unsubRoom = null;
    this.unsubPlayers = null;
    this.lastBroadcast = 0;
  }

  generateRoomCode() {
    return 'BCK' + Math.floor(1000 + Math.random() * 9000);
  }

  formatCode(code) {
    return (code || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }

  // 1. CREATE ROOM
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

  // 2. JOIN ROOM
  async joinRoom(roomCode, playerName, playerColor) {
    this.playerName = playerName || this.playerName;
    this.playerColor = playerColor || this.playerColor;
    this.isHost = false;
    const formattedCode = this.formatCode(roomCode);
    this.roomId = formattedCode;

    const roomRef = doc(db, 'backrooms_rooms', this.roomId);
    const snap = await getDoc(roomRef);

    if (!snap.exists()) {
      throw new Error(`Комната ${this.roomId} не найдена! Проверьте код.`);
    }

    const data = snap.data();
    const existingPlayers = data.players || [];

    // Check if player already in list
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

  // 3. LISTEN TO ROOM (WAITING ROOM & START SYNC)
  listenToRoom(roomId, onPlayersChanged, onGameStarted) {
    if (this.unsubRoom) this.unsubRoom();
    const roomRef = doc(db, 'backrooms_rooms', roomId);

    this.unsubRoom = onSnapshot(roomRef, (docSnap) => {
      if (!docSnap.exists()) return;
      const data = docSnap.data();

      // Trigger player list updates in lobby
      if (onPlayersChanged && data.players) {
        onPlayersChanged(data.players);
      }

      // Trigger game start on both Host and Friend screens!
      if (data.status === 'PLAYING' && onGameStarted) {
        onGameStarted(data);
      }
    });
  }

  // 4. START GAME (HOST UPDATES FIRESTORE)
  async startMatchInFirestore(secretPick) {
    if (!this.roomId || !this.isHost) return;
    const roomRef = doc(db, 'backrooms_rooms', this.roomId);
    await updateDoc(roomRef, {
      status: 'PLAYING',
      secretPick: secretPick
    });
  }

  // 5. COORDINATES SYNC
  broadcastPosition(x, y, isAlive) {
    if (!this.roomId) return;
    const now = performance.now();
    if (now - this.lastBroadcast < 90) return; // ~11 updates/sec
    this.lastBroadcast = now;

    const playerDocRef = doc(db, 'backrooms_rooms', this.roomId, 'players', this.playerId);
    setDoc(playerDocRef, {
      id: this.playerId,
      name: this.playerName,
      color: this.playerColor,
      x: Math.round(x),
      y: Math.round(y),
      isAlive: isAlive,
      updatedAt: serverTimestamp()
    }, { merge: true }).catch(() => {});
  }

  listenToRemotePlayers(onRemoteUpdated) {
    if (this.unsubPlayers) this.unsubPlayers();
    const colRef = collection(db, 'backrooms_rooms', this.roomId, 'players');

    this.unsubPlayers = onSnapshot(colRef, (snapshot) => {
      snapshot.forEach(docSnap => {
        const pData = docSnap.data();
        if (pData.id !== this.playerId) {
          this.remotePlayers.set(pData.id, pData);
        }
      });
      if (onRemoteUpdated) onRemoteUpdated(this.remotePlayers);
    });
  }
}
