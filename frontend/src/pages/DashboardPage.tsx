import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useUser } from "../hooks/useAuth";
import { useAnalyses, useDeleteAnalysis, useArchiveAnalysis } from "../hooks/useAnalysis";
import { reportApi } from "../utils/api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Toast } from "../components/Toast";
import { Modal } from "../components/Modal";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: user } = useUser();

  useEffect(() => {
    document.title = "NeuroAI — Dashboard";
  }, []);

  const { data: analyses = [], isLoading, error } = useAnalyses(false); // Only active (non-archived) cases
  
  const deleteMutation = useDeleteAnalysis();
  const archiveMutation = useArchiveAnalysis();

  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<string | null>(null);
  const [caseToArchive, setCaseToArchive] = useState<string | null>(null);

  const handleDownloadReport = async (e: React.MouseEvent, analysisId: string, patientName: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDownloadingId(analysisId);
    try {
      const pdfBlob = await reportApi.download(analysisId);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report-${patientName || "case"}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setToastMsg({ message: "PDF report downloaded successfully!", type: "success" });
    } catch (err) {
      setToastMsg({ message: "Failed to download PDF report. Ensure the case is complete.", type: "error" });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!caseToDelete) return;
    try {
      await deleteMutation.mutateAsync(caseToDelete);
      setToastMsg({ message: "Case record permanently deleted.", type: "success" });
    } catch (err) {
      setToastMsg({ message: "Failed to delete case record.", type: "error" });
    } finally {
      setCaseToDelete(null);
    }
  };

  const handleConfirmArchive = async () => {
    if (!caseToArchive) return;
    try {
      await archiveMutation.mutateAsync(caseToArchive);
      setToastMsg({ message: "Case moved to clinical archive.", type: "success" });
    } catch (err) {
      setToastMsg({ message: "Failed to archive case record.", type: "error" });
    } finally {
      setCaseToArchive(null);
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

      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header animate-fade-in" style={{ marginBottom: "30px" }}>
          <div className="dashboard-title-area">
            <h1 className="dashboard-greeting">
              Welcome, Dr. {user?.lastName || "Specialist"}
            </h1>
            <p className="dashboard-sub">
              {user?.institution ? `${user.institution} Clinical Workspace` : "NeuroAI Research & Diagnostics Suite"}
            </p>
          </div>
          <Link to="/upload" className="btn-gradient" style={{ textDecoration: "none", padding: "12px 24px", display: "inline-flex", alignItems: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "8px" }}>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Process New Scan
          </Link>
        </div>

        {/* Case Board Board Panel */}
        <div className="recent-cases-section animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="recent-header" style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
            <h2 className="recent-title" style={{ margin: 0 }}>Clinical Case Workspace</h2>
            <span
              style={{
                background: "rgba(0, 229, 255, 0.1)",
                color: "var(--accent-cyan)",
                border: "1px solid rgba(0, 229, 255, 0.2)",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase"
              }}
            >
              {isLoading ? "..." : `${analyses.length} Active`}
            </span>
          </div>

          {/* Search bar */}
          <div style={{ marginBottom: "24px" }}>
            <div className="input-icon-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="form-input"
                style={{ width: "100%", paddingLeft: "48px" }}
                placeholder="Search active cases by patient name, modality, study description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="glass-panel" style={{ padding: "60px 40px" }}>
              <LoadingSpinner message="Loading clinical active workspace..." />
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
            <div className="glass-panel" style={{ padding: "60px 40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>No Cases in Workspace</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "400px", margin: "0 auto" }}>
                  No active cases found matching your search. Upload a clinical file or retrieve files from the archive.
                </p>
              </div>
            </div>
          ) : (
            <div className="analysis-grid">
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

                  <div className="analysis-card-content" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <h3 className="analysis-card-patient">{analysis.data?.patientName || "Anonymous Patient"}</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {analysis.data?.studyDescription || "General Case Scan"}
                    </p>
                    <div className="analysis-card-meta">
                      <span>{analysis.data?.modality || analysis.mimeType.split("/")[1]?.toUpperCase() || "N/A"}</span>
                      <span>{new Date(analysis.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="analysis-card-actions" style={{ marginTop: "8px", gap: "8px" }}>
                      <button
                        className="btn-gradient"
                        style={{ flexGrow: 1, padding: "8px 0", fontSize: "13px" }}
                      >
                        Inspect Cases
                      </button>

                      {/* PDF Download */}
                      {analysis.status === "completed" && (
                        <button
                          className="btn-secondary"
                          style={{ padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onClick={(e) => handleDownloadReport(e, analysis.id || analysis._id, analysis.data?.patientName || "case")}
                          disabled={downloadingId === (analysis.id || analysis._id)}
                          title="Download report PDF"
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

                      {/* Archive Button */}
                      <button
                        className="btn-secondary"
                        style={{ padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "center" }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCaseToArchive(analysis.id || analysis._id);
                        }}
                        title="Archive Case"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="21 8 21 21 3 21 3 8"></polyline>
                          <rect x="1" y="3" width="22" height="5"></rect>
                          <line x1="10" y1="12" x2="14" y2="12"></line>
                        </svg>
                      </button>

                      {/* Delete Button */}
                      <button
                        className="btn-secondary"
                        style={{ padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCaseToDelete(analysis.id || analysis._id);
                        }}
                        title="Delete Case permanently"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!caseToDelete}
        title="Permanently Delete Case"
        confirmText="Delete Case"
        confirmVariant="danger"
        onClose={() => setCaseToDelete(null)}
        onConfirm={handleConfirmDelete}
      >
        Are you absolutely sure you want to permanently delete this case record? This will completely wipe all metadata, annotations, segmentations, and images from the database and Cloudinary. This action is irreversible.
      </Modal>

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={!!caseToArchive}
        title="Archive Case Record"
        confirmText="Archive Case"
        confirmVariant="success"
        onClose={() => setCaseToArchive(null)}
        onConfirm={handleConfirmArchive}
      >
        Are you sure you want to archive this case? It will be removed from your active workspace board. You can review and restore (unarchive) this case anytime from your Account Profile dashboard settings.
      </Modal>

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

export default DashboardPage;
