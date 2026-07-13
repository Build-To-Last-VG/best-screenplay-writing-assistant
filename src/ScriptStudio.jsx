import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";

/* ============================================================
   STOMO (Script Studio v2) — AI screenwriting workshop
   - Multiple projects (project library, synced to your account)
   - Export/Import as .json backup files
   Knowledge compiled from: StudioBinder, MasterClass, Blake
   Snyder's "Save the Cat", NYC Midnight formatting guide,
   script-coverage rubrics (Slated, Final Draft, TV Calling),
   festival submission guides (Sundance, Austin FF, Filmustage).
   Stage colors = Hollywood revision-page order.
   ============================================================ */

const KNOWLEDGE = {
  development: `A feature screenplay needs these foundations before writing. Ask about whatever is MISSING from the user's idea (max 4-5 questions at a time, most important first):
1. PROTAGONIST: Who is the main character? Age, occupation, defining trait. What makes us root for them (the "save the cat" moment)? What is their FLAW?
2. WANT vs NEED: What do they consciously want (external goal)? What do they actually need (internal lesson)? The gap between these drives the arc.
3. ANTAGONIST / OPPOSING FORCE: Who or what stands in the way? A person, nature, society, themselves?
4. CENTRAL CONFLICT: What is the struggle? Every scene must contain conflict, external or internal.
5. STAKES: What happens if the protagonist fails? Higher stakes = more engagement.
6. SETTING: Where and when? Location, era, world rules.
7. GENRE & TONE: Drama, thriller, comedy, horror...? Dark, light, satirical?
8. THEME: What is the story really about underneath (love, revenge, redemption, survival)? Woven in, never spelled out.
9. ENDING: Rough idea of how it resolves — doesn't need to be happy, needs closure.
10. AUDIENCE & COMPS: Who is this for? Two or three comparable recent films ("X meets Y").
A LOGLINE (25-35 words) should compress: protagonist (by role/adjective, not name) + goal + conflict/antagonist + stakes.`,

  structure: `THREE-ACT STRUCTURE: Act 1 Setup (~25%), Act 2 Confrontation (~50%), Act 3 Resolution (~25%).
SAVE THE CAT — Blake Snyder's 15 beats (page targets for a 110-page script; scale by percentage for other lengths):
1. Opening Image (p.1) — visual that sets tone; mirrors the Final Image.
2. Theme Stated (p.5) — someone hints what the story is about.
3. Setup (p.1-10) — hero's flawed status-quo world.
4. Catalyst (p.12) — inciting incident that disrupts everything.
5. Debate (p.12-25) — hero hesitates; can they really do this?
6. Break into Two (p.25) — hero actively chooses the adventure.
7. B Story (p.30) — subplot (often love/friendship) carrying the theme.
8. Fun and Games (p.30-55) — "promise of the premise"; trailer moments.
9. Midpoint (p.55) — false victory OR false defeat; stakes raise; most important structural marker.
10. Bad Guys Close In (p.55-75) — pressure mounts, allies fall away.
11. All Is Lost (p.75) — lowest point, often a "whiff of death".
12. Dark Night of the Soul (p.75-85) — hero processes the loss.
13. Break into Three (p.85) — the insight (usually via B story) that unlocks the solution.
14. Finale (p.85-110) — hero applies the lesson, defeats the antagonist, world synthesized.
15. Final Image (p.110) — opposite of Opening Image; proof of change.
Feature length: 90-120 pages, one page = roughly one minute of screen time.`,

  sceneCraft: `SCENE WRITING RULES:
- Sluglines: INT. or EXT. + LOCATION + TIME (e.g. INT. KITCHEN - NIGHT). New slugline per location/time change.
- Write ONLY what can be seen or heard. Present tense. No inner thoughts, no novelistic prose.
- Show, don't tell — convey information through action and behavior, not exposition.
- Every scene needs conflict or tension, external or internal, however quiet.
- Every scene must advance plot or reveal character — ideally both. If it does neither, cut it.
- Enter late, leave early: start the scene as close to the conflict as possible, end before it fully resolves.
- Action lines: lean, visual, max 3-4 lines per paragraph.
- Character names in ALL CAPS on first introduction, with a short vivid description (age, role, essence).
- Dialogue: each character has a DISTINCT voice; use subtext (people rarely say exactly what they mean); avoid on-the-nose exposition ("As you know...").
- Parentheticals sparingly. Suggest shots through description, don't write camera directions.
- Format: 12pt Courier, standard margins (handled by software).`,

  checkCriteria: `CONSISTENCY & QUALITY CHECK (script coverage rubric). Examine systematically and cite scene/section for every issue found:
1. STRUCTURE: Are the key beats present and in the right order (Catalyst, Break into Two, Midpoint, All Is Lost, Finale)? Any beat too early/late? Does the second act sag?
2. CHARACTER CONTINUITY: Names spelled consistently? Ages, appearance, backstory stable? Do actions match established motivation and personality? Does the protagonist have a clear, completed arc (flaw at start, change proven at end)?
3. TIMELINE & LOGIC: Do events happen in a possible order? Day/night, travel times, injuries that vanish, props that appear/disappear, characters knowing things they couldn't know?
4. LOCATION CONTINUITY: Places described consistently across scenes?
5. DIALOGUE: Does every character sound distinct (cover the names — can you tell who speaks)? On-the-nose exposition? Overwritten speeches?
6. STAKES & TENSION: Do stakes escalate? Any scene without conflict? Rooting interest maintained?
7. SETUPS & PAYOFFS: Is everything set up paid off, and everything paid off set up (Chekhov's gun)? Unresolved subplots?
8. THEME: Is the theme stated early and proven by the ending?
9. PACING: Scenes that overstay? Sections that drag or rush?
10. CRAFT: Present tense? Unfilmables ("she remembers...")? Formatting errors?
Rate each category Strong / Solid / Needs work, always with concrete examples and a concrete fix suggestion. Balance strengths AND weaknesses like a professional reader.`,

  roles: {
    executive: `You are a seasoned STUDIO EXECUTIVE / PRODUCER. You care about: marketability, target audience and four-quadrant appeal, comparable titles and their box office, budget implications (locations, effects, cast size, period setting), casting appeal (is the lead a role A-list talent would fight for?), hook and poster-ability of the concept, franchise/streaming potential. You are direct, commercially minded, slightly impatient. You give a PASS / CONSIDER / RECOMMEND verdict with reasons. You respect craft but your job is: will this sell and get made?`,
    screenwriter: `You are a VETERAN SCREENWRITER with produced credits and years in writers' rooms. You care about: structure and beat placement, character arc mechanics (want vs need, flaw, transformation), dialogue craft and subtext, scene economy (enter late leave early), setups and payoffs, theme integration. You speak writer-to-writer, honest but constructive, always naming the specific page/scene and suggesting the concrete craft fix. You quote the classic rules (show don't tell, kill your darlings) when relevant.`,
    director: `You are an experienced FILM DIRECTOR. You care about: visual storytelling (does this play in images or is it radio with pictures?), whether emotion is externalized in action, blocking and location potential, tonal consistency, pacing on screen, moments of cinema (the shots that make the trailer), practical production feasibility, and what's NOT on the page that you'd need. You think in scenes and images, reference how you would shoot things, and flag anything unfilmable or visually flat.`,
    reader: `You are a professional SCRIPT READER writing industry coverage. Produce structured coverage: LOGLINE (one sentence), brief SYNOPSIS, then graded analysis of Concept, Structure, Character, Dialogue, Pacing, Theme, Craft (each Excellent/Good/Fair/Poor with justification), STRENGTHS, WEAKNESSES, and final verdict PASS / CONSIDER / RECOMMEND. You are objective, cite specifics, and balance positives with problems like real coverage does — no empty flattery, no cruelty.`,
  },

  submission: `SUBMISSION PACKAGE for festivals, competitions and studios:
1. LOGLINE — one sentence, 25-35 words: protagonist (by role, not name) + goal + conflict + stakes. First thing every reader sees.
2. SYNOPSIS — 300-500 words / max 1 page, present tense, three-act shape, main plot only, ENDING REVEALED (unlike marketing copy). Many festivals also want a short 300-500 CHARACTER catalog version.
3. TREATMENT — prose version of the story, 2-30 pages (short: 5-10), present tense, scene-to-scene narrative with tone and key moments; usually requested AFTER initial interest.
4. QUERY LETTER — one page: hook/logline, short synopsis paragraph, comps ("X meets Y"), one-line bio with relevant credentials, ask for a read. Tailored per recipient.
5. TITLE PAGE — title, author name, contact info ONLY (for anonymous competitions: no name). No images, no fancy fonts.
6. SCRIPT — PDF, 12pt Courier, 90-120 pages, proofread meticulously; formatting errors mark you as amateur.
7. CHARACTER BIOS / PITCH DECK — some markets ask for 1-paragraph bios of main characters or a short visual deck.
8. PROTECTION — register with WGA (West) and/or the U.S. Copyright Office before submitting.
9. Per-festival: always read the current guidelines (length, anonymity, categories, deadlines, AI policies); early deadlines are cheaper.`,
};

