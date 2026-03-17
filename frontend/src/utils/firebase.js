// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAR1eQegjPcG9Yk23EP4G9wWneqChxnNPU",
  authDomain: "vyapar-ai-31ef7.firebaseapp.com",
  projectId: "vyapar-ai-31ef7",
  storageBucket: "vyapar-ai-31ef7.firebasestorage.app",
  messagingSenderId: "38725306636",
  appId: "1:38725306636:web:e64b447af627798838e129",
  measurementId: "G-F9618D9V5X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, analytics };
