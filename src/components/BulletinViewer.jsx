import { useState } from 'react'
import './BulletinViewer.css'

function BulletinViewer({ bulletin, onClose }) {
    const isPDF = bulletin.pdf_url?.toLowerCase().endsWith('.pdf')
    const hasCoverImage = bulletin.cover_image_url

    return (
        <div className="bulletin-viewer-overlay" onClick={onClose}>
            <div className="bulletin-viewer" onClick={(e) => e.stopPropagation()}>
                <div className="viewer-header">
                    <h3>{bulletin.title}</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="viewer-content">
                    {/* 표지 이미지가 있으면 맨 위에 표시 */}
                    {hasCoverImage && (
                        <div className="bulletin-cover-section">
                            <img
                                src={bulletin.cover_image_url}
                                alt={`${bulletin.title} 표지`}
                                className="bulletin-cover-image"
                            />
                            {isPDF && <div className="section-divider">📄 주보 내용</div>}
                        </div>
                    )}

                    {/* PDF 또는 이미지 내용 */}
                    {isPDF ? (
                        <div className="bulletin-pdf-section">
                            <iframe
                                src={bulletin.pdf_url}
                                className="pdf-iframe"
                                title={bulletin.title}
                            />
                        </div>
                    ) : (
                        // PDF가 없고 이미지만 있는 경우
                        !hasCoverImage && (
                            <div className="bulletin-image-only">
                                <img
                                    src={bulletin.pdf_url}
                                    alt={bulletin.title}
                                    className="bulletin-image"
                                />
                            </div>
                        )
                    )}
                </div>

                <div className="viewer-footer">
                    <button className="download-btn" onClick={() => window.open(bulletin.pdf_url, '_blank')}>
                        📥 새 탭에서 열기
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BulletinViewer
