export default function RadiusImg({ src, alt, style }) {
    const defaultStyle = {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        overflow: 'hidden'
    };
    return (
        <div style={{ ...defaultStyle, ...style }}>
            <img style={{ width: '100%', height: '100%' }} src={src} alt={alt} />
        </div>
    );
}
