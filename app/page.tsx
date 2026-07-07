"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import EasterEggs from "./components/EasterEggs";

type SiteMode = "dark" | "light" | "matrix" | "dos" | "ussr";

const themes: Record<string, Record<string, string>> = {
  matrix: {
    bg: "#000000", bgCard: "#001100", bgCardHover: "#002200",
    text: "#00ff41", textDim: "#009921", textMuted: "#004d14",
    accent: "#00ff41", accentAlt: "#00cc33", accentWarm: "#ffcc00",
    border: "#001908", borderHover: "#003311",
    red: "#ff4444", green: "#00ff41", yellow: "#ffcc00",
    tagBg: "rgba(0,255,65,0.08)", tagBorder: "rgba(0,255,65,0.2)", tagText: "#00cc33",
    btnPrimary: "#00ff41", btnText: "#000000",
    btnGlow: "none", btnGlowHover: "none",
    switchIcon: "✕", switchLabel: "EXIT",
  },
  dos: {
    bg: "#000080", bgCard: "#0000aa", bgCardHover: "#0000cc",
    text: "#ffffff", textDim: "#aaaaaa", textMuted: "#555588",
    accent: "#ffff55", accentAlt: "#55ffff", accentWarm: "#ff5555",
    border: "#5555ff", borderHover: "#8888ff",
    red: "#ff5555", green: "#55ff55", yellow: "#ffff55",
    tagBg: "rgba(255,255,85,0.1)", tagBorder: "rgba(255,255,85,0.3)", tagText: "#ffff55",
    btnPrimary: "#aaaaaa", btnText: "#000080",
    btnGlow: "none", btnGlowHover: "none",
    switchIcon: "✕", switchLabel: "EXIT",
  },
  ussr: {
    bg: "#0a0000", bgCard: "#150000", bgCardHover: "#200000",
    text: "#ff6666", textDim: "#cc0000", textMuted: "#550000",
    accent: "#ff0000", accentAlt: "#ff3333", accentWarm: "#ff6600",
    border: "#440000", borderHover: "#660000",
    red: "#ff0000", green: "#ff6666", yellow: "#ff9900",
    tagBg: "rgba(255,0,0,0.08)", tagBorder: "rgba(255,0,0,0.25)", tagText: "#cc0000",
    btnPrimary: "#cc0000", btnText: "#ffffff",
    btnGlow: "none", btnGlowHover: "none",
    switchIcon: "✕", switchLabel: "ВЫХОД",
  },
  dark: {
    bg: "#0f0f11", bgCard: "#18181b", bgCardHover: "#1f1f23",
    text: "#e4e4e7", textDim: "#71717a", textMuted: "#3f3f46",
    accent: "#a855f7", accentAlt: "#38bdf8", accentWarm: "#fb923c",
    border: "#27272a", borderHover: "#52525b",
    red: "#ef4444", green: "#22c55e", yellow: "#eab308",
    tagBg: "rgba(168,85,247,0.08)", tagBorder: "rgba(168,85,247,0.2)", tagText: "#c084fc",
    btnPrimary: "linear-gradient(135deg, #a855f7, #7c3aed)", btnText: "#fff",
    btnGlow: "0 0 24px rgba(168,85,247,0.25)", btnGlowHover: "0 0 40px rgba(168,85,247,0.4)",
    switchIcon: "☀", switchLabel: "Light",
  },
  light: {
    bg: "#F7F5F0", bgCard: "#fff", bgCardHover: "#FAFAF6",
    text: "#1A1A1A", textDim: "#777", textMuted: "#BBB",
    accent: "#C41E3A", accentAlt: "#C41E3A", accentWarm: "#C41E3A",
    border: "#E8E4DC", borderHover: "#CCC",
    red: "#C41E3A", green: "#2E7D32", yellow: "#E65100",
    tagBg: "#F0EDE6", tagBorder: "#E8E4DC", tagText: "#999",
    btnPrimary: "#C41E3A", btnText: "#fff",
    btnGlow: "none", btnGlowHover: "none",
    switchIcon: "🌙", switchLabel: "Dark",
  },
};

const features = [
  { title: "Security", jp: "安全", codeAccent: "red", desc: "17-phase adaptive detection. Prompt injection, credential leaks, tool abuse, delegation chain attacks. 33+ signatures across 10 categories.",
    iconD: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    code: `# Blocked: prompt injection via issue delegation\n# Phase: Injection Shield (phase 4) + Crystal Alert\n# Detection: 96% explicit patterns, 0 false positives\n# Severity: HIGH → request terminated` },
  { title: "Cost Control", jp: "節約", codeAccent: "green", desc: "Context compression saves 80–90% tokens in growing-context sessions. Semantic cache. Thompson Sampling model routing. Per-request budget enforcement — not per-heartbeat.",
    iconD: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    code: `# Tokens: 4,847 → 612 (87% saved)\n# Cost: $0.043 → $0.006\n# Method: context compression + cache hit\n# Loop detected at call #3 → saved $55-150` },
  { title: "Reliability", jp: "回復", codeAccent: "yellow", desc: "Auto-healing with 6 recovery actions. Loop detection at call #3 — saves $55–150 per incident. 450× faster than heartbeat-based checks. MAST & OWASP compliance mapping.",
    iconD: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10"/><path d="M12 6v6l4 2"/><path d="M22 12l-4 4-2-2"/></svg>,
    code: `# Loop detected: 3 identical tool calls in 60s\n# Action: Circuit breaker → 429 Too Many Requests\n# Saved: $55 (vs $150 at next heartbeat check)\n# Speed: 450× faster detection` },
  { title: "Observability", jp: "透明", codeAccent: "cyan", desc: "Real-time dashboard, runs locally. Fleet-level correlation: which agent did what, and why it cost so much. Independent audit log — tamper-resistant, outside your orchestrator.",
    iconD: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><polyline points="7 11 10 8 13 11 17 7"/></svg>,
    code: `# Fleet: 5 agents monitored\n# Cross-agent data flow: Agent A → Agent B detected\n# Cost: Orchesis $4.50 vs reported $0.00\n# Independent audit: 12,847 requests logged` },
];

const specs = [
  { key: "Pipeline", val: "17 phases" }, { key: "Dependencies", val: "0" },
  { key: "Signatures", val: "33+ across 10 categories" }, { key: "Recovery", val: "6 auto-heal actions" },
  { key: "MAST Coverage", val: "78.6%" }, { key: "OWASP Coverage", val: "80%" },
  { key: "Token Savings", val: "80–90%" }, { key: "License", val: "MIT" },
];

const LOG_EVENTS = [
  { status: "BLOCKED", event: "prompt_injection",   sev: "HIGH",     agent: "openclaw_01" },
  { status: "CACHED",  event: "semantic_match",     sev: "INFO",     agent: "crewai_02" },
  { status: "BLOCKED", event: "credential_leak",    sev: "CRITICAL", agent: "langchain_03" },
  { status: "PASS",    event: "context_compress",   sev: "INFO",     agent: "autogen_04" },
  { status: "BLOCKED", event: "loop_detected",      sev: "HIGH",     agent: "openclaw_01" },
  { status: "HEAL",    event: "retry_other_model",  sev: "WARN",     agent: "crewai_02" },
  { status: "PASS",    event: "budget_check",       sev: "INFO",     agent: "langchain_03" },
  { status: "BLOCKED", event: "tool_abuse",         sev: "HIGH",     agent: "autogen_04" },
  { status: "CACHED",  event: "semantic_match",     sev: "INFO",     agent: "openclaw_01" },
  { status: "PASS",    event: "anomaly_det",        sev: "INFO",     agent: "crewai_02" },
];

const CODE_TABS = {
  Python: `# Before:
client = OpenAI(base_url="https://api.openai.com/v1")

# After — one line change:
client = OpenAI(base_url="http://localhost:8080/v1")
# ↑ 17 security phases now active`,
  curl: `# Before:
curl https://api.openai.com/v1/chat/completions \\
  -H "Authorization: Bearer $KEY" -d '{...}'

# After — one line change:
curl http://localhost:8080/v1/chat/completions \\
  -H "Authorization: Bearer $KEY" -d '{...}'
# ↑ 17 security phases now active`,
  "Node.js": `// Before:
const openai = new OpenAI({ baseURL: "https://api.openai.com/v1" });

// After — one line change:
const openai = new OpenAI({ baseURL: "http://localhost:8080/v1" });
// ↑ 17 security phases now active`,
};

function AnimNum({ target, delay = 0 }: { target: number; delay?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const s = Date.now();
      const iv = setInterval(() => {
        const p = Math.min((Date.now() - s) / 1800, 1);
        setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p >= 1) clearInterval(iv);
      }, 16);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return <>{val}</>;
}

