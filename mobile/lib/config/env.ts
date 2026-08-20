export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

export const AI_API_BASE_URL =
  process.env.EXPO_PUBLIC_AI_API_URL || "http://localhost:8000";

export const STELLAR_NETWORK =
  process.env.EXPO_PUBLIC_STELLAR_NETWORK || "testnet";

export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "",
};

export const CLOUDINARY_CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

export const JITSI_DOMAIN =
  process.env.EXPO_PUBLIC_JITSI_DOMAIN || "https://meet.jit.si";
