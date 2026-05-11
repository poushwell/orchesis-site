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

const PROBLEMS = [
  { issue: "Issue #28622 · OpenClaw", metric: "0", metricLabel: "messages received, bot shows running", title: "Silent message drop", desc: "Telegram stops delivering messages to the bot. No error in OpenClaw logs. No webhook failure. The bot is alive. Messages are gone. Users think you broke something.", outcome: "Orchesis detects it in 90 seconds", outcomeDetail: "Compares expected message rate against actual. Telegram alert with channel, time, and last successful delivery." },
  { issue: "Issue #33013 · OpenClaw", metric: "VPN", metricLabel: "breaks Telegram polling silently", title: "VPN kills your bot at 3am", desc: "VPN rotation disconnects Telegram long-polling. OpenClaw doesn't know. Retries silently fail. Your bot is offline until someone manually restarts it. Nobody's watching at 3am.", outcome: "Orchesis detects VPN failure in 2 minutes", outcomeDetail: "Monitors polling continuity. Sends Telegram alert with reconnect command before the first user notices." },
  { issue: "Issue #43178 · OpenClaw", metric: "18", metricLabel: "agents sharing one OAuth profile", title: "Watchdog cascade", desc: "18 agents sharing one OAuth profile. Agent A refreshes the token. Agent B uses the stale one, gets 401, falls back to Opus at $0.186/turn. Watchdog triggers. All 18 agents restart simultaneously. $636/month from one config decision.", outcome: "Orchesis identifies the cascade root cause", outcomeDetail: "Cross-agent token tracking shows which agent caused the refresh race. One fix, not 18 restarts." },
  { issue: "Issue #9828 · OpenClaw", metric: "~100K", metricLabel: "extra tokens per message, default config", title: "Config schema cost on every message", desc: "Default OpenClaw config injects the full configuration schema into every system prompt. Every Telegram message triggers a call with ~100,000 extra tokens. Breaks Anthropic prompt caching. You pay full price on every call instead of 90% savings.", outcome: "orchesis verify finds it in 30 seconds", outcomeDetail: "Shows exact overhead, cost per message, and the one-line fix." },
];

const FAQ_ITEMS = [
  { q: "Why is my OpenClaw Telegram bot not receiving messages?", a: "The most common causes are silent webhook failures, VPN disconnection during Telegram long-polling, and Telegram rate limiting after a loop storm. Orchesis monitors all three continuously and sends a Telegram alert with the specific cause within 90 seconds of the drop." },
  { q: "Does OpenClaw Telegram work with VPN in Russia?", a: "Yes, but VPN instability is the leading cause of silent bot failures. When VPN rotates or reconnects, Telegram long-polling drops without an error visible in OpenClaw logs. Orchesis detects the polling gap and alerts you with a reconnect command before users notice." },
  { q: "How does Orchesis detect Telegram silent drops?", a: "Orchesis maintains a baseline of expected message delivery rate per channel. When actual delivery falls below baseline for 90 seconds, it sends a Telegram alert with the channel, timestamp, and last successful delivery time. No false positives from normal quiet periods." },
  { q: "What is the OpenClaw watchdog cascade problem?", a: "When multiple OpenClaw agents share one OAuth profile, a token refresh by one agent invalidates all others. Each agent gets a 401 error, triggers the watchdog, and restarts. All agents restart simultaneously, flooding the LLM API and creating a cost spike. Issue #43178 documents a case with 18 agents and $636/month in waste." },
  { q: "Does Orchesis work with WhatsApp and Discord too?", a: "Yes. Orchesis monitors all traffic between your OpenClaw agent and the LLM API regardless of channel. Telegram, WhatsApp, Discord, and WebChat are all covered by the same proxy. Channel-specific detection patterns apply per channel type." },
  { q: "What happens if Orchesis goes down?", a: "Your agents fall back to direct API calls automatically. Orchesis is not in the critical path. If the proxy is unavailable, OpenClaw routes directly to the LLM provider. Zero downtime risk to your bot." },
  { q: "Is Orchesis free?", a: "Yes. MIT license. Self-hosted. No telemetry. No vendor lock-in. No usage limits." },
];

