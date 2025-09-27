console.log('TestLogin.jsx 로딩됨');

function TestLogin() {
    console.log('TestLogin 컴포넌트 렌더링');

    return (
        <div style={{ padding: '20px', backgroundColor: 'lightblue', minHeight: '100vh' }}>
            <h1>Hello World!</h1>
            <p>테스트 페이지입니다</p>
            <p>현재 시간: {new Date().toLocaleTimeString()}</p>
        </div>
    );
}

export default TestLogin;
