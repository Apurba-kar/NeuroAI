import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Toast } from "../components/Toast";
import { useUploadAnalysis } from "../hooks/useAnalysis";

export const UploadPage: React.FC = () => {
  const uploadMutation = useUploadAnalysis();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "NeuroAI — Upload Scan";
  }, []);
  
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateFile = (selectedFile: File) => {
    const validExtensions = [".dcm", ".jpg", ".jpeg", ".pdf"];
    const fileNameLower = selectedFile.name.toLowerCase();
    const isValidExt = validExtensions.some(ext => fileNameLower.endsWith(ext));
    
    // Also check mime types (just in case)
    const validMimes = ["application/dicom", "image/jpeg", "image/jpg", "application/pdf"];
    const isValidMime = validMimes.includes(selectedFile.type);

    if (!isValidExt && !isValidMime) {
      setToastMsg({ message: "Unsupported file format. Please upload .dcm, .jpg, or .pdf files.", type: "error" });
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUploadSubmit = async () => {
    if (!file) return;

    setProgress(0);
    setIsProcessing(false);

    try {
      const response = await uploadMutation.mutateAsync({
        file,
        onProgress: (percent) => {
          setProgress(percent);
          if (percent === 100) {
            setIsProcessing(true);
          }
        },
      });

      setToastMsg({ message: "Scan processed successfully!", type: "success" });
      setTimeout(() => {
        navigate(`/analysis/${response.id || response._id}`);
      }, 1500);
    } catch (err: any) {
      setIsProcessing(false);
      setProgress(0);
      const errMsg = err.response?.data?.message || "File upload or analysis failed. Ensure the server is online and the file is correct.";
      setToastMsg({ message: errMsg, type: "error" });
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="home-page">
      <Navbar />

      <div className="upload-container">
        <div className="section-header">
          <span className="section-badge">Secure Diagnostics</span>
          <h2 className="section-title" style={{ fontSize: "32px" }}>Upload Patient Scan</h2>
          <p className="section-subtitle">
            All clinical metadata is instantly anonymized in the browser before streaming.
          </p>
        </div>

        <div className="upload-card glass-panel animate-slide-up">
          {/* Main Upload Drop Area */}
          {!file && !uploadMutation.isPending && (
            <div
              className={`drag-drop-zone ${isDragActive ? "active" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept=".dcm,.jpg,.jpeg,.pdf,application/dicom,image/jpeg,application/pdf"
              />
              <div className="upload-icon-pulse">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div className="upload-instruction">
                <h3 className="upload-title">Drag & Drop Medical File</h3>
                <p className="upload-subtitle">or click to browse local directories</p>
              </div>
              <span className="upload-formats">Supported Formats: DICOM (.dcm), JPEG (.jpg), PDF (.pdf)</span>
            </div>
          )}

          {/* Selected File Card */}
          {file && !uploadMutation.isPending && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="file-selected-card">
                <div className="file-info">
                  <div style={{ color: "var(--accent-cyan)" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <div className="file-details">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatBytes(file.size)}</span>
                  </div>
                </div>
                <button className="file-remove-btn" onClick={() => setFile(null)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button className="btn-secondary" style={{ padding: "12px 24px" }} onClick={() => setFile(null)}>
                  Cancel Selection
                </button>
                <button className="btn-gradient" style={{ padding: "12px 32px" }} onClick={handleUploadSubmit}>
                  Start AI Analysis
                </button>
              </div>
            </div>
          )}

          {/* Upload Progress Bar */}
          {uploadMutation.isPending && !isProcessing && (
            <div className="upload-progress-container">
              <div className="progress-text">
                <span>Uploading case assets...</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* AI Analyzing Spinner */}
          {uploadMutation.isPending && isProcessing && (
            <div className="analyzing-indicator">
              <div className="analyzing-spinner" />
              <div style={{ textAlign: "center" }}>
                <h3 className="glow-text-cyan" style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>
                  AI Brain Segmentations in Progress
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", maxWidth: "350px" }}>
                  Please do not close this browser. Our diagnostic deep learning engine is parsing slices, extracting headers, and computing diagnostic results.
                </p>
              </div>
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

export default UploadPage;
