import { useChatRoom } from '../hooks/useChatRoom';

/*
 * 방 리스트를 보여주는 페이지
 * useChatRoom 커스텀 훅을 사용하여 채팅방 상태 관리
 */

export default function TestPage() {
    const { rooms, currentRoom, selectRoom, loading, error } = useChatRoom();

    const handleRoomClick = roomId => {
        selectRoom(roomId);
    };

    return (
        <div style={{ padding: '20px', display: 'flex', gap: '20px' }}>
            {/* 채팅방 목록 */}
            <div style={{ flex: 1 }}>
                <h2>채팅방 목록</h2>
                {loading && <p>로딩 중...</p>}
                {error && <p style={{ color: 'red' }}>에러: {error}</p>}
                {rooms.map(room => (
                    <div
                        key={room.id}
                        style={{
                            border:
                                currentRoom?.id === room.id
                                    ? '2px solid #007bff'
                                    : '1px solid #ccc',
                            padding: '15px',
                            marginBottom: '10px',
                            cursor: 'pointer',
                            backgroundColor: currentRoom?.id === room.id ? '#f0f8ff' : 'white',
                            borderRadius: '8px',
                            transition: 'all 0.2s ease'
                        }}
                        onClick={() => handleRoomClick(room.id)}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                            {room.members.join(', ')}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                            {room.lastMessage}
                        </div>
                        <div style={{ color: '#999', fontSize: '12px' }}>
                            {room.lastMessageTime}
                        </div>
                    </div>
                ))}
            </div>

            {/* 선택된 채팅방 상세 정보 */}
            <div style={{ flex: 1, borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
                <h2>채팅방 상세</h2>
                {currentRoom ? (
                    <div>
                        <h3>채팅방 #{currentRoom.id}</h3>
                        <p>
                            <strong>멤버:</strong> {currentRoom.members.join(', ')}
                        </p>
                        <div style={{ marginTop: '20px' }}>
                            <h4>메시지 내역</h4>
                            <div
                                style={{
                                    border: '1px solid #ddd',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    backgroundColor: '#f9f9f9'
                                }}>
                                {currentRoom.messages?.map(message => (
                                    <div
                                        key={message.id}
                                        style={{
                                            marginBottom: '10px',
                                            padding: '8px',
                                            backgroundColor: 'white',
                                            borderRadius: '5px'
                                        }}>
                                        <div style={{ fontWeight: 'bold', color: '#333' }}>
                                            {message.sender}
                                        </div>
                                        <div style={{ margin: '5px 0' }}>{message.content}</div>
                                        <div style={{ fontSize: '11px', color: '#999' }}>
                                            {message.time}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p style={{ color: '#666' }}>초대 페이지</p>
                )}
            </div>
        </div>
    );
}
