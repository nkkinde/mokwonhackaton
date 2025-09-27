import Footer from '../../Footer';
import Header from '../../Header';
import DashBoardContent from './DashBoardContent';

export default function DashBoardMain({ style, ...props }) {
    const defaultStyle = {
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
    };
    return (
        <div style={{ ...defaultStyle, ...style }} {...props}>
            <Header>header</Header>
            <DashBoardContent style={{ flex: 1 }}> content </DashBoardContent>
            <Footer>footer</Footer>
        </div>
    );
}
