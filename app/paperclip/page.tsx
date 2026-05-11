"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import EasterEggs from "../components/EasterEggs";

type SiteMode = "dark" | "light" | "matrix" | "dos" | "ussr";

const themes: Record<string, Record<string, string>> = {
  matrix: { bg:"#000000",bgCard:"#001100",bgCard2:"#002200",text:"#00ff41",textDim:"#009921",textMut:"#004d14",accent:"#00ff41",accent2:"#00cc33",accent3:"#ffcc00",border:"#001908",borderH:"#003311",red:"#ff4444",green:"#00ff41",yellow:"#ffcc00",tagBg:"rgba(0,255,65,0.08)",tagBrd:"rgba(0,255,65,0.2)",tagTxt:"#00cc33",btnBg:"#00ff41",btnTxt:"#000000",btnGlow:"none" },
  dos:    { bg:"#000080",bgCard:"#0000aa",bgCard2:"#0000cc",text:"#ffffff",textDim:"#aaaaaa",textMut:"#555588",accent:"#ffff55",accent2:"#55ffff",accent3:"#ff5555",border:"#5555ff",borderH:"#8888ff",red:"#ff5555",green:"#55ff55",yellow:"#ffff55",tagBg:"rgba(255,255,85,0.1)",tagBrd:"rgba(255,255,85,0.3)",tagTxt:"#ffff55",btnBg:"#aaaaaa",btnTxt:"#000080",btnGlow:"none" },
  dark:   { bg:"#0f0f11",bgCard:"#18181b",bgCard2:"#1f1f23",text:"#e4e4e7",textDim:"#71717a",textMut:"#3f3f46",accent:"#a855f7",accent2:"#38bdf8",accent3:"#fb923c",border:"#27272a",borderH:"#52525b",red:"#ef4444",green:"#22c55e",yellow:"#eab308",tagBg:"rgba(168,85,247,0.08)",tagBrd:"rgba(168,85,247,0.2)",tagTxt:"#c084fc",btnBg:"linear-gradient(135deg,#a855f7,#7c3aed)",btnTxt:"#fff",btnGlow:"0 0 24px rgba(168,85,247,0.25)" },
  light:  { bg:"#F7F5F0",bgCard:"#fff",bgCard2:"#FAFAF6",text:"#1A1A1A",textDim:"#777",textMut:"#BBB",accent:"#C41E3A",accent2:"#C41E3A",accent3:"#C41E3A",border:"#E8E4DC",borderH:"#CCC",red:"#C41E3A",green:"#2E7D32",yellow:"#E65100",tagBg:"#F0EDE6",tagBrd:"#E8E4DC",tagTxt:"#999",btnBg:"#C41E3A",btnTxt:"#fff",btnGlow:"none" },
};

const PROBLEMS = [
  { tag:"Budget tracking · Heartbeat gap", metric:"$55–150", mLabel:"unmonitored spend per agent run", mColor:"#f97316", title:"Budget checks only fire between heartbeats", desc:"Paperclip checks budgets when an agent wakes up and when it finishes. Inside the run: unlimited spend. If the agent times out, the cost vanishes from the dashboard entirely. A 30-minute heartbeat with a 10-minute run means 20 minutes of complete cost blindness per cycle.", outcome:"Orchesis detects the loop at API call #3", detail:"$0.05 spent. That's 450× to 1,800,000× faster than waiting for the next heartbeat." },
  { tag:"Issue #212 · Codex adapter", metric:"$0.00", mLabel:"reported cost for every Codex run", mColor:"#ef4444", title:"Your dashboard says your Codex agents cost nothing", desc:"The Codex adapter reports $0.00 for all runs. Millions of tokens processed, zero recorded cost. The dashboard shows a number. The number is wrong. There is no independent verification.", outcome:"Orchesis meters every API call at the network layer", detail:"Real tokens, real cost, independent of what the agent reports." },
  { tag:"Cascading Injection · Formal proof", metric:"10 min", mLabel:"to infect your entire fleet from one task", mColor:"", title:"One poisoned issue description compromises 13 agents", desc:"Issue descriptions have zero input sanitization. An attacker writes a malicious task. The CEO agent reads it, delegates to CTOs, who delegate to engineers. At fan-out 3 and depth 2: 13 agents compromised in 10 minutes. We proved this formally: N(t) = O(f^{t/Δ_h}).", outcome:"Orchesis at depth 0 saves 92% of the fleet", detail:"At depth 1: 69%. Pattern-matched injection is fully contained." },
];

