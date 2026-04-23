import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDw9-HPetEiVZkMWqz6yWJUa8K5MiolKzc",
  authDomain: "adrian-pay.firebaseapp.com",
  projectId: "adrian-pay",
  storageBucket: "adrian-pay.firebasestorage.app",
  messagingSenderId: "28530461852",
  appId: "1:28530461852:web:308e9e197a6ce876f93159",
  measurementId: "G-TTVG3YYVHF"
};

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
