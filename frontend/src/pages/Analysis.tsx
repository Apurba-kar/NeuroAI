import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAnalysis, useDeleteAnalysis, useArchiveAnalysis } from "../hooks/useAnalysis";
import { reportApi } from "../utils/api";
import { ThreeDViewer } from "../components/VolumeViwer";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Toast } from "../components/Toast";
import { Modal } from "../components/Modal";

export const AnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: analysis, isLoading, error } = useAnalysis(id || "");

  useEffect(() => {
    if (analysis?.data?.patientName) {
      document.title = `NeuroAI — Case: ${analysis.data.patientName}`;
    } else {
      document.title = "NeuroAI — Case Workstation";
    }
  }, [analysis]);

  const deleteMutation = useDeleteAnalysis();
  const archiveMutation = useArchiveAnalysis();

  const [activeTab, setActiveTab] = useState<"2d" | "3d">("2d");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-darker)" }}>
        <LoadingSpinner size="lg" message="Reconstructing medical slices..." />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="home-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
          <div className="glass-panel" style={{ padding: "40px", textAlign: "center", maxWidth: "450px" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2" style={{ marginBottom: "16px" }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3 style={{ marginBottom: "8px" }}>Visualization Failed</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
              The diagnostic workbench could not retrieve scan ID: {id}
            </p>
            <Link to="/analysis" className="btn-gradient" style={{ textDecoration: "none", padding: "10px 20px", display: "inline-block" }}>
              Return to Cases Log
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleDownloadReport = async () => {
    if (!id) return;
    setDownloading(true);
    try {
      const pdfBlob = await reportApi.download(id);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report-${analysis.data?.patientName || "case"}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setToastMsg({ message: "PDF diagnostic report downloaded!", type: "success" });
    } catch (err) {
      setToastMsg({ message: "Report generation failed. PDF template error.", type: "error" });
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      setToastMsg({ message: "Case record permanently deleted.", type: "success" });
      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (err) {
      setToastMsg({ message: "Failed to delete case record.", type: "error" });
    }
  };

  const handleArchive = async () => {
    if (!id) return;
    try {
      await archiveMutation.mutateAsync(id);
      setToastMsg({ message: "Case successfully moved to clinical archive.", type: "success" });
      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (err) {
      setToastMsg({ message: "Failed to archive case record.", type: "error" });
    }
  };

  // Safe variables parsing (some nested backends use different structures)
  const report = analysis.analysisResults || {};
  const scanInfo = report.scan_information || {};
  const findings = report.key_findings || {};
  const abnormalities = findings.abnormalities || [];
  const observations = report.clinical_observations || {};
  const recommendations = report.recommendations || {};

  const getUrgencyClass = (urgency?: string) => {
    const u = (urgency || "").toLowerCase();
    if (u.includes("high") || u.includes("urgent") || u.includes("immediate")) return "urgency-high";
    return "urgency-routine";
  };

  return (
    <div className="home-page">
      <Navbar />

      <div className="analysis-detail-container">
        {/* Workspace Subheader */}
        <div
          className="glass-panel animate-fade-in"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            marginBottom: "30px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <div style={{ display: "flex", gap: "24px" }}>
            <div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Patient Name</span>
              <h2 style={{ fontSize: "18px", fontWeight: 700 }}>{analysis.data?.patientName || "Anonymous Patient"}</h2>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Modality</span>
              <p style={{ fontSize: "14px", fontWeight: 500 }}>{analysis.data?.modality || "MRI / Scan"}</p>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Study Description</span>
              <p style={{ fontSize: "14px", fontWeight: 500 }}>{analysis.data?.studyDescription || "Brain Scan Case"}</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn-secondary" style={{ padding: "8px 16px", fontSize: "14px" }} onClick={() => setShowArchiveModal(true)}>
              Archive Case
            </button>
            <button className="btn-secondary" style={{ padding: "8px 16px", fontSize: "14px", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.2)" }} onClick={() => setShowDeleteModal(true)}>
              Delete permanently
            </button>
            <button className="btn-gradient" style={{ padding: "8px 20px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }} onClick={handleDownloadReport} disabled={downloading}>
              {downloading ? (
                <div style={{ width: "14px", height: "14px", border: "2px solid var(--text-muted)", borderTopColor: "var(--accent-cyan)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              )}
              Download PDF Report
            </button>
          </div>
        </div>

        {/* Workbench Workspace Split */}
        <div className="analysis-detail-grid">
          {/* Visual Canvas Block (Left) */}
          <div className="glass-panel-interactive analysis-viewer-card animate-slide-up">
            {/* View Selection Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "8px", background: "rgba(0,0,0,0.2)", padding: "4px", borderRadius: "8px" }}>
                <button
                  style={{
                    padding: "6px 16px",
                    borderRadius: "6px",
                    border: "none",
                    background: activeTab === "2d" ? "var(--accent-blue)" : "transparent",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveTab("2d")}
                >
                  2D Slices
                </button>
                <button
                  style={{
                    padding: "6px 16px",
                    borderRadius: "6px",
                    border: "none",
                    background: activeTab === "3d" ? "var(--accent-blue)" : "transparent",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveTab("3d")}
                >
                  3D VTK Volume
                </button>
              </div>

              {activeTab === "2d" && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="viewer-control-btn" onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.2))}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                  <button className="viewer-control-btn" onClick={() => setZoomLevel(1)}>
                    100%
                  </button>
                  <button className="viewer-control-btn" onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.2))}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                  <button className="viewer-control-btn" onClick={() => setIsFullscreen(!isFullscreen)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Main Visual Window */}
            {activeTab === "2d" ? (
              <div
                className="viewer-image-container"
                style={{
                  height: isFullscreen ? "750px" : "480px",
                  overflow: "hidden",
                  transition: "height 0.3s ease",
                }}
              >
                <img
                  src={analysis.cloudinaryImageUrl}
                  alt="Clinical Frame"
                  className="viewer-image animate-fade-in"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transition: "transform 0.2s ease",
                  }}
                />
              </div>
            ) : (
              <div className="viewer-image-container" style={{ height: "480px" }}>
                <ThreeDViewer volumeUrl={analysis.originalImageUrl} />
              </div>
            )}
          </div>

          {/* AI Structured Analytics Panel (Right) */}
          <div className="glass-panel report-panel-card animate-slide-up" style={{ animationDelay: "0.1s" }}>


            {/* Scan Information */}
            <div className="report-section">
              <h3 className="report-section-title">Scan Metadata Details</h3>
              <table className="report-table">
                <tbody>
                  <tr>
                    <td>Modality</td>
                    <td>{scanInfo.modality || analysis.data?.modality || "N/A"}</td>
                  </tr>
                  <tr>
                    <td>Anatomical Target</td>
                    <td>{scanInfo.body_region || "N/A"}</td>
                  </tr>
                  <tr>
                    <td>Contrast Modulating</td>
                    <td>{scanInfo.contrast || "N/A"}</td>
                  </tr>
                  <tr>
                    <td>Imaging Plane Sequence</td>
                    <td>{scanInfo.plane_sequence || "N/A"}</td>
                  </tr>
                  <tr>
                    <td>Technical Frame Notes</td>
                    <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {scanInfo.technical_notes || "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Findings & Anomalies */}
            <div className="report-section">
              <h3 className="report-section-title">Detected Key Findings</h3>
              {abnormalities && abnormalities.length > 0 ? (
                abnormalities.map((ab: any, idx: number) => (
                  <div key={idx} className="finding-item">
                    <div className="finding-header">
                      <span className="finding-location">{ab.location || "Tissue Site"}</span>
                      <span className="urgency-badge urgency-high" style={{ padding: "2px 8px", fontSize: "10px", borderRadius: "10px" }}>
                        Abnormal
                      </span>
                    </div>
                    <p className="finding-desc" style={{ marginBottom: "6px" }}>{ab.description || "N/A"}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px", color: "var(--text-muted)" }}>
                      <span>Size: {ab.size || ab.size_or_extent || "N/A"}</span>
                      <span>Signal: {ab.density || ab.density_or_signal || "N/A"}</span>
                    </div>
                  </div>
                ))
              ) : findings.normal_findings ? (
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {findings.normal_findings}
                </p>
              ) : (
                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>No local anomalies extracted.</span>
              )}
            </div>

            {/* Clinical Observations */}
            <div className="report-section">
              <h3 className="report-section-title">Clinical Synthesis</h3>
              {observations.likely_diagnosis && (
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Likely Diagnosis</span>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--accent-cyan)" }}>
                    {observations.likely_diagnosis}
                  </p>
                </div>
              )}
              {observations.differential_diagnosis && observations.differential_diagnosis.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Differential Diagnosis Logs</span>
                  <ul style={{ paddingLeft: "16px", marginTop: "4px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {observations.differential_diagnosis.map((d: string, idx: number) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              {observations.clinical_relevance && (
                <div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Clinical Significance Relevance</span>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, marginTop: "2px" }}>
                    {observations.clinical_relevance}
                  </p>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="report-section">
              <h3 className="report-section-title">Clinical Action Steps</h3>
              {recommendations.further_imaging && recommendations.further_imaging.length > 0 && (
                <div style={{ marginBottom: "10px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Recommended Further Imaging</span>
                  <ul className="recommendations-list" style={{ marginTop: "4px" }}>
                    {recommendations.further_imaging.map((i: string, idx: number) => (
                      <li key={idx}>{i}</li>
                    ))}
                  </ul>
                </div>
              )}
              {recommendations.urgency && (
                <div className={`urgency-badge ${getUrgencyClass(recommendations.urgency)}`} style={{ marginTop: "10px" }}>
                  Clinical Urgency: {recommendations.urgency}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        title="Permanently Delete Case"
        confirmText="Delete Case"
        confirmVariant="danger"
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      >
        Are you absolutely sure you want to permanently delete this case record? This will completely wipe all metadata, annotations, segmentations, and images from the database and Cloudinary. This action is irreversible.
      </Modal>

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={showArchiveModal}
        title="Archive Case Record"
        confirmText="Archive Case"
        confirmVariant="success"
        onClose={() => setShowArchiveModal(false)}
        onConfirm={handleArchive}
      >
        Are you sure you want to archive this case? It will be removed from your active workspace board. You can restore this case anytime from your Account Profile settings.
      </Modal>

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

export default AnalysisPage;
