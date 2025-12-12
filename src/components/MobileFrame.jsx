import './MobileFrame.css'

function MobileFrame({ title, children }) {
    return (
        <div className="mobile-frame">
            <div className="frame-header">{title}</div>
            <div className="phone-notch"></div>
            <div className="phone-screen">
                <div className="screen-content">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default MobileFrame
