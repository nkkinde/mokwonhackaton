export default function DashBoardContent({ style, children, ...props }) {
    const defaultStyle = {};

    return (
        <div style={{ ...defaultStyle, ...style }} {...props}>
            메인 화면 띄우는 컴포넌트 제작 예정
            {children}
        </div>
    );
}
