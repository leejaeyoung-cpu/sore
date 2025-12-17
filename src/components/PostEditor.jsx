import { useState, useEffect } from 'react'
import './PostEditor.css'
import { createPost, updatePost, getMyGroups } from '../lib/queries'

function PostEditor({ post = null, onSave, onCancel, defaultGroup = null }) {
    const [title, setTitle] = useState(post?.title || '')
    const [content, setContent] = useState(post?.content || '')
    const [groupId, setGroupId] = useState(post?.group_id || defaultGroup?.id || null)
    const [videoUrl, setVideoUrl] = useState(post?.video_url || '')
    const [myGroups, setMyGroups] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        loadGroups()
    }, [])

    async function loadGroups() {
        const groups = await getMyGroups()
        setMyGroups(groups)
    }

    async function handleSubmit(e) {
        e.preventDefault()

        if (!title.trim()) {
            setError('제목을 입력하세요')
            return
        }

        if (!content.trim()) {
            setError('내용을 입력하세요')
            return
        }

        setLoading(true)
        setError('')

        try {
            const postData = {
                title: title.trim(),
                content: content.trim(),
                group_id: groupId,
                video_url: videoUrl.trim() || null
            }

            let result
            if (post) {
                // 수정
                result = await updatePost(post.id, postData)
            } else {
                // 새 글
                result = await createPost(postData)
            }

            if (result.error) {
                setError(result.error.message || '저장 실패')
            } else {
                onSave(result.data)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="post-editor">
            <div className="editor-header">
                <h2>{post ? '게시글 수정' : '새 게시글'}</h2>
                <button className="close-btn" onClick={onCancel}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
                {/* 그룹 선택 */}
                <div className="form-group">
                    <label>게시판 선택</label>
                    <select
                        value={groupId || ''}
                        onChange={(e) => setGroupId(e.target.value || null)}
                    >
                        <option value="">전체 게시판</option>
                        {myGroups.map(group => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 제목 */}
                <div className="form-group">
                    <label>제목 *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                        maxLength={200}
                    />
                </div>

                {/* 내용 */}
                <div className="form-group">
                    <label>내용 *</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="내용을 입력하세요"
                        rows={10}
                    />
                </div>

                {/* 동영상 URL */}
                <div className="form-group">
                    <label>동영상 URL (선택)</label>
                    <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="YouTube URL 또는 동영상 링크"
                    />
                    <small>YouTube, Vimeo 등의 링크를 입력하세요</small>
                </div>

                {/* 에러 메시지 */}
                {error && <div className="error-message">{error}</div>}

                {/* 버튼 */}
                <div className="editor-actions">
                    <button type="button" className="cancel-btn" onClick={onCancel}>
                        취소
                    </button>
                    <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? '저장 중...' : (post ? '수정' : '등록')}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default PostEditor
