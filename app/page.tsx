"use client";
import { useState, useEffect, useCallback } from "react";

const themes: Record<string, Record<string, string>> = {
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
  { title: "Security", jp: "安全", desc: "17-phase adaptive detection. Prompt injection, credential leaks, tool abuse. 25 signatures across 10 categories.", iconD: "🛡", iconL: "🔒" },
  { title: "Cost Control", jp: "節約", desc: "Context compression saves 80-90% tokens. Semantic cache. Thompson Sampling model routing. Budget enforcement.", iconD: "💰", iconL: "📉" },
  { title: "Reliability", jp: "回復", desc: "Auto-healing with 6 recovery actions. Circuit breakers. Loop detection. MAST & OWASP compliance mapping.", iconD: "🔄", iconL: "🔄" },
  { title: "Observability", jp: "透明", desc: "Real-time dashboard. Session recording & replay. Agent Reliability Score. Flow X-Ray tracing.", iconD: "📊", iconL: "📊" },
];

const specs = [
  { key: "Pipeline", val: "17 phases" }, { key: "Dependencies", val: "0" },
  { key: "Signatures", val: "25 across 10 categories" }, { key: "Recovery", val: "6 auto-heal actions" },
  { key: "MAST Coverage", val: "78.6%" }, { key: "OWASP Coverage", val: "80%" },
  { key: "Token Savings", val: "80–90%" }, { key: "License", val: "MIT" },
];

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

