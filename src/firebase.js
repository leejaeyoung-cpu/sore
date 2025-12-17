import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase 설정 (환경변수 문제 해결을 위해 하드코딩)
const firebaseConfig = {
    apiKey: "AIzaSyAgrbBWJ-FaWOC9QMIk0uo1xzycR5weC9I",
    authDomain: "sorae-pogu-church.firebaseapp.com",
    projectId: "sorae-pogu-church",
    storageBucket: "sorae-pogu-church.firebasestorage.app",
    messagingSenderId: "7017635036",
    appId: "1:7017635036:web:3c62ac4f1991d2aeaf6819",
    measurementId: "G-B53R5BNG2G"
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
            vapidKey: 'BIfXufRMoPhpnZ4qjaCmU1xdmzdiChvzYuxPWKDRxrvrCST2swuaXnU3cbhIbvA0E2ieKjalgJw7BkNXrphbE6o',
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
export const onMessageListener = (callback) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
        console.log('📩 메시지 수신:', payload);
        callback(payload);
    });
};

console.log('✅ Firebase 초기화 완료');

export default app;
