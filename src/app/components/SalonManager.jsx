"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Calendar, Users, Wallet, Package, Image as ImageIcon, LayoutDashboard,
  LogOut, Plus, Trash2, Eye, EyeOff, Scissors, Check, Loader2, ChevronRight, MessageCircle, TrendingUp, Settings as SettingsIcon, Sparkles, Search, Bell
} from "lucide-react";
import { api, saveSession, loadSession, clearSession } from "./api";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

const todayISO = () => new Date().toISOString().slice(0, 10);
const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

/* ---------- Refined Premium Palette ---------- */
const C = {
  plum: "#2B1B2E", 
  plumHover: "#3F2943",
  gold: "#B8935F", 
  goldLight: "#F5EFE6", 
  ivory: "#FBF9F6",
  card: "#FFFFFF", 
  ink: "#1A121C", 
  sub: "#6B6070", 
  line: "#E6DFDC",
  green: "#3A7D44", 
  greenBg: "#EAF2EB",
  red: "#D33535",
  redBg: "#FCEAEA",
  goldBg: "#FAF4EB"
};

const fontVoice = "'Fraunces', Georgia, serif";
const fontSans = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function GlobalFonts() {
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" />
      <style>{`
        .vellora-input:focus {
          border-color: ${C.plum} !important;
          box-shadow: 0 0 0 4px rgba(43, 27, 46, 0.08);
          background-color: #FFFFFF !important;
        }
        .vellora-input::placeholder {
          color: #B0A6AA !important;
          opacity: 1;
          font-style: italic;
        }
        .vellora-btn:hover:not(:disabled) {
          background-color: ${C.plumHover} !important;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 25px -8px rgba(43,27,46,0.5) !important;
        }
        .vellora-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.97);
        }
        .vellora-btn-ghost:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 20px -8px rgba(43,27,46,0.3) !important;
        }
        .vellora-btn-ghost:active:not(:disabled) {
          transform: scale(0.96);
        }
        .vellora-card {
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .vellora-card:hover {
          box-shadow: 0 16px 34px -14px rgba(43,27,46,0.18) !important;
          transform: translateY(-4px);
        }
        .vellora-icon-btn {
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .vellora-icon-btn:hover {
          background-color: ${C.line} !important;
          color: ${C.red} !important;
          transform: scale(1.15) rotate(-6deg);
        }
        .nav-item {
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }
        .nav-item:hover {
          background-color: rgba(184,147,95,0.08) !important;
          transform: translateX(4px);
        }
        .nav-item svg {
          transition: transform 0.2s ease;
        }
        .nav-item:hover svg {
          transform: scale(1.15) rotate(-8deg);
        }

        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.85) translateY(10px); }
          60% { transform: scale(1.03); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .pop-in { animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        .float-deco { animation: float 6s ease-in-out infinite; }

        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .bounce-in { animation: bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(300px) rotate(720deg); opacity: 0; }
        }
        .confetti-piece { animation: confettiFall 1.2s ease-in forwards; }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes scissorSnip {
          0%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(-18deg); }
          20% { transform: rotate(6deg); }
          30% { transform: rotate(-18deg); }
          40% { transform: rotate(0deg); }
        }
        .scissor-snip {
          display: inline-flex;
          transform-origin: 50% 50%;
          animation: scissorSnip 3.5s ease-in-out infinite;
        }

        @keyframes scissorEnter {
          0% { opacity: 0; transform: translateX(-60px) rotate(-25deg); }
          60% { opacity: 1; transform: translateX(6px) rotate(8deg); }
          100% { opacity: 1; transform: translateX(0) rotate(0deg); }
        }
        .scissor-icon-wrap {
          animation: scissorEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-fade-1 { animation: fadeInUp 0.6s ease-out both; }
        .login-fade-2 { animation: fadeInUp 0.6s ease-out 0.15s both; }
        .login-fade-3 { animation: fadeInUp 0.6s ease-out 0.3s both; }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.08); }
        }
        .glow-pulse { animation: pulseGlow 4s ease-in-out infinite; }

        @keyframes shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .gold-shine {
          background: linear-gradient(90deg, #fff 0%, ${'${C.gold}'} 50%, #fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shine 3s linear infinite;
        }

        @keyframes iconFloat1 {
          0%, 100% { transform: translateY(0) rotate(12deg); }
          50% { transform: translateY(-14px) rotate(18deg); }
        }
        @keyframes iconFloat2 {
          0%, 100% { transform: translateY(0) rotate(-8deg); }
          50% { transform: translateY(12px) rotate(-14deg); }
        }
        @keyframes iconFloat3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(6deg); }
        }
        .bg-icon-1 { animation: iconFloat1 7s ease-in-out infinite; }
        .bg-icon-2 { animation: iconFloat2 8s ease-in-out infinite; }
        .bg-icon-3 { animation: iconFloat3 6.5s ease-in-out infinite; }

        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .form-card-enter { animation: cardEnter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

        @keyframes fieldFade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .field-fade-1 { animation: fieldFade 0.4s ease-out 0.1s both; }
        .field-fade-2 { animation: fieldFade 0.4s ease-out 0.18s both; }
        .field-fade-3 { animation: fieldFade 0.4s ease-out 0.26s both; }

        .tab-switcher {
          position: relative;
        }
        .tab-indicator {
          position: absolute;
          top: 6px;
          bottom: 6px;
          border-radius: 10px;
          background: ${C.card};
          box-shadow: 0 4px 12px -4px rgba(43,27,46,0.15);
          transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 0;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.line}; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.sub}; }
      `}</style>
    </>
  );
}

const inputStyle = {
  width: "100%", padding: "12px 16px", fontSize: 14.5, borderRadius: 12,
  border: `1.5px solid ${C.line}`, outline: "none", fontFamily: fontSans, color: C.ink,
  boxSizing: "border-box", background: "#FCFAF8", transition: "all 0.2s ease"
};

const primaryBtn = {
  width: "100%", padding: "14px 0", background: C.plum, color: "#fff", border: "none",
  borderRadius: 12, fontSize: 14.5, fontWeight: 500, cursor: "pointer", fontFamily: fontSans,
  marginTop: 6, boxShadow: "0 8px 20px -8px rgba(43,27,46,0.45)", transition: "all 0.2s ease",
  display: "flex", justifyContent: "center", alignItems: "center", gap: 8
};

const card = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: "24px", boxShadow: "0 2px 8px -4px rgba(43,27,46,0.08)" };

const btnGhost = { display: "flex", alignItems: "center", gap: 6, background: C.plum, color: "#fff", border: "none", padding: "10px 18px", borderRadius: 12, fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: fontSans, boxShadow: "0 6px 16px -8px rgba(43,27,46,0.4)", transition: "all 0.2s ease" };

const iconBtn = { background: "transparent", border: "none", cursor: "pointer", color: C.sub, padding: 8, borderRadius: 8, transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center" };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 11, color: C.sub, marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</label>
      {children}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div style={{ padding: "36px 24px", textAlign: "center", background: "#FCFAF8", borderRadius: 16, border: `1px dashed ${C.line}` }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: C.goldLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
        <Icon size={22} color={C.gold} />
      </div>
      <h3 style={{ margin: "0 0 4px", fontSize: 14.5, fontWeight: 600, color: C.ink }}>{title}</h3>
      {description && <p style={{ color: C.sub, fontSize: 13, margin: 0, lineHeight: 1.5 }}>{description}</p>}
    </div>
  );
}

