import { useState, useEffect } from 'react'
import './AdminView.css'
import Button from './Button'
import Card from './Card'
import { getActiveAnnouncements, getLatestBulletins } from '../lib/queries'
import { supabase } from '../lib/supabase'
import { uploadImage, uploadFile } from '../lib/cloudinary'

function AdminView() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [announcements, setAnnouncements] = useState([])
    const [bulletins, setBulletins] = useState([])
    const [loading, setLoading] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [uploadingFile, setUploadingFile] = useState(false)

    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        category: 'general',
        image_url: ''
    })

    const [newBulletin, setNewBulletin] = useState({
        title: '',
        week_of: '',
        images: [], // 여러 이미지 저장
        cover_image_url: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const [notices, bulls] = await Promise.all([
                getActiveAnnouncements(10),
                getLatestBulletins(10)
            ])
            setAnnouncements(notices)
            setBulletins(bulls)
        } catch (error) {
            console.error('데이터 로드 오류:', error)
        } finally {
            setLoading(false)
        }
    }

    // 공지사항 관련 함수들
    async function handleImageUpload(e) {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드 가능합니다.')
            return
        }

        setUploadingImage(true)
        try {
            const imageUrl = await uploadImage(file)
            setNewAnnouncement({ ...newAnnouncement, image_url: imageUrl })
            alert('이미지 업로드 완료!')
        } catch (error) {
            console.error('이미지 업로드 오류:', error)
            alert('이미지 업로드 실패: ' + error.message)
        } finally {
            setUploadingImage(false)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('announcements')
                    .update({
                        title: newAnnouncement.title,
                        content: newAnnouncement.content,
                        category: newAnnouncement.category,
                        image_url: newAnnouncement.image_url || null
                    })
                    .eq('id', editingId)

                if (error) throw error
                alert('공지사항이 수정되었습니다!')
                setEditingId(null)
            } else {
                const { error } = await supabase
                    .from('announcements')
                    .insert({
                        title: newAnnouncement.title,
                        content: newAnnouncement.content,
                        category: newAnnouncement.category,
                        image_url: newAnnouncement.image_url || null,
                        published_at: new Date().toISOString()
                    })

                if (error) throw error
                alert('공지사항이 등록되었습니다!')
            }

            setNewAnnouncement({ title: '', content: '', category: 'general', image_url: '' })
            loadData()
        } catch (error) {
            console.error('저장 오류:', error)
            alert('저장 실패: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    function handleEdit(announcement) {
        setEditingId(announcement.id)
        setNewAnnouncement({
            title: announcement.title,
            content: announcement.content,
            category: announcement.category,
            image_url: announcement.image_url || ''
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function handleCancelEdit() {
        setEditingId(null)
        setNewAnnouncement({ title: '', content: '', category: 'general', image_url: '' })
    }

    async function handleDelete(id) {
        if (!confirm('정말 삭제하시겠습니까?')) return

        try {
            const { error } = await supabase.from('announcements').delete().eq('id', id)
            if (error) throw error
            alert('삭제되었습니다!')
            loadData()
        } catch (error) {
            alert('삭제 실패: ' + error.message)
        }
    }

    // 주보 관련 함수들
    async function handleBulletinImagesUpload(e) {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        // 이미지 파일만 허용
        const invalidFiles = files.filter(f => !f.type.startsWith('image/'))
        if (invalidFiles.length > 0) {
            alert('이미지 파일만 업로드 가능합니다.')
            return
        }

        setUploadingFile(true)
        try {
            const uploadPromises = files.map(file => uploadImage(file))
            const uploadedUrls = await Promise.all(uploadPromises)

            // 기존 이미지에 새 이미지 추가
            const newImages = uploadedUrls.map((url, index) => ({
                url,
                order: newBulletin.images.length + index
            }))

            setNewBulletin({
                ...newBulletin,
                images: [...newBulletin.images, ...newImages]
            })

            alert(`${files.length}개 이미지 업로드 완료!`)
        } catch (error) {
            console.error('이미지 업로드 오류:', error)
            alert('이미지 업로드 실패: ' + error.message)
        } finally {
            setUploadingFile(false)
        }
    }

    function removeBulletinImage(index) {
        const newImages = newBulletin.images.filter((_, i) => i !== index)
        // order 재정렬
        const reorderedImages = newImages.map((img, i) => ({ ...img, order: i }))
        setNewBulletin({ ...newBulletin, images: reorderedImages })
    }

    function moveBulletinImage(index, direction) {
        const newImages = [...newBulletin.images]
        const newIndex = index + direction

        if (newIndex < 0 || newIndex >= newImages.length) return

        // 위치 교환
        [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]

        // order 재정렬
        const reorderedImages = newImages.map((img, i) => ({ ...img, order: i }))
        setNewBulletin({ ...newBulletin, images: reorderedImages })
    }

    async function handleBulletinCoverUpload(e) {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드 가능합니다.')
            return
        }

        setUploadingImage(true)
        try {
            const imageUrl = await uploadImage(file)
            setNewBulletin({ ...newBulletin, cover_image_url: imageUrl })
            alert('표지 이미지 업로드 완료!')
        } catch (error) {
            console.error('이미지 업로드 오류:', error)
            alert('이미지 업로드 실패: ' + error.message)
        } finally {
            setUploadingImage(false)
        }
    }

    async function handleBulletinSubmit(e) {
        e.preventDefault()
        setLoading(true)

        try {
            // 첫 번째 이미지를 pdf_url로도 저장 (호환성)
            const firstImageUrl = newBulletin.images.length > 0 ? newBulletin.images[0].url : null

            const { error } = await supabase
                .from('bulletins')
                .insert({
                    title: newBulletin.title,
                    week_of: newBulletin.week_of,
                    pdf_url: firstImageUrl, // 호환성을 위해
                    images: newBulletin.images,
                    cover_image_url: newBulletin.cover_image_url || null,
                    published_at: new Date().toISOString()
                })

            if (error) throw error

            alert('주보가 등록되었습니다!')
            setNewBulletin({ title: '', week_of: '', images: [], cover_image_url: '' })
            loadData()
        } catch (error) {
            console.error('주보 등록 오류:', error)
            alert('등록 실패: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleBulletinDelete(id) {
        if (!confirm('정말 삭제하시겠습니까?')) return

        try {
            const { error } = await supabase.from('bulletins').delete().eq('id', id)
            if (error) throw error
            alert('삭제되었습니다!')
            loadData()
        } catch (error) {
            alert('삭제 실패: ' + error.message)
        }
    }

    return (
        <div className="admin-view">
            <div className="admin-header">
                <h2>⚙️ 관리자</h2>
            </div>

            <div className="admin-tabs">
                <button className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                    📊 대시보드
                </button>
                <button className={`tab ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => setActiveTab('announcements')}>
                    📢 공지사항
                </button>
                <button className={`tab ${activeTab === 'bulletins' ? 'active' : ''}`} onClick={() => setActiveTab('bulletins')}>
                    📖 주보
                </button>
            </div>

            {activeTab === 'dashboard' && (
                <div className="admin-content">
                    <h3>📊 현황</h3>
                    <div className="stats-grid">
                        <Card padding="md" className="stat-card">
                            <div className="stat-number">{announcements.length}</div>
                            <div className="stat-label">활성 공지사항</div>
                        </Card>
                        <Card padding="md" className="stat-card">
                            <div className="stat-number">{bulletins.length}</div>
                            <div className="stat-label">등록된 주보</div>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'announcements' && (
                <div className="admin-content">
                    <h3>📢 공지사항 관리</h3>

                    <Card padding="md" className="form-card">
                        <h4>{editingId ? '공지사항 수정' : '새 공지사항 작성'}</h4>
                        <form onSubmit={handleSubmit} className="announcement-form">
                            <div className="form-group">
                                <label>카테고리</label>
                                <select value={newAnnouncement.category} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })} required>
                                    <option value="general">📌 일반</option>
                                    <option value="urgent">🔴 긴급</option>
                                    <option value="event">🎉 행사</option>
                                    <option value="liturgy">⛪ 전례</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>제목</label>
                                <input type="text" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} placeholder="공지사항 제목" required />
                            </div>

                            <div className="form-group">
                                <label>내용</label>
                                <textarea value={newAnnouncement.content} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} placeholder="공지사항 내용" rows="6" required />
                            </div>

                            <div className="form-group">
                                <label>이미지 (선택)</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                                {uploadingImage && <p className="upload-status">업로드 중...</p>}
                                {newAnnouncement.image_url && (
                                    <div className="image-preview">
                                        <img src={newAnnouncement.image_url} alt="미리보기" />
                                        <button type="button" onClick={() => setNewAnnouncement({ ...newAnnouncement, image_url: '' })} className="remove-image">
                                            ✕ 제거
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="form-actions">
                                <Button type="submit" variant="primary" disabled={loading || uploadingImage}>
                                    {loading ? '저장 중...' : editingId ? '수정 완료' : '등록'}
                                </Button>
                                {editingId && <Button type="button" variant="ghost" onClick={handleCancelEdit}>취소</Button>}
                            </div>
                        </form>
                    </Card>

                    <div className="announcements-list">
                        <h4>등록된 공지사항 ({announcements.length})</h4>
                        {announcements.map(a => (
                            <Card key={a.id} padding="md" className="announcement-item">
                                <div className="announcement-header">
                                    <span className={`category-badge category-${a.category}`}>
                                        {a.category === 'urgent' && '🔴 긴급'}
                                        {a.category === 'event' && '🎉 행사'}
                                        {a.category === 'liturgy' && '⛪ 전례'}
                                        {a.category === 'general' && '📌 일반'}
                                    </span>
                                    <span className="announcement-date">{new Date(a.published_at).toLocaleDateString('ko-KR')}</span>
                                </div>
                                <h5>{a.title}</h5>
                                <p>{a.content}</p>
                                {a.image_url && <div className="announcement-image"><img src={a.image_url} alt={a.title} /></div>}
                                <div className="announcement-actions">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(a)}>수정</Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDelete(a.id)}>삭제</Button>
                                </div>
                            </Card>
                        ))}
                        {announcements.length === 0 && <p className="empty-message">등록된 공지사항이 없습니다.</p>}
                    </div>
                </div>
            )}

            {activeTab === 'bulletins' && (
                <div className="admin-content">
                    <h3>📖 주보 관리</h3>

                    <Card padding="md" className="form-card">
                        <h4>새 주보 등록</h4>
                        <form onSubmit={handleBulletinSubmit} className="announcement-form">
                            <div className="form-group">
                                <label>주보 제목</label>
                                <input
                                    type="text"
                                    value={newBulletin.title}
                                    onChange={(e) => setNewBulletin({ ...newBulletin, title: e.target.value })}
                                    placeholder="예: 대림 제2주일"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>주일 날짜</label>
                                <input
                                    type="date"
                                    value={newBulletin.week_of}
                                    onChange={(e) => setNewBulletin({ ...newBulletin, week_of: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>주보 이미지 (여러 장 업로드 가능)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBulletinImagesUpload}
                                    disabled={uploadingFile}
                                    multiple
                                />
                                {uploadingFile && <p className="upload-status">이미지 업로드 중...</p>}

                                {newBulletin.images.length > 0 && (
                                    <div className="images-preview">
                                        <p className="images-count">📄 {newBulletin.images.length}개 페이지</p>
                                        <div className="images-grid">
                                            {newBulletin.images.sort((a, b) => a.order - b.order).map((img, index) => (
                                                <div key={index} className="image-preview-item">
                                                    <img src={img.url} alt={`페이지 ${index + 1}`} />
                                                    <div className="image-controls">
                                                        <button
                                                            type="button"
                                                            onClick={() => moveBulletinImage(index, -1)}
                                                            disabled={index === 0}
                                                            className="move-btn"
                                                        >
                                                            ↑
                                                        </button>
                                                        <span>{index + 1}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => moveBulletinImage(index, 1)}
                                                            disabled={index === newBulletin.images.length - 1}
                                                            className="move-btn"
                                                        >
                                                            ↓
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeBulletinImage(index)}
                                                            className="remove-btn"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>표지 이미지 (선택)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBulletinCoverUpload}
                                    disabled={uploadingImage}
                                />
                                {uploadingImage && <p className="upload-status">이미지 업로드 중...</p>}
                                {newBulletin.cover_image_url && (
                                    <div className="image-preview">
                                        <img src={newBulletin.cover_image_url} alt="표지 미리보기" />
                                        <button type="button" onClick={() => setNewBulletin({ ...newBulletin, cover_image_url: '' })} className="remove-image">
                                            ✕ 제거
                                        </button>
                                    </div>
                                )}
                            </div>

                            <Button type="submit" variant="primary" disabled={loading || uploadingFile || uploadingImage || newBulletin.images.length === 0}>
                                {loading ? '등록 중...' : '주보 등록'}
                            </Button>
                        </form>
                    </Card>

                    <div className="announcements-list">
                        <h4>등록된 주보 ({bulletins.length})</h4>
                        {bulletins.map(b => (
                            <Card key={b.id} padding="md" className="bulletin-item">
                                <div className="bulletin-header">
                                    <h5>{b.title}</h5>
                                    <span className="bulletin-date">{new Date(b.week_of).toLocaleDateString('ko-KR')}</span>
                                </div>
                                {b.cover_image_url && (
                                    <div className="bulletin-cover">
                                        <img src={b.cover_image_url} alt={b.title} />
                                    </div>
                                )}
                                <div className="announcement-actions">
                                    <Button variant="outline" size="sm" onClick={() => window.open(b.pdf_url, '_blank')}>
                                        📄 보기
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleBulletinDelete(b.id)}>삭제</Button>
                                </div>
                            </Card>
                        ))}
                        {bulletins.length === 0 && <p className="empty-message">등록된 주보가 없습니다.</p>}
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminView
