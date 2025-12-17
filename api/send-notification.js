import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
// 주의: Vercel 환경 변수 설정 필요
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Firebase Admin 초기화
// FIREBASE_SERVICE_ACCOUNT 환경 변수에 JSON 문자열 전체를 넣어야 함
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

if (serviceAccount && !getApps().length) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!serviceAccount) {
        return res.status(500).json({ error: 'Server configuration error: Missing Firebase Service Account' });
    }

    const { title, body, url } = req.body;

    if (!title || !body) {
        return res.status(400).json({ error: 'Title and body are required' });
    }

    try {
        // 1. 구독 중인 모든 토큰 가져오기
        const { data: tokens, error } = await supabase
            .from('fcm_tokens')
            .select('token')
            .eq('is_subscribed', true);

        if (error) throw error;

        if (!tokens || tokens.length === 0) {
            return res.status(200).json({
                message: 'No subscribers found',
                debug: {
                    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
                    hasAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
                    supabaseUrl: supabaseUrl ? 'Set' : 'Missing'
                }
            });
        }

        const fcmTokens = tokens.map(t => t.token);

        // 중복 제거
        const uniqueTokens = [...new Set(fcmTokens)];

        if (uniqueTokens.length === 0) {
            return res.status(200).json({ message: 'No valid tokens found' });
        }

        console.log(`Sending notification to ${uniqueTokens.length} devices...`);

        // 2. 메시지 구성
        const message = {
            notification: {
                title,
                body,
            },
            webpush: {
                headers: {
                    Urgency: "high"
                },
                notification: {
                    requireInteraction: true,
                    icon: '/icon-192.png'
                }
            },
            apns: {
                payload: {
                    aps: {
                        contentAvailable: true,
                        sound: 'default'
                    }
                },
                headers: {
                    "apns-priority": "10",
                    "apns-push-type": "alert"
                }
            },
            data: {
                url: url || '/',
            },
            tokens: uniqueTokens,
        };

        // 3. 전송
        const response = await getMessaging().sendEachForMulticast(message);

        // 4. 실패한 토큰 정리 (옵션)
        if (response.failureCount > 0) {
            console.log('Failed tokens count:', response.failureCount);
            // 여기에 실패한 토큰 삭제 로직 추가 가능
        }

        return res.status(200).json({
            success: true,
            debug: response, // 전체 응답 객체 확인용
            successCount: response.successCount,
            failureCount: response.failureCount
        });

    } catch (error) {
        console.error('Notification error:', error);
        return res.status(500).json({ error: error.message });
    }
}
