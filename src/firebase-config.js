/**
 * 3D MINECRAFT // FIREBASE INITIALIZATION & EXPORTS
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
  where,
  orderBy, 
  limit, 
  addDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB7-tesDQGn-9J4273qjZRdzd03duGIl1s",
  authDomain: "gametstigues.firebaseapp.com",
  projectId: "gametstigues",
  storageBucket: "gametstigues.firebasestorage.app",
  messagingSenderId: "996418696575",
  appId: "1:996418696575:web:af3d31b2cbfb76f59a564a",
  measurementId: "G-4SZ14ZCLSS"
};

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
  where,
  orderBy,
  limit,
  addDoc
};
