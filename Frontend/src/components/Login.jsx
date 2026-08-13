import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import api from "../api";
import "./Login.css";

function Login({ setIsLoggedIn, setShowRegister, setUserProfile }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      // Keep existing authentication logic
      localStorage.setItem("token", response.data.token);

      if (setUserProfile) {
        setUserProfile(response.data.user);
      }

      setIsLoggedIn(true);
    } catch (error) {
      setError(
        error.formattedMessage || "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Background decoration */}
      <div className="login-grid" />
      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />

      <div className="login-shell">

        {/* =====================================================
            LEFT BRAND PANEL
        ===================================================== */}
        <section className="login-brand">

          <div className="brand-top">
            <div className="brand-logo">
              <Sparkles size={27} strokeWidth={2.2} />
            </div>

            <div>
              <h1>MarketMind</h1>
              <span>AI INTELLIGENCE</span>
            </div>
          </div>

          <div className="brand-content">

            <div className="eyebrow">
              <span />
              BUSINESS INTELLIGENCE PLATFORM
            </div>

            <h2>
              Intelligent tools for
              <br />
              <strong>smarter decisions.</strong>
            </h2>

            <p>
              Analyze your business, understand your customers,
              predict sales and make confident decisions from
              one intelligent workspace.
            </p>

            <div className="login-features">

              <div className="login-feature">
                <div className="feature-icon">
                  <BarChart3 size={20} />
                </div>

                <div>
                  <strong>Business Analytics</strong>
                  <span>
                    Understand sales and business performance.
                  </span>
                </div>
              </div>

              <div className="login-feature">
                <div className="feature-icon">
                  <BrainCircuit size={20} />
                </div>

                <div>
                  <strong>AI-Powered Insights</strong>
                  <span>
                    Turn business data into actionable insights.
                  </span>
                </div>
              </div>

              <div className="login-feature">
                <div className="feature-icon">
                  <TrendingUp size={20} />
                </div>

                <div>
                  <strong>Sales Forecasting</strong>
                  <span>
                    Predict future performance with ML models.
                  </span>
                </div>
              </div>

            </div>

          </div>

          <div className="brand-footer">
            <div className="security-badge">
              <ShieldCheck size={16} />
              Secure Business Workspace
            </div>

            <span>© MarketMind AI</span>
          </div>

        </section>


        {/* =====================================================
            RIGHT LOGIN PANEL
        ===================================================== */}
        <section className="login-area">

          <div className="login-card">

            <div className="login-card-header">

              <div className="login-status">
                <span />
                Secure Workspace
              </div>

              <h2>Welcome back</h2>

              <p>
                Sign in to your MarketMind workspace
              </p>

            </div>


            <form onSubmit={handleLogin}>

              {/* Email */}
              <div className="form-group">

                <label htmlFor="login-email">
                  Email Address
                </label>

                <div className="input-wrapper">

                  <Mail
                    className="input-icon"
                    size={19}
                  />

                  <input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    autoComplete="email"
                    required
                  />

                </div>

              </div>


              {/* Password */}
              <div className="form-group">

                <div className="label-row">
                  <label htmlFor="login-password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="forgot-btn"
                    onClick={() =>
                      alert(
                        "Please contact your administrator to reset your password."
                      )
                    }
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="input-wrapper">

                  <Lock
                    className="input-icon"
                    size={19}
                  />

                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>


              {/* Remember */}
              <div className="login-options">

                <label className="remember-option">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>

              </div>


              {/* Error */}
              {error && (
                <div className="login-error">

                  <AlertCircle size={18} />

                  <span>{error}</span>

                </div>
              )}


              {/* Login */}
              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="login-spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}

              </button>

            </form>


            {/* Divider */}
            <div className="login-divider">
              <span />
              <p>OR</p>
              <span />
            </div>


            {/* Register */}
            <div className="register-box">

              <p>
                Don't have a MarketMind account?
              </p>

              <button
                type="button"
                onClick={() => setShowRegister(true)}
                className="register-btn"
              >
                Create an account
                <ArrowRight size={17} />
              </button>

            </div>

          </div>

          <div className="login-bottom">
            Business Intelligence Platform
            <span>•</span>
            Secure Access
          </div>

        </section>

      </div>

    </div>
  );
}

export default Login;