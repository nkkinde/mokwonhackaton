import OpenAI from 'openai';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // 클라이언트 사이드에서 사용하기 위해 필요
});

/**
 * ChatGPT API를 사용하여 메시지를 생성합니다.
 * @param {string} userMessage - 사용자가 입력한 메시지
 * @param {Array} conversationHistory - 이전 대화 기록 (선택사항)
 * @returns {Promise<string>} - ChatGPT의 응답
 */
export const generateChatGPTResponse = async (userMessage, conversationHistory = []) => {
    try {
        // API 키가 설정되어 있는지 확인
        if (
            !import.meta.env.VITE_OPENAI_API_KEY ||
            import.meta.env.VITE_OPENAI_API_KEY === 'your_openai_api_key_here'
        ) {
            throw new Error(
                'OpenAI API 키가 설정되지 않았습니다. .env 파일에서 VITE_OPENAI_API_KEY를 설정해주세요.'
            );
        }

        // 대화 기록을 OpenAI 포맷으로 변환
        const messages = [
            {
                role: 'system',
                content:
                    '당신은 도움이 되고 친근한 AI 어시스턴트입니다. 한국어로 자연스럽고 유용한 답변을 제공해주세요.'
            },
            ...conversationHistory.map(msg => ({
                role: msg.isUser ? 'user' : 'assistant',
                content: msg.text
            })),
            {
                role: 'user',
                content: userMessage
            }
        ];

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // 또는 "gpt-4"를 사용할 수 있습니다
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('ChatGPT API 호출 중 오류:', error);

        if (error.status === 401) {
            throw new Error(
                '유효하지 않은 API 키입니다. .env 파일의 VITE_OPENAI_API_KEY를 확인해주세요.'
            );
        } else if (error.status === 429) {
            throw new Error('API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
        } else if (error.status === 500) {
            throw new Error('OpenAI 서버에 문제가 있습니다. 잠시 후 다시 시도해주세요.');
        } else {
            throw new Error(`ChatGPT API 호출 실패: ${error.message}`);
        }
    }
};

/**
 * 메시지가 ChatGPT에게 보내는 메시지인지 확인합니다.
 * @param {string} message - 확인할 메시지
 * @returns {boolean} - ChatGPT 명령어 포함 여부
 */
export const isChatGPTMessage = message => {
    const triggers = ['@gpt', '@chatgpt', '/gpt', '안녕 gpt', 'hey gpt'];
    return triggers.some(trigger => message.toLowerCase().includes(trigger.toLowerCase()));
};

/**
 * 메시지에서 ChatGPT 트리거를 제거하고 실제 질문만 추출합니다.
 * @param {string} message - 원본 메시지
 * @returns {string} - 정제된 메시지
 */
export const extractGPTQuery = message => {
    const triggers = ['@gpt', '@chatgpt', '/gpt', '안녕 gpt', 'hey gpt'];
    let cleanMessage = message;

    triggers.forEach(trigger => {
        cleanMessage = cleanMessage.replace(new RegExp(trigger, 'gi'), '').trim();
    });

    return cleanMessage || message;
};

/**
 * 채팅방의 대화 기록을 ChatGPT가 이해할 수 있는 형태로 정리합니다.
 * @param {Array} messages - 채팅방의 메시지들
 * @param {number} maxMessages - 포함할 최대 메시지 수 (기본값: 10)
 * @returns {Array} - 정리된 대화 기록
 */
export const prepareConversationHistory = (messages, maxMessages = 10) => {
    return messages
        .slice(-maxMessages) // 최근 메시지들만 가져오기
        .map(msg => ({
            isUser: !msg.text.includes('🤖'), // 봇 메시지가 아니면 사용자 메시지
            text: msg.text.replace('🤖 ChatGPT: ', '') // 봇 접두사 제거
        }));
};
