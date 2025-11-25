// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
const firebaseConfig = {
  apiKey: "AIzaSyDx-XaaKkFM02KcQOV1ZQfg4gj8wR2bAE4",
  authDomain: "first-proyect-next.firebaseapp.com",
  projectId: "first-proyect-next",
  storageBucket: "first-proyect-next.firebasestorage.app",
  messagingSenderId: "449364573644",
  appId: "1:449364573644:web:e11f687be074efea16f169",
  measurementId: "G-210SPZTGDV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// const functions = getFunctions(app);
const functions = getFunctions(app, "us-central1");
export { auth,db,functions };