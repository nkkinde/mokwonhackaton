import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Image from '../components/Image';
import './DashBoardPage.css';

// 임시 데이터
const chatListData = [
  { id: 1, name: '김철수', message: ' 안녕하세요', time: '1시간 전', img: 'https://via.placeholder.com/56' },
  { id: 2, name: '박영희', message: ' 네, 확인했습니다.', time: '2시간 전', img: 'https://via.placeholder.com/56' },
  { id: 3, name: '이민준', message: '   ㅋㅋㅋㅋㅋ', time: '어제', img: 'https://via.placeholder.com/56' },
];

// 채팅창 컴포넌트 (새로 추가)
function ChatRoom({ user, messages, onSendMessage }) {
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    onSendMessage(user.id, { text: inputValue, sender: "me" });
    setInputValue("");
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
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
        {(!messages || messages.length === 0) ? (
          <p>{user.name}님과의 대화를 시작해보세요.</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={msg.sender === "me" ? "my-message" : "other-message"}>
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
  const [newEmail, setNewEmail] = useState("");

  const handleChatItemClick = (chat) => {
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

  const handleEmailInputChange = (e) => {
    setNewEmail(e.target.value);
  };

  const handleEmailInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddNewChat();
    }
  };

  const handleAddNewChat = () => {
    if (!newEmail.trim()) return;
    const newId = chatList.length > 0 ? Math.max(...chatList.map(c => c.id)) + 1 : 1;
    setChatList([
      ...chatList,
      {
        id: newId,
        name: newEmail,
        message: "새로운 채팅방입니다.",
        time: "방금 전",
        img: "https://via.placeholder.com/56"
      }
    ]);
    setNewEmail("");
    setShowEmailInput(false);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar style={{ backgroundColor: '#a1a1a183', color: '#fff', width: '350px', position: 'relative' }}>
        <div className="sidebar-header" style={{ position: 'relative', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingRight: '40px' }}>
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
            title="새 채팅 추가"
          >+
          </button>
        </div>
        <div className="chat-list">
          {chatList.map((chat) => (
            <div key={chat.id} className="chat-item" onClick={() => handleChatItemClick(chat)}>
              <Image src={undefined} alt={chat.name} style={{ width: '56px', height: '56px' }} />
              <div className="chat-info">
                <span className="chat-name">{chat.name}</span>
                <span className="chat-preview">{chat.message} · {chat.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Sidebar>

      {/* 이메일 입력 팝업 */}
      {showEmailInput && (
        <div style={{
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
        }} onClick={handleAddChatClick}>
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
              style={{ background: '#80caff', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 0', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={handleAddNewChat}
            >확인</button>
            <button
              style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', fontSize: '22px', color: '#80caff', cursor: 'pointer' }}
              onClick={handleAddChatClick}
              title="닫기"
            >×</button>
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