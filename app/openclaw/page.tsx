"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import EasterEggs from "../components/EasterEggs";

type SiteMode = "dark" | "light" | "matrix" | "dos" | "ussr";

const themes: Record<string, Record<string, string>> = {
  matrix: {
    bg: "#000000", bgCard: "#001100", bgCard2: "#002200",
    text: "#00ff41", textDim: "#009921", textMut: "#004d14",
    accent: "#00ff41", accent2: "#00cc33", accent3: "#ffcc00",
    border: "#001908", borderH: "#003311",
    red: "#ff4444", green: "#00ff41", yellow: "#ffcc00",
    tagBg: "rgba(0,255,65,0.08)", tagBrd: "rgba(0,255,65,0.2)", tagTxt: "#00cc33",
    btnBg: "#00ff41", btnTxt: "#000000", btnGlow: "none",
  },
  dos: {
    bg: "#000080", bgCard: "#0000aa", bgCard2: "#0000cc",
    text: "#ffffff", textDim: "#aaaaaa", textMut: "#555588",
    accent: "#ffff55", accent2: "#55ffff", accent3: "#ff5555",
    border: "#5555ff", borderH: "#8888ff",
    red: "#ff5555", green: "#55ff55", yellow: "#ffff55",
    tagBg: "rgba(255,255,85,0.1)", tagBrd: "rgba(255,255,85,0.3)", tagTxt: "#ffff55",
    btnBg: "#aaaaaa", btnTxt: "#000080", btnGlow: "none",
  },
  dark: {
    bg: "#0f0f11", bgCard: "#18181b", bgCard2: "#1f1f23",
    text: "#e4e4e7", textDim: "#71717a", textMut: "#3f3f46",
    accent: "#a855f7", accent2: "#38bdf8", accent3: "#fb923c",
    border: "#27272a", borderH: "#52525b",
    red: "#ef4444", green: "#22c55e", yellow: "#eab308",
    tagBg: "rgba(168,85,247,0.08)", tagBrd: "rgba(168,85,247,0.2)", tagTxt: "#c084fc",
    btnBg: "linear-gradient(135deg,#a855f7,#7c3aed)", btnTxt: "#fff", btnGlow: "0 0 24px rgba(168,85,247,0.25)",
  },
  light: {
    bg: "#F7F5F0", bgCard: "#fff", bgCard2: "#FAFAF6",
    text: "#1A1A1A", textDim: "#777", textMut: "#BBB",
    accent: "#C41E3A", accent2: "#C41E3A", accent3: "#C41E3A",
    border: "#E8E4DC", borderH: "#CCC",
    red: "#C41E3A", green: "#2E7D32", yellow: "#E65100",
    tagBg: "#F0EDE6", tagBrd: "#E8E4DC", tagTxt: "#999",
    btnBg: "#C41E3A", btnTxt: "#fff", btnGlow: "none",
  },
};

const STORIES = [
  { issue: "Issue #27602 · OpenClaw", metric: "$15.09", metricLabel: "spent in 90 minutes on one image", title: "The image that triggered 33 million cache reads", desc: "A group chat photo triggered a cache recursion bug. Every read spawned more reads. Nobody got an alert. Nobody got a refund.", outcome: "Orchesis detects it on request #3", outcomeDetail: "8 seconds after the photo. $0.20 spent. $14.89 prevented." },
  { issue: "Issue #28191 · OpenClaw", metric: "43,175×", metricLabel: "restarts in one night, zero alerts", title: "The loop that ran until Windows killed the VM", desc: "A port conflict triggered systemd restart policy. The gateway tried to bind, failed, and restarted. 43,175 times. Found out when the VM died.", outcome: "Orchesis detects it on restart #4", outcomeDetail: "14 seconds after boot. One Telegram message with the exact diagnostic." },
  { issue: "Issue #41555 · OpenClaw", metric: "80:1", metricLabel: "thinking-to-output ratio at peak", title: "Opus thought itself into a loop /new couldn't fix", desc: "Thinking tokens doubled every request: 1,800 to 14,400. The model was still working. Session reset didn't help. Model swap was the only exit.", outcome: "Orchesis alerts at 10:1 ratio", outcomeDetail: "Two requests before the loop became unrecoverable. Tells you which model to switch to." },
  { issue: "Issue #9828 · OpenClaw", metric: "~100K", metricLabel: "extra tokens per request, default config", title: "The config that costs you money on every single call", desc: "Default OpenClaw config injects the entire configuration schema into every system prompt. Every request. ~100,000 extra tokens the LLM doesn't need. It breaks Anthropic prompt caching — instead of 90% savings on repeated calls, you pay full price every time.", outcome: "orchesis verify detects it in 30 seconds", outcomeDetail: "Shows the exact overhead and the one-line fix." },
];

