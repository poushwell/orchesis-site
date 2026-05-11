import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Agent Security Scanner — 100+ Free Checks | Orchesis",
  description:
    "Scan AI agent configs for vulnerabilities. 100+ checks for MCP, Claude Code, Cursor, OpenClaw. Browser-only, no data sent. OWASP MCP Top 10 mapped. Free, open source.",
  alternates: { canonical: "https://orchesis.ai/scan" },
  openGraph: {
    type: "website",
    title: "AI Agent Security Scanner — 100+ Free Checks | Orchesis",
    description:
      "100+ security checks for AI agent configs. Browser-only. Free.",
    url: "https://orchesis.ai/scan",
    siteName: "Orchesis",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Agent Security Scanner — 100+ Free Checks | Orchesis",
    description:
      "Scan for exposed API keys, MCP misconfigurations, prompt injection risks. Free, browser-only.",
  },
};

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Orchesis AI Agent Security Scanner",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Any (browser-based)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList:
    "100+ security checks, MCP scanning, Claude Code scanning, Cursor scanning, OWASP MCP Top 10 mapping",
  url: "https://orchesis.ai/scan",
};

export default function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      {children}
    </>
  );
}
