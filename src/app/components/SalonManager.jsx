"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Calendar, Users, Wallet, Package, Image as ImageIcon, LayoutDashboard,
  LogOut, Plus, Trash2, Eye, EyeOff, Scissors, Check
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

/* ---------- palette ---------- */
const C = {
  plum: "#2B1B2E", gold: "#B8935F", goldLight: "#EADFCB", ivory: "#FAF6F1",
  card: "#FFFFFF", ink: "#2B1B2E", sub: "#75697A", line: "#E8E0DC",
  green: "#5E7C56", red: "#B5474A",
};
const fontVoice = "'Fraunces', Georgia, serif";
const fontSans = "'Inter', system-ui, sans-serif";

function GlobalFonts() {
  return <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" />;
}

const inputStyle = {
  width: "100%", padding: "11px 14px", fontSize: 14.5, borderRadius: 14,
  border: `1.5px solid ${C.line}`, outline: "none", fontFamily: fontSans, color: C.ink,
  boxSizing: "border-box", background: "#FCFAF8",
};
const primaryBtn = {
  width: "100%", padding: "12px 0", background: C.plum, color: "#fff", border: "none",
  borderRadius: 14, fontSize: 14.5, fontWeight: 500, cursor: "pointer", fontFamily: fontSans,
  marginTop: 6, boxShadow: "0 8px 20px -8px rgba(43,27,46,0.45)",
};
const card = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 20, padding: "20px 22px", boxShadow: "0 6px 20px -12px rgba(43,27,46,0.18)" };
const btnGhost = { display: "flex", alignItems: "center", gap: 6, background: C.plum, color: "#fff", border: "none", padding: "10px 16px", borderRadius: 14, fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: fontSans, boxShadow: "0 8px 18px -8px rgba(43,27,46,0.4)" };
const iconBtn = { background: "none", border: "none", cursor: "pointer", color: C.sub, padding: 6, borderRadius: 8 };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12.5, color: C.sub, marginBottom: 6, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}
function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
      <div>
        <h1 style={{ fontFamily: fontVoice, fontSize: 26, fontWeight: 500, margin: 0 }}>{title}</h1>
        {sub && <p style={{ color: C.sub, fontSize: 13.5, margin: "4px 0 0" }}>{sub}</p>}
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
      setStatus(res.message || "Reset link has been sent at your registered email address.");
    } catch (err) {
      setStatus(err.message || "Something went wrong.");
    }
    setBusy(false);
  };

  if (!open) {
    return (
      <p style={{ fontSize: 12.5, color: C.plum, marginTop: 12, textAlign: "center", cursor: "pointer" }} onClick={() => setOpen(true)}>
        Forgot password?
      </p>
    );
  }

  return (
    <div style={{ marginTop: 14, padding: 14, background: "#F7F2EE", borderRadius: 14 }}>
      <p style={{ fontSize: 12.5, color: C.sub, marginBottom: 8 }}>Enter your registered email.</p>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="" style={inputStyle} />
      <button onClick={submit} disabled={busy} style={{ ...primaryBtn, marginTop: 10, opacity: busy ? 0.7 : 1 }}>
        {busy ? "Sending…" : "Send reset link"}
      </button>
      {status && <p style={{ fontSize: 12, color: C.green, marginTop: 8 }}>{status}</p>}
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
    if (mode === "register" && !salonName.trim()) return setError("Please enter your salon name.");
    if (mode === "register" && !name.trim()) return setError("Please enter your full name.");
    if (!username.trim()) return setError("Please enter a username.");
    if (!password || password.length < 4) return setError("Password must be at least 4 characters.");

    setBusy(true);
    try {
      const res = mode === "register"
        ? await api.register(salonName.trim(), name.trim(), username.trim(), password, email.trim())
        : await api.login(username.trim(), password);
      onAuthed(res.token, res.user);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: C.ivory, fontFamily: fontSans }}>
      <GlobalFonts />
      <div style={{ flex: 1, background: `linear-gradient(155deg, ${C.plum} 0%, #241823 100%)`, color: C.goldLight, display: "flex", flexDirection: "column", justifyContent: "center", padding: "5vw", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <Scissors size={40} color={C.gold} />
          <div>
            <span style={{ fontFamily: fontVoice, fontSize: 34, fontWeight: 500, letterSpacing: 0.5 }}>Vellora</span>
            <span style={{ fontFamily: fontSans, fontSize: 12, color: "#C9BBC9", marginLeft: 8, letterSpacing: 0.3 }}>
              by Salon Chair Wala
            </span>
          </div>
        </div>
        <h1 style={{ fontFamily: fontVoice, fontSize: "clamp(28px,4vw,46px)", lineHeight: 1.15, fontWeight: 500, margin: 0, maxWidth: 480 }}>
          Your entire salon, managed in one place.
        </h1>
        <p style={{ color: "#C9BBC9", fontSize: 15, marginTop: 18, maxWidth: 400, lineHeight: 1.7 }}>
          Appointments, marketing, payroll and inventory — all in your control, whether you're on your laptop or your phone.
        </p>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#EFE7E1", padding: 4, borderRadius: 14 }}>
            {[["login", "Login"], ["register", "Register your salon"]].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
                flex: 1, padding: "9px 6px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12.5,
                fontWeight: 500, fontFamily: fontSans, background: mode === m ? C.card : "transparent",
                color: mode === m ? C.plum : C.sub, boxShadow: mode === m ? "0 4px 10px -4px rgba(43,27,46,0.25)" : "none",
              }}>{label}</button>
            ))}
          </div>

          <form onSubmit={submit} style={{ width: "100%", background: C.card, borderRadius: 24, padding: "36px 36px", border: `1px solid ${C.line}`, boxShadow: "0 20px 45px -20px rgba(43,27,46,0.25)" }}>
            <h2 style={{ fontFamily: fontVoice, fontSize: 24, fontWeight: 500, color: C.ink, margin: "0 0 6px" }}>
              {mode === "register" ? "Register your salon" : "Log in"}
            </h2>
            <p style={{ color: C.sub, fontSize: 13.5, margin: "0 0 24px" }}>
              {mode === "register" ? "Create a new account for your salon." : "Enter your username and password."}
            </p>

            {mode === "register" && (
              <>
                <Field label="Salon name">
                  <input value={salonName} onChange={(e) => setSalonName(e.target.value)} placeholder="Enter your Salon Name" style={inputStyle} />
                </Field>
                <Field label="Your full name">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your Full Name" style={inputStyle} />
                </Field>
                <Field label="Email">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" style={inputStyle} />
                </Field>
              </>
            )}
            <Field label="Username">
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" style={inputStyle} />
            </Field>
            <Field label="Password">
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPw((s) => !s)} style={{ position: "absolute", right: 10, top: 9, background: "none", border: "none", cursor: "pointer", color: C.sub }}>
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Field>

            {error && <p style={{ color: C.red, fontSize: 13, margin: "4px 0 12px" }}>{error}</p>}

            <button type="submit" disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.7 : 1 }}>
              {busy ? "Please wait…" : mode === "register" ? "Register salon" : "Log in"}
            </button>

            {mode === "login" && (
              <p style={{ fontSize: 12.5, color: C.sub, marginTop: 18, textAlign: "center" }}>
                Are you an employee? Ask your salon owner for your username and password.
              </p>
            )}
            {mode === "login" && (
              <ForgotPasswordLink />
            )}
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
  { id: "team", label: "Team & inventory", icon: Package, roles: ["admin", "superadmin"] },
  { id: "superadmin", label: "All Salons", icon: Users, roles: ["superadmin"] }
];