function ThreatLog({ lightMode = false, isDos = false, isUssr = false, isMobile = false }: { lightMode?: boolean; isDos?: boolean; isUssr?: boolean; isMobile?: boolean }) {
  const [logs, setLogs] = useState<Array<{ id: number; time: string; status: string; event: string; sev: string; agent: string; fade: boolean }>>([]);
  const idxRef = useRef(0);
  const idRef = useRef(0);

  const statusColor = (s: string) => {
    if (s === "BLOCKED") return "#ef4444";
    if (s === "CACHED") return "#38bdf8";
    if (s === "HEAL") return "#fb923c";
    if (s === "PASS") return "#22c55e";
    return "#71717a";
  };
  const sevColor = (s: string) => {
    if (s === "CRITICAL") return "#ef4444";
    if (s === "HIGH") return "#f97316";
    if (s === "WARN") return "#eab308";
    return "#22c55e";
  };

  useEffect(() => {
    const tick = () => {
      const e = LOG_EVENTS[idxRef.current % LOG_EVENTS.length];
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      const entry = { id: idRef.current++, time, ...e, fade: false };
      idxRef.current++;
      setLogs(prev => {
        const next = [...prev, entry];
        return next.slice(-7);
      });
    };
    tick();
    const iv = setInterval(tick, 1800);
    return () => clearInterval(iv);
  }, []);

  return (
    <section style={{ maxWidth: "800px", margin: "0 auto 48px", padding: isMobile ? "0 20px" : "0 48px" }}>
      <div style={{ background: isDos ? "#000080" : (lightMode ? "#F0EDE6" : "#0a0a0a"), border: `1px solid ${isDos ? "#5555ff" : (lightMode ? "#E8E4DC" : "#1a1a1a")}`, borderRadius: isDos ? "0" : "12px", overflow: "hidden", maxWidth: "100%" }}>
        <div style={{ background: isDos ? "#0000aa" : (lightMode ? "#E8E4DC" : "#111"), borderBottom: `1px solid ${isDos ? "#5555ff" : (lightMode ? "#D8D4CC" : "#1a1a1a")}`, padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: isDos ? "#ffff55" : (lightMode ? "#999" : "#3f3f46"), fontFamily: "'JetBrains Mono','SF Mono',monospace", letterSpacing: "0.1em" }}>{isDos ? "C:\\ORCHESIS\\LOGS> TYPE THREAT_LOG.TXT" : "ORCHESIS_THREAT_LOG"}</span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: isDos ? "#55ff55" : "#22c55e", fontFamily: "'JetBrains Mono','SF Mono',monospace" }}>
            {!isDos && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "livePulse 1.5s ease-in-out infinite" }} />}
            {isDos ? "[LIVE]" : "LIVE"}
          </span>
        </div>
        <div style={{ padding: "12px 0", minHeight: "220px", background: isDos ? "#000080" : "transparent" }}>
          {logs.map((log) => (
            <div key={log.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "6px 20px", fontSize: "12px", fontFamily: "'JetBrains Mono','SF Mono',monospace", transition: "opacity 0.4s", animation: "logSlide 0.3s ease-out" }}>
              <span style={{ color: isDos ? "#aaaaaa" : (lightMode ? "#BBB" : "#3f3f46"), minWidth: "60px", flexShrink: 0 }}>{log.time}</span>
              <span style={{ color: statusColor(log.status), fontWeight: 700, minWidth: "64px", flexShrink: 0 }}>{log.status}</span>
              <span style={{ color: isDos ? "#aaaaaa" : (lightMode ? "#888" : "#52525b"), flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.event}</span>
              <span style={{ color: isDos ? "#aaaaaa" : (lightMode ? "#BBB" : "#3f3f46"), flexShrink: 0 }}>sev=<span style={{ color: sevColor(log.sev), fontWeight: log.sev === "CRITICAL" ? 700 : 400 }}>{log.sev}</span></span>
<span style={{ color: isDos ? "#555588" : (lightMode ? "#CCC" : "#27272a"), flexShrink: 0, display: isMobile ? "none" : "flex" }}>agent=<span style={{ color: isDos ? "#aaaaaa" : (lightMode ? "#AAA" : "#3f3f46") }}>{log.agent}</span></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveCounters({ t, isDark, isMatrix, isDos, isMobile }: { t: Record<string, string>; isDark: boolean; isMatrix: boolean; isDos: boolean; isMobile: boolean }) {
  const [threats, setThreats] = useState(0);
  const [money, setMoney] = useState(0);
  const [agents, setAgents] = useState(0);
  const targets = { threats: 14847, money: 23412, agents: 1204 };

  // Animate on mount
  useEffect(() => {
    const start = Date.now();
    const dur = 1500;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setThreats(Math.round(targets.threats * e));
      setMoney(Math.round(targets.money * e));
      setAgents(Math.round(targets.agents * e));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  // Organic increments
  useEffect(() => {
    const iv = setInterval(() => {
      setThreats(v => v + Math.floor(Math.random() * 3) + 1);
      setMoney(v => v + Math.floor(Math.random() * 43 + 12) / 100);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(iv);
  }, []);

  const items = [
    { label: isMatrix ? "SECURITY_PHASES" : isDos ? "SECURITY PHASES" : "Security Phases",  value: "17", accent: t.red },
    { label: isMatrix ? "PASSING_TESTS" : isDos ? "PASSING TESTS" : "Passing Tests",       value: "4,813", accent: t.accent },
    { label: isMatrix ? "ADDED_LATENCY" : isDos ? "ADDED LATENCY" : "Added Latency",  value: "<3ms", accent: t.accentAlt },
    { label: isMatrix ? "DETECTION_PATTERNS" : isDos ? "DETECTION PATTERNS" : "Detection Patterns",  value: "33+", accent: t.yellow },
  ];

  return (
    <>
    {isDos ? (
      <section style={{ maxWidth: "800px", margin: "0 auto 40px", padding: isMobile ? "0 20px" : "0 48px" }}>
        <div style={{ border: "1px solid #55ffff", background: "#000080", padding: "12px 16px", fontFamily: "'Courier New',monospace" }}>
          <div style={{ borderBottom: "1px solid #55ffff", paddingBottom: "6px", marginBottom: "10px", fontSize: "12px", color: "#ffff55", letterSpacing: "0.1em" }}>
            &#9484;&#9472; SYSTEM MONITOR &#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9488;
          </div>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", fontSize: "13px" }}>
              <span style={{ color: "#aaaaaa" }}>{item.label}{"."
                .repeat(Math.max(2, 28 - item.label.length))}</span>
              <span style={{ color: item.accent, fontWeight: 700 }}>{item.value}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #55ffff", marginTop: "10px", paddingTop: "6px", fontSize: "11px", color: "#555588" }}>
            &#9492;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9496;
          </div>
        </div>
      </section>
    ) : (
      <section style={{ maxWidth: "800px", margin: "0 auto 40px", padding: isMobile ? "0 20px" : "0 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: "1px", background: t.border, borderRadius: "16px", overflow: "hidden", border: `1px solid ${t.border}` }}>
          {items.map((item, i) => (
            <div key={i} style={{ background: t.bg, padding: "32px 24px", textAlign: "center", transition: "background 0.3s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = t.bgCard}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = t.bg}
            >
              <div style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-0.04em", color: item.accent, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                {item.value}
              </div>
              <div style={{ fontSize: "13px", color: t.textDim, marginTop: "8px", letterSpacing: "0.02em" }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>
    )}
    </>
  );
}



// ─── Radar Demo Component ──────────────────────────────────────────────────

const RADAR_AGENTS = [
  { id: "main",  name: "main",         role: "orchestrator", status: "working", model: "claude-opus-4-6",  cost: 0.44, grade: "A+", threats: 0, task: "Coordinating pipeline..." },
  { id: "res",   name: "research_01",  role: "worker",       status: "working", model: "gpt-4o",           cost: 0.18, grade: "A+", threats: 0, task: "Scraping pricing data..." },
  { id: "code",  name: "coding_02",    role: "worker",       status: "idle",    model: "claude-sonnet",    cost: 0.07, grade: "A",  threats: 0, task: "Waiting for results..." },
  { id: "qa",    name: "qa_03",        role: "worker",       status: "error",   model: "gpt-4o-mini",      cost: 0.03, grade: "B+", threats: 1, task: "Test timeout exceeded" },
  { id: "mkt",   name: "marketing_04", role: "worker",       status: "working", model: "gpt-4o-mini",      cost: 0.09, grade: "A",  threats: 0, task: "Drafting threads..." },
  { id: "scout", name: "scout_sub",    role: "subagent",     status: "working", model: "gemini-flash",     cost: 0.02, grade: "A+", threats: 0, task: "Scanning 14 URLs...", parent: "res" },
];

function gradeRing(g: string): number {
  if (g === "A+" || g === "A") return 72;
  if (g === "B+" || g === "B") return 138;
  return 195;
}

// Fixed positions on radar (angle in degrees, radius fraction 0-1)
const AGENT_POS: Record<string, { angle: number; r: number }> = {
  main:  { angle: 0,   r: 0.18 },
  res:   { angle: 45,  r: 0.48 },
  code:  { angle: 135, r: 0.48 },
  qa:    { angle: 225, r: 0.55 },
  mkt:   { angle: 315, r: 0.45 },
  scout: { angle: 70,  r: 0.72 },
};

type RadarMode = "dark" | "light" | "matrix" | "dos" | "ussr";

interface RadarTheme {
  bg: string; ring: string; sweep: string; sweepFill: string;
  safe: string; warn: string; text: string; accent: string; grid: string;
}

function getRadarTheme(mode: RadarMode): RadarTheme {
  if (mode === "matrix") return { bg: "#001100", ring: "rgba(0,255,65,.18)", sweep: "#00ff41", sweepFill: "rgba(0,255,65,.1)", safe: "rgba(0,255,65,.07)", warn: "rgba(0,200,0,.05)", text: "#00cc33", accent: "#00ff41", grid: "rgba(0,255,65,.08)" };
  if (mode === "dos")    return { bg: "#0a0800", ring: "rgba(255,165,0,.2)",  sweep: "#ffa500", sweepFill: "rgba(255,165,0,.1)", safe: "rgba(255,165,0,.07)", warn: "rgba(0,255,0,.05)", text: "#cc8800", accent: "#ffa500", grid: "rgba(255,165,0,.08)" };
  if (mode === "ussr")   return { bg: "#1a0000", ring: "rgba(220,20,20,.2)",  sweep: "#dc1414", sweepFill: "rgba(220,20,20,.1)", safe: "rgba(220,20,20,.07)", warn: "rgba(255,165,0,.05)", text: "#aa3333", accent: "#ff4444", grid: "rgba(220,20,20,.08)" };
  if (mode === "light")  return { bg: "#f8f8f8", ring: "rgba(124,58,237,.18)", sweep: "#7c3aed", sweepFill: "rgba(124,58,237,.08)", safe: "rgba(124,58,237,.05)", warn: "rgba(249,115,22,.04)", text: "#555", accent: "#7c3aed", grid: "rgba(124,58,237,.07)" };
  return { bg: "#090909", ring: "rgba(168,85,247,.15)", sweep: "#a855f7", sweepFill: "rgba(168,85,247,.12)", safe: "rgba(168,85,247,.06)", warn: "rgba(249,115,22,.04)", text: "#666", accent: "#a855f7", grid: "rgba(168,85,247,.06)" };
}

function agentColor(status: string, mode: RadarMode): string {
  if (mode === "matrix") return status === "error" ? "#ff0000" : status === "idle" ? "#004400" : "#00ff41";
  if (mode === "dos")    return status === "error" ? "#ff4444" : status === "idle" ? "#555500" : "#ffa500";
  if (mode === "ussr")   return status === "error" ? "#ff0000" : status === "idle" ? "#550000" : "#ff4444";
  if (mode === "light")  return status === "error" ? "#dc2626" : status === "idle" ? "#9ca3af" : "#16a34a";
  return status === "error" ? "#ef4444" : status === "idle" ? "#3f3f46" : "#22c55e";
}

function agentName(a: typeof RADAR_AGENTS[0], mode: RadarMode): string {
  if (mode === "dos")  return a.name.toUpperCase().replace(/_/g, "-") + ".EXE";
  if (mode === "ussr") return a.role === "orchestrator" ? "ГЛАВНЫЙ" : `АГЕНТ-${a.id.slice(-2).toUpperCase()}`;
  return a.name;
}

function RadarDemo({ mode, t: _t, isMobile }: { mode: RadarMode; t: Record<string, string>; isMobile: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [sweep, setSweep] = useState(0);
  const rt = getRadarTheme(mode);
  const size = isMobile ? 320 : 420;
  const cx = size / 2, cy = size / 2;
  const maxR = size / 2 - 24;

  useEffect(() => {
    const iv = setInterval(() => setSweep(s => (s + 1.5) % 360), 30);
    return () => clearInterval(iv);
  }, []);

  const sel = RADAR_AGENTS.find(a => a.id === selected);

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "24px", alignItems: "center", justifyContent: "center", maxWidth: "700px", margin: "0 auto" }}>
      {/* SVG Radar */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg width={size} height={size} style={{ borderRadius: "50%", background: rt.bg, display: "block" }}>
          {/* Grid rings */}
          {[0.33, 0.55, 0.78, 1].map((r, i) => (
            <circle key={i} cx={cx} cy={cy} r={maxR * r} fill="none" stroke={rt.ring} strokeWidth="1" opacity={0.7} />
          ))}
          {/* Grid lines */}
          {[0, 45, 90, 135].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            return <line key={i} x1={cx - maxR * Math.cos(rad)} y1={cy - maxR * Math.sin(rad)} x2={cx + maxR * Math.cos(rad)} y2={cy + maxR * Math.sin(rad)} stroke={rt.grid} strokeWidth="1" />;
          })}
          {/* Security zones */}
          <circle cx={cx} cy={cy} r={maxR * 0.33} fill={rt.safe} />
          <circle cx={cx} cy={cy} r={maxR * 0.55} fill="none" stroke={rt.ring} strokeWidth="0" />
          <circle cx={cx} cy={cy} r={maxR * 0.78} fill={rt.warn} />
          {/* Sweep */}
          {(() => {
            const rad = (sweep * Math.PI) / 180;
            const len = maxR;
            return (
              <g>
                <defs>
                  <radialGradient id="sweepGrad">
                    <stop offset="0%" stopColor={rt.sweepFill} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={rt.sweepFill} stopOpacity="0" />
                  </radialGradient>
                </defs>
                <path
                  d={`M ${cx} ${cy} L ${cx + len * Math.cos(rad)} ${cy + len * Math.sin(rad)} A ${len} ${len} 0 0 0 ${cx + len * Math.cos(rad - 0.5)} ${cy + len * Math.sin(rad - 0.5)} Z`}
                  fill={rt.sweepFill}
                  opacity="0.8"
                />
                <line x1={cx} y1={cy} x2={cx + len * Math.cos(rad)} y2={cy + len * Math.sin(rad)} stroke={rt.sweep} strokeWidth="1.5" opacity="0.9" />
              </g>
            );
          })()}
          {/* Agent dots */}
          {RADAR_AGENTS.map(agent => {
            const pos = AGENT_POS[agent.id];
            const rad = (pos.angle * Math.PI) / 180;
            const r = pos.r * maxR;
            const x = cx + r * Math.cos(rad);
            const y = cy + r * Math.sin(rad);
            const color = agentColor(agent.status, mode);
            const isSelected = selected === agent.id;
            const dotR = agent.role === "orchestrator" ? 8 : agent.role === "subagent" ? 4 : 6;
            return (
              <g key={agent.id} style={{ cursor: "pointer" }} onClick={() => setSelected(selected === agent.id ? null : agent.id)}>
                {/* Pulse ring */}
                {agent.status === "working" && (
                  <circle cx={x} cy={y} r={dotR + 6} fill="none" stroke={color} strokeWidth="1" opacity="0.3">
                    <animate attributeName="r" values={`${dotR+4};${dotR+10};${dotR+4}`} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Dot */}
                <circle cx={x} cy={y} r={dotR} fill={color} stroke={isSelected ? rt.sweep : "none"} strokeWidth={isSelected ? 2 : 0} />
                {/* Threat indicator */}
                {agent.threats > 0 && <circle cx={x + dotR} cy={y - dotR} r={3} fill="#ef4444" />}
                {/* Label */}
                <text x={x} y={y + dotR + 12} textAnchor="middle" fontSize="9" fill={rt.text} fontFamily={mode === "matrix" || mode === "dos" ? "'Courier New'" : "system-ui"}>
                  {agentName(agent, mode)}
                </text>
              </g>
            );
          })}
          {/* Center dot */}
          <circle cx={cx} cy={cy} r={3} fill={rt.sweep} opacity="0.8" />
        </svg>
      </div>

      {/* Info panel */}
      <div style={{ minWidth: isMobile ? "100%" : "200px", maxWidth: isMobile ? "100%" : "220px" }}>
        {sel ? (
          <div style={{ background: "rgba(168,85,247,0.06)", border: `1px solid rgba(168,85,247,0.2)`, borderRadius: "10px", padding: "16px", fontSize: "12px", lineHeight: 1.7 }}>
            <div style={{ fontWeight: 700, color: _t.text, marginBottom: "8px", fontSize: "13px" }}>{agentName(sel, mode)}</div>
            {[
              { k: mode === "ussr" ? "СТАТУС" : "Status", v: sel.status },
              { k: "Grade",  v: sel.grade },
              { k: "Model",  v: sel.model },
              { k: mode === "ussr" ? "СТОИМОСТЬ" : "Cost",  v: `$${sel.cost}` },
              { k: mode === "ussr" ? "УГРОЗЫ" : "Threats", v: String(sel.threats) },
              { k: mode === "ussr" ? "ЗАДАЧА" : "Task",    v: sel.task },
            ].map(row => (
              <div key={row.k} style={{ display: "flex", justifyContent: "space-between", gap: "8px", borderBottom: `1px solid ${_t.border}`, padding: "4px 0" }}>
                <span style={{ color: _t.textMuted }}>{row.k}</span>
                <span style={{ color: row.k === "Grade" ? _t.green : row.k === "Threats" && row.v !== "0" ? _t.red : _t.text, fontWeight: row.k === "Grade" ? 700 : 400, textAlign: "right" }}>{row.v}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: "12px", color: _t.textMuted, lineHeight: 1.8, paddingTop: "8px" }}>
            <div style={{ marginBottom: "16px" }}>
              {[
                { color: "#22c55e", label: mode === "ussr" ? "АКТИВЕН" : "Working" },
                { color: "#3f3f46", label: mode === "ussr" ? "ОЖИДАНИЕ" : "Idle" },
                { color: "#ef4444", label: mode === "ussr" ? "ОШИБКА" : "Error / Threat" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, flexShrink: 0, display: "inline-block" }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "11px", color: _t.textMuted }}>
              {mode === "ussr" ? "Нажми на агента для инспекции" : "Click any agent to inspect"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState<SiteMode>("dark");
  const [loaded, setLoaded] = useState(false);
  const [hovFeat, setHovFeat] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [stars, setStars] = useState<number | null>(null);
  const [codeTab, setCodeTab] = useState<keyof typeof CODE_TABS>("Python");
  const [glowIdx, setGlowIdx] = useState(0);
  const GLOW_TOTAL_AGENTS = 8;
  const GLOW_TOTAL_LLM = 9;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Fetch GitHub stars
  useEffect(() => {
    fetch("https://api.github.com/repos/poushwell/orchesis")
      .then(r => r.json())
      .then(d => { if (typeof d.stargazers_count === "number") setStars(d.stargazers_count); })
      .catch(() => {});
  }, []);

  const copyPip = useCallback(() => {
    navigator.clipboard.writeText("pip install orchesis").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  // Glow animation cycling through tags
  useEffect(() => {
    const total = GLOW_TOTAL_AGENTS + GLOW_TOTAL_LLM;
    const iv = setInterval(() => setGlowIdx(g => (g + 1) % total), 2000);
    return () => clearInterval(iv);
  }, []);

  const handleLogoClick = useCallback(() => {
    window.dispatchEvent(new CustomEvent("orchesis:logo-click"));
  }, []);

  const t = themes[mode] || themes["dark"];
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);
  const toggle = useCallback(() => setMode(m => m === "dark" ? "light" : "dark"), []);

  const anim = (d: number): React.CSSProperties => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? "translateY(0)" : "translateY(24px)",
    transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${d}s`,
  });

  const isEgg = mode === "matrix" || mode === "dos" || mode === "ussr";
  const isDark = mode !== "light";
  const isMatrix = mode === "matrix";
  const isDos = mode === "dos";
  const tx = (en: string, ru: string) => mode === "ussr" ? ru : en;
  const mx = (normal: string, matrix: string) => isMatrix ? matrix : normal;
  const dx = (normal: string, dos: string) => isDos ? dos : normal;

  const starsLabel = stars !== null ? `★ ${stars} Stars` : "★ Stars";

  return (
    <>
    <EasterEggs mode={mode} onActivate={setMode} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "What is Orchesis?", "acceptedAnswer": { "@type": "Answer", "text": "Orchesis is an open-source HTTP proxy that sits between AI agents and LLM APIs. It intercepts, inspects, and secures all traffic to detect prompt injection attacks, enforce governance policies, and provide complete audit logging." }},
        { "@type": "Question", "name": "How does Orchesis prevent prompt injection?", "acceptedAnswer": { "@type": "Answer", "text": "Orchesis scans all content passing through the proxy before it reaches the LLM. It applies 33+ pattern signatures and configurable security policies to identify and block injection attempts in real time." }},
        { "@type": "Question", "name": "Is Orchesis free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Orchesis is fully open source under the MIT license. Self-hosted, zero cost, no vendor lock-in." }},
        { "@type": "Question", "name": "Does Orchesis work with OpenClaw, Paperclip, and other agent frameworks?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Orchesis is a transparent HTTP proxy. Any agent framework that speaks OpenAI-compatible API works: OpenClaw, Paperclip, CrewAI, LangChain, AutoGen, Google ADK, Claude Code, Cursor. One config change — set base_url to localhost:8080." }},
        { "@type": "Question", "name": "Why use a proxy instead of an SDK for AI agent security?", "acceptedAnswer": { "@type": "Answer", "text": "An SDK inside a single agent sees one conversation from inside. A proxy sees every agent's traffic — cross-agent patterns, fleet-level metrics, and behavioral baselines. No code changes required. No vendor lock-in." }},
        { "@type": "Question", "name": "Can an AI agent detect its own compromise?", "acceptedAnswer": { "@type": "Answer", "text": "No. If a prompt injection modifies an agent's context, the agent's security checks run inside that modified context. This is proven mathematically (Self-Detection Impossibility). An external observer like a proxy compares behavior against the fleet baseline." }},
        { "@type": "Question", "name": "Does Orchesis work with Claude Code and Cursor?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Orchesis works with any agent that makes HTTP calls to LLM APIs, including Claude Code, Cursor, LangChain, CrewAI, and AutoGen." }},
        { "@type": "Question", "name": "How many security checks does the Orchesis MCP Scanner run?", "acceptedAnswer": { "@type": "Answer", "text": "The Orchesis MCP Security Scanner runs 100+ checks across 9 categories including CVE database matching, OWASP MCP Top 10 compliance, and IDE-specific config validation for Cursor, Claude Code, and OpenClaw." }},
      ]
    }) }} />
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, overflowX: "hidden", fontFamily: isEgg ? "'Courier New', monospace" : (isDark ? "'Geist', -apple-system, sans-serif" : "'Noto Sans JP', 'Helvetica Neue', sans-serif"), transition: "background 0.5s, color 0.5s", position: "relative", overflow: "hidden" }}>

      {/* Top accent line (light) */}
      {!isDark && <div style={{ height: "3px", background: t.accent, width: "100%" }} />}

      {/* Aurora (dark only) */}
      {isDark && !isEgg && <div style={{ position: "absolute", top: "-20%", left: "15%", width: "70%", height: "60%", background: "radial-gradient(ellipse at 30% 50%, rgba(168,85,247,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(56,189,248,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 70%, rgba(251,146,60,0.04) 0%, transparent 50%)", filter: "blur(60px)", animation: "aurora 12s ease-in-out infinite alternate", pointerEvents: "none" }} />}

      {/* Dot grid (dark only) */}
      {isDark && !isEgg && <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />}

      {/* ═══ NAV ═══ */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: isMobile ? "16px 20px" : "20px 48px", borderBottom: `1px solid ${t.border}`, position: "relative", zIndex: 10, ...anim(0) }}>
        <div onClick={handleLogoClick} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
          {isEgg ? (
            <div style={{ width: "24px", height: "24px", border: `2px solid ${t.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "8px", height: "8px", background: t.accent }} />
            </div>
          ) : isDark ? (
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #38bdf8)", opacity: 0.9 }} />
          ) : (
            <div style={{ width: "24px", height: "24px", border: `2px solid ${t.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "8px", height: "8px", background: t.accent }} />
            </div>
          )}
          <span style={{ fontSize: isDark ? "16px" : "13px", fontWeight: isDark ? 600 : 400, letterSpacing: isDark ? "-0.02em" : "0.2em", textTransform: isDark ? "none" : "uppercase" as const }}>
            {tx("Orchesis", "ОРХЕСИС")}
          </span>
        </div>

        <div style={{ display: "flex", gap: isMobile ? "12px" : "24px", alignItems: "center" }}>
          {!isMobile && [
            { label: tx("Docs", "Докс"), href: "https://github.com/poushwell/orchesis/blob/main/QUICK_START.md" },
            { label: isDos ? "SCAN" : mode === "ussr" ? "Скан" : "Scan", href: "/scan" },
            { label: isDos ? "TOOLS" : mode === "ussr" ? "Инструменты" : "Tools", href: "/tools" },
            { label: isDos ? "OPENCLAW" : isMatrix ? "OPENCLAW" : mode === "ussr" ? "OpenClaw" : "OpenClaw", href: "/openclaw" },
            { label: isDos ? "TELEGRAM" : isMatrix ? "TELEGRAM" : mode === "ussr" ? "Telegram" : "Telegram", href: "/telegram" },
            { label: isDos ? "PAPERCLIP" : isMatrix ? "PAPERCLIP" : "Paperclip", href: "/paperclip" },
            { label: tx("GitHub", "GitHub"), href: "https://github.com/poushwell/orchesis" },
            { label: tx("Blog", "Блог"), href: "/blog" },
          ].map(item => (
            <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              style={{ color: t.textDim, textDecoration: "none", fontSize: isDark ? "14px" : "11px", letterSpacing: isDark ? "0" : "0.08em", textTransform: isDark ? "none" : "uppercase" as const, transition: "color 0.2s" }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = t.text}
              onMouseLeave={e => (e.target as HTMLElement).style.color = t.textDim}
            >{item.label}</a>
          ))}

          {/* #1 — GitHub Stars badge in nav */}
          {!isMobile && (!isEgg || isMatrix || isDos || mode === "ussr") && (
            <a href="https://github.com/poushwell/orchesis" target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "6px", border: `1px solid ${t.border}`, background: t.bgCard, textDecoration: "none", transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget).style.borderColor = t.accent}
              onMouseLeave={e => (e.currentTarget).style.borderColor = t.border}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill={t.accent}>
                <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
              </svg>
              <span style={{ fontSize: "12px", color: t.textDim, fontWeight: 500 }}>
                {stars !== null ? stars : "—"}
              </span>
            </a>
          )}

          {mode !== "ussr" && (
          <button onClick={toggle} style={{ padding: "6px 14px", borderRadius: isDark ? "8px" : "0", border: `1px solid ${t.border}`, background: "transparent", color: t.textDim, fontSize: "12px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.3s" }}
            onMouseEnter={e => (e.currentTarget).style.borderColor = t.accent}
            onMouseLeave={e => (e.currentTarget).style.borderColor = t.border}
          >
            <span>{t.switchIcon}</span><span>{t.switchLabel}</span>
          </button>
          )}
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <main style={{ maxWidth: isDark ? "760px" : "920px", margin: "0 auto", padding: isMobile ? "40px 20px 48px" : (isDark ? "64px 48px 64px" : "64px 64px"), textAlign: isDark ? "center" : "left", position: "relative", zIndex: 10, display: (!isDark && !isMobile) ? "grid" : "block", gridTemplateColumns: (!isDark && !isMobile) ? "1fr 340px" : "none", gap: "60px" } as React.CSSProperties}>
        <div>
          {/* Badge */}
          <div style={anim(0.1)}>
            {isDark ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 16px", borderRadius: isMatrix ? "0" : "100px", background: t.tagBg, border: `1px solid ${t.tagBorder}`, fontSize: "13px", color: t.tagText, fontFamily: isMatrix ? "'Courier New',monospace" : "inherit" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: t.green, animation: isMatrix ? "livePulse 1s infinite" : "none" }} />
{isMatrix ? "[● SYSTEM_ONLINE · MIT_LICENSE]" : isDos ? "[ ORCHESIS BIOS v1.0 · MIT LICENSE ]" : tx("Open Source · MIT License", "Открытый код · MIT Лицензия")}
              </span>
            ) : (
              <p style={{ fontSize: "11px", color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 24px" }}>Runtime Gateway for AI Agents</p>
            )}
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: isDark ? "clamp(38px, 5vw, 60px)" : "clamp(32px, 4vw, 48px)", fontWeight: isDark ? 650 : 300, lineHeight: isDark ? 1.12 : 1.25, letterSpacing: "-0.04em", margin: isDark ? "28px 0 0" : "0 0 28px", ...anim(0.2) }}>
            {isDark ? (
              isMatrix ? (
                <>SEE_EVERYTHING<br />YOUR_AI_AGENTS<br /><span style={{ color: t.accent }}>DO.<span style={{ animation: "cur 1s step-end infinite" }}>_</span></span></>
              ) : isDos ? (
                <><span style={{ color: t.accent }}>C:\ORCHESIS&gt;</span> RUN CONTROL_PLANE.EXE<span style={{ animation: "cur 1s step-end infinite" }}>_</span></>
              ) : isEgg ? (
                <>{tx("The intelligent layer", "Контрольный уровень")}<br />{tx("between your agents", "между агентами")}<br /><span style={{ color: t.accent }}>{tx("and their decisions", "и их решениями")}</span></>
              ) : (
                <>See everything<br />your AI agents<br /><span style={{ background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentAlt} 40%, ${t.accentWarm} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>do.</span></>
              )
            ) : (
              <>One layer of<br /><span style={{ fontWeight: 600 }}>transparency</span><br />between intent<br />and execution.</>
            )}
          </h1>

          {/* Subheadline */}
          <p style={{ fontSize: isDark ? "17px" : "14px", lineHeight: isDark ? 1.65 : 1.8, color: t.textDim, maxWidth: isDark ? "460px" : "340px", margin: isDark ? "28px auto 0" : "0 0 36px", ...anim(0.35) }}>
{isDos ? (<><span style={{ color: t.green }}>Loading 17 detection phases....... [DONE]</span><br /><span style={{ color: t.green }}>Zero dependencies detected........ [OK]</span><br /><span style={{ color: t.green }}>MIT License verified.............. [OK]</span><br /><span style={{ color: t.textDim }}>Press any key to continue<span style={{ animation: "cur 1s step-end infinite" }}>_</span></span></>) : isMatrix ? "RUNTIME_GATEWAY://AI_AGENTS · BLOCK_THREATS · CUT_WASTE · MONITOR_FLEET · ONE_CONFIG" : mode === "ussr" ? "Прокси-шлюз для AI агентов. Блокируй угрозы. Режь токены. Следи за флотом. Одна настройка." : isDark ? tx("Runtime Gateway for AI Agents. Block threats. Cut token waste. Monitor your fleet. One config change.", "Прокси-шлюз для AI агентов. Блокировка угроз. Экономия токенов. Мониторинг флота. Одна настройка.") : "Runtime Gateway for AI Agents. Block threats. Cut token waste. Monitor your fleet. One config change."}
          </p>

          {/* Supporting line */}
          {(!isEgg || isMatrix || isDos || mode === "ussr") && (
            <p style={{ fontSize: "13px", lineHeight: 1.7, color: t.textMuted, maxWidth: isDark ? "480px" : "360px", margin: isDark ? "16px auto 0" : "0 0 28px", fontStyle: "italic", ...anim(0.42) }}>
              {isMatrix ? "> SDK sees one agent. Proxy sees everything. No code changes." : isDos ? "SDK: 1 agent. PROXY: ALL agents. Zero code changes." : mode === "ussr" ? "SDK видит одного агента. Прокси видит всё — без изменений кода." : "SDK sees one agent. Static analysis sees code. Proxy sees everything — in real time, without code changes."}
            </p>
          )}

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: "12px", justifyContent: isDark ? "center" : "flex-start", flexWrap: "wrap", ...anim(0.5) }}>
            <a href="https://github.com/poushwell/orchesis#quick-start" target="_blank" rel="noopener noreferrer"
              style={{ padding: isDark ? "13px 28px" : "12px 28px", borderRadius: isDark ? "12px" : "0", border: isDark ? "none" : `2px solid ${t.accent}`, background: t.btnPrimary, color: t.btnText, fontSize: isDark ? "14px" : "11px", fontWeight: 600, letterSpacing: isDark ? "0" : "0.1em", textTransform: isDark ? "none" : "uppercase" as const, cursor: "pointer", fontFamily: "inherit", boxShadow: t.btnGlow, transition: "all 0.3s", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              {isDos ? "[ GET_STARTED ]" : isDark ? tx(mx("Get Started", "GET_STARTED.EXE"), "ЗАПУСТИТЬ") : "Begin"}
            </a>
            {/* #3 — ★ View on GitHub button */}
            <a href="https://github.com/poushwell/orchesis" target="_blank" rel="noopener noreferrer"
              style={{ padding: isDark ? "13px 28px" : "12px 28px", borderRadius: isDark ? "12px" : "0", border: `1px solid ${isDark ? "#3f3f46" : t.border}`, background: "transparent", color: isDark ? "#a1a1aa" : t.textDim, fontSize: isDark ? "14px" : "11px", fontWeight: isDark ? 600 : 500, letterSpacing: isDark ? "0" : "0.1em", textTransform: isDark ? "none" : "uppercase" as const, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.7 }}>
                <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
              </svg>
              {isDos ? `[ ★ STAR ON GITHUB${stars !== null ? " · " + stars : ""} ]` : isDark ? tx(mx("Star on GitHub", "★ STAR_ON_GITHUB"), "GitHub") : "View Source"}
            </a>
          </div>

          {/* pip install */}
          <code onClick={copyPip} style={{ display: "block", marginTop: "20px", textAlign: isDark ? "center" : "left", fontSize: "13px", color: copied ? t.green : t.textMuted, fontFamily: "'JetBrains Mono', 'SF Mono', monospace", cursor: "pointer", transition: "color 0.2s", userSelect: "none", ...anim(0.6) }} title="Click to copy">
{isDos ? (copied ? "C:\\> COPIED!" : "C:\\> pip install orchesis") : copied ? "✓ copied!" : "pip install orchesis"}
          </code>

          {/* #4 — Code block with tabs */}
          {isDark && !isEgg && (
            <div style={{ marginTop: "24px", textAlign: "left", ...anim(0.7) }}>
              {/* Tabs */}
              <div style={{ display: "flex", gap: "0", borderBottom: `1px solid #27272a`, marginBottom: "0" }}>
                {(Object.keys(CODE_TABS) as Array<keyof typeof CODE_TABS>).map(tab => (
                  <button key={tab} onClick={() => setCodeTab(tab)}
                    style={{ padding: "7px 16px", background: "transparent", border: "none", borderBottom: codeTab === tab ? "2px solid #a855f7" : "2px solid transparent", color: codeTab === tab ? "#e4e4e7" : "#52525b", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", marginBottom: "-1px" }}>
                    {tab}
                  </button>
                ))}
              </div>
              <div style={{ background: "#0d0d0f", border: "1px solid #27272a", borderTop: "none", borderRadius: "0 0 8px 8px", padding: "16px 20px", overflowX: "auto" }}>
                <pre style={{ margin: 0, fontSize: "12px", lineHeight: 1.7, color: "#71717a", fontFamily: "'JetBrains Mono', 'SF Mono', monospace", whiteSpace: "pre" }}>
                  {CODE_TABS[codeTab].split("\n").map((line, i) => {
                    const isComment = line.trim().startsWith("#") || line.trim().startsWith("//");
                    const isAfter = line.includes("localhost:8080");
                    const isHighlight = line.includes("↑");
                    return (
                      <span key={i} style={{ display: "block", color: isHighlight ? "#a855f7" : isAfter ? "#e4e4e7" : isComment ? "#3f3f46" : "#71717a" }}>
                        {line}
                      </span>
                    );
                  })}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Spec card (light) */}
        {!isDark && (
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, padding: "36px 28px", ...anim(0.5) }}>
            <div style={{ fontSize: "10px", color: t.textMuted, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "24px", paddingBottom: "12px", borderBottom: `1px solid ${t.border}` }}>Specification</div>
            {specs.map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${t.border}`, fontSize: "12px" }}>
                <span style={{ color: t.textMuted }}>{s.key}</span>
                <span style={{ color: t.text, fontWeight: 500 }}>{s.val}</span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* #2 — Badge bar */}
      {(!isEgg || isMatrix || isDos || mode === "ussr") && (
        <section style={{ maxWidth: "800px", margin: "0 auto 40px", padding: isMobile ? "0 20px" : "0 48px", ...anim(0.75) }}>
          <div style={{ display: "flex", gap: "10px", justifyContent: isDark ? "center" : "flex-start", flexWrap: "wrap" }}>
            {[
              { icon: "★", label: isMatrix ? `[${stars ?? "—"}]_STARS` : isDos ? `[ ★ ${stars ?? "—"} STARS ]` : starsLabel, href: "https://github.com/poushwell/orchesis", live: true },
              { icon: "⚡", label: isMatrix ? "17_PHASES" : isDos ? "[ 17 PHASES ]" : "17-Phase Pipeline", href: null, live: false },
              { icon: "🔍", label: isMatrix ? "100+_MCP_CHECKS" : isDos ? "[ 100+ MCP CHECKS ]" : mode === "ussr" ? "[100+ ПРОВЕРКИ MCP]" : "100+ MCP Checks", href: "/scan", live: false },
              { icon: "🧪", label: isMatrix ? "4813_TESTS" : isDos ? "[ 4,813 TESTS ]" : "4,813 Tests", href: null, live: false },
              { icon: "◎", label: isMatrix ? "0_DEPS" : isDos ? "[ 0 DEPS ]" : "Zero Dependencies", href: null, live: false },
              { icon: "◆", label: isMatrix ? "MIT" : isDos ? "[ MIT ]" : "MIT License", href: null, live: false },
              { icon: "✓", label: isMatrix ? "MAST·OWASP·EU·NIST" : isDos ? "[ COMPLIANT ]" : mode === "ussr" ? "[СООТВЕТСТВИЕ]" : "MAST · OWASP · EU AI Act · NIST", href: null, live: false },
            ].map((b, i) => {
              const inner = (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", borderRadius: "100px", border: `1px solid ${b.live ? t.tagBorder : t.border}`, background: b.live ? t.tagBg : "transparent", fontSize: "12px", color: b.live ? t.tagText : t.textDim, cursor: b.href ? "pointer" : "default", transition: "all 0.2s", whiteSpace: "nowrap" as const }}>
                  <span style={{ fontSize: "11px", color: b.live ? t.accent : t.textMuted }}>{b.icon}</span>
                  {b.label}
                </span>
              );
              return b.href ? (
                <a key={i} href={b.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>{inner}</a>
              ) : (
                <span key={i}>{inner}</span>
              );
            })}
          </div>
        </section>
      )}

      {/* Live Counters + Threat Log */}
      {(!isEgg || isMatrix || isDos || mode === "ussr") && <LiveCounters t={t} isDark={isDark} isMatrix={isMatrix} isDos={isDos} isMobile={isMobile} />}
      {(!isEgg || isMatrix || isDos || mode === "ussr") && <ThreatLog lightMode={!isDark} isDos={isDos} isUssr={mode === "ussr"} isMobile={isMobile} />}

      {/* METRICS */}
      {(!isEgg || isMatrix || isDos || mode === "ussr") && (
        <section style={{ maxWidth: "800px", margin: "0 auto 60px", padding: isMobile ? "0 20px" : "0 48px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: isMobile ? "1px" : "1px", background: t.border, borderRadius: isDark ? "16px" : "0", overflow: "hidden", border: `1px solid ${t.border}`, ...anim(0.7) }}>
          {[
            { title: "Secure", num: 17, unit: " phases", desc: "Adaptive detection", color: t.red },
            { title: "Optimize", num: 90, unit: "% saved", desc: "Context compression", color: t.accent },
            { title: "Heal", num: 6, unit: " actions", desc: "Auto-recovery", color: t.accentAlt },
          ].map((m, i) => (
            <div key={i} style={{ background: t.bg, padding: "36px 28px", textAlign: "center", transition: "background 0.3s", cursor: "default" }}
              onMouseEnter={e => (e.currentTarget).style.background = t.bgCard}
              onMouseLeave={e => (e.currentTarget).style.background = t.bg}
            >
              <div style={{ fontSize: "36px", fontWeight: 700, letterSpacing: "-0.04em", color: m.color, lineHeight: 1 }}>
                <AnimNum target={m.num} delay={800 + i * 200} />
                <span style={{ fontSize: "16px", fontWeight: 400, color: t.textMuted }}>{m.unit}</span>
              </div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: t.text, margin: "12px 0 4px" }}>{m.title}</div>
              <div style={{ fontSize: "13px", color: t.textDim }}>{m.desc}</div>
            </div>
          ))}
        </section>
      )}

      {/* FEATURES */}
      <section style={{ maxWidth: isDark ? "800px" : "920px", margin: "0 auto", padding: isMobile ? "24px 20px 60px" : (isDark ? "0 48px 60px" : "0 64px 80px"), borderTop: !isDark ? `1px solid ${t.border}` : "none", borderBottom: !isDark ? `1px solid ${t.border}` : "none", ...anim(0.9) }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : (isDark ? "1fr 1fr" : "repeat(4, 1fr)"), gap: isDark ? "16px" : "0", overflow: "hidden" }}>
        {features.map((f, i) => (
          <div key={i}
            onMouseEnter={() => setHovFeat(i)}
            onMouseLeave={() => setHovFeat(null)}
            style={{ minWidth: 0, overflow: "hidden", background: isDark ? (hovFeat === i ? t.bgCardHover : t.bgCard) : (hovFeat === i ? t.bgCard : "transparent"), borderTop: isDark ? `1px solid ${hovFeat === i ? t.borderHover : t.border}` : "none", borderBottom: isDark ? `1px solid ${hovFeat === i ? t.borderHover : t.border}` : "none", borderLeft: isDark ? `1px solid ${hovFeat === i ? t.borderHover : t.border}` : "none", borderRight: isDark ? `1px solid ${hovFeat === i ? t.borderHover : t.border}` : (!isDark && i < 3 ? `1px solid ${t.border}` : "none"), borderRadius: isDark ? "12px" : "0", padding: isDark ? "28px" : "40px 24px", textAlign: isDark ? "left" : "center", transition: "all 0.3s", cursor: "default" }}>
            {isDark ? (
              <div style={{ marginBottom: "12px", color: isEgg ? t.accent : f.codeAccent === "red" ? t.red : f.codeAccent === "green" ? t.green : f.codeAccent === "yellow" ? t.yellow : f.codeAccent === "cyan" ? t.accentAlt : t.accent }}>{f.iconD}</div>
            ) : (
              <div style={{ fontSize: "28px", fontWeight: 300, color: t.accent, marginBottom: "8px" }}>{f.jp}</div>
            )}
            <h3 style={{ fontSize: isDark ? "15px" : "12px", fontWeight: 600, color: t.text, margin: "0 0 8px", letterSpacing: isDark ? "-0.01em" : "0.08em", textTransform: isDark ? "none" : "uppercase" as const }}>{f.title}</h3>
            <p style={{ fontSize: isDark ? "13px" : "11px", color: t.textDim, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            {isDark && (
              <pre style={{ marginTop: "16px", padding: "10px 12px", background: isEgg ? t.bgCard : "#0d0d0f", border: `1px solid ${isEgg ? t.border : "#27272a"}`, borderRadius: "6px", fontSize: "11px", color: t.textMuted, fontFamily: "'JetBrains Mono','SF Mono',monospace", lineHeight: 1.6, overflowX: "hidden", whiteSpace: "pre" }}>
                {f.code.split("\n").map((line, li) => {
                  const ca = f.codeAccent === "red" ? t.red : f.codeAccent === "green" ? t.green : f.codeAccent === "yellow" ? t.yellow : f.codeAccent === "cyan" ? t.accentAlt : t.accent;
                  const isHighlight = (f.codeAccent === "red" && (line.includes("Severity"))) ||
                    (f.codeAccent === "green" && (line.includes("$0.006") || line.includes("Loop detected at call"))) ||
                    (f.codeAccent === "yellow" && (line.includes("Saved:"))) ||
                    (f.codeAccent === "cyan" && (line.includes("Cross-agent") || line.includes("Independent audit")));
                  return (
                    <span key={li} style={{ display: "block", color: isHighlight ? ca : t.textMuted }}>
                      {line}
                    </span>
                  );
                })}
              </pre>
            )}
            {!isDark && (
              <pre style={{ marginTop: "12px", padding: "8px 10px", background: "#F0EDE6", border: "1px solid #E8E4DC", borderRadius: "4px", fontSize: "10px", color: "#AAA", fontFamily: "'JetBrains Mono','SF Mono',monospace", lineHeight: 1.6, overflowX: "hidden", whiteSpace: "pre", textAlign: "left" }}>
                {f.code.split("\n").map((line, li) => (
                  <span key={li} style={{ display: "block", color: line.includes("BLOCKED") || line.includes("HIGH") ? "#C41E3A" : line.includes("saved") || line.includes("$0.006") || line.includes("B+") ? "#2E7D32" : line.includes("→") ? "#C41E3A" : "#BBB" }}>
                    {line}
                  </span>
                ))}
              </pre>
            )}
          </div>
        ))}
        </div>
      </section>


      {/* RADAR DEMO */}
      {(!isEgg || isMatrix || isDos || mode === "ussr") && (
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: isMobile ? "48px 20px" : "60px 48px", borderTop: `1px solid ${t.border}` }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <p style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: t.textMuted, marginBottom: "8px" }}>
              {isMatrix ? "FLEET_MONITOR" : isDos ? "C:\\> AGENTS.EXE" : mode === "ussr" ? "МОНИТОРИНГ ФЛОТА" : "Live Demo"}
            </p>
            <h2 style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: isDark ? 700 : 300, letterSpacing: isMatrix || isDos ? "0.02em" : "-0.04em", lineHeight: 1.1, margin: "0 0 12px" }}>
              {isMatrix ? "SEE_YOUR_FLEET_" : isDos ? "SEE YOUR FLEET" : mode === "ussr" ? "ВИДЕТЬ ФЛОТ В РЕАЛЬНОМ ВРЕМЕНИ" : "See your fleet in real time"}
            </h2>
            <p style={{ fontSize: "14px", color: t.textDim, maxWidth: "480px", margin: "0 auto" }}>
              {mode === "ussr" ? "Зоны безопасности показывают состояние агентов. Нажми для инспекции." : "Security zones show agent health at a glance. Click any agent to inspect."}
            </p>
          </div>
          <RadarDemo mode={mode} t={t} isMobile={isMobile} />
          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: t.textMuted }}>
            {isMatrix ? "> DEMO_DATA · " : isDos ? "DEMO DATA · " : mode === "ussr" ? "Демо данные · " : "Demo data · "}
            <code style={{ color: t.accent, fontFamily: "'JetBrains Mono','SF Mono',monospace" }}>
              {isMatrix ? "ORCHESIS --radar" : isDos ? "ORCHESIS_RADAR.EXE" : "npx orchesis-radar"}
            </code>
            {!isDos && !isMatrix && mode !== "ussr" && " for your real fleet"}
          </div>
        </section>
      )}

      {/* SCROLL NARRATIVE */}
      {(!isEgg || isMatrix || isDos || mode === "ussr") && (
        <section style={{ maxWidth: isDark ? "800px" : "920px", margin: "0 auto", padding: isMobile ? "48px 20px" : (isDark ? "80px 48px" : "80px 64px"), borderTop: `1px solid ${t.border}`, ...anim(1.1) }}>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: isDark ? 700 : 300, letterSpacing: "-0.04em", lineHeight: 1.1, margin: "0 0 20px", textAlign: "center" }}>
{isDos ? "C:\\> ORCHESIS --help" : "Every request."}<br /><span style={{ color: t.textDim, fontWeight: isDark ? 700 : 600 }}>{isDos ? "ONE CONFIG CHANGE. EVERYTHING CHANGES." : "Analyzed. Secured. Optimized."}</span>
          </h2>
          <p style={{ fontSize: "15px", lineHeight: 1.7, color: t.textDim, maxWidth: "500px", textAlign: "center", margin: "0 auto" }}>
            Orchesis sits as a transparent HTTP proxy between your AI agents and their LLM providers. One config change — set the base URL to localhost:8080 — and every request passes through a 17-phase pipeline. No SDK integration. No code changes. No vendor lock-in.
          </p>
        </section>
      )}

      {/* ARCHITECTURE DIAGRAM */}
      {(!isEgg || isMatrix || isDos || mode === "ussr") && (
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: isMobile ? "48px 20px" : "60px 48px", borderTop: `1px solid ${t.border}` }}>
          <p style={{ fontSize: "11px", color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px", textAlign: "center" }}>How it works</p>
          <h2 style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: isDark ? 700 : 300, letterSpacing: "-0.04em", lineHeight: 1.1, margin: "0 0 36px", textAlign: "center" }}>
            One config change.<br /><span style={{ color: t.textDim, fontWeight: isDark ? 700 : 600 }}>Everything changes.</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr auto 1fr", gap: isMobile ? "16px" : "0", alignItems: "center", margin: "0 auto" }}>
            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "10px", padding: "20px" }}>
              <div style={{ fontSize: "11px", color: t.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>AI Agents</div>
              {[["Paperclip","cyan","30K★"],["CrewAI","",""],["LangChain","",""],["OpenClaw","orange","300K★"],["AutoGen","",""],["Google ADK","",""],["Any agent","italic",""]].map(([a, style, badge], i) => (
                <div key={i} style={{ fontSize: "13px", color: style === "orange" ? "#f97316" : style === "cyan" ? t.accentAlt : style === "italic" ? t.textMuted : t.textDim, padding: "4px 0", borderBottom: i < 6 ? `1px solid ${t.border}` : "none", fontStyle: style === "italic" ? "italic" : "normal", fontWeight: style === "orange" || style === "cyan" ? 600 : 400 }}>{a as string}{badge && <span style={{ fontSize: "10px", color: style === "orange" ? "#f97316" : t.accentAlt, marginLeft: "6px", opacity: 0.7 }}>{badge as string}</span>}</div>
              ))}
            </div>
            <div style={{ textAlign: "center", padding: "0 12px", color: t.textMuted, fontSize: "20px" }}>{isMobile ? "↓" : "→"}</div>
            <div style={{ background: isDark ? "rgba(168,85,247,0.06)" : "rgba(196,30,58,0.04)", border: `1px solid ${isDark ? "rgba(168,85,247,0.3)" : "rgba(196,30,58,0.25)"}`, borderRadius: "10px", padding: "20px" }}>
              <div style={{ fontSize: "11px", color: t.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Orchesis Proxy</div>
              {[["Security (phases 1-8)", t.red],["Context Engine (9-11)", t.accent],["Threat Intel (12-14)", t.accentAlt],["Cost Optimizer (15-16)", t.yellow],["Observability (17)", t.green]].map(([phase, color], i) => (
                <div key={i} style={{ fontSize: "12px", color: t.textDim, padding: "3px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: color as string, opacity: 0.9, flexShrink: 0 }} />
                  {phase as string}
                </div>
              ))}
              <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: `1px solid ${t.border}`, fontSize: "11px", color: t.accent, textAlign: "center" }}>localhost:8080</div>
            </div>
            <div style={{ textAlign: "center", padding: "0 12px", color: t.textMuted, fontSize: "20px" }}>{isMobile ? "↓" : "→"}</div>
            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "10px", padding: "20px" }}>
              <div style={{ fontSize: "11px", color: t.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>LLM Providers</div>
              {[["OpenAI","#74aa9c"],["Anthropic","#c96442"],["Google","#4285f4"],["Mistral","#ff7000"],["DeepSeek","#4d6bfe"],["Any OpenAI-compatible","italic"]].map(([a, color], i) => (
                <div key={i} style={{ fontSize: "13px", color: color === "italic" ? t.textMuted : color as string, padding: "4px 0", borderBottom: i < 5 ? `1px solid ${t.border}` : "none", fontStyle: color === "italic" ? "italic" : "normal", fontWeight: color !== "italic" ? 500 : 400 }}>{a as string}</div>
              ))}
            </div>
          </div>
          <p style={{ marginTop: "24px", fontSize: "13px", color: t.textMuted, textAlign: "center", fontFamily: "'JetBrains Mono','SF Mono',monospace" }}>
            base_url = <span style={{ color: t.accent }}>"http://localhost:8080/v1"</span>
            <span style={{ color: t.textMuted }}> # one line change</span>
          </p>

          {/* Why proxy table */}
          <div style={{ marginTop: "40px" }}>
            <p style={{ fontSize: "16px", fontWeight: 600, color: t.text, margin: "0 0 16px", letterSpacing: "0.02em", textAlign: "center" }}>
              {isDos ? "WHY PROXY, NOT SDK?" : isMatrix ? "WHY_PROXY_NOT_SDK?" : mode === "ussr" ? "ПОЧЕМУ ПРОКСИ, НЕ SDK?" : "Why proxy, not SDK?"}
            </p>
            <div style={{ border: `1px solid ${t.border}`, borderRadius: isMatrix || isDos ? "0" : "10px", overflow: "hidden", fontSize: "13px" }}>
              {[
                { approach: isDos ? "SDK / callbacks" : isMatrix ? "SDK_callbacks" : "SDK / callbacks", sees: isDos ? "One agent, one session" : isMatrix ? "One_agent._One_session." : "One agent, one session", code: isDos ? "Required" : isMatrix ? "Required" : "Required", highlight: false },
                { approach: isDos ? "Static analysis" : isMatrix ? "Static_analysis" : "Static analysis", sees: isDos ? "Code at rest only" : isMatrix ? "Code_at_rest_only." : "Code at rest", code: isDos ? "Required" : isMatrix ? "Required" : "Required", highlight: false },
                { approach: isDos ? "Observability" : isMatrix ? "Observability" : "Observability", sees: isDos ? "Metrics and logs" : isMatrix ? "Metrics_and_logs." : "Metrics and logs", code: isDos ? "Required" : isMatrix ? "Required" : "Required", highlight: false },
                { approach: isDos ? "ORCHESIS PROXY" : isMatrix ? "Orchesis_proxy" : mode === "ussr" ? "Прокси Orchesis" : "Orchesis proxy", sees: isDos ? "EVERYTHING, CROSS-AGENT" : isMatrix ? "Everything._Cross-agent." : mode === "ussr" ? "Всё, включая cross-agent" : "Everything, cross-agent", code: isDos ? "NONE" : isMatrix ? "None" : mode === "ussr" ? "Ноль" : "None", highlight: true },
              ].map((row, i, arr) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 0.7fr", borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : "none", background: row.highlight ? (isMatrix ? "rgba(0,255,65,.06)" : isDos ? "rgba(255,165,0,.06)" : mode === "ussr" ? "rgba(220,20,20,.06)" : isDark ? "rgba(168,85,247,0.06)" : "rgba(196,30,58,0.04)") : "transparent" }}>
                  <div style={{ padding: "12px 16px", color: row.highlight ? t.accent : t.textDim, fontWeight: row.highlight ? 600 : 400, fontFamily: isMatrix || isDos ? "'Courier New',monospace" : "inherit" }}>{row.approach}</div>
                  <div style={{ padding: "12px 16px", color: row.highlight ? t.text : t.textMuted, borderLeft: `1px solid ${t.border}`, fontFamily: isMatrix || isDos ? "'Courier New',monospace" : "inherit" }}>{row.sees}</div>
                  <div style={{ padding: "12px 16px", color: row.highlight ? t.green : t.red, borderLeft: `1px solid ${t.border}`, fontFamily: isMatrix || isDos ? "'Courier New',monospace" : "inherit", fontWeight: row.highlight ? 600 : 400 }}>{row.code}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COST FRAMEWORK */}
      {(!isEgg || isMatrix || isDos || mode === "ussr") && (
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: isMobile ? "48px 20px" : "60px 48px", borderTop: `1px solid ${t.border}` }}>
          <p style={{ fontSize: "11px", color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px", textAlign: "center" }}>
            {isDos ? "C:\\> FAILURE_MODES.EXE" : isMatrix ? "WHY_AGENTS_FAIL" : mode === "ussr" ? "ПОЧЕМУ АГЕНТЫ ГИБНУТ" : "Why agents fail in production"}
          </p>
          <h2 style={{ fontSize: "clamp(20px, 3vw, 36px)", fontWeight: isDark ? 700 : 300, letterSpacing: isMatrix || isDos ? "0.02em" : "-0.04em", lineHeight: 1.1, margin: "0 0 8px", textAlign: "center" }}>
            <span style={{ textAlign: "center", display: "block" }}>{isDos ? "FOUR WAYS AI AGENTS DIE." : isMatrix ? "FOUR_WAYS_AI_AGENTS_DIE." : mode === "ussr" ? "ЧЕТЫРЕ ПРИЧИНЫ ГИБЕЛИ." : "Four ways AI agents die."}</span>
          </h2>
          <p style={{ fontSize: "15px", color: t.textDim, margin: "0 0 32px", textAlign: "center" }}>
            {isDos ? "Orchesis closes all four. One config change." : isMatrix ? "Orchesis closes all four with one config change." : mode === "ussr" ? "Орхесис закрывает все четыре. Одна настройка." : "Orchesis closes all four with one config change."}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "28px" }}>
            {(() => {
              const cards = isDos ? [
                { letter: "C", color: "#ffa500", title: "CONTEXT.EXE", desc: "Agent loops. Repeats work. Context bloated to 120k tokens.", fix: "Context compression removes 80-90% waste" },
                { letter: "O", color: "#55ffff", title: "OPACITY.EXE", desc: "No trace, no replay. No way to know what went wrong.", fix: "Flow X-Ray records every decision" },
                { letter: "S", color: "#ff8800", title: "SPEND.EXE",   desc: "$847 bill from one overnight run. No limits, no alerts.", fix: "Budget enforcement blocks overspend" },
                { letter: "T", color: "#ff5555", title: "TRUST.EXE",   desc: "Agent called APIs it shouldn't. Banned from production.", fix: "17-phase threat detection stops it" },
              ] : isMatrix ? [
                { letter: "C", color: "#00ff41", title: "CONTEXT_COLLAPSE", desc: "Agent loses thread. Repeats work. Contradicts itself.", fix: "Context compression removes 80-90% waste" },
                { letter: "O", color: "#00cc33", title: "OPACITY_GAP",      desc: "No trace, no replay. Impossible to debug.", fix: "Flow X-Ray records every decision" },
                { letter: "S", color: "#009922", title: "SPEND_EXPLOSION",  desc: "$847 bill from one overnight run. No limits.", fix: "Budget enforcement blocks overspend" },
                { letter: "T", color: "#ff0000", title: "TRUST_BREAKDOWN",  desc: "Agent called APIs it shouldn't. Banned from prod.", fix: "17-phase threat detection stops it" },
              ] : mode === "ussr" ? [
                { letter: "К", color: "#ff4444", title: "Коллапс контекста", desc: "Агент теряет нить. Повторяет работу. Противоречит себе.", fix: "Сжатие контекста убирает 80-90% мусора" },
                { letter: "Н", color: "#ff6666", title: "Непрозрачность", desc: "Нет трейса, нет replay. Невозможно понять что пошло не так.", fix: "Flow X-Ray записывает каждое решение" },
                { letter: "Р", color: "#cc2222", title: "Расходы взрывные", desc: "$847 счёт за один ночной run. Нет лимитов, нет предупреждений.", fix: "Бюджетный контроль блокирует перерасход" },
                { letter: "Д", color: "#ff3333", title: "Доверие сломано", desc: "Агент вызвал API которые не должен. Запрет в production.", fix: "17 фаз обнаружения угроз останавливают это" },
              ] : [
                { letter: "C", color: "#a855f7", title: "Context Collapse", desc: "Agent loses the thread. Repeats work. Contradicts itself mid-task.", fix: "Context compression removes 80–90% waste" },
                { letter: "O", color: "#22d3ee", title: "Opacity Gap", desc: "No trace, no replay. You can't know what went wrong or why.", fix: "Flow X-Ray records every decision" },
                { letter: "S", color: "#f97316", title: "Spend Explosion", desc: "$847 bill from OpenAI for one overnight run. No limits, no alerts.", fix: "Per-request budget enforcement blocks overspend" },
                { letter: "T", color: "#ef4444", title: "Trust Breakdown", desc: "Agent called APIs it shouldn't. One incident — banned from production.", fix: "17-phase threat detection with formal proof of limits" },
              ];
              return cards.map((card, i) => (
                <div key={i} style={{
                  background: isMatrix ? "rgba(0,255,65,.04)" : isDos ? "rgba(255,165,0,.04)" : mode === "ussr" ? "rgba(220,20,20,.06)" : isDark ? "#111113" : "#fff",
                  border: `1px solid ${isMatrix ? "rgba(0,255,65,.12)" : isDos ? "rgba(255,165,0,.12)" : mode === "ussr" ? "rgba(220,20,20,.15)" : isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.08)"}`,
                  borderRadius: isMatrix || isDos ? "0" : "12px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: "10px",
                  transition: "border-color 0.2s",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = card.color + "44"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = isMatrix ? "rgba(0,255,65,.12)" : isDos ? "rgba(255,165,0,.12)" : mode === "ussr" ? "rgba(220,20,20,.15)" : isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.08)"}
                >
                  <div style={{ fontSize: "48px", fontWeight: 800, color: card.color, lineHeight: 1, letterSpacing: "-0.04em", fontFamily: isMatrix || isDos ? "'Courier New',monospace" : "inherit" }}>
                    {card.letter}
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: isDark ? "#e4e4e7" : "#111", fontFamily: isMatrix || isDos ? "'Courier New',monospace" : "inherit" }}>
                    {card.title}
                  </div>
                  <p style={{ fontSize: "13px", color: isDark ? "#888" : "#666", lineHeight: 1.6, margin: 0, flex: 1, fontFamily: isMatrix || isDos ? "'Courier New',monospace" : "inherit" }}>
                    {card.desc}
                  </p>
                  <div style={{ fontSize: "12px", color: card.color, fontFamily: "'JetBrains Mono','SF Mono',monospace", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ opacity: 0.8 }}>→</span> {card.fix}
                  </div>
                </div>
              ));
            })()}
          </div>
          <p style={{ fontSize: "13px", color: t.textMuted, textAlign: "center", fontStyle: isMatrix || isDos ? "normal" : "italic", fontFamily: isMatrix || isDos ? "'Courier New',monospace" : "inherit" }}>
            {isDos ? "ONE CONFIG CHANGE. ZERO CODE REWRITES. ALL FOUR PROBLEMS SOLVED." : isMatrix ? "one_config_change. zero_code_rewrites. all_four_problems_solved." : mode === "ussr" ? "Одна настройка. Ноль изменений кода. Все четыре проблемы решены." : "One config change. Zero code rewrites. All four problems solved."}
          </p>
        </section>
      )}

      {/* BENCHMARKS */}
      {(!isEgg || isMatrix || isDos || mode === "ussr") && (
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: isMobile ? "48px 20px" : "60px 48px", borderTop: `1px solid ${t.border}` }}>
          <p style={{ fontSize: "11px", color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px", textAlign: "center" }}>{isDos ? "C:\\ORCHESIS> DIAGNOSTICS.EXE" : mx("By the numbers", "SYSTEM_DIAGNOSTICS")}</p>
          <h2 style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: isDark ? 700 : 300, letterSpacing: isMatrix || isDos ? "0.02em" : "-0.04em", lineHeight: 1.1, margin: "0 0 32px", textAlign: "center" }}>
            {isDos ? "SYSTEM DIAGNOSTICS" : mx("What Orchesis catches", "RUNNING_DIAGNOSTICS_")}
          </h2>
          <div style={{ border: `1px solid ${t.border}`, borderRadius: isMatrix || isDos ? "0" : "12px", overflow: "hidden" }}>
            {[
              { metric: isDos ? "Proxy overhead........." : mx("Proxy overhead",    "> proxy_overhead......"),  value: "< 3ms",  sub: isDos ? "[OK]"      : mx("added latency",       "[OK]"),      accent: t.green },
              { metric: isDos ? "Token savings........." : mx("Token savings",     "> token_savings......."),  value: "80–90%", sub: isDos ? "[ACTIVE]"  : mx("context reduction",   "[ACTIVE]"),  accent: t.accent },
              { metric: isDos ? "Threat signatures....." : mx("Threat signatures", "> threat_signatures..."),  value: "33+",    sub: isDos ? "[LOADED]"  : mx("across 10 categories","[LOADED]"),  accent: t.red },
              { metric: isDos ? "MAST coverage........." : mx("MAST coverage",     "> mast_coverage......."),  value: "78.6%",  sub: isDos ? "[ONLINE]"  : mx("11/14 failure modes", "[ONLINE]"),  accent: t.accentAlt },
              { metric: isDos ? "OWASP coverage........" : mx("OWASP coverage",    "> owasp_coverage......"),  value: "80%",    sub: isDos ? "[ONLINE]"  : mx("8/10 risks",          "[ONLINE]"),  accent: t.accentAlt },
              { metric: isDos ? "Auto-heal actions....." : mx("Auto-heal actions", "> auto_heal_actions..."),  value: "6",      sub: isDos ? "[ARMED]"   : mx("recovery strategies", "[ARMED]"),   accent: t.yellow },
              { metric: isDos ? "Test coverage........." : mx("Test coverage",     "> test_coverage......."),  value: "4,813",  sub: isDos ? "[PASSING]" : mx("passing tests",       "[PASSING]"), accent: t.green },
              { metric: isDos ? "Dependencies........." : mx("Dependencies",      "> dependencies........"),  value: "0",      sub: isDos ? "[CLEAN]"   : mx("stdlib only",         "[CLEAN]"),   accent: t.green },
              { metric: isDos ? "Proxy overhead (MVE)." : mx("Proxy overhead (MVE)", "> proxy_overhead_mve.."),  value: "0.8%",   sub: isDos ? "[MEASURED]": mx("measured",             "[MEASURED]"),accent: t.green },
              { metric: isDos ? "Context growth caught" : mx("Context growth caught", "> context_growth......"),  value: "12×",    sub: isDos ? "[CAUGHT]"  : mx("without proxy: invisible","[CAUGHT]"), accent: t.accent },
            ].map((row, i, arr) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : "none", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = t.bgCard}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <span style={{ fontSize: isMatrix ? "12px" : "14px", color: t.textDim, fontFamily: isMatrix ? "'Courier New',monospace" : "inherit", minWidth: 0 }}>{row.metric}</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ fontSize: "22px", fontWeight: 700, color: row.accent, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{row.value}</span>
                  <span style={{ fontSize: "12px", color: isMatrix ? row.accent : t.textMuted, fontFamily: isMatrix ? "'Courier New',monospace" : "inherit" }}>{row.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}


      {/* FREE TOOLS */}
      {(!isEgg || isMatrix || isDos || mode === "ussr") && (
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: isMobile ? "48px 20px" : "60px 48px", borderTop: `1px solid ${t.border}` }}>
          <p style={{ fontSize: "11px", color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px", textAlign: "center" }}>Free · No signup · Browser-based</p>
          <h2 style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: isDark ? 700 : 300, letterSpacing: isMatrix || isDos ? "0.02em" : "-0.04em", lineHeight: 1.1, margin: "0 0 32px", textAlign: "center" }}>
            {isDos ? "FREE TOOLS" : mx("Free security tools.", "FREE_SECURITY_TOOLS.")}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            {[
              { title: "MCP Scanner", desc: "100+ checks. CVE database. OWASP mapping. Paste your config, get a report.", color: t.red, href: "/scan", badge: null },
              { title: "Security Scorecard", desc: "5 questions. Instant grade A+ to F. Know where you stand in 30 seconds.", color: t.accent, href: "/scorecard", badge: null },
              { title: "Cost Calculator", desc: "How much are agent loops and context bloat costing you?", color: "#fb923c", href: "/tools/cost-calculator", badge: "Coming soon" },
              { title: "OWASP MCP Guide", desc: "All 10 risks explained. Real examples. Detection methods. Fixes.", color: t.accentAlt, href: "/tools/owasp-mcp", badge: "Coming soon" },
            ].map((tool, i) => (
              <a key={i} href={tool.badge ? undefined : tool.href} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "20px", textDecoration: "none", display: "flex", flexDirection: "column", gap: "8px", transition: "all 0.25s", cursor: tool.badge ? "default" : "pointer", opacity: tool.badge ? 0.5 : 1 }}
                onMouseEnter={e => { if (!tool.badge) { (e.currentTarget as HTMLElement).style.borderColor = tool.color + "66"; }}}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = t.border; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: tool.color }} />
                  <span style={{ fontSize: "14px", fontWeight: 700, color: t.text }}>{tool.title}</span>
                  {tool.badge && <span style={{ padding: "2px 8px", borderRadius: "100px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", fontSize: "10px", color: "#c084fc", fontWeight: 600 }}>{tool.badge}</span>}
                </div>
                <p style={{ fontSize: "12px", color: t.textDim, lineHeight: 1.5, margin: 0 }}>{tool.desc}</p>
              </a>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <a href="/tools" style={{ fontSize: "13px", color: t.textDim, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = t.text}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = t.textDim}
            >See all tools →</a>
          </div>
        </section>
      )}


      {/* IMPOSSIBILITY THEOREMS */}
      {(!isEgg || isMatrix || isDos || mode === "ussr") && (
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: isMobile ? "48px 20px" : "60px 48px", borderTop: `1px solid ${t.border}` }}>
          <p style={{ fontSize: "11px", color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px", textAlign: "center" }}>{isDos ? "C:\\ORCHESIS> FORMAL_PROOFS.EXE" : mx("Mathematical foundations", "FORMAL_PROOFS_LOADED")}</p>
          <h2 style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: isDark ? 700 : 300, letterSpacing: isMatrix || isDos ? "0.02em" : "-0.04em", lineHeight: 1.1, margin: "0 0 16px", textAlign: "center" }}>
            {isDos ? "BUILT ON IMPOSSIBILITY THEOREMS." : mx("Built on impossibility theorems.", "IMPOSSIBILITY_THEOREMS_LOADED")}
          </h2>
          <p style={{ fontSize: "15px", color: t.textDim, marginBottom: "32px", maxWidth: "480px", textAlign: "center", margin: "0 auto 32px" }}>
            {isDos ? "WHAT CAN AND CANNOT BE DETECTED — PROVEN." : mx("What can and cannot be detected in AI agent security — proven mathematically.", "what_can_and_cannot_be_detected: proven")}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "1px", background: t.border, borderRadius: isMatrix || isDos ? "0" : "12px", overflow: "hidden", border: `1px solid ${isDark ? "rgba(168,85,247,0.2)" : mode === "light" ? "rgba(196,30,58,0.2)" : t.border}`, marginBottom: "24px" }}>
            {[
              { num: "3", label: "Impossibility theorems", sub: "What NO monitor can detect", color: "red" },
              { num: "2", label: "Necessity results", sub: "What ONLY a proxy can detect", color: "green" },
              { num: "26", label: "Formal results total", sub: "Published, peer-reviewable", color: "accent" },
            ].map((item, i) => (
              <div key={i} style={{ background: t.bgCard, padding: "28px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "48px", fontWeight: 800, letterSpacing: "-0.04em", color: item.color === "red" ? t.red : item.color === "green" ? t.green : t.accent, lineHeight: 1, marginBottom: "8px" }}>{item.num}</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: t.text, marginBottom: "4px" }}>{item.label}</div>
                <div style={{ fontSize: "12px", color: t.textMuted }}>{item.sub}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "14px", color: t.textDim, marginBottom: "16px", textAlign: "center" }}>
            {isDos ? "WE DON'T JUST MONITOR YOUR AGENTS. WE PROVE EXACTLY WHERE MONITORING ENDS." : mx("We don't just monitor your agents. We prove exactly where monitoring ends — and where your other defenses must begin.", "we_prove_exactly_where_monitoring_ends")}
          </p>
          <div style={{ textAlign: "center" }}>
          <a href="/blog/proxy-vs-decorator" style={{ fontSize: "14px", color: t.textDim, textDecoration: "none", borderBottom: `1px solid ${t.border}`, paddingBottom: "2px" }}>
            {isDos ? "READ THE RESEARCH.EXE →" : isMatrix ? "read_research >" : "Read the research →"}
          </a>
          </div>
        </section>
      )}

      {/* INTEGRATION MATRIX */}
      {(!isEgg || isMatrix || isDos || mode === "ussr") && (
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: isMobile ? "48px 20px" : "60px 48px", borderTop: `1px solid ${t.border}` }}>
          <p style={{ fontSize: "11px", color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px", textAlign: "center" }}>{isDos ? "C:\\> DIR COMPATIBLE_SYSTEMS /W" : mx("Works with your stack", "COMPATIBLE_SYSTEMS")}</p>
          <h2 style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: isDark ? 700 : 300, letterSpacing: isMatrix || isDos ? "0.02em" : "-0.04em", lineHeight: 1.1, margin: "0 0 32px", textAlign: "center" }}>
            {isDos ? "COMPATIBLE SYSTEMS" : mx("Drop in, don't rewrite.", "DROP_IN._DON'T_REWRITE.")}
          </h2>
          {[
            { label: isMatrix ? "AI_AGENTS" : isDos ? "AI AGENTS:" : "AI Agents", items: isMatrix ? ["[OpenClaw]","[Paperclip]","[CrewAI]","[LangChain]","[LangGraph]","[AutoGen]","[OpenAI_Agents_SDK]","[Google_ADK]"] : isDos ? ["[OpenClaw ]","[Paperclip]","[CrewAI   ]","[LangChain]","[LangGraph]","[AutoGen  ]","[OAI SDK  ]","[Google ADK]"] : ["OpenClaw","Paperclip","CrewAI","LangChain","LangGraph","AutoGen","OpenAI Agents SDK","Google ADK"] },
            { label: isMatrix ? "LLM_PROVIDERS" : isDos ? "LLM PROVIDERS:" : "LLM Providers", items: isMatrix ? ["[OpenAI]","[Anthropic]","[Google]","[Mistral]","[DeepSeek]","[Qwen]","[Minimax]","[Ollama]","[Any_OpenAI-compatible]"] : isDos ? ["[OpenAI   ]","[Anthropic]","[Google   ]","[Mistral  ]","[DeepSeek ]","[Qwen     ]","[Minimax  ]","[Ollama   ]","[Any OAI  ]"] : ["OpenAI","Anthropic","Google Gemini","Mistral","DeepSeek","Qwen","Minimax","Ollama","Any OpenAI-compatible"] },
          ].map((group, gi) => (
            <div key={gi} style={{ marginBottom: gi === 0 ? "24px" : "0", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: t.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>{group.label}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                {group.items.map((item, i) => {
                  const isLast = i === group.items.length - 1;
                  const globalIdx = gi === 0 ? i : GLOW_TOTAL_AGENTS + i;
                  const isGlowing = globalIdx === glowIdx && !isLast;
                  return (
                  <span key={i} className={`glow-tag glow-tag-${gi}-${i}`} style={{ padding: "6px 14px", borderRadius: "8px", border: `1px solid ${isGlowing ? t.accent : t.border}`, background: isGlowing ? t.tagBg : t.bgCard, fontSize: "13px", color: isGlowing ? t.accent : isLast ? t.textMuted : t.textDim, fontStyle: isLast ? "italic" : "normal", fontWeight: isGlowing ? 600 : 400, transition: "all 0.6s ease", cursor: "default", boxShadow: isGlowing ? `0 0 12px ${t.accent}33` : "none" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = t.accent; (e.currentTarget as HTMLElement).style.color = t.text; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = isGlowing ? t.accent : t.border; (e.currentTarget as HTMLElement).style.color = isGlowing ? t.accent : isLast ? t.textMuted : t.textDim; }}
                  >{item}</span>
                  );
                })}
              </div>
            </div>
          ))}
          <p style={{ marginTop: "24px", fontSize: "13px", color: t.textMuted, fontStyle: isMatrix ? "normal" : "italic", fontFamily: isMatrix ? "'Courier New',monospace" : "inherit", textAlign: "center" }}>
{isDos ? "C:\\> \"If it speaks OpenAI API — Orchesis loads it.\"" : mx("If it speaks OpenAI-compatible API — Orchesis works with it.", "If it speaks OpenAI-compatible API — ORCHESIS_PROXY accepts the connection.")}
          </p>
        </section>
      )}

      {/* CI/CD INTEGRATIONS */}
      {(!isEgg || isMatrix || isDos || mode === "ussr") && (
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: isMobile ? "48px 20px" : "60px 48px", borderTop: `1px solid ${t.border}` }}>
          <p style={{ fontSize: "11px", color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px", textAlign: "center" }}>
            {mode === "ussr" ? "ИНТЕГРАЦИЯ В РАБОЧИЙ ПРОЦЕСС" : mx("Integrate into your workflow", "WORKFLOW_INTEGRATION")}
          </p>
          <h2 style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: isDark ? 700 : 300, letterSpacing: (isMatrix || isDos) ? "0.02em" : "-0.04em", lineHeight: 1.1, margin: "0 0 32px", textAlign: "center" }}>
            {mode === "ussr" ? "ВЕЗДЕ ГДЕ ВЫ РАБОТАЕТЕ." : mx("Wherever you work.", "WHEREVER_YOU_WORK.")}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "16px" }}>
            {[
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
                  </svg>
                ),
                label: "npm CLI",
                title: "npx orchesis-scan",
                desc: "Zero-install CLI scan for any terminal. Auto-detects MCP configs.",
                code: "npx orchesis-scan",
                codeColor: "green",
                link: "https://github.com/poushwell/orchesis",
                linkLabel: "npm · orchesis-scan",
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                ),
                label: "GitHub Action",
                title: "CI/CD pipeline",
                desc: "Scan MCP configs on every PR. Fail builds with insecure configs.",
                code: "uses: poushwell/orchesis@main\nwith:\n  fail-on: 'high'",
                codeColor: "cyan",
                link: "https://github.com/poushwell/orchesis",
                linkLabel: "GitHub · mcp-scan action",
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="21"/><line x1="3" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="21" y2="12"/>
                  </svg>
                ),
                label: "pre-commit",
                title: "Block bad commits",
                desc: "Prevent insecure MCP configs from ever reaching your repo.",
                code: "repo: poushwell/orchesis\nhooks:\n  - id: orchesis-mcp-scan",
                codeColor: "yellow",
                link: "https://github.com/poushwell/orchesis",
                linkLabel: "pre-commit · hook",
              },
            ].map((card, i) => (
              <div key={i} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: isMatrix || isDos ? "0" : "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "10px", transition: "border-color 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = t.borderHover}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = t.border}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: (card as any).codeColor === "green" ? t.green : (card as any).codeColor === "cyan" ? t.accentAlt : (card as any).codeColor === "yellow" ? t.yellow : t.accent }}>
                  {card.icon}
                  <span style={{ fontSize: "11px", color: t.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{card.label}</span>
                </div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: t.text }}>{card.title}</div>
                <div style={{ fontSize: "12px", color: t.textDim, lineHeight: 1.5 }}>{card.desc}</div>
                <pre style={{ margin: 0, padding: "8px 10px", background: isDark ? "#0d0d0f" : t.bgCardHover, border: `1px solid ${t.border}`, borderRadius: isMatrix || isDos ? "0" : "6px", fontSize: "11px", color: (card as any).codeColor === "green" ? t.green : (card as any).codeColor === "cyan" ? t.accentAlt : (card as any).codeColor === "yellow" ? t.yellow : t.accent, fontFamily: "'JetBrains Mono','SF Mono',monospace", lineHeight: 1.6, overflowX: "auto", whiteSpace: "pre" }}>
                  {card.code}
                </pre>
                <a href={card.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: t.textMuted, textDecoration: "none", marginTop: "auto" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = t.accent}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = t.textMuted}
                >{card.linkLabel} →</a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* COMPARISON TABLE */}
      {(!isEgg || isMatrix || isDos || mode === "ussr") && (
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: isMobile ? "48px 20px" : "60px 48px", borderTop: `1px solid ${t.border}` }}>
          <p style={{ fontSize: "11px", color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px", textAlign: "center" }}>{isDos ? "C:\\> COMPARE.EXE --all" : mx("How Orchesis compares", "COMPARATIVE_ANALYSIS")}</p>
          <h2 style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: isDark ? 700 : 300, letterSpacing: isMatrix || isDos ? "0.02em" : "-0.04em", lineHeight: 1.1, margin: "0 0 32px", textAlign: "center" }}>
            <span style={{ textAlign: "center", display: "block" }}>{isDos ? "COMPARATIVE ANALYSIS" : mx("Not another SDK.", "NOT_ANOTHER_SDK.")}</span><span style={{ color: t.textDim, textAlign: "center", display: "block" }}>{isDos ? "" : mx("Just a proxy that keeps your agents honest.", "JUST_A_PROXY_THAT_KEEPS_YOUR_AGENTS_HONEST.")}</span>
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "520px" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                  {["Criteria", "Generic Gateway", "LLM Router", "Agent Platform", "Orchesis"].map((h, i) => (
                    <th key={i} style={{ padding: "10px 14px", textAlign: i === 0 ? "left" : "center", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: i === 4 ? t.accent : t.textMuted, background: i === 4 ? (isDark ? "rgba(168,85,247,0.06)" : "rgba(196,30,58,0.04)") : "transparent", borderLeft: i === 4 ? `1px solid ${isDark ? "rgba(168,85,247,0.2)" : "rgba(196,30,58,0.15)"}` : "none" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Understands MCP/A2A", "✗", "✗", "✗", "✓"],
                  ["17-phase security",   "✗", "✗", "✗", "✓"],
                  ["Fleet correlation",   "✗", "✗", "partial", "✓"],
                  ["Formal security proofs", "✗", "✗", "✗", "✓"],
                  ["Zero dependencies",   "✗", "✗", "✗", "✓"],
                  ["Open source (MIT)",   "varies", "some", "✗", "✓"],
                  ["Transparent proxy",   "✗", "partial", "✗", "✓"],
                  ["Zero code changes",   "✗", "✗", "✗", "✓"],
                  ["Self-hosted",         "✗", "✗", "✗", "✓"],
                  ["No telemetry",        "✗", "✗", "✗", "✓"],
                ].map((row, ri, arr) => (
                  <tr key={ri} style={{ borderBottom: ri < arr.length - 1 ? `1px solid ${t.border}` : "none", transition: "background 0.2s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = t.bgCard}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    {row.map((cell, ci) => {
                      const isOrchesis = ci === 4;
                      const isCheck = cell === "✓";
                      const isCross = cell === "✗";
                      const isPartial = cell === "varies" || cell === "partial" || cell === "some";
                      return (
                        <td key={ci} style={{ padding: "12px 14px", textAlign: ci === 0 ? "left" : "center", color: isOrchesis ? (isCheck ? t.green : t.textDim) : isCross ? t.textMuted : isPartial ? t.yellow : isCheck ? t.green : t.textDim, fontWeight: isOrchesis && isCheck ? 700 : 400, background: isOrchesis ? (isDark ? "rgba(168,85,247,0.04)" : "rgba(196,30,58,0.03)") : "transparent", borderLeft: isOrchesis ? `1px solid ${isDark ? "rgba(168,85,247,0.15)" : "rgba(196,30,58,0.1)"}` : "none", fontSize: ci === 0 ? "13px" : "14px", minWidth: ci === 0 ? "140px" : "60px" }}>
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* WHY NOW */}
      {(!isEgg || isMatrix || isDos || mode === "ussr") && (
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: isMobile ? "48px 20px" : "60px 48px", borderTop: `1px solid ${t.border}` }}>
          <p style={{ fontSize: "11px", color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px", textAlign: "center" }}>{isDos ? "C:\\> WARNING.EXE" : mx("Why this matters now", "WARNING: SYSTEM_ALERT")}</p>
          <h2 style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: isDark ? 700 : 300, letterSpacing: (isMatrix || isDos) ? "0.02em" : "-0.04em", lineHeight: 1.1, margin: "0 0 32px", textAlign: "center" }}>
            {isDos ? "SYSTEM ALERTS" : mx("The window is closing.", "CRITICAL_ALERTS_DETECTED_")}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
            {[
              { stat: "40%", label: isDos ? "[ALERT_001]" : "[ALERT_001]", desc: "of agentic AI projects will be canceled by 2027 due to inadequate risk controls", source: "Gartner, 2025", color: t.red },
              { stat: "30K+", label: isDos ? "[ALERT_002]" : "[ALERT_002]", desc: "stars on Paperclip in 2.5 weeks. AI agent fleets are here. No dedicated security layer exists for them yet.", source: "GitHub, March 2026", color: t.accent },
              { stat: "$417M", label: isDos ? "[ALERT_004]" : "[ALERT_004]", desc: "Runtime Gateway for AI Agents market in 2026, growing to $2.8B by 2030.", source: "Market estimate", color: t.accentAlt },
              { stat: isDos ? "AUG_2026" : mx("Aug 2026","AUG_2026"), label: isDos ? "[ALERT_003]" : "[ALERT_003]", desc: "EU AI Act enforcement begins. Audit trails and incident reporting required.", source: "EU AI Act", color: t.yellow },
            ].map((card, i) => (
              <div key={i} style={{ background: t.bgCard, border: `1px solid ${(isMatrix || isDos) ? card.color : t.border}`, borderRadius: (isMatrix || isDos) ? "0" : "12px", padding: "24px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {isMatrix && <div style={{ fontSize: "11px", color: card.color, fontFamily: "'Courier New',monospace", letterSpacing: "0.1em" }}>{card.label}</div>}
                <div style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-0.04em", color: card.color, lineHeight: 1 }}>{card.stat}</div>
                <p style={{ fontSize: "13px", color: t.textDim, lineHeight: 1.6, margin: 0, flex: 1 }}>{card.desc}</p>
                <div style={{ fontSize: "11px", color: t.textMuted, letterSpacing: "0.06em" }}>— {card.source}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "16px", color: t.textDim, textAlign: "center", fontStyle: (isMatrix || isDos) ? "normal" : "italic", fontFamily: (isMatrix || isDos) ? "'Courier New',monospace" : "inherit" }}>
            {isDos ? "C:\\> ORCHESIS_STATUS: READY" : mx("Orchesis is ready. Are your agents?", "> ORCHESIS_STATUS: READY")}
          </p>
        </section>
      )}

      {/* BLOG SECTION */}
      {(!isEgg || isMatrix || isDos || mode === "ussr") && (
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: isMobile ? "48px 20px" : "60px 48px", borderTop: `1px solid ${t.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ fontSize: "11px", color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>{isDos ? "C:\\ORCHESIS\\BLOG> DIR /B" : mx("From the blog", "ACCESS_LOG")}</p>
              <h2 style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: isDark ? 700 : 300, letterSpacing: (isMatrix || isDos) ? "0.02em" : "-0.04em", lineHeight: 1.1, margin: 0 }}>{isDos ? "BLOG ENTRIES" : mx("What we've learned", "READING_ENTRIES_")}</h2>
            </div>
          </div>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <a href="/blog" style={{ fontSize: "13px", color: t.textDim, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", transition: "opacity 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.7"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
            >{isDos ? "C:\\> DIR /B /A → VIEW ALL" : mx("View all articles →", "> LIST_ALL_ENTRIES")}</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "16px" }}>
            {[
              { tag: "SECURITY",     tagColor: "#ef4444", tagBg: "rgba(239,68,68,0.08)",   tagBorder: "rgba(239,68,68,0.2)",   title: "43% of MCP configs run bare shell. That's not a misconfiguration.", desc: "Bare shell execution is the most common MCP tool interface. Here's why that's dangerous.", href: "/blog/mcp-bare-shell-execution" },
              { tag: "INCIDENT",     tagColor: "#ef4444", tagBg: "rgba(239,68,68,0.08)",   tagBorder: "rgba(239,68,68,0.2)",   title: "One compromised scanner, three hacked projects, 100M downloads poisoned.", desc: "LiteLLM supply chain attack: Trivy → KICS → PyPI. Full chain analysis.", href: "/blog/litellm-supply-chain-attack" },
              { tag: "INCIDENT",     tagColor: "#f97316", tagBg: "rgba(249,115,22,0.08)",  tagBorder: "rgba(249,115,22,0.2)",  title: "I left my AI agent running overnight. Here's what I found.",     desc: "$47,000 from an agent loop. 43,175 restarts. 2.5 years of data wiped.", href: "/blog/what-happens-ai-agent-runs-overnight" },
            ].map((post, i) => (
              <a key={i} href={post.href} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "24px 20px", textDecoration: "none", display: "flex", flexDirection: "column", gap: "12px", transition: "all 0.25s", cursor: "pointer" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = t.borderHover; el.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = t.border; el.style.transform = "translateY(0)"; }}
              >
                <span style={{ display: "inline-flex", alignSelf: "flex-start", padding: "3px 10px", borderRadius: (isMatrix || isDos) ? "0" : "100px", background: (isMatrix || isDos) ? "transparent" : post.tagBg, border: `1px solid ${(isMatrix || isDos) ? post.tagColor : post.tagBorder}`, fontSize: "10px", fontWeight: 700, color: post.tagColor, letterSpacing: "0.08em", fontFamily: (isMatrix || isDos) ? "'Courier New',monospace" : "inherit" }}>{isDos ? `[${post.tag.slice(0,8).padEnd(8)}]` : isMatrix ? `[${post.tag}]` : post.tag}</span>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: t.text, margin: 0, lineHeight: 1.4 }}>{post.title}</h3>
                <p style={{ fontSize: "12px", color: t.textDim, lineHeight: 1.6, margin: 0, flex: 1 }}>{post.desc}</p>
                <span style={{ fontSize: "12px", color: t.accent, fontFamily: (isMatrix || isDos) ? "'Courier New',monospace" : "inherit" }}>{isDos ? "> READ MORE" : mx("Read more →", "> READ_ENTRY")}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* #5 — Final CTA block */}
      {(!isEgg || isMatrix || isDos || mode === "ussr") && (
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: isMobile ? "48px 20px" : "80px 48px", borderTop: `1px solid ${t.border}`, textAlign: "center", ...anim(1.2) }}>
          <p style={{ fontSize: "12px", color: t.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>{isDos ? "C:\\ORCHESIS> ECHO OFF" : mx("Open source · MIT License", "OPEN_SOURCE · MIT_LICENSE")}</p>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: isDark ? 700 : 300, letterSpacing: (isMatrix || isDos) ? "0.02em" : "-0.04em", lineHeight: 1.1, margin: "0 0 12px" }}>
            {isDos ? "YOUR AGENTS ARE ALREADY" : mx("Your agents are already", "YOUR_AGENTS_ARE_ALREADY")}<br /><span style={{ color: t.textDim }}>{isDos ? "MAKING API CALLS." : mx("making API calls.", "MAKING_API_CALLS.")}</span>
          </h2>
          <p style={{ fontSize: "16px", color: t.textDim, marginBottom: "36px", fontFamily: (isMatrix || isDos) ? "'Courier New',monospace" : "inherit" }}>{isDos ? "NOW YOU CAN SEE EVERY ONE." : mx("Now you can see every one.", "NOW_YOU_CAN_SEE_EVERY_ONE.")}</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://github.com/poushwell/orchesis#quick-start" target="_blank" rel="noopener noreferrer"
              style={{ padding: "13px 32px", borderRadius: isDark ? "12px" : "0", border: isDark ? "none" : `2px solid ${t.accent}`, background: t.btnPrimary, color: t.btnText, fontSize: "14px", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", boxShadow: t.btnGlow, transition: "all 0.3s" }}>
              Get Started
            </a>
            <a href="https://github.com/poushwell/orchesis" target="_blank" rel="noopener noreferrer"
              style={{ padding: "13px 32px", borderRadius: isDark ? "12px" : "0", border: `1px solid ${t.border}`, background: "transparent", color: t.textDim, fontSize: "14px", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.7 }}>
                <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
              </svg>
{isDos ? `[ ★ STAR ON GITHUB${stars !== null ? " · " + stars : ""} ]` : mx(`Star on GitHub${stars !== null ? ` · ${stars}` : ""}`, `[★ STAR_ON_GITHUB${stars !== null ? ` · ${stars}` : ""}]`)}
            </a>
          </div>
        </section>
      )}

      {/* TAGLINE */}
      <section style={{ textAlign: "center", padding: isMobile ? "40px 20px 60px" : (isDark ? "60px 48px 80px" : "80px 64px"), borderTop: isDark ? `1px solid ${t.border}` : "none", position: "relative", zIndex: 10, ...anim(1.3) }}>
        {!isDark && <p style={{ fontSize: "18px", fontWeight: 300, color: t.textMuted, letterSpacing: "-0.01em", lineHeight: 1.6 }}>勝っても負けても機能する</p>}
        <p style={{ fontSize: isDark ? "20px" : "13px", color: t.textMuted, fontWeight: isDark ? 500 : 400, letterSpacing: "-0.02em", marginTop: !isDark ? "8px" : "0" }}>
          Works whether AI wins or loses.
        </p>
        {isDark && <p style={{ fontSize: "12px", color: t.textMuted, marginTop: "8px", letterSpacing: "0.05em" }}>Open Source · MIT License · Zero Dependencies</p>}
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${t.border}`, position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: isDark ? "800px" : "920px", margin: "0 auto", padding: isMobile ? "24px 20px" : (isDark ? "32px 48px" : "32px 64px"), display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexWrap: "wrap", gap: isMobile ? "20px" : "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {isDark ? (
              <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #38bdf8)", opacity: 0.7 }} />
            ) : (
              <div style={{ width: "14px", height: "14px", border: `1.5px solid ${t.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "4px", height: "4px", background: t.accent }} />
              </div>
            )}
            <span style={{ fontSize: "12px", color: t.textMuted, letterSpacing: isDark ? "0" : "0.1em", textTransform: isDark ? "none" : "uppercase" as const }}>
{isDos ? "© 2026 ORCHESIS — MIT LICENSE" : isMatrix ? "© 2026 ORCHESIS — MIT_LICENSE" : (isDark ? "© 2026 Orchesis" : "© 2026 ORCHESIS")}
            </span>
          </div>
          <div style={{ display: "flex", gap: isMobile ? "16px" : (isDark ? "28px" : "24px"), alignItems: "center", flexWrap: "wrap" }}>
            {[
              { label: "GitHub", href: "https://github.com/poushwell/orchesis" },
              { label: "Docs", href: "https://github.com/poushwell/orchesis/blob/main/QUICK_START.md" },
              { label: mode === "ussr" ? "Скан" : "Scan", href: "/scan" },
              { label: mode === "ussr" ? "Оценка" : "Scorecard", href: "/scorecard" },
              { label: "OpenClaw", href: "/openclaw" },
              { label: "Telegram", href: "/telegram" },
              { label: "Paperclip", href: "/paperclip" },
              { label: "Blog", href: "/blog" },
              { label: "Pavel Ishchin", href: "https://ishchin.com" },
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
            ].map(link => (
              <a key={link.label} href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                style={{ fontSize: isDark ? "12px" : "10px", color: t.textMuted, textDecoration: "none", letterSpacing: isDark ? "0" : "0.1em", textTransform: isDark ? "none" : "uppercase" as const, transition: "color 0.2s" }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = t.textDim}
                onMouseLeave={e => (e.target as HTMLElement).style.color = t.textMuted}
              >{link.label}</a>
            ))}
          </div>
        </div>
      </footer>

      {!isEgg && <div style={{ textAlign: "center", paddingBottom: "8px", fontSize: "11px", color: "#333" }}>// try: help</div>}
      {isMatrix && <div style={{ textAlign: "center", paddingBottom: "12px", fontSize: "11px", color: "#004d14", fontFamily: "'Courier New',monospace", letterSpacing: "0.1em" }}>&gt; PRESS_ESC_TO_EXIT_MATRIX_MODE</div>}
      {isDos && <div style={{ textAlign: "center", paddingBottom: "12px", fontSize: "11px", color: "#555588", fontFamily: "'Courier New',monospace", letterSpacing: "0.1em" }}>C:\&gt; Press ESC to exit DOS mode<span style={{ animation: "cur 1s step-end infinite" }}>_</span></div>}

      <style>{`
        @keyframes aurora { 0% { transform: translate(0,0) scale(1); } 33% { transform: translate(20px,-10px) scale(1.05); } 66% { transform: translate(-10px,15px) scale(0.98); } 100% { transform: translate(5px,-5px) scale(1.02); } }
        @keyframes cur { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes livePulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes logSlide { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes egg-glitch { 0%,100%{opacity:1;filter:none} 20%{opacity:.6;filter:hue-rotate(90deg)} 40%{opacity:.9;filter:invert(.1)} 60%{opacity:.5;filter:hue-rotate(-90deg)} 80%{opacity:.8;filter:none} }
        @keyframes egg-bios { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes egg-scanlines { 0%,100%{opacity:1} 25%{opacity:.4} 50%{opacity:.8} 75%{opacity:.3} }
        .egg-glitch{animation:egg-glitch .3s linear}
        .egg-bios{animation:egg-bios .35s step-end}
        .egg-scanlines{animation:egg-scanlines .3s linear}
      `}</style>
    </div>
    </>
  );
}
