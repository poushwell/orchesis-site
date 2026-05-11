"use client";
import { useState } from "react";
import Link from "next/link";

const QUESTIONS = [
  {
    id: "proxy",
    q: "How do your agents connect to LLM APIs?",
    hint: "Determines what can be monitored and intercepted",
    opts: [
      { l: "Direct — no proxy layer", s: "Agents call APIs directly", sc: 0, issues: ["No threat detection", "No cross-agent visibility", "EU AI Act Article 12 gap"] },
      { l: "SDK monitoring (callbacks, LangSmith)", s: "Application-level only", sc: 2, issues: ["Cannot detect cross-agent patterns"] },
      { l: "HTTP proxy intercepts all traffic", s: "Network-level visibility", sc: 5, issues: [] },
    ],
  },
  {
    id: "budget",
    q: "Do you enforce per-agent spending limits?",
    hint: "Spend Explosion is the #1 cause of surprise bills",
    opts: [
      { l: "No limits", s: "Agents run until task completes", sc: 0, issues: ["Spend Explosion: no budget guardrails"] },
      { l: "Alerts after the fact", s: "Manual monitoring", sc: 1, issues: ["No pre-request enforcement"] },
      { l: "Hard limits enforced pre-request", s: "Blocked when limit reached", sc: 4, issues: [] },
    ],
  },
  {
    id: "injection",
    q: "How do you detect prompt injection attempts?",
    hint: "Malicious instructions in tool results or web content",
    opts: [
      { l: "No detection", s: "", sc: 0, issues: ["Trust Breakdown: 42k+ exposed installs had this gap"] },
      { l: "Basic keyword filtering", s: "", sc: 1, issues: ["Bypassed by indirect injection"] },
      { l: "Multi-phase detection (entropy + signatures)", s: "", sc: 5, issues: [] },
    ],
  },
  {
    id: "audit",
    q: "What is your audit trail setup?",
    hint: "EU AI Act Article 12 requires logging agent inputs and outputs",
    opts: [
      { l: "None — only provider dashboard logs", s: "", sc: 0, issues: ["EU AI Act Article 12: non-compliant", "Cannot reconstruct incidents"] },
      { l: "App-level logs, self-managed", s: "", sc: 2, issues: ["Not tamper-evident", "No structured compliance format"] },
      { l: "Immutable audit trail with session replay", s: "", sc: 4, issues: [] },
    ],
  },
  {
    id: "loop",
    q: "How do you handle runaway / infinite loop agents?",
    hint: "Context Collapse — agent retries forever, billing spikes",
    opts: [
      { l: "We found out from the bill", s: "", sc: 0, issues: ["Context Collapse: no circuit breaker"] },
      { l: "Framework-level timeout only", s: "", sc: 2, issues: ["Blind to token-level loops"] },
      { l: "Loop detection + automatic circuit breaker", s: "", sc: 5, issues: [] },
    ],
  },
];

const MAX_SCORE = QUESTIONS.reduce((s, q) => s + Math.max(...q.opts.map(o => o.sc)), 0);
const GRADES = [
  { min: 18, g: "A+", color: "#22c55e", label: "Excellent — production ready" },
  { min: 15, g: "A",  color: "#22c55e", label: "Strong — minor gaps only" },
  { min: 11, g: "B+", color: "#eab308", label: "Good — address warnings" },
  { min: 7,  g: "B",  color: "#eab308", label: "Moderate — several risks" },
  { min: 3,  g: "C",  color: "#f97316", label: "Weak — significant exposure" },
  { min: 0,  g: "D",  color: "#ef4444", label: "Critical — act immediately" },
];
function getGrade(sc: number) { return GRADES.find(g => sc >= g.min) ?? GRADES[GRADES.length - 1]; }

const NAV_LINKS = [
  { label: "Scan", href: "/scan" },
  { label: "Scorecard", href: "/scorecard" },
  { label: "OpenClaw", href: "/openclaw" },
  { label: "Paperclip", href: "/paperclip" },
  { label: "Docs", href: "https://github.com/poushwell/orchesis/blob/main/QUICK_START.md" },
  { label: "GitHub", href: "https://github.com/poushwell/orchesis" },
  { label: "Blog", href: "/blog" },
];

