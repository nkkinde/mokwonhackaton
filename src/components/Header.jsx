export default function Header({ style, children, ...props }) {
    const defaultStyle = {
        width: '100%',
        height: '60px',
        fontSize: '24px',
        backgroundColor: 'red'
    };

    return (
        <header style={{ ...defaultStyle, ...style }} {...props}>
            {children}
        </header>
    );
}
