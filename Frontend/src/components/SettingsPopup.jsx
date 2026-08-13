import { useEffect, useState } from "react";
import "./SettingsPopup.css";

function SettingsPopup({
  isOpen,
  onClose,
  theme,
  setTheme,
  userProfile,
}) {
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="settings-overlay"
      onClick={handleBackdropClick}
    >
      <div className="settings-modal">

        {/* Header */}
        <div className="settings-modal-header">
          <div>
            <span className="settings-eyebrow">
              ACCOUNT & PREFERENCES
            </span>

            <h2>Settings</h2>

            <p>
              Manage your MarketMind workspace preferences.
            </p>
          </div>

          <button
            className="settings-close"
            onClick={onClose}
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        {/* Profile */}
        <div className="settings-section">
          <div className="settings-section-title">
            <div className="settings-icon">◉</div>

            <div>
              <h3>Profile</h3>
              <p>Your account information</p>
            </div>
          </div>

          <div className="settings-profile">
            <div className="settings-avatar">
              {(
                userProfile?.full_name ||
                userProfile?.name ||
                "U"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="settings-profile-info">
              <strong>
                {userProfile?.full_name ||
                  userProfile?.name ||
                  "User"}
              </strong>

              <span>
                {userProfile?.email || "MarketMind User"}
              </span>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="settings-section">
          <div className="settings-section-title">
            <div className="settings-icon">◐</div>

            <div>
              <h3>Appearance</h3>
              <p>Customize how MarketMind looks</p>
            </div>
          </div>

          <div className="theme-options">

            <button
              type="button"
              className={`theme-option ${
                theme === "light" ? "active" : ""
              }`}
              onClick={() => setTheme("light")}
            >
              <span className="theme-option-icon">
                ☀
              </span>

              <span className="theme-option-text">
                <strong>Light</strong>
                <small>Bright workspace</small>
              </span>

              {theme === "light" && (
                <span className="theme-check">
                  ✓
                </span>
              )}
            </button>

            <button
              type="button"
              className={`theme-option ${
                theme === "dark" ? "active" : ""
              }`}
              onClick={() => setTheme("dark")}
            >
              <span className="theme-option-icon">
                ☾
              </span>

              <span className="theme-option-text">
                <strong>Dark</strong>
                <small>Dark workspace</small>
              </span>

              {theme === "dark" && (
                <span className="theme-check">
                  ✓
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Notifications */}
        <div className="settings-section">
          <div className="settings-row">

            <div className="settings-section-title">
              <div className="settings-icon">♢</div>

              <div>
                <h3>Notifications</h3>
                <p>
                  Receive business alerts and updates
                </p>
              </div>
            </div>

            <button
              type="button"
              className={`settings-toggle ${
                notifications ? "enabled" : ""
              }`}
              onClick={() =>
                setNotifications(
                  (value) => !value
                )
              }
              aria-label="Toggle notifications"
            >
              <span />
            </button>

          </div>
        </div>

        {/* Workspace */}
        <div className="settings-section">
          <div className="settings-section-title">
            <div className="settings-icon">▦</div>

            <div>
              <h3>Workspace</h3>
              <p>Small Business</p>
            </div>
          </div>

          <div className="workspace-info">
            <span>Workspace status</span>

            <strong>
              <i />
              Active
            </strong>
          </div>
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <span>MarketMind AI</span>

          <button
            type="button"
            className="settings-done"
            onClick={onClose}
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

export default SettingsPopup;
