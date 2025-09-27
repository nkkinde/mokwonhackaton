import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import iconImage from "/chaticon.png";



function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://172.16.112.49:8000/auth/login", {
        email: id,
        password: password,
      });

      const token = response.data.access_token;
      localStorage.setItem("access_token", token);

      alert("Login successful!");
      navigate("/MainPage");
    } catch (error) {
      console.error(error);
      alert("Login failed. Please check your ID or password.");
    }
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  return (


      <div
        className="login-inner"
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >

        <div className="login-box">
            <div className="login-icon">
            <img
                src={iconImage}
                alt="아이콘"
                style={{
                width: "150px",
                height: "150px",
                marginBottom: "30px",
                objectFit: "cover",
                borderRadius: "0",
                }}
            />
            </div>

          <div className="login-label">아이디</div>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="login-input"
            placeholder="Please enter your email"
          />

          <div className="login-label">비밀번호</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            placeholder="Please enter your password"
          />

          <button className="login-btn" onClick={handleLogin}>
            Sign in
          </button>
          <button className="signup-btn" onClick={goToSignup}>
            Sign up
          </button>
        </div>
      </div>

  );
}

export default Login;
