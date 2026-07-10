import { useState } from "react";
import axios from "axios";

function Register({
  setShowRegister,
}) {

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Business Owner");

  const roleMap = {
    "Business Owner": 1,
    "Store Manager": 2,
    "Sales Executive": 3,
    "System Administrator": 4,
  };

  const registerUser = async () => {

    try {

      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          full_name: fullName,
          email: email,
          password: password,
          phone: phone,
          role_id: roleMap[role],
        }
      );

      alert(response.data.message || "Registration Successful");

      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("");

      setShowRegister(false);

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Registration Failed"
      );

    }

  };

  return (

    <div className="login-page">

      <div className="login-card">

        <h1>MarketMind AI</h1>

        <p>Create Your Account</p>

        <input
          placeholder="Full Name"
          value={fullName}
          onChange={(e)=>setFullName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e)=>setPhone(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <select
          value={role}
          onChange={(e)=>setRole(e.target.value)}
        >
          <option>Business Owner</option>
          <option>Store Manager</option>
          <option>Sales Executive</option>
          <option>System Administrator</option>
        </select>

        <button onClick={registerUser}>
          Get Started
        </button>

        <button
          className="secondary-btn"
          onClick={() => setShowRegister(false)}
        >
          Back to Login
        </button>

      </div>

    </div>

  );

}

export default Register;