/* ---------- stage definitions (revision-page colors) ---------- */
const STAGES = [
  {
    id: "idea", num: 1, color: "#F1EFE6", ink: "#3E3B33", label: "WHITE",
    slug: "INT. DEVELOPMENT ROOM — DAY", title: "Idea & Foundations",
    desc: "Pitch your idea. I'll find what the story still needs to know.",
    starters: ["Here is my idea:", "Help me find a genre and tone", "Build a logline from what we have"],
    system: (K) => `STAGE 1 — IDEA DEVELOPMENT. The user pitches a movie idea. Your job: identify what is MISSING using this checklist, then ask the most important open questions (max 4-5 at once, numbered). Acknowledge briefly what's already strong. As answers come in, tighten the concept and, when enough exists, propose a draft LOGLINE and a one-paragraph premise for approval.\n\nKNOWLEDGE:\n${K.development}`,
  },
  {
    id: "outline", num: 2, color: "#A9C6DE", ink: "#1F3A50", label: "BLUE",
    slug: "INT. STORY ROOM — DAY", title: "Outline & Rough Draft",
    desc: "Turn the foundations into a beat sheet and rough outline.",
    starters: ["Write a Save the Cat beat sheet for my story", "Turn the beats into a scene-by-scene outline", "Where does my second act sag?"],
    system: (K) => `STAGE 2 — OUTLINE. Build the story structure. Default framework: Blake Snyder's 15 beats mapped onto three acts, with page targets. First deliver a BEAT SHEET (all 15 beats, one or two sentences each, specific to THIS story). On request, expand into a scene-by-scene outline (numbered scenes with slugline-style headers and 1-2 sentence summaries). Flag any beat the foundations can't fill yet and ask. When the user approves an outline, tell them to press "Save as Outline" so it lands in the Story Bible.\n\nKNOWLEDGE:\n${K.structure}`,
  },
  {
    id: "scenes", num: 3, color: "#E4B8C4", ink: "#5A2436", label: "PINK",
    slug: "INT. WRITERS' ROOM — NIGHT", title: "Scene by Scene",
    desc: "Write the script one scene at a time, in proper format.",
    starters: ["Write the next scene from the outline", "Rewrite this scene with more subtext", "Punch up the dialogue in the last scene"],
    system: (K) => `STAGE 3 — SCENE WRITING. Write or revise ONE scene at a time in correct screenplay format (slugline, action lines, CHARACTER names, dialogue). Follow the outline in the project context; before writing, state which outline scene you're tackling. After each scene, offer 2-3 concrete alternatives or improvements (different entry point, more subtext, cut lines). Remind the user to press "Save as Scene" for keepers.\n\nKNOWLEDGE:\n${K.sceneCraft}`,
  },
  {
    id: "check", num: 4, color: "#E7D88C", ink: "#57491A", label: "YELLOW",
    slug: "INT. EDITING SUITE — DAY", title: "Consistency Check",
    desc: "Hunt inconsistencies, plot holes and craft problems.",
    starters: ["Run the full consistency check", "Check character continuity only", "Check setups and payoffs"],
    system: (K) => `STAGE 4 — CONSISTENCY CHECK. Audit everything in the project context (foundations, outline, saved scenes, character sheets, places) against the rubric below. Output a structured report: each category with rating (Strong / Solid / Needs work), the concrete evidence (quote or name the scene), and a concrete fix. End with a prioritized top-5 fix list. Be thorough — cross-reference character sheets against scenes (ages, appearance, motivation) and places against their descriptions.\n\nKNOWLEDGE:\n${K.checkCriteria}`,
  },
  {
    id: "sparring", num: 5, color: "#A9C9A4", ink: "#2B4527", label: "GREEN",
    slug: "INT. PITCH MEETING — DAY", title: "Sparring",
    desc: "Face the executive, the screenwriter, the director or the reader.",
    starters: ["Give me your honest overall verdict", "What would you cut?", "What's the weakest scene and why?"],
    system: null,
  },
  {
    id: "submit", num: 6, color: "#D9A94E", ink: "#4A3406", label: "GOLDENROD",
    slug: "EXT. FESTIVAL ENTRANCE — NIGHT", title: "Submission Package",
    desc: "Logline, synopsis, treatment, query letter — everything to send it out.",
    starters: ["What do I still need for a festival submission?", "Write my logline (3 options)", "Write the one-page synopsis", "Draft a query letter"],
    system: (K) => `STAGE 6 — SUBMISSION PACKAGE. Help produce professional submission documents from the project context. When asked what's needed, check the package list against what already exists in the project and report status as a checklist. When writing a document, follow the specs exactly (word counts, tense, ending revealed in synopsis). Offer variants for loglines. Remind the user to press "Save as Document" so drafts land in the Story Bible. Also mention protection (WGA/copyright registration) once.\n\nKNOWLEDGE:\n${K.submission}`,
  },
];

