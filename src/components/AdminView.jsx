import { useState, useEffect } from 'react'
import './AdminView.css'
import Button from './Button'
import Card from './Card'
import {
    getActiveAnnouncements, getLatestBulletins,
    getAppSetting, updateAppSetting,
    getAllPostsAdmin, deletePost,
    getGroups, getGroupMembers, updateGroupMemberRole, removeGroupMember,
    getSubscriberCount
} from '../lib/queries'
import { supabase } from '../lib/supabase'
import { uploadImage } from '../lib/cloudinary'

function AdminView() {
    const [activeTab, setActiveTab] = useState('menu')
    const [loading, setLoading] = useState(false)

    // 데이터 상태
    const [announcements, setAnnouncements] = useState([])
    const [bulletins, setBulletins] = useState([])
    const [posts, setPosts] = useState([])
    const [groups, setGroups] = useState([])
    const [homeVideoUrl, setHomeVideoUrl] = useState('')

    // 그룹 관리 상태
    const [selectedGroupId, setSelectedGroupId] = useState(null)
    const [groupMembers, setGroupMembers] = useState([])
    const [subscriberCount, setSubscriberCount] = useState(0)

    // 입력 폼 상태
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', category: 'general', image_url: '' })
    const [newBulletin, setNewBulletin] = useState({ title: '', week_of: '', images: [], cover_image_url: '' })
    const [editingId, setEditingId] = useState(null)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [uploadingFile, setUploadingFile] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const [notices, bulls, allPosts, allGroups, videoSetting, subCount] = await Promise.all([
                getActiveAnnouncements(20),
                getLatestBulletins(20),
                getAllPostsAdmin(),
                getGroups(),
                getAppSetting('home_video_url'),
                getSubscriberCount()
            ])

            setAnnouncements(notices)
            setBulletins(bulls)
            setPosts(allPosts)
            setGroups(allGroups)
            if (videoSetting) setHomeVideoUrl(videoSetting)
            setSubscriberCount(subCount)

        } catch (error) {
            console.error('데이터 로드 오류:', error)
        } finally {
            setLoading(false)
        }
    }

    // 동영상 설정 저장
    async function handleVideoSave() {
        try {
            await updateAppSetting('home_video_url', homeVideoUrl)
            alert('동영상 설정이 저장되었습니다!')
        } catch (error) {
            alert('저장 실패: ' + error.message)
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

                // 알림 전송
                try {
                    const res = await fetch('/api/send-notification', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title: '📢 새로운 공지사항',
                            body: newAnnouncement.title,
                            url: '/'
                        })
                    })
                    if (!res.ok) {
                        const errData = await res.json()
                        console.error('알림 서버 응답 오류:', errData)
                    }
                } catch (e) {
                    console.error('알림 전송 실패:', e)
                    alert('공지사항은 등록되었으나, 알림 전송 중 오류가 발생했습니다.\n(Vercel Function 로그를 확인하세요)')
                }
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
        const invalidFiles = files.filter(f => !f.type.startsWith('image/'))
        if (invalidFiles.length > 0) {
            alert('이미지 파일만 업로드 가능합니다.')
            return
        }
        setUploadingFile(true)
        try {
            const uploadPromises = files.map(file => uploadImage(file))
            const uploadedUrls = await Promise.all(uploadPromises)
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
        const reorderedImages = newImages.map((img, i) => ({ ...img, order: i }))
        setNewBulletin({ ...newBulletin, images: reorderedImages })
    }

    function moveBulletinImage(index, direction) {
        const newImages = [...newBulletin.images]
        const newIndex = index + direction
        if (newIndex < 0 || newIndex >= newImages.length) return
        [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]
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
            const firstImageUrl = newBulletin.images.length > 0 ? newBulletin.images[0].url : null
            const { error } = await supabase
                .from('bulletins')
                .insert({
                    title: newBulletin.title,
                    week_of: newBulletin.week_of,
                    pdf_url: firstImageUrl,
                    images: newBulletin.images,
                    cover_image_url: newBulletin.cover_image_url || null,
                    published_at: new Date().toISOString()
                })
            if (error) throw error
            alert('주보가 등록되었습니다!')

            // 알림 전송
            try {
                const res = await fetch('/api/send-notification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: '📖 새 주보가 등록되었습니다',
                        body: newBulletin.title,
                        url: '/'
                    })
                })
                if (!res.ok) {
                    const errData = await res.json()
                    console.error('알림 서버 응답 오류:', errData)
                }
            } catch (e) {
                console.error('알림 전송 실패:', e)
                alert('주보는 등록되었으나, 알림 전송 중 오류가 발생했습니다.')
            }

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

    // 그룹 관리 함수들
    async function handleGroupSelect(groupId) {
        setSelectedGroupId(groupId)
        if (!groupId) {
            setGroupMembers([])
            return
        }
        const members = await getGroupMembers(groupId)
        setGroupMembers(members)
    }

    async function handleMemberRoleChange(userId, newRole) {
        if (!confirm('회원 권한을 변경하시겠습니까?')) return
        const { error } = await updateGroupMemberRole(selectedGroupId, userId, newRole)
        if (!error) {
            alert('권한이 변경되었습니다.')
            handleGroupSelect(selectedGroupId)
        } else {
            alert('변경 실패')
        }
    }

    async function handleMemberRemove(userId) {
        if (!confirm('정말 이 회원을 그룹에서 탈퇴시키겠습니까?')) return
        const { error } = await removeGroupMember(selectedGroupId, userId)
        if (!error) {
            alert('탈퇴 처리되었습니다.')
            handleGroupSelect(selectedGroupId)
        } else {
            alert('처리 실패')
        }
    }

    // 게시글 삭제
    async function handlePostDelete(postId) {
        if (!confirm('정말 삭제하시겠습니까?')) return
        const { error } = await deletePost(postId)
        if (!error) {
            alert('삭제되었습니다.')
            loadData()
        } else {
            alert('삭제 실패')
        }
    }

    async function handleTestNotification() {
        if (!confirm('모든 구독자에게 테스트 알림을 보내시겠습니까?')) return

        try {
            const res = await fetch('/api/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: '🔔 테스트 알림',
                    body: '관리자 페이지에서 보낸 테스트 알림입니다.',
                    url: '/'
                })
            })

            const data = await res.json()

            if (res.ok) {
                alert(`전송 성공!\n${JSON.stringify(data, null, 2)}`)
            } else {
                alert('전송 실패: ' + (data.error || '알 수 없는 오류'))
            }
        } catch (e) {
            console.error('테스트 알림 오류:', e)
            alert('알림 전송 중 오류가 발생했습니다.')
        }
    }

    const menuItems = [
        { id: 'notifications', icon: '🔔', label: '알림 관리', desc: '푸시 알림 테스트 및 구독자 확인' },
        { id: 'announcements', icon: '📢', label: '공지사항', desc: '공지사항 작성 및 수정' },
        { id: 'bulletins', icon: '📖', label: '주보 관리', desc: '매주 주보 업로드' },
        { id: 'board', icon: '📋', label: '게시판 관리', desc: '전체 게시글 조회 및 삭제' },
        { id: 'groups', icon: '👥', label: '단체 관리', desc: '단체 생성 및 회원 관리' },
        { id: 'home', icon: '🏠', label: '홈 화면', desc: '메인 동영상 설정' },
        { id: 'dashboard', icon: '📊', label: '대시보드', desc: '전체 현황 요약' },
    ]

    return (
        <div className="admin-view">
            {activeTab === 'menu' ? (
                <div className="admin-menu-screen">
                    <div className="admin-header">
                        <h2>⚙️ 통합 관리자</h2>
                    </div>
                    <div className="admin-menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px', padding: '16px' }}>
                        {menuItems.map(item => (
                            <Card key={item.id} onClick={() => setActiveTab(item.id)} padding="md" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px', minHeight: '140px', justifyContent: 'center', transition: 'transform 0.2s' }}>
                                <div style={{ fontSize: '2.5rem' }}>{item.icon}</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{item.label}</div>
                                <div style={{ fontSize: '0.8rem', color: '#718096' }}>{item.desc}</div>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="admin-subpage">
                    <div className="admin-header-sticky" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 100, padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => setActiveTab('menu')} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '4px 8px' }}>←</button>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                            {menuItems.find(i => i.id === activeTab)?.label}
                        </h3>
                    </div>

                    <div className="admin-content-wrapper" style={{ padding: '16px', paddingBottom: '80px' }}>
                        {activeTab === 'dashboard' && (
                            <div className="admin-content">
                                <div className="stats-grid">
                                    <Card padding="md" className="stat-card">
                                        <div className="stat-number">{announcements.length}</div>
                                        <div className="stat-label">활성 공지사항</div>
                                    </Card>
                                    <Card padding="md" className="stat-card">
                                        <div className="stat-number">{bulletins.length}</div>
                                        <div className="stat-label">등록된 주보</div>
                                    </Card>
                                    <Card padding="md" className="stat-card">
                                        <div className="stat-number">{posts.length}</div>
                                        <div className="stat-label">전체 게시글</div>
                                    </Card>
                                    <Card padding="md" className="stat-card">
                                        <div className="stat-number">{groups.length}</div>
                                        <div className="stat-label">등록된 단체</div>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {activeTab === 'home' && (
                            <div className="admin-content">
                                <Card padding="md" className="form-card">
                                    <h4>메인 동영상 설정</h4>
                                    <div className="form-group">
                                        <label>YouTube URL</label>
                                        <input
                                            type="text"
                                            value={homeVideoUrl}
                                            onChange={(e) => setHomeVideoUrl(e.target.value)}
                                            placeholder="https://youtu.be/..."
                                        />
                                        <p className="help-text">유튜브 영상 주소를 입력하세요.</p>
                                    </div>
                                    <Button onClick={handleVideoSave} variant="primary">저장</Button>
                                </Card>
                            </div>
                        )}

                        {activeTab === 'announcements' && (
                            <div className="admin-content">
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
                                                    <button type="button" onClick={() => setNewAnnouncement({ ...newAnnouncement, image_url: '' })} className="remove-image">✕ 제거</button>
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
                                </div>
                            </div>
                        )}

                        {activeTab === 'bulletins' && (
                            <div className="admin-content">
                                <Card padding="md" className="form-card">
                                    <h4>새 주보 등록</h4>
                                    <form onSubmit={handleBulletinSubmit} className="announcement-form">
                                        <div className="form-group">
                                            <label>주보 제목</label>
                                            <input type="text" value={newBulletin.title} onChange={(e) => setNewBulletin({ ...newBulletin, title: e.target.value })} placeholder="예: 대림 제2주일" required />
                                        </div>
                                        <div className="form-group">
                                            <label>주일 날짜</label>
                                            <input type="date" value={newBulletin.week_of} onChange={(e) => setNewBulletin({ ...newBulletin, week_of: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>주보 이미지 (여러 장 업로드 가능)</label>
                                            <input type="file" accept="image/*" onChange={handleBulletinImagesUpload} disabled={uploadingFile} multiple />
                                            {uploadingFile && <p className="upload-status">이미지 업로드 중...</p>}
                                            {newBulletin.images.length > 0 && (
                                                <div className="images-preview">
                                                    <p className="images-count">📄 {newBulletin.images.length}개 페이지</p>
                                                    <div className="images-grid">
                                                        {newBulletin.images.sort((a, b) => a.order - b.order).map((img, index) => (
                                                            <div key={index} className="image-preview-item">
                                                                <img src={img.url} alt={`페이지 ${index + 1}`} />
                                                                <div className="image-controls">
                                                                    <button type="button" onClick={() => moveBulletinImage(index, -1)} disabled={index === 0} className="move-btn">↑</button>
                                                                    <span>{index + 1}</span>
                                                                    <button type="button" onClick={() => moveBulletinImage(index, 1)} disabled={index === newBulletin.images.length - 1} className="move-btn">↓</button>
                                                                    <button type="button" onClick={() => removeBulletinImage(index)} className="remove-btn">✕</button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label>표지 이미지 (선택)</label>
                                            <input type="file" accept="image/*" onChange={handleBulletinCoverUpload} disabled={uploadingImage} />
                                            {uploadingImage && <p className="upload-status">이미지 업로드 중...</p>}
                                            {newBulletin.cover_image_url && (
                                                <div className="image-preview">
                                                    <img src={newBulletin.cover_image_url} alt="표지 미리보기" />
                                                    <button type="button" onClick={() => setNewBulletin({ ...newBulletin, cover_image_url: '' })} className="remove-image">✕ 제거</button>
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
                                            {b.cover_image_url && <div className="bulletin-cover"><img src={b.cover_image_url} alt={b.title} /></div>}
                                            <div className="announcement-actions">
                                                <Button variant="outline" size="sm" onClick={() => window.open(b.pdf_url, '_blank')}>📄 보기</Button>
                                                <Button variant="outline" size="sm" onClick={() => handleBulletinDelete(b.id)}>삭제</Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'board' && (
                            <div className="admin-content">
                                <div className="posts-list-admin">
                                    {posts.map(post => (
                                        <Card key={post.id} padding="sm" className="post-item-admin">
                                            <div className="post-info">
                                                <span className="post-group-badge">{post.group?.name || '전체'}</span>
                                                <span className="post-title">{post.title}</span>
                                                <span className="post-author">{post.author?.name}</span>
                                                <span className="post-date">{new Date(post.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="post-actions">
                                                <Button variant="outline" size="sm" onClick={() => handlePostDelete(post.id)}>삭제</Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'groups' && (
                            <div className="admin-content">
                                <div className="groups-management">
                                    <div className="groups-list-sidebar">
                                        <h4>단체 목록</h4>
                                        {groups.map(group => (
                                            <button
                                                key={group.id}
                                                className={`group-item-btn ${selectedGroupId === group.id ? 'active' : ''}`}
                                                onClick={() => handleGroupSelect(group.id)}
                                            >
                                                {group.name}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="group-members-panel">
                                        {selectedGroupId ? (
                                            <>
                                                <h4>회원 목록 ({groupMembers.length}명)</h4>
                                                <div className="members-list">
                                                    {groupMembers.map(member => (
                                                        <div key={member.user_id} className="member-item">
                                                            <div className="member-info">
                                                                <span className="member-name">{member.profiles?.name}</span>
                                                                <span className="member-email">{member.profiles?.email}</span>
                                                            </div>
                                                            <div className="member-actions">
                                                                <select
                                                                    value={member.role}
                                                                    onChange={(e) => handleMemberRoleChange(member.user_id, e.target.value)}
                                                                    className="role-select"
                                                                >
                                                                    <option value="member">일반 회원</option>
                                                                    <option value="admin">단체장 (관리자)</option>
                                                                </select>
                                                                <button className="remove-btn-small" onClick={() => handleMemberRemove(member.user_id)}>탈퇴</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {groupMembers.length === 0 && <p>회원이 없습니다.</p>}
                                                </div>
                                            </>
                                        ) : (
                                            <p className="select-guide">왼쪽에서 단체를 선택해주세요.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="admin-content">
                                <div className="stats-grid">
                                    <Card padding="md" className="stat-card">
                                        <div className="stat-number">{subscriberCount}</div>
                                        <div className="stat-label">알림 구독 기기 수</div>
                                    </Card>
                                </div>

                                <Card padding="md" className="form-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4>알림 시스템 테스트</h4>
                                            <p className="help-text" style={{ margin: '4px 0 0 0' }}>
                                                전체 기기({subscriberCount}대) 발송
                                            </p>
                                        </div>
                                        <Button onClick={handleTestNotification} variant="primary" size="sm">발송</Button>
                                    </div>
                                    <details style={{ marginTop: '12px', fontSize: '0.85rem', color: '#718096' }}>
                                        <summary style={{ cursor: 'pointer' }}>도움말: 알림이 안 오나요?</summary>
                                        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                                            <li>앱 홈화면의 🔔 버튼 확인</li>
                                            <li>Vercel 환경변수 확인</li>
                                        </ul>
                                    </details>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminView
