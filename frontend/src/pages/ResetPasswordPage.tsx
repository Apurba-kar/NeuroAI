import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Toast } from "../components/Toast";
import { useResetPassword } from "../hooks/useAuth";

export const ResetPasswordPage: React.FC = () => {
  useEffect(() => {
    document.title = "NeuroAI — Reset Password";
  }, []);

  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const resetPasswordMutation = useResetPassword();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [toastMsg, setToastMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !passwordConfirm) {
      setToastMsg({ message: "Please fill out all fields.", type: "error" });
      return;
    }

    if (password !== passwordConfirm) {
      setToastMsg({ message: "Passwords do not match.", type: "error" });
      return;
    }

    if (password.length < 8) {
      setToastMsg({ message: "Password must be at least 8 characters.", type: "error" });
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        token: token || "",
        data: { password, passwordConfirm },
      });

      setToastMsg({ message: "Password updated successfully! Welcome back.", type: "success" });
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to reset password. Link may have expired.";
      setToastMsg({ message: errMsg, type: "error" });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel animate-slide-up">
        <Link to="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", gap: "8px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#logoGradReset)" strokeWidth="2.5">
            <defs>
              <linearGradient id="logoGradReset" x1="0%" y1="0%" x2="100%" y2="100%">
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
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">Establish a secure, replacement workspace access credential</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="input-icon-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                type="password"
                className="form-input"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={resetPasswordMutation.isPending}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="input-icon-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                type="password"
                className="form-input"
                placeholder="Confirm password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                disabled={resetPasswordMutation.isPending}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-gradient auth-btn" disabled={resetPasswordMutation.isPending}>
            {resetPasswordMutation.isPending ? "Updating Password..." : "Update Password & Login"}
          </button>
        </form>
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

export default ResetPasswordPage;
