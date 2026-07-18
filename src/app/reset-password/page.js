"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const C = { plum: "#2B1B2E", ivory: "#FAF6F1", card: "#FFFFFF", ink: "#2B1B2E", sub: "#75697A", line: "#E8E0DC", red: "#B5474A", green: "#5E7C56" };
const fontSans = "'Inter', system-ui, sans-serif";
const inputStyle = { width: "100%", padding: "11px 14px", fontSize: 14.5, borderRadius: 14, border: `1.5px solid ${C.line}`, outline: "none", fontFamily: fontSans, boxSizing: "border-box" };
const primaryBtn = { width: "100%", padding: "12px 0", background: C.plum, color: "#fff", border: "none", borderRadius: 14, fontSize: 14.5, fontWeight: 500, cursor: "pointer", marginTop: 12 };

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
    if (password.length < 4) return setStatus("Password kam se kam 4 characters ka hona chahiye.");
    if (password !== confirm) return setStatus("Dono password match nahi kar rahe.");

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
        setStatus(data.error || "Kuch galat ho gaya.");
      }
    } catch {
      setStatus("Network error, dobara try karo.");
    }
    setBusy(false);
  };

  if (!token) {
    return <p style={{ color: C.red, fontFamily: fontSans }}>Invalid ya missing reset link.</p>;
  }

  if (success) {
    return (
      <div style={{ textAlign: "center", fontFamily: fontSans }}>
        <p style={{ color: C.green, fontSize: 15 }}>✅ Password reset ho gaya!</p>
        <a href="/" style={{ color: C.plum, fontSize: 13.5 }}>Login page pe wapas jao</a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ width: "100%", maxWidth: 380, background: C.card, borderRadius: 24, padding: 32, border: `1px solid ${C.line}`, fontFamily: fontSans }}>
      <h2 style={{ fontSize: 22, marginBottom: 16, color: C.ink }}>Naya password set karo</h2>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Naya password" style={{ ...inputStyle, marginBottom: 12 }} />
      <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Password dobara likho" style={inputStyle} />
      {status && <p style={{ color: C.red, fontSize: 13, marginTop: 10 }}>{status}</p>}
      <button type="submit" disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.7 : 1 }}>
        {busy ? "Saving…" : "Password reset karo"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.ivory, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Suspense fallback={<p>Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}