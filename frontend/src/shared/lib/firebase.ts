import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { initializeApp, type FirebaseApp } from "firebase/app";

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;

function getFirebaseConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (!apiKey || !projectId) return null;

  return {
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };
}

export function initFirebase(): FirebaseApp | null {
  if (app) return app;

  const config = getFirebaseConfig();
  if (!config) return null;

  app = initializeApp(config);
  return app;
}

export async function initFirebaseAnalytics(): Promise<Analytics | null> {
  if (analytics) return analytics;

  const firebaseApp = initFirebase();
  if (!firebaseApp) return null;

  const supported = await isSupported();
  if (!supported) return null;

  analytics = getAnalytics(firebaseApp);
  return analytics;
}

export function getFirebaseApp() {
  return app;
}
