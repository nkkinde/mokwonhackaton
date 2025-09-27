export default function UserOneDisplay({ user, type }) {
    // type: img-nameLow, img-nameMiddle, img-nameHigh
    const style = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px'
    };

    return (
        <div style={style}>
            <Image
                src={user.img}
                alt={user.name}
                style={{ width: '50px', height: '50px', borderRadius: '50%' }}
            />
            {type}
        </div>
    );
}
