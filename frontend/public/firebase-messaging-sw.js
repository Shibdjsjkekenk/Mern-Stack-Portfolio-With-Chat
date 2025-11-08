importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyD5Mq2VtGx0Qkbnf0C8DcizpxM_bE_KE_M",
  authDomain: "tchat-fef98.firebaseapp.com",
  projectId: "tchat-fef98",
  storageBucket: "tchat-fef98.firebasestorage.app",
  messagingSenderId: "951446491197",
  appId: "1:951446491197:web:9c1fa45e554935616a9a54",
  measurementId: "G-P6JYD1LQ5K",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/favicon.ico",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
