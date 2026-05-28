import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAnalyses } from "../hooks/useAnalysis";
import { reportApi } from "../utils/api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Toast } from "../components/Toast";

export const AllAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const { data: analyses = [], isLoading, error } = useAnalyses();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleDownloadReport = async (e: React.MouseEvent, analysisId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDownloadingId(analysisId);
    try {
      const pdfBlob = await reportApi.download(analysisId);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `analysis-${analysisId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setToastMsg({ message: "PDF report downloaded successfully!", type: "success" });
    } catch (err) {
      setToastMsg({ message: "Failed to download PDF report. Ensure the case analysis is complete.", type: "error" });
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredAnalyses = analyses.filter((analysis) => {
    const patientName = (analysis.data?.patientName || "Anonymous").toLowerCase();
    const studyDesc = (analysis.data?.studyDescription || "").toLowerCase();
    const query = searchTerm.toLowerCase();
    return patientName.includes(query) || studyDesc.includes(query);
  });

  return (
    <div className="home-page">
      <Navbar />

      <div className="dashboard-container" style={{ minHeight: "80vh" }}>
        {/* Header Section */}
        <div className="dashboard-header animate-fade-in" style={{ marginBottom: "30px" }}>
          <div className="dashboard-title-area">
            <h1 className="dashboard-greeting">Clinical Analyses Log</h1>
            <p className="dashboard-sub">Review, filter, and inspect your processed diagnostic imaging records</p>
          </div>
          <Link to="/upload" className="btn-gradient" style={{ textDecoration: "none", padding: "12px 24px" }}>
            Process New Scan
          </Link>
        </div>

        {/* Filters */}
        <div className="animate-slide-up" style={{ marginBottom: "30px", display: "flex", gap: "16px" }}>
          <div className="input-icon-wrapper" style={{ flexGrow: 1 }}>
            <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="form-input"
              style={{ width: "100%", paddingLeft: "48px" }}
              placeholder="Search by patient name, study description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="glass-panel" style={{ padding: "80px 40px" }}>
            <LoadingSpinner size="lg" message="Loading clinical record archives..." />
          </div>
        ) : error ? (
          <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--color-error)" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: "16px" }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3 style={{ marginBottom: "8px" }}>Failed to Load Log</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{error.message}</p>
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="glass-panel" style={{ padding: "80px 40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.02)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                border: "1px solid rgba(255,255,255,0.05)"
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>No Matches Found</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "350px", margin: "0 auto" }}>
                We couldn't find any diagnostic cases matching your query. Clear search term or upload a new scan.
              </p>
            </div>
          </div>
        ) : (
          <div className="analysis-grid animate-slide-up">
            {filteredAnalyses.map((analysis) => (
              <div
                key={analysis.id || analysis._id}
                className="feature-card glass-panel-interactive analysis-card"
                onClick={() => navigate(`/analysis/${analysis.id || analysis._id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="analysis-card-thumb-container">
                  {analysis.cloudinaryImageUrl ? (
                    <img
                      src={analysis.cloudinaryImageUrl}
                      alt="Scan Thumbnail"
                      className="analysis-card-thumb"
                    />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", color: "var(--text-muted)" }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="9" cy="9" r="2"></circle>
                        <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                      </svg>
                    </div>
                  )}
                  <span className={`analysis-status-badge badge-${analysis.status}`}>
                    {analysis.status}
                  </span>
                </div>

                <div className="analysis-card-content">
                  <h3 className="analysis-card-patient">{analysis.data?.patientName || "Anonymous Patient"}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {analysis.data?.studyDescription || "General Imaging Scan"}
                  </p>
                  <div className="analysis-card-meta">
                    <span>{analysis.data?.modality || analysis.mimeType.split("/")[1]?.toUpperCase() || "N/A"}</span>
                    <span>{new Date(analysis.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="analysis-card-actions">
                    <button
                      className="btn-gradient"
                      style={{ flexGrow: 1, padding: "10px 0", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      Inspect Workspace
                    </button>
                    {analysis.status === "completed" && (
                      <button
                        className="btn-secondary"
                        style={{ padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "center" }}
                        onClick={(e) => handleDownloadReport(e, analysis.id || analysis._id)}
                        disabled={downloadingId === (analysis.id || analysis._id)}
                      >
                        {downloadingId === (analysis.id || analysis._id) ? (
                          <div style={{ width: "14px", height: "14px", border: "2px solid var(--text-muted)", borderTopColor: "var(--accent-cyan)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />

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

export default AllAnalysis;
