import { Routes, Route } from 'react-router-dom';
import Login from './Pages/Login.jsx';
import Signup from './Pages/Signup.jsx';
import TestPage from './test/TestPage.jsx';
import DashBoardPage from './Pages/DashBoardPage.jsx';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<DashBoardPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/DashBoardPage" element={<DashBoardPage />} />
        </Routes>
    );
}

export default App;
