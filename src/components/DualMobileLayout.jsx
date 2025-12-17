import { useState, useEffect } from 'react'
import './DualMobileLayout.css'

function DualMobileLayout({ leftContent, rightContent }) {
    const [currentTime, setCurrentTime] = useState('')

    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            setCurrentTime(now.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }))
        }
        updateTime()
        const timer = setInterval(updateTime, 60000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="dual-layout-container">
            <div className="mobile-device-wrapper">
                <div className="device-label">
                    <span>👤</span> 신자용 (User Mode)
                </div>
                <div className="mobile-device-frame">
                    <div className="device-screen">
                        {/* Status Bar Simulation */}
                        <div className="status-bar">
                            <span>{currentTime}</span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <span>📶</span>
                                <span>🔋</span>
                            </div>
                        </div>
                        {leftContent}
                    </div>
                </div>
            </div>

            <div className="mobile-device-wrapper">
                <div className="device-label">
                    <span>⚙️</span> 관리자용 (Admin Mode)
                </div>
                <div className="mobile-device-frame">
                    <div className="device-screen">
                        {/* Status Bar Simulation */}
                        <div className="status-bar">
                            <span>{currentTime}</span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <span>📶</span>
                                <span>🔋</span>
                            </div>
                        </div>
                        {rightContent}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DualMobileLayout
