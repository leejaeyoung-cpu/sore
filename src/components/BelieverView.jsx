import { useState, useEffect } from 'react'
import './BelieverView.css'
import Button from './Button'
import Card from './Card'
import BulletinViewer from './BulletinViewer'
import AnnouncementViewer from './AnnouncementViewer'
import BottomNav from './BottomNav'
import VideoPlayer from './VideoPlayer'
import AdminView from './AdminView'
import BoardView from './BoardView'
import GroupsView from './GroupsView'
import PostEditor from './PostEditor'
import PostDetail from './PostDetail'
import { getMassSchedulesByDay, getActiveAnnouncements, getLatestBulletins, saveFCMToken, toggleNotificationSubscription, getSubscriptionStatus } from '../lib/queries'
import { requestFCMToken, onMessageListener } from '../firebase'

function BelieverView({ user, signOut, isAdmin }) {
    const [massSchedules, setMassSchedules] = useState({})
    const [announcements, setAnnouncements] = useState([])
    const [bulletins, setBulletins] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState('home')
    const [selectedBulletin, setSelectedBulletin] = useState(null)
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
    const [showAdminView, setShowAdminView] = useState(false) // 관리자 모드 상태
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(false)
    const [notificationLoading, setNotificationLoading] = useState(false)
    // 게시판 관련 state
    const [selectedPostId, setSelectedPostId] = useState(null)
    const [showPostEditor, setShowPostEditor] = useState(false)
    const [editingPost, setEditingPost] = useState(null)
    const [editorDefaultGroup, setEditorDefaultGroup] = useState(null)

    useEffect(() => {
        loadData()
        checkNotificationStatus()
    }, [])

    useEffect(() => {
        onMessageListener((payload) => {
            alert(`[알림] ${payload.notification.title}\n${payload.notification.body}`)
        })
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

    async function checkNotificationStatus() {
        try {
            const status = await getSubscriptionStatus()
            setIsNotificationEnabled(status)
        } catch (error) {
            console.error('구독 상태 확인 오류:', error)
            // 테이블이 없거나 에러 발생 시 기본값 false 유지
            setIsNotificationEnabled(false)
        }
    }

    async function handleNotificationToggle() {
        setNotificationLoading(true)

        try {
            if (!isNotificationEnabled) {
                // 알림 켜기
                const permission = await Notification.requestPermission()
                if (permission !== 'granted') {
                    alert('알림 권한이 필요합니다')
                    setNotificationLoading(false)
                    return
                }

                const token = await requestFCMToken()
                if (token) {
                    await saveFCMToken(token, {
                        userAgent: navigator.userAgent,
                        platform: navigator.platform
                    })
                    setIsNotificationEnabled(true)
                }
            } else {
                // 알림 끄기
                await toggleNotificationSubscription(false)
                setIsNotificationEnabled(false)
            }
        } catch (error) {
            console.error('알림 토글 오류:', error)
            alert(`알림 설정 중 오류가 발생했습니다: ${error.message}`)
        } finally {
            setNotificationLoading(false)
        }
    }

    function handleNavigate(page) {
        setCurrentPage(page)
        // 게시판에서 벗어날 때는 상태 초기화
        if (page !== 'board') {
            setSelectedPostId(null)
            setShowPostEditor(false)
            setEditingPost(null)
        }
    }

    // 단체 화면
    if (currentPage === 'donation') {
        if (showPostEditor) {
            return (
                <PostEditor
                    post={editingPost}
                    defaultGroup={editorDefaultGroup}
                    onSave={() => {
                        setShowPostEditor(false)
                        setEditingPost(null)
                        setEditorDefaultGroup(null)
                    }}
                    onCancel={() => {
                        setShowPostEditor(false)
                        setEditingPost(null)
                        setEditorDefaultGroup(null)
                    }}
                />
            )
        }

        if (selectedPostId) {
            return (
                <PostDetail
                    postId={selectedPostId}
                    currentUser={user}
                    onClose={() => setSelectedPostId(null)}
                    onEdit={(post) => {
                        setEditingPost(post)
                        setSelectedPostId(null)
                        setShowPostEditor(true)
                    }}
                />
            )
        }

        return (
            <GroupsView
                onNavigate={handleNavigate}
                onNavigateToPost={(postId) => setSelectedPostId(postId)}
                onCreatePost={(group) => {
                    setEditorDefaultGroup(group)
                    setShowPostEditor(true)
                }}
            />
        )
    }

    // 게시판 화면
    if (currentPage === 'board') {
        if (showPostEditor) {
            return (
                <PostEditor
                    post={editingPost}
                    defaultGroup={editorDefaultGroup}
                    onSave={() => {
                        setShowPostEditor(false)
                        setEditingPost(null)
                        setEditorDefaultGroup(null)
                    }}
                    onCancel={() => {
                        setShowPostEditor(false)
                        setEditingPost(null)
                        setEditorDefaultGroup(null)
                    }}
                />
            )
        }

        if (selectedPostId) {
            return (
                <PostDetail
                    postId={selectedPostId}
                    currentUser={user}
                    onClose={() => setSelectedPostId(null)}
                    onEdit={(post) => {
                        setEditingPost(post)
                        setSelectedPostId(null)
                        setShowPostEditor(true)
                    }}
                />
            )
        }

        return (
            <BoardView
                isAdmin={isAdmin}
                onNavigate={handleNavigate}
                onNavigateToPost={(postId) => setSelectedPostId(postId)}
                onCreatePost={(group) => {
                    setEditorDefaultGroup(group)
                    setShowPostEditor(true)
                }}
            />
        )
    }

    // 홈 화면
    if (currentPage === 'home') {
        return (
            <>
                <div className="modern-view">
                    {/* 환영 배너 */}
                    <div className="hero-banner">
                        <img src="/church-hero.jpg" alt="성당" className="hero-image" />
                        <div className="hero-overlay">
                            <h1 className="hero-church-name">⛪ 소래포구성당</h1>
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

                    {/* 동영상 플레이어 */}
                    <div style={{ padding: '0 1rem' }}>
                        <VideoPlayer />
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

                        <button className="action-card green" onClick={() => setCurrentPage('board')}>
                            <span className="action-icon">👥</span>
                            <span className="action-label">게시판</span>
                        </button>

                        <button className="action-card gold" onClick={() => setCurrentPage('donation')}>
                            <span className="action-icon">🤝</span>
                            <span className="action-label">단체</span>
                        </button>
                    </div>

                    {/* 이번 주 공지 - 가로 스크롤 */}
                    {announcements.length > 0 && (
                        <section className="section">
                            <h3 className="section-title">📌 이번 주 공지</h3>
                            <div className="notice-scroll-container">
                                {announcements.slice(0, 5).map(announcement => (
                                    <div
                                        key={announcement.id}
                                        className="notice-box"
                                        onClick={() => setSelectedAnnouncement(announcement)}
                                    >
                                        {announcement.image_url && (
                                            <div className="notice-box-image">
                                                <img src={announcement.image_url} alt={announcement.title} />
                                            </div>
                                        )}
                                        <span className={`category-badge ${announcement.category}`}>
                                            {announcement.category === 'urgent' && '🔴 긴급'}
                                            {announcement.category === 'event' && '🎉 행사'}
                                            {announcement.category === 'liturgy' && '⛪'}
                                            {announcement.category === 'general' && '📌'}
                                        </span>
                                        <h4 className="notice-box-title">{announcement.title}</h4>
                                        <p className="notice-box-preview">
                                            {announcement.content.substring(0, 40)}...
                                        </p>
                                        <p className="notice-box-date">
                                            {new Date(announcement.published_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 미사 시간표 */}
                    <section className="section">
                        <h3 className="section-title">⏰ 미사 시간</h3>
                        <div className="schedule-scroll-container">
                            <div className="schedule-cards-horizontal">
                                {/* 일요일 */}
                                <div className="schedule-card-vertical">
                                    <div className="schedule-day-badge sunday">일요일</div>
                                    <div className="schedule-times-vertical">
                                        <div className="schedule-time-row">
                                            <span className="time-icon">🕘</span>
                                            <span className="time-text">오전 9:00</span>
                                        </div>
                                        <div className="schedule-time-row">
                                            <span className="time-icon">🕚</span>
                                            <span className="time-text">오전 11:00</span>
                                            <span className="time-label-small">교중미사</span>
                                        </div>
                                        <div className="schedule-time-row">
                                            <span className="time-icon">🕕</span>
                                            <span className="time-text">오후 6:00</span>
                                            <span className="time-label-small">청년</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 월,수,금 */}
                                <div className="schedule-card-vertical">
                                    <div className="schedule-day-badge">월, 수, 금</div>
                                    <div className="schedule-times-vertical">
                                        <div className="schedule-time-row">
                                            <span className="time-icon">🕙</span>
                                            <span className="time-text">오전 10:00</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 화,목 */}
                                <div className="schedule-card-vertical">
                                    <div className="schedule-day-badge">화, 목</div>
                                    <div className="schedule-times-vertical">
                                        <div className="schedule-time-row">
                                            <span className="time-icon">🕖</span>
                                            <span className="time-text">오후 7:00</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 토요일 */}
                                <div className="schedule-card-vertical">
                                    <div className="schedule-day-badge saturday">토요일</div>
                                    <div className="schedule-times-vertical">
                                        <div className="schedule-time-row">
                                            <span className="time-icon">🕓</span>
                                            <span className="time-text">오후 4:00</span>
                                            <span className="time-label-small">어린이</span>
                                        </div>
                                        <div className="schedule-time-row">
                                            <span className="time-icon">🕕</span>
                                            <span className="time-text">오후 6:00</span>
                                            <span className="time-label-small">중·고등부</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                {/* 상단 여백 (핸드폰 시계 영역) */}
                <div style={{ height: 'max(env(safe-area-inset-top), 3rem)' }}></div>

                <div className="modern-view">
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

    // 관리자 모드일 경우
    if (showAdminView && isAdmin) {
        return (
            <>
                <AdminView />
                <div className="admin-back-button" style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 1000
                }}>
                    <button
                        onClick={() => {
                            setShowAdminView(false)
                            setCurrentPage('home')
                        }}
                        style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '25px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                        }}
                    >
                        ← 사용자 모드
                    </button>
                </div>
            </>
        )
    }

    // 더보기 페이지
    if (currentPage === 'more') {
        return (
            <>
                <div className="modern-view">
                    <div className="page-title-box">
                        <span className="page-title-icon">⋯</span>
                        <h2>더보기</h2>
                    </div>

                    <div style={{ padding: '20px' }}>
                        {/* 프로필 카드 */}
                        <div className="bulletin-card" style={{ marginBottom: '20px' }}>
                            <div className="card-content" style={{ flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                <div style={{ fontSize: '48px' }}>👤</div>
                                <h3>{user.email}</h3>
                                {isAdmin && (
                                    <span className="admin-badge" style={{
                                        padding: '4px 12px',
                                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                        color: 'white',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}>
                                        👑 관리자
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 알림 설정 */}
                        <div className="bulletin-card" style={{ marginBottom: '20px' }}>
                            <div className="card-content" style={{ flexDirection: 'column', gap: '10px' }}>
                                <h3>🔔 알림 설정</h3>
                                <button
                                    onClick={handleNotificationToggle}
                                    disabled={notificationLoading}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: isNotificationEnabled ? '#48bb78' : '#e2e8f0',
                                        color: isNotificationEnabled ? 'white' : '#4a5568',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <span>{notificationLoading ? '⏳' : (isNotificationEnabled ? '🔔' : '🔕')}</span>
                                    <span>{notificationLoading ? '처리 중...' : (isNotificationEnabled ? '알림 끄기' : '알림 켜기')}</span>
                                </button>
                                <p style={{ fontSize: '12px', color: '#718096', textAlign: 'center' }}>
                                    {isNotificationEnabled
                                        ? '새로운 공지사항과 주보 알림을 받습니다.'
                                        : '알림이 꺼져 있습니다. 중요한 소식을 놓치지 마세요!'}
                                </p>
                            </div>
                        </div>

                        {/* 관리자 모드 전환 (admin인 경우만) */}
                        {isAdmin && (
                            <div className="bulletin-card" style={{ marginBottom: '20px' }}>
                                <div className="card-content" style={{ flexDirection: 'column', gap: '10px' }}>
                                    <h3>👑 관리자 기능</h3>
                                    <button
                                        onClick={() => setShowAdminView(true)}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <span>🛠️</span>
                                        <span>관리자 모드로 전환</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 로그아웃 */}
                        <div className="bulletin-card" style={{ marginBottom: '20px' }}>
                            <div className="card-content" style={{ flexDirection: 'column', gap: '10px' }}>
                                <button
                                    onClick={signOut}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: '#ff4757',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    🚪 로그아웃
                                </button>
                            </div>
                        </div>

                        {/* 앱 정보 */}
                        <div style={{ textAlign: 'center', color: '#999', fontSize: '14px', marginTop: '40px' }}>
                            <p>소래포구성당 앱 v1.0</p>
                            <p style={{ fontSize: '12px', marginTop: '8px' }}>© 2025. All rights reserved.</p>
                        </div>
                    </div>

                    <div style={{ height: '80px' }}></div>
                </div>

                <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
            </>
        )
    }

    // 기타 페이지 (준비중)
    return (
        <>
            <div className="modern-view">
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
