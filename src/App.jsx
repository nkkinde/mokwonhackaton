import { Routes, Route } from 'react-router-dom';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import TestPage from './Pages/TestPage.jsx';
import DashBoardPage from './Pages/DashBoardPage.jsx';
// import './App.css';

function App() {
    return (
        <Routes>
            <Route path="/" element={<TestPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<DashBoardPage />} />
        </Routes>
    );
}

export default App;
