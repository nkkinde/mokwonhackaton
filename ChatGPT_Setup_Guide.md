# ChatGPT API 연동 가이드

## 📋 현재 세팅 완료 상태

✅ **OpenAI 패키지 설치**: `openai` npm 패키지 설치 완료  
✅ **환경변수 파일**: `.env` 파일 생성 및 `.gitignore` 설정 완료  
✅ **API 서비스**: `src/services/chatGPTService.js` 파일 생성 완료  
✅ **CSS 스타일**: ChatGPT 관련 스타일 및 애니메이션 준비 완료  
✅ **코드 준비**: DashBoardPage.jsx에 주석으로 연동 지점 표시 완료

## 🚀 ChatGPT 기능 활성화 방법

### 1단계: API 키 설정

1. [OpenAI Platform](https://platform.openai.com/api-keys)에서 계정 생성
2. API 키 생성 (sk-로 시작하는 키)
3. `.env` 파일에서 `your_openai_api_key_here`를 실제 API 키로 교체:
    ```env
    VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
    ```

### 2단계: 코드 활성화

`src/Pages/DashBoardPage.jsx` 파일에서 다음 주석 해제:

```javascript
// 1. import 문 주석 해제
import {
    generateChatGPTResponse,
    isChatGPTMessage,
    extractGPTQuery,
    prepareConversationHistory
} from '../services/chatGPTService';

// 2. 상태 변수 주석 해제
const [isGPTLoading, setIsGPTLoading] = useState(false);
const [gptError, setGptError] = useState('');

// 3. handleSendMessage 함수의 ChatGPT 로직 주석 해제
if (isChatGPTMessage(message.body)) {
    // ChatGPT 응답 로직
}

// 4. ChatRoom 컴포넌트에 isGPTLoading prop 추가
<ChatRoom
    room={selectedRoom}
    messages={chatMessages[selectedRoom.id] || []}
    onSendMessage={handleSendMessage}
    isGPTLoading={isGPTLoading} // 이 줄 추가
/>;
```

## 💬 사용 방법

ChatGPT 기능을 활성화한 후:

1. **ChatGPT 호출 방법**:

    - `@gpt 안녕하세요`
    - `@chatgpt 오늘 날씨 어때?`
    - `/gpt 코딩 질문이 있어요`
    - `안녕 gpt`
    - `hey gpt`

2. **동작 방식**:
    - 위 키워드가 포함된 메시지를 보내면 자동으로 ChatGPT가 응답
    - 로딩 중에는 타이핑 애니메이션 표시
    - ChatGPT 메시지는 초록색 배경으로 구분
    - 오류 발생시 빨간색 테두리로 표시

## 🎨 UI 특징

-   **ChatGPT 메시지**: 초록색 배경 (`#e8f5e8`)
-   **로딩 애니메이션**: 점 3개가 순차적으로 깜빡임
-   **오류 메시지**: 빨간색 테두리 표시
-   **이전 대화 기록**: 최근 10개 메시지를 ChatGPT에게 전달

## 🔧 주요 기능

### `chatGPTService.js`의 주요 함수들:

-   `generateChatGPTResponse()`: ChatGPT API 호출
-   `isChatGPTMessage()`: ChatGPT 호출 키워드 감지
-   `extractGPTQuery()`: 키워드 제거 후 실제 질문 추출
-   `prepareConversationHistory()`: 대화 기록 정리

### 설정 가능한 옵션:

```javascript
// chatGPTService.js에서 수정 가능
const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // 또는 "gpt-4"
    max_tokens: 1000, // 응답 최대 길이
    temperature: 0.7 // 창의성 정도 (0-1)
});
```

## ⚠️ 주의사항

1. **API 키 보안**: `.env` 파일을 절대 Git에 커밋하지 마세요
2. **비용 관리**: OpenAI API는 사용량에 따라 과금됩니다
3. **에러 처리**: 네트워크 오류, API 한도 초과 등을 고려해 구현되어 있습니다
4. **브라우저 사용**: `dangerouslyAllowBrowser: true` 설정으로 클라이언트에서 직접 호출

## 📞 지원되는 모델

-   `gpt-3.5-turbo` (기본값, 빠르고 저렴)
-   `gpt-4` (더 정확하지만 비쌈)
-   `gpt-4-turbo` (gpt-4보다 빠름)

모델 변경은 `chatGPTService.js`의 `model` 파라미터를 수정하면 됩니다.

---

## 🌐 번역 기능 (현재 활성화됨)

### 사용 방법:

1. **상대방 메시지 번역**: 상대방이 보낸 메시지 옆의 🌐 버튼을 클릭
2. **원문으로 되돌리기**: 번역된 메시지 옆의 🔙 버튼을 클릭
3. **번역 중 표시**: 🔄 아이콘으로 번역 진행 상태 표시

### 특징:

-   **똑똑한 캐싱**: 한 번 번역한 메시지는 다시 API를 호출하지 않음
-   **다양한 언어 지원**: 영어, 일본어, 중국어 등 자동 감지 후 한국어로 번역
-   **시각적 구분**: 번역된 메시지는 초록색 테두리로 표시
-   **내 메시지 제외**: 내가 보낸 메시지에는 번역 버튼이 표시되지 않음

### 테스트 방법:

1. '김철수' 채팅방에 들어가기 (영어 메시지 포함)
2. '박영희' 채팅방에 들어가기 (영어, 일본어 메시지 포함)
3. 상대방 메시지 옆의 🌐 버튼 클릭해서 번역 테스트

---

🎉 **모든 준비가 완료되었습니다!** 번역 기능은 바로 사용 가능하며, 위 가이드를 따라 ChatGPT 채팅 기능도 언제든지 활성화할 수 있습니다.
