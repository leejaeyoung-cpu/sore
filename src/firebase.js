import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase 설정
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Messaging 인스턴스 (브라우저에서만 사용 가능)
let messaging = null;

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
}

// FCM 토큰 생성
export const requestFCMToken = async () => {
    try {
        if (!messaging) {
            console.error('메시징을 사용할 수 없습니다');
            return null;
        }

        // Service Worker 등록
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('✅ Service Worker 등록 완료');

        // 알림 권한 요청
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('알림 권한이 거부되었습니다');
            return null;
        }

        // FCM 토큰 생성
        const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration
        });

        console.log('✅ FCM 토큰:', token);
        return token;
    } catch (error) {
        console.error('FCM 토큰 생성 오류:', error);
        return null;
    }
};

// 포그라운드 메시지 수신
export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) return;

        onMessage(messaging, (payload) => {
            console.log('📩 메시지 수신:', payload);
            resolve(payload);
        });
    });

console.log('✅ Firebase 초기화 완료');

export default app;
