"use client";
import Link from "next/link";
import { posts } from "./posts";

export default function BlogIndexClient() {
  return (
    <div style={{ minHeight: "100vh", background: "#0f0f11", color: "#e4e4e7", fontFamily: "'Geist', -apple-system, sans-serif" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #27272a" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 48px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #38bdf8)", opacity: 0.8 }} />
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#e4e4e7" }}>Orchesis</span>
          </Link>
          <Link href="/" style={{ fontSize: "13px", color: "#71717a", textDecoration: "none" }}>← Back</Link>
        </div>
      </nav>

      {/* Header */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "64px 48px 48px" }}>
        <p style={{ fontSize: "11px", color: "#3f3f46", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>From the blog</p>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.15, margin: "0 0 12px" }}>What we've learned</h1>
        <p style={{ fontSize: "16px", color: "#71717a", margin: 0 }}>Security, cost, and architecture insights from building AI infrastructure.</p>
      </div>

      {/* Articles */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 48px 100px" }}>
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} style={{ display: "block", textDecoration: "none", padding: "32px 0", borderTop: "1px solid #27272a", transition: "all 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).querySelector("h2")!.style.color = "#fff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).querySelector("h2")!.style.color = "#e4e4e7"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <span style={{ padding: "3px 10px", borderRadius: "100px", background: `${post.tagColor}14`, border: `1px solid ${post.tagColor}33`, fontSize: "11px", fontWeight: 700, color: post.tagColor, letterSpacing: "0.08em" }}>{post.tag}</span>
              <span style={{ fontSize: "13px", color: "#3f3f46" }}>{post.date}</span>
              <span style={{ fontSize: "13px", color: "#3f3f46" }}>·</span>
              <span style={{ fontSize: "13px", color: "#3f3f46" }}>{post.readTime}</span>
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.03em", color: "#e4e4e7", margin: "0 0 10px", lineHeight: 1.3, transition: "color 0.2s" }}>{post.title}</h2>
            <p style={{ fontSize: "15px", color: "#71717a", margin: "0 0 16px", lineHeight: 1.6 }}>{post.description}</p>
            <span style={{ fontSize: "13px", color: "#a855f7" }}>Read article →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
