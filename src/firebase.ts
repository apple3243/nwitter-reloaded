import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCDF7crtq5RovpzOR9q-Bl4RgXsgc8q6_k",
  authDomain: "nwitter-reloaded-6fbcd.firebaseapp.com",
  projectId: "nwitter-reloaded-6fbcd",
  storageBucket: "nwitter-reloaded-6fbcd.appspot.com",
  messagingSenderId: "734500305550",
  appId: "1:734500305550:web:230f656a8c6695c15f27df"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);