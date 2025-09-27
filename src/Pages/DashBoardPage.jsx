import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Image from '../components/Image';
import './DashBoardPage.css';

// 임시 데이터 - 등록된 사용자들 (실제로는 DB에서 가져올 데이터)
const registeredUsers = [
    'kimcs@example.com',
    'parkyh@example.com',
    'leemj@example.com',
    'test@test.com',
    'user@example.com'
];

const chatListData = [
    {
        id: 1,
        name: '김철수',
        message: ' 안녕하세요',
        time: '1시간 전',
        img: 'https://via.placeholder.com/56'
    },
    {
        id: 2,
        name: '박영희',
        message: ' 네, 확인했습니다.',
        time: '2시간 전',
        img: 'https://via.placeholder.com/56'
    },
    {
        id: 3,
        name: '이민준',
        message: '   ㅋㅋㅋㅋㅋ',
        time: '어제',
        img: 'https://via.placeholder.com/56'
    }
];

// 채팅창 컴포넌트 (새로 추가)
function ChatRoom({ user, messages, onSendMessage }) {
    const [inputValue, setInputValue] = useState('');

    const handleSendMessage = () => {
        if (inputValue.trim() === '') return;
        onSendMessage(user.id, { text: inputValue, sender: 'me' });
        setInputValue('');
    };

    const handleInputKeyDown = e => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="chat-room">
            <div className="chat-header">
                <Image src={undefined} alt={user.name} style={{ width: '40px', height: '40px' }} />
                <h3>{user.name}</h3>
            </div>
            <div className="chat-messages">
                {!messages || messages.length === 0 ? (
                    <p>{user.name}님과의 대화를 시작해보세요.</p>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={msg.sender === 'me' ? 'my-message' : 'other-message'}>
                            {msg.text}
                        </div>
                    ))
                )}
            </div>
            <div className="chat-input-area">
                <input
                    type="text"
                    placeholder="메시지 입력..."
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                />
                <button onClick={handleSendMessage}>전송</button>
            </div>
        </div>
    );
}

