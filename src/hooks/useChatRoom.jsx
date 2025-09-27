import { useState, useCallback } from 'react';

// 더미 채팅방 리스트 데이터 (id, members, lastMessage, lastMessageTime만 포함)
const dummyRooms = [
    {
        id: 1,
        members: ['김철수', '박영희'],
        lastMessage: '안녕하세요',
        lastMessageTime: '2025-09-01 10:00'
    },
    {
        id: 2,
        members: ['이민준', '최지우'],
        lastMessage: '네, 확인했습니다.',
        lastMessageTime: '2025-09-01 09:30'
    },
    {
        id: 3,
        members: ['강다니엘', '한소희'],
        lastMessage: 'ㅋㅋㅋㅋㅋ',
        lastMessageTime: '2025-08-31 20:15'
    },
    {
        id: 4,
        members: ['정국', '뷔'],
        lastMessage: '오늘 저녁 뭐 먹지?',
        lastMessageTime: '2025-08-31 18:45'
    }
];

// 별도의 메시지 데이터 (방 선택시에만 가져올 데이터)
const dummyMessages = {
    1: [
        { id: 1, sender: '김철수', content: '안녕하세요', time: '2025-09-01 09:30' },
        { id: 2, sender: '박영희', content: '네, 안녕하세요!', time: '2025-09-01 09:35' },
        { id: 3, sender: '김철수', content: '오늘 회의 잘 부탁드립니다', time: '2025-09-01 10:00' }
    ],
    2: [
        { id: 1, sender: '이민준', content: '자료 확인 부탁드려요', time: '2025-09-01 09:00' },
        { id: 2, sender: '최지우', content: '네, 확인했습니다.', time: '2025-09-01 09:30' }
    ],
    3: [
        { id: 1, sender: '강다니엘', content: '오늘 너무 재밌었어!', time: '2025-08-31 20:10' },
        { id: 2, sender: '한소희', content: 'ㅋㅋㅋㅋㅋ', time: '2025-08-31 20:15' }
    ],
    4: [
        { id: 1, sender: '정국', content: '오늘 저녁 뭐 먹지?', time: '2025-08-31 18:45' },
        { id: 2, sender: '뷔', content: '치킨 어때?', time: '2025-08-31 18:50' }
    ]
};

/**
 * 채팅방 관리를 위한 커스텀 훅
 *
 * @returns {Object} 채팅방 관련 상태와 함수들
 * - rooms: 전체 채팅방 목록 (id, members, lastMessage, lastMessageTime만 포함)
 * - currentRoom: 현재 선택된 채팅방 정보 (메시지 내역 포함)
 * - selectRoom: 채팅방 선택 함수 (메시지 데이터를 별도로 가져옴)
 * - loading: 로딩 상태
 * - error: 에러 상태
 */
export const useChatRoom = () => {
    const [rooms] = useState(dummyRooms);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * 채팅방 선택 함수
     * @param {number} roomId - 선택할 채팅방 ID
     */
    const selectRoom = useCallback(roomId => {
        setLoading(true);
        setError(null);

        try {
            // 룸 리스트에서 기본 정보 찾기
            const roomInfo = dummyRooms.find(room => room.id === roomId);

            if (roomInfo) {
                // 메시지 데이터를 별도로 가져오기 (실제로는 API 호출)
                const messages = dummyMessages[roomId] || [];

                const selectedRoom = {
                    ...roomInfo,
                    messages
                };

                setCurrentRoom(selectedRoom);
                console.log('선택된 채팅방:', selectedRoom);
            } else {
                throw new Error('채팅방을 찾을 수 없습니다.');
            }
        } catch (err) {
            setError(err.message);
            console.error('채팅방 선택 에러:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * 채팅방 목록에서 기본 정보만 반환
     */
    const getRoomList = useCallback(() => {
        return rooms.map(room => ({
            id: room.id,
            members: room.members,
            lastMessage: room.lastMessage,
            lastMessageTime: room.lastMessageTime
        }));
    }, [rooms]);

    return {
        rooms: getRoomList(),
        currentRoom,
        selectRoom,
        loading,
        error
    };
};
