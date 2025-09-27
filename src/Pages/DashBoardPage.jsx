import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios'; // axios 추가
import Sidebar from '../components/Sidebar';
import Image from '../components/Image';
import './DashBoardPage.css';

// --- Socket.IO 서버 연결 ---
const socket = io("http://192.168.0.57:4000", {
  auth: {
    token: localStorage.getItem("access_token")
  }
});

// --- 채팅창 컴포넌트 ---
function ChatRoom({ user, messages, onSendMessage }) {
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    onSendMessage(user.id, { text: inputValue, sender: "me" });
    setInputValue("");
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-room">
      <div className="chat-header" >
        <Image src={user.img} alt={user.name} style={{ width: '40px', height: '40px' }} />
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

// --- 메인 대시보드 컴포넌트 ---
export default function DashBoard() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [chatList, setChatList] = useState([]); // 초기 상태는 빈 배열
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  // 1. 컴포넌트 마운트 시 실행되는 로직
  useEffect(() => {
    // A. 기존 채팅 목록 불러오기
    const fetchChatList = async () => {
      try {
        const response = await axios.get("http://192.168.0.57:4000/api/chats", {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        });
        setChatList(response.data);
      } catch (error) {
        console.error("채팅 목록을 불러오는 데 실패했습니다.", error);
      }
    };
    fetchChatList();

    // B. 소켓 메시지 수신 리스너 설정
    const handleReceiveMessage = (data) => {
      setChatMessages(prev => ({
        ...prev,
        [data.roomId]: [...(prev[data.roomId] || []), { text: data.text, sender: "other" }]
      }));
    };
    socket.on('receive_message', handleReceiveMessage);

    // C. 소켓 연결 에러 처리 리스너
    socket.on('connect_error', (err) => {
      console.error('Connection failed:', err.message);
    });

    // D. 컴포넌트 언마운트 시 리스너 정리
    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('connect_error');
    };
  }, []); // 빈 배열을 전달하여 한 번만 실행

  const handleChatItemClick = (chat) => {
    if (selectedChat?.id !== chat.id) {
      setSelectedChat(chat);
      socket.emit('join_room', chat.id);
    }
  };

  const handleSendMessage = (chatId, message) => {
    setChatMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), message]
    }));
    socket.emit('send_message', {
      roomId: chatId,
      text: message.text,
      sender: 'me'
    });
  };

  const handleAddChatClick = () => setShowEmailInput(prev => !prev);
  const handleEmailInputChange = (e) => setNewEmail(e.target.value);

  // 2. 새 채팅 추가 함수 (백엔드 연동)
  const handleAddNewChat = async () => {
    if (!newEmail.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }
    try {
      const response = await axios.get(`http://192.168.0.57:4000/api/users/find?email=${newEmail}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
      });
      console.log(response.data);
      if (response.data.data.found) {
        console.log("if");
        const newUser = response.data.data.user;
        if (chatList.some(chat => chat.id === newUser.id)) {
          alert("이미 채팅 목록에 있는 사용자입니다.");
          setSelectedChat(newUser);
        } else {
            console.log(newUser);
          const newChat = {
            id: newUser.id,
            name: newUser.name,
            message: "새로운 채팅방이 열렸습니다.",
            time: "방금 전",
            img: newUser.img || "https://via.placeholder.com/56"
          };
          setChatList([newChat, ...chatList]);
          setSelectedChat(newChat);
          alert("새로운 채팅방이 열렸습니다.");
        }
      } else {
        alert("존재하지 않는 사용자입니다.");
      }
    } catch (error) {
      console.error("사용자 검색 실패:", error);
      alert("사용자를 찾는 중 오류가 발생했습니다.");
    }
    setNewEmail("");
    setShowEmailInput(false);
  };

  const handleEmailInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddNewChat();
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar style={{ backgroundColor: '#a1a1a183',  color: '#fff', width: '350px', position: 'relative', }}>
        <div style={{ borderBottom: '1px solid #000000ff' }}>
            <div className="sidebar-header" style={{ position: 'relative', height: '48px', display: 'flex',
            alignItems: 'center', justifyContent: 'flex-start', paddingRight: '40px', margin: '15px 15px' }}>
          <h2 style={{ margin: 0 }}>메시지</h2>
          <button
            style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', 
                background: '#fff', color: '#80caff', border: 'none', borderRadius: '50%', 
                width: '32px', height: '32px', fontSize: '22px', fontWeight: 'bold', cursor: 'pointer', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
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

      {showEmailInput && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={handleAddChatClick}>
          <div style={{ background: '#fff', borderRadius: '18px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', padding: '32px 28px', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }} onClick={e => e.stopPropagation()}>
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
            <button style={{ background: '#80caff', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 0', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }} onClick={handleAddNewChat}>확인</button>
            <button style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', fontSize: '22px', color: '#80caff', cursor: 'pointer' }} onClick={handleAddChatClick} title="닫기">×</button>
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