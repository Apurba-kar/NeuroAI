import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignup } from "../hooks/useAuth";
import { Toast } from "../components/Toast";

export const SignupPage: React.FC = () => {
  useEffect(() => {
    document.title = "NeuroAI — Sign Up";
  }, []);

  const signupMutation = useSignup();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    institution: "",
    password: "",
    passwordConfirm: "",
  });

  const [toastMsg, setToastMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const getPasswordStrength = () => {
    const pw = form.password;
    if (!pw) return { label: "", color: "transparent", percent: 0 };
    if (pw.length < 6) return { label: "Weak", color: "#ef4444", percent: 30 };
    if (pw.length < 10) return { label: "Medium", color: "#f59e0b", percent: 65 };
    return { label: "Strong", color: "#10b981", percent: 100 };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.passwordConfirm) {
      setToastMsg({ message: "Please fill out all required fields.", type: "error" });
      return;
    }

    if (form.password !== form.passwordConfirm) {
      setToastMsg({ message: "Passwords do not match.", type: "error" });
      return;
    }

    if (form.password.length < 8) {
      setToastMsg({ message: "Password must be at least 8 characters.", type: "error" });
      return;
    }

    try {
      await signupMutation.mutateAsync({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        institution: form.institution || undefined,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
      });

      setToastMsg({ message: "Account created successfully! Redirecting...", type: "success" });
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to create account. Email may already be in use.";
      setToastMsg({ message: errMsg, type: "error" });
    }
  };

  const pwStrength = getPasswordStrength();

  return (
    <div className="auth-page" style={{ minHeight: "110vh" }}>
      {/* Background radial effects */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          right: "15%",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 245, 212, 0.06) 0%, transparent 70%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "15%",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 229, 255, 0.06) 0%, transparent 70%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <div className="auth-card glass-panel animate-slide-up" style={{ maxWidth: "550px", zIndex: 10 }}>
        {/* Brand Link */}
        <Link to="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", gap: "8px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#logoGradSignup)" strokeWidth="2.5" style={{ filter: "drop-shadow(0 0 6px rgba(0, 229, 255, 0.3))" }}>
            <defs>
              <linearGradient id="logoGradSignup" x1="0%" y1="0%" x2="100%" y2="100%">
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

        <div className="auth-header" style={{ gap: "6px" }}>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join our collaborative clinical research community</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} style={{ gap: "16px" }}>
          {/* First Name & Last Name */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="John"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                disabled={signupMutation.isPending}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Doe"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                disabled={signupMutation.isPending}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Clinical Email *</label>
            <div className="input-icon-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input
                type="email"
                className="form-input"
                placeholder="john.doe@hospital.org"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={signupMutation.isPending}
                required
              />
            </div>
          </div>

          {/* Institution */}
          <div className="form-group">
            <label className="form-label">Affiliated Institution / Hospital</label>
            <div className="input-icon-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="15" y1="3" x2="15" y2="21"></line>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="3" y1="15" x2="21" y2="15"></line>
              </svg>
              <input
                type="text"
                className="form-input"
                placeholder="Stanford Medical Center (optional)"
                value={form.institution}
                onChange={(e) => setForm({ ...form, institution: e.target.value })}
                disabled={signupMutation.isPending}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password *</label>
            <div className="input-icon-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                type="password"
                className="form-input"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={signupMutation.isPending}
                required
              />
            </div>

            {/* Password strength bar */}
            {form.password && (
              <div style={{ marginTop: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  <span>Password Strength</span>
                  <span style={{ color: pwStrength.color, fontWeight: "bold" }}>{pwStrength.label}</span>
                </div>
                <div style={{ width: "100%", height: "4px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${pwStrength.percent}%`,
                      height: "100%",
                      backgroundColor: pwStrength.color,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <div className="input-icon-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                type="password"
                className="form-input"
                placeholder="Confirm password"
                value={form.passwordConfirm}
                onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
                disabled={signupMutation.isPending}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-gradient auth-btn" disabled={signupMutation.isPending} style={{ marginTop: "6px" }}>
            {signupMutation.isPending ? "Creating Account..." : "Create Free Workspace"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign In
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

export default SignupPage;