function PageHeader({ title, sub, action }) {
  const mobile = useIsMobile();
  return (
    <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", justifyContent: "space-between", alignItems: mobile ? "center" : "flex-end", marginBottom: mobile ? 18 : 32, flexWrap: "wrap", gap: mobile ? 10 : 16 }}>
      <div style={{ textAlign: mobile ? "center" : "left", width: mobile ? "100%" : "auto" }}>
        <h1 style={{ fontFamily: fontVoice, fontSize: mobile ? 19 : 28, fontWeight: 600, margin: 0, color: C.ink }}>{title}</h1>
        {sub && !mobile && <p style={{ color: C.sub, fontSize: 14.5, margin: "4px 0 0", lineHeight: 1.4 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function SearchBar({ setTab }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await api.search(query.trim());
        setResults(res.results);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goTo = (tabId) => {
    setTab(tabId);
    setOpen(false);
    setQuery("");
    setResults(null);
  };

  const hasResults = results && (results.appointments.length || results.inventory.length || results.employees.length);

  return (
    <div ref={boxRef} style={{ position: "relative", flex: 1, maxWidth: 480 }}>
      <Search size={16} color={C.sub} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search appointments, inventory, staff..."
        style={{ width: "100%", padding: "12px 16px 12px 42px", fontSize: 13.5, borderRadius: 999, border: "none", outline: "none", fontFamily: fontSans, color: C.ink, boxSizing: "border-box", background: C.goldLight }}
      />

      {open && query.trim().length >= 2 && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: C.card, borderRadius: 14, border: `1px solid ${C.line}`, boxShadow: "0 16px 40px -12px rgba(43,27,46,0.25)", zIndex: 50, maxHeight: 360, overflowY: "auto", padding: 8 }}>
          {loading && (
            <div style={{ padding: "14px 12px", display: "flex", alignItems: "center", gap: 8, color: C.sub, fontSize: 13 }}>
              <Loader2 className="spinner" size={14} /> Searching...
            </div>
          )}

          {!loading && !hasResults && (
            <div style={{ padding: "14px 12px", color: C.sub, fontSize: 13 }}>No results for &quot;{query}&quot;.</div>
          )}

          {!loading && results?.appointments?.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ padding: "6px 10px", fontSize: 10.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>Appointments</div>
              {results.appointments.map((a) => (
                <div key={a.id} onClick={() => goTo("appointments")} style={{ padding: "8px 10px", borderRadius: 8, cursor: "pointer" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.goldLight}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{a.client}</div>
                  <div style={{ fontSize: 11.5, color: C.sub }}>{a.service} · {a.date}</div>
                </div>
              ))}
            </div>
          )}

          {!loading && results?.inventory?.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ padding: "6px 10px", fontSize: 10.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>Inventory</div>
              {results.inventory.map((i) => (
                <div key={i.id} onClick={() => goTo("team")} style={{ padding: "8px 10px", borderRadius: 8, cursor: "pointer" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.goldLight}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{i.name}</div>
                  <div style={{ fontSize: 11.5, color: C.sub }}>{i.qty} {i.unit} in stock</div>
                </div>
              ))}
            </div>
          )}

          {!loading && results?.employees?.length > 0 && (
            <div>
              <div style={{ padding: "6px 10px", fontSize: 10.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>Staff</div>
              {results.employees.map((e) => (
                <div key={e.id} onClick={() => goTo("team")} style={{ padding: "8px 10px", borderRadius: 8, cursor: "pointer" }}
                  onMouseEnter={(ev) => ev.currentTarget.style.background = C.goldLight}
                  onMouseLeave={(ev) => ev.currentTarget.style.background = "transparent"}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{e.name}</div>
                  <div style={{ fontSize: 11.5, color: C.sub }}>{e.position || "Staff"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ForgotPasswordLink() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim()) return;
    setBusy(true);
    setStatus("");
    try {
      const res = await api.forgotPassword(email.trim());
      setStatus(res.message || "A reset link has been sent to your registered email address.");
    } catch (err) {
      setStatus(err.message || "An unexpected error occurred. Please try again.");
    }
    setBusy(false);
  };

  if (!open) {
    return (
      <p style={{ fontSize: 13.5, color: C.plum, marginTop: 16, textAlign: "center", cursor: "pointer", fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 4 }} onClick={() => setOpen(true)}>
        Forgot your password?
      </p>
    );
  }

  return (
    <div style={{ marginTop: 20, padding: 20, background: "#F9F6F4", borderRadius: 16, border: `1px solid ${C.line}` }}>
      <p style={{ fontSize: 13.5, color: C.ink, marginBottom: 12, fontWeight: 500 }}>Reset Password</p>
      <p style={{ fontSize: 13, color: C.sub, marginBottom: 16 }}>Enter your registered email address to receive password reset instructions.</p>
      <input type="email" className="vellora-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" style={inputStyle} />
      <button onClick={submit} disabled={busy} className="vellora-btn" style={{ ...primaryBtn, marginTop: 12, opacity: busy ? 0.7 : 1 }}>
        {busy ? <Loader2 className="spinner" size={16} /> : null}
        {busy ? "Sending Instructions..." : "Send Reset Link"}
      </button>
      {status && <p style={{ fontSize: 13, color: status.includes("error") ? C.red : C.green, marginTop: 12, fontWeight: 500 }}>{status}</p>}
    </div>
  );
}

/* ================= LOGIN / REGISTER ================= */
function LoginScreen({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [salonName, setSalonName] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isMobile = useIsMobile();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (mode === "register" && !salonName.trim()) return setError("Please enter your salon's name.");
    if (mode === "register" && !name.trim()) return setError("Please provide your full name.");
    if (mode === "register" && !agreedToTerms) return setError("Please agree to the Terms & Conditions and Privacy Policy to continue.");
    if (!username.trim()) return setError("A username is required to proceed.");
    if (!password || password.length < 4) return setError("Password must be at least 4 characters long.");

    setBusy(true);
    try {
      const res = mode === "register"
        ? await api.register(salonName.trim(), name.trim(), username.trim(), password, email.trim(), accessCode.trim())
        : await api.login(username.trim(), password);
      onAuthed(res.token, res.user);
    } catch (err) {
      setError(err.message || "Authentication failed. Please verify your credentials and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: isMobile ? "column" : "row", background: C.ivory, fontFamily: fontSans }}>
      <GlobalFonts />
      <div style={{ flex: isMobile ? "none" : 1, background: `
        radial-gradient(circle at 1px 1px, rgba(184,147,95,0.12) 1px, transparent 0) 0 0/28px 28px,
        linear-gradient(145deg, ${C.plum} 0%, #1A101C 100%)
  `, color: C.goldLight, display: "flex", flexDirection: "column", justifyContent: "center", padding: isMobile ? "40px 24px" : "5vw", minWidth: 0, position: "relative", overflow: "hidden" }}>
        {/* Decorative background element */}
        <div className="glow-pulse" style={{ position: "absolute", top: "-10%", right: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(184,147,95,0.15) 0%, rgba(0,0,0,0) 70%)", borderRadius: "50%" }}></div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
            <div className="scissor-icon-wrap" style={{ background: "rgba(184,147,95,0.15)", padding: 12, borderRadius: 16 }}>
              <span className="scissor-snip">
                <Scissors size={32} color={C.gold} />
              </span>
            </div>
            <div>
              <span style={{ fontFamily: fontVoice, fontSize: 32, fontWeight: 600, letterSpacing: 0.5, color: "#fff" }}>Vellora</span>
              <span style={{ fontFamily: fontSans, fontSize: 12, color: "rgba(255,255,255,0.6)", marginLeft: 10, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 500 }}>
                by Salon Chair Wala
              </span>
            </div>
          </div>
          <h1 className="login-fade-2" style={{ fontFamily: fontVoice, fontSize: isMobile ? "26px" : "clamp(32px, 4.5vw, 52px)", lineHeight: 1.15, fontWeight: 500, margin: 0, maxWidth: 540, color: "#fff" }}>
            Elevate your salon management experience.
          </h1>
          <p className="login-fade-3" style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, marginTop: 24, maxWidth: 460, lineHeight: 1.6 }}>
            Seamlessly control appointments, inventory, and payroll from a single, beautifully designed dashboard—accessible anywhere, anytime.
          </p>
          <div style={{ display: "flex", gap: 28, marginTop: 36, paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            {[
              ["500+", "Salons Managed"],
              ["₹2Cr+", "Revenue Tracked"],
              ["24/7", "Dashboard Access"]
            ].map(([stat, label]) => (
              <div key={label}>
                <div style={{ fontFamily: fontVoice, fontSize: 20, fontWeight: 600, color: C.gold }}>{stat}</div>
                <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "20px 16px 40px" : 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-15%", right: "-15%", width: 480, height: 480, background: `radial-gradient(circle, rgba(232,160,160,0.35) 0%, rgba(232,160,160,0.08) 55%, rgba(0,0,0,0) 75%)`, borderRadius: "50%", pointerEvents: "none" }}></div>

        <Scissors className="bg-icon-1" size={44} color={C.plum} style={{ position: "absolute", top: "16%", right: "12%", opacity: 0.1, pointerEvents: "none", transform: "rotate(-20deg)" }} />
        <Scissors className="bg-icon-2" size={34} color={C.plum} style={{ position: "absolute", top: "40%", left: "6%", opacity: 0.08, pointerEvents: "none" }} />
        <Scissors className="bg-icon-3" size={30} color={C.plum} style={{ position: "absolute", bottom: "12%", right: "8%", opacity: 0.08, pointerEvents: "none", transform: "rotate(150deg)" }} />
        <Sparkles className="bg-icon-2" size={22} color={C.gold} style={{ position: "absolute", top: "26%", left: "20%", opacity: 0.5, pointerEvents: "none" }} />
        <Sparkles className="bg-icon-3" size={18} color={C.gold} style={{ position: "absolute", bottom: "22%", left: "10%", opacity: 0.4, pointerEvents: "none" }} />

        {[
          { top: "8%", left: "10%", size: 6, color: "#E8A0A0" },
          { top: "12%", right: "20%", size: 5, color: "#B8935F" },
          { top: "58%", right: "6%", size: 7, color: "#E8A0A0" },
          { top: "80%", left: "24%", size: 6, color: "#B8935F" },
          { top: "34%", right: "34%", size: 4, color: "#9DA8D8" },
          { top: "70%", left: "40%", size: 5, color: "#D8B8E8" },
        ].map((d, i) => (
          <div key={i} style={{ position: "absolute", top: d.top, left: d.left, right: d.right, width: d.size, height: d.size, borderRadius: "50%", background: d.color, opacity: 0.35, pointerEvents: "none" }} />
        ))}

        <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
          <div className="tab-switcher" style={{ display: "flex", gap: 8, marginBottom: 24, background: "#F2ECE7", padding: 6, borderRadius: 14 }}>
            {[["login", "Sign In"], ["register", "Register Salon"]].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
                flex: 1, padding: "10px 8px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13.5,
                fontWeight: 600, fontFamily: fontSans, background: "transparent",
                color: mode === m ? C.plum : C.sub, position: "relative", zIndex: 1,
                transition: "color 0.2s ease"
              }}>{label}</button>
            ))}
            <div className="tab-indicator" style={{ left: mode === "login" ? 6 : "50%", width: "calc(50% - 6px)" }}></div>
          </div>

          <form onSubmit={submit} className="form-card-enter" style={{ width: "100%", background: C.card, borderRadius: 24, padding: "40px", border: `1px solid ${C.line}`, boxShadow: "0 24px 50px -20px rgba(43,27,46,0.08)" }}>
            <h2 style={{ fontFamily: fontVoice, fontSize: 26, fontWeight: 600, color: C.ink, margin: "0 0 8px", fontStyle: "italic" }}>
              {mode === "register" ? "Create your account" : "Welcome back"}
            </h2>
            <p style={{ color: C.sub, fontSize: 14.5, margin: "0 0 32px", lineHeight: 1.5 }}>
              {mode === "register" ? "Set up your digital workspace to manage your salon efficiently." : "Enter your credentials to access your dashboard."}
            </p>

            {mode === "register" && (
              <>
                <Field label="Salon Name">
                  <input className="vellora-input" value={salonName} onChange={(e) => setSalonName(e.target.value)} placeholder="Lumière Beauty Studio" style={inputStyle} />
                </Field>
                <Field label="Full Name">
                  <input className="vellora-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aisha Kapoor" style={inputStyle} />
                </Field>
                <Field label="Email Address">
                  <input className="vellora-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aisha@lumieresalon.com" style={inputStyle} />
                </Field>
                <Field label="Access Code">
                  <input value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder="Provided by your administrator" style={inputStyle} />
                </Field>
              </>
            )}
            <div className="field-fade-1">
              <Field label="Username">
                <input className="vellora-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="lumiere.aisha" style={inputStyle} />
              </Field>
            </div>
            <div className="field-fade-2">
              <Field label="Password">
                <div style={{ position: "relative" }}>
                  <input className="vellora-input" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPw((s) => !s)} style={{ position: "absolute", right: 12, top: 12, background: "none", border: "none", cursor: "pointer", color: C.sub, transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = C.plum} onMouseOut={(e) => e.currentTarget.style.color = C.sub}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Field>
            </div>

            {mode === "register" && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 4, marginBottom: 20 }}>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  style={{ width: 16, height: 16, marginTop: 2, flexShrink: 0, accentColor: C.plum, cursor: "pointer" }}
                />
                <label
                  onClick={() => setAgreedToTerms((v) => !v)}
                  style={{ fontSize: isMobile ? 11.5 : 12.5, color: C.sub, lineHeight: 1.5, cursor: "pointer", userSelect: "none" }}
                >
                  I agree to the{" "}
                  
                  <a href="https://vellora.salonchairwala.com/terms.html" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: C.plum, fontWeight: 600, textDecoration: "underline" }}>

                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  
                  <a href="https://vellora.salonchairwala.com/privacy.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: C.plum, fontWeight: 600, textDecoration: "underline" }}
                  >
                    Privacy Policy
                  </a>
                  , and consent to my data being used for marketing/promotional communications (SMS, WhatsApp, Email).
                </label>
              </div>
            )}

            {error && (
              <div style={{ padding: "12px 14px", backgroundColor: C.redBg, borderLeft: `4px solid ${C.red}`, borderRadius: 8, marginBottom: 20 }}>
                <p style={{ color: C.red, fontSize: 13.5, margin: 0, fontWeight: 500 }}>{error}</p>
              </div>
            )}

            <div className="field-fade-3">
              <button
                type="submit"
                disabled={busy || (mode === "register" && !agreedToTerms)}
                className="vellora-btn"
                style={{
                  ...primaryBtn,
                  marginTop: 24,
                  opacity: (busy || (mode === "register" && !agreedToTerms)) ? 0.6 : 1,
                  cursor: (mode === "register" && !agreedToTerms) ? "not-allowed" : "pointer"
                }}
              >
                {busy ? <Loader2 className="spinner" size={18} /> : null}
                {busy ? "Authenticating..." : mode === "register" ? "Register Salon" : "Sign In"}
              </button>
            </div>

            {mode === "login" && (
              <p style={{ fontSize: 13, color: C.sub, marginTop: 24, textAlign: "center", lineHeight: 1.5 }}>
                Employee access? Request credentials from your salon administrator.
              </p>
            )}
            {mode === "login" && <ForgotPasswordLink />}
          </form>
        </div>
      </div>
    </div>
  );
}

/* ================= SHELL ================= */
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "employee", "superadmin"] },
  { id: "appointments", label: "Appointments", icon: Calendar, roles: ["admin", "employee", "superadmin"] },
  { id: "reports", label: "Reports", icon: TrendingUp, roles: ["admin", "superadmin"] },
  { id: "customers", label: "Customers", icon: Users, roles: ["admin", "superadmin"] },
  { id: "settings", label: "Payment Settings", icon: Wallet, roles: ["admin", "superadmin"] },
  { id: "marketing", label: "Marketing", icon: ImageIcon, roles: ["admin", "employee", "superadmin"] },
  { id: "accounts", label: "Accounts", icon: Wallet, roles: ["admin", "superadmin"] },
  { id: "team", label: "Team & Inventory", icon: Package, roles: ["admin", "superadmin"] },
  { id: "superadmin", label: "All Salons", icon: Users, roles: ["superadmin"] }
];

export default function SalonManager() {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [loadingData, setLoadingData] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [appts, setAppts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState({});

  const isMobile = useIsMobile();
  const touchStartX = useRef(null);
  const tabHistoryRef = useRef([]);
  const [canGoBack, setCanGoBack] = useState(false);
  const prevTabRef = useRef(tab);

  useEffect(() => {
    if (prevTabRef.current !== tab) {
      tabHistoryRef.current = [...tabHistoryRef.current, prevTabRef.current];
      prevTabRef.current = tab;
      setCanGoBack(tabHistoryRef.current.length > 0);
    }
  }, [tab]);

  const goBack = () => {
    const hist = tabHistoryRef.current;
    if (hist.length === 0) return;
    const prevTab = hist[hist.length - 1];
    tabHistoryRef.current = hist.slice(0, -1);
    prevTabRef.current = prevTab;
    setTab(prevTab);
    setCanGoBack(tabHistoryRef.current.length > 0);
  };

  useEffect(() => {
    const existing = loadSession();
    if (existing) setSession(existing);
    setCheckingSession(false);
  }, []);

  const loadAllData = useCallback(async () => {
    setLoadingData(true);
    setLoadError("");
    try {
      const [a, i, s, e, c, ps] = await Promise.all([
        api.getAppointments(), api.getInventory(), api.getSalaries(), api.getEmployees(), api.getCustomers(), api.getSettings(),
      ]);
      setAppts(a.appointments || []);
      setInventory(i.inventory || []);
      setSalaries(s.salaries || []);
      setEmployees(e.employees || []);
      setCustomers(c.customers || []);
      setPaymentSettings(ps.settings || {});
    } catch (err) {
      setLoadError(err.message || "Failed to establish secure connection with the database.");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (session) loadAllData();
  }, [session, loadAllData]);

  const handleAuthed = (token, user) => {
    saveSession(token, user);
    setSession({ token, user });
  };
  const handleLogout = () => {
    clearSession();
    setSession(null);
    setAppts([]); setInventory([]); setSalaries([]); setEmployees([]);
  };

  if (checkingSession) {
    return (
      <div style={{ minHeight: "100vh", background: C.ivory, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: fontSans, color: C.plum }}>
        <GlobalFonts />
        <Loader2 className="spinner" size={32} style={{ marginBottom: 16 }} />
        <p style={{ fontSize: 15, fontWeight: 500 }}>Initializing secure session...</p>
      </div>
    );
  }
  if (!session) return <LoginScreen onAuthed={handleAuthed} />;

  const { user } = session;
  const visibleNav = NAV.filter((n) => n.roles.includes(user.role));
  const tabOrder = visibleNav.map((n) => n.id);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || !isMobile) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = 60; 
    if (Math.abs(deltaX) > threshold) {
      const currentIndex = tabOrder.indexOf(tab);
      if (deltaX < 0 && currentIndex < tabOrder.length - 1) setTab(tabOrder[currentIndex + 1]); 
      else if (deltaX > 0 && currentIndex > 0) setTab(tabOrder[currentIndex - 1]); 
    }
    touchStartX.current = null;
  };

  const SidebarContent = (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "rgba(184,147,95,0.15)", padding: 8, borderRadius: 10, transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "rotate(-15deg) scale(1.1)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "rotate(0) scale(1)"}
          >
            <Scissors size={20} color={C.gold} />
          </div>
          <span style={{ fontFamily: fontVoice, fontSize: 22, fontWeight: 600, letterSpacing: 0.5 }}>Vellora</span>
        </div>
        {isMobile && (
          <button onClick={() => setDrawerOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 24, cursor: "pointer", padding: 4 }}>✕</button>
        )}
      </div>
      <nav style={{ flex: 1, padding: "4px 12px" }}>
        {visibleNav.map((n) => {
          const Icon = n.icon;
          const active = tab === n.id;
          return (
            <button
              key={n.id}
              className="nav-item"
              onClick={() => { setTab(n.id); setDrawerOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px",
                marginBottom: 1, borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13.5,
                fontFamily: fontSans, textAlign: "left", fontWeight: active ? 500 : 400,
                background: active ? "rgba(184,147,95,0.1)" : "transparent",
                color: active ? C.gold : "rgba(255,255,255,0.65)",
                transition: "all 0.15s ease"
              }}
            >
              <Icon size={16} /> {n.label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", color: C.plum, fontWeight: 600, fontSize: 14 }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{user.name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{user.salonName || (user.role === "superadmin" ? "System Administrator" : "Salon Administrator")}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>

          <button
            className="vellora-btn"
            onClick={() => {
              setTab("general-settings");
              setDrawerOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: tab === "general-settings"
                ? "rgba(184,147,95,0.15)"
                : "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: tab === "general-settings"
                ? C.gold
                : "rgba(255,255,255,0.85)",
              padding: "9px",
              borderRadius: 10,
              fontSize: 12.5,
              fontWeight: 500,
              cursor: "pointer",
              width: "100%",
              justifyContent: "center",
              transition: "all 0.2s ease"
            }}
          >
            <SettingsIcon size={14} /> Settings
          </button>

          <button
            className="vellora-btn"
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.85)",
              padding: "9px",
              borderRadius: 10,
              fontSize: 12.5,
              fontWeight: 500,
              cursor: "pointer",
              width: "100%",
              justifyContent: "center",
              transition: "all 0.2s ease"
            }}
          >
            <LogOut size={14} /> Sign Out
          </button>

        </div>
      </div>
    </>
  );

  return (
    <div style={{
      minHeight: "100vh", display: "flex", fontFamily: fontSans, color: C.ink,
      background: `
        radial-gradient(circle at 1px 1px, rgba(184,147,95,0.15) 1px, transparent 0) 0 0/24px 24px,
        ${C.ivory}
      `
    }}>
      <GlobalFonts />

      {!isMobile && (
        <aside style={{ width: 260, background: C.plum, color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0, boxShadow: "4px 0 24px rgba(0,0,0,0.04)" }}>
          {SidebarContent}
        </aside>
      )}

      {isMobile && drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(26,18,28,0.6)", zIndex: 40, backdropFilter: "blur(4px)" }}>
          <aside onClick={(e) => e.stopPropagation()} style={{ width: 280, height: "100%", background: C.plum, color: "#fff", display: "flex", flexDirection: "column", position: "absolute", left: 0, top: 0, boxShadow: "8px 0 32px rgba(0,0,0,0.4)" }}>
            {SidebarContent}
          </aside>
        </div>
      )}

            <main onTouchStart={isMobile ? handleTouchStart : undefined} onTouchEnd={isMobile ? handleTouchEnd : undefined} style={{ flex: 1, padding: isMobile ? "14px 12px calc(84px + env(safe-area-inset-bottom))" : "40px 48px", overflowY: "auto", minWidth: 0, width: "100%" }}>
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, padding: "env(safe-area-inset-top) 0 14px", borderBottom: `1px solid ${C.line}`, position: "sticky", top: 0, background: C.ivory, zIndex: 20 }}>
            <button onClick={() => setDrawerOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: C.ink, padding: 4 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Scissors size={20} color={C.gold} />
              <span style={{ fontFamily: fontVoice, fontSize: 18, fontWeight: 600 }}>Vellora</span>
            </div>
            {canGoBack ? (
              <button onClick={goBack} style={{ background: "none", border: "none", cursor: "pointer", color: C.ink, padding: 4, width: 28, display: "flex", justifyContent: "flex-end" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              </button>
            ) : (
              <div style={{ width: 28 }} />
            )}
          </div>
        )}

        


        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 16 }}>
            <SearchBar setTab={setTab} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.card, borderRadius: 999, padding: "5px 14px 5px 5px", boxShadow: "0 1px 3px rgba(43,27,46,0.08)" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", color: C.plum, fontWeight: 700, fontSize: 12 }}>
                  {user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{user.name.split(" ")[0]}</span>
              </div>
            </div>
          </div>
        )}

        {loadError && (
          <div style={{ ...card, borderColor: C.red, backgroundColor: C.redBg, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, padding: "16px 20px" }}>
            <span style={{ color: C.red, fontSize: 14, fontWeight: 500 }}>{loadError}</span>
            <button className="vellora-btn-ghost" style={{ ...btnGhost, background: C.red, padding: "8px 16px", fontSize: 13 }} onClick={loadAllData}>Retry Connection</button>
          </div>
        )}
        
        {loadingData && !loadError && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.sub, fontSize: 14, marginBottom: 24, fontWeight: 500 }}>
            <Loader2 className="spinner" size={16} color={C.plum} /> Synchronizing data...
          </div>
        )}

        <div key={tab} style={{ animation: "fadeIn 0.22s ease-out" }}>
          {tab === "dashboard" && <Dashboard appts={appts} inventory={inventory} employees={employees} isMobile={isMobile} setTab={setTab} />}
          {tab === "appointments" && <Appointments appts={appts} setAppts={setAppts} setLoadError={setLoadError} isMobile={isMobile} salonName={user.salonName || "our salon"} paymentSettings={paymentSettings} />}
          {tab === "reports" && <Reports setLoadError={setLoadError} />}
          {tab === "customers" && <Customers setLoadError={setLoadError} isMobile={isMobile} />}
          {tab === "settings" && <PaymentSettings settings={paymentSettings} setPaymentSettings={setPaymentSettings} setLoadError={setLoadError} isMobile={isMobile} />}
          {tab === "general-settings" && <Settings isMobile={isMobile} />}
          {tab === "marketing" && <Marketing user={user} isMobile={isMobile} />}
          {tab === "accounts" && <Accounts salaries={salaries} setSalaries={setSalaries} employees={employees} setLoadError={setLoadError} isMobile={isMobile} />}
          {tab === "team" && <Team employees={employees} setEmployees={setEmployees} inventory={inventory} setInventory={setInventory} setLoadError={setLoadError} isMobile={isMobile} />}
          {tab === "superadmin" && <SuperAdminPanel token={session.token} />}
        </div>
      </main>

      {isMobile && (
        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, minHeight: 64, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)", borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 6px calc(8px + env(safe-area-inset-bottom))", zIndex: 30, boxShadow: "0 -8px 24px rgba(0,0,0,0.04)" }}>
          {visibleNav.slice(0, 5).map((n) => {
            const Icon = n.icon;
            const active = tab === n.id;
            return (
              <button key={n.id} onClick={() => setTab(n.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flex: 1, minWidth: 0, background: active ? "rgba(184,147,95,0.12)" : "none", border: "none", borderRadius: 12, cursor: "pointer", color: active ? C.plum : C.sub, padding: "5px 2px", transition: "all 0.2s" }}>
                <Icon size={19} color={active ? C.plum : C.sub} />
                <span style={{ fontSize: 9.5, fontWeight: active ? 600 : 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{n.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

function Dashboard({ appts, inventory, employees, isMobile, setTab }) {
  const today = todayISO();
  const todayCount = appts.filter((a) => a.date?.slice(0, 10) === today).length;
  const monthRevenue = appts
    .filter((a) => a.date?.slice(0, 7) === today.slice(0, 7) && a.status === "payment done")
    .reduce((s, a) => s + Number(a.price || 0), 0);
  const lowStock = inventory.filter((i) => Number(i.qty) <= Number(i.reorder_level || 0));

  const stats = [
    { label: "Today's Appointments", value: todayCount, icon: Calendar, target: "appointments", iconBg: "#8B5CF6" },
    { label: "Monthly Revenue", value: money(monthRevenue), icon: Wallet, target: "accounts", iconBg: "#F59E0B" },
    { label: "Active Staff", value: employees.length, icon: Users, target: "team", iconBg: "#10B981" },
    { label: "Items Low in Stock", value: lowStock.length, icon: Package, target: "team", iconBg: "#EC4899" },
  ];

  const upcoming = appts.filter((a) => a.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

  // Revenue This Week — last 7 days including today
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekRevenue = weekDays.map((dateStr) => {
    const total = appts
      .filter((a) => a.date === dateStr && a.status === "payment done")
      .reduce((s, a) => s + Number(a.price || 0), 0);
    const dow = new Date(dateStr + "T00:00:00").getDay();
    return { date: dateStr, label: dayLabels[dow], revenue: total };
  });
  const weekTotal = weekRevenue.reduce((s, d) => s + d.revenue, 0);
  const weekMax = Math.max(...weekRevenue.map((d) => d.revenue), 1);

  // Top Services — computed from paid appointments
  const serviceMap = {};
  appts.filter((a) => a.status === "payment done").forEach((a) => {
    const key = a.service || "Other";
    if (!serviceMap[key]) serviceMap[key] = { bookings: 0, revenue: 0 };
    serviceMap[key].bookings += 1;
    serviceMap[key].revenue += Number(a.price || 0);
  });
  const topServices = Object.entries(serviceMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

    // Previous week ka data — % change ke liye
  const prevWeekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });
  const prevWeekTotal = appts
    .filter((a) => prevWeekDays.includes(a.date) && a.status === "payment done")
    .reduce((s, a) => s + Number(a.price || 0), 0);
  const weekChangePct = prevWeekTotal > 0 ? Math.round(((weekTotal - prevWeekTotal) / prevWeekTotal) * 100) : (weekTotal > 0 ? 100 : 0);

  // Top services ke liye previous-period comparison
  const prevServiceMap = {};
  appts.filter((a) => prevWeekDays.includes(a.date) && a.status === "payment done").forEach((a) => {
    const key = a.service || "Other";
    prevServiceMap[key] = (prevServiceMap[key] || 0) + Number(a.price || 0);
  });
  const topServicesWithChange = topServices.map((s) => {
    const prevRev = prevServiceMap[s.name] || 0;
    const changePct = prevRev > 0 ? Math.round(((s.revenue - prevRev) / prevRev) * 100) : (s.revenue > 0 ? 100 : 0);
    return { ...s, changePct };
  });

  return (
    <div style={{ position: "relative" }}>
      <PageHeader title="Dashboard Overview" sub="A comprehensive look at your salon's performance today." />

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(auto-fit,minmax(200px,1fr))", gap: isMobile ? 10 : 16, marginBottom: isMobile ? 20 : 32 }}>
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="vellora-card pop-in"
              onClick={() => setTab && setTab(s.target)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" && setTab) setTab(s.target); }}
              style={{ ...card, padding: isMobile ? "14px 12px" : "24px 20px", cursor: setTab ? "pointer" : "default", animationDelay: `${idx * 0.08}s` }}
            >
              <div style={{ width: isMobile ? 32 : 42, height: isMobile ? 32 : 42, borderRadius: isMobile ? 9 : 12, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: isMobile ? 10 : 16 }}>
                <Icon size={isMobile ? 15 : 20} color="#fff" />
              </div>
              <div style={{ fontSize: isMobile ? 18 : 28, fontWeight: 600, fontFamily: fontVoice, color: C.ink }}>{s.value}</div>
              <div style={{ fontSize: isMobile ? 11.5 : 13.5, color: C.sub, marginTop: isMobile ? 3 : 6, fontWeight: 500 }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr", gap: 20, alignItems: "start", marginBottom: 20 }}>
        <div className="vellora-card" style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.ink }}>Revenue This Week</h3>
              <p style={{ margin: "4px 0 0", fontSize: 12.5, color: C.sub }}>Daily earnings overview</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: weekChangePct >= 0 ? C.greenBg : C.redBg, color: weekChangePct >= 0 ? C.green : C.red, display: "flex", alignItems: "center", gap: 4 }}>
              {weekChangePct >= 0 ? "↗" : "↘"} {Math.abs(weekChangePct)}% vs last week
            </span>
          </div>
          <svg viewBox="0 0 500 180" style={{ width: "100%", height: 180, marginTop: 16, overflow: "visible" }}>
            {(() => {
              const w = 500, h = 180, pad = 24;
              const step = (w - pad * 2) / (weekRevenue.length - 1);
              const points = weekRevenue.map((d, i) => {
                const x = pad + i * step;
                const y = h - pad - (d.revenue / weekMax) * (h - pad * 2);
                return { x, y, d };
              });
              const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
              const areaPath = `${linePath} L ${points[points.length - 1].x} ${h - pad} L ${points[0].x} ${h - pad} Z`;
              return (
                <>
                  <defs>
                    <linearGradient id="revFillGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.gold} stopOpacity="0.35" />
                      <stop offset="100%" stopColor={C.gold} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill="url(#revFillGrad)" />
                  <path d={linePath} fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {points.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r={p.d.date === today ? 5 : 3.5} fill={p.d.date === today ? C.gold : C.card} stroke={C.gold} strokeWidth="2" />
                      <text x={p.x} y={h - 4} textAnchor="middle" fontSize="10.5" fill={C.sub} fontWeight="500">{p.d.label}</text>
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>
        </div>

        <div className="vellora-card" style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.ink }}>Top Services</h3>
            <button onClick={() => setTab && setTab("reports")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: C.gold }}>View all ›</button>
          </div>
          {topServices.length === 0 ? (
            <p style={{ color: C.sub, fontSize: 13 }}>No paid appointments yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {topServices.map((s, i) => (
                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.goldLight, color: C.plum, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{s.bookings} booking{s.bookings !== 1 ? "s" : ""} · {money(s.revenue)}</div>
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: s.changePct >= 0 ? C.green : C.red, whiteSpace: "nowrap" }}>
                    {s.changePct >= 0 ? "↗" : "↘"} {Math.abs(s.changePct)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr", gap: 20, alignItems: "start" }}>
        <div className="vellora-card" style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.ink }}>Upcoming Schedule</h3>
            <span style={{ fontSize: 12.5, color: C.sub }}>{upcoming.length} appointments</span>
          </div>

          {upcoming.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", background: "#FCFAF8", borderRadius: 12, border: `1px dashed ${C.line}` }}>
              <Calendar size={24} color={C.sub} style={{ marginBottom: 12 }} />
              <p style={{ color: C.sub, fontSize: 14, margin: 0 }}>No upcoming appointments scheduled.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {upcoming.map((a, i) => (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderTop: i === 0 ? "none" : `1px solid ${C.line}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.goldLight, color: C.plum, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 13 }}>
                      {a.client?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14.5, color: C.ink }}>{a.client}</div>
                      <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>{a.service}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 500, fontSize: 13.5, color: C.ink }}>{a.time}</div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, backgroundColor: getStatusBadge(a.status).bg, color: getStatusBadge(a.status).text }}>
                      {a.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="vellora-card" style={card}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: C.ink }}>Quick Actions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                ["Book Appt", Calendar, "appointments"],
                ["Add Client", Users, "customers"],
                ["Inventory", Package, "team"],
                ["Reports", TrendingUp, "reports"],
              ].map(([label, Icon, target]) => (
                <button
                  key={label}
                  onClick={() => setTab && setTab(target)}
                  className="vellora-icon-btn"
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 8px", borderRadius: 12, border: `1px solid ${C.line}`, background: "#FCFAF8", cursor: "pointer" }}
                >
                  <Icon size={18} color={C.gold} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: C.ink }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="vellora-card" style={{ ...card, background: `linear-gradient(160deg, ${C.plum} 0%, #1A101C 100%)`, color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Salon Rating</span>
              <span style={{ color: C.gold }}>★</span>
            </div>
            <div style={{ fontFamily: fontVoice, fontSize: 32, fontWeight: 600 }}>4.8</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Based on customer feedback</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= APPOINTMENTS ================= */
const APPT_STATUS = ["not visited", "visited", "payment pending", "payment done"];

const getStatusBadge = (status) => {
  const styles = {
    "not visited": { bg: "#F2ECE7", text: C.sub },
    "visited": { bg: C.goldLight, text: "#997340" },
    "payment pending": { bg: C.redBg, text: C.red },
    "payment done": { bg: C.greenBg, text: C.green }
  };
  return styles[status] || styles["not visited"];
};

function Appointments({ appts, setAppts, setLoadError, isMobile, salonName, paymentSettings }) {
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ client: "", phone: "", service: "", date: todayISO(), time: "10:00", employee: "", price: "" });

  const add = async () => {
    if (!form.client || !form.service || !form.date || !form.time) return;
    setSaving(true);
    try {
      const res = await api.addAppointment(form);
      setAppts([{ id: res.id, ...form, status: "not visited" }, ...appts]);
      setForm({ client: "", phone: "", service: "", date: todayISO(), time: "10:00", employee: "", price: "" });
      setShowForm(false);
    } catch (err) {
      setLoadError("Failed to save appointment. " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const celebrate = () => {
    const colors = [C.gold, C.plum, "#3A7D44", "#D33535"];
    for (let i = 0; i < 24; i++) {
      const piece = document.createElement("div");
      const size = 6 + Math.random() * 6;
      piece.style.cssText = `
        position:fixed; top:40%; left:${45 + Math.random() * 10}%;
        width:${size}px; height:${size}px;
        background:${colors[i % colors.length]};
        border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
        z-index:300; pointer-events:none;
        animation: confettiFall ${1 + Math.random() * 0.6}s ease-in forwards;
        animation-delay:${Math.random() * 0.2}s;
      `;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 2000);
    }
    const toast = document.createElement("div");
    toast.textContent = "💰 Payment recorded!";
    toast.style.cssText = `position:fixed;bottom:24px;right:24px;background:${C.plum};color:#fff;padding:12px 20px;border-radius:12px;font-family:${fontSans};font-size:14px;font-weight:500;z-index:301;box-shadow:0 8px 24px rgba(0,0,0,0.25);animation:bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1)`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.transition = "opacity 0.3s"; toast.style.opacity = "0"; }, 1500);
    setTimeout(() => toast.remove(), 1900);
  };

  const setStatus = async (id, status) => {
    const prev = appts;
    setAppts(appts.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      await api.updateAppointmentStatus(id, status);
      if (status === "payment done") celebrate();
    } catch (err) {
      setAppts(prev);
      setLoadError("Failed to update status. " + err.message);
    }
  };

  const remove = async (id) => {
    const prev = appts;
    setAppts(appts.filter((a) => a.id !== id));
    try {
      await api.deleteAppointment(id);
    } catch (err) {
      setAppts(prev);
      setLoadError("Failed to delete appointment. " + err.message);
    }
  };

  const getWhatsAppLink = (appt, salonName) => {
    if (!appt.phone) return null;
    const message = `Hey ${appt.client}!

  Just confirming - you're all booked in at *${salonName}*!

  Date: ${appt.date}
  Time: ${appt.time}
  Service: ${appt.service}

  Can't wait to see you! Reach out anytime if plans change.

  See you soon,
  ${salonName}`;
    const cleanPhone = appt.phone.replace(/\D/g, '');
    const phoneWithCountryCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    return `https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(message)}`;
  };

  const [collectPaymentAppt, setCollectPaymentAppt] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const STATUS_TABS = [
    ["all", "All"],
    ["not visited", "Not Visited"],
    ["visited", "Visited"],
    ["payment pending", "Pending"],
    ["payment done", "Completed"],
  ];

  const filtered = [...appts]
    .filter((a) => !filterDate || a.date === filterDate)
    .filter((a) => filterStatus === "all" || a.status === filterStatus)
    .sort((a, b) => b.date.localeCompare(a.date) || (a.time || "").localeCompare(b.time || ""));

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <PageHeader title="Appointments" sub="Manage client bookings, schedules, and payment statuses."
        action={<button className="vellora-btn-ghost" style={btnGhost} onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : <><Plus size={16} /> New Booking</>}
        </button>} />

      {showForm && (
        <div className="vellora-card" style={{ ...card, marginBottom: 24, background: "#FDFBF9", border: `1px solid ${C.goldLight}` }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: C.ink }}>Create New Booking</h3>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
            <input className="vellora-input" placeholder="Client Name" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} style={inputStyle} />
            <input className="vellora-input" placeholder="Contact Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
            <input className="vellora-input" placeholder="Requested Service (e.g. Hair Styling)" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} style={inputStyle} />
            <input className="vellora-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inputStyle} />
            <input className="vellora-input" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} style={inputStyle} />
            <input className="vellora-input" placeholder="Assigned Staff (Optional)" value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} style={inputStyle} />
            <input className="vellora-input" placeholder="Estimated Price (₹)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={inputStyle} />
          </div>
          <button className="vellora-btn-ghost" style={{ ...btnGhost, marginTop: 20, opacity: saving ? 0.7 : 1, width: isMobile ? "100%" : "auto" }} onClick={add} disabled={saving}>
            {saving ? <Loader2 className="spinner" size={16} /> : <Check size={16} />}
            {saving ? "Confirming..." : "Confirm Booking"}
          </button>
        </div>
      )}

      <div className="vellora-card" style={{ ...card, padding: 0, overflow: "hidden" }}>
        {/* Filter tabs + date picker row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: isMobile ? "16px" : "18px 20px", borderBottom: `1px solid ${C.line}` }}>
          <div style={{ display: "flex", gap: 6, background: "#F2ECE7", padding: 4, borderRadius: 12, flexWrap: "wrap" }}>
            {STATUS_TABS.map(([val, label]) => (
              <button key={val} onClick={() => setFilterStatus(val)} style={{
                padding: "7px 14px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12.5,
                fontWeight: 600, fontFamily: fontSans, background: filterStatus === val ? C.card : "transparent",
                color: filterStatus === val ? C.plum : C.sub, boxShadow: filterStatus === val ? "0 2px 8px -3px rgba(43,27,46,0.2)" : "none",
                transition: "all 0.2s ease", whiteSpace: "nowrap"
              }}>{label}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="date" className="vellora-input" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ ...inputStyle, width: "auto", padding: "8px 12px" }} />
            {filterDate && (
              <button onClick={() => setFilterDate("")} style={{ background: "none", border: "none", color: C.sub, fontSize: 12.5, cursor: "pointer", textDecoration: "underline" }}>Clear</button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: C.goldLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Calendar size={22} color={C.gold} />
            </div>
            <h3 style={{ margin: "0 0 4px", fontSize: 14.5, fontWeight: 600, color: C.ink }}>No appointments found</h3>
            <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>Try a different filter or add a new booking.</p>
          </div>
        ) : isMobile ? (
          // Mobile: stacked cards instead of a table
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filtered.map((a, i) => {
              const badge = getStatusBadge(a.status);
              return (
                <div key={a.id} style={{ padding: "16px", borderTop: i === 0 ? "none" : `1px solid ${C.line}`, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.goldLight, color: C.plum, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                        {a.client?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14.5, color: C.ink }}>{a.client}</div>
                        <div style={{ fontSize: 12.5, color: C.sub, marginTop: 1 }}>{a.service}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", padding: "3px 9px", borderRadius: 20, backgroundColor: badge.bg, color: badge.text }}>{a.status}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, color: C.sub }}>
                    <span>{a.date} · {a.time}</span>
                    <span style={{ fontWeight: 700, color: C.ink, fontSize: 14 }}>{a.price ? money(a.price) : "—"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <select className="vellora-input" value={a.status} onChange={(e) => setStatus(a.id, e.target.value)} style={{ ...inputStyle, flex: 1, padding: "7px 10px", fontSize: 12.5 }}>
                      {APPT_STATUS.map((s) => <option key={s} value={s}>{s.replace(/^\w/, (c) => c.toUpperCase())}</option>)}
                    </select>
                    {getWhatsAppLink(a, salonName) && (
                      <a href={getWhatsAppLink(a, salonName)} target="_blank" rel="noopener noreferrer" className="vellora-icon-btn" style={{ ...iconBtn, color: "#25D366" }}><MessageCircle size={17} /></a>
                    )}
                    {(paymentSettings?.qr_image_url || paymentSettings?.upi_id) && (
                      <button className="vellora-icon-btn" style={{ ...iconBtn, color: C.gold }} onClick={() => setCollectPaymentAppt(a)}><Wallet size={17} /></button>
                    )}
                    <button className="vellora-icon-btn" style={iconBtn} onClick={() => remove(a.id)}><Trash2 size={17} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Desktop: table
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#FCFAF8" }}>
                  {["CLIENT", "SERVICE", "TIME", "STATUS", "AMOUNT", ""].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 20px", fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: C.sub, borderBottom: `1px solid ${C.line}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const badge = getStatusBadge(a.status);
                  const cancelled = a.status === "cancelled";
                  return (
                    <tr key={a.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.goldLight, color: C.plum, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12.5, flexShrink: 0 }}>
                            {a.client?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13.5, color: C.ink }}>{a.client}</div>
                            {a.phone && <div style={{ fontSize: 11.5, color: C.sub, marginTop: 1 }}>{a.phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{a.service}</div>
                        {a.employee && <div style={{ fontSize: 11.5, color: C.gold, marginTop: 2, fontWeight: 500 }}>{a.employee}</div>}
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ fontSize: 13, color: C.ink, display: "flex", alignItems: "center", gap: 6 }}>
                          <Calendar size={12} color={C.sub} /> {a.time}
                        </span>
                        <div style={{ fontSize: 11.5, color: C.sub, marginTop: 2 }}>{a.date}</div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <select className="vellora-input" value={a.status} onChange={(e) => setStatus(a.id, e.target.value)} style={{
                          padding: "5px 26px 5px 10px", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3,
                          borderRadius: 20, border: "none", cursor: "pointer", appearance: "none",
                          backgroundColor: badge.bg, color: badge.text,
                          backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236B6070%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                          backgroundRepeat: "no-repeat", backgroundPosition: "right 8px top 50%", backgroundSize: "8px auto"
                        }}>
                          {APPT_STATUS.map((s) => <option key={s} value={s}>{s.replace(/^\w/, (c) => c.toUpperCase())}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ fontSize: 14.5, fontWeight: 700, color: cancelled ? C.sub : C.ink, textDecoration: cancelled ? "line-through" : "none" }}>
                          {a.price ? money(a.price) : "—"}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px", position: "relative" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                          {getWhatsAppLink(a, salonName) && (
                            <a href={getWhatsAppLink(a, salonName)} target="_blank" rel="noopener noreferrer" className="vellora-icon-btn" style={{ ...iconBtn, color: "#25D366" }} title="WhatsApp"><MessageCircle size={16} /></a>
                          )}
                          {(paymentSettings?.qr_image_url || paymentSettings?.upi_id) && (
                            <button className="vellora-icon-btn" style={{ ...iconBtn, color: C.gold }} title="Collect Payment" onClick={() => setCollectPaymentAppt(a)}><Wallet size={16} /></button>
                          )}
                          <button className="vellora-icon-btn" style={iconBtn} title="Delete" onClick={() => remove(a.id)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ padding: "14px 20px", fontSize: 12.5, color: C.sub, borderTop: `1px solid ${C.line}` }}>
          Showing {filtered.length} of {appts.length} appointments
        </div>
      </div>

      {collectPaymentAppt && (
        <div onClick={() => setCollectPaymentAppt(null)} style={{ position: "fixed", inset: 0, background: "rgba(26,18,28,0.65)", backdropFilter: "blur(2px)", zIndex: 100, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center", padding: isMobile ? 0 : 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            ...card,
            width: "100%",
            maxWidth: isMobile ? "100%" : 380,
            position: "relative",
            textAlign: "center",
            borderRadius: isMobile ? "28px 28px 0 0" : 22,
            padding: isMobile ? "16px 24px calc(28px + env(safe-area-inset-bottom))" : "32px",
            overflow: "hidden"
          }}>
            {/* Decorative top accent */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 90,
              background: `linear-gradient(160deg, ${C.plum} 0%, #1A101C 100%)`,
              zIndex: 0
            }} />

            {isMobile && (
              <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.4)", borderRadius: 4, margin: "0 auto 20px", position: "relative", zIndex: 1 }} />
            )}
            <button onClick={() => setCollectPaymentAppt(null)} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>×</button>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.gold, color: C.plum, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 20, margin: isMobile ? "8px auto 12px" : "0 auto 12px", border: "3px solid #fff", boxShadow: "0 6px 16px rgba(0,0,0,0.2)" }}>
                {collectPaymentAppt.client?.charAt(0).toUpperCase()}
              </div>
              <h3 style={{ fontFamily: fontVoice, fontSize: 19, fontWeight: 600, margin: "0 0 2px", color: "#fff" }}>{collectPaymentAppt.client}</h3>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: 0 }}>{collectPaymentAppt.service}</p>
            </div>

            <div style={{ marginTop: 20 }}>
              {collectPaymentAppt.price && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: C.sub, margin: "0 0 4px" }}>Amount Due</p>
                  <p style={{ fontSize: 32, fontWeight: 700, color: C.plum, fontFamily: fontVoice, margin: 0 }}>{money(collectPaymentAppt.price)}</p>
                </div>
              )}

              {paymentSettings?.qr_image_url ? (
                <div style={{ background: "#FCFAF8", border: `1.5px solid ${C.line}`, borderRadius: 18, padding: 18, display: "inline-block" }}>
                  <img src={paymentSettings.qr_image_url} alt="Payment QR" style={{ width: 190, height: 190, objectFit: "contain", borderRadius: 10, background: "#fff" }} />
                </div>
              ) : paymentSettings?.upi_id ? (
                <div style={{ padding: "20px", background: `linear-gradient(160deg, ${C.goldBg} 0%, #FDFBF9 100%)`, borderRadius: 16, border: `1.5px dashed ${C.gold}` }}>
                  <Wallet size={22} color={C.gold} style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 11, color: C.sub, margin: "0 0 6px", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>UPI ID</p>
                  <p style={{ fontSize: 17, fontWeight: 700, color: C.ink, margin: 0, wordBreak: "break-all" }}>{paymentSettings.upi_id}</p>
                </div>
              ) : null}

              <p style={{ fontSize: 12, color: C.sub, marginTop: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block", flexShrink: 0 }} />
                Ask the client to scan or copy this to pay
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= MARKETING ================= */
const MARKETING_TEMPLATES = [
  { id: "t1", image: "/marketing/post1.jpg", rotate: -2, size: "large" },
  { id: "t2", image: "/marketing/post2.jpg", rotate: 2, size: "medium" },
  { id: "t3", image: "/marketing/post3.jpg", rotate: -1.5, size: "small" },
  { id: "t4", image: "/marketing/post4.jpg", rotate: 2.5, size: "medium" },
  { id: "t5", image: "/marketing/post5.jpg", rotate: -2, size: "medium" },
  { id: "t6", image: "/marketing/post6.jpg", rotate: -1.5, size: "medium" },
  
];

function Marketing({ user, isMobile }) {
  const [processing, setProcessing] = useState(null);

  const sizeMap = {
    large: { width: isMobile ? "100%" : 340 },
    medium: { width: isMobile ? "100%" : 280 },
    small: { width: isMobile ? "100%" : 230 },
  };

  const salonName = user.salonName || "Your Salon";
  const collabText = `Salon Chair Wala × ${salonName}`;

  const generateAndShare = async (imagePath, id) => {
    setProcessing(id);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imagePath;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      // Original poster draw karo
      ctx.drawImage(img, 0, 0);

      // Neeche gradient overlay banao taaki text readable rahe
      const gradientHeight = img.height * 0.16;
      const gradient = ctx.createLinearGradient(0, img.height - gradientHeight, 0, img.height);
      gradient.addColorStop(0, "rgba(26,18,28,0)");
      gradient.addColorStop(1, "rgba(26,18,28,0.88)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, img.height - gradientHeight, img.width, gradientHeight);

      // Collab text likho
      const fontSize = Math.max(18, Math.round(img.width * 0.032));
      ctx.font = `600 ${fontSize}px Georgia, serif`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 8;
      ctx.fillText(collabText, img.width / 2, img.height - gradientHeight * 0.32);

      // Canvas ko image file mein convert karo
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      const file = new File([blob], `${salonName.replace(/\s+/g, "-")}-poster.jpg`, { type: "image/jpeg" });

      // Mobile pe native share (WhatsApp seedha option milega), warna download
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: collabText,
          text: `Check out ${salonName}!`,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Poster generate karne mein dikkat aayi:", err);
    }
    setProcessing(null);
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <PageHeader title="Marketing Hub" sub="Ready-to-share promotional posters for your salon." />

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: isMobile ? 24 : 56,
        justifyContent: isMobile ? "center" : "flex-start",
        alignItems: "flex-start",
        padding: isMobile ? "10px 0" : "30px 20px",
      }}>
        {MARKETING_TEMPLATES.map((t, idx) => (
          <div
            key={t.id}
            onClick={() => generateAndShare(t.image, t.id)}
            style={{
              ...sizeMap[t.size],
              transform: isMobile ? "none" : `rotate(${t.rotate}deg)`,
              marginTop: !isMobile && idx % 2 === 1 ? 30 : 0,
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
              cursor: "pointer",
              opacity: processing === t.id ? 0.6 : 1,
              position: "relative",
            }}
            onMouseOver={(e) => { if (!isMobile) e.currentTarget.style.transform = "rotate(0deg) scale(1.04)"; e.currentTarget.style.zIndex = 10; }}
            onMouseOut={(e) => { if (!isMobile) e.currentTarget.style.transform = `rotate(${t.rotate}deg)`; e.currentTarget.style.zIndex = 1; }}
          >
            <div style={{ background: C.card, padding: 10, borderRadius: 12, boxShadow: "0 12px 30px -10px rgba(43,27,46,0.25)", border: `1px solid ${C.line}` }}>
              <div style={{ position: "relative", borderRadius: 6, overflow: "hidden" }}>
                <img src={t.image} alt="Marketing post" style={{ width: "100%", display: "block" }} />
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(180deg, rgba(26,18,28,0) 0%, rgba(26,18,28,0.85) 100%)",
                  padding: "24px 14px 12px", textAlign: "center",
                }}>
                  <span style={{ fontFamily: fontVoice, color: "#fff", fontSize: 15, fontWeight: 600, letterSpacing: 0.3, textShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>
                    {collabText}
                  </span>
                </div>
                {processing === t.id && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Loader2 className="spinner" size={28} color="#fff" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
/* ================= ACCOUNTS ================= */
function Accounts({ salaries, setSalaries, employees, setLoadError, isMobile }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: "Salary", employeeId: "", title: "", amount: "", date: todayISO(), note: "" });

  const add = async () => {
    if (!form.amount || !form.date) return;
    setSaving(true);
    try {
      const res = await api.addSalary(form);
      setSalaries([{ id: res.id, employee_id: form.employeeId, type: form.type, title: form.title, amount: form.amount, date: form.date, note: form.note }, ...salaries]);
      setForm({ type: "Salary", employeeId: "", title: "", amount: "", date: todayISO(), note: "" });
    } catch (err) {
      setLoadError("Transaction failed to record. " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    const prev = salaries;
    setSalaries(salaries.filter((s) => s.id !== id));
    try {
      await api.deleteSalary(id);
    } catch (err) {
      setSalaries(prev);
      setLoadError("Failed to remove transaction. " + err.message);
    }
  };

  const nameOf = (id) => employees.find((e) => e.id === id)?.name || "—";
  const totalPaid = salaries.reduce((s, x) => s + Number(x.amount || 0), 0);

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <PageHeader title="Accounts & Expenses" sub="Manage payroll processing and monitor operational expenses."
        action={
          <div style={{ background: C.plum, color: "#fff", padding: "14px 20px", borderRadius: 16, boxShadow: "0 8px 20px -8px rgba(43,27,46,0.4)" }}>
            <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>Total Outflow</span>
            <div style={{ fontFamily: fontVoice, fontSize: 24, fontWeight: 600, marginTop: 4 }}>{money(totalPaid)}</div>
          </div>
        } 
      />

      <div className="vellora-card" style={{ ...card, marginBottom: 28, background: "#FDFBF9", border: `1px solid ${C.goldLight}` }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: C.ink }}>Record New Transaction</h3>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
          <select className="vellora-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={inputStyle}>
            <option value="Salary">Payroll / Salary</option>
            <option value="Expense">Operational Expense</option>
            <option value="Other">Other Outflow</option>
          </select>
          <select className="vellora-input" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} style={inputStyle} disabled={form.type !== "Salary"}>
            <option value="">Select Staff (Optional)</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <input className="vellora-input" placeholder="Transaction Title (e.g. July Payroll)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
          <input className="vellora-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inputStyle} />
          <input className="vellora-input" type="number" placeholder="Amount (₹)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} style={inputStyle} />
          <input className="vellora-input" placeholder="Additional Notes" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} style={inputStyle} />
        </div>
        <button className="vellora-btn-ghost" style={{ ...btnGhost, marginTop: 20, opacity: saving ? 0.7 : 1, width: isMobile ? "100%" : "auto" }} onClick={add} disabled={saving}>
          {saving ? <Loader2 className="spinner" size={16} /> : <Plus size={16} />} 
          {saving ? "Processing..." : "Record Transaction"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {salaries.length === 0 && (
           <div style={{ padding: "32px 24px", textAlign: "center", background: "#FCFAF8", borderRadius: 16, border: `1px dashed ${C.line}` }}>
  <div style={{ width: 48, height: 48, borderRadius: 12, background: C.goldLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
    <Wallet size={22} color={C.gold} />
  </div>
  <h3 style={{ margin: "0 0 4px", fontSize: 14.5, fontWeight: 600, color: C.ink }}>No records found</h3>
  <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>Financial transactions will appear here.</p>
</div>
        )}
        {salaries.map((s) => (
          <div key={s.id} className="vellora-card" style={{ ...card, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: C.ink }}>{s.title || s.type}</span>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", padding: "3px 8px", borderRadius: 12, backgroundColor: s.type === "Salary" ? C.plum : C.line, color: s.type === "Salary" ? "#fff" : C.sub }}>
                  {s.type}
                </span>
              </div>
              <div style={{ fontSize: 13, color: C.sub, display: "flex", gap: 8 }}>
                <span>{s.date}</span>
                {s.employee_id && <span>· Staff: <span style={{color: C.ink, fontWeight: 500}}>{nameOf(s.employee_id)}</span></span>}
                {s.note && <span>· {s.note}</span>}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ fontWeight: 600, fontSize: 16, color: C.ink }}>{money(s.amount)}</span>
              <button className="vellora-icon-btn" style={iconBtn} onClick={() => remove(s.id)}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= TEAM & INVENTORY ================= */
function Team({ employees, setEmployees, inventory, setInventory, setLoadError, isMobile }) {
  const [section, setSection] = useState("employees");
  const [savingEmp, setSavingEmp] = useState(false);
  const [ef, setEf] = useState({ name: "", username: "", password: "", position: "", phone: "" });
  const [createdInfo, setCreatedInfo] = useState(null);

  const addEmployee = async () => {
    if (!ef.name || !ef.username) return;
    setSavingEmp(true);
    setCreatedInfo(null);
    try {
      const res = await api.addEmployee(ef);
      setEmployees([...employees, { id: res.id, name: ef.name, username: ef.username, role: "employee", position: ef.position, phone: ef.phone }]);
      setCreatedInfo({ username: ef.username, password: res.password });
      setEf({ name: "", username: "", password: "", position: "", phone: "" });
    } catch (err) {
      setLoadError("Failed to add employee. " + err.message);
    } finally {
      setSavingEmp(false);
    }
  };

  const removeEmployee = async (id) => {
    const prev = employees;
    setEmployees(employees.filter((e) => e.id !== id));
    try {
      await api.deleteEmployee(id);
    } catch (err) {
      setEmployees(prev);
      setLoadError("Failed to remove employee. " + err.message);
    }
  };

  const [savingItem, setSavingItem] = useState(false);
  const [inf, setInf] = useState({ name: "", qty: "", reorder: "", unit: "pcs" });
  
  const addItem = async () => {
    if (!inf.name) return;
    setSavingItem(true);
    try {
      const res = await api.addInventoryItem(inf);
      setInventory([...inventory, { id: res.id, name: inf.name, qty: inf.qty || 0, reorder_level: inf.reorder || 0, unit: inf.unit }]);
      setInf({ name: "", qty: "", reorder: "", unit: "pcs" });
    } catch (err) {
      setLoadError("Failed to add item to inventory. " + err.message);
    } finally {
      setSavingItem(false);
    }
  };
  
  const removeItem = async (id) => {
    const prev = inventory;
    setInventory(inventory.filter((i) => i.id !== id));
    try {
      await api.deleteInventoryItem(id);
    } catch (err) {
      setInventory(prev);
      setLoadError("Failed to remove item. " + err.message);
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <PageHeader title="Resources & Management" sub="Oversee your staff members and monitor product inventory levels." />
      
      <div style={{ display: "flex", gap: 12, marginBottom: 24, background: C.card, padding: 6, borderRadius: 16, border: `1px solid ${C.line}`, width: "fit-content" }}>
        {["employees", "inventory"].map((s) => (
          <button key={s} onClick={() => setSection(s)} style={{
            padding: "10px 24px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
            background: section === s ? C.plum : "transparent", color: section === s ? "#fff" : C.sub, fontFamily: fontSans,
            transition: "all 0.2s ease"
          }}>
            {s === "employees" ? `Staff Directory (${employees.length})` : `Stock Inventory (${inventory.length})`}
          </button>
        ))}
      </div>

      {section === "employees" ? (
        <div style={{ animation: "fadeIn 0.3s ease-out" }}>
          <div className="vellora-card" style={{ ...card, marginBottom: 28, background: "#FDFBF9", border: `1px solid ${C.goldLight}` }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: C.ink }}>Add New Staff Member</h3>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
              <input className="vellora-input" placeholder="Full Name" value={ef.name} onChange={(e) => setEf({ ...ef, name: e.target.value })} style={inputStyle} />
              <input className="vellora-input" placeholder="Designation (e.g. Senior Stylist)" value={ef.position} onChange={(e) => setEf({ ...ef, position: e.target.value })} style={inputStyle} />
              <input className="vellora-input" placeholder="Contact Number" value={ef.phone} onChange={(e) => setEf({ ...ef, phone: e.target.value })} style={inputStyle} />
              <input className="vellora-input" placeholder="System Username" value={ef.username} onChange={(e) => setEf({ ...ef, username: e.target.value })} style={inputStyle} />
              <input className="vellora-input" placeholder="Temporary Password (Optional)" value={ef.password} onChange={(e) => setEf({ ...ef, password: e.target.value })} style={inputStyle} />
            </div>
            <button className="vellora-btn-ghost" style={{ ...btnGhost, marginTop: 20, opacity: savingEmp ? 0.7 : 1, width: isMobile ? "100%" : "auto" }} onClick={addEmployee} disabled={savingEmp}>
              {savingEmp ? <Loader2 className="spinner" size={16} /> : <Plus size={16} />} 
              {savingEmp ? "Provisioning Account..." : "Create Account"}
            </button>
            {createdInfo && (
              <div style={{ marginTop: 16, padding: "12px 16px", backgroundColor: C.greenBg, borderLeft: `4px solid ${C.green}`, borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: 13.5, color: C.green, fontWeight: 500 }}>
                  Account provisioned successfully. Share these credentials: 
                  <code style={{ background: "rgba(255,255,255,0.7)", padding: "2px 6px", borderRadius: 4, marginLeft: 6 }}>Username: {createdInfo.username}</code> 
                  <code style={{ background: "rgba(255,255,255,0.7)", padding: "2px 6px", borderRadius: 4, marginLeft: 6 }}>Password: {createdInfo.password}</code>
                </p>
              </div>
            )}
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {employees.length === 0 && <p style={{ color: C.sub, fontSize: 14, gridColumn: "1/-1", textAlign: "center", padding: "32px 24px", background: "#FCFAF8", borderRadius: 16, border: `1px dashed ${C.line}` }}>No staff members registered.</p>}
            {employees.map((e) => (
              <div key={e.id} className="vellora-card" style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.goldLight, color: C.plum, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 16 }}>
                    {e.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: C.ink }}>{e.name}</div>
                    <div style={{ fontSize: 13, color: C.plum, fontWeight: 500, marginTop: 2 }}>{e.position || "Staff Member"}</div>
                    <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>ID: {e.username} {e.phone && `· ${e.phone}`}</div>
                  </div>
                </div>
                <button className="vellora-icon-btn" style={iconBtn} onClick={() => removeEmployee(e.id)}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ animation: "fadeIn 0.3s ease-out" }}>
          <div className="vellora-card" style={{ ...card, marginBottom: 28, background: "#FDFBF9", border: `1px solid ${C.goldLight}` }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: C.ink }}>Add Inventory Item</h3>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
              <input className="vellora-input" placeholder="Product Name (e.g. Keratin Shampoo)" value={inf.name} onChange={(e) => setInf({ ...inf, name: e.target.value })} style={inputStyle} />
              <input className="vellora-input" type="number" placeholder="Current Quantity" value={inf.qty} onChange={(e) => setInf({ ...inf, qty: e.target.value })} style={inputStyle} />
              <input className="vellora-input" type="number" placeholder="Low Stock Alert Level" value={inf.reorder} onChange={(e) => setInf({ ...inf, reorder: e.target.value })} style={inputStyle} />
              <input className="vellora-input" placeholder="Unit of Measure (pcs, ml, liters)" value={inf.unit} onChange={(e) => setInf({ ...inf, unit: e.target.value })} style={inputStyle} />
            </div>
            <button className="vellora-btn-ghost" style={{ ...btnGhost, marginTop: 20, opacity: savingItem ? 0.7 : 1, width: isMobile ? "100%" : "auto" }} onClick={addItem} disabled={savingItem}>
              {savingItem ? <Loader2 className="spinner" size={16} /> : <Plus size={16} />} 
              {savingItem ? "Updating Catalog..." : "Add to Catalog"}
            </button>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {inventory.length === 0 && (
               <div style={{ padding: "32px 24px", textAlign: "center", background: "#FCFAF8", borderRadius: 16, border: `1px dashed ${C.line}` }}>
  <div style={{ width: 48, height: 48, borderRadius: 12, background: C.goldLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
    <Package size={22} color={C.gold} />
  </div>
  <h3 style={{ margin: "0 0 4px", fontSize: 14.5, fontWeight: 600, color: C.ink }}>Inventory is empty</h3>
  <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>Add products to start tracking your stock.</p>
</div>
            )}
            {inventory.map((i) => {
              const low = Number(i.qty) <= Number(i.reorder_level || 0);
              return (
                <div key={i.id} className="vellora-card" style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderLeft: low ? `4px solid ${C.red}` : `1px solid ${C.line}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: low ? C.redBg : C.goldLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Package size={18} color={low ? C.red : C.gold} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: C.ink }}>{i.name}</div>
                      <div style={{ fontSize: 13, color: low ? C.red : C.sub, marginTop: 4, fontWeight: low ? 600 : 400 }}>
                        {i.qty} {i.unit} in stock {low && "· Requires restock"}
                      </div>
                    </div>
                  </div>
                  <button className="vellora-icon-btn" style={iconBtn} onClick={() => removeItem(i.id)}><Trash2 size={16} /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SuperAdminPanel({ token }) {
  const [salons, setSalons] = useState([]);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  const loadData = async () => {
    try {
      const [salonRes, codeRes] = await Promise.all([
        fetch("/api/superadmin", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch("/api/superadmin/generate-code", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);
      if (salonRes.success) setSalons(salonRes.salons);
      else setError(salonRes.error);
      if (codeRes.success) setCodes(codeRes.codes);
    } catch {
      setError("Failed to establish secure connection with the administration database.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const generateCode = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/superadmin/generate-code", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) await loadData();
      else setError(data.error);
    } catch {
      setError("Code generate nahi ho paya.");
    }
    setGenerating(false);
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <PageHeader
        title="Global Administration"
        sub="Overview of all registered salons and their key performance metrics."
        action={
          <button onClick={generateCode} disabled={generating} style={{ ...btnGhost, opacity: generating ? 0.7 : 1 }}>
            <Plus size={15} /> {generating ? "Generating…" : "Generate New Code"}
          </button>
        }
      />

      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.sub, fontSize: 14, marginTop: 32 }}>
          <Loader2 className="spinner" size={18} color={C.plum} /> Compiling global metrics...
        </div>
      )}

      {error && (
        <div style={{ padding: "16px 20px", backgroundColor: C.redBg, borderLeft: `4px solid ${C.red}`, borderRadius: 8, marginBottom: 24 }}>
          <p style={{ color: C.red, fontSize: 14, margin: 0, fontWeight: 500 }}>{error}</p>
        </div>
      )}

      {!loading && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
            {salons.length === 0 ? (
              <p style={{ color: C.sub, fontSize: 14, padding: 32, textAlign: "center", background: C.card, borderRadius: 16, border: `1px dashed ${C.line}` }}>No registered salons found in the system.</p>
            ) : (
              salons.map((s) => (
                <div key={s.id} className="vellora-card" style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20, padding: "24px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 18, color: C.ink, fontFamily: fontVoice }}>{s.name}</div>
                      <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", padding: "3px 8px", borderRadius: 12, backgroundColor: C.goldBg, color: "#997340" }}>Active</span>
                    </div>
                    <div style={{ fontSize: 13, color: C.sub }}>System Entry: {s.created_at?.toString().slice(0, 10)}</div>
                  </div>

                  <div style={{ display: "flex", gap: 24, padding: "12px 20px", background: "#FCFAF8", borderRadius: 12, border: `1px solid ${C.line}` }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: C.sub, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Bookings</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>{s.total_appointments}</div>
                    </div>
                    <div style={{ width: 1, background: C.line }}></div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: C.sub, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Staff</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>{s.total_employees}</div>
                    </div>
                    <div style={{ width: 1, background: C.line }}></div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: C.sub, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Net Revenue</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: C.green }}>{money(s.total_revenue)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <h3 style={{ fontFamily: fontVoice, fontSize: 18, fontWeight: 500, color: C.ink, margin: "0 0 14px" }}>Access Codes</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {codes.length === 0 ? (
              <p style={{ color: C.sub, fontSize: 14, padding: 32, textAlign: "center", background: C.card, borderRadius: 16, border: `1px dashed ${C.line}` }}>No access codes generated yet.</p>
            ) : (
              codes.map((c) => (
                <div key={c.id} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 600, color: C.ink, letterSpacing: 0.5 }}>{c.code}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, textTransform: "uppercase", padding: "3px 10px", borderRadius: 12,
                    backgroundColor: c.is_used ? C.redBg : C.goldBg, color: c.is_used ? C.red : "#997340",
                  }}>
                    {c.is_used ? "Used" : "Available"}
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ================= REPORTS ================= */
function Reports({ setLoadError }) {
  const [period, setPeriod] = useState("month");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getReports(period)
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => { if (!cancelled) setLoadError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period, setLoadError]);

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <PageHeader title="Reports" sub="Revenue and employee performance overview."
        action={
          <div style={{ display: "flex", gap: 6, background: "#F2ECE7", padding: 4, borderRadius: 14 }}>
            {[["day", "Day"], ["month", "Month"], ["year", "Year"]].map(([p, label]) => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12.5,
                fontWeight: 500, fontFamily: fontSans, background: period === p ? C.card : "transparent",
                color: period === p ? C.plum : C.sub, boxShadow: period === p ? "0 4px 10px -4px rgba(43,27,46,0.25)" : "none",
              }}>{label}</button>
            ))}
          </div>
        } />

      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.sub, fontSize: 14 }}>
          <Loader2 className="spinner" size={16} color={C.plum} /> Loading report…
        </div>
      )}

      {!loading && data && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 26 }}>
            <div className="vellora-card" style={card}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Wallet size={20} color="#fff" />
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, fontFamily: fontVoice }}>{money(data.totalRevenue)}</div>
              <div style={{ fontSize: 12.5, color: C.sub, marginTop: 4 }}>Total revenue</div>
            </div>
            <div className="vellora-card" style={card}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "#8B5CF6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Calendar size={20} color="#fff" />
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, fontFamily: fontVoice }}>{data.totalAppointments}</div>
              <div style={{ fontSize: 12.5, color: C.sub, marginTop: 4 }}>Paid appointments</div>
            </div>
          </div>

          <div className="vellora-card" style={{ ...card, marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: C.ink }}>Revenue trend</h3>
            <RevenueBarChart rows={data.revenueTrend} />
          </div>

          <div className="vellora-card" style={card}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: C.ink }}>Employee performance</h3>
            {data.employeePerformance.length === 0 && <EmptyState icon={Users} title="No data yet" description="Staff performance will appear here once appointments are completed and paid." />}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.employeePerformance.map((e) => (
                <EmployeeBar key={e.employee} employee={e} max={data.employeePerformance[0]?.revenue || 1} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function RevenueBarChart({ rows }) {
  if (!rows || rows.length === 0) return <EmptyState icon={TrendingUp} title="No revenue data yet" description="Once you mark appointments as paid, your revenue trend will show up here." />;

  const max = Math.max(...rows.map((r) => Number(r.revenue)), 1);
  // Y-axis ke liye ek clean round number nikalo (jaise 600 ho to 800 tak scale karo)
  const niceMax = Math.ceil(max / (max > 1000 ? 1000 : 100)) * (max > 1000 ? 1000 : 100) || max;

  const width = 700, height = 280, padding = 50, bottomPadding = 40;
  const chartHeight = height - padding - bottomPadding;
  const barWidth = Math.min(70, (width - padding * 2) / rows.length - 20);
  const gap = (width - padding * 2 - barWidth * rows.length) / (rows.length + 1);

  const yTicks = 4; // kitni horizontal gridlines chahiye

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto" }}>
      {/* Y-axis gridlines aur labels */}
      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const value = (niceMax / yTicks) * i;
        const y = height - bottomPadding - (chartHeight / yTicks) * i;
        return (
          <g key={i}>
            <line x1={padding} y1={y} x2={width - 10} y2={y} stroke={C.line} strokeWidth="1" />
            <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="10" fill={C.sub}>
              {value >= 1000 ? `${(value / 1000).toFixed(0)}k` : Math.round(value)}
            </text>
          </g>
        );
      })}

      {/* X aur Y axis lines */}
      <line x1={padding} y1={height - bottomPadding} x2={width - 10} y2={height - bottomPadding} stroke={C.ink} strokeWidth="1.5" />
      <line x1={padding} y1={padding - 10} x2={padding} y2={height - bottomPadding} stroke={C.ink} strokeWidth="1.5" />

      {/* Bars, value labels, date labels */}
      {rows.map((r, idx) => {
        const barHeight = (Number(r.revenue) / niceMax) * chartHeight;
        const x = padding + gap + idx * (barWidth + gap);
        const y = height - bottomPadding - barHeight;
        return (
          <g key={r.period}>
            <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize="11" fontWeight="600" fill={C.ink}>
              {money(r.revenue)}
            </text>
            <rect x={x} y={y} width={barWidth} height={barHeight} fill={C.plum} rx={4} />
            <text x={x + barWidth / 2} y={height - bottomPadding + 18} textAnchor="middle" fontSize="10" fill={C.sub}>
              {r.period}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function EmployeeBar({ employee, max }) {
  const pct = Math.min(100, (Number(employee.revenue) / max) * 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
        <span style={{ fontWeight: 500 }}>{employee.employee}</span>
        <span style={{ color: C.sub }}>{money(employee.revenue)} · {employee.appointments} appts</span>
      </div>
      <div style={{ background: "#F2ECE7", borderRadius: 8, height: 8, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: C.plum, borderRadius: 8 }} />
      </div>
    </div>
  );
}

/* ================= CUSTOMERS ================= */
function Customers({ setLoadError, isMobile }) {
  const [customers, setCustomers] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.getCustomers()
      .then((res) => { if (!cancelled) setCustomers(res.customers || []); })
      .catch((err) => { if (!cancelled) setLoadError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [setLoadError]);

  const vipCount = customers.filter((c) => c.is_vip).length;

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <PageHeader title="Customers" sub="Your client base, ranked by loyalty and spend." />

      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.sub, fontSize: 14 }}>
          <Loader2 className="spinner" size={16} color={C.plum} /> Loading customers…
        </div>
      )}

      {!loading && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 26 }}>
            <div className="vellora-card" style={card}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Users size={20} color="#fff" />
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, fontFamily: fontVoice }}>{customers.length}</div>
              <div style={{ fontSize: 12.5, color: C.sub, marginTop: 4 }}>Total customers</div>
            </div>
            <div className="vellora-card" style={card}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Sparkles size={20} color="#fff" />
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, fontFamily: fontVoice, color: C.gold }}>{vipCount}</div>
              <div style={{ fontSize: 12.5, color: C.sub, marginTop: 4 }}>VIP customers</div>
            </div>
          </div>

          {customers.length === 0 ? (
            <EmptyState icon={Users} title="No customers yet" description="They'll appear here once appointments are marked payment done." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {customers.map((c) => (
                <div key={c.id} className="vellora-card" style={{ ...card, padding: isMobile ? "14px 16px" : "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: c.is_vip ? C.gold : C.goldLight, color: c.is_vip ? "#fff" : C.plum, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 15 }}>
                      {c.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 15, color: C.ink }}>{c.name}</span>
                        {c.is_vip ? (
                          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 8px", borderRadius: 20, backgroundColor: C.goldBg, color: "#997340" }}>VIP</span>
                        ) : null}
                      </div>
                      <div style={{ fontSize: 12.5, color: C.sub, marginTop: 3 }}>{c.phone || "No phone on file"} · Last visit: {c.last_visit_date || "—"}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 24, textAlign: "right" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{c.total_visits}</div>
                      <div style={{ fontSize: 11, color: C.sub }}>Visits</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{money(c.total_spent)}</div>
                      <div style={{ fontSize: 11, color: C.sub }}>Spent</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ================= PAYMENT SETTINGS ================= */
function PaymentSettings({ setPaymentSettings, setLoadError, isMobile }) {
  const [upiId, setUpiId] = useState("");
  const [qrImage, setQrImage] = useState(""); // base64
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.getSettings()
      .then((res) => {
        setUpiId(res.settings?.upi_id || "");
        setQrImage(res.settings?.qr_image_url || "");
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [setLoadError]);

  const readFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => { setQrImage(reader.result); setSaved(false); };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e) => readFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    readFile(e.dataTransfer.files[0]);
  };

  const copyUpi = () => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.updateSettings({ upi_id: upiId, qr_image_url: qrImage });
      setSaved(true);
      if (setPaymentSettings) {
        setPaymentSettings({ upi_id: upiId, qr_image_url: qrImage });
      }
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.sub, fontSize: 14 }}>
        <Loader2 className="spinner" size={16} color={C.plum} /> Loading settings…
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <PageHeader title="Payment Settings" sub="Set up your QR code so clients can pay you directly." />

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr", gap: 24, alignItems: "start" }}>

        {/* LEFT: Form */}
        <div className="vellora-card" style={card}>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: C.ink }}>Your Payment QR Code</h3>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: C.sub }}>Upload once — it'll be shown to clients whenever you collect payment.</p>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            style={{
              position: "relative",
              border: `2px dashed ${dragActive ? C.plum : C.line}`,
              borderRadius: 16,
              padding: qrImage ? 16 : 32,
              textAlign: "center",
              background: dragActive ? C.goldBg : "#FCFAF8",
              transition: "all 0.2s ease",
              marginBottom: 20
            }}
          >
            {qrImage ? (
              <div>
                <img src={qrImage} alt="Payment QR" style={{ width: 160, height: 160, objectFit: "contain", border: `1px solid ${C.line}`, borderRadius: 12, padding: 8, background: "#fff" }} />
                <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14 }}>
                  <label style={{ ...btnGhost, background: C.card, color: C.plum, border: `1px solid ${C.line}`, boxShadow: "none", padding: "8px 16px", cursor: "pointer" }}>
                    Replace
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
                  </label>
                  <button
                    onClick={() => { setQrImage(""); setSaved(false); }}
                    style={{ ...btnGhost, background: C.redBg, color: C.red, boxShadow: "none", padding: "8px 16px" }}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <label style={{ cursor: "pointer", display: "block" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: C.goldLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <ImageIcon size={22} color={C.gold} />
                </div>
                <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: C.ink }}>Drop QR image here</p>
                <p style={{ margin: 0, fontSize: 12.5, color: C.sub }}>or click to browse · PNG, JPG</p>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
              </label>
            )}
          </div>

          <Field label="UPI ID (optional, shown as backup)">
            <div style={{ position: "relative" }}>
              <input
                className="vellora-input"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => { setUpiId(e.target.value); setSaved(false); }}
                style={{ ...inputStyle, paddingRight: upiId ? 44 : 16 }}
              />
              {upiId && (
                <button
                  onClick={copyUpi}
                  title="Copy UPI ID"
                  style={{ position: "absolute", right: 8, top: 8, background: "none", border: "none", cursor: "pointer", color: copied ? C.green : C.sub, padding: 6 }}
                >
                  {copied ? <Check size={16} /> : <Package size={16} style={{ display: "none" }} />}
                  {!copied && <span style={{ fontSize: 11, fontWeight: 600 }}>Copy</span>}
                  {copied && <span style={{ fontSize: 11, fontWeight: 600, marginLeft: 4 }}>Copied</span>}
                </button>
              )}
            </div>
          </Field>

          <button className="vellora-btn" onClick={save} disabled={saving} style={{ ...primaryBtn, width: isMobile ? "100%" : "auto", padding: "12px 32px", opacity: saving ? 0.7 : 1 }}>
            {saving ? <Loader2 className="spinner" size={16} /> : <Check size={16} />}
            {saving ? "Saving..." : "Save Settings"}
          </button>

          {saved && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, padding: "10px 14px", backgroundColor: C.greenBg, borderRadius: 10 }}>
              <Check size={15} color={C.green} />
              <p style={{ color: C.green, fontSize: 13, margin: 0, fontWeight: 500 }}>Settings saved successfully.</p>
            </div>
          )}
        </div>

        {/* RIGHT: Live preview */}
        <div className="vellora-card" style={{ ...card, background: `linear-gradient(160deg, ${C.plum} 0%, #1A101C 100%)`, textAlign: "center", position: "sticky", top: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", margin: "0 0 16px" }}>
            Client-facing preview
          </p>
          {qrImage || upiId ? (
            <div style={{ background: "#fff", borderRadius: 16, padding: "24px 20px" }}>
              {qrImage ? (
                <img src={qrImage} alt="Preview" style={{ width: 160, height: 160, objectFit: "contain", borderRadius: 12, margin: "0 auto" }} />
              ) : (
                <div style={{ padding: "16px 12px", background: "#FCFAF8", borderRadius: 12, border: `1px solid ${C.line}` }}>
                  <p style={{ fontSize: 11, color: C.sub, margin: "0 0 6px", textTransform: "uppercase", fontWeight: 600 }}>UPI ID</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: C.ink, margin: 0 }}>{upiId}</p>
                </div>
              )}
              <p style={{ fontSize: 12, color: C.sub, marginTop: 14, marginBottom: 0 }}>This is what clients scan when you tap "Collect Payment" on a booking.</p>
            </div>
          ) : (
            <div style={{ padding: "32px 16px", border: "1px dashed rgba(255,255,255,0.25)", borderRadius: 12 }}>
              <Wallet size={22} color="rgba(255,255,255,0.4)" style={{ marginBottom: 10 }} />
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12.5, margin: 0 }}>Add a QR code or UPI ID to see the preview.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Settings({ isMobile }) {

  const settingsLabel = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: C.ink,
    marginBottom: 7
  };

  const settingsInput = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: `1px solid ${C.line}`,
    borderRadius: 10,
    background: "#fff",
    color: C.ink,
    fontSize: 13.5,
    outline: "none",
    fontFamily: fontSans
  };

  const [profile, setProfile] = useState({
    salon_name: "",
    owner_name: "",
    phone: "",
    email: "",
    address: "",
    currency: "INR",
    timezone: "Asia/Kolkata",
    opening_time: "10:00",
    closing_time: "20:00",
    allow_online_bookings: true,
    appointment_reminders: true,
    allow_cancellations: true,
    require_customer_phone: true
  });

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    api.getSalonSettings()
      .then((res) => {
        setProfile((prev) => ({
          ...prev,
          salon_name: res.settings?.salon_name || "",
          owner_name: res.settings?.owner_name || "",
          phone: res.settings?.phone || "",
          email: res.settings?.email || "",
          address: res.settings?.address || "",
          currency: res.settings?.currency || "INR",
          timezone: res.settings?.timezone || "Asia/Kolkata",
          opening_time: res.settings?.opening_time || "10:00",
          closing_time: res.settings?.closing_time || "20:00",
          allow_online_bookings: res.settings?.allow_online_bookings ?? true,
          appointment_reminders: res.settings?.appointment_reminders ?? true,
          allow_cancellations: res.settings?.allow_cancellations ?? true,
          require_customer_phone: res.settings?.require_customer_phone ?? true
        }));
      })
      .catch((err) => {
        console.error("Failed to load salon settings:", err);
      })
      .finally(() => setProfileLoading(false));
  }, []);

  const updateProfile = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value
    }));
    setProfileSaved(false);
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    setProfileSaved(false);

    try {
      await api.updateSalonSettings({
        salon_name: profile.salon_name,
        owner_name: profile.owner_name,
        phone: profile.phone,
        email: profile.email,
        address: profile.address,
        currency: profile.currency,
        timezone: profile.timezone,
        opening_time: profile.opening_time,
        closing_time: profile.closing_time,
        allow_online_bookings: profile.allow_online_bookings,
        appointment_reminders: profile.appointment_reminders,
        allow_cancellations: profile.allow_cancellations,
        require_customer_phone: profile.require_customer_phone
      });

      setProfileSaved(true);
    } catch (err) {
      console.error("Failed to save salon settings:", err);
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      <PageHeader
        title="Settings"
        sub="Manage your salon preferences and account settings."
      />

      <div
        className="vellora-card"
        style={{
          ...card,
          padding: 24,
          marginBottom: 20
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 600,
              color: C.ink
            }}
          >
            Salon Settings
          </h3>

          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13.5,
              color: C.sub
            }}
          >
            General settings for your salon.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* SALON PROFILE */}
          <div className="vellora-card" style={{ ...card, padding: 24 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: C.ink }}>
              Salon Profile
            </h3>

            <p style={{ margin: "6px 0 20px", fontSize: 13.5, color: C.sub }}>
              Manage your salon's basic information.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 16
              }}
            >
              <div>
                <label style={settingsLabel}>Salon Name</label>
                <input
                  style={settingsInput}
                  placeholder="Enter salon name"
                  value={profile.salon_name}
                  onChange={(e) => updateProfile("salon_name", e.target.value)}
                  disabled={profileLoading}
                />
              </div>

              <div>
                <label style={settingsLabel}>Owner / Admin Name</label>
                <input
                  style={settingsInput}
                  placeholder="Enter owner name"
                  value={profile.owner_name}
                  onChange={(e) => updateProfile("owner_name", e.target.value)}
                  disabled={profileLoading}
                />
              </div>

              <div>
                <label style={settingsLabel}>Phone Number</label>
                <input
                  style={settingsInput}
                  placeholder="Enter phone number"
                  value={profile.phone}
                  onChange={(e) => updateProfile("phone", e.target.value)}
                  disabled={profileLoading}
                />
              </div>

              <div>
                <label style={settingsLabel}>Email Address</label>
                <input
                  style={settingsInput}
                  placeholder="Enter email address"
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateProfile("email", e.target.value)}
                  disabled={profileLoading}
                />
              </div>

              <div style={{ gridColumn: isMobile ? "auto" : "1 / -1" }}>
                <label style={settingsLabel}>Salon Address</label>
                <textarea
                  style={{ ...settingsInput, minHeight: 90, resize: "vertical" }}
                  placeholder="Enter salon address"
                  value={profile.address}
                  onChange={(e) => updateProfile("address", e.target.value)}
                />
              </div>
            </div>
          </div>


          {/* BUSINESS SETTINGS */}
          <div className="vellora-card" style={{ ...card, padding: 24 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: C.ink }}>
              Business Settings
            </h3>

            <p style={{ margin: "6px 0 20px", fontSize: 13.5, color: C.sub }}>
              Configure your salon's working hours and business preferences.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 16
              }}
            >
              <div>
                <label style={settingsLabel}>Currency</label>
                <select style={settingsInput} value={profile.currency} onChange={(e) => updateProfile("currency", e.target.value)}>
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>

              <div>
                <label style={settingsLabel}>Time Zone</label>
                <select style={settingsInput} value={profile.timezone} onChange={(e) => updateProfile("timezone", e.target.value)}>
                  <option value="Asia/Kolkata">India Standard Time (IST)</option>
                  <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
                </select>
              </div>

              <div>
                <label style={settingsLabel}>Opening Time</label>
                <input type="time" style={settingsInput} value={profile.opening_time} onChange={(e) => updateProfile("opening_time", e.target.value)} />
              </div>

              <div>
                <label style={settingsLabel}>Closing Time</label>
                <input type="time" style={settingsInput} value={profile.closing_time} onChange={(e) => updateProfile("closing_time", e.target.value)} />
              </div>
            </div>
          </div>


          {/* APPOINTMENT SETTINGS */}
          <div className="vellora-card" style={{ ...card, padding: 24 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: C.ink }}>
              Appointment Settings
            </h3>

            <p style={{ margin: "6px 0 20px", fontSize: 13.5, color: C.sub }}>
              Control how appointments are handled in your salon.
            </p>

            {[
              ["Allow Online Bookings", "Customers can book appointments online.", "allow_online_bookings"],
              ["Appointment Reminders", "Send reminders for upcoming appointments.", "appointment_reminders"],
              ["Allow Cancellations", "Allow customers to cancel their appointments.", "allow_cancellations"],
              ["Require Customer Phone", "Require a phone number when creating an appointment.", "require_customer_phone"],
            ].map(([title, description, field]) => (
              <div
                key={title}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  padding: "15px 0",
                  borderTop: `1px solid ${C.line}`
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>
                    {title}
                  </div>
                  <div style={{ fontSize: 12.5, color: C.sub, marginTop: 4 }}>
                    {description}
                  </div>
                </div>

                <div
                  onClick={() => updateProfile(field, !profile[field])}
                  style={{
                    width: 42,
                    height: 23,
                    borderRadius: 20,
                    background: profile[field] ? C.gold : C.line,
                    position: "relative",
                    flexShrink: 0,
                    cursor: "pointer",
                    transition: "background 0.2s"
                  }}
                >
                  <div
                    style={{
                      width: 17,
                      height: 17,
                      borderRadius: "50%",
                      background: "#fff",
                      position: "absolute",
                      top: 3,
                      left: profile[field] ? 22 : 3,
                      transition: "left 0.2s"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>


          {/* NOTIFICATIONS */}
          <div className="vellora-card" style={{ ...card, padding: 24 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: C.ink }}>
              Notifications
            </h3>

            <p style={{ margin: "6px 0 20px", fontSize: 13.5, color: C.sub }}>
              Choose which notifications you want to receive.
            </p>

            {[
              ["New Appointment", "Get notified when a new appointment is created."],
              ["Payment Updates", "Get notified when an appointment payment is completed."],
              ["Low Stock Alerts", "Get notified when inventory reaches its reorder level."],
            ].map(([title, description]) => (
              <div
                key={title}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px 0",
                  borderTop: `1px solid ${C.line}`
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>
                    {title}
                  </div>
                  <div style={{ fontSize: 12.5, color: C.sub, marginTop: 4 }}>
                    {description}
                  </div>
                </div>

                <input
                  type="checkbox"
                  defaultChecked
                  style={{ width: 17, height: 17, accentColor: C.gold, cursor: "pointer" }}
                />
              </div>
            ))}
          </div>


          {/* SECURITY */}
          <div className="vellora-card" style={{ ...card, padding: 24 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: C.ink }}>
              Security
            </h3>

            <p style={{ margin: "6px 0 20px", fontSize: 13.5, color: C.sub }}>
              Manage your account security.
            </p>

            <button
              className="vellora-btn"
              style={{
                background: "transparent",
                border: `1px solid ${C.line}`,
                color: C.ink,
                padding: "11px 18px",
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Change Password
            </button>
          </div>

          {/* SAVE ALL SETTINGS */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <button
              className="vellora-btn"
              onClick={saveProfile}
              disabled={profileSaving || profileLoading}
              style={{
                background: C.plum,
                color: "#fff",
                border: "none",
                padding: "12px 24px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: profileSaving ? "not-allowed" : "pointer",
                opacity: profileSaving ? 0.7 : 1
              }}
            >
              {profileSaving ? "Saving..." : "Save Changes"}
            </button>

            {profileSaved && (
              <span style={{ fontSize: 13, color: "#3D7A52", fontWeight: 500 }}>
                Changes saved successfully
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}