const ROLE_META = [
  { id: "executive", name: "Movie Executive", tag: "Will it sell?" },
  { id: "screenwriter", name: "Veteran Screenwriter", tag: "Is the craft right?" },
  { id: "director", name: "Director", tag: "Does it play in images?" },
  { id: "reader", name: "Script Reader", tag: "Formal coverage" },
];

const EMPTY_PROJECT = {
  title: "Untitled Screenplay",
  foundation: "",
  outline: "",
  characters: [],
  places: [],
  scenes: [],
  documents: [],
  chats: {},
};

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const truncate = (s, n) => (s && s.length > n ? s.slice(0, n) + " […]" : s || "");
const fmtDate = (ts) => (ts ? new Date(ts).toLocaleString() : "—");

/* ---------- project context passed to Claude ---------- */
function buildContext(p) {
  const parts = [`PROJECT TITLE: ${p.title}`];
  if (p.foundation) parts.push(`FOUNDATIONS (idea, logline, genre, theme, stakes):\n${truncate(p.foundation, 3000)}`);
  if (p.outline) parts.push(`OUTLINE / BEAT SHEET:\n${truncate(p.outline, 5000)}`);
  if (p.characters.length)
    parts.push("CHARACTER SHEETS:\n" + p.characters.map((c) =>
      `- ${c.name}${c.age ? `, ${c.age}` : ""}${c.role ? ` (${c.role})` : ""}. Appearance: ${c.appearance || "?"}. Want: ${c.want || "?"}. Flaw: ${c.flaw || "?"}. Arc: ${c.arc || "?"}. Voice: ${c.voice || "?"}`).join("\n"));
  if (p.places.length)
    parts.push("PLACES:\n" + p.places.map((pl) => `- ${pl.name}: ${pl.description || "?"}`).join("\n"));
  if (p.scenes.length)
    parts.push("SAVED SCENES (in order):\n" + p.scenes.map((s, i) =>
      `--- SCENE ${i + 1}: ${s.title} ---\n${truncate(s.text, 1800)}`).join("\n"));
  if (p.documents.length)
    parts.push("SUBMISSION DOCUMENTS SO FAR:\n" + p.documents.map((d) => `--- ${d.title} ---\n${truncate(d.text, 1200)}`).join("\n"));
  return parts.join("\n\n");
}

