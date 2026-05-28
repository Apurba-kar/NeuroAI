import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Toast } from "../components/Toast";
import { useUser, useUpdatePassword, useForgotPassword } from "../hooks/useAuth";
import { userApi } from "../utils/api";
import { useQueryClient } from "@tanstack/react-query";

export const ProfilePage: React.FC = () => {
  const { data: user } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "NeuroAI — Profile Settings";
  }, []);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    institution: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isPending, setIsPending] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    passwordCurrent: "",
    password: "",
    passwordConfirm: "",
  });

  const updatePasswordMutation = useUpdatePassword();
  const forgotPasswordMutation = useForgotPassword();
  const [isPasswordPending, setIsPasswordPending] = useState(false);
  const [isForgotPasswordPending, setIsForgotPasswordPending] = useState(false);

  const handleForgotPasswordTrigger = async () => {
    if (!user?.email) {
      setToastMsg({ message: "Unable to retrieve clinical email for password recovery.", type: "error" });
      return;
    }

    setIsForgotPasswordPending(true);
    try {
      const result = await forgotPasswordMutation.mutateAsync(user.email);
      let successMsg = `A security recovery link has been dispatched to ${user.email}. Please check your inbox.`;
      
      if (result.resetURL) {
        console.log("Password recovery URL (development mode):", result.resetURL);
        successMsg += ` (Local test URL logged to console)`;
      }

      setToastMsg({ message: successMsg, type: "success" });
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to trigger password recovery. Please try again.";
      setToastMsg({ message: errMsg, type: "error" });
    } finally {
      setIsForgotPasswordPending(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.passwordCurrent || !passwordForm.password || !passwordForm.passwordConfirm) {
      setToastMsg({ message: "Please fill out all password fields.", type: "error" });
      return;
    }

    if (passwordForm.password !== passwordForm.passwordConfirm) {
      setToastMsg({ message: "New passwords do not match.", type: "error" });
      return;
    }

    if (passwordForm.password.length < 8) {
      setToastMsg({ message: "Password must be at least 8 characters long.", type: "error" });
      return;
    }

    setIsPasswordPending(true);
    try {
      await updatePasswordMutation.mutateAsync({
        passwordCurrent: passwordForm.passwordCurrent,
        password: passwordForm.password,
        passwordConfirm: passwordForm.passwordConfirm,
      });

      setToastMsg({ message: "Password updated successfully!", type: "success" });
      setPasswordForm({
        passwordCurrent: "",
        password: "",
        passwordConfirm: "",
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to update password. Verify current password.";
      setToastMsg({ message: errMsg, type: "error" });
    } finally {
      setIsPasswordPending(false);
    }
  };

  // Camera settings
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        institution: user.institution || "",
      });
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [user]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoStream]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsCameraActive(false);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl("default");
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    setSelectedFile(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 300, facingMode: "user" },
      });
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access denied or unavailable:", err);
      setToastMsg({ message: "Could not access system camera. Please check browser permissions.", type: "error" });
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 300;
      canvas.height = videoRef.current.videoHeight || 300;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
              setSelectedFile(file);
              setPreviewUrl(URL.createObjectURL(blob));
              stopCamera();
            }
          },
          "image/jpeg",
          0.95
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      setToastMsg({ message: "Please fill out all required fields.", type: "error" });
      return;
    }

    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append("firstName", form.firstName);
      formData.append("lastName", form.lastName);
      formData.append("email", form.email);
      formData.append("institution", form.institution);

      if (selectedFile) {
        formData.append("photo", selectedFile);
      } else if (previewUrl === "default") {
        formData.append("photo", "default.jpg");
      }

      const updatedUser = await userApi.updateMe(formData);

      queryClient.setQueryData(["user"], updatedUser);
      setToastMsg({ message: "Profile updated successfully!", type: "success" });
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to update profile settings.";
      setToastMsg({ message: errMsg, type: "error" });
    } finally {
      setIsPending(false);
    }
  };

  const getInitials = () => {
    if (!user) return "";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  const renderAvatar = () => {
    if (previewUrl === "default") {
      return (
        <div className="avatar-fallback" style={{ width: "90px", height: "90px", fontSize: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #00e5ff 0%, #0088ff 100%)", color: "#040712", fontWeight: 700 }}>
          {getInitials()}
        </div>
      );
    }
    if (previewUrl) {
      return <img src={previewUrl} alt="Preview" className="avatar-img" style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(0, 229, 255, 0.4)" }} />;
    }
    if (user?.photo && user.photo !== "default.jpg") {
      return <img src={user.photo} alt={user.fullName} className="avatar-img" style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(0, 229, 255, 0.4)" }} />;
    }
    return (
      <div className="avatar-fallback" style={{ width: "90px", height: "90px", fontSize: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #00e5ff 0%, #0088ff 100%)", color: "#040712", fontWeight: 700 }}>
        {getInitials()}
      </div>
    );
  };

  return (
    <div className="home-page">
      <Navbar />

      <div className="profile-container">
        <div className="section-header" style={{ marginBottom: "40px" }}>
          <span className="section-badge">Member Workspace</span>
          <h2 className="section-title" style={{ fontSize: "32px" }}>Account Settings</h2>
          <p className="section-subtitle">Manage your personal credentials, hospital affiliation, and account details.</p>
        </div>

        {/* Profile Settings Form Card */}
        <div className="profile-card glass-panel animate-slide-up">
          <h3 className="recent-title" style={{ marginBottom: "12px" }}>Edit Credentials</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
            Keep your workstation credentials and affiliated healthcare facilities up to date.
          </p>

          {/* Photo Management Section */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px", marginBottom: "30px", paddingBottom: "25px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <div style={{ position: "relative" }}>
              {isCameraActive ? (
                <div
                  style={{
                    width: "90px",
                    height: "90px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "#000",
                    border: "2px solid var(--accent-cyan)",
                    boxShadow: "0 0 20px rgba(0, 229, 255, 0.3)",
                  }}
                >
                  <video
                    ref={videoRef}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    playsInline
                    muted
                  />
                </div>
              ) : (
                renderAvatar()
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
              {isCameraActive ? (
                <>
                  <button
                    type="button"
                    className="btn-gradient"
                    style={{ padding: "8px 16px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    onClick={capturePhoto}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Capture Photo
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: "8px 16px", fontSize: "13px", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.2)" }}
                    onClick={stopCamera}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <label className="btn-secondary" style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Upload Photo
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                  </label>

                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: "8px 16px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    onClick={startCamera}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                    Take Photo
                  </button>

                  {((user?.photo && user.photo !== "default.jpg" && previewUrl !== "default") || (previewUrl && previewUrl !== "default")) && (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: "8px 16px", fontSize: "13px", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.2)" }}
                      onClick={handleRemovePhoto}
                    >
                      Remove
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} style={{ gap: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  disabled={isPending}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  disabled={isPending}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Workspace Login Email *</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={isPending}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Affiliated Institution / Medical Center</label>
              <input
                type="text"
                className="form-input"
                value={form.institution}
                onChange={(e) => setForm({ ...form, institution: e.target.value })}
                disabled={isPending}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
              <button type="submit" className="btn-gradient" style={{ padding: "12px 32px" }} disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Update Password Card */}
        <div className="profile-card glass-panel animate-slide-up" style={{ marginTop: "30px" }}>
          <h3 className="recent-title" style={{ marginBottom: "12px" }}>Update Password</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
            Strengthen your medical workspace access by updating your security credentials regularly.
          </p>

          <form className="auth-form" onSubmit={handlePasswordSubmit} style={{ gap: "20px" }}>
            <div className="form-group">
              <label className="form-label">Current Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter current password"
                value={passwordForm.passwordCurrent}
                onChange={(e) => setPasswordForm({ ...passwordForm, passwordCurrent: e.target.value })}
                disabled={isPasswordPending}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className="form-group">
                <label className="form-label">New Password *</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="At least 8 characters"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  disabled={isPasswordPending}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password *</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Confirm new password"
                  value={passwordForm.passwordConfirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, passwordConfirm: e.target.value })}
                  disabled={isPasswordPending}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
              <button
                type="button"
                className="auth-link"
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "14px" }}
                onClick={handleForgotPasswordTrigger}
                disabled={isForgotPasswordPending}
              >
                {isForgotPasswordPending ? "Sending recovery link..." : "Forgot current password?"}
              </button>

              <button type="submit" className="btn-gradient" style={{ padding: "12px 32px" }} disabled={isPasswordPending}>
                {isPasswordPending ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
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

export default ProfilePage;
