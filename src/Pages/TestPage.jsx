import RadiusImg from '../components/RadiusImg';
import chatIcon from '../img/chaticon.png';

export default function TestPage({ style, ...props }) {
    return (
        <RadiusImg src={chatIcon} alt="test" style={style} {...props} />
    );
}
