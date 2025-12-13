import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './App.css'
import MobileFrame from './components/MobileFrame'
import BelieverView from './components/BelieverView'
import AdminView from './components/AdminView'
import Login from './components/Login'
import Signup from './components/Signup'
import Button from './components/Button'
import InstallPrompt from './components/InstallPrompt'

function AppContent() {
    const [authMode, setAuthMode] = useState('login') // 'login' or 'signup'
    const { user, loading, signOut, isAdmin } = useAuth()

    if (loading) {
        return (
            <div className="loading-screen">
                <h2>⛪ 로딩 중...</h2>
            </div>
        )
    }

    // 로그인하지 않은 경우
    if (!user) {
        if (authMode === 'signup') {
            return <Signup onSwitchToLogin={() => setAuthMode('login')} />
        }
        return <Login onSwitchToSignup={() => setAuthMode('signup')} />
    }

    // 로그인한 경우 - 기존 UI 표시
    const isAdminUser = user.email === 'brookin@hanmail.net'

    return (
        <div className="app-container">
            <div className="app-header">
                <div className="user-info">
                    <span>👤 {user.email}</span>
                    {isAdminUser && <span className="admin-badge">관리자</span>}
                </div>
                <Button variant="ghost" size="sm" onClick={signOut}>
                    로그아웃
                </Button>
            </div>

            <div className="frames-container">
                <MobileFrame title="신자용">
                    <BelieverView />
                </MobileFrame>

                {isAdminUser && (
                    <MobileFrame title="관리자용">
                        <AdminView />
                    </MobileFrame>
                )}
            </div>
        </div>
    )
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
            <InstallPrompt />
        </AuthProvider>
    )
}

export default App
