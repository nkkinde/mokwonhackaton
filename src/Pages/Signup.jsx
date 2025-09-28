import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import "./Signup.css";
import iconImage from "/chaticon.png";

// 프론트 라디오값 -> 백엔드 locale 매핑
const mapUserTypeToLocale = {
  japan: "jp",
  china: "cn",
  korea: "kr",
  usa: "us",
  vietnam: "vn",
};

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirm: "",
    name: "",
    user_type: "korea", // default
  });

  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => setIsEmailChecked(false), [form.email]);

  useEffect(() => {
    if (form.password_confirm && form.password !== form.password_confirm) {
      setPasswordError("Password does not match.");
    } else {
      setPasswordError("");
    }
  }, [form.password, form.password_confirm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckDuplicateEmail = async () => {
    if (!form.email) return alert("Please enter your email.");
    try {
      const response = await api.get(`/api/auth/check-email`, {
        params: { email: form.email },
      });
      if (response.data.available) {
        alert("This is an available email.");
        setIsEmailChecked(true);
      } else {
        alert("This email address is already in use.");
        setIsEmailChecked(false);
      }
    } catch (error) {
      if (error.response?.status === 409) {
        alert("This email address is already in use.");
      } else {
        alert("An error occurred while checking for duplicate emails.");
      }
      setIsEmailChecked(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailChecked) return alert("Please check for duplicate emails.");
    if (form.password !== form.password_confirm) return alert("Password does not match.");
    if (!form.password || !form.name) return alert("Please fill in all fields.");

    try {
      const { email, password, name, user_type } = form;
      const locale = mapUserTypeToLocale[user_type] || "kr";

      await api.post("/api/auth/register", {
        email,
        password,
        name,
        locale, // 백엔드 User.locale 필드에 저장
      });

      alert("Your membership registration is complete!");
      navigate("/login");
    } catch (error) {
      console.error("회원가입 실패:", error);
      alert("Signing up failed. Please try again.");
    }
  };

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
          <label>email</label>
          <div className="input-line-group">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@example.com"
              required
            />
            <button type="button" className="check-btn" onClick={handleCheckDuplicateEmail}>
              Check for duplicates
            </button>
          </div>
        </div>

        <div className="signup-field">
          <label>Password</label>
          <div className="input-line-group">
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="8 to 30 characters including English letters and numbers"
              required
            />
          </div>
        </div>

        <div className="signup-field">
          <label>verify password</label>
          <div className="input-line-group">
            <input
              type="password"
              name="password_confirm"
              value={form.password_confirm}
              onChange={handleChange}
              placeholder="Please re-enter your password"
              required
            />
          </div>
          {passwordError && (
            <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>{passwordError}</p>
          )}
        </div>

        <div className="signup-field">
          <label>Name</label>
          <div className="input-line-group">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Please enter your name"
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

        <button type="submit" className="signup-submit" disabled={!isEmailChecked || !!passwordError}>
          Sign up
        </button>
      </form>
    </div>
  );
}

export default Signup;