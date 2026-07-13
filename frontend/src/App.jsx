import { useState } from "react";
import "./App.css";

const roleMenus = {
  "Business Owner": ["Dashboard", "Sales Upload", "Inventory", "Reports", "Forecast", "Logout"],
  "Store Manager": ["Dashboard", "Sales Upload", "Inventory", "Reports", "Logout"],
  "Sales Executive": ["Dashboard", "Sales Upload", "My Sales", "Logout"],
  "System Administrator": ["Dashboard", "Users", "Roles", "Reports", "Settings", "Logout"],
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("Business Owner");

  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>MarketMind AI</h1>
          <p>Small Business Sales Intelligence Platform</p>

          <input type="email" placeholder="Enter email" />
          <input type="password" placeholder="Enter password" />

          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Business Owner</option>
            <option>Store Manager</option>
            <option>Sales Executive</option>
            <option>System Administrator</option>
          </select>

          <button onClick={() => setIsLoggedIn(true)}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>MarketMind AI</h2>
        <p>{role}</p>

        <nav>
          {roleMenus[role].map((item, index) => (
            <a key={index} className={index === 0 ? "active" : ""}>
              {item}
            </a>
          ))}
        </nav>
      </aside>

      <main className="main">
        <section className="hero">
          <div>
            <h1>Welcome, {role}</h1>
            <p>
              Role-based navigation is active. Menu items change based on the selected user role.
            </p>
          </div>
          <button onClick={() => setIsLoggedIn(false)}>Logout</button>
        </section>

        <section className="cards">
          <div className="card">
            <h3>Total Revenue</h3>
            <h2>₹0</h2>
            <p>No sales data uploaded yet</p>
          </div>

          <div className="card">
            <h3>Total Sales</h3>
            <h2>0</h2>
            <p>Waiting for backend data</p>
          </div>

          <div className="card">
            <h3>Top Product</h3>
            <h2>None</h2>
            <p>No product data available</p>
          </div>
        </section>

        <section className="panel">
          <h2>Day 2 Frontend Work</h2>
          <p>
            Login page UI and role-based navigation shell completed using React state.
            Backend authentication API will be connected in upcoming integration.
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
