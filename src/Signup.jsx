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
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await axios.post("http://172.16.112.49:8000/auth/register", form);
      alert("회원가입이 완료되었습니다!");
      navigate("/login");
    } catch (error) {
      console.error("회원가입 실패:", error);
      alert("회원가입에 실패했습니다. 다시 시도해주세요.");
    }
  };
  const handleCheckDuplicateEmail = async () => {
    if (!form.email) {
      alert("이메일을 입력하세요.");
      return;
    }
    try {
      const response = await axios.post("http://172.16.112.49:8000/auth/check-email", { email: form.email });
      if (response.data.available) {
        alert("사용 가능한 이메일입니다.");
      } else {
        alert("이미 사용 중인 이메일입니다. 다른 이메일을 입력하세요.");
      }
    } catch (error) {
      if (error.response?.status === 409) {
        alert("이미 사용 중인 이메일입니다. 다른 이메일을 입력하세요.");
      } else {
        alert("이메일 중복 확인 중 오류가 발생했습니다.");
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
