import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Toast } from "../components/Toast";
import { useForgotPassword } from "../hooks/useAuth";

export const ForgotPasswordPage: React.FC = () => {
  useEffect(() => {
    document.title = "NeuroAI — Reset Password";
  }, []);

  const forgotPasswordMutation = useForgotPassword();

  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setToastMsg({ message: "Please provide your email address.", type: "error" });
      return;
    }

    try {
      const result = await forgotPasswordMutation.mutateAsync(email);
      setIsSent(true);
      setToastMsg({ message: "Reset password instructions sent to your email.", type: "success" });
      if (result.resetURL) {
        console.log("Password recovery URL (development mode):", result.resetURL);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Password recovery request failed. Email not found.";
      setToastMsg({ message: errMsg, type: "error" });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel animate-slide-up">
        <Link to="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", gap: "8px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#logoGradForgot)" strokeWidth="2.5">
            <defs>
              <linearGradient id="logoGradForgot" x1="0%" y1="0%" x2="100%" y2="100%">
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
          <h2 className="auth-title">Forgot Password</h2>
          <p className="auth-subtitle">Enter your clinical email address to reset access credentials</p>
        </div>

        {isSent ? (
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.1)",
                color: "var(--color-success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.6 }}>
              A security recovery link has been dispatched to <strong>{email}</strong>. Please check your inbox and spam folders.
            </p>
            <Link to="/login" className="btn-gradient" style={{ textDecoration: "none", padding: "12px 0", fontSize: "14px" }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Clinical Email</label>
              <div className="input-icon-wrapper">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  type="email"
                  className="form-input"
                  placeholder="doctor.name@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={forgotPasswordMutation.isPending}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-gradient auth-btn" disabled={forgotPasswordMutation.isPending}>
              {forgotPasswordMutation.isPending ? "Sending link..." : "Send Password Recovery Link"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Remembered password?{" "}
          <Link to="/login" className="auth-link">
            Back to Sign In
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

export default ForgotPasswordPage;
