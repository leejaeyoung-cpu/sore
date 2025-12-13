import './TopNav.css'

function TopNav({ currentPage, onNavigate }) {
    const navItems = [
        { id: 'home', icon: '🏠', label: '홈' },
        { id: 'bulletin', icon: '📖', label: '주보' },
        { id: 'announcements', icon: '📢', label: '공지' },
        { id: 'community', icon: '👥', label: '게시판' },
        { id: 'donation', icon: '🤝', label: '단체' }
    ]

    return (
        <nav className="top-nav">
            <div className="top-nav-scroll">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        className={`top-nav-item ${currentPage === item.id ? 'active' : ''}`}
                        onClick={() => onNavigate(item.id)}
                    >
                        <span className="top-nav-icon">{item.icon}</span>
                        <span className="top-nav-label">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    )
}

export default TopNav
