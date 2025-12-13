import { useState, useEffect } from 'react'
import './BelieverView.css'
import Button from './Button'
import Card from './Card'
import BulletinViewer from './BulletinViewer'
import AnnouncementViewer from './AnnouncementViewer'
import BottomNav from './BottomNav'
import TopNav from './TopNav'
import { getMassSchedulesByDay, getActiveAnnouncements, getLatestBulletins } from '../lib/queries'

function BelieverView({ user, signOut, isAdmin }) {
    const [massSchedules, setMassSchedules] = useState({})
    const [announcements, setAnnouncements] = useState([])
    const [bulletins, setBulletins] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState('home')
    const [selectedBulletin, setSelectedBulletin] = useState(null)
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)

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

    function handleNavigate(page) {
        setCurrentPage(page)
    }

    // 홈 화면
    if (currentPage === 'home') {
        return (
            <>
                <div className="modern-view">
                    {/* 상단 헤더 */}
                    <header className="modern-header">
                        <div className="header-content">
                            <h1 className="church-logo">⛪ 소래포구성당</h1>
                            <button className="profile-btn" onClick={signOut}>
                                로그아웃
                            </button>
                        </div>
                    </header>

                    {/* 상단 네비게이션 */}
                    <TopNav currentPage={currentPage} onNavigate={handleNavigate} />

                    {/* 환영 배너 */}
                    <div className="hero-banner">
                        <img src="/다운로드.jpg" alt="성당" className="hero-image" />
                        <div className="hero-overlay">
                            <h2 className="hero-title">환영합니다</h2>
                            <p className="hero-subtitle">
                                {new Date().toLocaleDateString('ko-KR', {
                                    month: 'long',
                                    day: 'numeric',
                                    weekday: 'long'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* 퀵 액션 그리드 */}
                    <div className="quick-actions-grid">
                        <button
                            className="action-card purple"
                            onClick={() => setCurrentPage('bulletin')}
                        >
                            <span className="action-icon">📖</span>
                            <span className="action-label">주보</span>
                        </button>

                        <button
                            className="action-card blue"
                            onClick={() => setCurrentPage('announcements')}
                        >
                            <span className="action-icon">📢</span>
                            <span className="action-label">공지사항</span>
                        </button>

                        <button className="action-card green">
                            <span className="action-icon">👥</span>
                            <span className="action-label">게시판</span>
                            <span className="coming-soon">준비중</span>
                        </button>

                        <button className="action-card gold">
                            <span className="action-icon">💰</span>
                            <span className="action-label">헌금</span>
                            <span className="coming-soon">준비중</span>
                        </button>
                    </div>

                    {/* 이번 주 공지 */}
                    {announcements.length > 0 && (
                        <section className="section">
                            <h3 className="section-title">📌 이번 주 공지</h3>
                            <div className="notice-cards">
                                {announcements.slice(0, 3).map(announcement => (
                                    <div
                                        key={announcement.id}
                                        className="notice-card"
                                        onClick={() => setSelectedAnnouncement(announcement)}
                                    >
                                        <div className="notice-header">
                                            <span className={`category-badge ${announcement.category}`}>
                                                {announcement.category === 'urgent' && '🔴 긴급'}
                                                {announcement.category === 'event' && '🎉 행사'}
                                                {announcement.category === 'liturgy' && '⛪ 전례'}
                                                {announcement.category === 'general' && '📌 일반'}
                                            </span>
                                            <span className="notice-date">
                                                {new Date(announcement.published_at).toLocaleDateString('ko-KR')}
                                            </span>
                                        </div>
                                        <h4 className="notice-title">{announcement.title}</h4>
                                        <p className="notice-preview">
                                            {announcement.content.substring(0, 60)}...
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 미사 시간표 */}
                    <section className="section">
                        <h3 className="section-title">⏰ 미사 시간</h3>
                        <div className="schedule-table">
                            {Object.entries(massSchedules).map(([day, times]) => (
                                <div key={day} className="schedule-row">
                                    <div className="schedule-day">{day}</div>
                                    <div className="schedule-time">
                                        {times.map(t => {
                                            const [hour, minute] = t.time.split(':')
                                            const h = parseInt(hour)
                                            const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
                                            const ampm = h >= 12 ? '오후' : '오전'
                                            return `${ampm} ${displayHour}:${minute}`
                                        }).join(', ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 하단 여백 (네비게이션 바 공간) */}
                    <div style={{ height: '80px' }}></div>
                </div>

                {/* 하단 네비게이션 */}
                <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />

                {/* 공지사항 뷰어 */}
                {selectedAnnouncement && (
                    <AnnouncementViewer
                        announcement={selectedAnnouncement}
                        onClose={() => setSelectedAnnouncement(null)}
                    />
                )}
            </>
        )
    }

    // 주보 화면
    if (currentPage === 'bulletin') {
        return (
            <>
                <div className="modern-view">
                    {/* 상단 네비게이션 */}
                    <TopNav currentPage={currentPage} onNavigate={handleNavigate} />

                    {/* 페이지 제목 */}
                    <div className="page-title-box">
                        <span className="page-title-icon">📖</span>
                        <h2>주보</h2>
                    </div>

                    <div className="bulletins-list">
                        {bulletins.length === 0 ? (
                            <p className="empty-message">등록된 주보가 없습니다.</p>
                        ) : (
                            bulletins.map(bulletin => (
                                <div key={bulletin.id} className="bulletin-card" onClick={() => setSelectedBulletin(bulletin)}>
                                    <div className="card-content">
                                        <div className="card-text">
                                            <h3 className="card-title">{bulletin.title}</h3>
                                            <p className="card-preview">
                                                {bulletin.week_of ? `${new Date(bulletin.week_of).toLocaleDateString('ko-KR')} 주보` : '주보'}
                                            </p>
                                            <div className="card-meta">
                                                <span className="meta-author">👤 관리자</span>
                                                <span className="meta-date">
                                                    📅 {new Date(bulletin.published_at || bulletin.week_of).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                                </span>
                                                <span className="meta-views">👁️ {Math.floor(Math.random() * 100) + 50}</span>
                                            </div>
                                        </div>
                                        {bulletin.cover_image_url && (
                                            <div className="card-thumbnail">
                                                <img src={bulletin.cover_image_url} alt={bulletin.title} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div style={{ height: '80px' }}></div>
                </div>

                <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />

                {selectedBulletin && (
                    <BulletinViewer
                        bulletin={selectedBulletin}
                        onClose={() => setSelectedBulletin(null)}
                    />
                )}
            </>
        )
    }

    // 공지사항 화면
    if (currentPage === 'announcements') {
        return (
            <>
                <div className="modern-view">
                    {/* 상단 네비게이션 */}
                    <TopNav currentPage={currentPage} onNavigate={handleNavigate} />

                    {/* 페이지 제목 */}
                    <div className="page-title-box">
                        <span className="page-title-icon">📢</span>
                        <h2>공지사항</h2>
                    </div>

                    <div className="announcements-list">
                        {announcements.map(announcement => (
                            <div
                                key={announcement.id}
                                className="announcement-card-full"
                                onClick={() => setSelectedAnnouncement(announcement)}
                            >
                                <div className="card-content">
                                    <div className="card-text">
                                        <div className="notice-header">
                                            <span className={`category-badge ${announcement.category}`}>
                                                {announcement.category === 'urgent' && '🔴 긴급'}
                                                {announcement.category === 'event' && '🎉 행사'}
                                                {announcement.category === 'liturgy' && '⛪ 전례'}
                                                {announcement.category === 'general' && '📌 일반'}
                                            </span>
                                        </div>
                                        <h3 className="card-title">{announcement.title}</h3>
                                        <p className="card-preview">
                                            {announcement.content.substring(0, 80)}...
                                        </p>
                                        <div className="card-meta">
                                            <span className="meta-author">👤 관리자</span>
                                            <span className="meta-date">
                                                📅 {new Date(announcement.published_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="meta-views">👁️ {Math.floor(Math.random() * 150) + 80}</span>
                                        </div>
                                    </div>
                                    {announcement.image_url && (
                                        <div className="card-thumbnail">
                                            <img src={announcement.image_url} alt={announcement.title} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ height: '80px' }}></div>
                </div>

                <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />

                {selectedAnnouncement && (
                    <AnnouncementViewer
                        announcement={selectedAnnouncement}
                        onClose={() => setSelectedAnnouncement(null)}
                    />
                )}
            </>
        )
    }

    // 기타 페이지 (준비중)
    return (
        <>
            <div className="modern-view">
                {/* 상단 네비게이션 */}
                <TopNav currentPage={currentPage} onNavigate={handleNavigate} />

                <div className="coming-soon-page">
                    <p>🚧 준비 중입니다</p>
                </div>

                <div style={{ height: '80px' }}></div>
            </div>

            <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
        </>
    )
}

export default BelieverView
