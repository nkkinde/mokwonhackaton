import DashBoardMain from './Main/DashBoardMain';
import DashBoardSidebar from './SideBar/DashBoardSidebar';

export default function DashBoard() {
    const style = {
        display: 'flex'
    };

    return (
        <div style={style}>
            <DashBoardSidebar />
            <DashBoardMain />
        </div>
    );
}
