import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://vdtiqjwatlxjunqunlyk.supabase.co", "sb_publishable_Rj8VXIos27E9m-rrd101lQ_Tn5G8qvp");

const QUESTIONS = {
  movie: [
    { id: "protagonist", q: "Who is your protagonist?", placeholder: "e.g., cynical journalist" },
    { id: "antagonist", q: "Who opposes them?", placeholder: "e.g., corrupt politician" },
    { id: "want", q: "What do they want?", placeholder: "e.g., expose truth" },
    { id: "need", q: "What do they need?", placeholder: "e.g., trust again" },
    { id: "stakes", q: "What if they fail?", placeholder: "e.g., truth dies" },
    { id: "setting", q: "Where and when?", placeholder: "e.g., DC present" },
    { id: "genre", q: "Genre and tone?", placeholder: "e.g., thriller" },
    { id: "theme", q: "What is it about?", placeholder: "e.g., cost of truth" },
  ],
  tv: [
    { id: "protagonist", q: "Protagonist?", placeholder: "detective" },
    { id: "world", q: "World?", placeholder: "precinct" },
    { id: "engine", q: "What drives episodes?", placeholder: "cases + mystery" },
    { id: "stakes", q: "Stakes?", placeholder: "solving" },
    { id: "arc", q: "Character arc?", placeholder: "confronting past" },
    { id: "tone", q: "Tone?", placeholder: "drama" },
  ],
  novel: [
    { id: "protagonist", q: "Main character?", placeholder: "woman" },
    { id: "conflict", q: "Conflict?", placeholder: "past vs future" },
    { id: "setting", q: "Setting?", placeholder: "Ireland 1950s" },
    { id: "stakes", q: "Stakes?", placeholder: "identity" },
    { id: "arc", q: "How do they change?", placeholder: "standing ground" },
    { id: "genre", q: "Genre?", placeholder: "literary fiction" },
  ],
};

