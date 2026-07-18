"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Refined color palette for a more premium look
const C = {
  plum: "#2B1B2E",
  plumHover: "#422E46",
  ivory: "#FAF6F1",
  card: "#FFFFFF",
  ink: "#1A121C",
  sub: "#6B6070",
  line: "#E6DFDC",
  red: "#D33535",
  green: "#3A7D44",
};

const fontSans = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setStatus("");
    
    if (password.length < 4) {
      return setStatus("Password must be at least 4 characters long.");
    }
    if (password !== confirm) {
      return setStatus("Passwords do not match. Please try again.");
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(true);
      } else {
        setStatus(data.error || "An unexpected error occurred. Please try again.");
      }
    } catch {
      setStatus("Network error. Please check your connection and try again.");
    }
    setBusy(false);
  };

  // 1. INVALID TOKEN STATE
  if (!token) {
    return (
      <div style={{ textAlign: "center", fontFamily: fontSans }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16, margin: "0 auto" }}>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h2 style={{ fontSize: 20, color: C.ink, marginBottom: 8, fontWeight: 600 }}>Invalid Link</h2>
        <p style={{ color: C.sub, fontSize: 14.5, lineHeight: 1.5 }}>This password reset link is invalid or has expired. Please request a new one.</p>
      </div>
    );
  }

  // 2. SUCCESS STATE
  if (success) {
    return (
      <div style={{ textAlign: "center", fontFamily: fontSans }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 20, margin: "0 auto" }}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <h2 style={{ fontSize: 24, color: C.ink, marginBottom: 8, fontWeight: 600 }}>Password Updated</h2>
        <p style={{ color: C.sub, fontSize: 15, marginBottom: 28, lineHeight: 1.5 }}>
          Your password has been successfully reset. You can now use your new password to sign in to your account.
        </p>
        <a 
          href="/" 
          className="auth-button"
          style={{ 
            display: "inline-block", width: "100%", padding: "14px 0", 
            background: C.plum, color: "#fff", textDecoration: "none", 
            borderRadius: 12, fontSize: 15, fontWeight: 500,
            transition: "background 0.2s ease"
          }}
        >
          Return to Log In
        </a>
      </div>
    );
  }

  // 3. FORM STATE
  return (
    <form onSubmit={submit} style={{ width: "100%", fontFamily: fontSans }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.plum} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12, margin: "0 auto" }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <h2 style={{ fontSize: 24, fontWeight: 600, color: C.ink, marginBottom: 8 }}>Secure Your Account</h2>
        <p style={{ fontSize: 14.5, color: C.sub }}>Please enter your new password below.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 8 }}>New Password</label>
          <input 
            type="password" 
            className="auth-input"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter new password" 
            style={{ 
              width: "100%", padding: "12px 16px", fontSize: 15, borderRadius: 12, 
              border: `1.5px solid ${C.line}`, outline: "none", fontFamily: fontSans, 
              boxSizing: "border-box", transition: "all 0.2s ease", backgroundColor: "#FAFAFA"
            }} 
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 8 }}>Confirm Password</label>
          <input 
            type="password" 
            className="auth-input"
            value={confirm} 
            onChange={(e) => setConfirm(e.target.value)} 
            placeholder="Re-enter new password" 
            style={{ 
              width: "100%", padding: "12px 16px", fontSize: 15, borderRadius: 12, 
              border: `1.5px solid ${C.line}`, outline: "none", fontFamily: fontSans, 
              boxSizing: "border-box", transition: "all 0.2s ease", backgroundColor: "#FAFAFA"
            }} 
          />
        </div>
      </div>

      {status && (
        <div style={{ marginTop: 20, padding: "12px 16px", backgroundColor: "#FDF4F4", borderLeft: `4px solid ${C.red}`, borderRadius: 8 }}>
          <p style={{ color: C.red, fontSize: 13.5, margin: 0, fontWeight: 500 }}>{status}</p>
        </div>
      )}

      <button 
        type="submit" 
        disabled={busy} 
        className="auth-button"
        style={{ 
          width: "100%", padding: "14px 0", background: C.plum, color: "#fff", 
          border: "none", borderRadius: 12, fontSize: 15, fontWeight: 500, 
          cursor: busy ? "not-allowed" : "pointer", marginTop: 28,
          opacity: busy ? 0.8 : 1, transition: "background 0.2s ease",
          display: "flex", justifyContent: "center", alignItems: "center", gap: 8
        }}
      >
        {busy ? (
          <>
            <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
            Updating Password...
          </>
        ) : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.ivory, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      {/* CSS in JS for elegant hover/focus states and animations */}
      <style>{`
        .auth-input:focus {
          border-color: ${C.plum} !important;
          box-shadow: 0 0 0 4px rgba(43, 27, 46, 0.08);
          background-color: #FFFFFF !important;
        }
        .auth-button:hover:not(:disabled) {
          background-color: ${C.plumHover} !important;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>
      
      {/* Moved the card styling here so all states (Form, Success, Error) share the exact same clean box */}
      <div style={{ width: "100%", maxWidth: 400, background: C.card, borderRadius: 24, padding: "40px 32px", border: `1px solid ${C.line}`, boxShadow: "0 12px 40px rgba(0,0,0,0.04)" }}>
        <Suspense fallback={
          <div style={{ textAlign: "center", color: C.sub, fontFamily: fontSans, padding: "40px 0" }}>
            <svg className="spinner" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.plum} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
            <p style={{ fontSize: 14.5 }}>Loading secure environment...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}