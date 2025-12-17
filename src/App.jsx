import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './App.css'
import MobileFrame from './components/MobileFrame'
import DualMobileLayout from './components/DualMobileLayout'
import BelieverView from './components/BelieverView'
import AdminView from './components/AdminView'
import Login from './components/Login'
import Signup from './components/Signup'
import Button from './components/Button'
import InstallPrompt from './components/InstallPrompt'

function AppContent() {
    const [authMode, setAuthMode] = useState('login') // 'login' or 'signup'
    const { user, loading, signOut, isAdmin } = useAuth()

    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1000)

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth > 1000)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    if (loading) {
        return (
            <div className="loading-screen">
                <h2>⛪ 로딩 중...</h2>
            </div>
        )
    }

    // 데스크탑인 경우 (로그인 여부 상관없이 듀얼 뷰 표시)
    if (isDesktop) {
        let leftScreen;
        if (!user) {
            leftScreen = authMode === 'signup'
                ? <Signup onSwitchToLogin={() => setAuthMode('login')} />
                : <Login onSwitchToSignup={() => setAuthMode('signup')} />;
        } else {
            leftScreen = <BelieverView user={user} signOut={signOut} isAdmin={isAdmin} />;
        }

        let rightScreen;
        if (!user) {
            rightScreen = (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    padding: '20px',
                    textAlign: 'center',
                    color: '#4a5568'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
                    <h3>로그인 필요</h3>
                    <p>왼쪽 화면에서 로그인하시면<br />관리자 기능을 사용할 수 있습니다.</p>
                </div>
            );
        } else if (isAdmin) {
            rightScreen = (
                <div className="app-full-screen">
                    <AdminView />
                </div>
            );
        } else {
            rightScreen = (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    padding: '20px',
                    textAlign: 'center',
                    color: '#4a5568'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                    <h3>관리자 권한 필요</h3>
                    <p>관리자 계정으로 로그인하시면<br />이곳에 관리자 화면이 표시됩니다.</p>
                </div>
            );
        }

        return (
            <DualMobileLayout
                leftContent={leftScreen}
                rightContent={rightScreen}
            />
        )
    }

    // 모바일인 경우
    if (!user) {
        if (authMode === 'signup') {
            return <Signup onSwitchToLogin={() => setAuthMode('login')} />
        }
        return <Login onSwitchToSignup={() => setAuthMode('signup')} />
    }

    return (
        <div className="app-full-screen">
            <BelieverView user={user} signOut={signOut} isAdmin={isAdmin} />
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
