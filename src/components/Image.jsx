export default function Image({ src, alt, style }) {
    const defaultSrc = '../img/chaticon.png';
    if (!src) {
        src = defaultSrc;
    }
    return (
        <div style={{ ...style }}>
            <img style={{ width: '100%', height: '100%' }} src={src} alt={alt} />
        </div>
    );
}