export default function Home() {
  const [mode, setMode] = useState("dark");
  const [loaded, setLoaded] = useState(false);
  const [hovFeat, setHovFeat] = useState<number | null>(null);
  const t = themes[mode];

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const toggle = useCallback(() => setMode(m => m === "dark" ? "light" : "dark"), []);

  const anim = (d: number): React.CSSProperties => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? "translateY(0)" : "translateY(24px)",
    transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${d}s`,
  });

  const isDark = mode === "dark";

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: isDark ? "'Geist', -apple-system, sans-serif" : "'Noto Sans JP', 'Helvetica Neue', sans-serif", transition: "background 0.5s, color 0.5s", position: "relative", overflow: "hidden" }}>

      {/* Top accent line (light) */}
      {!isDark && <div style={{ height: "3px", background: t.accent, width: "100%" }} />}

      {/* Aurora (dark) */}
      {isDark && <div style={{ position: "absolute", top: "-20%", left: "15%", width: "70%", height: "60%", background: "radial-gradient(ellipse at 30% 50%, rgba(168,85,247,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(56,189,248,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 70%, rgba(251,146,60,0.04) 0%, transparent 50%)", filter: "blur(60px)", animation: "aurora 12s ease-in-out infinite alternate", pointerEvents: "none" }} />}

      {/* Dot grid (dark) */}
      {isDark && <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />}

      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", borderBottom: `1px solid ${t.border}`, position: "relative", zIndex: 10, ...anim(0) }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isDark ? (
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #38bdf8)", opacity: 0.9 }} />
          ) : (
            <div style={{ width: "24px", height: "24px", border: `2px solid ${t.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "8px", height: "8px", background: t.accent }} />
            </div>
          )}
          <span style={{ fontSize: isDark ? "16px" : "13px", fontWeight: isDark ? 600 : 400, letterSpacing: isDark ? "-0.02em" : "0.2em", textTransform: isDark ? "none" : "uppercase" as const }}>
            {isDark ? "Orchesis" : "ORCHESIS"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          {["Docs", "GitHub", "Blog"].map(item => (
            <a key={item} href="#" style={{ color: t.textDim, textDecoration: "none", fontSize: isDark ? "14px" : "11px", letterSpacing: isDark ? "0" : "0.08em", textTransform: isDark ? "none" : "uppercase" as const, transition: "color 0.2s" }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = t.text}
              onMouseLeave={e => (e.target as HTMLElement).style.color = t.textDim}
            >{item}</a>
          ))}
          <button onClick={toggle} style={{ padding: "6px 14px", borderRadius: isDark ? "8px" : "0", border: `1px solid ${t.border}`, background: "transparent", color: t.textDim, fontSize: "12px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.3s" }}
            onMouseEnter={e => (e.currentTarget).style.borderColor = t.accent}
            onMouseLeave={e => (e.currentTarget).style.borderColor = t.border}
          >
            <span>{t.switchIcon}</span><span>{t.switchLabel}</span>
          </button>
        </div>
      </nav>

      {/* HERO */}
      <main style={{ maxWidth: isDark ? "760px" : "920px", margin: "0 auto", padding: isDark ? "120px 48px 80px" : "100px 64px", textAlign: isDark ? "center" : "left", position: "relative", zIndex: 10, display: !isDark ? "grid" : "block", gridTemplateColumns: !isDark ? "1fr 340px" : "none", gap: "60px" } as React.CSSProperties}>
        <div>
          <div style={anim(0.1)}>
            {isDark ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 16px", borderRadius: "100px", background: t.tagBg, border: `1px solid ${t.tagBorder}`, fontSize: "13px", color: t.tagText }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: t.green }} />
                Open Source · MIT License
              </span>
            ) : (
              <p style={{ fontSize: "11px", color: t.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 24px" }}>AI Agent Control Plane</p>
            )}
          </div>

          <h1 style={{ fontSize: isDark ? "clamp(38px, 5vw, 60px)" : "clamp(32px, 4vw, 48px)", fontWeight: isDark ? 650 : 300, lineHeight: isDark ? 1.12 : 1.25, letterSpacing: "-0.04em", margin: isDark ? "28px 0 0" : "0 0 28px", ...anim(0.2) }}>
            {isDark ? (<>The intelligent layer<br />between your agents<br /><span style={{ background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentAlt} 40%, ${t.accentWarm} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>and their decisions</span></>) : (<>One layer of<br /><span style={{ fontWeight: 600 }}>transparency</span><br />between intent<br />and execution.</>)}
          </h1>

          <p style={{ fontSize: isDark ? "17px" : "14px", lineHeight: isDark ? 1.65 : 1.8, color: t.textDim, maxWidth: isDark ? "460px" : "340px", margin: isDark ? "28px auto 0" : "0 0 36px", ...anim(0.35) }}>
            {isDark ? "A transparent proxy that secures, optimizes, and monitors every interaction. Zero code changes. Zero dependencies." : "A transparent HTTP proxy between AI agents and their LLM providers. Security, cost, reliability — with zero code changes."}
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: isDark ? "center" : "flex-start", ...anim(0.5) }}>
            <button style={{ padding: isDark ? "13px 28px" : "12px 28px", borderRadius: isDark ? "12px" : "0", border: isDark ? "none" : `2px solid ${t.accent}`, background: t.btnPrimary, color: t.btnText, fontSize: isDark ? "14px" : "11px", fontWeight: 600, letterSpacing: isDark ? "0" : "0.1em", textTransform: isDark ? "none" : "uppercase" as const, cursor: "pointer", fontFamily: "inherit", boxShadow: t.btnGlow, transition: "all 0.3s" }}>{isDark ? "Get Started" : "Begin"}</button>
            <button style={{ padding: isDark ? "13px 28px" : "12px 28px", borderRadius: isDark ? "12px" : "0", border: `1px solid ${t.border}`, background: "transparent", color: t.textDim, fontSize: isDark ? "14px" : "11px", fontWeight: isDark ? 600 : 500, letterSpacing: isDark ? "0" : "0.1em", textTransform: isDark ? "none" : "uppercase" as const, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>{isDark ? "Documentation" : "View Source"}</button>
          </div>

          <code style={{ display: "block", marginTop: "20px", textAlign: isDark ? "center" : "left", fontSize: "13px", color: t.textMuted, fontFamily: "'JetBrains Mono', 'SF Mono', monospace", ...anim(0.6) }}>pip install orchesis</code>
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

      {/* METRICS (dark) */}
      {isDark && (
        <section style={{ maxWidth: "800px", margin: "0 auto 60px", padding: "0 48px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px", background: t.border, borderRadius: "16px", overflow: "hidden", border: `1px solid ${t.border}`, ...anim(0.7) }}>
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
      <section style={{ maxWidth: isDark ? "800px" : "920px", margin: "0 auto", padding: isDark ? "40px 48px 100px" : "0 64px 80px", display: "grid", gridTemplateColumns: isDark ? "1fr 1fr" : "repeat(4, 1fr)", gap: isDark ? "16px" : "0", borderTop: !isDark ? `1px solid ${t.border}` : "none", borderBottom: !isDark ? `1px solid ${t.border}` : "none", ...anim(0.9) }}>
        {features.map((f, i) => (
          <div key={i}
            onMouseEnter={() => setHovFeat(i)}
            onMouseLeave={() => setHovFeat(null)}
            style={{ background: isDark ? (hovFeat === i ? t.bgCardHover : t.bgCard) : (hovFeat === i ? t.bgCard : "transparent"), border: isDark ? `1px solid ${hovFeat === i ? t.borderHover : t.border}` : "none", borderRight: !isDark && i < 3 ? `1px solid ${t.border}` : "none", borderRadius: isDark ? "12px" : "0", padding: isDark ? "28px" : "40px 24px", textAlign: isDark ? "left" : "center", transition: "all 0.3s", cursor: "default" }}
          >
            {isDark ? (
              <div style={{ fontSize: "24px", marginBottom: "12px" }}>{f.iconD}</div>
            ) : (
              <div style={{ fontSize: "28px", fontWeight: 300, color: t.accent, marginBottom: "8px" }}>{f.jp}</div>
            )}
            <h3 style={{ fontSize: isDark ? "15px" : "12px", fontWeight: 600, color: t.text, margin: "0 0 8px", letterSpacing: isDark ? "-0.01em" : "0.08em", textTransform: isDark ? "none" : "uppercase" as const }}>{f.title}</h3>
            <p style={{ fontSize: isDark ? "13px" : "11px", color: t.textDim, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* SCROLL NARRATIVE (dark) */}
      {isDark && (
        <section style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 48px", borderTop: `1px solid ${t.border}`, ...anim(1.1) }}>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.1, margin: "0 0 20px" }}>
            Every request.<br /><span style={{ color: t.textDim }}>Analyzed. Secured. Optimized.</span>
          </h2>
          <p style={{ fontSize: "15px", lineHeight: 1.7, color: t.textDim, maxWidth: "500px" }}>
            Orchesis sits as a transparent HTTP proxy between your AI agents and their LLM providers. One config change — set the base URL to localhost:8080 — and every request passes through a 17-phase pipeline. No SDK integration. No code changes. No vendor lock-in.
          </p>
        </section>
      )}

      {/* TAGLINE */}
      <section style={{ textAlign: "center", padding: isDark ? "60px 48px 100px" : "80px 64px", borderTop: isDark ? `1px solid ${t.border}` : "none", position: "relative", zIndex: 10, ...anim(1.2) }}>
        {!isDark && <p style={{ fontSize: "18px", fontWeight: 300, color: t.textMuted, letterSpacing: "-0.01em", lineHeight: 1.6 }}>勝っても負けても機能する</p>}
        <p style={{ fontSize: isDark ? "20px" : "13px", color: t.textMuted, fontWeight: isDark ? 500 : 400, letterSpacing: "-0.02em", marginTop: !isDark ? "8px" : "0" }}>
          Works whether AI wins or loses.
        </p>
        {isDark && <p style={{ fontSize: "12px", color: t.textMuted, marginTop: "8px", letterSpacing: "0.05em" }}>Open Source · MIT License · Zero Dependencies</p>}
      </section>

      <style>{`@keyframes aurora { 0% { transform: translate(0,0) scale(1); } 33% { transform: translate(20px,-10px) scale(1.05); } 66% { transform: translate(-10px,15px) scale(0.98); } 100% { transform: translate(5px,-5px) scale(1.02); } }`}</style>
    </div>
  );
}
