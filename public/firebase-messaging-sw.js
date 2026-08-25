import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

const firebaseConfig = {
  apiKey: "AIzaSyC8LlmtlWXvbcbyVbdyv4r-tDsGhhukdag",
  authDomain: "deen-bridge-22195.firebaseapp.com",
  projectId: "deen-bridge-22195",
  storageBucket: "deen-bridge-22195.firebasestorage.app",
  messagingSenderId: "368531944242",
  appId: "1:368531944242:web:7994b11820741a69d35d2b",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  const title = payload.notification?.title || "Deen Bridge";
  const options = {
    body: payload.notification?.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    data: payload.data || {},
    tag: payload.data?.tag || "broadcast",
    renotify: true,
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
