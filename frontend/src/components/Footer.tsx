import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  return (
    <footer className="footer-container">
      <div className="footer-grid">
        {/* Brand */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#brainGradFooter)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 6px rgba(0, 229, 255, 0.3))" }}
            >
              <defs>
                <linearGradient id="brainGradFooter" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0088ff" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="M12 6v12M8 10a4 4 0 0 1 8 0M9 14a3 3 0 0 1 6 0" />
            </svg>
            <span className="gradient-text" style={{ fontWeight: 800 }}>
              NeuroAI
            </span>
          </Link>
          <p className="footer-desc">
            Next-generation artificial intelligence for rapid, highly precise medical imaging visualization and diagnostic support. Empowering radiologists and clinical researchers worldwide.
          </p>
        </div>

        {/* Platform Links */}
        <div>
          <h4 className="footer-col-title">Platform</h4>
          <ul className="footer-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/upload">Upload Scan</Link>
            </li>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="footer-col-title">Resources</h4>
          <ul className="footer-links">
            <li>
              <a href="#privacy">Privacy Policy</a>
            </li>
            <li>
              <a href="#terms">Terms of Service</a>
            </li>
          </ul>
        </div>

        {/* Medical Disclaimer */}
        <div className="footer-disclaimer-card">
          <div className="footer-disclaimer-title">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Clinical Disclaimer
          </div>
          <p className="footer-disclaimer-text">
            NeuroAI is not FDA-certified or CE-marked for primary diagnostic use. The AI-generated assessments and 3D reconstructions are provided solely for educational, research, and supportive evaluation. All diagnostic decisions must be made by qualified medical professionals.
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} NeuroAI Platform. All rights reserved.</span>
        <span>Developed for Clinical and Research Excellence</span>
      </div>
    </footer>
  );
};
