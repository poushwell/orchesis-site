"use client";
import { useState } from "react";
import Link from "next/link";
import EasterEggs from "../components/EasterEggs";

type SiteMode = "dark" | "light" | "matrix" | "dos" | "ussr";

function getTheme(mode: SiteMode) {
  if (mode === "matrix") return { bg: "#000000", card: "#001100", cardHover: "#002200", border: "#001908", borderHover: "#003311", text: "#00ff41", dim: "#009921", muted: "#004d14", accent: "#00ff41", red: "#ff4444", green: "#00ff41", font: "'Courier New', monospace" };
  if (mode === "dos") return { bg: "#000080", card: "#0000aa", cardHover: "#0000cc", border: "#5555ff", borderHover: "#8888ff", text: "#ffffff", dim: "#aaaaaa", muted: "#555588", accent: "#ffff55", red: "#ff5555", green: "#55ff55", font: "'Courier New', monospace" };
  if (mode === "ussr") return { bg: "#0a0000", card: "#150000", cardHover: "#200000", border: "#440000", borderHover: "#660000", text: "#ff6666", dim: "#cc0000", muted: "#550000", accent: "#ff0000", red: "#ff0000", green: "#ff6666", font: "'Courier New', monospace" };
  if (mode === "light") return { bg: "#F7F5F0", card: "#fff", cardHover: "#FAFAF6", border: "#E8E4DC", borderHover: "#CCC", text: "#1A1A1A", dim: "#777", muted: "#BBB", accent: "#C41E3A", red: "#C41E3A", green: "#2E7D32", font: "'Noto Sans JP', 'Helvetica Neue', sans-serif" };
  return { bg: "#0f0f11", card: "#18181b", cardHover: "#1f1f23", border: "#27272a", borderHover: "#3f3f46", text: "#e4e4e7", dim: "#71717a", muted: "#3f3f46", accent: "#a855f7", red: "#ef4444", green: "#22c55e", font: "'Geist', -apple-system, sans-serif" };
}

const tools = [
  {
    title: "MCP Security Scanner",
    desc: "Paste your config. Get a security report in seconds. CVE database, OWASP mapping, IDE config scanning.",
    href: "/scan",
    color: "#ef4444",
    count: "100+ checks",
    badge: null,
    large: true,
  },
  {
    title: "Security Scorecard",
    desc: "5-question assessment of your AI agent stack. Instant grade A+ to F with actionable recommendations.",
    href: "/scorecard",
    color: "#a855f7",
    count: "5 questions",
    badge: null,
    large: true,
  },
  {
    title: "Cost Calculator",
    desc: "How much are undetected loops and context bloat costing you? Estimate monthly savings with runtime monitoring.",
    href: "/tools/cost-calculator",
    color: "#fb923c",
    count: "Interactive",
    badge: null,
    large: true,
  },
  {
    title: "OWASP MCP Top 10 Guide",
    desc: "Every risk explained with real examples, detection methods, and fixes.",
    href: "/tools/owasp-mcp",
    color: "#38bdf8",
    count: "10 risks",
    badge: null,
    large: false,
  },
  {
    title: "Security Glossary",
    desc: "AI agent security terminology in plain language.",
    href: "/tools/glossary",
    color: "#22d3ee",
    count: "30+ terms",
    badge: null,
    large: false,
  },
  {
    title: "CVE Tracker",
    desc: "Known vulnerable MCP packages with CVE IDs and CVSS scores.",
    href: "/tools/cve",
    color: "#ef4444",
    count: "8 CVEs",
    badge: null,
    large: false,
  },
  {
    title: "Attack Database",
    desc: "Real attack patterns against AI agents with defenses.",
    href: "/tools/attacks",
    color: "#f97316",
    count: "15+ patterns",
    badge: "Coming soon",
    large: false,
  },
];

