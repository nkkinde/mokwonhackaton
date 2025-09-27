export default function Sidebar({ style, children, ...props }) {
    const defaultStyle = {
        width: '200px',
        height: '100vh',
        backgroundColor: 'lightgray'
    };
    return (
        <div style={{ ...defaultStyle, ...style }} {...props}>
            {children}
        </div>
    );
}
