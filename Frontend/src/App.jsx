import { useEffect, useState } from "react";
import api from "./api";
import "./App.css";

// Modules
import Dashboard from "./components/Dashboard";
import UsersRolesCategories from "./components/UsersRolesCategories";
import Recommendation from "./components/Recommendation";
import Inventory from "./components/Inventory";
import SalesUpload from "./components/SalesUpload";
import InvoiceList from "./components/InvoiceList";
import CreateInvoice from "./components/CreateInvoice";
import Payments from "./components/Payments";
import ForecastReports from "./components/ForecastReports";
import AiInsights from "./components/AiInsights";
import PredictSales from "./components/PredictSales";
import BusinessOverview from "./components/BusinessOverview";
import Notifications from "./components/Notifications";
import ForecastVsActual from "./components/ForecastVsActual";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  const [theme, setTheme] = useState("dark");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoggedIn(false);
          setLoadingProfile(false);
          return;
        }

        const response = await api.get("/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setUserProfile(response.data.user);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error("Session profile fetch failed:", err);
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const getRoleName = () => {
    if (!userProfile) return "Guest";
    const roleId = userProfile.role_id;
    if (roleId === 1) return "System Administrator";
    if (roleId === 2) return "Store Manager";
    if (roleId === 3) return "Sales Executive";
    if (roleId === 4) return "Business Owner";
    return "Guest";
  };

  // RBAC lists of pages (without "Logout" as it moves to top header)
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
        "Business Overview",
        "Notifications",
        "Forecast vs Actual"
      ];
    }
    if (roleName === "Store Manager") {
      return [
        "Dashboard",
        "Products Catalog",
        "Inventory",
        "Sales Upload",
        "Reports Suite",
        "AI Insights",
        "Sales Predictor",
        "Business Overview",
        "Notifications",
        "Forecast vs Actual"
      ];
    }
    if (roleName === "Sales Executive") {
      return [
        "Dashboard",
        "Sales Upload",
        "Invoices",
        "Invoice Creator",
        "Payments Ledger",
        "Sales Predictor",
        "Business Overview",
        "Notifications",
        "Forecast vs Actual"
      ];
    }
    if (roleName === "Business Owner") {
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
        "Business Overview",
        "Notifications",
        "Forecast vs Actual"
      ];
    }
    return ["Dashboard"];
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserProfile(null);
    setActivePage("Dashboard");
    setShowProfileMenu(false);
  };

  // SVG Outlines Renderer Helper
  const renderIcon = (name) => {
    switch (name) {
      case "Dashboard":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
          </svg>
        );
      case "Control Console":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );
      case "Products Catalog":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        );
      case "Inventory":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
          </svg>
        );
      case "Sales Upload":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        );
      case "Invoices":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        );
      case "Invoice Creator":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        );
      case "Payments Ledger":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" ry="2" /><line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        );
      case "Reports Suite":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        );
      case "AI Insights":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        );
      case "Sales Predictor":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 8l-4 4h8z" />
          </svg>
        );
      case "Business Overview":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
          </svg>
        );
      case "Notifications":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        );
      case "Forecast vs Actual":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
          </svg>
        );
      default:
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
    }
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

  // Sidebar structural categorizations
  const categoryGroups = [
    {
      title: "Overview",
      items: ["Dashboard", "Business Overview", "Notifications", "Forecast vs Actual", "AI Insights", "Sales Predictor"]
    },
    {
      title: "Operations",
      items: ["Products Catalog", "Inventory", "Sales Upload"]
    },
    {
      title: "Finance",
      items: ["Invoices", "Invoice Creator", "Payments Ledger", "Reports Suite"]
    },
    {
      title: "Admin",
      items: ["Control Console"]
    }
  ];

  // Helper to extract initials for user avatar
  const getUserInitials = () => {
    if (!userProfile) return "U";
    const name = userProfile.full_name || "User";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`app-container ${theme}`}>
      
      {/* Top Header Bar */}
      <header className="top-header">
        <div className="header-breadcrumb">
          <span style={{ color: "var(--text-tertiary)", fontWeight: "500" }}>MarketMind AI</span>
          <span style={{ color: "var(--text-tertiary)" }}>/</span>
          <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{activePage}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
          {/* Notification bell linked directly to Notifications module */}
          <button 
            onClick={() => setActivePage("Notifications")}
            style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", padding: "8px", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
            title="Operational Alerts"
          >
            <div style={{ position: "relative" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <div style={{ position: "absolute", top: "1px", right: "2px", width: "7px", height: "7px", borderRadius: "50%", background: "var(--danger)" }}></div>
            </div>
          </button>

          <div className="header-divider"></div>

          {/* User profile details cluster */}
          <div className="profile-cluster" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <div className="profile-avatar">{getUserInitials()}</div>
            <div className="profile-info">
              <span className="profile-name">{userProfile?.full_name || "User"}</span>
              <span className="profile-role">{getRoleName()}</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--text-secondary)", marginLeft: "4px" }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* Profile Dropdown Box */}
          {showProfileMenu && (
            <div className="profile-dropdown" onClick={(e) => e.stopPropagation()}>
              <button className="profile-dropdown-item" onClick={() => { setActivePage("Dashboard"); setShowProfileMenu(false); }}>Profile Settings</button>
              <button className="profile-dropdown-item" onClick={() => { toggleTheme(); setShowProfileMenu(false); }}>
                Theme: {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
              <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }}></div>
              <button className="profile-dropdown-item danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main app body wrapping sidebar and main content */}
      <div className="app-main-body">
        
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <div className="sidebar-logo-wrapper">
            <div className="logo-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>MarketMind AI</h2>
          </div>

          <div className="role-badge">
            {getRoleName()}
          </div>

          <nav>
            {categoryGroups.map((group) => {
              // Filter group items dynamically by user's role-allowed menus
              const allowedItems = group.items.filter((item) => menuItems.includes(item));
              if (allowedItems.length === 0) return null;

              return (
                <div key={group.title}>
                  <div className="nav-category-title">{group.title}</div>
                  {allowedItems.map((item) => (
                    <a
                      key={item}
                      className={activePage === item ? "active" : ""}
                      onClick={() => setActivePage(item)}
                    >
                      {renderIcon(item)}
                      {item}
                    </a>
                  ))}
                </div>
              );
            })}
          </nav>
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
          {activePage === "Business Overview" && <BusinessOverview />}
          {activePage === "Notifications" && <Notifications />}
          {activePage === "Forecast vs Actual" && <ForecastVsActual />}
        </main>
      </div>

    </div>
  );
}

export default App;