import { useEffect, useState } from "react";
import SettingsPopup from "./components/SettingsPopup";
import {
  LayoutDashboard,
  Settings,
  Package,
  Boxes,
  Upload,
  FileText,
  FilePlus2,
  CreditCard,
  BarChart3,
  BrainCircuit,
  Sparkles,
  Bell,
  TrendingUp,
  Menu,
  X,
  Search,
  Sun,
  Moon,
  LogOut,
  UserRound,
  ChevronDown,
  Store,
} from "lucide-react";

import BusinessOverview from "./components/BusinessOverview";
import Notifications from "./components/Notifications";
import ForecastVsActual from "./components/ForecastVsActual";
import Dashboard from "./components/Dashboard";
import Inventory from "./components/Inventory";
import CreateInvoice from "./components/CreateInvoice";
import InvoiceList from "./components/InvoiceList";
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

const PAGE_ICONS = {
  Dashboard: LayoutDashboard,
  "Control Console": Settings,
  "Products Catalog": Package,
  Inventory: Boxes,
  "Sales Upload": Upload,
  Invoices: FileText,
  "Invoice Creator": FilePlus2,
  "Payments Ledger": CreditCard,
  "Reports Suite": BarChart3,
  "AI Insights": BrainCircuit,
  "Sales Predictor": TrendingUp,
  "Business Overview": BarChart3,
  Notifications: Bell,
  "Forecast vs Actual": BarChart3,
};

const PAGE_LABELS = {
  Dashboard: "Dashboard",
  "Control Console": "Control Console",
  "Products Catalog": "Products Catalog",
  Inventory: "Inventory",
  "Sales Upload": "Upload Sales",
  Invoices: "Invoices",
  "Invoice Creator": "Invoice Creator",
  "Payments Ledger": "Payments",
  "Reports Suite": "Reports",
  "AI Insights": "AI Insights",
  "Sales Predictor": "Sales Predictor",
  "Business Overview": "Business Overview",
  Notifications: "Notifications",
  "Forecast vs Actual": "Forecast vs Actual",
};