const COMPARE_ROWS = [
  { feature: "Silent drop", telegram: "✓", whatsapp: "✓", discord: "✓", webchat: "✓", note: "" },
  { feature: "VPN failure", telegram: "✓", whatsapp: "—", discord: "—", webchat: "—", note: "Telegram-specific" },
  { feature: "Watchdog cascade", telegram: "✓", whatsapp: "✓", discord: "✓", webchat: "✓", note: "" },
  { feature: "Loop storm", telegram: "✓", whatsapp: "✓", discord: "✓", webchat: "✓", note: "" },
  { feature: "Injection attack", telegram: "✓", whatsapp: "✓", discord: "✓", webchat: "✓", note: "" },
  { feature: "Config cost", telegram: "✓", whatsapp: "✓", discord: "✓", webchat: "✓", note: "orchesis verify" },
  { feature: "Token tracking", telegram: "✓", whatsapp: "✓", discord: "✓", webchat: "✓", note: "" },
  { feature: "Crystal phase", telegram: "✓", whatsapp: "✓", discord: "✓", webchat: "✓", note: "Ψ_α per request" },
];

export default function Telegram() {
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
  const isLight = mode === "light";
  const isEgg = isMatrix || isDos;
  const mono = isEgg ? "\'Courier New\', monospace" : "\'JetBrains Mono\', \'SF Mono\', monospace";
  const sans = isLight ? "\'Noto Sans JP\', \'Inter\', system-ui, sans-serif" : isEgg ? mono : "-apple-system, \'Segoe UI\', system-ui, sans-serif";
  const toggle = () => setMode(m => m === "dark" ? "light" : "dark");

  const S = (x: Record<string, string | number>) => x as React.CSSProperties;
  const card = S({ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: isEgg ? "0" : "12px" });
  const pill = S({ display: "inline-flex", alignItems: "center", gap: "6px", background: t.tagBg, border: `1px solid ${t.tagBrd}`, borderRadius: "100px", padding: "5px 14px", fontSize: "12px", color: t.tagTxt, fontFamily: mono, letterSpacing: "0.05em" });
  const sectionTag = S({ display: "inline-block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: t.accent, marginBottom: "14px", fontFamily: mono });
  const sectionTitle = S({ fontSize: "clamp(22px,4vw,38px)", fontWeight: isLight ? 300 : 700, letterSpacing: isEgg ? "0.02em" : "-0.03em", lineHeight: 1.15, marginBottom: "12px" });
  const sectionSub = S({ fontSize: "15px", color: t.textDim, maxWidth: "500px", lineHeight: 1.6 });
  const divider = S({ borderTop: `1px solid ${t.border}` });
  const container = { maxWidth: "1080px", margin: "0 auto", padding: isMobile ? "0 20px" : "0 48px" };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: sans, lineHeight: 1.6, transition: "background 0.3s, color 0.3s" }}>
      <EasterEggs mode={mode} onActivate={setMode} />

      {/* NAV */}
      <nav style={{ borderBottom: `1px solid ${t.border}`, position: "sticky", top: 0, background: t.bg, zIndex: 100 }}>
        <div style={{ ...container, display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: t.text, fontSize: "15px", fontWeight: 600 }}>
            <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #38bdf8)", opacity: 0.9, flexShrink: 0 }} />
            Orchesis
            <span style={{ fontSize: "11px", color: t.textMut, background: t.bgCard, border: `1px solid ${t.border}`, padding: "2px 10px", borderRadius: "100px", fontFamily: mono }}>
              {isDos ? "[ × TELEGRAM ]" : isMatrix ? "×TELEGRAM" : "× Telegram"}
            </span>
          </Link>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {!isMobile && (
              <>
                <Link href="/openclaw" style={{ color: t.textDim, textDecoration: "none", fontSize: "14px", padding: "6px 12px" }}>OpenClaw</Link>
                <a href="#faq" style={{ color: t.textDim, textDecoration: "none", fontSize: "14px", padding: "6px 12px" }}>FAQ</a>
                <a href="https://github.com/poushwell/orchesis" target="_blank" rel="noopener noreferrer" style={{ color: t.textDim, textDecoration: "none", fontSize: "14px", padding: "6px 12px" }}>GitHub</a>
              </>
            )}
            {mode !== "ussr" && (
              <button onClick={toggle} style={{ padding: "6px 14px", borderRadius: isDos ? "0" : "8px", border: `1px solid ${t.border}`, background: "transparent", color: t.textDim, fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>
                {mode === "dark" ? "☀ Light" : mode === "light" ? "🌙 Dark" : "✕ EXIT"}
              </button>
            )}
            <a href="#install" style={{ background: t.btnBg, color: t.btnTxt, padding: "8px 18px", borderRadius: isEgg ? "0" : "10px", textDecoration: "none", fontSize: "14px", fontWeight: 600, boxShadow: t.btnGlow }}>
              {isDos ? "[ INSTALL.EXE ]" : isMatrix ? "INSTALL >" : "Install free →"}
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: isMobile ? "64px 20px 60px" : "96px 48px 80px", textAlign: "center" }}>
        <div style={pill as React.CSSProperties}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: t.green, display: "inline-block", animation: "pulse 2s infinite" }} />
          {isDos ? "BUILT FOR 80% OF OPENCLAW USERS WHO RUN TELEGRAM BOTS" : isMatrix ? "> 80%_openclaw_users_run_telegram" : "Built for 80% of OpenClaw users who run Telegram bots"}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>

        <h1 style={{ fontSize: isMobile ? "32px" : "clamp(36px,6vw,68px)", fontWeight: isLight ? 300 : 700, letterSpacing: isEgg ? "0.02em" : "-0.04em", lineHeight: 1.1, margin: "28px 0 20px" }}>
          {isDos ? <>YOUR TELEGRAM BOT IS<br /><span style={{ color: t.accent }}>SILENT.</span><br /><span style={{ color: t.textDim }}>OPENCLAW SAYS IT'S RUNNING.</span></> :
           isMatrix ? <><span style={{ color: t.textDim }}>telegram_bot:</span><br /><span style={{ color: t.accent }}>SILENT.</span><br /><span style={{ color: t.textDim }}>status: running</span></> :
           <>Your Telegram bot is silent.<br /><span style={{ color: t.accent }}>OpenClaw says it's running.</span></>}
        </h1>

        {/* AEO quotable definition — must stay in HTML, first 200 words */}
        <p style={{ fontSize: "15px", color: t.textDim, maxWidth: "560px", margin: "0 auto 12px", lineHeight: 1.6 }}>
          <strong style={{ color: t.text }}>Orchesis is an open-source HTTP proxy that monitors OpenClaw Telegram bot traffic to detect silent message drops, VPN failures, loop storms, and injection attacks</strong> — sending you a Telegram alert with the diagnosis before your users notice anything is wrong.
        </p>

        <p style={{ fontSize: "12px", color: t.textMut, marginBottom: "36px", fontFamily: mono, letterSpacing: "0.05em" }}>
          <span style={{ color: t.textDim }}>bot status: running</span> · <span style={{ color: t.red }}>messages delivered: 0</span> · <span style={{ color: t.textDim }}>last alert: never</span> · <span style={{ color: t.accent }}>Orchesis: 90s detect</span>
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "40px" }}>
          <a href="#install" style={{ background: t.btnBg, color: t.btnTxt, padding: "12px 28px", borderRadius: isEgg ? "0" : "12px", textDecoration: "none", fontSize: "15px", fontWeight: 600, boxShadow: t.btnGlow, display: "inline-block" }}>
            {isDos ? "[ INSTALL IN 5 MINUTES ]" : isMatrix ? "INSTALL_NOW >" : "Install in 5 minutes →"}
          </a>
          <a href="https://github.com/poushwell/orchesis" target="_blank" rel="noopener noreferrer" style={{ background: "transparent", color: t.textDim, padding: "12px 28px", borderRadius: isEgg ? "0" : "12px", textDecoration: "none", fontSize: "15px", fontWeight: 500, border: `1px solid ${t.border}`, display: "inline-block" }}>
            ★ Star on GitHub
          </a>
        </div>

        {/* Status strip */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
          {[
            { icon: "📨", text: isDos ? "SILENT DROP DETECT" : isMatrix ? "silent_drop_detect" : "Silent drop detection" },
            { icon: "🔒", text: isDos ? "VPN FAILURE ALERTS" : isMatrix ? "vpn_failure_monitor" : "VPN failure alerts" },
            { icon: "⚡", text: isDos ? "LOOP STORM DETECT" : isMatrix ? "loop_storm_detect" : "Loop storm detection" },
            { icon: "⚖", text: isDos ? "MIT LICENSE FREE" : isMatrix ? "MIT_free" : "MIT license · Free" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: isEgg ? "0" : "100px", padding: "5px 14px", fontSize: "12px", color: t.textDim, fontFamily: mono }}>
              {s.icon} {s.text}
            </div>
          ))}
        </div>
      </div>

      {/* PROBLEMS */}
      <div style={container}>
        <div style={divider as React.CSSProperties} />
        <section style={{ padding: "80px 0" }}>
          <div style={sectionTag as React.CSSProperties}>{isDos ? "FOUR PROBLEMS WE FOUND" : isMatrix ? "verified_incidents" : "Four problems that actually happen"}</div>
          <h2 style={sectionTitle as React.CSSProperties}>Real issues. Real GitHub numbers.</h2>
          <p style={sectionSub as React.CSSProperties}>Each one is documented in the OpenClaw issue tracker. Each one is verifiable.</p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1px", background: t.border, border: `1px solid ${t.border}`, borderRadius: isEgg ? "0" : "12px", overflow: "hidden", marginTop: "48px" }}>
            {PROBLEMS.map((p, i) => (
              <div key={i} style={{ background: t.bgCard, padding: "28px" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = t.bgCard2}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = t.bgCard}
              >
                <div style={{ fontFamily: mono, fontSize: "11px", color: t.textMut, marginBottom: "14px", letterSpacing: "0.05em" }}>{p.issue}</div>
                <div style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-0.03em", color: t.red, lineHeight: 1, marginBottom: "4px" }}>{p.metric}</div>
                <div style={{ fontSize: "12px", color: t.textDim, marginBottom: "18px" }}>{p.metricLabel}</div>
                <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "10px", lineHeight: 1.3 }}>{p.title}</h3>
                <p style={{ fontSize: "13px", color: t.textDim, lineHeight: 1.6, marginBottom: "16px" }}>{p.desc}</p>
                <p style={{ fontSize: "13px", color: t.textDim, paddingTop: "14px", borderTop: `1px solid ${t.border}`, lineHeight: 1.6 }}>
                  <strong style={{ color: t.green, fontWeight: 500 }}>{p.outcome}</strong> — {p.outcomeDetail}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ALERT DEMO */}
      <div style={container}>
        <div style={divider as React.CSSProperties} />
        <section style={{ padding: "80px 0" }}>
          <div style={sectionTag as React.CSSProperties}>{isDos ? "ALERT EXAMPLES" : isMatrix ? "alert_examples" : "What the alerts look like"}</div>
          <h2 style={sectionTitle as React.CSSProperties}>You get a message. Not a dashboard.</h2>
          <p style={sectionSub as React.CSSProperties}>Every alert has a cause, a time, and an action. No noise. No false positives.</p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginTop: "48px" }}>
            {[
              {
                label: "Silent drop alert",
                lines: [
                  { c: t.accent, t: "🔴 ORCHESIS ALERT" },
                  { c: t.textDim, t: "Silent message drop detected" },
                  { c: t.textMut, t: "Channel: Telegram · @mybotname" },
                  { c: t.textMut, t: "Last delivery: 14:23:07 UTC" },
                  { c: t.textMut, t: "Elapsed: 7m 14s" },
                  { c: t.yellow, t: "Cause: VPN reconnect gap" },
                  { c: t.green, t: "Action: /reconnect to restore" },
                ],
              },
              {
                label: "Loop storm alert",
                lines: [
                  { c: t.accent, t: "⚠ ORCHESIS ALERT" },
                  { c: t.textDim, t: "Loop storm detected" },
                  { c: t.textMut, t: "Agent: coder-01 · Telegram channel" },
                  { c: t.textMut, t: "Calls: 122 identical in 4m 30s" },
                  { c: t.textMut, t: "loopDetection status: ON · Alerts: 0" },
                  { c: t.red, t: "Cost rate: $0.186/call · Opus fallback" },
                  { c: t.green, t: "Action: /thaw agent:coder-01" },
                ],
              },
            ].map((demo, i) => (
              <div key={i} style={{ ...card }}>
                <div style={{ padding: "10px 16px", borderBottom: `1px solid ${t.border}`, fontSize: "11px", color: t.textMut, fontFamily: mono, letterSpacing: "0.05em" }}>{demo.label}</div>
                <div style={{ padding: "16px 20px", fontFamily: mono, fontSize: "13px", lineHeight: 2 }}>
                  {demo.lines.map((line, j) => (
                    <div key={j} style={{ color: line.c }}>{line.t}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* COMPARISON TABLE */}
      <div style={container}>
        <div style={divider as React.CSSProperties} />
        <section style={{ padding: "80px 0" }}>
          <div style={sectionTag as React.CSSProperties}>{isDos ? "DETECTION COVERAGE" : isMatrix ? "detection_coverage" : "Detection coverage by channel"}</div>
          <h2 style={sectionTitle as React.CSSProperties}>Telegram is the priority. Others work too.</h2>
          <div style={{ border: `1px solid ${t.border}`, borderRadius: isEgg ? "0" : "12px", overflow: "hidden", marginTop: "48px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: t.bgCard2 }}>
                  {["Detection", "Telegram", "WhatsApp", "Discord", "WebChat"].map((h, i) => (
                    <th key={i} style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: i === 1 ? t.accent : t.textMut, padding: "12px 16px", borderBottom: `1px solid ${t.border}`, fontFamily: mono }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < COMPARE_ROWS.length - 1 ? `1px solid ${t.border}` : "none" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 600, fontSize: "13px", color: t.text }}>{row.feature}{row.note && <span style={{ display: "block", fontSize: "11px", color: t.textMut, fontFamily: mono, marginTop: "2px" }}>{row.note}</span>}</td>
                    {[row.telegram, row.whatsapp, row.discord, row.webchat].map((v, j) => (
                      <td key={j} style={{ padding: "14px 16px", fontSize: "14px", color: v === "✓" ? t.green : t.textMut }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* INSTALL */}
      <div id="install" style={container}>
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
              <span style={{ color: t.textMut }}># 2. Start with Telegram monitoring</span><br />
              <span style={{ color: t.text }}>orchesis init <span style={{ color: t.accent2 }}>--with-telegram --with-injection-shield</span></span><br /><br />
              <span style={{ color: t.textMut }}># 3. Connect OpenClaw (one line)</span><br />
              <span style={{ display: "block", background: t.tagBg, margin: "0 -26px", padding: "0 26px", borderLeft: `2px solid ${t.accent}` }}>
                <span style={{ color: t.text }}>"proxy": {"{ "}url: <span style={{ color: t.accent }}>"http://localhost:8080"</span>, enabled: <span style={{ color: t.accent }}>true</span>{" }"}</span>
              </span><br />
              <span style={{ color: t.text }}>orchesis verify</span><br /><br />
              <span style={{ color: t.green }}>✓ Proxy running · Telegram monitor active · Injection Shield active</span>
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "16px" }}>
              <a href="https://github.com/poushwell/orchesis/blob/main/QUICK_START.md" target="_blank" rel="noopener noreferrer" style={{ background: t.btnBg, color: t.btnTxt, padding: "11px 26px", borderRadius: isEgg ? "0" : "10px", textDecoration: "none", fontSize: "14px", fontWeight: 600, boxShadow: t.btnGlow, display: "inline-block" }}>
                {isDos ? "[ READ DOCS ]" : "Read the docs →"}
              </a>
              <a href="https://github.com/poushwell/orchesis" target="_blank" rel="noopener noreferrer" style={{ background: "transparent", color: t.textDim, padding: "11px 26px", borderRadius: isEgg ? "0" : "10px", textDecoration: "none", fontSize: "14px", fontWeight: 500, border: `1px solid ${t.border}`, display: "inline-block" }}>
                ★ Star on GitHub
              </a>
            </div>
            <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
              {[["GitHub ↗", "https://github.com/poushwell/orchesis"], ["PyPI ↗", "https://pypi.org/project/orchesis/"], ["OpenClaw guide ↗", "/openclaw"]].map(([label, href]) => (
                <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} style={{ fontSize: "12px", color: t.textMut, textDecoration: "none", fontFamily: mono }}>{label}</a>
              ))}
              <span style={{ fontSize: "12px", color: t.textMut, fontFamily: mono }}>MIT license · self-hosted · no telemetry</span>
            </div>
          </div>
        </section>
      </div>

      {/* FAQ */}
      <div id="faq" style={container}>
        <div style={divider as React.CSSProperties} />
        <section style={{ padding: "80px 0" }}>
          <div style={sectionTag as React.CSSProperties}>{isDos ? "FAQ" : "Frequently asked questions"}</div>
          <h2 style={sectionTitle as React.CSSProperties}>Common questions</h2>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: "1px", background: t.border, border: `1px solid ${t.border}`, borderRadius: isEgg ? "0" : "12px", overflow: "hidden", marginTop: "48px" }}>
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} style={{ background: t.bgCard, padding: "24px 28px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "10px", color: t.text }}>{item.q}</h3>
                <p style={{ fontSize: "14px", color: t.textDim, lineHeight: 1.7, margin: 0 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FINAL CTA */}
      <div style={container}>
        <div style={divider as React.CSSProperties} />
        <section style={{ padding: "80px 0", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: isLight ? 300 : 700, letterSpacing: "-0.03em", marginBottom: "16px" }}>
            {isDos ? "YOUR BOT WENT SILENT 8 MINUTES AGO." : isMatrix ? "bot_silent: 8m_ago" : "Your bot went silent 8 minutes ago."}
          </h2>
          <p style={{ fontSize: "16px", color: t.textDim, marginBottom: "32px" }}>
            {isDos ? "YOU DON'T KNOW YET." : isMatrix ? "you_dont_know_yet" : "You don't know yet."}
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#install" style={{ background: t.btnBg, color: t.btnTxt, padding: "13px 32px", borderRadius: isEgg ? "0" : "12px", textDecoration: "none", fontSize: "15px", fontWeight: 600, boxShadow: t.btnGlow, display: "inline-block" }}>
              {isDos ? "[ INSTALL ORCHESIS.EXE ]" : isMatrix ? "INSTALL_NOW >" : "Install Orchesis — it's free →"}
            </a>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${t.border}`, padding: "28px 0" }}>
        <div style={{ ...container, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: t.textMut }}>
            <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #38bdf8)", opacity: 0.7 }} />
            © 2026 Orchesis · MIT License
          </div>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {[["GitHub", "https://github.com/poushwell/orchesis"], ["OpenClaw", "/openclaw"], ["Blog", "/blog"], ["MCP Scanner", "/scan"], ["Docs", "https://github.com/poushwell/orchesis/blob/main/QUICK_START.md"]].map(([label, href]) => (
              <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} style={{ fontSize: "12px", color: t.textMut, textDecoration: "none" }}>{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
