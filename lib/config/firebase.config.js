import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC8LlmtlWXvbcbyVbdyv4r-tDsGhhukdag",
  authDomain: "deen-bridge-22195.firebaseapp.com",
  projectId: "deen-bridge-22195",
  storageBucket: "deen-bridge-22195.firebasestorage.app",
  messagingSenderId: "368531944242",
  appId: "1:368531944242:web:7994b11820741a69d35d2b",
  measurementId: "G-ZZ81THLVCC",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
