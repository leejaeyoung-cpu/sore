import { useState, useEffect } from 'react'
import './PostDetail.css'
import { getPost, deletePost } from '../lib/queries'

function PostDetail({ postId, onClose, onEdit, currentUser }) {
    const [post, setPost] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPost()
    }, [postId])

    async function loadPost() {
        setLoading(true)
        const data = await getPost(postId)
        setPost(data)
        setLoading(false)
    }

    async function handleDelete() {
        if (!confirm('정말 삭제하시겠습니까?')) return

        const result = await deletePost(postId)
        if (result.success) {
            alert('삭제되었습니다')
            onClose()
        } else {
            alert('삭제 실패')
        }
    }

    if (loading) {
        return <div className="post-detail loading">로딩 중...</div>
    }

    if (!post) {
        return <div className="post-detail error">게시글을 찾을 수 없습니다</div>
    }

    const isAuthor = currentUser && currentUser.id === post.author_id

    return (
        <div className="post-detail">
            <div className="detail-header">
                <button className="back-btn" onClick={onClose}>← 목록</button>
                {isAuthor && (
                    <div className="author-actions">
                        <button onClick={() => onEdit(post)}>수정</button>
                        <button onClick={handleDelete} className="delete">삭제</button>
                    </div>
                )}
            </div>

            <div className="detail-content">
                <h1 className="detail-title">{post.title}</h1>

                <div className="detail-meta">
                    <span className="author">{post.author?.name || '알 수 없음'}</span>
                    <span className="separator">•</span>
                    <span className="date">
                        {new Date(post.published_at).toLocaleString('ko-KR')}
                    </span>
                    <span className="separator">•</span>
                    <span className="views">조회 {post.view_count}</span>
                </div>

                {post.video_url && (
                    <div className="detail-video">
                        {post.video_url.includes('youtube.com') || post.video_url.includes('youtu.be') ? (
                            <iframe
                                src={post.video_url.replace('watch?v=', 'embed/')}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <video controls src={post.video_url} />
                        )}
                    </div>
                )}

                <div className="detail-body">
                    {post.content.split('\n').map((line, i) => (
                        <p key={i}>{line || '\u00A0'}</p>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PostDetail
