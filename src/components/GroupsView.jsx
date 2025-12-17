import { useState, useEffect } from 'react'
import './GroupsView.css'
import BottomNav from './BottomNav'
import { getMyGroups, getPosts } from '../lib/queries'

function GroupsView({ onNavigate, onNavigateToPost, onCreatePost }) {
    const [myGroups, setMyGroups] = useState([])
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadMyGroups()
    }, [])

    useEffect(() => {
        if (selectedGroup) {
            loadGroupPosts()
        }
    }, [selectedGroup])

    async function loadMyGroups() {
        setLoading(true)
        try {
            const groups = await getMyGroups()
            setMyGroups(groups)
        } catch (error) {
            console.error('단체 로드 오류:', error)
        } finally {
            setLoading(false)
        }
    }

    async function loadGroupPosts() {
        setLoading(true)
        try {
            const data = await getPosts(selectedGroup.id)
            setPosts(data)
        } catch (error) {
            console.error('게시글 로드 오류:', error)
        } finally {
            setLoading(false)
        }
    }

    // 단체 목록 화면
    if (!selectedGroup) {
        return (
            <>
                {/* 상단 여백 (핸드폰 시계 영역) */}
                <div style={{ height: 'max(env(safe-area-inset-top), 3rem)' }}></div>

                <div className="groups-view">
                    <div className="groups-header">
                        <h2>🤝 내 단체</h2>
                    </div>

                    {loading ? (
                        <p className="loading">로딩 중...</p>
                    ) : (
                        <div className="group-folders">
                            {myGroups.map(group => (
                                <div
                                    key={group.id}
                                    className="group-folder"
                                    onClick={() => setSelectedGroup(group)}
                                >
                                    <div className="folder-icon">📁</div>
                                    <div className="folder-info">
                                        <h3>{group.name}</h3>
                                        {group.role === 'leader' && <span className="role-badge">👑 리더</span>}
                                        {group.description && <p>{group.description}</p>}
                                    </div>
                                    <div className="folder-arrow">→</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <BottomNav currentPage="donation" onNavigate={onNavigate} />
            </>
        )
    }

    // 단체 게시판 화면
    return (
        <>
            {/* 상단 여백 (핸드폰 시계 영역) */}
            <div style={{ height: 'max(env(safe-area-inset-top), 3rem)' }}></div>

            <div className="groups-view">
                <div className="groups-header">
                    <button className="back-btn" onClick={() => setSelectedGroup(null)}>
                        ← 단체 목록
                    </button>
                    <h2>{selectedGroup.name}</h2>
                    <button
                        className="write-btn"
                        onClick={() => onCreatePost(selectedGroup)}
                    >
                        ✏️ 글쓰기
                    </button>
                </div>

                <div className="posts-list">
                    {loading ? (
                        <p className="loading">로딩 중...</p>
                    ) : (
                        posts.map(post => (
                            <div
                                key={post.id}
                                className="post-item"
                                onClick={() => onNavigateToPost(post.id)}
                            >
                                {post.is_pinned && <span className="pin-badge">📌 공지</span>}

                                <h3 className="post-title">{post.title}</h3>

                                <p className="post-preview">
                                    {post.content.substring(0, 100)}
                                    {post.content.length > 100 && '...'}
                                </p>

                                <div className="post-meta">
                                    <span className="author">{post.author?.name || '알 수 없음'}</span>
                                    <span className="separator">•</span>
                                    <span className="date">
                                        {new Date(post.published_at).toLocaleDateString('ko-KR')}
                                    </span>
                                    <span className="separator">•</span>
                                    <span className="views">👁️ {post.view_count}</span>

                                    {post.video_url && <span className="media-badge">🎬</span>}
                                    {post.image_url && <span className="media-badge">🖼️</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <BottomNav currentPage="donation" onNavigate={onNavigate} />
        </>
    )
}

export default GroupsView
