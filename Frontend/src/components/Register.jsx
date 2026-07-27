import { useState } from "react";
import api from "../api";

function Register({ setShowRegister }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Manager"); // Default role

  const roleMap = {
    Admin: 1,
    Manager: 2,
    "Sales Executive": 3,
    "Business Owner": 4
  };

  const registerUser = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      alert("Required fields: Name, Email, and Password must be filled.");
      return;
    }

    try {
      const response = await api.post("/api/auth/register", {
        full_name: fullName,
        email: email,
        password: password,
        phone: phone || null,
        role_id: roleMap[role]
      });

      alert(response.data.message || "Registration Successful!");
      setShowRegister(false);
    } catch (error) {
      alert(error.formattedMessage || "Registration Failed. Please check inputs.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 style={{ color: "#38bdf8", textShadow: "0 0 10px rgba(56, 189, 248, 0.2)" }}>MarketMind AI</h1>
        <p style={{ color: "#94a3b8" }}>Create Your Business Account</p>

        <form onSubmit={registerUser} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <input
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white", marginBottom: "12px" }}
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white", marginBottom: "12px" }}
            required
          />

          <input
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white", marginBottom: "12px" }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white", marginBottom: "12px" }}
            required
          />

          <label style={{ color: "#cbd5e1", fontSize: "13px", textAlign: "left", marginBottom: "6px", fontWeight: "bold" }}>System Access Level</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white", marginBottom: "16px" }}
          >
            <option>Admin</option>
            <option>Manager</option>
            <option>Sales Executive</option>
            <option>Business Owner</option>
          </select>

          <button type="submit" style={{ padding: "14px", background: "#38bdf8", border: "none", color: "#020617", fontWeight: "bold", borderRadius: "8px", cursor: "pointer", fontSize: "15px" }}>
            Get Started
          </button>
        </form>

        <button
          className="secondary-btn"
          onClick={() => setShowRegister(false)}
          style={{ width: "100%", padding: "14px", border: "none", color: "white", fontWeight: "bold", borderRadius: "8px", cursor: "pointer", fontSize: "15px", marginTop: "12px", background: "#334155" }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default Register;