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
    const isImage = !isPDF

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
                    {isImage ? (
                        <img
                            src={bulletin.pdf_url}
                            alt={bulletin.title}
                            className="bulletin-image"
                        />
                    ) : (
                        <>
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
                        </>
                    )}
                </div>

                <div className="viewer-footer">
                    <button className="download-btn" onClick={() => window.open(bulletin.pdf_url, '_blank')}>
                        📥 다운로드
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BulletinViewer
