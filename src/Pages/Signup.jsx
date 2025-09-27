import React, { useState, useEffect } from "react";
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
    user_type: "korea", // 기본값 설정
  });

  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // 이메일 입력값이 변경되면 중복 확인 상태를 초기화
  useEffect(() => {
    setIsEmailChecked(false);
  }, [form.email]);

  // 비밀번호 확인 로직
  useEffect(() => {
    if (form.password_confirm && form.password !== form.password_confirm) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordError("");
    }
  }, [form.password, form.password_confirm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // 이메일 중복 확인 핸들러
  const handleCheckDuplicateEmail = async () => {
    if (!form.email) {
      alert("이메일을 입력해주세요.");
      return;
    }
    try {
      // 서버에 이메일 중복 확인 요청 (GET 요청 권장)
      const response = await axios.get(
        `http://192.168.0.57:4000/api/auth/check-email?email=${form.email}`
      );
      if (response.data.available) {
        alert("사용 가능한 이메일입니다.");
        setIsEmailChecked(true); // 중복 확인 완료 상태로 변경
      } else {
        alert("이미 사용 중인 이메일입니다.");
        setIsEmailChecked(false);
      }
    } catch (error) {
      // 409 Conflict 에러는 이미 사용 중인 이메일을 의미
      if (error.response?.status === 409) {
        alert("이미 사용 중인 이메일입니다.");
      } else {
        alert("이메일 중복 확인 중 오류가 발생했습니다.");
      }
      setIsEmailChecked(false);
    }
  };

  // 회원가입 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailChecked) {
      alert("이메일 중복 확인을 해주세요.");
      return;
    }

    if (form.password !== form.password_confirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 비밀번호, 이름 등 필수 필드 확인
    if (!form.password || !form.name) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    try {
      // 회원가입에 필요한 데이터만 추출하여 전송
      const { email, password, name, user_type } = form;
      await axios.post("http://192.168.0.57:4000/api/auth/register", {
        email,
        password,
        name,
        user_type,
      });
      alert("회원가입이 완료되었습니다!");
      navigate("/login");
    } catch (error) {
      console.error("회원가입 실패:", error);
      alert("회원가입에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 국가 선택 라디오 버튼 데이터
  const countries = [
    { value: "japan", label: "JAPAN" },
    { value: "china", label: "CHINA" },
    { value: "korea", label: "KOREA" },
    { value: "usa", label: "USA" },
    { value: "vietnam", label: "VIETNAM" },
  ];

  return (
    <div
      className="signup-inner"
      style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
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
              required
            />
            <button
              type="button"
              className="check-btn"
              onClick={handleCheckDuplicateEmail}
            >
              중복 확인
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
              placeholder="영문, 숫자 포함 8~30자"
              required
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
              placeholder="비밀번호를 다시 입력해주세요"
              required
            />
          </div>
          {passwordError && (
            <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
              {passwordError}
            </p>
          )}
        </div>

        <div className="signup-field">
          <label>이름</label>
          <div className="input-line-group">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="이름을 입력해주세요"
              required
            />
          </div>
        </div>

        <div className="signup-radio">
          {countries.map((country) => (
            <label key={country.value}>
              <input
                type="radio"
                name="user_type"
                value={country.value}
                checked={form.user_type === country.value}
                onChange={handleChange}
              />
              {country.label}
            </label>
          ))}
        </div>

        <button
          type="submit"
          className="signup-submit"
          disabled={!isEmailChecked || !!passwordError}
        >
          가입하기
        </button>
      </form>
    </div>
  );
}

export default Signup;
