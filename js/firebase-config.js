// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvyzbkbuWZIJknTBfM-OQi_NzfHcuKY5Q",
  authDomain: "financontrol-16ae8.firebaseapp.com",
  projectId: "financontrol-16ae8",
  storageBucket: "financontrol-16ae8.firebasestorage.app",
  messagingSenderId: "348930920581",
  appId: "1:348930920581:web:19654dee67c930bbdb99ec",
  measurementId: "G-DN6G7V7B04"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
