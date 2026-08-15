/**
 * THE BACKROOMS MULTIPLAYER // FIREBASE FIRESTORE INITIALIZATION
 * Uses Firebase Modular Web SDK v10 (via Official CDN).
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  onSnapshot, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  orderBy,
  limit,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// User's Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCJEVc-fVIvJegtCEZjBSeVE3Z3Ocz5m0",
  authDomain: "gametest-a0285.firebaseapp.com",
  projectId: "gametest-a0285",
  storageBucket: "gametest-a0285.firebasestorage.app",
  messagingSenderId: "757766774060",
  appId: "1:757766774060:web:b5c7917eeb4b37188de089",
  measurementId: "G-N6NT7J3TKG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  app,
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  addDoc
};
