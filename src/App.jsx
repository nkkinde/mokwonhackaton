import { Routes, Route } from 'react-router-dom';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import MainPage from './DashBoardPage.jsx';
import TestPage from './Pages/TestPage.jsx';
import './App.css';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/MainPage" element={<MainPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/test" element={<TestPage />} />
        </Routes>
    );
}

export default App;
