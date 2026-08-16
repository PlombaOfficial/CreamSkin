import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, firestore } from './FirebaseConfig';
import { RemotePlayerState, BlockDelta, ChatMessage } from '../types';

export class FirebaseService {
  public currentUser: User | null = null;
  public username: string = 'Steve';
  public roomId: string = 'main_world';
  public isOnline: boolean = false;

  private playerListeners: (() => void) | null = null;
  private blockListeners: (() => void) | null = null;
  private chatListeners: (() => void) | null = null;

  private lastSyncTime: number = 0;
  private pendingBlockDeltas: BlockDelta[] = [];

  constructor() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        this.isOnline = true;
        this.username = user.displayName || `Player_${user.uid.slice(0, 4)}`;
      } else {
        this.isOnline = false;
      }
    });
  }

  public async loginAnonymous(customName: string = 'Explorer'): Promise<User> {
    try {
      const cred = await signInAnonymously(auth);
      this.currentUser = cred.user;
      this.username = customName || `Player_${cred.user.uid.slice(0, 4)}`;
      this.isOnline = true;
      return cred.user;
    } catch (err) {
      console.warn('Anonymous Firebase auth failed, continuing in offline mode:', err);
      throw err;
    }
  }

  public async loginWithEmail(email: string, pass: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    this.currentUser = cred.user;
    this.username = cred.user.displayName || email.split('@')[0];
    this.isOnline = true;
    return cred.user;
  }

  public async registerWithEmail(email: string, pass: string, name: string): Promise<User> {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    this.currentUser = cred.user;
    this.username = name || email.split('@')[0];
    this.isOnline = true;
    return cred.user;
  }

  public async logout() {
    await signOut(auth);
    this.currentUser = null;
    this.isOnline = false;
    this.cleanupListeners();
  }

  /**
   * Broadcast local player state (throttled to 10Hz)
   */
  public async syncPlayerState(state: Omit<RemotePlayerState, 'uid' | 'username' | 'lastUpdated'>) {
    if (!this.currentUser || !this.isOnline) return;

    const now = Date.now();
    if (now - this.lastSyncTime < 100) return; // 10Hz max
    this.lastSyncTime = now;

    try {
      const playerDoc = doc(firestore, `rooms/${this.roomId}/players`, this.currentUser.uid);
      await setDoc(playerDoc, {
        uid: this.currentUser.uid,
        username: this.username,
        ...state,
        lastUpdated: now,
      }, { merge: true });
    } catch (e) {
      // Ignore network hiccup
    }
  }

  /**
   * Listen to other active players in room
   */
  public subscribeToPlayers(onPlayersUpdated: (players: RemotePlayerState[]) => void) {
    if (!this.isOnline) return;
    const playersCol = collection(firestore, `rooms/${this.roomId}/players`);

    this.playerListeners = onSnapshot(playersCol, (snapshot) => {
      const activePlayers: RemotePlayerState[] = [];
      const now = Date.now();

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as RemotePlayerState;
        // Don't include self and ignore stale players (>30 seconds inactive)
        if (data.uid !== this.currentUser?.uid && (now - (data.lastUpdated || 0) < 30000)) {
          activePlayers.push(data);
        }
      });

      onPlayersUpdated(activePlayers);
    }, (err) => {
      console.warn('Players snapshot listener error:', err);
    });
  }

  /**
   * Queue modified block delta and batch sync
   */
  public recordBlockDelta(delta: BlockDelta) {
    this.pendingBlockDeltas.push(delta);
    if (this.pendingBlockDeltas.length >= 5) {
      this.flushBlockDeltas();
    }
  }

  public async flushBlockDeltas() {
    if (!this.isOnline || !this.currentUser || this.pendingBlockDeltas.length === 0) return;

    const deltasToSend = [...this.pendingBlockDeltas];
    this.pendingBlockDeltas = [];

    try {
      const deltasCol = collection(firestore, `rooms/${this.roomId}/blocks`);
      for (const d of deltasToSend) {
        await addDoc(deltasCol, {
          ...d,
          createdAt: serverTimestamp(),
        });
      }
    } catch (e) {
      console.warn('Failed to flush block deltas:', e);
    }
  }

  /**
   * Listen to block modifications made by other players
   */
  public subscribeToBlockDeltas(onDeltaReceived: (delta: BlockDelta) => void) {
    if (!this.isOnline) return;
    const deltasCol = collection(firestore, `rooms/${this.roomId}/blocks`);
    const q = query(deltasCol, orderBy('timestamp', 'desc'), limit(50));

    this.blockListeners = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data() as BlockDelta;
          if (data.playerUid !== this.currentUser?.uid) {
            onDeltaReceived(data);
          }
        }
      });
    }, (err) => {
      console.warn('Block deltas listener error:', err);
    });
  }

  /**
   * Send global chat message with anti-spam check
   */
  public async sendChatMessage(text: string): Promise<boolean> {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 200) return false;

    try {
      const chatCol = collection(firestore, `rooms/${this.roomId}/chat`);
      await addDoc(chatCol, {
        senderUid: this.currentUser?.uid || 'guest',
        senderName: this.username,
        text: trimmed,
        timestamp: Date.now(),
      });
      return true;
    } catch (e) {
      console.warn('Chat send error:', e);
      return false;
    }
  }

  /**
   * Subscribe to global chat messages
   */
  public subscribeToChat(onMessageReceived: (msg: ChatMessage) => void) {
    const chatCol = collection(firestore, `rooms/${this.roomId}/chat`);
    const q = query(chatCol, orderBy('timestamp', 'desc'), limit(30));

    this.chatListeners = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          onMessageReceived({
            id: change.doc.id,
            senderUid: data.senderUid,
            senderName: data.senderName,
            text: data.text,
            timestamp: data.timestamp,
            isSystem: data.isSystem,
          });
        }
      });
    }, (err) => {
      console.warn('Chat listener error:', err);
    });
  }

  public cleanupListeners() {
    if (this.playerListeners) this.playerListeners();
    if (this.blockListeners) this.blockListeners();
    if (this.chatListeners) this.chatListeners();
    this.playerListeners = null;
    this.blockListeners = null;
    this.chatListeners = null;
  }
}

export const firebaseService = new FirebaseService();
