import './AnnouncementViewer.css'

function AnnouncementViewer({ announcement, onClose }) {
    const categoryEmoji = {
        urgent: '🔴',
        event: '🎉',
        liturgy: '⛪',
        general: '📌'
    }

    const categoryName = {
        urgent: '긴급',
        event: '행사',
        liturgy: '전례',
        general: '일반'
    }

    return (
        <div className="announcement-viewer-overlay" onClick={onClose}>
            <div className="announcement-viewer" onClick={(e) => e.stopPropagation()}>
                <div className="viewer-header">
                    <div className="header-content">
                        <span className={`category-badge category-${announcement.category}`}>
                            {categoryEmoji[announcement.category]} {categoryName[announcement.category]}
                        </span>
                        <h3>{announcement.title}</h3>
                        <p className="announcement-date">
                            {new Date(announcement.published_at).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="viewer-content">
                    {announcement.image_url && (
                        <div className="announcement-image-section">
                            <img
                                src={announcement.image_url}
                                alt={announcement.title}
                                className="announcement-image"
                            />
                        </div>
                    )}

                    <div className="announcement-content">
                        <p>{announcement.content}</p>
                    </div>
                </div>

                <div className="viewer-footer">
                    <button className="close-footer-btn" onClick={onClose}>
                        닫기
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AnnouncementViewer
