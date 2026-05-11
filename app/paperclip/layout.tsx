import type { Metadata } from "next";

const BASE = "https://orchesis.ai";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "How does Orchesis integrate with Paperclip?", "acceptedAnswer": { "@type": "Answer", "text": "One environment variable: ANTHROPIC_BASE_URL=http://orchesis:8080/v1. All agent API calls route through Orchesis automatically. Works with Claude Code, Codex, Cursor, and OpenClaw adapters. No code changes in Paperclip or your agents." } },
    { "@type": "Question", "name": "What does Orchesis detect that Paperclip doesn't?", "acceptedAnswer": { "@type": "Answer", "text": "Orchesis detects runaway loops at API call #3 ($0.05 spent), while Paperclip only checks budgets between heartbeats ($55-150 already spent). Orchesis also scans for prompt injection in issue descriptions, tracks real API costs independently of self-reported agent data, and correlates behavior across your entire fleet." } },
    { "@type": "Question", "name": "Is Paperclip secure enough for production use?", "acceptedAnswer": { "@type": "Answer", "text": "Paperclip has 30,000+ stars and zero security documentation. We identified 12 attack surfaces including unsandboxed plugins with full server access, broken approval flows, and zero input sanitization on issue descriptions. Five of these surfaces have no protection from either Paperclip or Orchesis. External monitoring is strongly recommended for production deployments." } },
    { "@type": "Question", "name": "What are the honest limitations of Orchesis with Paperclip?", "acceptedAnswer": { "@type": "Answer", "text": "Orchesis cannot detect semantic injection (natural language attacks disguised as legitimate tasks). Detection rate for realistic attack mixes is 38%. The plugin layer is a complete blind spot at proxy level. Five of twelve Paperclip attack surfaces have zero protection from any tool. We publish these limits because transparency builds better security decisions." } },
    { "@type": "Question", "name": "How much does Orchesis cost?", "acceptedAnswer": { "@type": "Answer", "text": "$0. MIT license. Self-hosted. No telemetry. No account required. The annual value for a Paperclip fleet of 5 agents is $52K-143K in prevented cost overruns and security incidents." } },
  ],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Orchesis for Paperclip",
  "applicationCategory": "SecurityApplication",
  "operatingSystem": "Linux, macOS, Windows",
  "description": "Real-time security and cost monitoring proxy for Paperclip AI fleet orchestration. Detects loops, injection attacks, and cost anomalies at the network layer.",
  "url": `${BASE}/paperclip`,
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "license": "https://opensource.org/licenses/MIT",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE}/` },
    { "@type": "ListItem", "position": 2, "name": "Orchesis for Paperclip", "item": `${BASE}/paperclip` },
  ],
};

export const metadata: Metadata = {
  title: "Orchesis × Paperclip — Security & Cost Monitoring for AI Fleets",
  description: "Paperclip has 30,000 stars and zero security documentation. Orchesis adds real-time cost metering, loop detection, and injection scanning to your Paperclip fleet. One environment variable. $0.05 to catch what costs $150 to miss.",
  keywords: ["Paperclip AI security", "Paperclip monitoring", "AI fleet security", "Paperclip cost tracking", "AI agent orchestration security"],
  alternates: { canonical: `${BASE}/paperclip` },
  openGraph: {
    type: "website",
    title: "Orchesis × Paperclip — Real-Time Security for AI Fleets",
    description: "Paperclip manages your AI company. Orchesis makes sure it doesn't run away. Loop detection at call #3. Real-time cost metering. Zero code changes.",
    url: `${BASE}/paperclip`,
    siteName: "Orchesis",
    images: [{ url: `${BASE}/api/og`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orchesis × Paperclip — Security for AI Fleets",
    description: "Loop detection at call #3. Real-time cost metering. 12 attack surfaces mapped. Free.",
    images: [`${BASE}/api/og`],
  },
};

export default function PaperclipLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