export default function ToolsPage() {
  const [mode, setMode] = useState<SiteMode>("dark");
  const t = getTheme(mode);
  const isEgg = mode === "matrix" || mode === "dos" || mode === "ussr";
  const isDark = mode !== "light";

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: t.font, transition: "background 0.5s, color 0.5s" }}>
      <EasterEggs mode={mode} onActivate={setMode} />
      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", borderBottom: `1px solid ${t.border}`, position: "sticky", top: 0, background: isDark ? "rgba(15,15,17,0.95)" : "rgba(247,245,240,0.95)", backdropFilter: "blur(8px)", zIndex: 100 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: t.text, fontSize: "16px", fontWeight: 600 }}>
          {isDark ? (
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #38bdf8)", opacity: 0.9 }} />
          ) : (
            <div style={{ width: "24px", height: "24px", border: `2px solid ${t.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: "8px", height: "8px", background: t.accent }} /></div>
          )}
          Orchesis
        </Link>
        <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
          {[
            { label: "Scan", href: "/scan" },
            { label: "Tools", href: "/tools" },
            { label: "OpenClaw", href: "/openclaw" },
            { label: "Paperclip", href: "/paperclip" },
            { label: "Telegram", href: "/telegram" },
            { label: "Docs", href: "https://github.com/poushwell/orchesis/blob/main/QUICK_START.md" },
            { label: "GitHub", href: "https://github.com/poushwell/orchesis" },
            { label: "Blog", href: "/blog" },
          ].map(item => (
            <Link key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              style={{ color: item.label === "Tools" ? t.text : t.dim, textDecoration: "none", fontSize: "13px", fontWeight: item.label === "Tools" ? 600 : 400, transition: "color 0.2s" }}>
              {item.label}
            </Link>
          ))}
          {mode !== "ussr" && (
            <button onClick={() => setMode(m => m === "dark" ? "light" : "dark")} style={{ padding: "6px 14px", borderRadius: isDark ? "8px" : "0", border: `1px solid ${t.border}`, background: "transparent", color: t.dim, fontSize: "12px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.3s" }}>
              <span>{isDark ? "☀" : "🌙"}</span><span>{isDark ? "Light" : "Dark"}</span>
            </button>
          )}
        </div>
      </nav>

      {/* Breadcrumb */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "12px 48px 0", fontSize: "12px", color: t.muted }}>
        <Link href="/" style={{ color: t.muted, textDecoration: "none" }}>Home</Link>{" / "}
        <span style={{ color: t.dim }}>Tools</span>
      </div>

      {/* Hero + Definition */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 48px 0" }}>
        <p style={{ fontSize: "11px", color: t.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>Free · No signup · Browser-based</p>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: isDark ? 700 : 300, letterSpacing: "-0.04em", lineHeight: 1.1, margin: "0 0 12px" }}>
          Free AI Agent Security Tools
        </h1>
        <h2 style={{ fontSize: "18px", fontWeight: 400, color: t.dim, margin: "0 0 24px", lineHeight: 1.5 }}>
          Scan, assess, calculate, learn. No signup. No data collection.
        </h2>
        <p style={{ fontSize: "14px", color: t.dim, lineHeight: 1.7, margin: "0 0 48px", maxWidth: "640px" }}>
          Orchesis provides free, browser-based tools for AI agent security. Scan MCP configs for vulnerabilities, assess your agent stack&apos;s security posture, calculate the cost of undetected agent loops, explore the OWASP MCP Top 10, and look up AI agent security terminology. All tools run in your browser with no data collection. Open source, MIT license.
        </p>
      </div>

      {/* Tool Cards */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 48px 80px" }}>
        {/* Row 1: large cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          {tools.filter(tl => tl.large).map((tool, i) => (
            <Link key={i} href={tool.href} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: isDark ? "12px" : "0", padding: "28px 24px", textDecoration: "none", display: "flex", flexDirection: "column", gap: "12px", transition: "all 0.25s", cursor: "pointer", position: "relative" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = tool.color + "66"; el.style.boxShadow = `0 0 20px ${tool.color}15`; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = t.border; el.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: tool.color, flexShrink: 0 }} />
                <span style={{ fontSize: "15px", fontWeight: 700, color: t.text }}>{tool.title}</span>
              </div>
              <p style={{ fontSize: "13px", color: t.dim, lineHeight: 1.6, margin: 0, flex: 1 }}>{tool.desc}</p>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ padding: "3px 10px", borderRadius: "100px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", fontSize: "11px", color: t.green, fontWeight: 600 }}>Free</span>
                <span style={{ padding: "3px 10px", borderRadius: "100px", background: `${tool.color}14`, border: `1px solid ${tool.color}33`, fontSize: "11px", color: tool.color, fontWeight: 600 }}>{tool.count}</span>
              </div>
              <span style={{ fontSize: "13px", color: t.accent, marginTop: "4px" }}>Try free →</span>
            </Link>
          ))}
        </div>

        {/* Row 2: smaller cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px" }}>
          {tools.filter(tl => !tl.large).map((tool, i) => (
            <div key={i} style={{ position: "relative" }}>
              {tool.badge ? (
                <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: isDark ? "12px" : "0", padding: "20px", opacity: 0.5, cursor: "default" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: tool.color, flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: t.text }}>{tool.title}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: t.dim, lineHeight: 1.5, margin: "0 0 10px" }}>{tool.desc}</p>
                  <span style={{ padding: "2px 8px", borderRadius: "100px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", fontSize: "10px", color: t.accent, fontWeight: 600 }}>{tool.badge}</span>
                </div>
              ) : (
                <Link href={tool.href} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: isDark ? "12px" : "0", padding: "20px", textDecoration: "none", display: "flex", flexDirection: "column", gap: "8px", transition: "all 0.25s", cursor: "pointer" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = tool.color + "66"; el.style.boxShadow = `0 0 16px ${tool.color}12`; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = t.border; el.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: tool.color, flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: t.text }}>{tool.title}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: t.dim, lineHeight: 1.5, margin: 0, flex: 1 }}>{tool.desc}</p>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <span style={{ padding: "2px 8px", borderRadius: "100px", background: `${tool.color}14`, border: `1px solid ${tool.color}33`, fontSize: "10px", color: tool.color, fontWeight: 600 }}>{tool.count}</span>
                  </div>
                  <span style={{ fontSize: "12px", color: t.accent }}>Explore →</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section style={{ maxWidth: "860px", margin: "0 auto", padding: "0 48px 60px", borderTop: `1px solid ${t.border}`, paddingTop: "48px" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Open source · MIT License</p>
          <h3 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 8px" }}>Need runtime protection?</h3>
          <p style={{ fontSize: "14px", color: t.dim, margin: "0 0 24px" }}>The scanner finds config issues. The proxy catches runtime threats.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://github.com/poushwell/orchesis#quick-start" target="_blank" rel="noopener noreferrer"
              style={{ padding: "12px 28px", borderRadius: "12px", background: "linear-gradient(135deg, #a855f7, #7c3aed)", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
              pip install orchesis
            </a>
            <Link href="/scan"
              style={{ padding: "12px 28px", borderRadius: "12px", border: `1px solid ${t.border}`, color: t.dim, fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
              Scan my config →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${t.border}` }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "28px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #38bdf8)", opacity: 0.7 }} />
            <span style={{ fontSize: "12px", color: t.muted }}>© 2026 Orchesis · MIT License</span>
          </div>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {[
              { label: "GitHub", href: "https://github.com/poushwell/orchesis" },
              { label: "Docs", href: "https://github.com/poushwell/orchesis/blob/main/QUICK_START.md" },
              { label: "Scan", href: "/scan" },
              { label: "Scorecard", href: "/scorecard" },
              { label: "OpenClaw", href: "/openclaw" },
              { label: "Paperclip", href: "/paperclip" },
              { label: "Telegram", href: "/telegram" },
              { label: "Blog", href: "/blog" },
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
            ].map(l => (
              <Link key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                style={{ fontSize: "12px", color: t.muted, textDecoration: "none", transition: "color 0.2s" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
      {mode === "matrix" && <div style={{ textAlign: "center", paddingBottom: "12px", fontSize: "11px", color: "#004d14", fontFamily: "'Courier New',monospace" }}>&gt; PRESS_ESC_TO_EXIT_MATRIX_MODE</div>}
      {mode === "dos" && <div style={{ textAlign: "center", paddingBottom: "12px", fontSize: "11px", color: "#555588", fontFamily: "'Courier New',monospace" }}>C:\&gt; Press ESC to exit DOS mode</div>}
      {mode === "ussr" && <div style={{ textAlign: "center", paddingBottom: "12px", fontSize: "11px", color: "#550000", fontFamily: "'Courier New',monospace" }}>★ НАЖМИ ESC ЧТОБЫ ВЫЙТИ ★</div>}
    </div>
  );
}
