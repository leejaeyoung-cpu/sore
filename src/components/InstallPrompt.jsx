import { useState, useEffect } from 'react'
import './InstallPrompt.css'

function InstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState(null)

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowPrompt(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    async function handleInstall() {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            console.log('앱 설치 완료')
        }

        setDeferredPrompt(null)
        setShowPrompt(false)
    }

    function handleDismiss() {
        setShowPrompt(false)
    }

    if (!showPrompt) return null

    return (
        <div className="install-prompt">
            <div className="install-prompt-content">
                <div className="install-prompt-icon">⛪</div>
                <div className="install-prompt-text">
                    <h3>앱으로 설치하기</h3>
                    <p>홈 화면에 추가하고 더 편리하게 사용하세요!</p>
                </div>
                <div className="install-prompt-actions">
                    <button className="install-btn" onClick={handleInstall}>
                        설치
                    </button>
                    <button className="dismiss-btn" onClick={handleDismiss}>
                        나중에
                    </button>
                </div>
            </div>
        </div>
    )
}

export default InstallPrompt
