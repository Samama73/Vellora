"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Calendar, Users, Wallet, Package, Image as ImageIcon, LayoutDashboard,
  LogOut, Plus, Trash2, Eye, EyeOff, Scissors, Check, Loader2, ChevronRight
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
        /* Global CSS for Animations and Focus States */
        .vellora-input:focus {
          border-color: ${C.plum} !important;
          box-shadow: 0 0 0 4px rgba(43, 27, 46, 0.08);
          background-color: #FFFFFF !important;
        }
        .vellora-btn:hover:not(:disabled) {
          background-color: ${C.plumHover} !important;
          transform: translateY(-1px);
          box-shadow: 0 10px 25px -8px rgba(43,27,46,0.5) !important;
        }
        .vellora-btn-ghost:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px -8px rgba(43,27,46,0.3) !important;
        }
        .vellora-card {
          transition: all 0.2s ease;
        }
        .vellora-card:hover {
          box-shadow: 0 12px 30px -12px rgba(43,27,46,0.12) !important;
        }
        .vellora-icon-btn:hover {
          background-color: ${C.line} !important;
          color: ${C.red} !important;
        }
        .nav-item:hover {
          background-color: rgba(184,147,95,0.08) !important;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
        
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

const card = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: "24px", boxShadow: "0 4px 14px -10px rgba(43,27,46,0.12)" };

const btnGhost = { display: "flex", alignItems: "center", gap: 6, background: C.plum, color: "#fff", border: "none", padding: "10px 18px", borderRadius: 12, fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: fontSans, boxShadow: "0 6px 16px -8px rgba(43,27,46,0.4)", transition: "all 0.2s ease" };

