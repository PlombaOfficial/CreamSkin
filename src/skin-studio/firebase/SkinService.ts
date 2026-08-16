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
import { SkinMetadata, CommentItem, UserProfile } from '../types';
import { SKIN_TEMPLATES } from '../templates/SkinTemplates';

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
          bio: 'Minecraft skin designer and pixel artist.',
          likedSkinIds: [],
          favoriteSkinIds: [],
          publishedCount: 0,
          createdAt: Date.now(),
        };
        await setDoc(userRef, newProfile);
        this.userProfile = newProfile;
      }
      return this.userProfile!;
    } catch (e) {
      console.warn('Profile load fallback:', e);
      const fallback: UserProfile = {
        uid: user.uid,
        username: preferredName || 'Crafter',
        likedSkinIds: [],
        favoriteSkinIds: [],
        publishedCount: 0,
        createdAt: Date.now(),
      };
      this.userProfile = fallback;
      return fallback;
    }
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
    const authorName = this.userProfile?.username || 'Anonymous Crafter';

    const metadata: SkinMetadata = {
      id: skinId,
      title: title.trim() || 'Untitled Skin',
      description: description.trim() || 'Custom designed Minecraft skin.',
      authorUid,
      authorName,
      modelType,
      category: category || 'General',
      tags: tags.length > 0 ? tags : ['minecraft', 'skin'],
      likesCount: 0,
      downloadsCount: 0,
      viewsCount: 0,
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
    } catch (err) {
      console.warn('Firestore publish offline fallback:', err);
      // Save to localStorage so user can still see and export it
      const saved = JSON.parse(localStorage.getItem('local_published_skins') || '[]');
      saved.unshift(metadata);
      localStorage.setItem('local_published_skins', JSON.stringify(saved));
    }

    return skinId;
  }

  public async getPublicSkins(
    category: string = 'All',
    sortBy: 'popular' | 'recent' | 'downloads' = 'popular',
    searchQuery: string = ''
  ): Promise<SkinMetadata[]> {
    const result: SkinMetadata[] = [];

    // 1. Fetch from Firestore if online
    try {
      const skinsCol = collection(firestore, 'skins');
      let q = query(skinsCol, limit(50));

      if (sortBy === 'popular') q = query(skinsCol, orderBy('likesCount', 'desc'), limit(50));
      else if (sortBy === 'recent') q = query(skinsCol, orderBy('createdAt', 'desc'), limit(50));
      else if (sortBy === 'downloads') q = query(skinsCol, orderBy('downloadsCount', 'desc'), limit(50));

      const snapshot = await getDocs(q);
      snapshot.forEach((d) => result.push(d.data() as SkinMetadata));
    } catch (e) {
      console.warn('Firestore fetch failed, using local & template gallery:', e);
    }

    // 2. Load Local Published Skins
    try {
      const local = JSON.parse(localStorage.getItem('local_published_skins') || '[]');
      for (const item of local) {
        if (!result.some((r) => r.id === item.id)) {
          result.push(item);
        }
      }
    } catch {}

    // 3. Inject Seed Templates into Gallery so gallery is vibrant immediately
    for (const t of SKIN_TEMPLATES) {
      if (!result.some((r) => r.id === t.id)) {
        const buffer = t.generate();
        const base64 = buffer.toBase64PNG();
        result.push({
          id: t.id,
          title: t.name,
          description: t.description,
          authorUid: 'official',
          authorName: 'SkinStudio Studio',
          modelType: t.modelType,
          category: t.category,
          tags: ['official', 'template', t.category.toLowerCase()],
          likesCount: 42 + t.id.length * 3,
          downloadsCount: 128 + t.id.length * 7,
          viewsCount: 350 + t.id.length * 12,
          base64Png: base64,
          previewUrl: base64,
          createdAt: 1700000000000 + t.id.length * 10000,
          updatedAt: 1700000000000 + t.id.length * 10000,
        });
      }
    }

    // 4. Client-side category & search filtering
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

  public async likeSkin(skinId: string): Promise<boolean> {
    if (!this.currentUser) return false;
    try {
      const skinRef = doc(firestore, 'skins', skinId);
      await updateDoc(skinRef, { likesCount: increment(1) });

      if (this.userProfile) {
        this.userProfile.likedSkinIds.push(skinId);
        const userRef = doc(firestore, 'users', this.currentUser.uid);
        await updateDoc(userRef, {
          likedSkinIds: this.userProfile.likedSkinIds,
        });
      }
      return true;
    } catch {
      return false;
    }
  }

  public async recordDownload(skinId: string) {
    try {
      const skinRef = doc(firestore, 'skins', skinId);
      await updateDoc(skinRef, { downloadsCount: increment(1) });
    } catch {}
  }

  public async addComment(skinId: string, text: string): Promise<CommentItem | null> {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 300) return null;

    const comment: CommentItem = {
      id: `comment_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      skinId,
      authorUid: this.currentUser?.uid || 'guest',
      authorName: this.userProfile?.username || 'Crafter',
      text: trimmed,
      timestamp: Date.now(),
    };

    try {
      const commentsCol = collection(firestore, `comments/${skinId}/messages`);
      await addDoc(commentsCol, comment);
    } catch (e) {
      console.warn('Comment post error:', e);
    }

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
}

export const skinService = new SkinService();
