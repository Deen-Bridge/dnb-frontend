import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { config } from "@/lib/config/env";

const firebaseConfig = config.firebase;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
