import { useState } from 'react'
import './BulletinViewer.css'

function BulletinViewer({ bulletin, onClose }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // images 배열 가져오기 (새 형식) 또는 pdf_url (구 형식)
    const images = bulletin.images && bulletin.images.length > 0
        ? bulletin.images.sort((a, b) => a.order - b.order).map(img => img.url)
        : bulletin.pdf_url
            ? [bulletin.pdf_url]
            : []

    const hasCoverImage = bulletin.cover_image_url
    const totalImages = images.length

    function goToNextImage() {
        setCurrentImageIndex((prev) => Math.min(prev + 1, totalImages - 1))
    }

    function goToPrevImage() {
        setCurrentImageIndex((prev) => Math.max(prev - 1, 0))
    }

    return (
        <div className="bulletin-viewer-overlay" onClick={onClose}>
            <div className="bulletin-viewer" onClick={(e) => e.stopPropagation()}>
                <div className="viewer-header">
                    <h3>{bulletin.title}</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="viewer-content">
                    {/* 표지 이미지 */}
                    {hasCoverImage && (
                        <div className="bulletin-cover-section">
                            <img
                                src={bulletin.cover_image_url}
                                alt={`${bulletin.title} 표지`}
                                className="bulletin-cover-image"
                            />
                            {totalImages > 0 && <div className="section-divider">📄 주보 내용</div>}
                        </div>
                    )}

                    {/* 주보 이미지들 */}
                    {totalImages > 0 && (
                        <div className="bulletin-images-section">
                            <div className="image-display">
                                <img
                                    src={images[currentImageIndex]}
                                    alt={`${bulletin.title} - ${currentImageIndex + 1}페이지`}
                                    className="bulletin-page-image"
                                />
                            </div>

                            {totalImages > 1 && (
                                <div className="image-navigation">
                                    <button
                                        onClick={goToPrevImage}
                                        disabled={currentImageIndex === 0}
                                        className="nav-btn"
                                    >
                                        ← 이전
                                    </button>
                                    <span className="page-indicator">
                                        {currentImageIndex + 1} / {totalImages}
                                    </span>
                                    <button
                                        onClick={goToNextImage}
                                        disabled={currentImageIndex === totalImages - 1}
                                        className="nav-btn"
                                    >
                                        다음 →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {totalImages === 0 && !hasCoverImage && (
                        <div className="empty-bulletin">
                            <p>주보 내용이 없습니다.</p>
                        </div>
                    )}
                </div>

                <div className="viewer-footer">
                    <button className="download-btn" onClick={() => {
                        images.forEach((url, index) => {
                            setTimeout(() => window.open(url, '_blank'), index * 500)
                        })
                    }}>
                        📥 모든 페이지 다운로드
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BulletinViewer