export default function SalonManager() {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [loadingData, setLoadingData] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false); // NAYA — mobile drawer ke liye

  const [appts, setAppts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);

  const isMobile = useIsMobile(); // NAYA
  const touchStartX = useRef(null); // FIX: ye ab yahan hai — sab hooks ke saath, kisi return se pehle

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
      setLoadError(err.message || "Could not load your data.");
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
    return <div style={{ minHeight: "100vh", background: C.ivory, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontSans, color: C.sub }}>Loading…</div>;
  }
  if (!session) return <LoginScreen onAuthed={handleAuthed} />;

  const { user } = session;
  const visibleNav = NAV.filter((n) => n.roles.includes(user.role));

  // FIX: useRef yahan se hata diya (upar move kar diya), ye sab normal variables/functions hain, hooks nahi — yahan rehna sahi hai
  const tabOrder = visibleNav.map((n) => n.id); // sirf wahi tabs jo is role ko dikhte hain

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || !isMobile) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = 60; // kam se kam itna swipe zaroori, chhoti accidental swipes ignore ho jaayengi

    if (Math.abs(deltaX) > threshold) {
      const currentIndex = tabOrder.indexOf(tab);
      if (deltaX < 0 && currentIndex < tabOrder.length - 1) {
        setTab(tabOrder[currentIndex + 1]); // left swipe → agla tab
      } else if (deltaX > 0 && currentIndex > 0) {
        setTab(tabOrder[currentIndex - 1]); // right swipe → pichla tab
      }
    }
    touchStartX.current = null;
  };

  const SidebarContent = (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 20px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Scissors size={20} color={C.gold} />
          <span style={{ fontFamily: fontVoice, fontSize: 18, fontWeight: 500 }}>Vellora</span>
        </div>
        {isMobile && (
          <button onClick={() => setDrawerOpen(false)} style={{ background: "none", border: "none", color: "#D9CFDA", fontSize: 20, cursor: "pointer", padding: 4 }}>✕</button>
        )}
      </div>
      <nav style={{ flex: 1, padding: "6px 12px" }}>
        {visibleNav.map((n) => {
          const Icon = n.icon;
          const active = tab === n.id;
          return (
            <button
              key={n.id}
              onClick={() => { setTab(n.id); setDrawerOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 14px",
                marginBottom: 5, borderRadius: 14, border: "none", cursor: "pointer", fontSize: 14,
                fontFamily: fontSans, textAlign: "left",
                background: active ? "rgba(184,147,95,0.18)" : "transparent",
                color: active ? C.gold : "#D9CFDA",
              }}
            >
              <Icon size={16} /> {n.label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{user.name}</div>
        <div style={{ fontSize: 11.5, color: "#B5A6B7", marginBottom: 10 }}>{user.salonName || (user.role === "superadmin" ? "Super Admin" : "Salon owner")}</div>
        <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#D9CFDA", padding: "10px", borderRadius: 12, fontSize: 12.5, cursor: "pointer", width: "100%", justifyContent: "center" }}>
          <LogOut size={13} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: C.ivory, fontFamily: fontSans, color: C.ink }}>
      <GlobalFonts />

      {/* DESKTOP: fixed sidebar. MOBILE: hidden, drawer se khulta hai */}
      {!isMobile && (
        <aside style={{ width: 230, background: C.plum, color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {SidebarContent}
        </aside>
      )}

      {/* MOBILE: drawer overlay */}
      {isMobile && drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            style={{ width: 250, height: "100%", background: C.plum, color: "#fff", display: "flex", flexDirection: "column", position: "absolute", left: 0, top: 0, boxShadow: "8px 0 24px rgba(0,0,0,0.3)" }}
          >
            {SidebarContent}
          </aside>
        </div>
      )}

      <main onTouchStart={isMobile ? handleTouchStart : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined} style={{ flex: 1, padding: isMobile ? "16px 16px calc(80px + env(safe-area-inset-bottom))" : "28px 36px", overflowY: "auto", minWidth: 0, width: "100%" }}>
        {/* MOBILE: top bar with hamburger */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <button onClick={() => setDrawerOpen(true)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.ink, padding: 6 }}>☰</button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Scissors size={18} color={C.gold} />
              <span style={{ fontFamily: fontVoice, fontSize: 16, fontWeight: 500 }}>Vellora</span>
            </div>
            <div style={{ width: 28 }} /> {/* spacing balance ke liye */}
          </div>
        )}

        {loadError && (
          <div style={{ ...card, borderColor: C.red, marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span style={{ color: C.red, fontSize: 13.5 }}>{loadError}</span>
            <button style={btnGhost} onClick={loadAllData}>Retry</button>
          </div>
        )}
        {loadingData && !loadError && <p style={{ color: C.sub, fontSize: 13.5, marginBottom: 16 }}>Loading your data…</p>}

        {tab === "dashboard" && <Dashboard appts={appts} inventory={inventory} employees={employees} isMobile={isMobile} />}
        {tab === "appointments" && <Appointments appts={appts} setAppts={setAppts} setLoadError={setLoadError} isMobile={isMobile} />}
        {tab === "marketing" && <Marketing user={user} isMobile={isMobile} />}
        {tab === "accounts" && <Accounts salaries={salaries} setSalaries={setSalaries} employees={employees} setLoadError={setLoadError} isMobile={isMobile} />}
        {tab === "team" && <Team employees={employees} setEmployees={setEmployees} inventory={inventory} setInventory={setInventory} setLoadError={setLoadError} isMobile={isMobile} />}
        {tab === "superadmin" && <SuperAdminPanel token={session.token} />}
      </main>

      {/* MOBILE: bottom tab bar (jaldi navigation ke liye, drawer ke alawa) */}
      {isMobile && (
        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-around", padding: "8px 0", zIndex: 30, boxShadow: "0 -4px 14px rgba(0,0,0,0.06)" }}>
          {visibleNav.slice(0, 5).map((n) => {
            const Icon = n.icon;
            const active = tab === n.id;
            return (
              <button key={n.id} onClick={() => setTab(n.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", color: active ? C.plum : C.sub, padding: "4px 10px" }}>
                <Icon size={20} />
                <span style={{ fontSize: 10 }}>{n.label.split(" ")[0]}</span>
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
    { label: "Today's appointments", value: todayCount, icon: Calendar },
    { label: "Revenue this month", value: money(monthRevenue), icon: Wallet },
    { label: "Total employees", value: employees.length, icon: Users },
    { label: "Low stock items", value: lowStock.length, icon: Package },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" sub="Today's overview of your salon." />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 26 }}>
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={card}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: C.goldLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={17} color={C.gold} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 500, fontFamily: fontVoice, marginTop: 12 }}>{s.value}</div>
              <div style={{ fontSize: 12.5, color: C.sub, marginTop: 4 }}>{s.label}</div>
            </div>
          );
        })}
      </div>
      <div style={card}>
        <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 500 }}>Upcoming appointments</h3>
        {appts.filter((a) => a.date >= today).slice(0, 5).length === 0 && <p style={{ color: C.sub, fontSize: 13 }}>No upcoming appointments.</p>}
        {appts.filter((a) => a.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5).map((a) => (
          <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: `1px solid ${C.line}`, fontSize: 13.5 }}>
            <span>{a.client} — {a.service}</span>
            <span style={{ color: C.sub }}>{a.date} {a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= APPOINTMENTS ================= */
const APPT_STATUS = ["not visited", "visited", "payment pending", "payment done"];
const statusColor = (v) => ({ "not visited": C.sub, visited: C.gold, "payment pending": C.red, "payment done": C.green }[v] || C.sub);

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
      setLoadError(err.message);
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
      setLoadError(err.message);
    }
  };

  const remove = async (id) => {
    const prev = appts;
    setAppts(appts.filter((a) => a.id !== id));
    try {
      await api.deleteAppointment(id);
    } catch (err) {
      setAppts(prev);
      setLoadError(err.message);
    }
  };

  return (
    <div>
      <PageHeader title="Appointments" sub="Manage client bookings and payments."
        action={<button style={btnGhost} onClick={() => setShowForm((s) => !s)}><Plus size={15} /> New appointment</button>} />

      {showForm && (
        <div style={{ ...card, marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
            <input placeholder="Customer name" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} style={inputStyle} />
            <input placeholder="Customer phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
            <input placeholder="Service (e.g. Haircut)" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} style={inputStyle} />
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inputStyle} />
            <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} style={inputStyle} />
            <input placeholder="Assign employee" value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} style={inputStyle} />
            <input placeholder="Price (₹)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={inputStyle} />
          </div>
          <button style={{ ...btnGhost, marginTop: 14, opacity: saving ? 0.7 : 1 }} onClick={add} disabled={saving}>
            <Check size={15} /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {appts.length === 0 && <p style={{ color: C.sub, fontSize: 13.5 }}>No appointments yet.</p>}
        {[...appts].sort((a, b) => b.date.localeCompare(a.date)).map((a) => (
          <div key={a.id} style={{ ...card, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", padding: isMobile ? "14px" : "14px 18px", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14.5 }}>{a.client} · {a.service}</div>
              <div style={{ fontSize: 12.5, color: C.sub, marginTop: 2 }}>
                {a.date} at {a.time} {a.phone && `· ${a.phone}`} {a.employee && `· ${a.employee}`} {a.price ? `· ${money(a.price)}` : ""}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select value={a.status} onChange={(e) => setStatus(a.id, e.target.value)} style={{ ...inputStyle, width: "auto", padding: "6px 10px", fontSize: 12.5, color: statusColor(a.status), fontWeight: 500 }}>
                {APPT_STATUS.map((s) => <option key={s} value={s}>{s.replace(/^\w/, (c) => c.toUpperCase())}</option>)}
              </select>
              <button style={iconBtn} onClick={() => remove(a.id)}><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= MARKETING ================= */
const MARKETING_TEMPLATES = [
  { id: "t1", image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&q=80", caption: "Book your next appointment with us today." },
  { id: "t2", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80", caption: "Fresh looks, expert hands — every visit." },
  { id: "t3", image: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=600&q=80", caption: "Pamper yourself, you deserve it." },
  { id: "t4", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&q=80", caption: "New season, new style. Walk in today." },
];

function Marketing({ user }) {
  return (
    <div>
      <PageHeader title="Marketing" sub="Ready-to-share promotional posts, branded with your salon name." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
        {MARKETING_TEMPLATES.map((t) => (
          <div key={t.id} style={{ ...card, padding: 0, overflow: "hidden" }}>
            <div style={{ position: "relative" }}>
              <img src={t.image} alt="" style={{ width: "100%", height: 160, objectFit: "cover", display: "block", borderRadius: "20px 20px 0 0" }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "20px 20px 0 0", background: "linear-gradient(180deg, rgba(43,27,46,0) 40%, rgba(43,27,46,0.75) 100%)", display: "flex", alignItems: "flex-end", padding: 14 }}>
                <span style={{ fontFamily: fontVoice, color: "#fff", fontSize: 19, fontWeight: 500, letterSpacing: 0.3 }}>
                  {user.salonName || "Your Salon"}
                </span>
              </div>
            </div>
            <div style={{ padding: 14 }}>
              <p style={{ fontSize: 13.5, margin: 0, lineHeight: 1.5, color: C.sub }}>{t.caption}</p>
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
      setLoadError(err.message);
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
      setLoadError(err.message);
    }
  };

  const nameOf = (id) => employees.find((e) => e.id === id)?.name || "—";
  const totalPaid = salaries.reduce((s, x) => s + Number(x.amount || 0), 0);

  return (
    <div>
      <PageHeader title="Accounts & expenses" sub="Track payroll and other salon expenses."
        action={<div style={{ ...card, padding: "10px 16px" }}><span style={{ fontSize: 12, color: C.sub }}>Total payout</span><div style={{ fontFamily: fontVoice, fontSize: 18, fontWeight: 500 }}>{money(totalPaid)}</div></div>} />

      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={inputStyle}>
            <option value="Salary">Salary</option>
            <option value="Expense">Expense</option>
            <option value="Other">Other</option>
          </select>
          <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} style={inputStyle}>
            <option value="">Employee (optional)</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <input placeholder="Title (e.g. July salary)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inputStyle} />
          <input type="number" placeholder="Amount (₹)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} style={inputStyle} />
          <input placeholder="Note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} style={inputStyle} />
        </div>
        <button style={{ ...btnGhost, marginTop: 14, opacity: saving ? 0.7 : 1 }} onClick={add} disabled={saving}>
          <Plus size={15} /> {saving ? "Saving…" : "Record payment"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {salaries.length === 0 && <p style={{ color: C.sub, fontSize: 13.5 }}>No records yet.</p>}
        {salaries.map((s) => (
          <div key={s.id} style={{ ...card, display: "flex", justifyContent: "space-between", padding: "12px 18px" }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{s.title || s.type} {s.employee_id ? `— ${nameOf(s.employee_id)}` : ""}</div>
              <div style={{ fontSize: 12, color: C.sub }}>{s.date} {s.note && `· ${s.note}`}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontWeight: 500 }}>{money(s.amount)}</span>
              <button style={iconBtn} onClick={() => remove(s.id)}><Trash2 size={15} /></button>
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
      setLoadError(err.message);
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
      setLoadError(err.message);
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
      setLoadError(err.message);
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
      setLoadError(err.message);
    }
  };

  return (
    <div>
      <PageHeader title="Team and inventory" sub="Manage employees and stock." />
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {["employees", "inventory"].map((s) => (
          <button key={s} onClick={() => setSection(s)} style={{
            padding: "8px 18px", borderRadius: 24, border: `1.5px solid ${section === s ? C.plum : C.line}`, cursor: "pointer", fontSize: 13,
            background: section === s ? C.plum : "#fff", color: section === s ? "#fff" : C.ink, fontFamily: fontSans,
            boxShadow: section === s ? "0 6px 14px -6px rgba(43,27,46,0.4)" : "none",
          }}>{s === "employees" ? `Employees (${employees.length})` : `Inventory (${inventory.length})`}</button>
        ))}
      </div>

      {section === "employees" ? (
        <>
          <div style={{ ...card, marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
              <input placeholder="Name" value={ef.name} onChange={(e) => setEf({ ...ef, name: e.target.value })} style={inputStyle} />
              <input placeholder="Position (e.g. Stylist)" value={ef.position} onChange={(e) => setEf({ ...ef, position: e.target.value })} style={inputStyle} />
              <input placeholder="Phone" value={ef.phone} onChange={(e) => setEf({ ...ef, phone: e.target.value })} style={inputStyle} />
              <input placeholder="Login username" value={ef.username} onChange={(e) => setEf({ ...ef, username: e.target.value })} style={inputStyle} />
              <input placeholder="Login password (optional, min 4 chars)" value={ef.password} onChange={(e) => setEf({ ...ef, password: e.target.value })} style={inputStyle} />
            </div>
            <button style={{ ...btnGhost, marginTop: 14, opacity: savingEmp ? 0.7 : 1 }} onClick={addEmployee} disabled={savingEmp}>
              <Plus size={15} /> {savingEmp ? "Adding…" : "Add employee"}
            </button>
            {createdInfo && (
              <p style={{ marginTop: 12, fontSize: 12.5, color: C.green }}>
                Employee created. Share these login details: <b>{createdInfo.username}</b> / <b>{createdInfo.password}</b>
              </p>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {employees.length === 0 && <p style={{ color: C.sub, fontSize: 13.5 }}>No employees added yet.</p>}
            {employees.map((e) => (
              <div key={e.id} style={{ ...card, display: "flex", justifyContent: "space-between", padding: "12px 18px" }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{e.name} {e.position && `· ${e.position}`}</div>
                  <div style={{ fontSize: 12, color: C.sub }}>Username: {e.username} {e.phone && `· ${e.phone}`}</div>
                </div>
                <button style={iconBtn} onClick={() => removeEmployee(e.id)}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={{ ...card, marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
              <input placeholder="Item name" value={inf.name} onChange={(e) => setInf({ ...inf, name: e.target.value })} style={inputStyle} />
              <input type="number" placeholder="Quantity" value={inf.qty} onChange={(e) => setInf({ ...inf, qty: e.target.value })} style={inputStyle} />
              <input type="number" placeholder="Reorder level" value={inf.reorder} onChange={(e) => setInf({ ...inf, reorder: e.target.value })} style={inputStyle} />
              <input placeholder="Unit (pcs, ml, etc.)" value={inf.unit} onChange={(e) => setInf({ ...inf, unit: e.target.value })} style={inputStyle} />
            </div>
            <button style={{ ...btnGhost, marginTop: 14, opacity: savingItem ? 0.7 : 1 }} onClick={addItem} disabled={savingItem}>
              <Plus size={15} /> {savingItem ? "Adding…" : "Add item"}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {inventory.length === 0 && <p style={{ color: C.sub, fontSize: 13.5 }}>Inventory is empty.</p>}
            {inventory.map((i) => {
              const low = Number(i.qty) <= Number(i.reorder_level || 0);
              return (
                <div key={i.id} style={{ ...card, display: "flex", justifyContent: "space-between", padding: "12px 18px", borderColor: low ? C.red : C.line }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{i.name}</div>
                    <div style={{ fontSize: 12, color: low ? C.red : C.sub }}>{i.qty} {i.unit} available {low && "· Reorder needed"}</div>
                  </div>
                  <button style={iconBtn} onClick={() => removeItem(i.id)}><Trash2 size={15} /></button>
                </div>
              );
            })}
          </div>
        </>
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
        setError("Data load nahi ho paya.");
      }
      setLoading(false);
    })();
  }, [token]);

  return (
    <div>
      <PageHeader title="All Salons" sub="Saare registered salons aur unka performance." />
      {loading && <p style={{ color: C.sub, fontSize: 13.5 }}>Loading…</p>}
      {error && <p style={{ color: C.red, fontSize: 13.5 }}>{error}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {salons.map((s) => (
          <div key={s.id} style={{ ...card, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 15 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: C.sub }}>Joined: {s.created_at?.toString().slice(0, 10)}</div>
            </div>
            <div style={{ display: "flex", gap: 20, fontSize: 13 }}>
              <div><b>{s.total_appointments}</b> appointments</div>
              <div><b>{s.total_employees}</b> employees</div>
              <div style={{ color: C.green, fontWeight: 500 }}>{money(s.total_revenue)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}