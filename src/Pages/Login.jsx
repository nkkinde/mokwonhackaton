import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import "./Login.css";
import iconImage from "/chaticon.png";

function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // 백엔드 포맷: { ok: true, data: { access, refresh, user } }
      const resp = await api.post("/api/auth/login", { email: id, password });
      const { access, refresh, user } = resp.data;

      // 토큰/유저 저장 (키 통일)
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("me", JSON.stringify(user));

      alert("Login successful!");
      navigate("/DashBoardPage");
    } catch (error) {
      console.error(error);
      alert("Login failed. Please check your ID or password.");
    }
  };

  const goToSignup = () => navigate("/signup");

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