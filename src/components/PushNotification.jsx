import { useState } from 'react'
import { requestFCMToken } from '../firebase'
import { saveFCMToken } from '../lib/queries'
import './PushNotification.css'

function PushNotification() {
    const [loading, setLoading] = useState(false)
    const [subscribed, setSubscribed] = useState(false)

    const handleSubscribe = async () => {
        setLoading(true)

        try {
            // FCM 토큰 생성
            const token = await requestFCMToken()

            if (token) {
                // Supabase에 저장
                const { error } = await saveFCMToken(token, {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform
                })

                if (error) {
                    alert('토큰 저장 실패: ' + error.message)
                } else {
                    setSubscribed(true)
                    alert('✅ 푸시 알림 구독 완료!')
                }
            } else {
                alert('토큰 생성 실패. 브라우저 설정을 확인해주세요.')
            }
        } catch (error) {
            console.error('구독 오류:', error)
            alert('오류가 발생했습니다: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    if (subscribed) {
        return (
            <div className="push-notification-card subscribed">
                <div className="push-icon">✅</div>
                <div className="push-content">
                    <h3>알림 구독 중</h3>
                    <p>새로운 공지사항을 받고 있습니다</p>
                </div>
            </div>
        )
    }

    return (
        <div className="push-notification-card">
            <div className="push-icon">🔔</div>
            <div className="push-content">
                <h3>알림 받기</h3>
                <p>새로운 공지사항을 실시간으로 받아보세요</p>
                <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="subscribe-button"
                >
                    {loading ? '처리 중...' : '알림 허용하기'}
                </button>
            </div>
        </div>
    )
}

export default PushNotification
