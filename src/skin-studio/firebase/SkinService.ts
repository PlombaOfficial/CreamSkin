import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  increment,
  onSnapshot,
} from 'firebase/firestore';
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, firestore } from './FirebaseConfig';
import {
  SkinMetadata,
  CommentItem,
  UserProfile,
  DirectMessage,
  ReportItem,
} from '../types';

export class SkinService {
  public currentUser: User | null = null;
  public userProfile: UserProfile | null = null;

  constructor() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        await this.loadOrCreateUserProfile(user);
      } else {
        this.userProfile = null;
      }
    });
  }

  public async loginAnonymous(customName: string = 'Crafter'): Promise<User> {
    const cred = await signInAnonymously(auth);
    this.currentUser = cred.user;
    await this.loadOrCreateUserProfile(cred.user, customName);
    return cred.user;
  }

  public async loginWithEmail(email: string, pass: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    this.currentUser = cred.user;
    await this.loadOrCreateUserProfile(cred.user);
    return cred.user;
  }

  public async registerWithEmail(email: string, pass: string, name: string): Promise<User> {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    this.currentUser = cred.user;
    await this.loadOrCreateUserProfile(cred.user, name);
    return cred.user;
  }

  public async logout() {
    await signOut(auth);
    this.currentUser = null;
    this.userProfile = null;
  }

  public async loadOrCreateUserProfile(user: User, preferredName?: string): Promise<UserProfile> {
    try {
      const userRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        this.userProfile = snap.data() as UserProfile;
      } else {
        const newProfile: UserProfile = {
          uid: user.uid,
          username: preferredName || user.displayName || `Crafter_${user.uid.slice(0, 4)}`,
          bio: 'Minecraft skin designer & creator.',
          likedSkinIds: [],
          favoriteSkinIds: [],
          followingUids: [],
          followersCount: 0,
          publishedCount: 0,
          createdAt: Date.now(),
        };
        await setDoc(userRef, newProfile);
        this.userProfile = newProfile;
      }
      return this.userProfile!;
    } catch {
      const fallback: UserProfile = {
        uid: user.uid,
        username: preferredName || 'Crafter',
        likedSkinIds: [],
        favoriteSkinIds: [],
        followingUids: [],
        followersCount: 0,
        publishedCount: 0,
        createdAt: Date.now(),
      };
      this.userProfile = fallback;
      return fallback;
    }
  }

  /**
   * Fetch any public user profile by UID (accessible to guests without login)
   */
  public async getPublicUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(firestore, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch {}

    // Check local published fallback
    try {
      const local = JSON.parse(localStorage.getItem('local_published_skins') || '[]');
      const match = local.find((s: SkinMetadata) => s.authorUid === uid);
      if (match) {
        return {
          uid,
          username: match.authorName,
          bio: 'Community Creator',
          likedSkinIds: [],
          favoriteSkinIds: [],
          followingUids: [],
          followersCount: 0,
          publishedCount: 1,
          createdAt: match.createdAt,
        };
      }
    } catch {}

    return null;
  }

  public async publishSkin(
    title: string,
    description: string,
    category: string,
    tags: string[],
    modelType: SkinMetadata['modelType'],
    base64Png: string,
    previewUrl?: string
  ): Promise<string> {
    const skinId = `skin_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const authorUid = this.currentUser?.uid || 'guest';
    const authorName = this.userProfile?.username || 'Community Creator';

    const metadata: SkinMetadata = {
      id: skinId,
      title: title.trim() || 'Untitled Skin',
      description: description.trim() || 'Minecraft Java Edition skin.',
      authorUid,
      authorName,
      modelType,
      category: category || 'General',
      tags: tags.length > 0 ? tags : ['minecraft', 'skin'],
      likesCount: 0,
      downloadsCount: 0,
      viewsCount: 0,
      ratingAverage: 5.0,
      ratingCount: 1,
      base64Png,
      previewUrl: previewUrl || base64Png,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      const skinRef = doc(firestore, 'skins', skinId);
      await setDoc(skinRef, metadata);

      if (this.currentUser) {
        const userRef = doc(firestore, 'users', this.currentUser.uid);
        await updateDoc(userRef, {
          publishedCount: increment(1),
        });
      }
    } catch {
      const saved = JSON.parse(localStorage.getItem('local_published_skins') || '[]');
      saved.unshift(metadata);
      localStorage.setItem('local_published_skins', JSON.stringify(saved));
    }

    return skinId;
  }

  public async getPublicSkins(
    category: string = 'All',
    sortBy: 'popular' | 'recent' | 'downloads' | 'trending' = 'popular',
    searchQuery: string = ''
  ): Promise<SkinMetadata[]> {
    const result: SkinMetadata[] = [];

    // 1. Fetch genuine skins from Firestore
    try {
      const skinsCol = collection(firestore, 'skins');
      let q = query(skinsCol, limit(50));

      if (sortBy === 'popular' || sortBy === 'trending') q = query(skinsCol, orderBy('likesCount', 'desc'), limit(50));
      else if (sortBy === 'recent') q = query(skinsCol, orderBy('createdAt', 'desc'), limit(50));
      else if (sortBy === 'downloads') q = query(skinsCol, orderBy('downloadsCount', 'desc'), limit(50));

      const snapshot = await getDocs(q);
      snapshot.forEach((d) => result.push(d.data() as SkinMetadata));
    } catch {}

    // 2. Load Local Published Skins
    try {
      const local = JSON.parse(localStorage.getItem('local_published_skins') || '[]');
      for (const item of local) {
        if (!result.some((r) => r.id === item.id)) {
          result.push(item);
        }
      }
    } catch {}

    // 3. Filter by Category & Search query
    return result.filter((s) => {
      const matchCat = category === 'All' || s.category.toLowerCase() === category.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }

  public async rateSkin(skinId: string, stars: number): Promise<{ average: number; count: number }> {
    if (!this.currentUser) return { average: 5.0, count: 1 };
    const clampedStars = Math.max(1, Math.min(5, Math.round(stars)));
    const uid = this.currentUser.uid;

    try {
      const ratingRef = doc(firestore, `skins/${skinId}/ratings`, uid);
      await setDoc(ratingRef, {
        userId: uid,
        stars: clampedStars,
        timestamp: Date.now(),
      });

      const skinRef = doc(firestore, 'skins', skinId);
      const skinSnap = await getDoc(skinRef);
      if (skinSnap.exists()) {
        const data = skinSnap.data() as SkinMetadata;
        const count = (data.ratingCount || 1) + 1;
        const avg = ((data.ratingAverage || 5.0) * (count - 1) + clampedStars) / count;
        await updateDoc(skinRef, {
          ratingAverage: parseFloat(avg.toFixed(1)),
          ratingCount: count,
        });
        return { average: parseFloat(avg.toFixed(1)), count };
      }
    } catch {}

    return { average: 5.0, count: 1 };
  }

  public async likeSkin(skinId: string): Promise<boolean> {
    if (!this.currentUser) return false;
    try {
      const skinRef = doc(firestore, 'skins', skinId);
      await updateDoc(skinRef, { likesCount: increment(1) });

      if (this.userProfile) {
        if (!this.userProfile.likedSkinIds.includes(skinId)) {
          this.userProfile.likedSkinIds.push(skinId);
          const userRef = doc(firestore, 'users', this.currentUser.uid);
          await updateDoc(userRef, { likedSkinIds: this.userProfile.likedSkinIds });
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  public async toggleFavorite(skinId: string): Promise<boolean> {
    if (!this.currentUser || !this.userProfile) return false;

    const isFav = this.userProfile.favoriteSkinIds.includes(skinId);
    if (isFav) {
      this.userProfile.favoriteSkinIds = this.userProfile.favoriteSkinIds.filter((id) => id !== skinId);
    } else {
      this.userProfile.favoriteSkinIds.push(skinId);
    }

    try {
      const userRef = doc(firestore, 'users', this.currentUser.uid);
      await updateDoc(userRef, { favoriteSkinIds: this.userProfile.favoriteSkinIds });
    } catch {}

    return !isFav;
  }

  public async toggleFollowUser(targetUid: string): Promise<boolean> {
    if (!this.currentUser || !this.userProfile || targetUid === this.currentUser.uid) return false;

    const isFollowing = this.userProfile.followingUids.includes(targetUid);
    if (isFollowing) {
      this.userProfile.followingUids = this.userProfile.followingUids.filter((id) => id !== targetUid);
    } else {
      this.userProfile.followingUids.push(targetUid);
    }

    try {
      const userRef = doc(firestore, 'users', this.currentUser.uid);
      await updateDoc(userRef, { followingUids: this.userProfile.followingUids });

      const targetRef = doc(firestore, 'users', targetUid);
      await updateDoc(targetRef, { followersCount: increment(isFollowing ? -1 : 1) });
    } catch {}

    return !isFollowing;
  }

  public async recordDownload(skinId: string) {
    try {
      const skinRef = doc(firestore, 'skins', skinId);
      await updateDoc(skinRef, { downloadsCount: increment(1) });
    } catch {}
  }

  public async addComment(skinId: string, text: string): Promise<CommentItem | null> {
    if (!this.currentUser) return null;
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 300) return null;

    const comment: CommentItem = {
      id: `comment_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      skinId,
      authorUid: this.currentUser.uid,
      authorName: this.userProfile?.username || 'Crafter',
      text: trimmed,
      timestamp: Date.now(),
    };

    try {
      const commentsCol = collection(firestore, `comments/${skinId}/messages`);
      await addDoc(commentsCol, comment);
    } catch {}

    return comment;
  }

  public subscribeToComments(skinId: string, onUpdate: (comments: CommentItem[]) => void): () => void {
    const commentsCol = collection(firestore, `comments/${skinId}/messages`);
    const q = query(commentsCol, orderBy('timestamp', 'asc'), limit(50));

    return onSnapshot(q, (snapshot) => {
      const list: CommentItem[] = [];
      snapshot.forEach((d) => list.push(d.data() as CommentItem));
      onUpdate(list);
    }, () => {
      onUpdate([]);
    });
  }

  public async sendDirectMessage(recipientUid: string, recipientName: string, text: string): Promise<void> {
    if (!this.currentUser) return;
    const myUid = this.currentUser.uid;
    const myName = this.userProfile?.username || 'Crafter';
    const convId = [myUid, recipientUid].sort().join('_');

    const message: DirectMessage = {
      id: `msg_${Date.now()}`,
      conversationId: convId,
      senderUid: myUid,
      senderName: myName,
      text: text.trim(),
      timestamp: Date.now(),
    };

    try {
      const convRef = doc(firestore, 'conversations', convId);
      await setDoc(convRef, {
        id: convId,
        participants: [myUid, recipientUid],
        participantNames: { [myUid]: myName, [recipientUid]: recipientName },
        lastMessageText: text.trim(),
        lastMessageTimestamp: Date.now(),
      }, { merge: true });

      const messagesCol = collection(firestore, `conversations/${convId}/messages`);
      await addDoc(messagesCol, message);
    } catch {}
  }

  public subscribeToConversation(convId: string, onUpdate: (messages: DirectMessage[]) => void): () => void {
    const messagesCol = collection(firestore, `conversations/${convId}/messages`);
    const q = query(messagesCol, orderBy('timestamp', 'asc'), limit(50));

    return onSnapshot(q, (snapshot) => {
      const list: DirectMessage[] = [];
      snapshot.forEach((d) => list.push(d.data() as DirectMessage));
      onUpdate(list);
    }, () => onUpdate([]));
  }

  public async submitReport(
    targetType: ReportItem['targetType'],
    targetId: string,
    reason: ReportItem['reason'],
    details: string
  ): Promise<boolean> {
    const report: ReportItem = {
      id: `rep_${Date.now()}`,
      targetType,
      targetId,
      reason,
      details,
      reporterUid: this.currentUser?.uid || 'guest',
      timestamp: Date.now(),
    };

    try {
      const repCol = collection(firestore, 'reports');
      await addDoc(repCol, report);
      return true;
    } catch {
      return true;
    }
  }
}

export const skinService = new SkinService();
