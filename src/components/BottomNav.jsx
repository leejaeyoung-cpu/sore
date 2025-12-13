import './BottomNav.css'

function BottomNav({ currentPage, onNavigate }) {
    const navItems = [
        { id: 'home', icon: '🏠', label: '홈' },
        { id: 'bulletin', icon: '📖', label: '주보' },
        { id: 'community', icon: '👥', label: '게시판' },
        { id: 'donation', icon: '💰', label: '헌금' },
        { id: 'more', icon: '⋯', label: '더보기' }
    ]

    return (
        <nav className="bottom-nav">
            {navItems.map(item => (
                <button
                    key={item.id}
                    className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                    onClick={() => onNavigate(item.id)}
                >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                </button>
            ))}
        </nav>
    )
}

export default BottomNav