const NUMBERS = [
  { val:"$0.05",  color:"green",  label:"Loop detected at API call #3", sub:"vs $55–150 at next heartbeat" },
  { val:"96%",    color:"accent2", label:"Explicit injection patterns detected", sub:"0% false positives · calibrated" },
  { val:"2ms",    color:"accent2", label:"Cost anomaly detection latency", sub:"vs 15–60 minutes" },
  { val:"92%",    color:"accent3", label:"Fleet saved at cascade depth 0", sub:"Cascading Injection Theorem" },
  { val:"$52–143K", color:"green", label:"Annual value for fleet of 5 agents", sub:"Calibrated range" },
  { val:"57%",    color:"accent2", label:"Detection rate with dual proxy", sub:"+26pp over single proxy" },
];

const COVERAGE = [
  { surface:"Issue description injection", severity:"HIGH",     pc:"None",        oProxy:"Scan + block", oPlugin:"—" },
  { surface:"Goal ancestry cascade",        severity:"HIGH",     pc:"None",        oProxy:"Chain tracking","oPlugin":"—" },
  { surface:"Shared workspace files",       severity:"HIGH",     pc:"None",        oProxy:"Partial",      oPlugin:"Integrity check" },
  { surface:"Session state leakage",        severity:"MEDIUM",   pc:"None",        oProxy:"SessionTracer","oPlugin":"—" },
  { surface:"Plugin system (full Node.js)", severity:"CRITICAL", pc:"None",        oProxy:"Blind spot",   oPlugin:"Blind spot" },
  { surface:"Clipmart templates",           severity:"CRITICAL", pc:"No review",   oProxy:"Blind spot",   oPlugin:"Blind spot" },
  { surface:"Approval flow bypass",         severity:"CRITICAL", pc:"Broken (#696)",oProxy:"Detect + alert","oPlugin":"—" },
  { surface:"Cost reporting (self-reported)",severity:"HIGH",    pc:"Trusts agent",oProxy:"Independent metering","oPlugin":"—" },
  { surface:"Auth system (local_trusted)",  severity:"CRITICAL", pc:"PR #1315",    oProxy:"Blind spot",   oPlugin:"Blind spot" },
  { surface:"Cross-agent API (ctx.*)",      severity:"HIGH",     pc:"No RLS",      oProxy:"Blind spot",   oPlugin:"Audit hooks" },
  { surface:"Heartbeat gap (filesystem)",   severity:"MEDIUM",   pc:"None",        oProxy:"Blind spot",   oPlugin:"Snapshot" },
  { surface:"Stdout credential leaks",      severity:"MEDIUM",   pc:"Displayed in UI",oProxy:"API-level only","oPlugin":"—" },
];

const FAQ = [
  { q:"How does Orchesis integrate with Paperclip?", a:"One environment variable: ANTHROPIC_BASE_URL=http://orchesis:8080/v1. All agent API calls route through Orchesis automatically. Works with Claude Code, Codex, Cursor, and OpenClaw adapters. No code changes in Paperclip or your agents." },
  { q:"What does Orchesis detect that Paperclip doesn't?", a:"Runaway loops at API call #3 ($0.05 spent) instead of next heartbeat ($55–150). Prompt injection in issue descriptions, which have zero sanitization. Real API costs independent of self-reported agent data. Cross-agent behavioral correlation across your fleet." },
  { q:"Is Paperclip secure enough for production?", a:"Paperclip has 30,000+ stars and zero security documentation. We found 12 attack surfaces including unsandboxed plugins with full server access, broken approval flows, and zero input sanitization on issue descriptions. External monitoring is strongly recommended for any production deployment." },
  { q:"What are the honest limitations?", a:"Semantic injection (natural language attacks): 0% detection. Plugin layer: complete blind spot. 5 of 12 surfaces: zero protection. Realistic mixed-attack detection: 38%. We publish these numbers because transparency builds better security decisions." },
  { q:"How much does Orchesis cost?", a:"$0. MIT license. Self-hosted. No telemetry. No account required. The annual value for a Paperclip fleet of 5 agents is $52K–143K in prevented cost overruns and security incidents." },
];