const NAV_GROUPS = {
  Overview: ["Dashboard", "Business Overview"],
  Operations: ["Products Catalog", "Inventory", "Sales Upload"],
  Finance: ["Invoices", "Invoice Creator", "Payments Ledger"],
  Intelligence: ["AI Insights", "Sales Predictor"],
  Reports: ["Reports Suite", "Notifications", "Forecast vs Actual"],
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activePage, setActivePage] = useState("Dashboard");
  const [theme, setTheme] = useState("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

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
    } catch (error) {
      console.error("Failed to load user session profile:", error);

      localStorage.removeItem("token");
      setIsLoggedIn(false);
    } finally {
      setLoadingProfile(false);
    }
  };

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

  useEffect(() => {
    const handleSearchShortcut = (event) => {
      const isMac = navigator.platform
        .toUpperCase()
        .includes("MAC");

      const pressed = isMac
        ? event.metaKey && event.key.toLowerCase() === "k"
        : event.ctrlKey && event.key.toLowerCase() === "k";

      if (!pressed) return;

      event.preventDefault();

      const searchInput = document.querySelector(
        ".global-search input"
      );

      if (searchInput) {
        searchInput.focus();
        setSearchFocused(true);
      }
    };

    window.addEventListener("keydown", handleSearchShortcut);

    return () => {
      window.removeEventListener(
        "keydown",
        handleSearchShortcut
      );
    };
  }, []);

  const getRoleName = () => {
    if (!userProfile) return "Guest";

    const roleId = Number(userProfile.role_id);

    if (roleId === 1) return "System Administrator";
    if (roleId === 2) return "Store Manager";
    if (roleId === 3) return "Sales Executive";
    if (roleId === 4) return "Business Owner";

    return "Guest";
  };

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
        "Business Overview",
        "Notifications",
        "Forecast vs Actual",
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
        "Business Overview",
        "Notifications",
        "Forecast vs Actual",
      ];
    }

    if (roleName === "Business Owner") {
      return [
        "Dashboard",
        "Business Overview",
        "Notifications",
        "Forecast vs Actual",
        "Sales Upload",
        "Payments Ledger",
        "Reports Suite",
        "AI Insights",
        "Sales Predictor",
      ];
    }

    return ["Dashboard"];
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    setIsLoggedIn(false);
    setUserProfile(null);
    setActivePage("Dashboard");
    setProfileOpen(false);
    setSidebarOpen(false);
  };

  const handlePageChange = (page) => {
  setActivePage(page);
  setSidebarOpen(false);
  setSearchQuery("");
  setSearchFocused(false);
};



  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard />;

      case "Control Console":
        return <UsersRolesCategories />;

      case "Products Catalog":
        return <Recommendation />;

      case "Inventory":
        return <Inventory />;

      case "Sales Upload":
        return <SalesUpload />;

      case "Invoices":
        return <InvoiceList />;

      case "Invoice Creator":
        return <CreateInvoice />;

      case "Payments Ledger":
        return <Payments />;

      case "Reports Suite":
        return <ForecastReports />;

      case "AI Insights":
        return <AiInsights />;

      case "Sales Predictor":
        return <PredictSales />;

      case "Business Overview":
        return <BusinessOverview />;

      case "Notifications":
        return <Notifications />;

      case "Forecast vs Actual":
        return <ForecastVsActual />;

      default:
        return <Dashboard />;
    }
  };

  if (loadingProfile) {
    return (
      <div className="session-loading">
        <div className="session-loading-card">
          <div className="session-loader" />
          <h3>Establishing secure session</h3>
          <p>Loading your MarketMind workspace...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (showRegister) {
      return <Register setShowRegister={setShowRegister} />;
    }

    return (
      <Login
        setIsLoggedIn={setIsLoggedIn}
        setShowRegister={setShowRegister}
        setUserProfile={setUserProfile}
      />
    );
  }

  const roleName = getRoleName();
const allowedMenus = getRoleMenus();

const searchablePages = allowedMenus.map((page) => ({
  page,
  label: PAGE_LABELS[page] || page,
}));

const filteredSearchPages = searchablePages.filter(({ label, page }) => {
  const query = searchQuery.trim().toLowerCase();

  if (!query) return false;

  return (
    label.toLowerCase().includes(query) ||
    page.toLowerCase().includes(query)
  );
});

const handleSearchKeyDown = (e) => {
  if (e.key === "Escape") {
    setSearchQuery("");
    setSearchFocused(false);
    e.target.blur();
    return;
  }

  if (
    e.key === "Enter" &&
    filteredSearchPages.length > 0
  ) {
    handlePageChange(filteredSearchPages[0].page);
  }
};

const groupedMenus = Object.entries(NAV_GROUPS)
  .map(([groupName, pages]) => ({
    groupName,
    pages: pages.filter((page) => allowedMenus.includes(page)),
  }))
  .filter((group) => group.pages.length > 0);

  const ActiveIcon = PAGE_ICONS[activePage] || LayoutDashboard;

  return (
    <div className={`app ${theme}`}>
      {sidebarOpen && (
        <button
          className="mobile-sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`app-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            <Sparkles size={19} strokeWidth={2.2} />
          </div>

          <div className="brand-copy">
            <strong>MarketMind</strong>
            <span>AI Intelligence</span>
          </div>

          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        <div className="workspace-badge">
          <div className="workspace-icon">
            <Store size={15} />
          </div>

          <div>
            <span>Workspace</span>
            <strong>Small Business</strong>
          </div>
        </div>

        <nav className="sidebar-navigation">
          {groupedMenus.map(({ groupName, pages }) => (
            <div className="nav-group" key={groupName}>
              <div className="nav-group-title">{groupName}</div>

              <div className="nav-group-items">
                {pages.map((page) => {
                  const Icon = PAGE_ICONS[page] || LayoutDashboard;
                  const isActive = activePage === page;

                  return (
                    <button
                      key={page}
                      className={`nav-item ${isActive ? "active" : ""}`}
                      onClick={() => handlePageChange(page)}
                    >
                      <Icon size={18} strokeWidth={1.9} />
                      <span>{PAGE_LABELS[page] || page}</span>

                      {page === "Notifications" && (
                        <span className="nav-indicator" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
  className="sidebar-utility"
  onClick={() => setShowSettingsPopup(true)}
>
  <Settings size={18} />
  <span>Settings</span>
</button>

          <div className="sidebar-profile">
            <div className="profile-avatar">
              <UserRound size={18} />
            </div>

            <div className="profile-info">
              <strong>{userProfile?.full_name || "User"}</strong>
              <span>{roleName}</span>
            </div>

            <button
              className="profile-menu-button"
              onClick={() => setProfileOpen((value) => !value)}
              aria-label="Open profile menu"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {profileOpen && (
            <div className="profile-menu">
              <div className="profile-menu-email">
                {userProfile?.email || ""}
              </div>

              <button onClick={handleLogout}>
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="app-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>

            <div className="topbar-page">
              <div className="topbar-page-icon">
                <ActiveIcon size={17} />
              </div>

              <div>
                <strong>{PAGE_LABELS[activePage] || activePage}</strong>
                <span>MarketMind workspace</span>
              </div>
            </div>
          </div>

          <div
  className={`global-search ${searchFocused ? "is-focused" : ""}`}
>
  <Search size={18} />

  <input
    type="search"
    value={searchQuery}
    placeholder="Search workspace..."
    aria-label="Search workspace"
    onFocus={() => setSearchFocused(true)}
    onChange={(e) => setSearchQuery(e.target.value)}
    onKeyDown={handleSearchKeyDown}
  />

  {searchQuery ? (
    <button
      type="button"
      className="search-clear"
      onClick={() => {
        setSearchQuery("");
        setSearchFocused(true);
      }}
      aria-label="Clear search"
    >
      <X size={15} />
    </button>
  ) : (
    <kbd>⌘ K</kbd>
  )}

  {searchFocused && searchQuery.trim() && (
    <div className="search-results">
      {filteredSearchPages.length > 0 ? (
        filteredSearchPages.map(({ page, label }) => {
          const Icon = PAGE_ICONS[page] || LayoutDashboard;

          return (
            <button
              type="button"
              key={page}
              className="search-result-item"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handlePageChange(page)}
            >
              <span className="search-result-icon">
                <Icon size={17} />
              </span>

              <span className="search-result-content">
                <strong>{label}</strong>
                <small>MarketMind workspace</small>
              </span>

              <span className="search-result-arrow">→</span>
            </button>
          );
        })
      ) : (
        <div className="search-no-results">
          <Search size={20} />
          <div>
            <strong>No pages found</strong>
            <span>Try Dashboard, Reports, Invoices, AI Insights...</span>
          </div>
        </div>
      )}
    </div>
  )}

</div>


  <div className="topbar-actions">
    <div className="live-status">
      <span className="live-dot" />
      <span>Live</span>
    </div>

    <button
      className="topbar-icon-button"
      onClick={() => handlePageChange("Notifications")}
      aria-label="Notifications"
      title="Notifications"
    >
      <Bell size={19} />
      <span className="notification-dot" />
    </button>

    <button
      className="topbar-icon-button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun size={19} />
      ) : (
        <Moon size={19} />
      )}
    </button>

    <div className="topbar-user">
      <div className="topbar-user-avatar">
        <UserRound size={17} />
      </div>

      <div className="topbar-user-copy">
        <strong>{userProfile?.full_name || "User"}</strong>
        <span>{roleName}</span>
      </div>
    </div>
  </div>
        </header>

        <main className="main">
          <div className="page-content">
            {renderPage()}
          </div>
        </main>
        <SettingsPopup
  isOpen={showSettingsPopup}
  onClose={() => setShowSettingsPopup(false)}
  theme={theme}
  setTheme={(newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.className = newTheme;
  }}
  userProfile={userProfile}
/>
      </div>
    </div>
  );
}

export default App;