const COMPARE = [
  { feat: "Loop detection", without: "loopDetection fires on some loops, misses exec tool calls entirely.", issue: "Issue #34574 · 122 identical calls · 0 alerts", with: "Alert on call #3. Catches exec loops, thinking loops, restart loops, all 6 types." },
  { feat: "Cost visibility", without: "totalTokens: null. Find out from the monthly invoice.", issue: "Issue #21819 · token tracking structurally broken", with: "Per-request cost in real time, from the actual API response. Not estimated. Exact." },
  { feat: "Injection defense", without: 'Tool results land directly in LLM context. No scanning.', issue: 'SECURITY.md · "prompt injection is out of scope"', with: "33+ patterns scanned before LLM sees the content. Block or alert per pattern." },
  { feat: "Crystal phase", without: "Agent locks into a fixed execution pattern. Looks like progress. Isn't.", issue: "Issue #41555 · thinking loop survives /new session", with: "Ψ_α computed per request. Alert fires when tool diversity collapses below threshold." },
  { feat: "Fleet view", without: "No cross-agent visibility. Gateway restarts kill all sessions.", issue: "Issue #43178 · Issue #26322 · $636/mo OAuth waste", with: "All agents visible simultaneously. Cross-agent patterns detected." },
  { feat: "Setup time", without: "Custom logging, custom alerts, custom wrappers. Weeks of backlog.", issue: "", with: "pip install + one config line. First alert in under 5 minutes." },
  { feat: "Config audit", without: "Default config adds ~100,000 extra tokens per request. Breaks prompt caching. No warning.", issue: "Issue #9828 · every request · every user", with: "orchesis verify detects in 30 seconds. Shows exact overhead and one-line fix." },
  { feat: "Price", without: "Your time, plus whatever the next loop costs.", issue: "", with: "$0. MIT license. Self-hosted. No telemetry." },
];

const THEOREMS = [
  { id: "T1", sub: "Fleet Metric Impossibility", title: "Your agent physically cannot monitor your fleet.", plain: "An SDK inside a single agent sees one conversation from inside. Fleet-level metrics require data from all agents simultaneously. Getting that data costs O(n) reports plus O(n) queries per update. For pairwise comparisons: O(n²).", impl: "A proxy already sees every agent's traffic as a side effect of routing. Zero additional calls. The same data that would require constant polling from an SDK is always present in the proxy's view." },
  { id: "T2", sub: "Self-Detection Impossibility", title: "A compromised agent can't detect its own compromise.", plain: "If a prompt injection modifies an agent's context, the agent's own security checks run inside that modified context. It's checking itself with corrupted instructions. An external observer compares behavior against the fleet baseline.", impl: "Issue #28191 ran 43,175 iterations with nothing reported. The gateway saw activity. Orchesis saw the pattern of activity and spotted the deviation before the crash." },
  { id: "T3", sub: "Causal Graph Impossibility", title: "You can't trace multi-agent failures from single-agent logs.", plain: "When something goes wrong, an SDK watching one agent sees one slice of the story. It sees \"I called X and got error Y.\" It doesn't see that another agent triggered the failure 30 seconds earlier.", impl: "Issue #26322: 18 agents, one OAuth profile. Agent A refreshed the token. Agent B used the stale one, got 401, fell back to Opus at $0.186/turn. That's $636/month from one architectural decision. Orchesis sees both streams and identifies the cross-agent cause." },
];

