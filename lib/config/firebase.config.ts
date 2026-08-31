import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { config } from "@/lib/config/env";

const firebaseConfig = config.firebase;

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db: any = getFirestore(app); // TODO(types): Firestore db instance

export { app, db };
export default app;
