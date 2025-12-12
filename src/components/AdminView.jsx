import './AdminView.css'

function AdminView() {
    return (
        <div className="admin-view">
            <h2 className="admin-title">관리자 메뉴</h2>
            <div className="admin-buttons">
                <button className="admin-button">
                    <span className="icon">💬</span>
                    메시지
                </button>
                <button className="admin-button">
                    <span className="icon">📖</span>
                    주보
                </button>
                <button className="admin-button">
                    <span className="icon">📢</span>
                    공지사항
                </button>
            </div>
        </div>
    )
}

export default AdminView
