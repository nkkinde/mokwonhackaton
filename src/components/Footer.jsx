export default function Footer({ style, children, ...props }) {
    const defaultStyle = {
        width: '100%',
        height: '60px',
        bottom: 0,
        fontSize: '24px',
        backgroundColor: 'blue'
    };

    return (
        <footer style={{ ...defaultStyle, ...style }} {...props}>
            {children}
        </footer>
    );
}
