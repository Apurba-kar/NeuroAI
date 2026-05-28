import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  message,
}) => {
  const getDimensions = () => {
    switch (size) {
      case "sm":
        return { width: 24, height: 24 };
      case "lg":
        return { width: 64, height: 64 };
      case "md":
      default:
        return { width: 44, height: 44 };
    }
  };

  const dims = getDimensions();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "40px",
      }}
    >
      <div style={{ position: "relative", ...dims }}>
        {/* Glowing track */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: "3px solid rgba(0, 229, 255, 0.05)",
          }}
        />
        {/* Animated spinner arc */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: "3px solid transparent",
            borderTopColor: "var(--accent-cyan)",
            animation: "spin 1s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite",
            boxShadow: "0 -2px 8px rgba(0, 229, 255, 0.2)",
          }}
        />
      </div>
      {message && (
        <span
          className="glow-text-cyan"
          style={{
            fontSize: size === "lg" ? "18px" : "14px",
            fontWeight: 500,
            fontFamily: "var(--font-sans)",
            letterSpacing: "0.5px",
          }}
        >
          {message}
        </span>
      )}
    </div>
  );
};