export default function DashBoard() {
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatMessages, setChatMessages] = useState({});
    const [chatList, setChatList] = useState(chatListData);
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [showSignupPrompt, setShowSignupPrompt] = useState(false);
    const [unregisteredEmail, setUnregisteredEmail] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    const handleChatItemClick = chat => {
        setSelectedChat(chat);
    };

    const handleSendMessage = (chatId, message) => {
        setChatMessages(prev => ({
            ...prev,
            [chatId]: [...(prev[chatId] || []), message]
        }));
    };

    const handleAddChatClick = () => {
        setShowEmailInput(prev => !prev);
    };

    const handleEmailInputChange = e => {
        setNewEmail(e.target.value);
    };

    const handleEmailInputKeyDown = e => {
        if (e.key === 'Enter') {
            handleAddNewChat();
        }
    };

    const handleAddNewChat = async () => {
        if (!newEmail.trim()) return;

        // 간단한 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            alert('유효한 이메일 주소를 입력해주세요.');
            return;
        }

        // DB에서 사용자 존재 여부 확인 (실제로는 API 호출)
        const isUserRegistered = await checkUserExists(newEmail);

        if (!isUserRegistered) {
            // 등록되지 않은 사용자인 경우
            setUnregisteredEmail(newEmail);
            setShowEmailInput(false);
            setShowSignupPrompt(true);
            return;
        }

        // 등록된 사용자인 경우 채팅방 추가
        const newId = chatList.length > 0 ? Math.max(...chatList.map(c => c.id)) + 1 : 1;
        setChatList([
            ...chatList,
            {
                id: newId,
                name: newEmail,
                message: '새로운 채팅방입니다.',
                time: '방금 전',
                img: 'https://via.placeholder.com/56'
            }
        ]);
        setNewEmail('');
        setShowEmailInput(false);
    };

    // 사용자 존재 여부 확인 (더미 함수 - 실제로는 API 호출)
    const checkUserExists = async email => {
        // 실제 구현에서는 서버 API 호출
        // const response = await fetch(`/api/users/check?email=${email}`);
        // return response.ok;

        // 더미 로직: registeredUsers 배열에서 확인
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(registeredUsers.includes(email));
            }, 500); // 네트워크 지연 시뮬레이션
        });
    };

    const handleSignupPromptClose = () => {
        setShowSignupPrompt(false);
        setUnregisteredEmail('');
        setCopySuccess(false); // 복사 상태 초기화
    };

    const handleCopySignupLink = async () => {
        try {
            const signupUrl = `${window.location.origin}/signup`;
            await navigator.clipboard.writeText(signupUrl);
            setCopySuccess(true);

            // 3초 후 복사 성공 메시지 숨기기
            setTimeout(() => {
                setCopySuccess(false);
            }, 3000);
        } catch (error) {
            console.error('클립보드 복사 실패:', error);
            // 폴백: 텍스트 선택 방식
            const textArea = document.createElement('textarea');
            textArea.value = `${window.location.origin}/signup`;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopySuccess(true);

            setTimeout(() => {
                setCopySuccess(false);
            }, 3000);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar
                style={{
                    backgroundColor: '#a1a1a183',
                    color: '#fff',
                    width: '350px',
                    position: 'relative'
                }}>
                <div
                    className="sidebar-header"
                    style={{
                        position: 'relative',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        paddingRight: '40px'
                    }}>
                    <h2 style={{ margin: 0 }}>메시지</h2>
                    <button
                        style={{
                            position: 'absolute',
                            right: '0',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: '#fff',
                            color: '#80caff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            fontSize: '22px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                        onClick={handleAddChatClick}
                        title="새 채팅 추가">
                        +
                    </button>
                </div>
                <div className="chat-list">
                    {chatList.map(chat => (
                        <div
                            key={chat.id}
                            className="chat-item"
                            onClick={() => handleChatItemClick(chat)}>
                            <Image
                                src={undefined}
                                alt={chat.name}
                                style={{ width: '56px', height: '56px' }}
                            />
                            <div className="chat-info">
                                <span className="chat-name">{chat.name}</span>
                                <span className="chat-preview">
                                    {chat.message} · {chat.time}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Sidebar>

            {/* 이메일 입력 팝업 */}
            {showEmailInput && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.18)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}
                    onClick={handleAddChatClick}>
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: '18px',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                            padding: '32px 28px',
                            minWidth: '320px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            position: 'relative'
                        }}
                        onClick={e => e.stopPropagation()}>
                        <h3 style={{ margin: 0, fontSize: '20px', textAlign: 'center' }}>
                            새 채팅 시작
                        </h3>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={handleEmailInputChange}
                            onKeyDown={handleEmailInputKeyDown}
                            placeholder="상대 이메일 입력..."
                            style={{
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid #80caff',
                                fontSize: '16px'
                            }}
                            autoFocus
                        />
                        <button
                            style={{
                                background: '#80caff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 0',
                                fontSize: '16px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                            onClick={handleAddNewChat}>
                            확인
                        </button>
                        <button
                            style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '22px',
                                color: '#80caff',
                                cursor: 'pointer'
                            }}
                            onClick={handleAddChatClick}
                            title="닫기">
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* 회원가입 안내 팝업 */}
            {showSignupPrompt && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000
                    }}
                    onClick={handleSignupPromptClose}>
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: '20px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                            padding: '40px 32px',
                            minWidth: '400px',
                            maxWidth: '90vw',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                            position: 'relative',
                            textAlign: 'center'
                        }}
                        onClick={e => e.stopPropagation()}>
                        {/* 아이콘 */}
                        <div
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: '#ff6b6b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 10px',
                                fontSize: '28px',
                                color: 'white'
                            }}>
                            ⚠️
                        </div>

                        <h3
                            style={{
                                margin: 0,
                                fontSize: '24px',
                                color: '#333',
                                fontWeight: 'bold'
                            }}>
                            존재하지 않는 사용자
                        </h3>

                        <p
                            style={{
                                margin: 0,
                                fontSize: '16px',
                                color: '#666',
                                lineHeight: '1.5'
                            }}>
                            <strong>{unregisteredEmail}</strong>은<br />
                            등록되지 않은 이메일입니다.
                        </p>

                        <p
                            style={{
                                margin: 0,
                                fontSize: '16px',
                                color: '#333'
                            }}>
                            먼저 회원가입을 진행해주세요.
                        </p>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                marginTop: '10px'
                            }}>
                            <button
                                onClick={handleCopySignupLink}
                                style={{
                                    background: copySuccess ? '#28a745' : '#80caff',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '14px 20px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                                onMouseOver={e => {
                                    if (!copySuccess) {
                                        e.target.style.background = '#6bb3ff';
                                    }
                                }}
                                onMouseOut={e => {
                                    if (!copySuccess) {
                                        e.target.style.background = '#80caff';
                                    }
                                }}>
                                {copySuccess ? (
                                    <>✓ 링크가 복사되었습니다!</>
                                ) : (
                                    <>📋 회원가입 링크 복사</>
                                )}
                            </button>

                            <button
                                onClick={handleSignupPromptClose}
                                style={{
                                    background: 'transparent',
                                    color: '#666',
                                    border: '1px solid #ddd',
                                    borderRadius: '10px',
                                    padding: '12px 20px',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={e => {
                                    e.target.style.background = '#f5f5f5';
                                    e.target.style.color = '#333';
                                }}
                                onMouseOut={e => {
                                    e.target.style.background = 'transparent';
                                    e.target.style.color = '#666';
                                }}>
                                닫기
                            </button>
                        </div>

                        {/* 복사된 링크 표시 */}
                        {copySuccess && (
                            <div
                                style={{
                                    background: '#f8f9fa',
                                    border: '1px solid #e9ecef',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    marginTop: '8px',
                                    fontSize: '14px',
                                    color: '#666',
                                    wordBreak: 'break-all',
                                    fontFamily: 'monospace'
                                }}>
                                {window.location.origin}/signup
                            </div>
                        )}

                        {/* X 버튼 */}
                        <button
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '24px',
                                color: '#999',
                                cursor: 'pointer',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onClick={handleSignupPromptClose}
                            title="닫기"
                            onMouseOver={e => {
                                e.target.style.background = '#f0f0f0';
                                e.target.style.color = '#333';
                            }}
                            onMouseOut={e => {
                                e.target.style.background = 'transparent';
                                e.target.style.color = '#999';
                            }}>
                            ×
                        </button>
                    </div>
                </div>
            )}

            <main className="content-area">
                {selectedChat ? (
                    <ChatRoom
                        user={selectedChat}
                        messages={chatMessages[selectedChat.id] || []}
                        onSendMessage={handleSendMessage}
                    />
                ) : (
                    <div className="placeholder">
                        <div className="placeholder-icon"></div>
                        <h2>내 메시지</h2>
                        <p>친구에게 메시지를 보내보세요.</p>
                        <button className="message-button">메시지 보내기</button>
                    </div>
                )}
            </main>
        </div>
    );
}
