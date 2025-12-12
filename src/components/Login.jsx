import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Button from './Button'
import './Auth.css'

function Login({ onSwitchToSignup }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { signIn } = useAuth()

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await signIn(email, password)
        } catch (error) {
            setError('로그인 실패: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>⛪ 로그인</h2>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
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
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <Button type="submit" variant="primary" fullWidth disabled={loading}>
                        {loading ? '로그인 중...' : '로그인'}
                    </Button>
                </form>

                <div className="auth-footer">
                    <p>
                        계정이 없으신가요?{' '}
                        <button className="auth-link" onClick={onSwitchToSignup}>
                            회원가입
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login
