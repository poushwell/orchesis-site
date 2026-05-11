import type { Metadata } from "next";

const BASE = "https://orchesis.ai";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Does Orchesis work with OpenClaw Telegram bots?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Orchesis monitors all traffic between your OpenClaw agent and the LLM API regardless of which channel — Telegram, WhatsApp, Discord, or WebChat — the user message came from. One proxy covers all channels." } },
    { "@type": "Question", "name": "How does Orchesis detect OpenClaw loops?", "acceptedAnswer": { "@type": "Answer", "text": "Orchesis tracks request patterns across 6 loop types: exec tool loops, thinking token escalation, restart cascades, OAuth races, cache recursion, and crystal phase lock-in. It alerts on the pattern, not just the count, catching loops that OpenClaw's built-in loopDetection misses entirely." } },
    { "@type": "Question", "name": "Does Orchesis read my API keys?", "acceptedAnswer": { "@type": "Answer", "text": "No. Orchesis proxies HTTP traffic without extracting or storing API keys. Your keys pass through to the LLM provider unchanged. Orchesis reads request and response payloads for security analysis only." } },
    { "@type": "Question", "name": "What happens if Orchesis goes down?", "acceptedAnswer": { "@type": "Answer", "text": "Your agents fall back to direct API calls automatically. Orchesis is not in the critical path. If the proxy is unavailable, OpenClaw routes directly to the LLM provider. Zero downtime risk." } },
    { "@type": "Question", "name": "Does Orchesis work with Claude, GPT-4, Gemini?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Orchesis proxies any HTTP-based LLM API: Anthropic Claude, OpenAI GPT-4 and o1, Google Gemini, Mistral, and any provider using standard HTTP REST endpoints." } },
    { "@type": "Question", "name": "Is Orchesis free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. MIT license. Self-hosted. No telemetry. No vendor lock-in. No usage limits." } },
    { "@type": "Question", "name": "How is Orchesis different from Portkey or Galileo?", "acceptedAnswer": { "@type": "Answer", "text": "Portkey is a gateway focused on routing and cost optimization. Galileo is an evaluation platform for post-hoc testing. Orchesis is a security proxy that sits inline and detects threats in real time, not after the fact. Orchesis is also fully open source and self-hosted, with no SaaS dependency." } },
  ],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Orchesis",
  "applicationCategory": "SecurityApplication",
  "operatingSystem": "Linux, macOS, Windows",
  "description": "Open-source HTTP proxy for OpenClaw AI agent security. Detects loops, prompt injection, and cost anomalies in real time.",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "license": "https://opensource.org/licenses/MIT",
  "url": `${BASE}/openclaw`,
  "downloadUrl": "https://pypi.org/project/orchesis/",
  "softwareVersion": "0.4.0",
  "featureList": [
    "Loop detection across 6 types (exec, thinking, restart, OAuth, cache, crystal)",
    "18 prompt injection detection patterns",
    "Real-time per-request cost tracking",
    "Crystal phase detection with Ψ_α order parameter",
    "Fleet-wide agent monitoring",
    "OpenClaw config verification (orchesis verify)",
    "Telegram alerts with diagnostic and action commands",
    "One-line OpenClaw integration",
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE}/` },
    { "@type": "ListItem", "position": 2, "name": "Orchesis for OpenClaw", "item": `${BASE}/openclaw` },
  ],
};

export const metadata: Metadata = {
  title: "Orchesis for OpenClaw — AI Agent Security Proxy | Loop Detection, Cost Monitoring, Injection Defense",
  description: "Secure your OpenClaw AI agent with Orchesis — open-source HTTP proxy that detects loops, injection attacks, and cost overruns. One config line, zero code changes. Based on 3,400+ OpenClaw GitHub issues.",
  keywords: ["OpenClaw security", "OpenClaw loop detection", "OpenClaw proxy", "OpenClaw cost monitoring", "AI agent security", "prompt injection OpenClaw", "OpenClaw monitoring"],
  alternates: { canonical: `${BASE}/openclaw` },
  openGraph: {
    type: "website",
    title: "Orchesis for OpenClaw — Secure Your AI Agent in 5 Minutes",
    description: "Open-source proxy that detects loops, injection, and cost overruns in OpenClaw agents. One config line. Zero code changes. Free.",
    url: `${BASE}/openclaw`,
    siteName: "Orchesis",
    images: [{ url: `${BASE}/api/og`, width: 1200, height: 630, alt: "Orchesis for OpenClaw — AI Agent Security Proxy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orchesis for OpenClaw — AI Agent Security Proxy",
    description: "Loop detection, injection defense, cost monitoring. One config line. Open source.",
    images: [`${BASE}/api/og`],
  },
};

export default function OpenClawLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
