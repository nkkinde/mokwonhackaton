import React from 'react';
import Sidebar from '../components/Sidebar'; // Sidebar 컴포넌트 경로
import RadiusImg from '../components/RadiusImg'; // RadiusImg 컴포넌트 경로
import './DashBoardPage.css'; // DashBoard 스타일을 위한 CSS 파일

// 사이드바에 표시할 임시 데이터
const chatListData = [
  { name: '김철수', message: '안녕하세요', time: '1시간 전', img: 'https://via.placeholder.com/56' },
  { name: '박영희', message: '네, 확인했습니다.', time: '2시간 전', img: 'https://via.placeholder.com/56' },
  { name: '이민준', message: 'ㅋㅋㅋㅋㅋ', time: '어제', img: 'https://via.placeholder.com/56' },
];

export default function DashBoard() {
  return (
    <div className="dashboard-layout">
      {/* 왼쪽 사이드바 */}
      <Sidebar style={{ backgroundColor: '#7af04483', color: '#fff', width: '350px' }}>
        <div className="sidebar-header">
          <h2>메시지</h2>
        </div>
        <div className="chat-list">
          {chatListData.map((chat, index) => (
            <div key={index} className="chat-item">
              <RadiusImg src={chat.img} alt={chat.name} style={{ width: '56px', height: '56px' }} />
              <div className="chat-info">
                <span className="chat-name">{chat.name}</span>
                <span className="chat-preview">{chat.message} · {chat.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Sidebar>

      {/* 오른쪽 메인 콘텐츠 영역 */}
      <main className="content-area">
        <div className="placeholder">
          <div className="placeholder-icon"></div>
          <h2>내 메시지</h2>
          <p>친구에게 메시지를 보내보세요.</p>
          <button className="message-button">메시지 보내기</button>
        </div>
      </main>
    </div>
  );
}