/* ---------- API (via our serverless proxy — keeps the key secret) ---------- */
async function callClaude(system, messages) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token || ""}` },
    body: JSON.stringify({ system, messages }),
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    const msg = typeof data.error === "string" ? data.error : data.error?.message;
    throw new Error(msg || "API error");
  }
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
}

export default function ScriptStudio({ user, onLogout }) {
  const [screen, setScreen] = useState("loading"); // loading | home | studio
  const [index, setIndex] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [project, setProject] = useState(EMPTY_PROJECT);
  const [stageId, setStageId] = useState("idea");
  const [role, setRole] = useState("screenwriter");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [bibleOpen, setBibleOpen] = useState(false);
  const [bibleTab, setBibleTab] = useState("characters");
  const [toast, setToast] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [saveState, setSaveState] = useState("saved"); // saved | saving | error
  const scrollRef = useRef(null);
  const saveTimer = useRef(null);
  const fileRef = useRef(null);

  const stage = STAGES.find((s) => s.id === stageId);
  const chat = project.chats[stageId] || [];

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2600); };

  /* ---------- initial load: project list from Supabase ---------- */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false });
      if (error) {
        console.error("could not load projects", error);
        setIndex([]);
      } else {
        setIndex((data || []).map((r) => ({ id: r.id, title: r.title, updatedAt: r.updated_at ? new Date(r.updated_at).getTime() : null })));
      }
      setScreen("home");
    })();
  }, []);

  /* ---------- debounced project save ---------- */
  useEffect(() => {
    if (screen !== "studio" || !projectId) return;
    setSaveState("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const { error } = await supabase.from("projects").upsert({
          id: projectId,
          user_id: user.id,
          title: project.title,
          data: project,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
        setIndex((idx) => idx.map((e) => (e.id === projectId ? { ...e, title: project.title, updatedAt: Date.now() } : e)));
        setSaveState("saved");
      } catch (e) {
        console.error("save failed", e);
        setSaveState("error");
      }
    }, 800);
    return () => clearTimeout(saveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, projectId, screen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat.length, busy]);

  /* ---------- project library actions ---------- */
  const createProject = async () => {
    const id = newId();
    const p = { ...EMPTY_PROJECT };
    const { error } = await supabase.from("projects").insert({ id, user_id: user.id, title: p.title, data: p });
    if (error) { flash("Could not create project: " + error.message); return; }
    setIndex((idx) => [{ id, title: p.title, updatedAt: Date.now() }, ...idx]);
    setProjectId(id); setProject(p); setStageId("idea"); setScreen("studio");
  };

  const openProject = async (id) => {
    const { data, error } = await supabase.from("projects").select("data").eq("id", id).single();
    if (error || !data?.data) { flash("Could not open project" + (error ? ": " + error.message : "")); return; }
    setProject({ ...EMPTY_PROJECT, ...data.data });
    setProjectId(id); setStageId("idea"); setScreen("studio");
  };

  const deleteProject = async (id, title) => {
    if (!confirm(`Delete "${title}" permanently? Export a backup first if you want to keep it.`)) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) { flash("Delete failed: " + error.message); return; }
    setIndex((idx) => idx.filter((e) => e.id !== id));
    flash("Project deleted");
  };

  /* ---------- export / import ---------- */
  const exportProject = (p = project) => {
    const payload = { app: "script-studio", version: 2, exportedAt: new Date().toISOString(), project: p };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (p.title || "screenplay").replace(/[^a-z0-9äöüß\- ]/gi, "").trim().replace(/ +/g, "-").toLowerCase() + "-backup.json";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    flash("Backup downloaded — keep it safe");
  };

  const exportFromHome = async (id) => {
    const { data, error } = await supabase.from("projects").select("data").eq("id", id).single();
    if (error || !data?.data) { flash("Export failed" + (error ? ": " + error.message : "")); return; }
    exportProject(data.data);
  };

  const importFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const raw = JSON.parse(reader.result);
        const p = { ...EMPTY_PROJECT, ...(raw.project || raw) };
        if (typeof p.title !== "string" || !Array.isArray(p.scenes)) throw new Error("not a Stomo backup");
        const id = newId();
        const { error } = await supabase.from("projects").insert({ id, user_id: user.id, title: p.title + " (imported)", data: p });
        if (error) throw new Error(error.message);
        setIndex((idx) => [{ id, title: p.title + " (imported)", updatedAt: Date.now() }, ...idx]);
        flash(`Imported "${p.title}"`);
      } catch (err) { flash("Import failed: " + err.message); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  /* ---------- chat ---------- */
  const systemFor = useCallback(() => {
    const base = `You are the AI writing partner inside "Script Studio", a screenwriting tool. Be concise, concrete and craft-focused. Always ground advice in the project context below. Never invent facts about the project that aren't in the context — ask instead.\n\n=== PROJECT CONTEXT ===\n${buildContext(project)}\n=== END CONTEXT ===\n\n`;
    if (stageId === "sparring") {
      return base + `STAGE 5 — SPARRING SESSION.\n${KNOWLEDGE.roles[role]}\nStay fully in character. Critique what exists in the project context. Cite specifics. If material is missing for a judgment, say what you'd need.`;
    }
    return base + stage.system(KNOWLEDGE);
  }, [project, stageId, role, stage]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput("");
    const newChat = [...chat, { role: "user", content }];
    setProject((p) => ({ ...p, chats: { ...p.chats, [stageId]: newChat } }));
    setBusy(true);
    try {
      const reply = await callClaude(systemFor(), newChat.slice(-16).map((m) => ({ role: m.role, content: m.content })));
      setProject((p) => ({ ...p, chats: { ...p.chats, [stageId]: [...newChat, { role: "assistant", content: reply }] } }));
    } catch (e) {
      setProject((p) => ({ ...p, chats: { ...p.chats, [stageId]: [...newChat, { role: "assistant", content: "⚠ Request failed: " + e.message + " — try again." }] } }));
    }
    setBusy(false);
  };

  const lastAssistant = [...chat].reverse().find((m) => m.role === "assistant" && !m.content.startsWith("⚠"));

  /* ---------- save-to-bible actions ---------- */
  const saveFoundation = () => { if (!lastAssistant) return; setProject((p) => ({ ...p, foundation: lastAssistant.content })); flash("Saved to Foundations"); };
  const saveOutline = () => { if (!lastAssistant) return; setProject((p) => ({ ...p, outline: lastAssistant.content })); flash("Saved as Outline"); };
  const saveScene = () => {
    if (!lastAssistant) return;
    const firstLine = lastAssistant.content.split("\n").find((l) => /INT\.|EXT\./.test(l)) || `Scene ${project.scenes.length + 1}`;
    setProject((p) => ({ ...p, scenes: [...p.scenes, { title: firstLine.trim().slice(0, 80), text: lastAssistant.content }] }));
    flash("Saved as Scene " + (project.scenes.length + 1));
  };
  const saveDocument = () => {
    if (!lastAssistant) return;
    const t = prompt("Document name (e.g. Logline, Synopsis, Query Letter):", "Synopsis");
    if (!t) return;
    setProject((p) => ({ ...p, documents: [...p.documents, { title: t, text: lastAssistant.content }] }));
    flash(`Saved "${t}"`);
  };

  /* ---------- AI extraction of characters & places ---------- */
  const updateBible = async () => {
    if (extracting) return;
    setExtracting(true);
    try {
      const raw = await callClaude(
        `You extract structured story-bible data. Respond ONLY with valid JSON, no markdown fences, no preamble. Schema: {"characters":[{"name":"","age":"","role":"protagonist|antagonist|supporting","appearance":"","want":"","flaw":"","arc":"","voice":""}],"places":[{"name":"","description":""}]}. Extract EVERY named character and location mentioned in the material, merging all details (age, looks, motivation, how places are described). Use "" for unknown fields. Keep descriptions to one or two sentences each.`,
        [{ role: "user", content: buildContext(project) }]
      );
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setProject((p) => {
        const mergeBy = (oldArr, newArr, key) => {
          const map = new Map(oldArr.map((o) => [o[key].toLowerCase(), o]));
          (newArr || []).forEach((n) => {
            if (!n[key]) return;
            const k = n[key].toLowerCase();
            const prev = map.get(k) || {};
            const merged = { ...prev };
            Object.keys(n).forEach((f) => { if (n[f]) merged[f] = n[f]; });
            map.set(k, merged);
          });
          return [...map.values()];
        };
        return { ...p, characters: mergeBy(p.characters, parsed.characters, "name"), places: mergeBy(p.places, parsed.places, "name") };
      });
      setBibleOpen(true); setBibleTab("characters");
      flash("Story Bible updated");
    } catch (e) { flash("Extraction failed — try again"); }
    setExtracting(false);
  };

  const deleteItem = (list, idx) => setProject((p) => ({ ...p, [list]: p[list].filter((_, i) => i !== idx) }));

  /* ================= RENDER ================= */
  if (screen === "loading") {
    return <div style={{ padding: 40, fontFamily: "'Courier Prime', monospace", color: "#888", background: "#26282c", height: "100vh" }}>Loading your projects…</div>;
  }

  const fonts = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; }
      ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-thumb { background:#4a4d52; border-radius:4px; }
      button { cursor: pointer; font-family: inherit; }
      button:focus-visible, input:focus-visible, textarea:focus-visible { outline: 2px solid #A9C6DE; outline-offset: 2px; }
      @media (prefers-reduced-motion: reduce){ *{ transition:none!important; animation:none!important; } }
    `}</style>
  );

  /* ---------- HOME: project library ---------- */
  if (screen === "home") {
    return (
      <div style={{ height: "100vh", overflowY: "auto", background: "#26282c", fontFamily: "'Inter', system-ui, sans-serif", color: "#e8e5dc", padding: "40px 20px" }}>
        {fonts}
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "'Courier Prime', monospace", letterSpacing: 4, fontSize: 22, fontWeight: 700 }}>STOMO</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "#77746b" }}>{user?.email}</span>
              <button onClick={onLogout} style={{ background: "transparent", color: "#d8d5cc", border: "1px solid #55585e", borderRadius: 4, padding: "6px 12px", fontSize: 12 }}>Log out</button>
            </div>
          </div>
          <div style={{ color: "#9a978e", fontSize: 13, marginTop: 4, marginBottom: 28 }}>
            Your project library. Everything auto-saves to your account — and every project can be exported as a backup file on your computer.
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
            <button onClick={createProject} style={{ background: "#D9A94E", color: "#4A3406", border: "none", borderRadius: 6, padding: "10px 18px", fontWeight: 700, fontSize: 14 }}>
              + New Project
            </button>
            <button onClick={() => fileRef.current?.click()} style={{ background: "transparent", color: "#d8d5cc", border: "1px solid #55585e", borderRadius: 6, padding: "10px 18px", fontSize: 14 }}>
              ⤒ Import backup (.json)
            </button>
            <input ref={fileRef} type="file" accept=".json,application/json" onChange={importFile} style={{ display: "none" }} />
          </div>

          {index.length === 0 && (
            <div style={{ border: "1px dashed #55585e", borderRadius: 8, padding: 32, textAlign: "center", color: "#9a978e", fontSize: 14, lineHeight: 1.7 }}>
              <div style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700, marginBottom: 6 }}>FADE IN:</div>
              No projects yet. Start a new one — or import a backup file from an earlier session.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {index.map((e) => (
              <div key={e.id} style={{ background: "#F7F5EC", color: "#26241f", borderRadius: 6, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", borderLeft: "6px solid #A9C6DE", boxShadow: "0 2px 8px rgba(0,0,0,.3)" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700, fontSize: 15 }}>{e.title}</div>
                  <div style={{ fontSize: 11.5, color: "#8a8679", marginTop: 2 }}>Last saved: {fmtDate(e.updatedAt)}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => openProject(e.id)} style={{ background: "#26241f", color: "#F7F5EC", border: "none", borderRadius: 4, padding: "8px 16px", fontWeight: 600, fontSize: 13 }}>Open</button>
                  <button onClick={() => exportFromHome(e.id)} style={{ background: "transparent", border: "1px solid #c9c6bc", borderRadius: 4, padding: "8px 12px", fontSize: 13, color: "#57544b" }}>Export</button>
                  <button onClick={() => deleteProject(e.id, e.title)} style={{ background: "transparent", border: "1px solid #c9c6bc", borderRadius: 4, padding: "8px 12px", fontSize: 13, color: "#a05252" }}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32, fontSize: 12, color: "#77746b", lineHeight: 1.7, borderTop: "1px solid #3a3d42", paddingTop: 16 }}>
            <strong style={{ color: "#9a978e" }}>Backup rule:</strong> your library is saved to your Stomo account and syncs across devices. For extra safety, export a .json backup after every serious writing session — import restores everything (scenes, characters, chats) anytime.
          </div>
        </div>
        {toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#F7F5EC", color: "#26241f", padding: "8px 18px", borderRadius: 20, fontSize: 13, zIndex: 50 }}>{toast}</div>}
      </div>
    );
  }

  /* ---------- STUDIO ---------- */
  const stageActions = {
    idea: [{ label: "Save to Foundations", fn: saveFoundation }],
    outline: [{ label: "Save as Outline", fn: saveOutline }],
    scenes: [{ label: "Save as Scene", fn: saveScene }],
    check: [],
    sparring: [],
    submit: [{ label: "Save as Document", fn: saveDocument }],
  }[stageId];

  const S = styles(stage);
  const saveBadge = saveState === "saving" ? "● saving…" : saveState === "error" ? "▲ save failed — export now!" : "✓ saved";

  return (
    <div style={S.app}>
      {fonts}
      <header style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flexWrap: "wrap" }}>
          <button style={S.headBtn} onClick={() => setScreen("home")} title="Back to project library">‹ Projects</button>
          <input value={project.title} onChange={(e) => setProject((p) => ({ ...p, title: e.target.value }))} style={S.titleInput} aria-label="Project title" />
          <span style={{ fontSize: 11, color: saveState === "error" ? "#e0a3a3" : "#7d8087", fontFamily: "'Inter', sans-serif" }}>{saveBadge}</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={S.headBtn} onClick={() => exportProject()} title="Download a .json backup to your computer">⤓ Export backup</button>
          <button style={S.headBtn} onClick={updateBible} disabled={extracting}>{extracting ? "Extracting…" : "⟳ Update Story Bible"}</button>
          <button style={{ ...S.headBtn, background: bibleOpen ? stage.color : "transparent", color: bibleOpen ? stage.ink : "#d8d5cc" }} onClick={() => setBibleOpen((v) => !v)}>☰ Story Bible</button>
        </div>
      </header>

      <div style={S.body}>
        <nav style={S.rail} aria-label="Stages">
          {STAGES.map((s) => {
            const active = s.id === stageId;
            return (
              <button key={s.id} onClick={() => setStageId(s.id)}
                style={{ ...S.tab, background: active ? s.color : "#33363b", color: active ? s.ink : "#b9b6ad", borderLeft: `5px solid ${s.color}`, transform: active ? "translateX(4px)" : "none" }}>
                <div style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.7, fontFamily: "'Courier Prime', monospace" }}>{s.num}. {s.label} PAGES</div>
                <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{s.title}</div>
              </button>
            );
          })}
          <div style={S.railNote}>Tab colors follow the Hollywood revision-page order: White → Blue → Pink → Yellow → Green → Goldenrod.</div>
        </nav>

        <main style={S.main}>
          <div style={S.slugBar}>
            <span style={S.slug}>{stage.slug}</span>
            <span style={S.slugDesc}>{stage.desc}</span>
          </div>

          {stageId === "sparring" && (
            <div style={S.roleRow}>
              {ROLE_META.map((r) => (
                <button key={r.id} onClick={() => setRole(r.id)}
                  style={{ ...S.roleBtn, background: role === r.id ? stage.color : "#f4f2ea", borderColor: role === r.id ? stage.ink : "#c9c6bc", fontWeight: role === r.id ? 700 : 400 }}>
                  <div>{r.name}</div>
                  <div style={{ fontSize: 11, opacity: 0.65 }}>{r.tag}</div>
                </button>
              ))}
            </div>
          )}

          <div ref={scrollRef} style={S.chatArea}>
            {chat.length === 0 && (
              <div style={S.empty}>
                <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>FADE IN:</div>
                {stage.num === 1
                  ? "Type your movie idea below — a sentence is enough. I'll figure out what the story still needs."
                  : `This stage builds on your Story Bible (${project.foundation ? "✓ foundations" : "○ foundations"} · ${project.outline ? "✓ outline" : "○ outline"} · ${project.scenes.length} scenes). Ask away, or use a starter.`}
              </div>
            )}
            {chat.map((m, i) => (
              <div key={i} style={m.role === "user" ? S.userMsg : S.aiMsg}>
                <div style={S.msgLabel}>{m.role === "user" ? "YOU" : stageId === "sparring" ? ROLE_META.find((r) => r.id === role)?.name.toUpperCase() : "STUDIO"}</div>
                <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
              </div>
            ))}
            {busy && <div style={{ ...S.aiMsg, opacity: 0.6 }}><div style={S.msgLabel}>STUDIO</div>typing…</div>}
          </div>

          <div style={S.actionRow}>
            {stageActions.map((a) => (
              <button key={a.label} style={{ ...S.saveBtn, opacity: lastAssistant ? 1 : 0.4 }} onClick={a.fn} disabled={!lastAssistant}>▣ {a.label}</button>
            ))}
            {stage.starters.map((st) => (
              <button key={st} style={S.starter} onClick={() => send(st)} disabled={busy}>{st}</button>
            ))}
          </div>

          <div style={S.inputRow}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={stage.num === 1 ? "My movie is about…" : "Write to your writing partner… (Enter to send, Shift+Enter for a new line)"}
              rows={2}
              style={S.textarea}
            />
            <button onClick={() => send()} disabled={busy || !input.trim()} style={S.sendBtn}>{busy ? "…" : "Send"}</button>
          </div>
        </main>

        {bibleOpen && (
          <aside style={S.bible}>
            <div style={S.bibleHead}>
              <span style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700, letterSpacing: 1 }}>STORY BIBLE</span>
              <button style={S.closeBtn} onClick={() => setBibleOpen(false)} aria-label="Close">✕</button>
            </div>
            <div style={S.bibleTabs}>
              {[["characters", `Characters (${project.characters.length})`], ["places", `Places (${project.places.length})`], ["outline", "Outline"], ["scenes", `Scenes (${project.scenes.length})`], ["documents", `Docs (${project.documents.length})`]].map(([id, label]) => (
                <button key={id} onClick={() => setBibleTab(id)}
                  style={{ ...S.bibleTabBtn, borderBottom: bibleTab === id ? `3px solid ${stage.color}` : "3px solid transparent", fontWeight: bibleTab === id ? 700 : 400 }}>
                  {label}
                </button>
              ))}
            </div>
            <div style={S.bibleBody}>
              {bibleTab === "characters" && (project.characters.length === 0
                ? <BibleEmpty text='No character sheets yet. Press "⟳ Update Story Bible" and I will extract everyone from your material.' />
                : project.characters.map((c, i) => (
                  <div key={i} style={S.card}>
                    <div style={S.cardHead}>
                      <strong>{c.name}</strong>
                      <button style={S.del} onClick={() => deleteItem("characters", i)} aria-label="Delete">✕</button>
                    </div>
                    <table style={S.table}><tbody>
                      {[["Age", c.age], ["Role", c.role], ["Looks", c.appearance], ["Want", c.want], ["Flaw", c.flaw], ["Arc", c.arc], ["Voice", c.voice]].filter(([, v]) => v).map(([k, v]) => (
                        <tr key={k}><td style={S.tdKey}>{k}</td><td style={S.tdVal}>{v}</td></tr>
                      ))}
                    </tbody></table>
                  </div>
                )))}
              {bibleTab === "places" && (project.places.length === 0
                ? <BibleEmpty text='No places yet. Press "⟳ Update Story Bible" to extract locations and how they were described.' />
                : project.places.map((pl, i) => (
                  <div key={i} style={S.card}>
                    <div style={S.cardHead}>
                      <strong>{pl.name}</strong>
                      <button style={S.del} onClick={() => deleteItem("places", i)} aria-label="Delete">✕</button>
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>{pl.description}</div>
                  </div>
                )))}
              {bibleTab === "outline" && (
                <>
                  {project.foundation && (
                    <div style={S.card}><div style={S.cardHead}><strong>Foundations</strong></div><div style={S.mono}>{project.foundation}</div></div>
                  )}
                  {project.outline
                    ? <div style={S.card}><div style={S.cardHead}><strong>Outline / Beat Sheet</strong></div><div style={S.mono}>{project.outline}</div></div>
                    : <BibleEmpty text='No outline saved. In stage 2, press "Save as Outline" under a response you like.' />}
                </>
              )}
              {bibleTab === "scenes" && (project.scenes.length === 0
                ? <BibleEmpty text='No scenes saved. In stage 3, press "Save as Scene" under a finished scene.' />
                : project.scenes.map((sc, i) => (
                  <div key={i} style={S.card}>
                    <div style={S.cardHead}>
                      <strong style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12 }}>{i + 1}. {sc.title}</strong>
                      <span>
                        <button style={S.del} onClick={() => setExpanded(expanded === `s${i}` ? null : `s${i}`)}>{expanded === `s${i}` ? "▲" : "▼"}</button>
                        <button style={S.del} onClick={() => deleteItem("scenes", i)} aria-label="Delete">✕</button>
                      </span>
                    </div>
                    {expanded === `s${i}` && <div style={S.mono}>{sc.text}</div>}
                  </div>
                )))}
              {bibleTab === "documents" && (project.documents.length === 0
                ? <BibleEmpty text='No submission documents yet. Generate them in stage 6 and press "Save as Document".' />
                : project.documents.map((d, i) => (
                  <div key={i} style={S.card}>
                    <div style={S.cardHead}>
                      <strong>{d.title}</strong>
                      <span>
                        <button style={S.del} onClick={() => setExpanded(expanded === `d${i}` ? null : `d${i}`)}>{expanded === `d${i}` ? "▲" : "▼"}</button>
                        <button style={S.del} onClick={() => deleteItem("documents", i)} aria-label="Delete">✕</button>
                      </span>
                    </div>
                    {expanded === `d${i}` && <div style={S.mono}>{d.text}</div>}
                  </div>
                )))}
            </div>
          </aside>
        )}
      </div>

      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}

function BibleEmpty({ text }) {
  return <div style={{ padding: 20, fontSize: 13, color: "#77746b", lineHeight: 1.6, fontStyle: "italic" }}>{text}</div>;
}

/* ---------- styles ---------- */
function styles(stage) {
  const ui = "'Inter', system-ui, sans-serif";
  const mono = "'Courier Prime', 'Courier New', monospace";
  return {
    app: { height: "100vh", display: "flex", flexDirection: "column", background: "#26282c", fontFamily: ui, color: "#26241f" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "10px 16px", background: "#1c1e21", borderBottom: "1px solid #3a3d42", flexWrap: "wrap" },
    titleInput: { background: "transparent", border: "none", borderBottom: "1px dashed #55585e", color: "#c9c6bc", fontFamily: mono, fontSize: 14, padding: "2px 4px", minWidth: 120, maxWidth: 300 },
    headBtn: { background: "transparent", border: "1px solid #55585e", color: "#d8d5cc", borderRadius: 4, padding: "6px 12px", fontSize: 12, fontFamily: ui },
    body: { flex: 1, display: "flex", minHeight: 0 },
    rail: { width: 190, display: "flex", flexDirection: "column", gap: 6, padding: "14px 8px 14px 10px", background: "#26282c", overflowY: "auto", flexShrink: 0 },
    tab: { textAlign: "left", border: "none", borderRadius: "0 4px 4px 0", padding: "9px 10px", fontFamily: ui, transition: "transform .15s, background .15s", boxShadow: "0 1px 3px rgba(0,0,0,.35)" },
    railNote: { marginTop: "auto", fontSize: 10.5, color: "#6d7076", lineHeight: 1.5, padding: "10px 6px 0" },
    main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#F7F5EC", margin: "14px 14px 14px 4px", borderRadius: 6, boxShadow: "0 4px 18px rgba(0,0,0,.4)", overflow: "hidden", borderTop: `6px solid ${stage.color}` },
    slugBar: { display: "flex", alignItems: "baseline", gap: 14, padding: "12px 20px 8px", borderBottom: "1px solid #e2dfd4", flexWrap: "wrap" },
    slug: { fontFamily: mono, fontWeight: 700, fontSize: 14, letterSpacing: 0.5, color: "#26241f" },
    slugDesc: { fontSize: 12.5, color: "#77746b" },
    roleRow: { display: "flex", gap: 8, padding: "10px 20px 0", flexWrap: "wrap" },
    roleBtn: { border: "1px solid", borderRadius: 4, padding: "7px 12px", fontSize: 13, fontFamily: ui, textAlign: "left" },
    chatArea: { flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 },
    empty: { margin: "auto", maxWidth: 420, textAlign: "center", color: "#77746b", fontSize: 14, lineHeight: 1.6 },
    userMsg: { alignSelf: "flex-end", maxWidth: "82%", background: stage.color, color: stage.ink, borderRadius: "8px 8px 2px 8px", padding: "10px 14px", fontSize: 14, lineHeight: 1.55, boxShadow: "0 1px 2px rgba(0,0,0,.12)" },
    aiMsg: { alignSelf: "flex-start", maxWidth: "88%", background: "#fff", border: "1px solid #e2dfd4", borderRadius: "8px 8px 8px 2px", padding: "10px 14px", fontSize: 14, lineHeight: 1.55, fontFamily: mono, boxShadow: "0 1px 2px rgba(0,0,0,.06)" },
    msgLabel: { fontSize: 10, letterSpacing: 1.5, opacity: 0.55, marginBottom: 4, fontFamily: ui, fontWeight: 600 },
    actionRow: { display: "flex", gap: 8, padding: "8px 20px", flexWrap: "wrap", borderTop: "1px dashed #e2dfd4" },
    saveBtn: { background: stage.ink, color: "#fff", border: "none", borderRadius: 4, padding: "6px 12px", fontSize: 12, fontWeight: 600 },
    starter: { background: "transparent", border: "1px solid #c9c6bc", color: "#57544b", borderRadius: 14, padding: "5px 12px", fontSize: 12 },
    inputRow: { display: "flex", gap: 10, padding: "10px 20px 16px", alignItems: "flex-end" },
    textarea: { flex: 1, resize: "none", border: "1px solid #c9c6bc", borderRadius: 6, padding: "10px 12px", fontSize: 14, fontFamily: ui, background: "#fff", lineHeight: 1.5 },
    sendBtn: { background: stage.color, color: stage.ink, border: "none", borderRadius: 6, padding: "10px 20px", fontWeight: 700, fontSize: 14 },
    bible: { width: 340, background: "#EFEDE3", margin: "14px 14px 14px 0", borderRadius: 6, display: "flex", flexDirection: "column", boxShadow: "0 4px 18px rgba(0,0,0,.4)", overflow: "hidden", flexShrink: 0 },
    bibleHead: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: "2px solid #26241f" },
    closeBtn: { background: "transparent", border: "none", fontSize: 14, color: "#57544b" },
    bibleTabs: { display: "flex", flexWrap: "wrap", borderBottom: "1px solid #d5d2c6" },
    bibleTabBtn: { flex: "1 0 auto", background: "transparent", border: "none", padding: "8px 6px", fontSize: 11.5, color: "#3d3a32" },
    bibleBody: { flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 },
    card: { background: "#fff", border: "1px solid #ddd9cc", borderRadius: 4, padding: "10px 12px", boxShadow: "1px 2px 0 rgba(0,0,0,.06)" },
    cardHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: 14 },
    del: { background: "transparent", border: "none", color: "#a5a196", fontSize: 12, marginLeft: 6 },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 12.5 },
    tdKey: { color: "#8a8679", padding: "3px 8px 3px 0", verticalAlign: "top", whiteSpace: "nowrap", width: 48 },
    tdVal: { padding: "3px 0", lineHeight: 1.45 },
    mono: { fontFamily: mono, fontSize: 12.5, whiteSpace: "pre-wrap", lineHeight: 1.5, maxHeight: 300, overflowY: "auto" },
    toast: { position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#26241f", color: "#F7F5EC", padding: "8px 18px", borderRadius: 20, fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,.4)", zIndex: 50 },
  };
}
