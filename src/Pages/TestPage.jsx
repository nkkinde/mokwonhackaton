import DashBoardPage from './DashBoardPage.jsx';

export default function TestPage({ style, ...props }) {
    return (
        <>
            <DashBoardPage style={{ ...style }} {...props} />
        </>
    );
}
