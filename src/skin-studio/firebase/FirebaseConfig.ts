import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const meta = import.meta as unknown as { env?: Record<string, string> };

export const firebaseConfig = {
  apiKey: meta.env?.VITE_FIREBASE_API_KEY || 'AIzaSyB7-tesDQGn-9J4273qjZRdzd03duGIl1s',
  authDomain: meta.env?.VITE_FIREBASE_AUTH_DOMAIN || 'gametstigues.firebaseapp.com',
  projectId: meta.env?.VITE_FIREBASE_PROJECT_ID || 'gametstigues',
  storageBucket: meta.env?.VITE_FIREBASE_STORAGE_BUCKET || 'gametstigues.firebasestorage.app',
  messagingSenderId: meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '996418696575',
  appId: meta.env?.VITE_FIREBASE_APP_ID || '1:996418696575:web:af3d31b2cbfb76f59a564a',
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const firestore = getFirestore(app);
