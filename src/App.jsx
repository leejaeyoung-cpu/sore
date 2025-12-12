import './App.css'
import MobileFrame from './components/MobileFrame'
import BelieverView from './components/BelieverView'
import AdminView from './components/AdminView'

function App() {
    return (
        <>
            <h1 className="app-title">⛪ 성당 앱 데모</h1>
            <div className="app-container">
                <MobileFrame title="신자용">
                    <BelieverView />
                </MobileFrame>
                <MobileFrame title="관리자용">
                    <AdminView />
                </MobileFrame>
            </div>
        </>
    )
}

export default App
