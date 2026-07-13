import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import ScriptStudio from "./ScriptStudio";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = checking
  const [authMode, setAuthMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleAuth = async () => {
    if (!email || !password) { setAuthError("Email and password required"); return; }
    setLoading(true);
    setAuthError("");
    setNotice("");
    try {
      if (authMode === "register") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          setNotice("Check your inbox — confirm your email, then log in.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      setAuthError(e.message || "Something went wrong");
    }
    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (session === undefined) {
    return <div style={S.loading}>Loading…</div>;
  }

  if (session) {
    return <ScriptStudio user={session.user} onLogout={logout} />;
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        input:focus-visible, button:focus-visible { outline: 2px solid #D97706; outline-offset: 2px; }
      `}</style>
      <div style={S.box}>
        <div style={S.logo}>STOMO</div>
        <div style={S.tagline}>From the story in your heart to the people who need to hear it.</div>

        <div style={S.tabs}>
          <button onClick={() => { setAuthMode("login"); setAuthError(""); setNotice(""); }}
            style={{ ...S.tab, borderBottom: authMode === "login" ? "3px solid #D97706" : "3px solid transparent", color: authMode === "login" ? "#F7F5EC" : "#9a978e", fontWeight: authMode === "login" ? 700 : 400 }}>
            Log In
          </button>
          <button onClick={() => { setAuthMode("register"); setAuthError(""); setNotice(""); }}
            style={{ ...S.tab, borderBottom: authMode === "register" ? "3px solid #D97706" : "3px solid transparent", color: authMode === "register" ? "#F7F5EC" : "#9a978e", fontWeight: authMode === "register" ? 700 : 400 }}>
            Sign Up
          </button>
        </div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAuth()}
          placeholder="Email"
          style={S.input}
          autoComplete="email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAuth()}
          placeholder="Password (min. 6 characters)"
          style={S.input}
          autoComplete={authMode === "register" ? "new-password" : "current-password"}
        />

        {authError && <div style={S.error}>{authError}</div>}
        {notice && <div style={S.notice}>{notice}</div>}

        <button onClick={handleAuth} disabled={loading} style={S.primaryBtn}>
          {loading ? "…" : authMode === "login" ? "Log In" : "Create Account"}
        </button>

        <div style={S.hint}>
          Your projects are saved to your account and sync across devices.
        </div>
      </div>
    </div>
  );
}

const S = {
  loading: { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#26282c", color: "#9a978e", fontFamily: "'Courier Prime', monospace" },
  page: { minHeight: "100vh", background: "#26282c", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif", padding: 20 },
  box: { width: "100%", maxWidth: 380, background: "#1c1e21", border: "1px solid #3a3d42", borderRadius: 8, padding: "36px 28px", boxShadow: "0 8px 30px rgba(0,0,0,.5)" },
  logo: { fontFamily: "'Courier Prime', monospace", letterSpacing: 5, fontSize: 26, fontWeight: 700, color: "#F7F5EC", textAlign: "center" },
  tagline: { color: "#9a978e", fontSize: 13, textAlign: "center", marginTop: 8, marginBottom: 26, lineHeight: 1.5 },
  tabs: { display: "flex", marginBottom: 22, borderBottom: "1px solid #3a3d42" },
  tab: { flex: 1, background: "transparent", border: "none", padding: "10px 0", fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  input: { width: "100%", background: "#26282c", border: "1px solid #55585e", borderRadius: 6, color: "#F7F5EC", padding: "11px 13px", fontSize: 14, marginBottom: 12, fontFamily: "inherit" },
  error: { background: "#3d2426", color: "#e0a3a3", border: "1px solid #5a3336", borderRadius: 6, padding: "10px 12px", fontSize: 13, marginBottom: 12 },
  notice: { background: "#243d2b", color: "#a3e0b0", border: "1px solid #335a3c", borderRadius: 6, padding: "10px 12px", fontSize: 13, marginBottom: 12 },
  primaryBtn: { width: "100%", background: "#D97706", color: "#1c1e21", border: "none", borderRadius: 6, padding: "12px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  hint: { color: "#77746b", fontSize: 11.5, textAlign: "center", marginTop: 18, lineHeight: 1.5 },
};