export default function App() {
  const [screen, setScreen] = useState("auth");
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [medium, setMedium] = useState(null);
  const [title, setTitle] = useState("");
  const [logline, setLogline] = useState("");
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [bible, setBible] = useState(null);
  const [saved, setSaved] = useState(false);

  const questionList = medium ? QUESTIONS[medium] : [];
  const progress = questionList.length ? ((currentQ + 1) / questionList.length) * 100 : 0;

  const handleAuth = async () => {
    if (!email || !password) return setAuthError("Email and password required");
    setLoading(true);
    try {
      const res = authMode === "register" ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password });
      if (res.error) throw new Error(res.error.message);
      setUser(res.data.user);
      setScreen("create");
      setEmail("");
      setPassword("");
      setAuthError("");
    } catch (e) {
      setAuthError(e.message);
    }
    setLoading(false);
  };

  const logout = () => { setUser(null); setScreen("auth"); setMedium(null); setTitle(""); setLogline(""); setAnswers({}); setCurrentQ(0); setBible(null); };
  const startStory = (med) => { if (!title.trim()) return alert("Enter title"); setMedium(med); setCurrentQ(0); setAnswers({}); setScreen("questions"); };
  const updateAnswer = (val) => { setAnswers((a) => ({ ...a, [questionList[currentQ].id]: val })); };
  const finishQuestions = () => { setBible({ id: Math.random().toString(36).slice(2, 11), title, medium, logline, answers, createdAt: new Date().toISOString() }); setScreen("bible"); };
  
  const saveBible = async () => {
    try {
      const res = await supabase.from("stories").insert([{ ...bible, user_id: user.id }]);
      if (res.error) throw new Error(res.error.message);
      setSaved(true);
      setTimeout(() => { setScreen("create"); setMedium(null); setTitle(""); setLogline(""); setAnswers({}); setCurrentQ(0); }, 1500);
    } catch (e) {
      alert("Save failed: " + e.message);
    }
  };

  const exportBible = () => {
    const blob = new Blob([JSON.stringify(bible, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (bible.title || "story").replace(/\s+/g, "-").toLowerCase() + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const S = styles();
  const q = questionList[currentQ];

  if (screen === "auth") {
    return (<div style={S.container}><div style={S.authBox}><div style={S.logo}>STOMO</div><div style={S.tagline}>Your story. Guided by craft.</div><div style={S.authTabs}><button onClick={() => setAuthMode("login")} style={{ ...S.tabBtn, borderBottom: authMode === "login" ? "3px solid #d97706" : "none" }}>Log In</button><button onClick={() => setAuthMode("register")} style={{ ...S.tabBtn, borderBottom: authMode === "register" ? "3px solid #d97706" : "none" }}>Sign Up</button></div><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAuth()} placeholder="Email" style={S.input} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAuth()} placeholder="Password" style={S.input} />{authError && <div style={S.error}>{authError}</div>}<button onClick={handleAuth} disabled={loading} style={S.primaryBtn}>{loading ? "..." : authMode === "login" ? "Log In" : "Sign Up"}</button></div></div>);
  }

  if (screen === "create") {
    return (<div style={S.container}><div style={S.topBar}><div style={S.logo}>STOMO</div><button onClick={logout} style={S.logoutBtn}>Log out</button></div><div style={S.mainBox}><h1 style={S.h1}>Start a New Story</h1>{!medium ? (<><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Story Title" style={S.input} /><div style={S.mediumGrid}>{[{ id: "movie", label: "Movie", icon: "🎬" }, { id: "tv", label: "TV", icon: "📺" }, { id: "novel", label: "Novel", icon: "📖" }].map((m) => (<button key={m.id} onClick={() => startStory(m.id)} style={S.mediumCard}>{m.icon} {m.label}</button>))}</div></>) : (<><textarea value={logline} onChange={(e) => setLogline(e.target.value)} placeholder="Logline (optional)" style={S.textarea} /><button onClick={() => setScreen("questions")} style={S.primaryBtn}>Start Questions →</button><button onClick={() => setMedium(null)} style={S.secondaryBtn}>← Change</button></>)}</div></div>);
  }

  if (screen === "questions") {
    return (<div style={S.container}><div style={S.topBar}><div style={S.logo}>STOMO</div><button onClick={logout} style={S.logoutBtn}>Log out</button></div><div style={S.questionBox}><div style={{ ...S.progressBar, width: `${progress}%` }} /><div style={S.questionContent}><div style={S.qNumber}>Q{currentQ + 1}/{questionList.length}</div><h2 style={S.qText}>{q.q}</h2><textarea value={answers[q.id] || ""} onChange={(e) => updateAnswer(e.target.value)} placeholder={q.placeholder} style={S.textarea} autoFocus rows={4} /><div style={S.qActions}><button onClick={() => currentQ > 0 && setCurrentQ(currentQ - 1)} disabled={currentQ === 0} style={S.secondaryBtn}>← Back</button><button onClick={currentQ === questionList.length - 1 ? finishQuestions : () => setCurrentQ(currentQ + 1)} style={S.primaryBtn}>{currentQ === questionList.length - 1 ? "Finish →" : "Next →"}</button></div></div></div></div>);
  }

  if (screen === "bible" && bible) {
    return (<div style={S.container}><div style={S.topBar}><div style={S.logo}>STOMO</div><button onClick={logout} style={S.logoutBtn}>Log out</button></div><div style={S.mainBox}><h1 style={S.h1}>Your Story Bible</h1><div style={S.bibleBox}><div><strong>Title:</strong> {bible.title}</div><div><strong>Medium:</strong> {bible.medium}</div>{bible.logline && <div><strong>Logline:</strong> {bible.logline}</div>}{Object.entries(bible.answers).map(([key, value]) => (<div key={key}><strong>{questionList.find((q) => q.id === key)?.q}:</strong> {value}</div>))}</div><div style={S.actions}>{saved && <div style={S.success}>✓ Saved!</div>}<button onClick={saveBible} disabled={saved} style={S.primaryBtn}>{saved ? "Saved ✓" : "Save to Account"}</button><button onClick={exportBible} style={S.secondaryBtn}>⤓ Export JSON</button><button onClick={() => { setScreen("create"); setMedium(null); setTitle(""); setLogline(""); setAnswers({}); setCurrentQ(0); setSaved(false); }} style={S.secondaryBtn}>New Story</button></div></div></div>);
  }

  return null;
}

function styles() {
  return {
    container: { minHeight: "100vh", background: "linear-gradient(135deg, #faf8f3 0%, #fef9ef 100%)", display: "flex", flexDirection: "column", fontFamily: "'Inter', system-ui" },
    topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", background: "white", borderBottom: "1px solid #e5e7eb" },
    logo: { fontFamily: "'Courier Prime', monospace", fontWeight: 700, fontSize: 18, letterSpacing: 2, color: "#1e3a8a" },
    logoutBtn: { background: "transparent", border: "1px solid #ddd", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 14 },
    authBox: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 40 },
    mainBox: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 20px" },
    h1: { fontSize: 36, fontWeight: 700, color: "#1e3a8a", marginBottom: 40, textAlign: "center" },
    tagline: { fontSize: 18, color: "#6b7280", textAlign: "center",
