import './BelieverView.css'

function BelieverView() {
    return (
        <div className="believer-view">
            <img
                src="/KakaoTalk_20251212_155715276.jpg"
                alt="본당 사진"
                className="church-photo"
            />

            <div className="button-section">
                <button className="app-button primary">
                    📖 주보
                </button>
                <button className="app-button secondary">
                    📢 공지사항
                </button>
            </div>

            <div className="mass-schedule">
                <h2>⏰ 미사 시간 안내</h2>
                <div className="schedule-list">
                    <div className="schedule-item">
                        <span className="schedule-day">주일 미사</span>
                        <span className="schedule-time">오전 9시, 11시</span>
                    </div>
                    <div className="schedule-item">
                        <span className="schedule-day">평일 미사</span>
                        <span className="schedule-time">오전 6시 30분</span>
                    </div>
                    <div className="schedule-item">
                        <span className="schedule-day">토요일 미사</span>
                        <span className="schedule-time">오후 7시</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BelieverView
