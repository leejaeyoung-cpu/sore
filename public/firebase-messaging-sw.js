// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Firebase 설정
firebase.initializeApp({
    apiKey: "AIzaSyAgrbBWJ-FaWOC9QMIk0uo1xzycR5weC9I",
    authDomain: "sorae-pogu-church.firebaseapp.com",
    projectId: "sorae-pogu-church",
    storageBucket: "sorae-pogu-church.firebasestorage.app",
    messagingSenderId: "7017635036",
    appId: "1:7017635036:web:3c62ac4f1991d2aeaf6819",
    measurementId: "G-B53R5BNG2G"
});

const messaging = firebase.messaging();

// 백그라운드 메시지 수신
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] 백그라운드 메시지 수신:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'church-notification',
        requireInteraction: false
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 이벤트
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] 알림 클릭:', event);
    event.notification.close();

    event.waitUntil(
        clients.openWindow('/')
    );
});
