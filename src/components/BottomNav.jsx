import './BottomNav.css'

function BottomNav({ currentPage, onNavigate }) {
    const navItems = [
        { id: 'home', icon: '🏠', label: '홈', enabled: true },
        { id: 'announcements', icon: '📢', label: '공지사항', enabled: true },
        { id: 'bulletin', icon: '📖', label: '주보', enabled: true },
        { id: 'board', icon: '📋', label: '게시판', enabled: true },
        { id: 'donation', icon: '🤝', label: '단체', enabled: true },
        { id: 'more', icon: '⋯', label: '더보기', enabled: true }
    ]

    function handleClick(item) {
        if (!item.enabled) {
            alert('🚧 준비 중인 기능입니다')
            return
        }
        onNavigate(item.id)
    }

    return (
        <nav className="bottom-nav">
            {navItems.map(item => (
                <button
                    key={item.id}
                    className={`nav-item ${currentPage === item.id ? 'active' : ''} ${!item.enabled ? 'disabled' : ''}`}
                    onClick={() => handleClick(item)}
                >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                </button>
            ))}
        </nav>
    )
}

export default BottomNav
