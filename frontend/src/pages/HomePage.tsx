import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Toast } from "../components/Toast";
import { useUser } from "../hooks/useAuth";

export const HomePage: React.FC = () => {
  const { data: user } = useUser();
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [toastMsg, setToastMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    document.title = "NeuroAI — Home";
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setToastMsg({ message: "Please fill out all fields.", type: "error" });
      return;
    }
    setToastMsg({ message: "Thank you for reaching out! We will contact you soon.", type: "success" });
    setContactForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="home-page">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background-overlay" />
        <div className="hero-background-gradient" />
        <div className="hero-content">
          <div className="hero-badge animate-fade-in">
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "var(--accent-teal)",
                animation: "pulseGlow 1.5s infinite",
              }}
            />
            Clinical AI Visualizer v1.4
          </div>
          <h1 className="hero-title animate-slide-up" style={{ fontFamily: "var(--font-display)" }}>
            Next-Gen AI Analysis for <span className="gradient-text">Medical Scans</span>
          </h1>
          <p className="hero-subtitle animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Instantly process DICOM volume files, PDFs, and high-resolution medical imaging scans. Extract annotated anomalies, detailed observations, and structured reports using cutting-edge deep learning.
          </p>
          <div className="hero-ctas animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link to={user ? "/upload" : "/login"} className="btn-gradient hero-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              Upload & Analyze Scan
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginLeft: "8px" }}
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <a href="#how-it-works" className="btn-secondary hero-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              Explore Technology
            </a>
          </div>
          <div className="hero-disclaimer-wrapper animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <p className="hero-disclaimer">
              ⚠️ <strong>Research & Evaluation Notice:</strong> NeuroAI is not FDA cleared. All clinical outcomes are experimental and must be scrutinized by a board-certified specialist.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section" id="features">
        <div className="section-header">
          <span className="section-badge">Capabilities</span>
          <h2 className="section-title">Designed for Precision and Speed</h2>
          <p className="section-subtitle">
            Experience our diagnostic visualization interface built for medical researchers and imaging specialists.
          </p>
        </div>
        <div className="features-grid">
          {/* Card 1 */}
          <div className="feature-card glass-panel-interactive">
            <div className="feature-card-img-container">
              <img src="/images/feature-ai.png" alt="AI Deep Learning" className="feature-card-img" />
            </div>
            <div className="feature-card-content">
              <h3 className="feature-card-title glow-text-cyan">Deep Learning Analysis</h3>
              <p className="feature-card-desc">
                Leverages multi-modal neural network parsing to identify tissue densities, signal intensities, and anatomical variations within seconds.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="feature-card glass-panel-interactive">
            <div className="feature-card-img-container">
              <img src="/images/feature-reports.png" alt="Structured Reports" className="feature-card-img" />
            </div>
            <div className="feature-card-content">
              <h3 className="feature-card-title glow-text-teal">Instant Clinical Reports</h3>
              <p className="feature-card-desc">
                Generates a formatted structured report featuring detailed findings, abnormality tables, likely diagnoses, and clinical next steps.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="feature-card glass-panel-interactive">
            <div className="feature-card-img-container">
              <img src="/images/feature-security.png" alt="Enterprise Security" className="feature-card-img" />
            </div>
            <div className="feature-card-content">
              <h3 className="feature-card-title" style={{ color: "var(--accent-purple)", textShadow: "0 0 10px rgba(157, 78, 221, 0.4)" }}>Secure & Compliant</h3>
              <p className="feature-card-desc">
                Fully anonymizes patient records, encrypts metadata in transit, and guarantees strict separation of personal clinical data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Split Section 1 - Drag Drop */}
      <section className="split-section">
        <div className="split-content animate-fade-in">
          <span className="section-badge" style={{ textAlign: "left", display: "inline" }}>Workspace Interface</span>
          <h2 className="section-title" style={{ fontSize: "32px" }}>Sleek Multi-Format Upload Zone</h2>
          <p className="footer-desc" style={{ fontSize: "16px" }}>
            Forget complex legacy medical setups. Simply drag and drop DICOM files (.dcm), high-res JPEG scans, or diagnostic PDF documents into our unified platform interface.
          </p>
          <ul className="checklist">
            <li className="checklist-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Automatic extraction of embedded EXIF & DICOM patient headers
            </li>
            <li className="checklist-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Lossless compression optimization for lightning-fast image viewing
            </li>
            <li className="checklist-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Zero configuration or complex installation requirements
            </li>
          </ul>
        </div>
        <div className="split-visual">
          <img src="/images/section-upload.png" alt="Medical scan drag and drop" />
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-header">
          <span className="section-badge">Process Flow</span>
          <h2 className="section-title">Three Steps to Deep Analytics</h2>
          <p className="section-subtitle">
            Seamlessly navigate from direct scan upload to fully completed clinical assessment review.
          </p>
        </div>
        <div className="steps-container">
          {/* Step 1 */}
          <div className="step-card glass-panel">
            <span className="step-number">01</span>
            <div className="step-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h3 className="step-title">Upload Imaging File</h3>
            <p className="step-desc">
              Select or drop any diagnostic file. The local browser instantly secures headers and begins the encrypted upload stream.
            </p>
          </div>

          {/* Step 2 */}
          <div className="step-card glass-panel">
            <span className="step-number">02</span>
            <div className="step-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h3 className="step-title">AI Processing</h3>
            <p className="step-desc">
              Our advanced deep learning models parse the visual frames, highlight key regions of interest, and compile diagnostic findings.
            </p>
          </div>

          {/* Step 3 */}
          <div className="step-card glass-panel">
            <span className="step-number">03</span>
            <div className="step-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 className="step-title">Review & Download</h3>
            <p className="step-desc">
              Inspect abnormalities side-by-side with an interactive 3D visual volume, and download compiled PDF reports with a single click.
            </p>
          </div>
        </div>
      </section>

      {/* Split Section 2 - Visual Analysis */}
      <section className="split-section split-section-reverse">
        <div className="split-content">
          <span className="section-badge" style={{ textAlign: "left", display: "inline" }}>Anatomical Intelligence</span>
          <h2 className="section-title" style={{ fontSize: "32px" }}>Precision Segmentations & Highlights</h2>
          <p className="footer-desc" style={{ fontSize: "16px" }}>
            The AI automatically layers color-mapped contours onto clinical sagittal, axial, and coronal perspectives. Instantly identify lesion volumes, structural offsets, and local tissue transformations.
          </p>
          <ul className="checklist">
            <li className="checklist-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Multi-planar segmentations overlaid on normalized scan canvases
            </li>
            <li className="checklist-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Precise automated volume measurement calculations
            </li>
            <li className="checklist-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Structured findings linked to clinical databases
            </li>
          </ul>
        </div>
        <div className="split-visual">
          <img src="/images/section-brain.png" alt="Brain scan AI analysis overlays" />
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <div className="section-header">
          <span className="section-badge">Get In Touch</span>
          <h2 className="section-title">Connect with NeuroAI Labs</h2>
          <p className="section-subtitle">
            Have questions about our technology or wish to partner for institutional clinical research? Drop us a line.
          </p>
        </div>
        <div className="contact-card glass-panel">
          <form className="auth-form" onSubmit={handleContactSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Dr. John Doe"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="john.doe@hospital.org"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                />
              </div>
              <div className="form-group form-full-width">
                <label className="form-label">Message Details</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe your institutional requirements, research plans, or support query..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="btn-gradient contact-submit-btn">
              Send Secure Inquiry
            </button>
          </form>
        </div>
      </section>

      <Footer />

      {/* Toast Notification */}
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

export default HomePage;
