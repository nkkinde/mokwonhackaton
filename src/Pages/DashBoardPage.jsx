import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Image from '../components/Image';
import './DashBoardPage.css';

import { api } from '../lib/api';
import { getSocket } from '../lib/socket';

// 현재 사용자 언어코드 계산 (참고 용)
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
        <button onClick={handleSendMessage} className='send-button'>submit</button>
      </div>
    </div>
  );
}

// --- 메인 대시보드 컴포넌트 ---
export default function DashBoard() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState({});  // { [roomId]: [{ display, mine, ...raw }]}
  const [chatList, setChatList] = useState([]);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const lang = myLang();

  // 1) 소켓 연결 및 수신 이벤트
  useEffect(() => {
    const socket = getSocket();
    const me = JSON.parse(localStorage.getItem('me') || '{}');

    const onConnect = () => console.log('socket connected');

    // 서버가 newMessage를 보낼 때 translated가 있으면 우선 사용, 없으면 body
    const onNew = (msg) => {
      const mine = msg.senderId === me.id;
      if (mine) return; // 내가 보낸 메시지는 UI에 이미 반영

      const display = (msg && (msg.translated || msg.body)) || '';
      setChatMessages(prev => ({
        ...prev,
        [msg.roomId]: [...(prev[msg.roomId] || []), { ...msg, display, mine: false }],
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

  // 2) 방 목록 불러오기
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/rooms/my', { params: { withPreview: 1, limit: 30 } });
        const items = res.data?.data?.items || [];

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

  // 3) 채팅방 클릭 → 자동 번역된 메시지 불러오기
  const handleChatItemClick = async (chat) => {
    if (selectedChat?.id === chat.id) return;
    setSelectedChat(chat);

    try {
      // ✅ 자동 번역 결과를 포함해주는 백엔드 엔드포인트 사용
      const res = await api.get(`/api/messages/room/${chat.id}/view`, {
        params: { force: 1 }
      });
      const { items = [] } = res.data || {};
      const me = JSON.parse(localStorage.getItem('me') || '{}');
      console.log(me);

      const mappedMessages = items
        .map(msg => ({
          ...msg,
          // ✅ translated가 있으면 우선 사용, 없으면 body
          display: (msg.translated || msg.body || ''),
          mine: msg.senderId === me.id,
        }))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setChatMessages(prev => ({
        ...prev,
        [chat.id]: mappedMessages,
      }));
    } catch (e) {
      console.error('메시지 로드 실패:', e);
      setChatMessages(prev => ({
        ...prev,
        [chat.id]: [],
      }));
    }

    const socket = getSocket();
    socket.emit('joinRoom', chat.id);
  };

  // 4) 메시지 전송
  const handleSendMessage = (roomId, text) => {
    // 낙관적 업데이트 (원문 표시)
    setChatMessages(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), { display: text, mine: true }],
    }));

    const socket = getSocket();
    socket.emit('sendMessage', { roomId, body: text });
  };

  const handleAddChatClick = () => setShowEmailInput(prev => !prev);
  const handleEmailInputChange = (e) => setNewEmail(e.target.value);

  // 5) 새 채팅 추가 (DM 생성/조회)
  const handleAddNewChat = async () => {
    if (!newEmail.trim()) return alert('이메일을 입력해주세요.');
    try {
      const res = await api.post('/api/rooms/dm', { email: newEmail });
      const room = res.data.data.room;
      const exists = chatList.find(c => c.id === room.id);

      if (exists) {
        setSelectedChat(exists);
      } else {
        const newChat = {
          id: room.id,
          name: room.name || '(DM)',
          message: '새로운 채팅방이 열렸습니다.',
          time: '방금 전',
          img: 'https://via.placeholder.com/56',
        };
        setChatList([newChat, ...chatList]);
        setSelectedChat(newChat);
      }

      const socket = getSocket();
      socket.emit('joinRoom', room.id);

      alert('새로운 채팅방이 열렸습니다.');
    } catch (e) {
      console.error('DM 방 생성/조회 실패:', e);
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
            <h2 style={{ margin: 0 }}>Message</h2>
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
            <h2>My Message</h2>
            <p>Send a message to your friend.</p>
            <button className="message-button" onClick={handleAddChatClick}>Send message</button>
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
            <h3 style={{ margin: 0, fontSize: '20px', textAlign: 'center' }}>Start a new chat</h3>
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
              check
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