const FOOTER_LINKS = [
  { label: "GitHub", href: "https://github.com/poushwell/orchesis" },
  { label: "Scan", href: "/scan" },
  { label: "Scorecard", href: "/scorecard" },
  { label: "OpenClaw", href: "/openclaw" },
  { label: "Paperclip", href: "/paperclip" },
  { label: "Telegram", href: "/telegram" },
  { label: "Blog", href: "/blog" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

const t = {
  bg: "#0f0f11", card: "#18181b", border: "#27272a",
  text: "#e4e4e7", dim: "#71717a", muted: "#3f3f46",
  accent: "#a855f7", inputBg: "#0d0d0f",
  selectedBorder: "#a855f7", selectedBg: "rgba(168,85,247,0.08)",
};

function FullNav({ onRetake }: { onRetake?: () => void }) {
  return (
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", borderBottom: `1px solid ${t.border}` }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: t.text, fontSize: "16px", fontWeight: 600 }}>
        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#38bdf8)", opacity: 0.9 }} />
        Orchesis
      </Link>
      <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
        {NAV_LINKS.map(item => (
          <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
            style={{ color: t.dim, textDecoration: "none", fontSize: "13px", transition: "color 0.2s" }}
            onMouseEnter={e => (e.target as HTMLElement).style.color = t.text}
            onMouseLeave={e => (e.target as HTMLElement).style.color = t.dim}
          >{item.label}</a>
        ))}
        {onRetake && (
          <button onClick={onRetake} style={{ fontSize: "13px", color: t.dim, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Retake →</button>
        )}
      </div>
    </nav>
  );
}

function FullFooter() {
  return (
    <footer style={{ borderTop: `1px solid ${t.border}`, marginTop: "auto" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <span style={{ fontSize: "12px", color: t.muted }}>© 2026 Orchesis · MIT License</span>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {FOOTER_LINKS.map(l => (
            <a key={l.label} href={l.href} style={{ fontSize: "12px", color: t.muted, textDecoration: "none" }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = t.dim}
              onMouseLeave={e => (e.target as HTMLElement).style.color = t.muted}
            >{l.label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function Scorecard() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [step, setStep] = useState<"quiz" | "result">("quiz");
  const [cur, setCur] = useState(0);
  const [copied, setCopied] = useState(false);
  const totalScore = () => QUESTIONS.reduce((s, q) => s + (answers[q.id] !== undefined ? q.opts[answers[q.id]].sc : 0), 0);
  const allIssues = () => {
    const crit: string[] = [], warn: string[] = [];
    QUESTIONS.forEach(q => {
      if (answers[q.id] !== undefined) {
        q.opts[answers[q.id]].issues.forEach(i =>
          i.toLowerCase().includes("non-compliant") || i.toLowerCase().includes("critical") ? crit.push(i) : warn.push(i)
        );
      }
    });
    return { crit, warn };
  };
  const shareText = () => {
    const sc = totalScore(); const g = getGrade(sc); const { crit, warn } = allIssues();
    return `My AI agent stack scored ${g.g} on the Orchesis Security Scorecard.${crit.length ? ` ${crit.length} critical issue${crit.length > 1 ? "s" : ""} found.` : warn.length ? ` ${warn.length} warning${warn.length > 1 ? "s" : ""}.` : " No critical issues."} orchesis.ai/scorecard`;
  };
  const handleRetake = () => { setAnswers({}); setCur(0); setStep("quiz"); };

  if (step === "quiz") {
    const q = QUESTIONS[cur];
    return (
      <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "-apple-system,system-ui,sans-serif", display: "flex", flexDirection: "column" }}>
        <FullNav />
        <main style={{ maxWidth: "600px", margin: "0 auto", padding: "48px 24px", flex: 1 }}>
          <div style={{ marginBottom: "40px" }}>
            <p style={{ fontSize: "11px", color: t.muted, letterSpacing: "0.12em", textTransform: "uppercase" as const, margin: "0 0 12px" }}>AI Agent Security Scorecard</p>
            <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 8px" }}>How secure is your agent stack?</h1>
            <p style={{ fontSize: "14px", color: t.dim, margin: 0 }}>5 questions · instant grade · free</p>
          </div>
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: t.muted, marginBottom: "8px" }}>
              <span>Question {cur + 1} of {QUESTIONS.length}</span>
              <span>{Math.round((cur / QUESTIONS.length) * 100)}%</span>
            </div>
            <div style={{ height: "4px", background: t.border, borderRadius: "2px" }}>
              <div style={{ height: "100%", width: `${(cur / QUESTIONS.length) * 100}%`, background: t.accent, borderRadius: "2px", transition: "width 0.3s" }} />
            </div>
          </div>
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "28px", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 8px", lineHeight: 1.4 }}>{q.q}</h2>
            <p style={{ fontSize: "13px", color: t.dim, margin: "0 0 24px" }}>{q.hint}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {q.opts.map((o, i) => (
                <div key={i} onClick={() => setAnswers(a => ({ ...a, [q.id]: i }))}
                  style={{ padding: "14px 16px", borderRadius: "10px", cursor: "pointer", border: `1.5px solid ${answers[q.id] === i ? t.selectedBorder : t.border}`, background: answers[q.id] === i ? t.selectedBg : "transparent", transition: "all 0.15s" }}>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: t.text }}>{o.l}</div>
                  {o.s && <div style={{ fontSize: "12px", color: t.dim, marginTop: "3px" }}>{o.s}</div>}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {cur > 0 ? (
              <button onClick={() => setCur(c => c - 1)} style={{ padding: "10px 20px", borderRadius: "8px", border: `1px solid ${t.border}`, background: "transparent", color: t.dim, cursor: "pointer", fontSize: "14px", fontFamily: "inherit" }}>← Back</button>
            ) : <span />}
            <button onClick={() => { if (cur === QUESTIONS.length - 1) setStep("result"); else setCur(c => c + 1); }}
              disabled={answers[q.id] === undefined}
              style={{ padding: "10px 24px", borderRadius: "8px", background: t.accent, color: "#fff", border: "none", cursor: answers[q.id] === undefined ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "14px", fontFamily: "inherit", opacity: answers[q.id] === undefined ? 0.4 : 1 }}>
              {cur === QUESTIONS.length - 1 ? "See results →" : "Next →"}
            </button>
          </div>
        </main>
        <FullFooter />
      </div>
    );
  }

  const sc = totalScore(); const g = getGrade(sc); const { crit, warn } = allIssues(); const noProxy = answers["proxy"] !== 2;
  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "-apple-system,system-ui,sans-serif", display: "flex", flexDirection: "column" }}>
      <FullNav onRetake={handleRetake} />
      <main style={{ maxWidth: "600px", margin: "0 auto", padding: "48px 24px", flex: 1 }}>
        <p style={{ fontSize: "11px", color: t.muted, letterSpacing: "0.12em", textTransform: "uppercase" as const, margin: "0 0 24px" }}>Your results</p>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "16px", padding: "32px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", marginBottom: "16px" }}>
            <div style={{ fontSize: "80px", fontWeight: 800, color: g.color, lineHeight: 1, letterSpacing: "-0.04em" }}>{g.g}</div>
            <div style={{ paddingBottom: "8px" }}>
              <div style={{ fontSize: "16px", fontWeight: 600, color: t.text }}>{g.label}</div>
              <div style={{ fontSize: "13px", color: t.dim }}>{sc} / {MAX_SCORE} points</div>
            </div>
          </div>
          <div style={{ height: "8px", background: t.border, borderRadius: "4px" }}>
            <div style={{ height: "100%", width: `${Math.round(sc / MAX_SCORE * 100)}%`, background: g.color, borderRadius: "4px", transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)" }} />
          </div>
        </div>
        {(crit.length > 0 || warn.length > 0) && (
          <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {crit.map((issue, k) => (
              <div key={k} style={{ padding: "10px 14px", borderRadius: "8px", borderLeft: "3px solid #ef4444", background: "rgba(239,68,68,0.08)", color: "#fca5a5", fontSize: "13px" }}>
                <strong>Critical:</strong> {issue}
              </div>
            ))}
            {warn.map((issue, k) => (
              <div key={k} style={{ padding: "10px 14px", borderRadius: "8px", borderLeft: "3px solid #f97316", background: "rgba(249,115,22,0.08)", color: "#fdba74", fontSize: "13px" }}>{issue}</div>
            ))}
          </div>
        )}
        {!crit.length && !warn.length && (
          <div style={{ padding: "10px 14px", borderRadius: "8px", borderLeft: "3px solid #22c55e", background: "rgba(34,197,94,0.08)", color: "#86efac", fontSize: "13px", marginBottom: "20px" }}>
            No significant issues detected. Well configured.
          </div>
        )}
        {/* Existing CTA for low-proxy users */}
        {noProxy && sc < 15 && (
          <div style={{ border: `1px solid rgba(168,85,247,0.3)`, borderRadius: "12px", padding: "20px", marginBottom: "20px", background: "rgba(168,85,247,0.06)" }}>
            <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: t.text }}>How Orchesis closes these gaps</div>
            <div style={{ fontSize: "13px", color: t.dim, lineHeight: 1.6, marginBottom: "14px" }}>One config change. Zero code rewrites. Threat detection, audit trail, budget enforcement.</div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <a href="https://github.com/poushwell/orchesis#quick-start" target="_blank" rel="noopener noreferrer"
                style={{ padding: "8px 18px", borderRadius: "8px", background: t.accent, color: "#fff", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>Get Started</a>
              <code style={{ fontSize: "12px", background: t.border, padding: "8px 14px", borderRadius: "8px", color: t.dim, alignSelf: "center" }}>pip install orchesis</code>
            </div>
          </div>
        )}
        {/* SC5: Conversion CTA */}
        <div style={{ border: "1px solid rgba(168,85,247,0.25)", borderRadius: "12px", padding: "20px", marginBottom: "20px", background: "rgba(168,85,247,0.03)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: t.text, marginBottom: "14px" }}>Improve your score</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { label: "Install Orchesis →", sub: "One config change.", href: "https://github.com/poushwell/orchesis#quick-start", external: true },
              { label: "Scan MCP Configs →", sub: "52 checks, browser.", href: "/scan", external: false },
              { label: "Read Security Guide →", sub: "Proxy vs SDK.", href: "/blog/proxy-vs-decorator", external: false },
            ].map((item, i) => (
              <a key={i} href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #27272a", textDecoration: "none", transition: "border-color 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = t.accent}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "#27272a"}
              >
                <span style={{ fontSize: "13px", fontWeight: 600, color: t.accent }}>{item.label}</span>
                <span style={{ fontSize: "12px", color: t.dim }}>{item.sub}</span>
              </a>
            ))}
          </div>
        </div>
        {/* Share */}
        <div style={{ border: `1px solid ${t.border}`, borderRadius: "12px", padding: "20px" }}>
          <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "12px" }}>Share your score</div>
          <div style={{ fontFamily: "'JetBrains Mono','SF Mono',monospace", fontSize: "12px", background: t.inputBg, padding: "12px 14px", borderRadius: "8px", color: t.dim, lineHeight: 1.6, marginBottom: "14px" }}>{shareText()}</div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => { navigator.clipboard?.writeText(shareText()); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              style={{ padding: "9px 18px", borderRadius: "8px", background: t.accent, color: "#fff", border: "none", cursor: "pointer", fontWeight: 500, fontSize: "13px", fontFamily: "inherit" }}>
              {copied ? "✓ Copied!" : "Copy share text"}
            </button>
            <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText())}`, "_blank", "noopener")}
              style={{ padding: "9px 18px", borderRadius: "8px", border: `1px solid ${t.border}`, background: "transparent", color: t.dim, cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>
              🐦 Tweet
            </button>
          </div>
        </div>
      </main>
      <FullFooter />
    </div>
  );
}