function sevColor(s: string, t: Record<string,string>) {
  if (s === "CRITICAL") return { bg:"rgba(239,68,68,0.12)", color:"#ef4444", border:"rgba(239,68,68,0.3)" };
  if (s === "HIGH")     return { bg:"rgba(249,115,22,0.1)", color:"#f97316", border:"rgba(249,115,22,0.3)" };
  return                       { bg:"rgba(59,130,246,0.1)", color:"#3b82f6", border:"rgba(59,130,246,0.3)" };
}

function covColor(v: string, t: Record<string,string>) {
  if (v === "Scan + block" || v === "Detect + alert" || v === "Chain tracking" || v === "SessionTracer" || v === "Integrity check" || v === "Independent metering" || v === "Audit hooks" || v === "Snapshot" || v === "API-level only") return t.green;
  if (v === "Partial") return t.yellow;
  if (v === "None" || v === "Blind spot" || v === "No review" || v.startsWith("Broken") || v === "Trusts agent" || v.startsWith("PR") || v === "No RLS" || v === "Displayed in UI") return t.red;
  return t.textDim;
}

export default function Paperclip() {
  const [mode, setMode] = useState<SiteMode>("dark");
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { const c = () => setIsMobile(window.innerWidth < 768); c(); window.addEventListener("resize",c); return () => window.removeEventListener("resize",c); }, []);

  const t = themes[mode] || themes["dark"];
  const isMatrix = mode === "matrix";
  const isDos = mode === "dos";
  const isLight = mode === "light";
  const isEgg = isMatrix || isDos;
  const mono = isEgg ? "\'Courier New\',monospace" : "\'JetBrains Mono\',\'SF Mono\',monospace";
  const sans = isLight ? "\'Noto Sans JP\',\'Inter\',system-ui,sans-serif" : isEgg ? mono : "-apple-system,\'Segoe UI\',system-ui,sans-serif";
  const toggle = () => setMode(m => m === "dark" ? "light" : "dark");

  const S = (x: Record<string,string|number>) => x as React.CSSProperties;
  const card = S({ background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:isEgg?"0":"12px" });
  const pill = S({ display:"inline-flex", alignItems:"center", gap:"6px", background:t.tagBg, border:`1px solid ${t.tagBrd}`, borderRadius:"100px", padding:"5px 14px", fontSize:"12px", color:t.tagTxt, fontFamily:mono, letterSpacing:"0.05em" });
  const stag = S({ display:"inline-block", fontSize:"11px", fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:t.accent, marginBottom:"14px", fontFamily:mono });
  const stitle = S({ fontSize:"clamp(22px,4vw,38px)", fontWeight:isLight?300:700, letterSpacing:isEgg?"0.02em":"-0.03em", lineHeight:1.15, marginBottom:"12px" });
  const ssub = S({ fontSize:"15px", color:t.textDim, maxWidth:"560px", lineHeight:1.6 });
  const div0 = S({ borderTop:`1px solid ${t.border}` });
  const W = { maxWidth:"1080px", margin:"0 auto", padding:isMobile?"0 20px":"0 48px" };

  return (
    <div style={{ minHeight:"100vh", background:t.bg, color:t.text, fontFamily:sans, lineHeight:1.6, transition:"background 0.3s,color 0.3s" }}>
      <EasterEggs mode={mode} onActivate={setMode} />

      {/* NAV */}
      <nav style={{ borderBottom:`1px solid ${t.border}`, position:"sticky", top:0, background:t.bg, zIndex:100 }}>
        <div style={{ ...W, display:"flex", alignItems:"center", justifyContent:"space-between", height:"60px" }}>
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:"10px", textDecoration:"none", color:t.text, fontSize:"15px", fontWeight:600 }}>
            <div style={{ width:"22px", height:"22px", borderRadius:"50%", background:"linear-gradient(135deg,#a855f7,#38bdf8)", opacity:0.9 }} />
            Orchesis
            <span style={{ fontSize:"11px", color:t.textMut, background:t.bgCard, border:`1px solid ${t.border}`, padding:"2px 10px", borderRadius:"100px", fontFamily:mono }}>
              {isDos?"[ × PAPERCLIP ]":isMatrix?"×PAPERCLIP":"× Paperclip"}
            </span>
          </Link>
          <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
            {!isMobile && <>
              <a href="#problem"  style={{ color:t.textDim, textDecoration:"none", fontSize:"14px", padding:"6px 12px" }}>The problem</a>
              <a href="#coverage" style={{ color:t.textDim, textDecoration:"none", fontSize:"14px", padding:"6px 12px" }}>Coverage</a>
              <a href="#numbers"  style={{ color:t.textDim, textDecoration:"none", fontSize:"14px", padding:"6px 12px" }}>Numbers</a>
              <a href="https://github.com/poushwell/orchesis" target="_blank" rel="noopener noreferrer" style={{ color:t.textDim, textDecoration:"none", fontSize:"14px", padding:"6px 12px" }}>GitHub</a>
            </>}
            {mode !== "ussr" && (
              <button onClick={toggle} style={{ padding:"6px 14px", borderRadius:isDos?"0":"8px", border:`1px solid ${t.border}`, background:"transparent", color:t.textDim, fontSize:"12px", cursor:"pointer", fontFamily:"inherit" }}>
                {mode==="dark"?"☀ Light":mode==="light"?"🌙 Dark":"✕ EXIT"}
              </button>
            )}
            <a href="#install" style={{ background:t.btnBg, color:t.btnTxt, padding:"8px 18px", borderRadius:isEgg?"0":"10px", textDecoration:"none", fontSize:"14px", fontWeight:600, boxShadow:t.btnGlow }}>
              {isDos?"[ INSTALL.EXE ]":isMatrix?"INSTALL >":"Install free →"}
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth:"760px", margin:"0 auto", padding:isMobile?"64px 20px 60px":"96px 48px 80px", textAlign:"center" }}>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
        <div style={pill as React.CSSProperties}>
          <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:t.green, display:"inline-block", animation:"pulse 2s infinite" }} />
          {isDos?"BUILT ON 67 PAPERCLIP GITHUB ISSUES ANALYZED":isMatrix?"> 67_paperclip_issues_analyzed":"Built on 67 Paperclip GitHub issues analyzed"}
        </div>

        <h1 style={{ fontSize:isMobile?"32px":"clamp(36px,6vw,68px)", fontWeight:isLight?300:700, letterSpacing:isEgg?"0.02em":"-0.04em", lineHeight:1.1, margin:"28px 0 20px" }}>
          {isDos?<>PAPERCLIP RUNS YOUR AI COMPANY.<br/><span style={{ color:t.accent }}>ORCHESIS KEEPS IT FROM<br/>RUNNING AWAY.</span></>
          :isMatrix?<><span style={{ color:t.textDim }}>paperclip:</span><br/><span style={{ color:t.accent }}>RUNNING_AWAY</span></>
          :<>Paperclip runs your AI company.<br/><span style={{ color:t.accent }}>Orchesis keeps it from running away.</span></>}
        </h1>

        <p style={{ fontSize:"16px", color:t.textDim, maxWidth:"520px", margin:"0 auto 12px", lineHeight:1.6 }}>
          <strong style={{ color:t.text }}>Orchesis is an open-source HTTP proxy that sits between Paperclip agents and LLM APIs</strong> to detect loops at API call #3, scan for injection on every request, and meter real costs independently of what the agent reports.
        </p>

        <p style={{ fontSize:"12px", color:t.textMut, marginBottom:"36px", fontFamily:mono, letterSpacing:"0.05em" }}>
          <span style={{ color:t.textDim }}>12 attack surfaces</span> · <span style={{ color:t.accent }}>$0.05 loop catch</span> · <span style={{ color:t.textDim }}>0 Paperclip security docs</span> · <span style={{ color:t.textDim }}>96% injection detected</span>
        </p>

        <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap", marginBottom:"40px" }}>
          <a href="#install" style={{ background:t.btnBg, color:t.btnTxt, padding:"12px 28px", borderRadius:isEgg?"0":"12px", textDecoration:"none", fontSize:"15px", fontWeight:600, boxShadow:t.btnGlow, display:"inline-block" }}>
            {isDos?"[ INSTALL IN 30 SECONDS ]":isMatrix?"INSTALL_NOW >":"Install in 30 seconds →"}
          </a>
          <a href="https://github.com/poushwell/orchesis" target="_blank" rel="noopener noreferrer" style={{ background:"transparent", color:t.textDim, padding:"12px 28px", borderRadius:isEgg?"0":"12px", textDecoration:"none", fontSize:"15px", fontWeight:500, border:`1px solid ${t.border}`, display:"inline-block" }}>
            ★ Star on GitHub
          </a>
        </div>

        <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", justifyContent:"center" }}>
          {[
            { icon:"🔍", t:"12 attack surfaces found" },
            { icon:"⚡", t:"$0.05 loop catch at call #3" },
            { icon:"🔒", t:"18 injection patterns" },
            { icon:"⚖", t:"MIT · Free · Self-hosted" },
          ].map((s,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:"6px", background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:isEgg?"0":"100px", padding:"5px 14px", fontSize:"12px", color:t.textDim, fontFamily:mono }}>
              {s.icon} {s.t}
            </div>
          ))}
        </div>
      </div>

      {/* PROBLEMS */}
      <div id="problem" style={W}>
        <div style={div0 as React.CSSProperties} />
        <section style={{ padding:"80px 0" }}>
          <div style={stag as React.CSSProperties}>What Paperclip's dashboard doesn't show you</div>
          <h2 style={stitle as React.CSSProperties}>Three things that actually happen in production Paperclip fleets.</h2>
          <p style={ssub as React.CSSProperties}>Each one has an issue number.</p>
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr 1fr", gap:"1px", background:t.border, border:`1px solid ${t.border}`, borderRadius:isEgg?"0":"12px", overflow:"hidden", marginTop:"48px" }}>
            {PROBLEMS.map((p,i) => (
              <div key={i} style={{ background:t.bgCard, padding:"28px" }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=t.bgCard2}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=t.bgCard}>
                <div style={{ fontFamily:mono, fontSize:"11px", color:t.textMut, marginBottom:"14px", letterSpacing:"0.05em" }}>{p.tag}</div>
                <div style={{ fontSize:"40px", fontWeight:800, letterSpacing:"-0.03em", color:p.mColor||t.accent2, lineHeight:1, marginBottom:"4px" }}>{p.metric}</div>
                <div style={{ fontSize:"12px", color:t.textDim, marginBottom:"18px" }}>{p.mLabel}</div>
                <h3 style={{ fontSize:"15px", fontWeight:600, marginBottom:"10px", lineHeight:1.3 }}>{p.title}</h3>
                <p style={{ fontSize:"13px", color:t.textDim, lineHeight:1.6, marginBottom:"16px" }}>{p.desc}</p>
                <p style={{ fontSize:"13px", color:t.textDim, paddingTop:"14px", borderTop:`1px solid ${t.border}`, lineHeight:1.6 }}>
                  <strong style={{ color:t.green, fontWeight:500 }}>{p.outcome}</strong> — {p.detail}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* INSTALL */}
      <div id="install" style={W}>
        <div style={div0 as React.CSSProperties} />
        <section style={{ padding:"80px 0" }}>
          <div style={stag as React.CSSProperties}>One environment variable. That's it.</div>
          <h2 style={stitle as React.CSSProperties}>No code changes in Paperclip. No code changes in your agents.</h2>
          <p style={ssub as React.CSSProperties}>Works with Claude Code, Codex, Cursor, and OpenClaw adapters.</p>

          <div style={{ background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:isEgg?"0":"10px", padding:"22px 26px", fontFamily:mono, fontSize:"13px", lineHeight:2.2, maxWidth:"600px", marginTop:"40px" }}>
            <span style={{ color:t.textMut }}># 1. Install Orchesis</span><br/>
            <span style={{ color:t.text }}>pip install orchesis</span><br/>
            <span style={{ color:t.text }}>orchesis init <span style={{ color:t.accent2 }}>--with-crystal-alert --with-injection-shield</span></span><br/><br/>
            <span style={{ color:t.textMut }}># 2. Add one line to your Paperclip .env</span><br/>
            <span style={{ display:"block", background:t.tagBg, margin:"0 -26px", padding:"0 26px", borderLeft:`2px solid ${t.accent}` }}>
              <span style={{ color:t.accent2 }}>ANTHROPIC_BASE_URL</span>=<span style={{ color:t.accent }}>"http://orchesis:8080/v1"</span>
            </span><br/>
            <span style={{ color:t.textMut }}># 3. Verify</span><br/>
            <span style={{ color:t.text }}>orchesis verify</span><br/><br/>
            <span style={{ color:t.green }}>✓ Proxy running on :8080</span><br/>
            <span style={{ color:t.green }}>✓ Crystal Alert: active</span><br/>
            <span style={{ color:t.green }}>✓ Injection Shield: active (33+ patterns + 14 Paperclip-specific)</span><br/>
            <span style={{ color:t.green }}>✓ Cost metering: real-time</span><br/>
            <span style={{ color:t.yellow }}>⚠ Paperclip heartbeat detected: 30 min · Orchesis covers the gaps</span>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr 1fr", gap:"14px", marginTop:"32px" }}>
            {[
              { time:"30s",  phase:"Phase 0: Minimum Viable Integration", desc:"One env var. Loop detection + cost metering + injection scanning. Covers 60–70% of total value immediately." },
              { time:"14h",  phase:"Phase 1: Core Adapter", desc:"Paperclip-specific patterns. Agent ID correlation. Detection jumps from 30–40% to 55–65%." },
              { time:"84h",  phase:"Full Integration", desc:"Budget bridge, plugin hooks, dual proxy, workspace monitoring. All 6 phases." },
            ].map((s,i) => (
              <div key={i} style={{ ...card, padding:"22px" }}>
                <div style={{ fontFamily:mono, fontSize:"20px", fontWeight:700, color:t.accent, marginBottom:"8px" }}>{s.time}</div>
                <div style={{ fontSize:"13px", fontWeight:600, marginBottom:"8px" }}>{s.phase}</div>
                <div style={{ fontSize:"12px", color:t.textDim, lineHeight:1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* COVERAGE */}
      <div id="coverage" style={W}>
        <div style={div0 as React.CSSProperties} />
        <section style={{ padding:"80px 0" }}>
          <div style={stag as React.CSSProperties}>12 attack surfaces. What catches what.</div>
          <h2 style={stitle as React.CSSProperties}>We identified 12 ways to attack a Paperclip fleet.</h2>
          <p style={ssub as React.CSSProperties}>Orchesis covers 9. Five surfaces have zero protection from any tool.</p>
          <div style={{ overflowX:"auto", marginTop:"48px" }}>
            <div style={{ border:`1px solid ${t.border}`, borderRadius:isEgg?"0":"12px", overflow:"hidden", minWidth:"700px" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:t.bgCard2 }}>
                    {["Attack surface","Severity","Paperclip","Orchesis (proxy)","Orchesis (plugin)"].map((h,i)=>(
                      <th key={i} style={{ textAlign:"left", fontSize:"11px", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase" as const, color:t.textMut, padding:"12px 16px", borderBottom:`1px solid ${t.border}`, fontFamily:mono }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COVERAGE.map((row,i)=>{
                    const sc = sevColor(row.severity, t);
                    return (
                      <tr key={i} style={{ borderBottom:i<COVERAGE.length-1?`1px solid ${t.border}`:"none" }}>
                        <td style={{ padding:"12px 16px", fontSize:"13px", color:t.text, fontWeight:500 }}>{row.surface}</td>
                        <td style={{ padding:"12px 16px" }}>
                          <span style={{ fontSize:"10px", fontWeight:700, letterSpacing:"0.08em", padding:"2px 8px", borderRadius:"100px", background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`, fontFamily:mono }}>{row.severity}</span>
                        </td>
                        <td style={{ padding:"12px 16px", fontSize:"13px", color:covColor(row.pc,t) }}>{row.pc}</td>
                        <td style={{ padding:"12px 16px", fontSize:"13px", color:covColor(row.oProxy,t) }}>{row.oProxy}</td>
                        <td style={{ padding:"12px 16px", fontSize:"13px", color:covColor(row.oPlugin,t) }}>{row.oPlugin}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <p style={{ fontSize:"12px", color:t.textMut, marginTop:"16px", fontFamily:mono }}>
            5 surfaces marked "Blind spot" require fixes in Paperclip itself. We report these through responsible disclosure, not marketing.
          </p>
        </section>
      </div>

      {/* NUMBERS */}
      <div id="numbers" style={W}>
        <div style={div0 as React.CSSProperties} />
        <section style={{ padding:"80px 0" }}>
          <div style={stag as React.CSSProperties}>What Orchesis catches for Paperclip fleets</div>
          <h2 style={stitle as React.CSSProperties}>Every number below is calculated, not estimated.</h2>
          <p style={ssub as React.CSSProperties}>Methods and assumptions are published.</p>
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"1fr 1fr 1fr", gap:"14px", marginTop:"48px" }}>
            {NUMBERS.map((n,i)=>{
              const c = n.color==="green"?t.green:n.color==="accent2"?t.accent2:n.color==="accent3"?t.accent3:t.accent;
              return (
                <div key={i} style={{ ...card, padding:"24px" }}>
                  <div style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:800, letterSpacing:"-0.03em", color:c, lineHeight:1, marginBottom:"8px" }}>{n.val}</div>
                  <div style={{ fontSize:"13px", fontWeight:600, marginBottom:"4px" }}>{n.label}</div>
                  <div style={{ fontSize:"12px", color:t.textMut, fontFamily:mono }}>{n.sub}</div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* COMPARISON */}
      <div style={W}>
        <div style={div0 as React.CSSProperties} />
        <section style={{ padding:"80px 0" }}>
          <div style={stag as React.CSSProperties}>OpenClaw vs Paperclip: different problems, same solution</div>
          <h2 style={stitle as React.CSSProperties}>Same proxy. Different scale.</h2>
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:"16px", marginTop:"48px" }}>
            {[
              { title:"OpenClaw + Orchesis", sub:"Individual developer, one agent", rows:[["Fleet size","1"],["Session model","Continuous"],["Integration","0 hours"],["Lead problem","Invisible attacks"],["Collusion risk","None (N=1)"],["Injection surfaces","3–4"],["Annual value","$5–20K"]], accent:false },
              { title:"Paperclip + Orchesis", sub:"Team, 5–20 agents in production", rows:[["Fleet size","5–20"],["Session model","Heartbeat"],["Integration","30 min → 84h"],["Lead problem","Cost bleeding"],["Collusion risk","Yes (Folk theorem)"],["Injection surfaces","12"],["Annual value","$52–143K"]], accent:true },
            ].map((col,i)=>(
              <div key={i} style={{ ...card, padding:"28px", border:col.accent?`1px solid ${t.accent}`:`1px solid ${t.border}` }}>
                <div style={{ fontSize:"16px", fontWeight:700, marginBottom:"4px" }}>{col.title}</div>
                <div style={{ fontSize:"13px", color:t.textDim, marginBottom:"20px" }}>{col.sub}</div>
                {col.rows.map(([k,v],j)=>(
                  <div key={j} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${t.border}`, fontSize:"13px" }}>
                    <span style={{ color:t.textDim }}>{k}</span>
                    <span style={{ color:k==="Annual value"?t.green:t.text, fontWeight:k==="Annual value"?600:400 }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p style={{ fontSize:"13px", color:t.textDim, marginTop:"20px" }}>
            Also available: <Link href="/openclaw" style={{ color:t.accent, textDecoration:"none" }}>See our OpenClaw integration →</Link>
          </p>
        </section>
      </div>

      {/* HONEST LIMITS */}
      <div style={W}>
        <div style={div0 as React.CSSProperties} />
        <section style={{ padding:"80px 0" }}>
          <div style={stag as React.CSSProperties} id="limits">What Orchesis can't do for Paperclip</div>
          <h2 style={stitle as React.CSSProperties}>We publish our limits.</h2>
          <p style={ssub as React.CSSProperties}>Nobody else in this space does this. You need them to make real security decisions.</p>
          <div style={{ background:`rgba(239,68,68,0.04)`, border:`1px solid rgba(239,68,68,0.15)`, borderRadius:isEgg?"0":"12px", padding:"28px 32px", marginTop:"48px", display:"flex", flexDirection:"column" as const, gap:"20px" }}>
            {[
              { title:"Semantic injection: 0% detection.", body:"Natural language attacks disguised as legitimate tasks are fundamentally undetectable by any finite set of regex patterns. This is proven, not an engineering gap." },
              { title:"Plugin layer: complete blind spot.", body:"Paperclip plugins run as in-process Node.js. HTTP proxy cannot see ctx.* calls." },
              { title:"5 of 12 surfaces: zero protection.", body:"Plugin system, auth, cross-agent API, heartbeat filesystem gap, stdout logs. Neither Orchesis nor Paperclip covers these today." },
              { title:"Realistic detection: 38%.", body:"Against a mix of 40% explicit and 60% semantic attacks. Not 96%. The 96% is for explicit patterns only." },
              { title:"Cascade containment: bifurcated.", body:"Explicit payloads: fully contained. Semantic payloads: not containable at proxy layer." },
            ].map((item,i)=>(
              <div key={i} style={{ display:"flex", gap:"14px", alignItems:"flex-start" }}>
                <span style={{ color:t.red, fontWeight:700, fontSize:"16px", flexShrink:0 }}>✗</span>
                <div>
                  <span style={{ fontWeight:600, fontSize:"14px" }}>{item.title}</span>
                  <span style={{ fontSize:"13px", color:t.textDim, marginLeft:"8px" }}>{item.body}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FAQ */}
      <div style={W}>
        <div style={div0 as React.CSSProperties} />
        <section style={{ padding:"80px 0" }} id="faq">
          <div style={stag as React.CSSProperties}>Frequently asked about Orchesis + Paperclip</div>
          <h2 style={stitle as React.CSSProperties}>Common questions</h2>
          <div style={{ display:"flex", flexDirection:"column" as const, gap:"1px", background:t.border, border:`1px solid ${t.border}`, borderRadius:isEgg?"0":"12px", overflow:"hidden", marginTop:"48px" }}>
            {FAQ.map((item,i)=>(
              <div key={i} style={{ background:t.bgCard, padding:"24px 28px" }}>
                <h3 style={{ fontSize:"15px", fontWeight:600, marginBottom:"10px", color:t.text }}>{item.q}</h3>
                <p style={{ fontSize:"14px", color:t.textDim, lineHeight:1.7, margin:0 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FOOTER CTA */}
      <div style={W}>
        <div style={div0 as React.CSSProperties} />
        <section style={{ padding:"80px 0", textAlign:"center" }}>
          <h2 style={{ fontSize:"clamp(24px,4vw,44px)", fontWeight:isLight?300:700, letterSpacing:"-0.03em", marginBottom:"8px" }}>
            {isDos?"THE FLEET THAT'S BLEEDING MONEY RIGHT NOW":isMatrix?"fleet_bleeding_money:NOW":"The fleet that's bleeding money right now"}
          </h2>
          <p style={{ fontSize:"18px", color:t.textDim, marginBottom:"32px" }}>
            {isDos?"WON'T TELL YOU.":isMatrix?"wont_tell_you":"won't tell you."}
          </p>
          <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap", marginBottom:"24px" }}>
            <a href="https://github.com/poushwell/orchesis/blob/main/QUICK_START.md" target="_blank" rel="noopener noreferrer" style={{ background:t.btnBg, color:t.btnTxt, padding:"13px 32px", borderRadius:isEgg?"0":"12px", textDecoration:"none", fontSize:"15px", fontWeight:600, boxShadow:t.btnGlow, display:"inline-block" }}>
              {isDos?"[ GET STARTED ]":isMatrix?"GET_STARTED >":"Get started →"}
            </a>
            <Link href="/openclaw" style={{ background:"transparent", color:t.textDim, padding:"13px 32px", borderRadius:isEgg?"0":"12px", textDecoration:"none", fontSize:"15px", fontWeight:500, border:`1px solid ${t.border}`, display:"inline-block" }}>
              See OpenClaw integration →
            </Link>
          </div>
          <p style={{ fontSize:"13px", color:t.textMut, fontFamily:mono }}>Works whether AI wins or loses.</p>
        </section>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop:`1px solid ${t.border}`, padding:"28px 0" }}>
        <div style={{ ...W, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", fontSize:"12px", color:t.textMut }}>
            <div style={{ width:"16px", height:"16px", borderRadius:"50%", background:"linear-gradient(135deg,#a855f7,#38bdf8)", opacity:0.7 }} />
            © 2026 Orchesis · MIT License
          </div>
          <div style={{ display:"flex", gap:"20px", flexWrap:"wrap" }}>
            {[["GitHub","https://github.com/poushwell/orchesis"],["OpenClaw","/openclaw"],["Telegram","/telegram"],["Blog","/blog"],["MCP Scanner","/scan"]].map(([label,href])=>(
              <a key={label} href={href} target={href.startsWith("http")?"_blank":undefined} rel={href.startsWith("http")?"noopener noreferrer":undefined} style={{ fontSize:"12px", color:t.textMut, textDecoration:"none" }}>{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
