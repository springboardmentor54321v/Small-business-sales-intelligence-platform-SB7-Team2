import { useState } from "react";
import api from "../api";

function Login({ setIsLoggedIn, setShowRegister, setUserProfile }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      // Save token
      localStorage.setItem("token", response.data.token);
      
      // Update profile immediately
      if (setUserProfile) {
        setUserProfile(response.data.user);
      }

      alert("Login Successful!");
      setIsLoggedIn(true);
    } catch (error) {
      alert(error.formattedMessage || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 style={{ color: "#38bdf8", textShadow: "0 0 10px rgba(56, 189, 248, 0.2)" }}>MarketMind AI</h1>
        <p style={{ color: "#cbd5e1" }}>Small Business Sales Intelligence Platform</p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <input
            type="email"
            placeholder="Enter Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white", marginBottom: "14px" }}
            required
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white", marginBottom: "18px" }}
            required
          />

          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: "14px", background: "#38bdf8", border: "none", color: "#020617", fontWeight: "bold", borderRadius: "8px", cursor: "pointer", fontSize: "15px" }}
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <button
          className="secondary-btn"
          onClick={() => setShowRegister(true)}
          style={{ width: "100%", padding: "14px", border: "none", color: "white", fontWeight: "bold", borderRadius: "8px", cursor: "pointer", fontSize: "15px", marginTop: "12px", background: "#334155" }}
        >
          Register New Account
        </button>
      </div>
    </div>
  );
}

export default Login;
