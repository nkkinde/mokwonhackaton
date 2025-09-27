import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Image from '../components/Image';
import './DashBoardPage.css';
// ChatGPT 기능이 필요할 때 아래 라인 주석 해제
// import { generateChatGPTResponse, isChatGPTMessage, extractGPTQuery, prepareConversationHistory } from '../services/chatGPTService';
import { translateText } from '../services/chatGPTService';

// 더미 데이터 - 등록된 사용자들
const registeredUsers = [
    { id: 1, email: 'kimcs@example.com', name: '김철수' },
    { id: 2, email: 'parkyh@example.com', name: '박영희' },
    { id: 3, email: 'leemj@example.com', name: '이민준' },
    { id: 4, email: 'test@test.com', name: '테스트 사용자' },
    { id: 5, email: 'user@example.com', name: '사용자' }
];

// 채팅방 목록 더미 데이터
const chatListData = [
    {
        id: 'room-1',
        name: '김철수',
        lastMessage: '안녕하세요! 오늘 회의 어떠세요?',
        lastMessageTime: '2025-09-28T10:30:00Z',
        memberIds: [1, 2], // 김철수, 박영희
        avatarUrl: 'https://invalid-image-url.com/fake.jpg'
    },
    {
        id: 'room-2',
        name: '박영희',
        lastMessage: '네, 확인했습니다. 자료 보내드렸어요.',
        lastMessageTime: '2025-09-28T09:15:00Z',
        memberIds: [2, 3], // 박영희, 이민준
        avatarUrl: 'https://broken-url.fake/nonexistent.png'
    },
    {
        id: 'room-3',
        name: '이민준',
        lastMessage: 'ㅋㅋㅋㅋㅋ 재밌네요!',
        lastMessageTime: '2025-09-27T20:45:00Z',
        memberIds: [3, 4], // 이민준, 테스트 사용자
        avatarUrl: null
    },
    {
        id: 'room-4',
        name: '팀 채널',
        lastMessage: '내일 회의는 오전 10시에 시작합니다.',
        lastMessageTime: '2025-09-27T18:20:00Z',
        memberIds: [1, 2, 3, 4], // 모든 멤버
        avatarUrl: undefined
    }
];

// 채팅방별 메시지 더미 데이터
const chatMessagesData = {
    'room-1': [
        {
            id: 'msg-1-1',
            senderId: 1,
            senderName: '김철수',
            body: 'Hello! How are you today?',
            createdAt: '2025-09-28T10:00:00Z',
            isMe: false
        },
        {
            id: 'msg-1-2',
            senderId: 2,
            senderName: '박영희',
            body: '네, 안녕하세요!',
            createdAt: '2025-09-28T10:05:00Z',
            isMe: true
        },
        {
            id: 'msg-1-3',
            senderId: 1,
            senderName: '김철수',
            body: "What do you think about today's meeting?",
            createdAt: '2025-09-28T10:30:00Z',
            isMe: false
        },
        {
            id: 'msg-1-4',
            senderId: 1,
            senderName: '김철수',
            body: 'I think the project is going well.',
            createdAt: '2025-09-28T10:35:00Z',
            isMe: false
        }
    ],
    'room-2': [
        {
            id: 'msg-2-1',
            senderId: 2,
            senderName: '박영희',
            body: '프로젝트 진행 상황 공유드립니다.',
            createdAt: '2025-09-28T09:00:00Z',
            isMe: true
        },
        {
            id: 'msg-2-2',
            senderId: 3,
            senderName: '이민준',
            body: "Thank you for sharing the project status. I've sent you the documents.",
            createdAt: '2025-09-28T09:15:00Z',
            isMe: false
        },
        {
            id: 'msg-2-3',
            senderId: 3,
            senderName: '이민준',
            body: 'こんにちは！プロジェクトの進捗はいかがですか？',
            createdAt: '2025-09-28T09:20:00Z',
            isMe: false
        }
    ],
    'room-3': [
        {
            id: 'msg-3-1',
            senderId: 3,
            senderName: '이민준',
            body: '어제 TV에서 본 코미디 영화',
            createdAt: '2025-09-27T20:30:00Z',
            isMe: false
        },
        {
            id: 'msg-3-2',
            senderId: 4,
            senderName: '테스트 사용자',
            body: 'ㅋㅋㅋㅋㅋ 재밌네요!',
            createdAt: '2025-09-27T20:45:00Z',
            isMe: true
        }
    ],
    'room-4': [
        {
            id: 'msg-4-1',
            senderId: 1,
            senderName: '김철수',
            body: '내일 회의 안건 공유합니다.',
            createdAt: '2025-09-27T18:00:00Z',
            isMe: false
        },
        {
            id: 'msg-4-2',
            senderId: 2,
            senderName: '박영희',
            body: '내일 회의는 오전 10시에 시작합니다.',
            createdAt: '2025-09-27T18:20:00Z',
            isMe: true
        },
        {
            id: 'msg-4-3',
            senderId: 3,
            senderName: '이민준',
            body: '네, 알겠습니다!',
            createdAt: '2025-09-27T18:25:00Z',
            isMe: false
        }
    ]
};

