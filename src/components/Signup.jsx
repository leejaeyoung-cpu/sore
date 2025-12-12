import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Button from './Button'
import './Auth.css'

function Signup({ onSwitchToLogin }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const { signUp } = useAuth()

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.')
            return
        }

        if (password.length < 6) {
            setError('비밀번호는 최소 6자 이상이어야 합니다.')
            return
        }

        setLoading(true)

        try {
            await signUp(email, password, fullName)
            setSuccess(true)
        } catch (error) {
            setError('회원가입 실패: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2>✅ 회원가입 완료</h2>
                    <p className="auth-success-message">
                        이메일로 인증 링크가 전송되었습니다.<br />
                        이메일을 확인하여 계정을 활성화해주세요.
                    </p>
                    <Button variant="primary" fullWidth onClick={onSwitchToLogin}>
                        로그인으로 이동
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>⛪ 회원가입</h2>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>이름</label>
                        <input
                            type="text"
                            value={fullName}
                            type="text"
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="홍길동"
                            required
                            autoComplete="name"
                        />
                    </div>

                    <div className="form-group">
                        <label>이메일</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label>비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="최소 6자 이상"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label>비밀번호 확인</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="비밀번호 재입력"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <Button type="submit" variant="primary" fullWidth disabled={loading}>
                        {loading ? '처리 중...' : '회원가입'}
                    </Button>
                </form>

                <div className="auth-footer">
                    <p>
                        이미 계정이 있으신가요?{' '}
                        <button className="auth-link" onClick={onSwitchToLogin}>
                            로그인
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Signup
