import Header from '../../Header';

export default function DashBoardSidebar() {
    const defaultStyle = {
        width: '200px',
        height: '100vh',
        backgroundColor: 'lightgray'
    };

    return (
        <div style={{ ...defaultStyle }}>
            <Header style={{ backgroundColor: 'darkgray' }}> Sidebar Header</Header>
            <div>유저 list 출력 컴포넌트 제작 예정</div>
        </div>
    );
}
