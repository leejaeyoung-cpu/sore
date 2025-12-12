import { useState, useEffect } from 'react'
import './BelieverView.css'
import Button from './Button'
import Card from './Card'
import BulletinViewer from './BulletinViewer'
import { getMassSchedulesByDay, getActiveAnnouncements, getLatestBulletins } from '../lib/queries'

function BelieverView() {
    const [massSchedules, setMassSchedules] = useState({})
    const [announcements, setAnnouncements] = useState([])
    const [bulletins, setBulletins] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentView, setCurrentView] = useState('home') // 'home', 'announcements', 'bulletins'
    const [selectedBulletin, setSelectedBulletin] = useState(null) // 주보 뷰어용

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const [schedules, notices, bulls] = await Promise.all([
                getMassSchedulesByDay(),
                getActiveAnnouncements(10),
                getLatestBulletins(10)
            ])
            setMassSchedules(schedules)
            setAnnouncements(notices)
            setBulletins(bulls)
        } catch (error) {
            console.error('데이터 로드 오류:', error)
        } finally {
            setLoading(false)
        }
    }

    function handleBulletinClick() {
        setCurrentView('bulletins')
    }

    function handleAnnouncementClick() {
        setCurrentView('announcements')
    }

    function handleBackToHome() {
        setCurrentView('home')
    }

    // 공지사항 목록 화면
    if (currentView === 'announcements') {
        return (
            <div className="believer-view announcements-view">
                <div className="view-header">
                    <button className="back-button" onClick={handleBackToHome}>
                        ← 뒤로
                    </button>
                    <h2>📢 공지사항</h2>
                </div>

                <div className="announcements-full-list">
                    {announcements.length === 0 ? (
                        <p className="empty-message">등록된 공지사항이 없습니다.</p>
                    ) : (
                        announcements.map(announcement => (
                            <Card key={announcement.id} padding="md" className="announcement-full-card" hover>
                                <div className="announcement-header">
                                    <span className={`category-badge category-${announcement.category}`}>
                                        {announcement.category === 'urgent' && '🔴 긴급'}
                                        {announcement.category === 'event' && '🎉 행사'}
                                        {announcement.category === 'liturgy' && '⛪ 전례'}
                                        {announcement.category === 'general' && '📌 일반'}
                                    </span>
                                    <span className="announcement-date">
                                        {new Date(announcement.published_at).toLocaleDateString('ko-KR')}
                                    </span>
                                </div>
                                <h3>{announcement.title}</h3>
                                <p className="announcement-content">{announcement.content}</p>
                                {announcement.image_url && (
                                    <div className="announcement-image-full">
                                        <img src={announcement.image_url} alt={announcement.title} />
                                    </div>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            </div>
        )
    }

    // 주보 목록 화면
    if (currentView === 'bulletins') {
        return (
            <>
                <div className="believer-view bulletins-view">
                    <div className="view-header">
                        <button className="back-button" onClick={handleBackToHome}>
                            ← 뒤로
                        </button>
                        <h2>📖 주보</h2>
                    </div>

                    <div className="bulletins-full-list">
                        {bulletins.length === 0 ? (
                            <p className="empty-message">등록된 주보가 없습니다.</p>
                        ) : (
                            bulletins.map(bulletin => (
                                <Card key={bulletin.id} padding="md" className="bulletin-card-full" hover>
                                    {bulletin.cover_image_url && (
                                        <div className="bulletin-cover-full">
                                            <img src={bulletin.cover_image_url} alt={bulletin.title} />
                                        </div>
                                    )}
                                    <div className="bulletin-info">
                                        <h3>{bulletin.title}</h3>
                                        <p className="bulletin-date-full">
                                            {new Date(bulletin.week_of).toLocaleDateString('ko-KR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <Button
                                        variant="primary"
                                        fullWidth
                                        onClick={() => setSelectedBulletin(bulletin)}
                                    >
                                        📄 주보 보기
                                    </Button>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {selectedBulletin && (
                    <BulletinViewer
                        bulletin={selectedBulletin}
                        onClose={() => setSelectedBulletin(null)}
                    />
                )}
            </>
        )
    }

    // 홈 화면
    return (
        <div className="believer-view">
            <img
                src="/다운로드.jpg"
                alt="본당 사진"
                className="church-photo"
            />

            <div className="button-section">
                <Button variant="primary" fullWidth onClick={handleBulletinClick}>
                    📖 주보
                </Button>
                <Button variant="secondary" fullWidth onClick={handleAnnouncementClick}>
                    📢 공지사항
                </Button>
            </div>

            {/* 최근 공지사항 */}
            {announcements.length > 0 && (
                <div className="announcements-preview">
                    <h3>📢 최근 공지</h3>
                    {announcements.map(announcement => (
                        <Card
                            key={announcement.id}
                            padding="sm"
                            hover
                            className="announcement-card"
                        >
                            <div className="announcement-category">
                                {announcement.category === 'urgent' && '🔴 긴급'}
                                {announcement.category === 'event' && '🎉 행사'}
                                {announcement.category === 'liturgy' && '⛪ 전례'}
                                {announcement.category === 'general' && '📌 일반'}
                            </div>
                            <h4>{announcement.title}</h4>
                            <p className="announcement-preview">{announcement.content.substring(0, 100)}...</p>
                            {announcement.image_url && (
                                <div className="announcement-image-preview">
                                    <img src={announcement.image_url} alt={announcement.title} />
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* 미사 시간 안내 */}
            <div className="mass-schedule">
                <h2>⏰ 미사 시간 안내</h2>
                {loading ? (
                    <p className="loading">로딩 중...</p>
                ) : (
                    <div className="schedule-list">
                        {Object.entries(massSchedules).map(([day, times]) => (
                            <div key={day} className="schedule-item">
                                <span className="schedule-day">{day}</span>
                                <span className="schedule-time">
                                    {times.map(t => {
                                        const [hour, minute] = t.time.split(':')
                                        const h = parseInt(hour)
                                        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
                                        const ampm = h >= 12 ? '오후' : '오전'
                                        return `${ampm} ${displayHour}:${minute}`
                                    }).join(', ')}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default BelieverView
