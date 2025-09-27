import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Image from '../components/Image';
import './DashBoardPage.css';

import { api } from '../lib/api';
import { getSocket } from '../lib/socket';

// 현재 사용자 언어코드 계산
const countryToLang = { us: 'en', cn: 'zh', jp: 'ja', vn: 'vi', kr: 'ko' };
function myLang() {
  try {
    const me = JSON.parse(localStorage.getItem('me') || '{}');
    return countryToLang[(me?.locale || 'us').toLowerCase()] || 'en';
  } catch {
    return 'en';
  }
}

// --- 채팅창 컴포넌트 ---
function ChatRoom({ user, messages, onSendMessage }) {
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    onSendMessage(user.id, inputValue.trim());
    setInputValue('');
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <Image src={user.img} alt={user.name} style={{ width: '40px', height: '40px' }} />
        <h3>{user.name}</h3>
      </div>

      <div className="chat-messages">
        {(!messages || messages.length === 0) ? (
          <p>{user.name}님과의 대화를 시작해보세요.</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={msg.mine ? 'my-message' : 'other-message'}>
              {msg.display}
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

// --- 메인 대시보드 컴포넌트 ---
export default function DashBoard() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState({}); // { [roomId]: [{ display, mine }] }
  const [chatList, setChatList] = useState([]);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const lang = myLang();

  // 1) 소켓 연결 및 수신 이벤트
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => console.log('socket connected');
    const onNew = (msg) => {
      // 서버가 emit("newMessage", { id, roomId, body, translations: {en/ko/...}, sender, createdAt ... })
      const display = msg?.translations?.[lang] || msg?.body || '';
      setChatMessages(prev => ({
        ...prev,
        [msg.roomId]: [...(prev[msg.roomId] || []), { display, mine: false }],
      }));
    };
    const onErr = (err) => console.error('socket error:', err?.message || err);

    socket.on('connect', onConnect);
    socket.on('newMessage', onNew);
    socket.on('errorMessage', onErr);
    socket.on('connect_error', onErr);

    return () => {
      socket.off('connect', onConnect);
      socket.off('newMessage', onNew);
      socket.off('errorMessage', onErr);
      socket.off('connect_error', onErr);
    };
  }, [lang]);

  // 2) 방 목록 불러오기 (/api/rooms/my)
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/rooms/my', { params: { withPreview: 1, limit: 30 } });
        const items = res.data?.data?.items || [];

        // UI에 맞게 매핑
        const mapped = items.map(r => ({
          id: r.id,
          name: r.name || '(이름 없음)',
          message: r.preview?.body || '',
          time: r.preview?.createdAt ? new Date(r.preview.createdAt).toLocaleString() : '',
          img: 'https://via.placeholder.com/56',
        }));
        setChatList(mapped);
      } catch (e) {
        console.error('채팅 목록 로드 실패:', e);
      }
    })();
  }, []);

  const handleChatItemClick = (chat) => {
    if (selectedChat?.id === chat.id) return;
    setSelectedChat(chat);

    // 방 입장
    const socket = getSocket();
    socket.emit('joinRoom', chat.id);
  };

  const handleSendMessage = (roomId, text) => {
    // 내 메시지 먼저 UI에 반영
    setChatMessages(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), { display: text, mine: true }],
    }));

    // 서버로 전송 (서버 이벤트명: sendMessage)
    const socket = getSocket();
    socket.emit('sendMessage', { roomId, body: text });
  };

  const handleAddChatClick = () => setShowEmailInput(prev => !prev);
  const handleEmailInputChange = (e) => setNewEmail(e.target.value);

  // 3) 이메일로 사용자 검색 → 목록에 추가 (실제 방 생성/참여 API는 백엔드 구현에 맞춰 붙이세요)
  const handleAddNewChat = async () => {
    if (!newEmail.trim()) return alert('이메일을 입력해주세요.');
    try {
      const res = await api.get('/api/users/find', { params: { email: newEmail } });
      if (res.data?.data?.found) {
        const u = res.data.data.user;
        if (chatList.some(c => c.id === u.id)) {
          alert('이미 채팅 목록에 있는 사용자입니다.');
          setSelectedChat(chatList.find(c => c.id === u.id));
        } else {
          const newChat = {
            id: u.id,
            name: u.name || u.email,
            message: '새로운 채팅방이 열렸습니다.',
            time: '방금 전',
            img: u.img || 'https://via.placeholder.com/56',
          };
          setChatList([newChat, ...chatList]);
          setSelectedChat(newChat);
          alert('새로운 채팅방이 열렸습니다.');
        }
      } else {
        alert('존재하지 않는 사용자입니다.');
      }
    } catch (e) {
      console.error('사용자 검색 실패:', e);
      alert('사용자를 찾는 중 오류가 발생했습니다.');
    }
    setNewEmail('');
    setShowEmailInput(false);
  };

  const handleEmailInputKeyDown = (e) => {
    if (e.key === 'Enter') handleAddNewChat();
  };

  return (
    <div className="dashboard-layout">
      <Sidebar style={{ backgroundColor: '#a1a1a183', color: '#fff', width: '350px', position: 'relative' }}>
        <div style={{ borderBottom: '1px solid #000000ff' }}>
          <div className="sidebar-header" style={{ position: 'relative', height: '48px', display: 'flex',
            alignItems: 'center', justifyContent: 'flex-start', paddingRight: '40px', margin: '15px 15px' }}>
            <h2 style={{ margin: 0 }}>메시지</h2>
            <button
              style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                background: '#fff', color: '#80caff', border: 'none', borderRadius: '50%',
                width: '32px', height: '32px', fontSize: '22px', fontWeight: 'bold', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              onClick={handleAddChatClick}
              title="새 채팅 추가"
            >+</button>
          </div>
        </div>

        <div className="chat-list">
          {chatList.map((chat) => (
            <div key={chat.id} className="chat-item" onClick={() => handleChatItemClick(chat)}>
              <Image src={chat.img} alt={chat.name} style={{ width: '56px', height: '56px' }} />
              <div className="chat-info">
                <span className="chat-name">{chat.name}</span>
                <span className="chat-preview">{chat.message} · {chat.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Sidebar>

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

      {showEmailInput && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999 }}
          onClick={handleAddChatClick}
        >
          <div
            style={{ background: '#fff', borderRadius: '18px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
              padding: '32px 28px', minWidth: '320px', display: 'flex', flexDirection: 'column',
              gap: '16px', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: 0, fontSize: '20px', textAlign: 'center' }}>새 채팅 시작</h3>
            <input
              type="email"
              value={newEmail}
              onChange={handleEmailInputChange}
              onKeyDown={handleEmailInputKeyDown}
              placeholder="상대 이메일 입력..."
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #80caff', fontSize: '16px' }}
              autoFocus
            />
            <button
              style={{ background: '#80caff', color: '#fff', border: 'none', borderRadius: '8px',
                padding: '10px 0', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={handleAddNewChat}
            >
              확인
            </button>
            <button
              style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent',
                border: 'none', fontSize: '22px', color: '#80caff', cursor: 'pointer' }}
              onClick={handleAddChatClick}
              title="닫기"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}