export default function OpenClaw() {
  const [mode, setMode] = useState<SiteMode>("dark");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const t = themes[mode] || themes["dark"];
  const isMatrix = mode === "matrix";
  const isDos = mode === "dos";
  const isDark = mode === "dark";
  const isLight = mode === "light";
  const isEgg = isMatrix || isDos;
  const mono = isEgg ? "\'Courier New\', monospace" : "\'JetBrains Mono\', \'SF Mono\', monospace";
  const sans = isLight ? "\'Noto Sans JP\', \'Inter\', system-ui, sans-serif" : isEgg ? mono : "-apple-system, \'Segoe UI\', system-ui, sans-serif";

  const toggle = () => setMode(m => m === "dark" ? "light" : "dark");

  const S = (x: Record<string,string|number>) => x as React.CSSProperties;

  const card = S({ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: isEgg ? "0" : "12px", transition: "background 0.2s" });
  const pill = S({ display: "inline-flex", alignItems: "center", gap: "6px", background: t.tagBg, border: `1px solid ${t.tagBrd}`, borderRadius: "100px", padding: "5px 14px", fontSize: "12px", color: t.tagTxt, fontFamily: mono, letterSpacing: "0.05em" });
  const sectionTag = S({ display: "inline-block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: t.accent, marginBottom: "14px", fontFamily: mono });
  const sectionTitle = S({ fontSize: "clamp(22px,4vw,38px)", fontWeight: isLight ? 300 : 700, letterSpacing: isEgg ? "0.02em" : "-0.03em", lineHeight: 1.15, marginBottom: "12px" });
  const sectionSub = S({ fontSize: "15px", color: t.textDim, maxWidth: "500px", lineHeight: 1.6 });
  const divider = S({ borderTop: `1px solid ${t.border}`, margin: "0" });

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: sans, lineHeight: 1.6, transition: "background 0.3s, color 0.3s" }}>
      <EasterEggs mode={mode} onActivate={setMode} />

      {/* NAV */}
      <nav style={{ borderBottom: `1px solid ${t.border}`, position: "sticky", top: 0, background: t.bg, zIndex: 100 }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: t.text, fontSize: "15px", fontWeight: 600 }}>
            <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #38bdf8)", opacity: 0.9, flexShrink: 0 }} />
            Orchesis
            <span style={{ fontSize: "11px", fontWeight: 500, color: t.textMut, background: t.bgCard, border: `1px solid ${t.border}`, padding: "2px 10px", borderRadius: "100px", fontFamily: mono }}>
              {isDos ? "[ × OPENCLAW ]" : isMatrix ? "×OPENCLAW" : "× OpenClaw"}
            </span>
          </Link>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {!isMobile && (
              <>
                <a href="#how-it-works" style={{ color: t.textDim, textDecoration: "none", fontSize: "14px", padding: "6px 12px", transition: "color 0.2s" }}>How it works</a>
                <a href="#math" style={{ color: t.textDim, textDecoration: "none", fontSize: "14px", padding: "6px 12px", transition: "color 0.2s" }}>Why proxy</a>
                <a href="https://github.com/poushwell/orchesis" target="_blank" rel="noopener noreferrer" style={{ color: t.textDim, textDecoration: "none", fontSize: "14px", padding: "6px 12px", transition: "color 0.2s" }}>GitHub</a>
              </>
            )}
            {mode !== "ussr" && (
              <button onClick={toggle} style={{ padding: "6px 14px", borderRadius: isDark ? "8px" : "0", border: `1px solid ${t.border}`, background: "transparent", color: t.textDim, fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>
                {isDark ? "☀ Light" : isLight ? "🌙 Dark" : isMatrix ? "✕ EXIT" : "✕ EXIT"}
              </button>
            )}
            <a href="#install" style={{ background: t.btnBg, color: t.btnTxt, padding: "8px 18px", borderRadius: isEgg ? "0" : "10px", textDecoration: "none", fontSize: "14px", fontWeight: 600, boxShadow: t.btnGlow }}>
              {isDos ? "[ INSTALL.EXE ]" : isMatrix ? "INSTALL_FREE >" : "Install free →"}
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: isMobile ? "64px 20px 60px" : "96px 48px 80px", textAlign: "center" }}>
        <div style={pill as React.CSSProperties}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: t.green, display: "inline-block" }} />
          {isDos ? "BUILT ON 3,400+ OPENCLAW GITHUB ISSUES" : isMatrix ? "> built_on_3400+_openclaw_issues" : "Built on 3,400+ OpenClaw GitHub issues"}
        </div>

        <h1 style={{ fontSize: isMobile ? "36px" : "clamp(40px,7vw,72px)", fontWeight: isLight ? 300 : 700, letterSpacing: isEgg ? "0.02em" : "-0.04em", lineHeight: 1.1, margin: "28px 0 20px" }}>
          {isDos ? <>YOUR OPENCLAW AGENT<br/><span style={{ color: t.textDim }}>IS LOOPING.</span><br/><span style={{ color: t.accent }}>YOU DON'T KNOW YET.</span></> :
           isMatrix ? <><span style={{ color: t.text }}>AGENT_STATUS:</span><br/><span style={{ color: t.textDim }}>LOOPING.</span><br/><span style={{ color: t.accent }}>UNDETECTED.</span></> :
           <>Your OpenClaw agent<br/><span style={{ color: t.textDim }}>is looping.</span><br/><span style={{ color: t.accent }}>You don't know yet.</span></>}
        </h1>

        <p style={{ fontSize: "17px", color: t.textDim, maxWidth: "500px", margin: "0 auto 12px", lineHeight: 1.6 }}>
          {isDos ? "ORCHESIS.EXE INTERCEPTS ALL AGENT TRAFFIC. LOOPS DETECTED IN 3 CALLS." :
           isMatrix ? "proxy intercepts all_agent_traffic. loops_detected: call_3." :
           "Orchesis sits between your agents and the LLM API, telling you what's going wrong before it costs you money."}
        </p>
        {!isEgg && (
          <p style={{ fontSize: "14px", color: t.textDim, maxWidth: "560px", margin: "0 auto 12px", lineHeight: 1.6 }}>
            <strong style={{ color: t.text }}>Orchesis is an open-source HTTP proxy that sits between OpenClaw agents and LLM APIs to detect loops, prompt injection, and cost anomalies in real time</strong> — based on analysis of 3,400+ OpenClaw GitHub issues.
          </p>
        )}

        <p style={{ fontSize: "12px", color: t.textMut, marginBottom: "36px", fontFamily: mono, letterSpacing: "0.05em" }}>
          <span style={{ color: t.textDim }}>122 calls</span> · <span style={{ color: t.textDim }}>loopDetection ON</span> · <span style={{ color: t.textDim }}>zero alerts</span> · <span style={{ color: t.accent }}>Orchesis: call #3</span>
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "40px" }}>
          <a href="#install" style={{ background: t.btnBg, color: t.btnTxt, padding: "12px 28px", borderRadius: isEgg ? "0" : "12px", textDecoration: "none", fontSize: "15px", fontWeight: 600, boxShadow: t.btnGlow, display: "inline-block" }}>
            {isDos ? "[ INSTALL IN 5 MINUTES ]" : isMatrix ? "INSTALL_NOW >" : "Install in 5 minutes →"}
          </a>
          <a href="https://github.com/poushwell/orchesis" target="_blank" rel="noopener noreferrer" style={{ background: "transparent", color: t.textDim, padding: "12px 28px", borderRadius: isEgg ? "0" : "12px", textDecoration: "none", fontSize: "15px", fontWeight: 500, border: `1px solid ${t.border}`, display: "inline-block" }}>
            {isDos ? "[ ★ GITHUB ]" : "★ Star on GitHub"}
          </a>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginBottom: "48px" }}>
          {[
            { icon: "⚡", text: isDos ? "[ 4,813+ TESTS ]" : isMatrix ? "4813_tests_passing" : "4,813+ tests passing" },
            { icon: "🔒", text: isDos ? "[ 18 PATTERNS ]" : isMatrix ? "18_injection_patterns" : "18 injection patterns" },
            { icon: "◎", text: isDos ? "[ ZERO LOCK-IN ]" : isMatrix ? "zero_vendor_lock-in" : "Zero vendor lock-in" },
            { icon: "⚖", text: isDos ? "[ MIT LICENSE ]" : isMatrix ? "MIT_License" : "MIT License" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: isEgg ? "0" : "100px", padding: "5px 14px", fontSize: "12px", color: t.textDim, fontFamily: mono }}>
              {s.icon} {s.text}
            </div>
          ))}
        </div>

        {/* CODE BLOCK */}
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: isEgg ? "0" : "12px", overflow: "hidden", textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: `1px solid ${t.border}`, background: t.bgCard2 }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ffbd2e" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#28c840" }} />
            </div>
            <span style={{ fontFamily: mono, fontSize: "11px", color: t.textMut }}>~/.openclaw/openclaw.json</span>
            <span />
          </div>
          <div style={{ padding: "18px 22px", fontFamily: mono, fontSize: "13px", lineHeight: 2 }}>
            <span style={{ color: t.textMut }}># Before — agent calls Anthropic directly</span><br />
            <span style={{ color: t.accent }}>"baseUrl"</span>: <span style={{ color: t.accent2 }}>"https://api.anthropic.com"</span><br /><br />
            <span style={{ color: t.textMut }}># After — one line change</span><br />
            <span style={{ display: "block", background: t.tagBg, borderLeft: `2px solid ${t.accent}`, margin: "0 -22px", padding: "0 22px" }}>
              <span style={{ color: t.accent }}>"baseUrl"</span>: <span style={{ color: t.accent2 }}>"http://localhost:8080"</span>
            </span><br />
            <span style={{ color: t.green }}>✓ Crystal Alert: active</span><br />
            <span style={{ color: t.green }}>✓ Injection Shield: active (33+ patterns)</span><br />
            <span style={{ color: t.green }}>✓ Cost tracking: real-time</span><br />
            <span style={{ color: t.yellow }}>⚠ 14:23 · agent:coder-01 · crystal phase · call #8</span><br />
            <span style={{ color: t.red }}>🔴 Telegram alert sent · /thaw to resume</span>
          </div>
        </div>
      </div>

      {/* THREE STORIES */}
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: isMobile ? "0 20px" : "0 48px" }}>
        <div style={divider as React.CSSProperties} />
        <section style={{ padding: "80px 0" }}>
          <div style={sectionTag as React.CSSProperties}>{isDos ? "REAL INCIDENTS · VERIFIED" : isMatrix ? "real_incidents.verified" : "Real incidents that actually happened"}</div>
          <h2 style={sectionTitle as React.CSSProperties}>Real incidents. Real GitHub issues.</h2>
          <p style={sectionSub as React.CSSProperties}>Each story has a public issue number. Each number is verifiable.</p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1px", background: t.border, border: `1px solid ${t.border}`, borderRadius: isEgg ? "0" : "12px", overflow: "hidden", marginTop: "48px" }}>
            {STORIES.map((s, i) => (
              <div key={i} style={{ background: t.bgCard, padding: "28px" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = t.bgCard2}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = t.bgCard}
              >
                <div style={{ fontFamily: mono, fontSize: "11px", color: t.textMut, marginBottom: "14px", letterSpacing: "0.05em" }}>{s.issue}</div>
                <div style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-0.03em", color: t.red, lineHeight: 1, marginBottom: "4px" }}>{s.metric}</div>
                <div style={{ fontSize: "12px", color: t.textDim, marginBottom: "18px" }}>{s.metricLabel}</div>
                <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "10px", lineHeight: 1.3 }}>{s.title}</h3>
                <p style={{ fontSize: "13px", color: t.textDim, lineHeight: 1.6, marginBottom: "16px" }}>{s.desc}</p>
                <p style={{ fontSize: "13px", color: t.textDim, paddingTop: "14px", borderTop: `1px solid ${t.border}`, lineHeight: 1.6 }}>
                  <strong style={{ color: t.green, fontWeight: 500 }}>{s.outcome}</strong> — {s.outcomeDetail}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* HOW IT WORKS */}
      <div id="how-it-works" style={{ maxWidth: "1080px", margin: "0 auto", padding: isMobile ? "0 20px" : "0 48px" }}>
        <div style={divider as React.CSSProperties} />
        <section style={{ padding: "80px 0" }}>
          <div style={sectionTag as React.CSSProperties}>{isDos ? "SETUP" : "Setup"}</div>
          <h2 style={sectionTitle as React.CSSProperties}>{isDos ? "THREE STEPS. FIVE MINUTES." : "Three steps. Five minutes."}</h2>
          <p style={sectionSub as React.CSSProperties}>No code changes in your agents. No API key changes. One line in your OpenClaw config.</p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "14px", marginTop: "48px" }}>
            {[
              { num: "01 · Install", title: "30 seconds", codes: ["pip install orchesis", "orchesis init"], note: "Proxy starts on port 8080. Nothing changes in your agents until you update the config." },
              { num: "02 · Connect", title: "One line", codes: ['"proxy": { "url": "http://localhost:8080" }'], note: "Add to your OpenClaw config. Restart the gateway. Your agents route through Orchesis automatically." },
              { num: "03 · Protect", title: "Automatic", codes: [], note: "Orchesis reads every request your agents make without touching your code or API keys.", note2: "When something goes wrong: Telegram alert, one diagnosis, one action." },
            ].map((step, i) => (
              <div key={i} style={{ ...card, padding: "24px" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = t.borderH}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = t.border}
              >
                <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: t.accent, marginBottom: "14px", fontFamily: mono }}>{step.num}</div>
                <h3 style={{ fontSize: "17px", fontWeight: 600, marginBottom: "12px" }}>{step.title}</h3>
                {step.codes.map((code, j) => (
                  <div key={j} style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: isEgg ? "0" : "6px", padding: "8px 12px", fontFamily: mono, fontSize: "12px", color: t.accent2, marginBottom: "10px", whiteSpace: "pre" }}>{code}</div>
                ))}
                <p style={{ fontSize: "13px", color: t.textDim, lineHeight: 1.5 }}>{step.note}</p>
                {step.note2 && <p style={{ fontSize: "13px", color: t.accent, lineHeight: 1.5, marginTop: "10px" }}>{step.note2}</p>}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* COMPARISON TABLE */}
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: isMobile ? "0 20px" : "0 48px" }}>
        <div style={divider as React.CSSProperties} />
        <section style={{ padding: "80px 0" }}>
          <div style={sectionTag as React.CSSProperties}>{isDos ? "WHAT CHANGES" : "What changes"}</div>
          <h2 style={sectionTitle as React.CSSProperties}>{isDos ? "WITHOUT vs WITH ORCHESIS" : "Without Orchesis vs With Orchesis"}</h2>
          <div style={{ border: `1px solid ${t.border}`, borderRadius: isEgg ? "0" : "12px", overflow: "hidden", marginTop: "48px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: t.bgCard2 }}>
                  {["Feature", "Without Orchesis", "With Orchesis"].map((h, i) => (
                    <th key={i} style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: i === 2 ? t.accent : t.textMut, padding: "12px 20px", borderBottom: `1px solid ${t.border}`, fontFamily: mono }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < COMPARE.length - 1 ? `1px solid ${t.border}` : "none" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <td style={{ padding: "16px 20px", fontWeight: 600, fontSize: "13px", color: t.text, width: "130px", verticalAlign: "top" }}>{row.feat}</td>
                    <td style={{ padding: "16px 20px", fontSize: "13px", color: t.textDim, verticalAlign: "top", lineHeight: 1.6 }}>
                      {row.without}
                      {row.issue && <span style={{ display: "block", marginTop: "4px", fontFamily: mono, fontSize: "11px", color: t.textMut }}>{row.issue}</span>}
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: "13px", color: t.text, verticalAlign: "top", lineHeight: 1.6 }}>{row.with}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* THEOREMS */}
      <div id="math" style={{ maxWidth: "1080px", margin: "0 auto", padding: isMobile ? "0 20px" : "0 48px" }}>
        <div style={divider as React.CSSProperties} />
        <section style={{ padding: "80px 0" }}>
          <div style={sectionTag as React.CSSProperties}>{isDos ? "WHY A PROXY, NOT A PLUGIN" : "Why a proxy, not a plugin"}</div>
          <h2 style={sectionTitle as React.CSSProperties}>{isDos ? "SOME LIMITS AREN'T ENGINEERING PROBLEMS." : "Some limitations aren't engineering problems."}</h2>
          <p style={sectionSub as React.CSSProperties}>They're architectural constraints. We proved three of them.</p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: "12px", marginTop: "48px" }}>
            {THEOREMS.map((th, i) => (
              <div key={i} style={{ ...card, padding: "28px 32px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "90px 1fr", gap: isMobile ? "16px" : "28px" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = t.borderH}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = t.border}
              >
                <div style={{ fontFamily: mono, fontSize: "11px", color: t.textMut, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
                  <div style={{ fontSize: "36px", fontWeight: 800, color: t.accent, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "4px" }}>{th.id}</div>
                  {th.sub}
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px" }}>{th.title}</div>
                  <p style={{ fontSize: "13px", color: t.textDim, lineHeight: 1.7, marginBottom: "12px" }}>{th.plain}</p>
                  <p style={{ fontSize: "13px", color: t.textDim, lineHeight: 1.6, paddingLeft: "12px", borderLeft: `2px solid ${t.tagBrd}` }}>
                    <strong style={{ color: t.text, fontWeight: 500 }}>What this means: </strong>{th.impl}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* INSTALL */}
      <div id="install" style={{ maxWidth: "1080px", margin: "0 auto", padding: isMobile ? "0 20px" : "0 48px" }}>
        <div style={divider as React.CSSProperties} />
        <section style={{ padding: "80px 0" }}>
          <div style={{ ...card, padding: isMobile ? "32px 24px" : "48px", textAlign: "center" }}>
            <div style={sectionTag as React.CSSProperties}>Install</div>
            <h2 style={{ ...sectionTitle, marginBottom: "36px" } as React.CSSProperties}>
              {isDos ? "START IN 5 MINUTES. FREE." : "Start in 5 minutes. No credit card. No account."}
            </h2>
            <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: isEgg ? "0" : "10px", padding: "22px 26px", fontFamily: mono, fontSize: "13px", lineHeight: 2.2, textAlign: "left", maxWidth: "540px", margin: "0 auto 28px" }}>
              <span style={{ color: t.textMut }}># 1. Install</span><br />
              <span style={{ color: t.text }}>pip install orchesis</span><br /><br />
              <span style={{ color: t.textMut }}># 2. Start with both detectors</span><br />
              <span style={{ color: t.text }}>orchesis init <span style={{ color: t.accent2 }}>--with-crystal-alert --with-injection-shield</span></span><br /><br />
              <span style={{ color: t.textMut }}># 3. Connect OpenClaw (one line)</span><br />
              <span style={{ display: "block", background: t.tagBg, margin: "0 -26px", padding: "0 26px", borderLeft: `2px solid ${t.accent}` }}>
                <span style={{ color: t.text }}>"proxy": {"{ "}url: <span style={{ color: t.accent }}>"http://localhost:8080"</span>, enabled: <span style={{ color: t.accent }}>true</span>{" }"}</span>
              </span><br />
              <span style={{ color: t.text }}>openclaw gateway restart</span><br />
              <span style={{ color: t.text }}>orchesis verify</span><br /><br />
              <span style={{ color: t.green }}>✓ Proxy running · Crystal Alert active · Injection Shield active</span>
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "16px" }}>
              <a href="https://github.com/poushwell/orchesis/blob/main/QUICK_START.md" target="_blank" rel="noopener noreferrer" style={{ background: t.btnBg, color: t.btnTxt, padding: "11px 26px", borderRadius: isEgg ? "0" : "10px", textDecoration: "none", fontSize: "14px", fontWeight: 600, boxShadow: t.btnGlow, display: "inline-block" }}>
                {isDos ? "[ READ DOCS ]" : "Read the docs →"}
              </a>
              <a href="https://github.com/poushwell/orchesis" target="_blank" rel="noopener noreferrer" style={{ background: "transparent", color: t.textDim, padding: "11px 26px", borderRadius: isEgg ? "0" : "10px", textDecoration: "none", fontSize: "14px", fontWeight: 500, border: `1px solid ${t.border}`, display: "inline-block" }}>
                ★ Star on GitHub
              </a>
            </div>
            <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap", marginTop: "8px" }}>
              {["GitHub ↗|https://github.com/poushwell/orchesis", "PyPI ↗|https://pypi.org/project/orchesis/", "Docs ↗|https://github.com/poushwell/orchesis/blob/main/QUICK_START.md"].map((l, i) => {
                const [label, href] = l.split("|");
                return <a key={i} href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: t.textMut, textDecoration: "none", fontFamily: mono }}>{label}</a>;
              })}
              <span style={{ fontSize: "12px", color: t.textMut, fontFamily: mono }}>MIT license · self-hosted · no telemetry</span>
            </div>
            <div style={{ marginTop: "36px", paddingTop: "28px", borderTop: `1px solid ${t.border}`, fontSize: "18px", color: t.textDim, fontWeight: 300, lineHeight: 1.6 }}>
              The agent that's failing right now<br />
              <strong style={{ color: t.text, fontWeight: 600 }}>won't tell you.</strong>
            </div>
          </div>
        </section>
      </div>

      {/* ORCHESIS VERIFY */}
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: isMobile ? "0 20px" : "0 48px" }}>
        <div style={divider as React.CSSProperties} />
        <section style={{ padding: "80px 0" }} id="verify">
          <div style={sectionTag as React.CSSProperties}>{isDos ? "FIRST RUN" : "First run"}</div>
          <h2 style={sectionTitle as React.CSSProperties}>orchesis verify</h2>
          <p style={sectionSub as React.CSSProperties}>Before your first real session, run one command. It checks your OpenClaw config for known issues.</p>
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: isEgg ? "0" : "10px", padding: "22px 26px", fontFamily: mono, fontSize: "13px", lineHeight: 2.2, maxWidth: "560px", marginTop: "32px" }}>
            <span style={{ color: t.text }}>orchesis verify</span><br /><br />
            <span style={{ color: t.green }}>✓ Proxy connection: OK</span><br />
            <span style={{ color: t.green }}>✓ Crystal Alert: active</span><br />
            <span style={{ color: t.green }}>✓ Injection Shield: active (33+ patterns)</span><br />
            <span style={{ color: t.yellow }}>⚠ Config schema injection detected</span><br />
            <span style={{ color: t.textDim }}>&nbsp;&nbsp;Extra tokens per request: ~100,000</span><br />
            <span style={{ color: t.textDim }}>&nbsp;&nbsp;Breaks Anthropic prompt caching (~100x cost)</span><br />
            <span style={{ color: t.accent }}>&nbsp;&nbsp;Fix: agents.defaults.injectConfigSchema = false</span><br />
            <span style={{ color: t.yellow }}>⚠ Token tracking: totalTokens null in responses</span><br />
            <span style={{ color: t.textDim }}>&nbsp;&nbsp;Your cost data is incomplete</span><br />
            <span style={{ color: t.textDim }}>&nbsp;&nbsp;See: Issue #21819</span>
          </div>
          <p style={{ fontSize: "14px", color: t.textDim, marginTop: "20px" }}>30 seconds. Shows what's wrong. Shows how to fix it.</p>
        </section>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: isMobile ? "0 20px" : "0 48px" }}>
        <div style={divider as React.CSSProperties} />
        <section style={{ padding: "80px 0" }} id="faq">
          <div style={sectionTag as React.CSSProperties}>{isDos ? "FAQ" : "Frequently asked questions"}</div>
          <h2 style={sectionTitle as React.CSSProperties}>Common questions</h2>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: "1px", background: t.border, border: `1px solid ${t.border}`, borderRadius: isEgg ? "0" : "12px", overflow: "hidden", marginTop: "48px" }}>
            {[
              { q: "Does Orchesis work with OpenClaw Telegram bots?", a: "Yes. Orchesis monitors all traffic between your OpenClaw agent and the LLM API regardless of which channel — Telegram, WhatsApp, Discord, or WebChat — the user message came from. One proxy covers all channels." },
              { q: "How does Orchesis detect OpenClaw loops?", a: "Orchesis tracks request patterns across 6 loop types: exec tool loops, thinking token escalation, restart cascades, OAuth races, cache recursion, and crystal phase lock-in. It alerts on the pattern, not just the count, catching loops that OpenClaw's built-in loopDetection misses entirely." },
              { q: "Does Orchesis read my API keys?", a: "No. Orchesis proxies HTTP traffic without extracting or storing API keys. Your keys pass through to the LLM provider unchanged. Orchesis reads request and response payloads for security analysis only." },
              { q: "What happens if Orchesis goes down?", a: "Your agents fall back to direct API calls automatically. Orchesis is not in the critical path. If the proxy is unavailable, OpenClaw routes directly to the LLM provider. Zero downtime risk." },
              { q: "Does Orchesis work with Claude, GPT-4, Gemini?", a: "Yes. Orchesis proxies any HTTP-based LLM API: Anthropic Claude, OpenAI GPT-4 and o1, Google Gemini, Mistral, and any provider using standard HTTP REST endpoints." },
              { q: "Is Orchesis free?", a: "Yes. MIT license. Self-hosted. No telemetry. No vendor lock-in. No usage limits." },
              { q: "How is Orchesis different from Portkey or Galileo?", a: "Portkey is a gateway focused on routing and cost optimization. Galileo is an evaluation platform for post-hoc testing. Orchesis is a security proxy that sits inline and detects threats in real time, not after the fact. Orchesis is also fully open source and self-hosted, with no SaaS dependency." },
            ].map((item, i) => (
              <div key={i} style={{ background: t.bgCard, padding: "24px 28px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "10px", color: t.text }}>{item.q}</h3>
                <p style={{ fontSize: "14px", color: t.textDim, lineHeight: 1.7, margin: 0 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${t.border}`, padding: "28px 0" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto", padding: isMobile ? "0 20px" : "0 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: t.textMut }}>
            <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #38bdf8)", opacity: 0.7 }} />
            © 2026 Orchesis · MIT License
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            {[["GitHub", "https://github.com/poushwell/orchesis"], ["Docs", "https://github.com/poushwell/orchesis/blob/main/QUICK_START.md"], ["Blog", "/blog"], ["MCP Scanner", "/scan"]].map(([label, href]) => (
              <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} style={{ fontSize: "12px", color: t.textMut, textDecoration: "none" }}>{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
