import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Inventory from "./components/Inventory";
import CreateInvoice from "./components/CreateInvoice";
import InvoiceList from "./components/InvoiceList";
import CustomerInsights from "./components/CustomerInsights";
import Recommendation from "./components/Recommendation";
import SalesUpload from "./components/SalesUpload";
import Payments from "./components/Payments";
import UsersRolesCategories from "./components/UsersRolesCategories";
import AiInsights from "./components/AiInsights";
import PredictSales from "./components/PredictSales";
import ForecastReports from "./components/ForecastReports";
import Login from "./components/Login";
import Register from "./components/Register";
import api from "./api";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activePage, setActivePage] = useState("Dashboard");
  const [theme, setTheme] = useState("dark"); // Default dark mode

  // Load theme and profile on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;

    const token = localStorage.getItem("token");
    if (token) {
      fetchProfile();
    } else {
      setIsLoggedIn(false);
      setLoadingProfile(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/api/auth/profile");
      if (response.data.success) {
        setUserProfile(response.data.user);
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error("Failed to load user session profile", err);
      localStorage.removeItem("token");
      setIsLoggedIn(false);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Sync profile when login state toggles to true
  useEffect(() => {
    if (isLoggedIn && !userProfile) {
      fetchProfile();
    }
  }, [isLoggedIn]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.className = newTheme;
  };

  const getRoleName = () => {
    if (!userProfile) return "Guest";
    const roleId = Number(userProfile.role_id);
    if (roleId === 1) return "System Administrator";
    if (roleId === 2) return "Store Manager";
    if (roleId === 3) return "Sales Executive";
    if (roleId === 4) return "Business Owner";
    return "Guest";
  };

  // RBAC lists of pages
  const getRoleMenus = () => {
    const roleName = getRoleName();
    if (roleName === "System Administrator") {
      return [
        "Dashboard",
        "Control Console",
        "Products Catalog",
        "Inventory",
        "Sales Upload",
        "Invoices",
        "Invoice Creator",
        "Payments Ledger",
        "Reports Suite",
        "AI Insights",
        "Sales Predictor",
        "Logout"
      ];
    }
    if (roleName === "Store Manager") {
      return [
        "Dashboard",
        "Products Catalog",
        "Inventory",
        "Sales Upload",
        "Invoices",
        "Invoice Creator",
        "Payments Ledger",
        "Reports Suite",
        "AI Insights",
        "Sales Predictor",
        "Logout"
      ];
    }
    if (roleName === "Sales Executive") {
      return [
        "Dashboard",
        "Products Catalog",
        "Sales Upload",
        "Invoices",
        "Invoice Creator",
        "Sales Predictor",
        "Logout"
      ];
    }
    if (roleName === "Business Owner") {
      return [
        "Dashboard",
        "Sales Upload",
        "Payments Ledger",
        "Reports Suite",
        "AI Insights",
        "Sales Predictor",
        "Logout"
      ];
    }
    return ["Dashboard", "Logout"];
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserProfile(null);
    setActivePage("Dashboard");
  };

  if (loadingProfile) {
    return (
      <div className="login-page">
        <div style={{ textAlign: "center" }}>
          <div className="spinner"></div>
          <p style={{ color: "#94a3b8", marginTop: "12px" }}>Establishing secure network session...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (showRegister) {
      return <Register setShowRegister={setShowRegister} />;
    }
    return <Login setIsLoggedIn={setIsLoggedIn} setShowRegister={setShowRegister} setUserProfile={setUserProfile} />;
  }

  const menuItems = getRoleMenus();

  return (
    <div className={`app ${theme}`}>
      
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <h2 style={{ fontSize: "20px" }}>MarketMind AI</h2>
          <button 
            onClick={toggleTheme} 
            style={{ 
              background: "transparent", 
              border: "none", 
              fontSize: "18px", 
              cursor: "pointer", 
              padding: "4px" 
            }}
            title="Toggle Light/Dark Theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
        <p style={{ fontSize: "12px", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 30px" }}>
          {getRoleName()}
        </p>

        <nav>
          {menuItems.map((item) => (
            <a
              key={item}
              className={activePage === item ? "active" : ""}
              onClick={() => {
                if (item === "Logout") {
                  handleLogout();
                } else {
                  setActivePage(item);
                }
              }}
            >
              {item === "Dashboard" && "📊 "}
              {item === "Control Console" && "⚙️ "}
              {item === "Products Catalog" && "📦 "}
              {item === "Inventory" && "🏭 "}
              {item === "Sales Upload" && "Ingest Batch "}
              {item === "Invoices" && "🧾 "}
              {item === "Invoice Creator" && "📝 "}
              {item === "Payments Ledger" && "💳 "}
              {item === "Reports Suite" && "📈 "}
              {item === "AI Insights" && "💡 "}
              {item === "Sales Predictor" && "🔮 "}
              {item === "Logout" && "🚪 "}
              {item}
            </a>
          ))}
        </nav>

        {userProfile && (
          <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid #1e293b", textAlign: "left", fontSize: "12px" }}>
            <span style={{ color: "#64748b" }}>User Profile:</span>
            <div style={{ fontWeight: "bold", color: "#cbd5e1", marginTop: "2px" }}>{userProfile.full_name}</div>
            <div style={{ color: "#64748b" }}>{userProfile.email}</div>
          </div>
        )}
      </aside>

      {/* Main Workspace Panels */}
      <main className="main">
        {activePage === "Dashboard" && <Dashboard />}
        {activePage === "Control Console" && <UsersRolesCategories />}
        {activePage === "Products Catalog" && <Recommendation />}
        {activePage === "Inventory" && <Inventory />}
        {activePage === "Sales Upload" && <SalesUpload />}
        {activePage === "Invoices" && <InvoiceList />}
        {activePage === "Invoice Creator" && <CreateInvoice />}
        {activePage === "Payments Ledger" && <Payments />}
        {activePage === "Reports Suite" && <ForecastReports />}
        {activePage === "AI Insights" && <AiInsights />}
        {activePage === "Sales Predictor" && <PredictSales />}
      </main>
    </div>
  );
}

export default App;