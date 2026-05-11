import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0a0a0a",
          display: "flex",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dot grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Subtle aurora */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "5%",
            width: "50%",
            height: "80%",
            background: "radial-gradient(ellipse at 30% 50%, rgba(168,85,247,0.07) 0%, transparent 60%)",
            filter: "blur(60px)",
          }}
        />

        {/* LEFT HALF */}
        <div
          style={{
            flex: 1,
            padding: "64px 56px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Logo row */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #a855f7, #38bdf8)",
              }}
            />
            <span style={{ fontSize: "28px", fontWeight: 600, color: "#e4e4e7", letterSpacing: "-0.02em" }}>
              Orchesis
            </span>
          </div>

          {/* Main headline */}
          <div style={{ fontSize: "52px", fontWeight: 700, color: "#e4e4e7", lineHeight: 1.1, letterSpacing: "-0.04em", marginBottom: "20px", display: "flex", flexDirection: "column" }}>
            <span>AI Agent</span>
            <span style={{ background: "linear-gradient(135deg, #a855f7 0%, #38bdf8 50%, #fb923c 100%)", backgroundClip: "text", color: "transparent" }}>
              Control Plane
            </span>
          </div>

          {/* Tagline */}
          <div style={{ fontSize: "18px", color: "#71717a", lineHeight: 1.6, marginBottom: "40px", display: "flex", flexDirection: "column" }}>
            <span>Transparent proxy for AI agents.</span>
            <span>Zero code changes. Zero dependencies.</span>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: "24px" }}>
            {[
              { val: "17", label: "phases" },
              { val: "0", label: "dependencies" },
              { val: "MIT", label: "license" },
            ].map((s) => (
              <div key={s.val} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span style={{ fontSize: "26px", fontWeight: 700, color: "#a855f7", letterSpacing: "-0.03em" }}>{s.val}</span>
                <span style={{ fontSize: "12px", color: "#52525b", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: "1px", background: "#27272a", margin: "48px 0", position: "relative", zIndex: 1 }} />

        {/* RIGHT HALF — threat log */}
        <div
          style={{
            flex: 1,
            padding: "64px 52px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Terminal header */}
          <div
            style={{
              background: "#111111",
              border: "1px solid #27272a",
              borderRadius: "12px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Terminal title bar */}
            <div
              style={{
                background: "#18181b",
                borderBottom: "1px solid #27272a",
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#eab308" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ marginLeft: "12px", fontSize: "12px", color: "#52525b", letterSpacing: "0.06em" }}>
                ORCHESIS THREAT LOG
              </span>
              <div style={{ marginLeft: "auto", width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontSize: "11px", color: "#22c55e", letterSpacing: "0.08em" }}>LIVE</span>
            </div>

            {/* Log lines */}
            <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { time: "14:32:01", status: "BLOCKED", event: "prompt_injection", sev: "HIGH", sevColor: "#ef4444" },
                { time: "14:32:04", status: "CACHED", event: "semantic_match", sev: "INFO", sevColor: "#22c55e" },
                { time: "14:32:07", status: "BLOCKED", event: "credential_leak", sev: "CRITICAL", sevColor: "#f97316" },
                { time: "14:32:11", status: "PASS", event: "context_compress", sev: "INFO", sevColor: "#22c55e" },
                { time: "14:32:15", status: "BLOCKED", event: "tool_abuse", sev: "HIGH", sevColor: "#ef4444" },
              ].map((log) => (
                <div key={log.time} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontFamily: "monospace" }}>
                  <span style={{ color: "#3f3f46", minWidth: "64px" }}>{log.time}</span>
                  <span
                    style={{
                      color: log.status === "BLOCKED" ? "#ef4444" : log.status === "CACHED" ? "#22c55e" : "#71717a",
                      fontWeight: 700,
                      minWidth: "64px",
                    }}
                  >
                    {log.status}
                  </span>
                  <span style={{ color: "#71717a", flex: 1 }}>{log.event}</span>
                  <span style={{ color: "#3f3f46", fontSize: "11px" }}>sev=</span>
                  <span style={{ color: log.sevColor, fontSize: "11px", fontWeight: 700 }}>{log.sev}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: orchesis.io */}
        <div
          style={{
            position: "absolute",
            bottom: "28px",
            right: "48px",
            fontSize: "14px",
            color: "#3f3f46",
            letterSpacing: "0.08em",
            zIndex: 1,
          }}
        >
          orchesis.io
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
