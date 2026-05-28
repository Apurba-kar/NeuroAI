import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useUser, useLogout } from "../hooks/useAuth";

export const Navbar: React.FC = () => {
  const { data: user } = useUser();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/");
  };

  const getInitials = () => {
    if (!user) return "";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <nav className={`navbar-container ${isScrolled ? "navbar-scrolled" : ""}`}>
      {/* Logo */}
      <Link to="/" className="logo-link" style={{ display: "flex", alignItems: "center" }}>
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="url(#brainGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 8px rgba(0, 229, 255, 0.4))" }}
        >
          <defs>
            <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#0088ff" />
            </linearGradient>
          </defs>
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M12 6v12M8 10a4 4 0 0 1 8 0M9 14a3 3 0 0 1 6 0" />
        </svg>
        <span
          className="gradient-text"
          style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "22px", marginLeft: "10px" }}
        >
          NeuroAI
        </span>
      </Link>

      {/* Nav Links (Desktop) */}
      <ul className="nav-links">
        <li>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} end>
            Home
          </NavLink>
        </li>
        {user && (
          <>
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/upload" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                Upload Scan
              </NavLink>
            </li>
          </>
        )}
      </ul>

      {/* Auth & Dropdown */}
      <div className="auth-nav-buttons" style={{ position: "relative" }}>
        {user ? (
          <div>
            <div className="user-avatar-menu" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                Dr. {user.lastName}
              </span>
              {user.photo && user.photo !== "default.jpg" ? (
                <img src={user.photo} alt={user.fullName} className="avatar-img" />
              ) : (
                <div className="avatar-fallback">{getInitials()}</div>
              )}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transition: "transform 0.2s", transform: isUserDropdownOpen ? "rotate(180deg)" : "" }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <>
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    zIndex: 998,
                  }}
                  onClick={() => setIsUserDropdownOpen(false)}
                />
                <div
                  className="glass-panel"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "12px",
                    width: "220px",
                    padding: "8px",
                    zIndex: 999,
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>
                      {user.fullName}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.email}
                    </span>
                  </div>
                  <Link
                    to="/profile"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      fontSize: "14px",
                      transition: "all 0.2s",
                    }}
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="dropdown-hover"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Profile Settings
                  </Link>
                  <Link
                    to="/archives"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      fontSize: "14px",
                      transition: "all 0.2s",
                    }}
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="dropdown-hover"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="21 8 21 21 3 21 3 8"></polyline>
                      <rect x="1" y="3" width="22" height="5"></rect>
                      <line x1="10" y1="12" x2="14" y2="12"></line>
                    </svg>
                    Archived Vault
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      color: "#ef4444",
                      background: "none",
                      border: "none",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      transition: "all 0.2s",
                    }}
                    className="dropdown-hover"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="nav-btn-login">
              Sign In
            </Link>
            <Link to="/signup" className="btn-gradient nav-btn-signup" style={{ padding: "10px 20px" }}>
              Sign Up
            </Link>
          </>
        )}

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {isMobileMenuOpen ? (
              <line x1="18" y1="6" x2="6" y2="18"></line>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            position: "fixed",
            top: "80px",
            left: 0,
            width: "100%",
            padding: "20px",
            zIndex: 990,
            borderBottom: "1px solid rgba(0, 229, 255, 0.15)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            background: "rgba(4, 7, 18, 0.95)",
            backdropFilter: "blur(20px)",
          }}
        >
          <NavLink
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ color: "var(--text-primary)", textDecoration: "none", fontSize: "16px", fontWeight: 600 }}
          >
            Home
          </NavLink>
          {user && (
            <>
              <NavLink
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ color: "var(--text-primary)", textDecoration: "none", fontSize: "16px", fontWeight: 600 }}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/upload"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ color: "var(--text-primary)", textDecoration: "none", fontSize: "16px", fontWeight: 600 }}
              >
                Upload Scan
              </NavLink>
              <NavLink
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ color: "var(--text-primary)", textDecoration: "none", fontSize: "16px", fontWeight: 600 }}
              >
                Profile Settings
              </NavLink>
              <NavLink
                to="/archives"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ color: "var(--text-primary)", textDecoration: "none", fontSize: "16px", fontWeight: 600 }}
              >
                Archived Vault
              </NavLink>
            </>
          )}
        </div>
      )}

      {/* Embedded CSS for dropdown hover */}
      <style>{`
        .dropdown-hover:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          color: var(--text-primary) !important;
        }
      `}</style>
    </nav>
  );
};
