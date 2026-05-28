import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Toast } from "../components/Toast";
import { useAnalyses, useUnarchiveAnalysis } from "../hooks/useAnalysis";
import { LoadingSpinner } from "../components/LoadingSpinner";

export const ArchivePage: React.FC = () => {
  useEffect(() => {
    document.title = "NeuroAI — Archived Vault";
  }, []);

  // Fetch archived cases (archived = true)
  const { data: archivedCases = [], isLoading: isArchivedLoading, error: archivedError } = useAnalyses(true);
  const unarchiveMutation = useUnarchiveAnalysis();

  const [toastMsg, setToastMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const handleUnarchive = async (analysisId: string) => {
    setRestoringId(analysisId);
    try {
      await unarchiveMutation.mutateAsync(analysisId);
      setToastMsg({ message: "Case successfully restored to active workspace.", type: "success" });
    } catch (err) {
      setToastMsg({ message: "Failed to restore case.", type: "error" });
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="home-page">
      <Navbar />

      <div className="profile-container">
        <div className="section-header" style={{ marginBottom: "40px" }}>
          <span className="section-badge">Member Workspace</span>
          <h2 className="section-title" style={{ fontSize: "32px" }}>Archived Scan Vault</h2>
          <p className="section-subtitle">Scans archived from your active workspace are securely stored here. You can restore them back to the active workspace board anytime.</p>
        </div>

        {/* Archives Vault Card */}
        <div className="profile-card glass-panel animate-slide-up">
          <h3 className="recent-title" style={{ marginBottom: "12px" }}>Archived Scans</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
            Below is the list of all historical patient scan records currently held in clinical archive.
          </p>

          {isArchivedLoading ? (
            <LoadingSpinner size="sm" message="Fetching archived cases..." />
          ) : archivedError ? (
            <div style={{ color: "var(--color-error)", fontSize: "14px" }}>Failed to load archives: {archivedError.message}</div>
          ) : archivedCases.length === 0 ? (
            <div style={{ padding: "40px 30px", textAlign: "center", color: "var(--text-muted)", background: "rgba(255,255,255,0.01)", borderRadius: "8px", border: "1px dashed rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: "14px" }}>No archived cases found.</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {archivedCases.map((analysis) => (
                <div
                  key={analysis.id || analysis._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.04)",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)" }}>
                      {analysis.data?.patientName || "Anonymous Patient"}
                    </span>
                    <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      <span>Modality: {analysis.data?.modality || analysis.mimeType.split("/")[1]?.toUpperCase() || "N/A"}</span>
                      <span>•</span>
                      <span>Archived on: {new Date(analysis.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    className="btn-gradient"
                    style={{ padding: "8px 16px", fontSize: "13px" }}
                    onClick={() => handleUnarchive(analysis.id || analysis._id)}
                    disabled={restoringId === (analysis.id || analysis._id)}
                  >
                    {restoringId === (analysis.id || analysis._id) ? "Restoring..." : "Restore Case"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
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

export default ArchivePage;
