import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import './BulletinViewer.css'

// PDF.js worker 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

function BulletinViewer({ bulletin, onClose }) {
    const [numPages, setNumPages] = useState(null)
    const [pageNumber, setPageNumber] = useState(1)
    const [loading, setLoading] = useState(true)

    const isPDF = bulletin.pdf_url?.toLowerCase().endsWith('.pdf')
    const hasCoverImage = bulletin.cover_image_url

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages)
        setLoading(false)
    }

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
                            {isPDF && <div className="section-divider">주보 내용</div>}
                        </div>
                    )}

                    {/* PDF 내용 */}
                    {isPDF ? (
                        <div className="bulletin-pdf-section">
                            {loading && <div className="viewer-loading">주보 로딩 중...</div>}
                            <Document
                                file={bulletin.pdf_url}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={(error) => {
                                    console.error('PDF 로드 오류:', error)
                                    setLoading(false)
                                }}
                                loading={<div className="viewer-loading">PDF 로딩 중...</div>}
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    width={Math.min(window.innerWidth - 40, 800)}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            </Document>

                            {numPages && numPages > 1 && (
                                <div className="page-controls">
                                    <button
                                        onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                                        disabled={pageNumber <= 1}
                                    >
                                        ← 이전
                                    </button>
                                    <span>{pageNumber} / {numPages}</span>
                                    <button
                                        onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                                        disabled={pageNumber >= numPages}
                                    >
                                        다음 →
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        // PDF가 없고 이미지만 있는 경우 (이미 위에 표지로 표시됨)
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
                        📥 원본 다운로드
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BulletinViewer
