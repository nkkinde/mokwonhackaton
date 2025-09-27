import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Image from '../components/Image';
import './Signup.css';

// 프론트 라디오값 -> 백엔드 locale 매핑
const mapUserTypeToLocale = {
    japan: 'jp',
    china: 'cn',
    korea: 'kr',
    usa: 'us',
    vietnam: 'vn'
};

function Signup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: '',
        password: '',
        password_confirm: '',
        name: '',
        user_type: 'korea' // default
    });

    const [isEmailChecked, setIsEmailChecked] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => setIsEmailChecked(false), [form.email]);

    useEffect(() => {
        if (form.password_confirm && form.password !== form.password_confirm) {
            setPasswordError('비밀번호가 일치하지 않습니다.');
        } else {
            setPasswordError('');
        }
    }, [form.password, form.password_confirm]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckDuplicateEmail = async () => {
        if (!form.email) return alert('이메일을 입력해주세요.');
        try {
            const response = await api.get(`/api/auth/check-email`, {
                params: { email: form.email }
            });
            if (response.data.available) {
                alert('사용 가능한 이메일입니다.');
                setIsEmailChecked(true);
            } else {
                alert('이미 사용 중인 이메일입니다.');
                setIsEmailChecked(false);
            }
        } catch (error) {
            if (error.response?.status === 409) {
                alert('이미 사용 중인 이메일입니다.');
            } else {
                alert('이메일 중복 확인 중 오류가 발생했습니다.');
            }
            setIsEmailChecked(false);
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (!isEmailChecked) return alert('이메일 중복 확인을 해주세요.');
        if (form.password !== form.password_confirm) return alert('비밀번호가 일치하지 않습니다.');
        if (!form.password || !form.name) return alert('모든 필드를 입력해주세요.');

        try {
            const { email, password, name, user_type } = form;
            const locale = mapUserTypeToLocale[user_type] || 'kr';

            await api.post('/api/auth/register', {
                email,
                password,
                name,
                locale // 백엔드 User.locale 필드에 저장
            });

            alert('회원가입이 완료되었습니다!');
            navigate('/login');
        } catch (error) {
            console.error('회원가입 실패:', error);
            alert('회원가입에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const countries = [
        { value: 'japan', label: 'JAPAN' },
        { value: 'china', label: 'CHINA' },
        { value: 'korea', label: 'KOREA' },
        { value: 'usa', label: 'USA' },
        { value: 'vietnam', label: 'VIETNAM' }
    ];

    return (
        <div
            className="signup-inner"
            style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
            <form className="signup-box" onSubmit={handleSubmit}>
                <div className="signup-icon">
                    <Image
                        src="/chaticon.png"
                        alt="아이콘"
                        type="logo"
                        style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '15px'
                        }}
                    />
                </div>

                <div className="signup-field">
                    <label>이메일</label>
                    <div className="input-line-group">
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="example@example.com"
                            required
                        />
                        <button
                            type="button"
                            className="check-btn"
                            onClick={handleCheckDuplicateEmail}>
                            중복 확인
                        </button>
                    </div>
                </div>

                <div className="signup-field">
                    <label>비밀번호</label>
                    <div className="input-line-group">
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="영문, 숫자 포함 8~30자"
                            required
                        />
                    </div>
                </div>

                <div className="signup-field">
                    <label>비밀번호 확인</label>
                    <div className="input-line-group">
                        <input
                            type="password"
                            name="password_confirm"
                            value={form.password_confirm}
                            onChange={handleChange}
                            placeholder="비밀번호를 다시 입력해주세요"
                            required
                        />
                    </div>
                    {passwordError && (
                        <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                            {passwordError}
                        </p>
                    )}
                </div>

                <div className="signup-field">
                    <label>이름</label>
                    <div className="input-line-group">
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="이름을 입력해주세요"
                            required
                        />
                    </div>
                </div>

                <div className="signup-radio">
                    {countries.map(country => (
                        <label key={country.value}>
                            <input
                                type="radio"
                                name="user_type"
                                value={country.value}
                                checked={form.user_type === country.value}
                                onChange={handleChange}
                            />
                            {country.label}
                        </label>
                    ))}
                </div>

                <button
                    type="submit"
                    className="signup-submit"
                    disabled={!isEmailChecked || !!passwordError}>
                    가입하기
                </button>
            </form>
        </div>
    );
}

export default Signup;
