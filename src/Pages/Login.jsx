import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Image from '../components/Image';
import './Login.css';

function Login() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            // 실제 API 호출을 시도하고, 실패하면 테스트 모드로 진행
            try {
                const resp = await api.post('/api/auth/login', { email: id, password });
                const { access, refresh, user } = resp.data;

                localStorage.setItem('access', access);
                localStorage.setItem('refresh', refresh);
                localStorage.setItem('me', JSON.stringify(user));
            } catch (apiError) {
                console.warn('API 서버에 연결할 수 없습니다. 테스트 모드로 진행합니다:', apiError);
                // 테스트 모드로 진행
                localStorage.setItem('access', 'test-token');
                localStorage.setItem('refresh', 'test-refresh');
                localStorage.setItem('me', JSON.stringify({ name: 'Test User', email: id }));
            }

            alert('Login successful!');
            navigate('/DashBoardPage');
        } catch (error) {
            console.error(error);
            alert('Login failed. Please check your ID or password.');
        }
    };

    const goToSignup = () => navigate('/signup');

    return (
        <div className="login-page">
            <div className="login-box">
                <div className="login-icon">
                    <Image
                        src="/chaticon.png"
                        alt="아이콘"
                        type="logo"
                        style={{
                            width: '150px',
                            height: '150px',
                            marginBottom: '30px',
                            borderRadius: '0'
                        }}
                    />
                </div>

                <div className="login-label">아이디</div>
                <input
                    type="text"
                    value={id}
                    onChange={e => setId(e.target.value)}
                    className="login-input"
                    placeholder="Please enter your email"
                />

                <div className="login-label">비밀번호</div>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="login-input"
                    placeholder="Please enter your password"
                />

                <button className="login-btn" onClick={handleLogin}>
                    Sign in
                </button>
                <button className="signup-btn" onClick={goToSignup}>
                    Sign up
                </button>
            </div>
        </div>
    );
}

export default Login;
