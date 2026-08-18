import { useEffect, useState } from "react";
import api from "../api";
import "./SettingsPopup.css";

function SettingsPopup({
  isOpen,
  onClose,
  theme,
  setTheme,
  userProfile,
}) {
  const [notifications, setNotifications] = useState(true);

  // Change password states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

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

  // Open password section
  const openChangePassword = () => {
    setShowChangePassword(true);
    setPasswordMessage("");
    setPasswordError("");
  };

  // Close password section
  const closeChangePassword = () => {
    setShowChangePassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("");
    setPasswordError("");
  };

  // Change password
  const handleChangePassword = async (event) => {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirm password do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await api.post(
        "/api/auth/change-password",
        {
          currentPassword,
          newPassword,
        }
      );

      if (response.data?.success) {
        setPasswordMessage(
          response.data.message ||
            "Password changed successfully."
        );

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setTimeout(() => {
          setShowChangePassword(false);
          setPasswordMessage("");
        }, 1500);
      } else {
        setPasswordError(
          response.data?.message ||
            "Unable to change password."
        );
      }
    } catch (error) {
      console.error("Change password error:", error);

      setPasswordError(
        error.response?.data?.message ||
          error.formattedMessage ||
          "Failed to change password. Please try again."
      );
    } finally {
      setPasswordLoading(false);
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
                {userProfile?.email ||
                  "MarketMind User"}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="settings-section">
          <div className="settings-section-title">
            <div className="settings-icon">🔒</div>

            <div>
              <h3>Change Password</h3>
              <p>Update your account password</p>
            </div>
          </div>

          {!showChangePassword ? (
            <button
              type="button"
              className="change-password-button"
              onClick={openChangePassword}
            >
              <span>Change Password</span>
              <span>→</span>
            </button>
          ) : (
            <form
              className="change-password-form"
              onSubmit={handleChangePassword}
            >
              {/* Current Password */}
              <div className="password-field">
                <label>Current Password</label>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
              </div>

              {/* New Password */}
              <div className="password-field">
                <label>New Password</label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
              </div>

              {/* Confirm Password */}
              <div className="password-field">
                <label>Confirm New Password</label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
              </div>

              {/* Error */}
              {passwordError && (
                <div className="password-message error">
                  {passwordError}
                </div>
              )}

              {/* Success */}
              {passwordMessage && (
                <div className="password-message success">
                  ✓ {passwordMessage}
                </div>
              )}

              {/* Buttons */}
              <div className="password-actions">
                <button
                  type="button"
                  className="password-cancel"
                  onClick={closeChangePassword}
                  disabled={passwordLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="password-update"
                  disabled={passwordLoading}
                >
                  {passwordLoading
                    ? "Updating..."
                    : "Update Password"}
                </button>
              </div>
            </form>
          )}
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
                theme === "light"
                  ? "active"
                  : ""
              }`}
              onClick={() => setTheme("light")}
            >
              <span className="theme-option-icon">
                ☀
              </span>

              <span className="theme-option-text">
                <strong>Light</strong>
                <small>
                  Bright workspace
                </small>
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
                theme === "dark"
                  ? "active"
                  : ""
              }`}
              onClick={() => setTheme("dark")}
            >
              <span className="theme-option-icon">
                ☾
              </span>

              <span className="theme-option-text">
                <strong>Dark</strong>
                <small>
                  Dark workspace
                </small>
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
              <div className="settings-icon">
                ♢
              </div>

              <div>
                <h3>Notifications</h3>
                <p>
                  Receive business alerts and
                  updates
                </p>
              </div>
            </div>

            <button
              type="button"
              className={`settings-toggle ${
                notifications
                  ? "enabled"
                  : ""
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
            <div className="settings-icon">
              ▦
            </div>

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