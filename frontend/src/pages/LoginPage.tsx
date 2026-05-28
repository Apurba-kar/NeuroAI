import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLogin } from "../hooks/useAuth";
import { Toast } from "../components/Toast";

export const LoginPage: React.FC = () => {
  useEffect(() => {
    document.title = "NeuroAI — Sign In";
  }, []);

  const loginMutation = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toastMsg, setToastMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Get path to redirect back to, or default to dashboard
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setToastMsg({ message: "Please fill out all fields.", type: "error" });
      return;
    }

    try {
      await loginMutation.mutateAsync({ email, password });
      setToastMsg({ message: "Welcome back!", type: "success" });
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Invalid credentials. Please try again.";
      setToastMsg({ message: errMsg, type: "error" });
    }
  };

  return (
    <div className="auth-page">
      {/* Background circles */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "20%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 229, 255, 0.08) 0%, transparent 70%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "20%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 136, 255, 0.05) 0%, transparent 70%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <div className="auth-card glass-panel animate-slide-up" style={{ zIndex: 10 }}>
        {/* Brand Link */}
        <Link to="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", gap: "8px", marginBottom: "10px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#logoGradLogin)" strokeWidth="2.5" style={{ filter: "drop-shadow(0 0 6px rgba(0, 229, 255, 0.3))" }}>
            <defs>
              <linearGradient id="logoGradLogin" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00e5ff" />
                <stop offset="100%" stopColor="#0088ff" />
              </linearGradient>
            </defs>
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="M12 6v12M8 10a4 4 0 0 1 8 0M9 14a3 3 0 0 1 6 0" />
          </svg>
          <span className="gradient-text" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "20px" }}>
            NeuroAI
          </span>
        </Link>

        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your clinical diagnostics workspace</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input
                type="email"
                className="form-input"
                placeholder="doctor.name@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loginMutation.isPending}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label">Password</label>
              <Link to="/forgot-password" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontSize: "12px" }}>
                Forgot Password?
              </Link>
            </div>
            <div className="input-icon-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginMutation.isPending}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-gradient auth-btn" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Signing In..." : "Sign In to Workspace"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/signup" className="auth-link">
            Create Account
          </Link>
        </div>
      </div>

      {toastMsg && (
        <div className="toast-container">
          <Toast
            message={toastMsg.message}
            type={toastMsg.type}
            onClose={() => setToastMsg(null)}
          />
        </div>
      )}
    </div>
  );
};

export default LoginPage;