// 채팅창 컴포넌트
function ChatRoom({
    room,
    messages,
    onSendMessage,
    translatedMessages,
    translatingMessages,
    onTranslateToggle
}) {
    const [inputValue, setInputValue] = useState('');

    const handleSendMessage = () => {
        if (inputValue.trim() === '') return;

        const newMessage = {
            id: `msg-${room.id}-${Date.now()}`,
            senderId: 'current-user',
            senderName: '나',
            body: inputValue.trim(),
            createdAt: new Date().toISOString(),
            isMe: true
        };

        onSendMessage(room.id, newMessage);
        setInputValue('');
    };

    const handleInputKeyDown = e => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const formatTime = dateString => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div
            className="chat-room"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 채팅방 헤더 */}
            <div
                className="chat-header"
                style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: '#fff'
                }}>
                <Image
                    src={room.avatarUrl}
                    alt={room.name}
                    type="profile"
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#ddd'
                    }}
                />
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{room.name}</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                        멤버 {room.memberIds?.length || 0}명
                    </p>
                </div>
            </div>

            {/* 메시지 영역 */}
            <div
                className="chat-messages"
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px 20px',
                    backgroundColor: '#f8f9fa'
                }}>
                {!messages || messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#666', padding: '40px 0' }}>
                        <p>첫 메시지를 보내보세요!</p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div
                            key={msg.id}
                            style={{
                                marginBottom: '16px',
                                display: 'flex',
                                justifyContent: msg.isMe ? 'flex-end' : 'flex-start'
                            }}>
                            <div
                                style={{
                                    maxWidth: '70%',
                                    padding: '12px 16px',
                                    borderRadius: '16px',
                                    backgroundColor: translatedMessages[msg.id]
                                        ? '#f8fff8'
                                        : msg.isMe
                                        ? '#add8ff'
                                        : '#ffffff',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                    position: 'relative',
                                    border: 'none',
                                    borderLeft: translatedMessages[msg.id]
                                        ? '3px solid #28a745'
                                        : 'none'
                                }}>
                                {!msg.isMe && (
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            color: '#666',
                                            marginBottom: '4px',
                                            fontWeight: 'bold'
                                        }}>
                                        {msg.senderName}
                                    </div>
                                )}
                                <div
                                    style={{
                                        fontSize: '14px',
                                        lineHeight: '1.4',
                                        wordBreak: 'break-word'
                                    }}>
                                    {translatedMessages[msg.id] || msg.body}
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginTop: '4px'
                                    }}>
                                    <div
                                        style={{
                                            fontSize: '10px',
                                            color: msg.isMe ? '#0066cc' : '#999'
                                        }}>
                                        {formatTime(msg.createdAt)}
                                    </div>
                                    {!msg.isMe && (
                                        <button
                                            onClick={() => onTranslateToggle(msg.id, msg.body)}
                                            disabled={translatingMessages.has(msg.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: translatingMessages.has(msg.id)
                                                    ? 'wait'
                                                    : 'pointer',
                                                fontSize: '12px',
                                                color: translatedMessages[msg.id]
                                                    ? '#28a745'
                                                    : '#6c757d',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                opacity: translatingMessages.has(msg.id) ? 0.6 : 1,
                                                transition: 'all 0.2s ease'
                                            }}
                                            title={
                                                translatedMessages[msg.id]
                                                    ? '원문 보기'
                                                    : '번역하기'
                                            }
                                            onMouseOver={e => {
                                                if (!translatingMessages.has(msg.id)) {
                                                    e.target.style.backgroundColor = '#f8f9fa';
                                                }
                                            }}
                                            onMouseOut={e => {
                                                e.target.style.backgroundColor = 'transparent';
                                            }}>
                                            {translatingMessages.has(msg.id)
                                                ? '🔄'
                                                : translatedMessages[msg.id]
                                                ? '🔙'
                                                : '🌐'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 메시지 입력 영역 */}
            <div
                className="chat-input-area"
                style={{
                    padding: '20px 30px',
                    borderTop: '1px solid #eee',
                    backgroundColor: '#fff',
                    boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
                }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
                    <input
                        type="text"
                        placeholder="메시지를 입력하세요..."
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        style={{
                            flex: 1,
                            padding: '16px 20px',
                            border: '1px solid #e1e5e9',
                            borderRadius: '25px',
                            outline: 'none',
                            fontSize: '15px',
                            backgroundColor: '#f8f9fa',
                            transition: 'all 0.2s ease',
                            minHeight: '50px'
                        }}
                        onFocus={e => {
                            e.target.style.backgroundColor = '#ffffff';
                            e.target.style.borderColor = '#add8ff';
                            e.target.style.boxShadow = '0 0 0 3px rgba(173, 216, 255, 0.1)';
                        }}
                        onBlur={e => {
                            e.target.style.backgroundColor = '#f8f9fa';
                            e.target.style.borderColor = '#e1e5e9';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        style={{
                            padding: '12px 20px',
                            backgroundColor: inputValue.trim() ? '#add8ff' : '#ccc',
                            color: inputValue.trim() ? '#333' : '#666',
                            border: 'none',
                            borderRadius: '24px',
                            cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            transition: 'background-color 0.2s'
                        }}>
                        전송
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function DashBoard() {
    // 상태 관리
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [chatMessages, setChatMessages] = useState(chatMessagesData); // 더미 데이터로 초기화
    const [chatList, setChatList] = useState(chatListData);
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [showSignupPrompt, setShowSignupPrompt] = useState(false);
    const [unregisteredEmail, setUnregisteredEmail] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    // ChatGPT 기능이 필요할 때 아래 라인들 주석 해제
    // const [isGPTLoading, setIsGPTLoading] = useState(false);
    // const [gptError, setGptError] = useState('');

    // 번역 관련 상태
    const [translatedMessages, setTranslatedMessages] = useState({}); // 번역된 메시지 캐시
    const [translatingMessages, setTranslatingMessages] = useState(new Set()); // 번역 중인 메시지 ID들

    // 컴포넌트 마운트시 전체 화면 스타일 적용, 언마운트시 복원
    useEffect(() => {
        const originalBodyStyle = {
            margin: document.body.style.margin,
            padding: document.body.style.padding,
            overflow: document.body.style.overflow,
            width: document.body.style.width,
            height: document.body.style.height
        };

        const originalHtmlStyle = {
            margin: document.documentElement.style.margin,
            padding: document.documentElement.style.padding,
            overflow: document.documentElement.style.overflow,
            width: document.documentElement.style.width,
            height: document.documentElement.style.height
        };

        // DashBoard 페이지용 스타일 적용
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';
        document.body.style.width = '100%';
        document.body.style.height = '100%';

        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.width = '100%';
        document.documentElement.style.height = '100%';

        // 클린업 함수 - 컴포넌트 언마운트시 스타일 복원
        return () => {
            document.body.style.margin = originalBodyStyle.margin;
            document.body.style.padding = originalBodyStyle.padding;
            document.body.style.overflow = originalBodyStyle.overflow;
            document.body.style.width = originalBodyStyle.width;
            document.body.style.height = originalBodyStyle.height;

            document.documentElement.style.margin = originalHtmlStyle.margin;
            document.documentElement.style.padding = originalHtmlStyle.padding;
            document.documentElement.style.overflow = originalHtmlStyle.overflow;
            document.documentElement.style.width = originalHtmlStyle.width;
            document.documentElement.style.height = originalHtmlStyle.height;
        };
    }, []); // 채팅방 클릭 핸들러
    const handleRoomClick = room => {
        setSelectedRoom(room);
        console.log('선택된 채팅방:', room);
        console.log('메시지:', chatMessages[room.id] || []);
    };

    // 메시지 전송 핸들러
    const handleSendMessage = (roomId, message) => {
        setChatMessages(prev => ({
            ...prev,
            [roomId]: [...(prev[roomId] || []), message]
        }));

        // 채팅방 목록의 마지막 메시지 업데이트
        setChatList(prev =>
            prev.map(room =>
                room.id === roomId
                    ? {
                          ...room,
                          lastMessage: message.body,
                          lastMessageTime: message.createdAt
                      }
                    : room
            )
        );

        // ChatGPT 기능 추가 시 여기에 ChatGPT 로직 구현
        /*
        if (isChatGPTMessage(message.body)) {
            // ChatGPT 응답 로직
        }
        */
    };

    // 번역 토글 핸들러
    const handleTranslateToggle = async (messageId, originalText) => {
        try {
            // 이미 번역 중이면 무시
            if (translatingMessages.has(messageId)) {
                return;
            }

            // 번역된 상태에서 원문으로 돌아가기
            if (translatedMessages[messageId]) {
                setTranslatedMessages(prev => {
                    const updated = { ...prev };
                    delete updated[messageId];
                    return updated;
                });
                return;
            }

            // 번역 시작
            setTranslatingMessages(prev => new Set([...prev, messageId]));

            // 번역 실행
            const translatedText = await translateText(originalText, '한국어');

            // 번역 결과 저장
            setTranslatedMessages(prev => ({
                ...prev,
                [messageId]: translatedText
            }));
        } catch (error) {
            console.error('번역 오류:', error);
            alert('번역 중 오류가 발생했습니다: ' + error.message);
        } finally {
            // 번역 완료 - 로딩 상태 제거
            setTranslatingMessages(prev => {
                const updated = new Set(prev);
                updated.delete(messageId);
                return updated;
            });
        }
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

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            alert('유효한 이메일 주소를 입력해주세요.');
            return;
        }

        // 사용자 존재 여부 확인
        const user = registeredUsers.find(u => u.email === newEmail);

        if (!user) {
            // 등록되지 않은 사용자
            setUnregisteredEmail(newEmail);
            setShowEmailInput(false);
            setShowSignupPrompt(true);
            return;
        }

        // 이미 존재하는 채팅방인지 확인
        const existingRoom = chatList.find(
            room => room.memberIds.includes(user.id) && room.memberIds.length === 2
        );

        if (existingRoom) {
            alert('이미 이 사용자와의 채팅방이 존재합니다.');
            setSelectedRoom(existingRoom);
            setNewEmail('');
            setShowEmailInput(false);
            return;
        }

        // 새 채팅방 생성
        const newRoom = {
            id: `room-${Date.now()}`,
            name: user.name,
            lastMessage: '새로운 채팅방이 생성되었습니다.',
            lastMessageTime: new Date().toISOString(),
            memberIds: [user.id, 'current-user'],
            avatarUrl: 'https://fake-avatar-url.test/broken.jpg' // 의도적으로 실패하는 URL
        };

        setChatList(prev => [newRoom, ...prev]);
        setChatMessages(prev => ({ ...prev, [newRoom.id]: [] })); // 빈 메시지 배열
        setSelectedRoom(newRoom);
        setNewEmail('');
        setShowEmailInput(false);
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

            setTimeout(() => {
                setCopySuccess(false);
            }, 3000);
        } catch (error) {
            console.error('클립보드 복사 실패:', error);
            // 폴백
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

    // 시간 포맷 헬퍼
    const formatRoomTime = timeString => {
        if (!timeString) return '';

        const date = new Date(timeString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return '방금 전';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}일 전`;

        return date.toLocaleDateString('ko-KR');
    };

    return (
        <div className="dashboard-layout">
            <Sidebar
                style={{
                    backgroundColor: '#ffffff',
                    color: '#333',
                    width: '350px',
                    position: 'relative',
                    borderRight: '1px solid #e9ecef',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                <div
                    className="sidebar-header"
                    style={{
                        position: 'relative',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        paddingRight: '40px',
                        paddingLeft: '20px',
                        backgroundColor: '#f8f9fa',
                        borderBottom: '2px solid #e9ecef',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                    <h2
                        style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#2c3e50'
                        }}>
                        메시지
                    </h2>
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
                <div
                    className="chat-list"
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        backgroundColor: '#ffffff',
                        borderTop: '1px solid #f0f0f0'
                    }}>
                    {chatList.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                            <p>참여 중인 채팅방이 없습니다.</p>
                            <p>새 채팅을 시작해보세요!</p>
                        </div>
                    ) : (
                        chatList.map(room => (
                            <div
                                key={room.id}
                                className={`chat-item ${
                                    selectedRoom?.id === room.id ? 'chat-item-selected' : ''
                                }`}
                                onClick={() => handleRoomClick(room)}
                                style={{
                                    padding: '12px 16px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #f0f0f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                <Image
                                    src={room.avatarUrl}
                                    alt={room.name}
                                    type="profile"
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        backgroundColor: '#ddd',
                                        flexShrink: 0,
                                        pointerEvents: 'none'
                                    }}
                                />
                                <div
                                    className="chat-info"
                                    style={{ flex: 1, minWidth: 0, pointerEvents: 'none' }}>
                                    <div
                                        className="chat-name"
                                        style={{
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            marginBottom: '4px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            pointerEvents: 'none'
                                        }}>
                                        {room.name}
                                    </div>
                                    <div
                                        className="chat-preview"
                                        style={{
                                            fontSize: '14px',
                                            color: '#666',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            pointerEvents: 'none'
                                        }}>
                                        {room.lastMessage} · {formatRoomTime(room.lastMessageTime)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
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

            <main
                className="content-area"
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {selectedRoom ? (
                    <ChatRoom
                        room={selectedRoom}
                        messages={chatMessages[selectedRoom.id] || []}
                        onSendMessage={handleSendMessage}
                        translatedMessages={translatedMessages}
                        translatingMessages={translatingMessages}
                        onTranslateToggle={handleTranslateToggle}
                    />
                ) : (
                    <div
                        className="placeholder"
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '40px',
                            textAlign: 'center',
                            backgroundColor: '#f8f9fa'
                        }}>
                        <div
                            className="placeholder-icon"
                            style={{
                                width: '80px',
                                height: '80px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '50%',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '36px'
                            }}>
                            💬
                        </div>
                        <h2 style={{ color: '#495057', marginBottom: '12px' }}>
                            채팅방을 선택해주세요
                        </h2>
                        <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                            왼쪽에서 채팅방을 선택하거나 새 채팅을 시작해보세요.
                        </p>
                        <button
                            className="message-button"
                            onClick={() => setShowEmailInput(true)}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#add8ff',
                                color: '#333',
                                border: 'none',
                                borderRadius: '24px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={e => (e.target.style.backgroundColor = '#80caff')}
                            onMouseOut={e => (e.target.style.backgroundColor = '#add8ff')}>
                            새 채팅 시작
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
