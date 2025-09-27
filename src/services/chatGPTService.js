import OpenAI from 'openai';

// OpenAI 클라이언트를 지연 초기화하는 함수
const getOpenAIClient = () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey || apiKey === 'your_openai_api_key_here') {
        throw new Error(
            'OpenAI API 키가 설정되지 않았습니다. .env 파일에서 VITE_OPENAI_API_KEY를 설정해주세요.'
        );
    }

    return new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // 클라이언트 사이드에서 사용하기 위해 필요
    });
};

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

        const openai = getOpenAIClient();
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

// 번역 캐시 저장소
const translationCache = new Map();

/**
 * 텍스트를 한국어로 번역합니다. (캐시 기능 포함)
 * @param {string} text - 번역할 텍스트
 * @param {string} targetLanguage - 목표 언어 (기본값: 한국어)
 * @returns {Promise<string>} - 번역된 텍스트
 */
export const translateText = async (text, targetLanguage = '한국어') => {
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

        // 캐시 키 생성
        const cacheKey = `${text}:${targetLanguage}`;

        // 캐시에서 확인
        if (translationCache.has(cacheKey)) {
            return translationCache.get(cacheKey);
        }

        const messages = [
            {
                role: 'system',
                content: `당신은 전문 번역가입니다. 다음 텍스트를 ${targetLanguage}로 정확하게 번역해주세요. 번역된 텍스트만 응답하고, 다른 설명은 추가하지 마세요.`
            },
            {
                role: 'user',
                content: text
            }
        ];

        const openai = getOpenAIClient();
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 500,
            temperature: 0.1 // 번역은 일관성이 중요하므로 낮은 temperature 사용
        });

        const translatedText = completion.choices[0].message.content.trim();

        // 캐시에 저장
        translationCache.set(cacheKey, translatedText);

        return translatedText;
    } catch (error) {
        console.error('번역 API 호출 중 오류:', error);
        throw new Error(`번역 실패: ${error.message}`);
    }
};

/**
 * 언어를 감지합니다.
 * @param {string} text - 언어를 감지할 텍스트
 * @returns {Promise<string>} - 감지된 언어
 */
export const detectLanguage = async text => {
    try {
        const messages = [
            {
                role: 'system',
                content:
                    '다음 텍스트의 언어를 감지하고, 언어 이름만 한국어로 응답해주세요. (예: 영어, 일본어, 중국어, 한국어 등)'
            },
            {
                role: 'user',
                content: text
            }
        ];

        const openai = getOpenAIClient();
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 50,
            temperature: 0.1
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error('언어 감지 오류:', error);
        return '알 수 없음';
    }
};

/**
 * 번역 캐시를 클리어합니다.
 */
export const clearTranslationCache = () => {
    translationCache.clear();
};
