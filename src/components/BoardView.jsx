import { useState, useEffect } from 'react'
import './BoardView.css'
import BottomNav from './BottomNav'
import { getPosts } from '../lib/queries'

function BoardView({ onNavigateToPost, onCreatePost, onNavigate, isAdmin }) {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPosts()
    }, [])

    async function loadPosts() {
        setLoading(true)
        try {
            const data = await getPosts(null) // 전체 게시판만
            setPosts(data)
        } catch (error) {
            console.error('게시글 로드 오류:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* 상단 여백 (핸드폰 시계 영역) */}
            <div style={{ height: 'max(env(safe-area-inset-top), 3rem)' }}></div>

            <div className="board-view">
                {/* 헤더 */}
                <div className="board-header">
                    <h2>📋 전체 게시판</h2>
                </div>

                {/* 게시글 목록 */}
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

            <BottomNav currentPage="board" onNavigate={onNavigate} />
        </>
    )
}

export default BoardView
