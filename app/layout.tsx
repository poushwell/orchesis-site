import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = "https://orchesis.ai";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Orchesis — Open-Source AI Agent Security Proxy | Monitor & Secure LLM API Calls",
    template: "%s | Orchesis",
  },
  description: "Open-source AI agent security proxy. 17-phase detection pipeline, loop detection at call #3, 33+ injection patterns. Works with OpenClaw, Paperclip, Claude Code, Cursor. One config change. MIT license.",
  keywords: [
    "AI agent security", "LLM proxy", "prompt injection detection",
    "AI governance", "MCP security", "AI agent monitoring",
    "runtime gateway", "LLM API security", "OpenClaw security",
    "AI agent runtime gateway", "open source AI security",
  ],
  authors: [{ name: "Orchesis" }],
  creator: "Orchesis",
  publisher: "Orchesis",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Orchesis",
    title: "Orchesis — Open-Source AI Agent Security Proxy",
    description: "See everything your AI agents do. 17-phase security pipeline. Loop detection, injection scanning, cost control. One config change. MIT license.",
    url: BASE_URL,
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Orchesis — Open-Source AI Agent Security Proxy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orchesis — Open-Source AI Agent Security Proxy",
    description: "Open-source HTTP proxy for AI agent security. Detect prompt injection, enforce governance, monitor LLM API traffic.",
    images: ["/api/og"],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Orchesis",
  "url": BASE_URL,
  "logo": `${BASE_URL}/images/logo.png`,
  "description": "Orchesis is an open-source HTTP proxy that secures traffic between AI agents and LLM APIs.",
  "sameAs": [
    "https://github.com/poushwell/orchesis",
  ],
  "foundingDate": "2025",
  "knowsAbout": ["AI agent security", "LLM security", "prompt injection detection", "MCP security", "AI governance"],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Orchesis",
  "applicationCategory": "SecurityApplication",
  "operatingSystem": "Linux, macOS, Windows",
  "description": "Open-source AI agent security proxy. 17-phase detection pipeline for prompt injection, cost anomalies, and behavioral drift. Transparent HTTP proxy between AI agents and LLM APIs. Zero code changes required.",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "license": "https://opensource.org/licenses/MIT",
  "url": BASE_URL,
  "downloadUrl": "https://pypi.org/project/orchesis/",
  "softwareVersion": "0.4.0",
  "featureList": [
    "HTTP proxy between AI agents and LLM APIs",
    "Real-time prompt injection detection",
    "AI agent governance policy enforcement",
    "Complete audit logging of all LLM API calls",
    "MCP protocol security scanning",
    "OpenClaw integration",
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
