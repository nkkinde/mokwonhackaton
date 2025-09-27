import { Routes, Route } from 'react-router-dom';
import Login from './Pages/Login.jsx';
import Signup from './Pages/Signup.jsx';
import MainPage from './Pages/DashBoardPage.jsx';
import TestPage from './Pages/TestPage.jsx';
import DashBoardPage from './Pages/DashBoardPage.jsx';

function App() {
    return (
        <Routes>
            <Route path="/" element={<DashBoardPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<DashBoardPage />} />
        </Routes>
    );
}

export default App;
