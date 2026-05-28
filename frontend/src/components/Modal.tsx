import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "danger" | "primary" | "success";
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  children,
}) => {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getConfirmStyle = () => {
    if (confirmVariant === "danger") {
      return {
        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)",
      };
    }
    if (confirmVariant === "success") {
      return {
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
      };
    }
    return {}; // Uses default btn-gradient style
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal-content glass-panel-interactive animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.5 }}>
          {children}
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" style={{ padding: "10px 20px" }} onClick={onClose}>
            {cancelText}
          </button>
          {onConfirm && (
            <button
              className="btn-gradient"
              style={{
                padding: "10px 20px",
                ...getConfirmStyle(),
              }}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