const iconBtn = { background: "transparent", border: "none", cursor: "pointer", color: C.sub, padding: 8, borderRadius: 8, transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center" };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 13, color: C.ink, marginBottom: 8, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
      <div>
        <h1 style={{ fontFamily: fontVoice, fontSize: 28, fontWeight: 600, margin: 0, color: C.ink }}>{title}</h1>
        {sub && <p style={{ color: C.sub, fontSize: 14.5, margin: "6px 0 0", lineHeight: 1.5 }}>{sub}</p>}
      </div>
      {action}
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
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (mode === "register" && !salonName.trim()) return setError("Please enter your salon's name.");
    if (mode === "register" && !name.trim()) return setError("Please provide your full name.");
    if (!username.trim()) return setError("A username is required to proceed.");
    if (!password || password.length < 4) return setError("Password must be at least 4 characters long.");

    setBusy(true);
    try {
      const res = mode === "register"
        ? await api.register(salonName.trim(), name.trim(), username.trim(), password, email.trim())
        : await api.login(username.trim(), password);
      onAuthed(res.token, res.user);
    } catch (err) {
      setError(err.message || "Authentication failed. Please verify your credentials and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: C.ivory, fontFamily: fontSans }}>
      <GlobalFonts />
      <div style={{ flex: 1, background: `linear-gradient(145deg, ${C.plum} 0%, #1A101C 100%)`, color: C.goldLight, display: "flex", flexDirection: "column", justifyContent: "center", padding: "5vw", minWidth: 0, position: "relative", overflow: "hidden" }}>
        {/* Decorative background element */}
        <div style={{ position: "absolute", top: "-10%", right: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(184,147,95,0.15) 0%, rgba(0,0,0,0) 70%)", borderRadius: "50%" }}></div>
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
            <div style={{ background: "rgba(184,147,95,0.15)", padding: 12, borderRadius: 16 }}>
              <Scissors size={32} color={C.gold} />
            </div>
            <div>
              <span style={{ fontFamily: fontVoice, fontSize: 32, fontWeight: 600, letterSpacing: 0.5, color: "#fff" }}>Vellora</span>
              <span style={{ fontFamily: fontSans, fontSize: 12, color: "rgba(255,255,255,0.6)", marginLeft: 10, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 500 }}>
                by Salon Chair Wala
              </span>
            </div>
          </div>
          <h1 style={{ fontFamily: fontVoice, fontSize: "clamp(32px, 4.5vw, 52px)", lineHeight: 1.1, fontWeight: 500, margin: 0, maxWidth: 540, color: "#fff" }}>
            Elevate your salon management experience.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, marginTop: 24, maxWidth: 460, lineHeight: 1.6 }}>
            Seamlessly control appointments, inventory, and payroll from a single, beautifully designed dashboard—accessible anywhere, anytime.
          </p>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "#F2ECE7", padding: 6, borderRadius: 14 }}>
            {[["login", "Sign In"], ["register", "Register Salon"]].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
                flex: 1, padding: "10px 8px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13.5,
                fontWeight: 600, fontFamily: fontSans, background: mode === m ? C.card : "transparent",
                color: mode === m ? C.plum : C.sub, boxShadow: mode === m ? "0 4px 12px -4px rgba(43,27,46,0.15)" : "none",
                transition: "all 0.2s ease"
              }}>{label}</button>
            ))}
          </div>

          <form onSubmit={submit} style={{ width: "100%", background: C.card, borderRadius: 24, padding: "40px", border: `1px solid ${C.line}`, boxShadow: "0 24px 50px -20px rgba(43,27,46,0.08)" }}>
            <h2 style={{ fontFamily: fontVoice, fontSize: 26, fontWeight: 600, color: C.ink, margin: "0 0 8px" }}>
              {mode === "register" ? "Create your account" : "Welcome back"}
            </h2>
            <p style={{ color: C.sub, fontSize: 14.5, margin: "0 0 32px", lineHeight: 1.5 }}>
              {mode === "register" ? "Set up your digital workspace to manage your salon efficiently." : "Enter your credentials to access your dashboard."}
            </p>

            {mode === "register" && (
              <>
                <Field label="Salon Name">
                  <input className="vellora-input" value={salonName} onChange={(e) => setSalonName(e.target.value)} placeholder="e.g. Elegance Studio" style={inputStyle} />
                </Field>
                <Field label="Full Name">
                  <input className="vellora-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jane Doe" style={inputStyle} />
                </Field>
                <Field label="Email Address">
                  <input className="vellora-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" style={inputStyle} />
                </Field>
              </>
            )}
            <Field label="Username">
              <input className="vellora-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" style={inputStyle} />
            </Field>
            <Field label="Password">
              <div style={{ position: "relative" }}>
                <input className="vellora-input" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw((s) => !s)} style={{ position: "absolute", right: 12, top: 12, background: "none", border: "none", cursor: "pointer", color: C.sub, transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = C.plum} onMouseOut={(e) => e.currentTarget.style.color = C.sub}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>

            {error && (
              <div style={{ padding: "12px 14px", backgroundColor: C.redBg, borderLeft: `4px solid ${C.red}`, borderRadius: 8, marginBottom: 20 }}>
                <p style={{ color: C.red, fontSize: 13.5, margin: 0, fontWeight: 500 }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={busy} className="vellora-btn" style={{ ...primaryBtn, marginTop: 24, opacity: busy ? 0.8 : 1 }}>
              {busy ? <Loader2 className="spinner" size={18} /> : null}
              {busy ? "Authenticating..." : mode === "register" ? "Register Salon" : "Sign In"}
            </button>

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

  const isMobile = useIsMobile();
  const touchStartX = useRef(null);

  useEffect(() => {
    const existing = loadSession();
    if (existing) setSession(existing);
    setCheckingSession(false);
  }, []);

  const loadAllData = useCallback(async () => {
    setLoadingData(true);
    setLoadError("");
    try {
      const [a, i, s, e] = await Promise.all([
        api.getAppointments(), api.getInventory(), api.getSalaries(), api.getEmployees(),
      ]);
      setAppts(a.appointments || []);
      setInventory(i.inventory || []);
      setSalaries(s.salaries || []);
      setEmployees(e.employees || []);
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "32px 24px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "rgba(184,147,95,0.15)", padding: 8, borderRadius: 10 }}>
            <Scissors size={20} color={C.gold} />
          </div>
          <span style={{ fontFamily: fontVoice, fontSize: 22, fontWeight: 600, letterSpacing: 0.5 }}>Vellora</span>
        </div>
        {isMobile && (
          <button onClick={() => setDrawerOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 24, cursor: "pointer", padding: 4 }}>✕</button>
        )}
      </div>
      <nav style={{ flex: 1, padding: "8px 16px" }}>
        {visibleNav.map((n) => {
          const Icon = n.icon;
          const active = tab === n.id;
          return (
            <button
              key={n.id}
              className="nav-item"
              onClick={() => { setTab(n.id); setDrawerOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 16px",
                marginBottom: 6, borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14.5,
                fontFamily: fontSans, textAlign: "left", fontWeight: active ? 600 : 500,
                background: active ? "rgba(184,147,95,0.15)" : "transparent",
                color: active ? C.gold : "rgba(255,255,255,0.7)",
                transition: "all 0.2s ease"
              }}
            >
              <Icon size={18} /> {n.label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: 24, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", color: C.plum, fontWeight: 600, fontSize: 14 }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{user.name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{user.salonName || (user.role === "superadmin" ? "System Administrator" : "Salon Administrator")}</div>
          </div>
        </div>
        <button className="vellora-btn" onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)", padding: "12px", borderRadius: 12, fontSize: 13.5, fontWeight: 500, cursor: "pointer", width: "100%", justifyContent: "center", transition: "all 0.2s ease" }}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: C.ivory, fontFamily: fontSans, color: C.ink }}>
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

      <main onTouchStart={isMobile ? handleTouchStart : undefined} onTouchEnd={isMobile ? handleTouchEnd : undefined} style={{ flex: 1, padding: isMobile ? "20px 20px calc(90px + env(safe-area-inset-bottom))" : "40px 48px", overflowY: "auto", minWidth: 0, width: "100%" }}>
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${C.line}` }}>
            <button onClick={() => setDrawerOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: C.ink, padding: 4 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Scissors size={20} color={C.gold} />
              <span style={{ fontFamily: fontVoice, fontSize: 18, fontWeight: 600 }}>Vellora</span>
            </div>
            <div style={{ width: 28 }} />
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

        {tab === "dashboard" && <Dashboard appts={appts} inventory={inventory} employees={employees} isMobile={isMobile} />}
        {tab === "appointments" && <Appointments appts={appts} setAppts={setAppts} setLoadError={setLoadError} isMobile={isMobile} />}
        {tab === "marketing" && <Marketing user={user} isMobile={isMobile} />}
        {tab === "accounts" && <Accounts salaries={salaries} setSalaries={setSalaries} employees={employees} setLoadError={setLoadError} isMobile={isMobile} />}
        {tab === "team" && <Team employees={employees} setEmployees={setEmployees} inventory={inventory} setInventory={setInventory} setLoadError={setLoadError} isMobile={isMobile} />}
        {tab === "superadmin" && <SuperAdminPanel token={session.token} />}
      </main>

      {isMobile && (
        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-around", padding: "12px 8px env(safe-area-inset-bottom)", zIndex: 30, boxShadow: "0 -8px 24px rgba(0,0,0,0.04)" }}>
          {visibleNav.slice(0, 5).map((n) => {
            const Icon = n.icon;
            const active = tab === n.id;
            return (
              <button key={n.id} onClick={() => setTab(n.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: active ? C.plum : C.sub, padding: "4px 8px", transition: "all 0.2s" }}>
                <Icon size={22} color={active ? C.plum : C.sub} />
                <span style={{ fontSize: 11, fontWeight: active ? 600 : 500 }}>{n.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

/* ================= DASHBOARD ================= */
function Dashboard({ appts, inventory, employees, isMobile }) {
  const today = todayISO();
  const todayCount = appts.filter((a) => a.date?.slice(0, 10) === today).length;
  const monthRevenue = appts
    .filter((a) => a.date?.slice(0, 7) === today.slice(0, 7) && a.status === "payment done")
    .reduce((s, a) => s + Number(a.price || 0), 0);
  const lowStock = inventory.filter((i) => Number(i.qty) <= Number(i.reorder_level || 0));

  const stats = [
    { label: "Today's Appointments", value: todayCount, icon: Calendar },
    { label: "Monthly Revenue", value: money(monthRevenue), icon: Wallet },
    { label: "Active Staff", value: employees.length, icon: Users },
    { label: "Items Low in Stock", value: lowStock.length, icon: Package },
  ];

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      <PageHeader title="Dashboard Overview" sub="A comprehensive look at your salon's performance today." />
      
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 32 }}>
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="vellora-card" style={{ ...card, padding: "24px 20px" }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: C.goldLight, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Icon size={20} color={C.gold} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 600, fontFamily: fontVoice, color: C.ink }}>{s.value}</div>
              <div style={{ fontSize: 13.5, color: C.sub, marginTop: 6, fontWeight: 500 }}>{s.label}</div>
            </div>
          );
        })}
      </div>
      
      <div className="vellora-card" style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.ink }}>Upcoming Schedule</h3>
        </div>
        
        {appts.filter((a) => a.date >= today).slice(0, 5).length === 0 ? (
          <div style={{ padding: "32px 0", textAlign: "center", background: "#FCFAF8", borderRadius: 12, border: `1px dashed ${C.line}` }}>
            <Calendar size={24} color={C.sub} style={{ marginBottom: 12 }} />
            <p style={{ color: C.sub, fontSize: 14, margin: 0 }}>No upcoming appointments scheduled.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {appts.filter((a) => a.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5).map((a, i) => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderTop: i === 0 ? "none" : `1px solid ${C.line}` }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14.5, color: C.ink }}>{a.client}</div>
                  <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>{a.service}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: C.ink }}>{a.time}</div>
                  <div style={{ fontSize: 12.5, color: C.sub, marginTop: 4 }}>{a.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
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

function Appointments({ appts, setAppts, setLoadError, isMobile }) {
  const [showForm, setShowForm] = useState(false);
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

  const setStatus = async (id, status) => {
    const prev = appts;
    setAppts(appts.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      await api.updateAppointmentStatus(id, status);
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

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {appts.length === 0 && (
          <div style={{ padding: "48px 0", textAlign: "center", background: C.card, borderRadius: 16, border: `1px dashed ${C.line}` }}>
            <Calendar size={32} color={C.line} style={{ marginBottom: 16 }} />
            <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 500, color: C.ink }}>No appointments found</h3>
            <p style={{ color: C.sub, fontSize: 14, margin: 0 }}>Your schedule is currently empty.</p>
          </div>
        )}
        {[...appts].sort((a, b) => b.date.localeCompare(a.date)).map((a) => {
          const badge = getStatusBadge(a.status);
          return (
            <div key={a.id} className="vellora-card" style={{ ...card, padding: isMobile ? "16px" : "20px 24px", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 16, color: C.ink }}>{a.client}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, padding: "4px 10px", borderRadius: 20, backgroundColor: badge.bg, color: badge.text }}>
                    {a.status}
                  </span>
                </div>
                <div style={{ fontWeight: 500, fontSize: 14, color: C.plum, marginBottom: 4 }}>{a.service}</div>
                <div style={{ fontSize: 13, color: C.sub, display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  <span><Calendar size={12} style={{display:"inline", verticalAlign:"-1px", marginRight:4}}/>{a.date} at {a.time}</span>
                  {a.phone && <span>· {a.phone}</span>}
                  {a.employee && <span>· Staff: {a.employee}</span>}
                  {a.price && <span style={{ fontWeight: 600, color: C.ink }}>· {money(a.price)}</span>}
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: isMobile ? "space-between" : "flex-end", marginTop: isMobile ? 8 : 0, paddingTop: isMobile ? 12 : 0, borderTop: isMobile ? `1px solid ${C.line}` : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.sub, textTransform: "uppercase" }}>Update Status</label>
                  <select className="vellora-input" value={a.status} onChange={(e) => setStatus(a.id, e.target.value)} style={{ ...inputStyle, padding: "8px 32px 8px 12px", fontSize: 13, fontWeight: 500, width: "auto", minWidth: 140, cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236B6070%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px top 50%", backgroundSize: "10px auto" }}>
                    {APPT_STATUS.map((s) => <option key={s} value={s}>{s.replace(/^\w/, (c) => c.toUpperCase())}</option>)}
                  </select>
                </div>
                <button className="vellora-icon-btn" style={{...iconBtn, marginTop: 18}} onClick={() => remove(a.id)} title="Delete Appointment"><Trash2 size={18} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= MARKETING ================= */
const MARKETING_TEMPLATES = [
  { id: "t1", image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&q=80", caption: "Book your next premium experience with us today." },
  { id: "t2", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80", caption: "Fresh looks, expert hands — precision in every visit." },
  { id: "t3", image: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=600&q=80", caption: "Indulge in luxury. Pamper yourself, you deserve it." },
  { id: "t4", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&q=80", caption: "New season, refined style. Walk in and transform today." },
];

function Marketing({ user }) {
  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <PageHeader title="Marketing Hub" sub="Professional, ready-to-share promotional assets branded for your salon." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
        {MARKETING_TEMPLATES.map((t) => (
          <div key={t.id} className="vellora-card" style={{ ...card, padding: 0, overflow: "hidden", border: "none", boxShadow: "0 8px 24px -12px rgba(43,27,46,0.2)" }}>
            <div style={{ position: "relative", overflow: "hidden" }}>
              <div style={{ width: "100%", height: 200, backgroundImage: `url(${t.image})`, backgroundSize: "cover", backgroundPosition: "center", transition: "transform 0.4s ease" }} className="marketing-img" onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"} onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"} />
              
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(26,18,28,0) 30%, rgba(26,18,28,0.85) 100%)", display: "flex", alignItems: "flex-end", padding: 20, pointerEvents: "none" }}>
                <span style={{ fontFamily: fontVoice, color: "#fff", fontSize: 22, fontWeight: 600, letterSpacing: 0.5, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                  {user.salonName || "Your Salon"}
                </span>
              </div>
            </div>
            <div style={{ padding: "20px" }}>
              <p style={{ fontSize: 14.5, margin: 0, lineHeight: 1.6, color: C.ink, fontWeight: 500 }}>{t.caption}</p>
              <button className="vellora-btn-ghost" style={{ ...btnGhost, width: "100%", justifyContent: "center", marginTop: 16, background: C.goldLight, color: "#997340", boxShadow: "none" }}>
                Share Post
              </button>
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
           <div style={{ padding: "48px 0", textAlign: "center", background: C.card, borderRadius: 16, border: `1px dashed ${C.line}` }}>
             <Wallet size={32} color={C.line} style={{ marginBottom: 16 }} />
             <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 500, color: C.ink }}>No records found</h3>
             <p style={{ color: C.sub, fontSize: 14, margin: 0 }}>Financial transactions will appear here.</p>
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
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: C.ink }}>Onboard New Staff Member</h3>
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
            {employees.length === 0 && <p style={{ color: C.sub, fontSize: 14, gridColumn: "1/-1", textAlign: "center", padding: 32 }}>No staff members registered.</p>}
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
               <div style={{ padding: "48px 0", textAlign: "center", background: C.card, borderRadius: 16, border: `1px dashed ${C.line}` }}>
                 <Package size={32} color={C.line} style={{ marginBottom: 16 }} />
                 <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 500, color: C.ink }}>Inventory is empty</h3>
                 <p style={{ color: C.sub, fontSize: 14, margin: 0 }}>Add products to start tracking your stock.</p>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/superadmin", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setSalons(data.salons);
        else setError(data.error);
      } catch {
        setError("Failed to establish secure connection with the administration database.");
      }
      setLoading(false);
    })();
  }, [token]);

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <PageHeader title="Global Administration" sub="Overview of all registered salons and their key performance metrics." />
      
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
      
      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
      )}
    </div>
  );
}