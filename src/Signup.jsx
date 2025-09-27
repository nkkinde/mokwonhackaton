import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.css";
import iconImage from "/chaticon.png";

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirm: "",
    name: "",
    user_type: "normal",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.password_confirm) {
      alert("Password does not match.");
      return;
    }

    try {
      await axios.post("http://192.168.0.57:4000/api/auth/register", form);
      alert("Your membership registration is complete!");
      navigate("/login");
    } catch (error) {
      console.error("회원가입 실패:", error);
      alert("Signing up failed. Please try again.");
    }
  };
  const handleCheckDuplicateEmail = async () => {
    if (!form.email) {
      alert("Please enter your email.");
      return;
    }
    try {
      const response = await axios.post("http://192.168.0.57:4000/api/auth/check-email", { email: form.email });
      if (response.data.available) {
        alert("This is an available email.");
      } else {
        alert("This email address is already in use. Please enter a different email address.");
      }
    } catch (error) {
      if (error.response?.status === 409) {
        alert("This email address is already in use. Please enter a different email address.");
      } else {
        alert("An error occurred while checking for duplicate emails.");
      }
    }
  };


  return (

      <div className="signup-inner" style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <form className="signup-box" onSubmit={handleSubmit}>
        <div className="signup-icon">
          <img
            src={iconImage}
            alt="아이콘"
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "15px",
              objectFit: "cover",
            }}
          />
        </div>
          <div className="signup-field">
            <label>이메일</label>
            <div className="input-line-group">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@example.com"
              />
              <button type="button" className="check-btn" onClick={handleCheckDuplicateEmail}>
                Duplicate check
              </button>
            </div>
          </div>



          <div className="signup-field">
            <label>비밀번호</label>
            <div className="input-line-group">
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="1 to 30 characters in English"
              />
            </div>
          </div>

          <div className="signup-field">
            <label>비밀번호 확인</label>
            <div className="input-line-group">
              <input
                type="password"
                name="password_confirm"
                value={form.password_confirm}
                onChange={handleChange}
                placeholder="1 to 30 characters in English"
              />
            </div>
          </div>

          <div className="signup-field">
            <label>이름</label>
            <div className="input-line-group">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Please enter your name"
              />
            </div>
          </div>


          <div className="signup-radio">
            <label>
              <input
                type="radio"
                name="user_type"
                value="japan"
                checked={form.user_type === "japan"}
                onChange={handleChange}
              />
              JAPAN
            </label>
            <label>
              <input
                type="radio"
                name="user_type"
                value="china"
                checked={form.user_type === "china"}
                onChange={handleChange}
              />
              CHINA
            </label>
            <label>
              <input
                type="radio"
                name="user_type"
                value="korea"
                checked={form.user_type === "korea"}
                onChange={handleChange}
              />
              KOREA
            </label>
            <label>
              <input
                type="radio"
                name="user_type"
                value="usa"
                checked={form.user_type === "usa"}
                onChange={handleChange}
              />
              USA
            </label>
            <label>
            <input
                type="radio"
                name="user_type"
                value="vietnam"
                checked={form.user_type === "vietnam"}
                onChange={handleChange}
              />
              Vietnam
            </label>
          </div>

          <button type="submit" className="signup-submit">Sign up</button>
        </form>
      </div>
  );
}

export default Signup;
