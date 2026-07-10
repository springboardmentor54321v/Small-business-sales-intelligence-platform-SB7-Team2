import { useState } from "react";

function Login({
  role,
  setRole,
  setIsLoggedIn,
  setShowRegister,
}) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {

    // Login API will be integrated later
    if (email.trim() === "" || password.trim() === "") {
      alert("Please enter email and password");
      return;
    }

    setIsLoggedIn(true);

  };

  return (

    <div className="login-page">

      <div className="login-card">

        <h1>MarketMind AI</h1>

        <p>Small Business Sales Intelligence Platform</p>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option>Business Owner</option>
          <option>Store Manager</option>
          <option>Sales Executive</option>
          <option>System Administrator</option>
        </select>

        <button
  onClick={handleLogin}
  style={{ width: "100%", marginTop: "15px" }}
>
  Login
</button>

<button
  className="secondary-btn"
  onClick={() => setShowRegister(true)}
  style={{ width: "100%", marginTop: "15px" }}
>
  Get Started
</button>

      </div>

    </div>

  );

}

export default Login;