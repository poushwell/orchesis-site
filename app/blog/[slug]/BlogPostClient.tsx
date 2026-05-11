"use client";
import Link from "next/link";
import { Post, posts } from "../posts";

function inline(text: string): React.ReactNode {
  const normalized = text.replace(/\\u2014/g, "—").replace(/\u2014/g, "—");
  const parts = normalized.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} style={{ color: "#e4e4e7", fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "4px", padding: "2px 6px", fontSize: "13px", color: "#a855f7", fontFamily: "'JetBrains Mono','SF Mono',monospace" }}>{part.slice(1, -1)}</code>;
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch)
      return <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" style={{ color: "#a855f7", textDecoration: "underline", textUnderlineOffset: "3px" }}>{linkMatch[1]}</a>;
    return part;
  });
}

function renderContent(text: string) {
  const blocks = text.split(/\n\n+/);
  return blocks.map((block, i) => {
    if (block.startsWith("```")) {
      const code = block.replace(/^```\w*\n?/, "").replace(/```$/, "");
      return (
        <pre key={i} style={{ background: "#0d0d0f", border: "1px solid #27272a", borderRadius: "8px", padding: "16px 20px", overflowX: "auto", margin: "24px 0" }}>
          <code style={{ fontSize: "13px", color: "#a1a1aa", fontFamily: "'JetBrains Mono','SF Mono',monospace", lineHeight: 1.7, whiteSpace: "pre" }}>{code}</code>
        </pre>
      );
    }
    if (block.trim() === "---") return <hr key={i} style={{ border: "none", borderTop: "1px solid #27272a", margin: "40px 0" }} />;
    if (block.startsWith("## ")) return <h2 key={i} style={{ fontSize: "22px", fontWeight: 700, color: "#e4e4e7", letterSpacing: "-0.03em", margin: "48px 0 16px", lineHeight: 1.3 }}>{inline(block.slice(3))}</h2>;
    if (block.startsWith("### ")) return <h3 key={i} style={{ fontSize: "17px", fontWeight: 600, color: "#e4e4e7", letterSpacing: "-0.02em", margin: "32px 0 12px", lineHeight: 1.4 }}>{inline(block.slice(4))}</h3>;
    if (block.startsWith("> ")) return (
      <blockquote key={i} style={{ borderLeft: "3px solid #a855f7", paddingLeft: "20px", margin: "24px 0", color: "#71717a", fontStyle: "italic", fontSize: "16px", lineHeight: 1.7 }}>
        {inline(block.slice(2))}
      </blockquote>
    );
    if (block.startsWith("|")) {
      const rows = block.split("\n").filter(r => r.trim() && !r.match(/^\|[-| :]+\|$/));
      const headers = rows[0].split("|").filter(c => c.trim()).map(c => c.trim());
      const body = rows.slice(1);
      return (
        <div key={i} style={{ overflowX: "auto", margin: "24px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead><tr style={{ borderBottom: "1px solid #27272a" }}>
              {headers.map((h, hi) => <th key={hi} style={{ padding: "10px 14px", textAlign: "left", color: "#71717a", fontWeight: 600, fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{inline(h)}</th>)}
            </tr></thead>
            <tbody>{body.map((row, ri) => {
              const cells = row.split("|").filter(c => c.trim() !== undefined && c !== "").map(c => c.trim());
              return <tr key={ri} style={{ borderBottom: "1px solid #1f1f23" }}>{cells.map((cell, ci) => <td key={ci} style={{ padding: "10px 14px", color: "#a1a1aa", verticalAlign: "top" }}>{inline(cell)}</td>)}</tr>;
            })}</tbody>
          </table>
        </div>
      );
    }
    return <p key={i} style={{ fontSize: "16px", color: "#a1a1aa", lineHeight: 1.8, margin: "0 0 20px" }}>{inline(block)}</p>;
  });
}

export default function BlogPostClient({ post }: { post: Post }) {
  const otherPosts = posts.filter(p => p.slug !== post.slug);

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f11", color: "#e4e4e7", fontFamily: "'Geist', -apple-system, sans-serif" }}>
      <style>{`.more-card:hover { border-color: #52525b !important; }`}</style>

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #27272a" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 48px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #38bdf8)", opacity: 0.8 }} />
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#e4e4e7" }}>Orchesis</span>
          </Link>
          <Link href="/blog" style={{ fontSize: "13px", color: "#71717a", textDecoration: "none" }}>← All articles</Link>
        </div>
      </nav>

      {/* Breadcrumb (visible to crawlers, small) */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "12px 48px 0", fontSize: "12px", color: "#3f3f46" }}>
        <Link href="/" style={{ color: "#3f3f46", textDecoration: "none" }}>Home</Link>
        {" / "}
        <Link href="/blog" style={{ color: "#3f3f46", textDecoration: "none" }}>Blog</Link>
        {" / "}
        <span>{post.title.slice(0, 60)}{post.title.length > 60 ? "…" : ""}</span>
      </div>

      {/* Article */}
      <article style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 48px 100px" }}>
        {/* Tag + meta */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          <span style={{ padding: "3px 10px", borderRadius: "100px", background: `${post.tagColor}14`, border: `1px solid ${post.tagColor}33`, fontSize: "11px", fontWeight: 700, color: post.tagColor, letterSpacing: "0.08em" }}>{post.tag}</span>
          <time dateTime={post.date} style={{ fontSize: "13px", color: "#3f3f46" }}>{post.date}</time>
          <span style={{ fontSize: "13px", color: "#3f3f46" }}>·</span>
          <span style={{ fontSize: "13px", color: "#3f3f46" }}>{post.readTime}</span>
          <span style={{ fontSize: "13px", color: "#3f3f46" }}>·</span>
          <Link href="/about" style={{ fontSize: "13px", color: "#3f3f46", textDecoration: "none" }}>Pavel</Link>
        </div>

        {/* Title — H1 */}
        <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.15, margin: "0 0 20px", color: "#e4e4e7" }}>{post.title}</h1>

        {/* Description */}
        <p style={{ fontSize: "18px", color: "#71717a", lineHeight: 1.6, margin: "0 0 48px", paddingBottom: "48px", borderBottom: "1px solid #27272a" }}>{post.description}</p>

        {/* Content */}
        <div>{renderContent(post.content)}</div>

        {/* CTA */}
        <div style={{ marginTop: "64px", padding: "32px", background: "#18181b", border: "1px solid #27272a", borderRadius: "12px", textAlign: "center" }}>
          <p style={{ fontSize: "13px", color: "#3f3f46", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Open source · MIT License</p>
          <h3 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 8px" }}>Try the MCP Scanner</h3>
          <p style={{ fontSize: "14px", color: "#71717a", margin: "0 0 20px" }}>Scan your MCP configuration in seconds. Runs entirely in your browser.</p>
          <a href="https://orchesis.ai/scan" style={{ display: "inline-block", padding: "10px 24px", borderRadius: "8px", background: "linear-gradient(135deg, #a855f7, #7c3aed)", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
            Scan My Config
          </a>
        </div>
      </article>

      {/* More articles */}
      {otherPosts.length > 0 && (
        <section aria-label="More articles" style={{ maxWidth: "760px", margin: "0 auto", padding: "0 48px 80px", borderTop: "1px solid #27272a" }}>
          <p style={{ fontSize: "11px", color: "#3f3f46", letterSpacing: "0.12em", textTransform: "uppercase", margin: "48px 0 24px" }}>More articles</p>
          <div style={{ display: "grid", gridTemplateColumns: otherPosts.length === 1 ? "1fr" : "1fr 1fr", gap: "16px" }}>
            {otherPosts.map(p => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="more-card" style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "10px", padding: "20px", textDecoration: "none", display: "block", transition: "border-color 0.2s" }}>
                <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "100px", background: `${p.tagColor}14`, border: `1px solid ${p.tagColor}33`, fontSize: "10px", fontWeight: 700, color: p.tagColor, letterSpacing: "0.08em", marginBottom: "10px" }}>{p.tag}</span>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#e4e4e7", margin: "0 0 6px", lineHeight: 1.4 }}>{p.title}</h4>
                <p style={{ fontSize: "12px", color: "#52525b", margin: 0 }}>{p.readTime}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
