import type { Metadata } from "next";

const BASE = "https://orchesis.ai";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Why is my OpenClaw Telegram bot not receiving messages?", "acceptedAnswer": { "@type": "Answer", "text": "The most common causes are silent webhook failures, VPN disconnection during Telegram long-polling, and Telegram rate limiting after a loop storm. Orchesis monitors all three continuously and sends a Telegram alert with the specific cause within 90 seconds of the drop." } },
    { "@type": "Question", "name": "Does OpenClaw Telegram work with VPN in Russia?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, but VPN instability is the leading cause of silent bot failures. When VPN rotates or reconnects, Telegram long-polling drops without an error visible in OpenClaw logs. Orchesis detects the polling gap and alerts you with a reconnect command before users notice." } },
    { "@type": "Question", "name": "How does Orchesis detect Telegram silent drops?", "acceptedAnswer": { "@type": "Answer", "text": "Orchesis maintains a baseline of expected message delivery rate per channel. When actual delivery falls below baseline for 90 seconds, it sends a Telegram alert with the channel, timestamp, and last successful delivery time. No false positives from normal quiet periods." } },
    { "@type": "Question", "name": "What is the OpenClaw watchdog cascade problem?", "acceptedAnswer": { "@type": "Answer", "text": "When multiple OpenClaw agents share one OAuth profile, a token refresh by one agent invalidates all others. Each agent gets a 401 error, triggers the watchdog, and restarts. All agents restart simultaneously, flooding the LLM API and creating a cost spike. Issue #43178 documents a case with 18 agents and $636/month in waste." } },
    { "@type": "Question", "name": "Does Orchesis work with WhatsApp and Discord too?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Orchesis monitors all traffic between your OpenClaw agent and the LLM API regardless of channel. Telegram, WhatsApp, Discord, and WebChat are all covered by the same proxy. Channel-specific detection patterns apply per channel type." } },
    { "@type": "Question", "name": "What happens if Orchesis goes down?", "acceptedAnswer": { "@type": "Answer", "text": "Your agents fall back to direct API calls automatically. Orchesis is not in the critical path. If the proxy is unavailable, OpenClaw routes directly to the LLM provider. Zero downtime risk to your bot." } },
    { "@type": "Question", "name": "Is Orchesis free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. MIT license. Self-hosted. No telemetry. No vendor lock-in. No usage limits." } },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE}/` },
    { "@type": "ListItem", "position": 2, "name": "Orchesis for OpenClaw Telegram", "item": `${BASE}/telegram` },
  ],
};

export const metadata: Metadata = {
  title: "Orchesis for OpenClaw Telegram Bots — Silent Drop Detection, VPN Fix, Loop Alerts",
  description: "Your OpenClaw Telegram bot went silent and you don't know why. Orchesis detects silent message drops, VPN failures, watchdog cascades, and loop storms — with Telegram alerts before your users notice.",
  keywords: ["OpenClaw Telegram", "Telegram bot silent", "OpenClaw VPN", "Telegram bot monitoring", "OpenClaw loop detection", "AI agent Telegram alerts"],
  alternates: { canonical: `${BASE}/telegram` },
  openGraph: {
    type: "website",
    title: "Orchesis for OpenClaw Telegram — Your Bot Is Silent and You Don't Know",
    description: "Detect silent message drops, VPN failures, and loop storms in your OpenClaw Telegram bot. Open-source. Free. One config line.",
    url: `${BASE}/telegram`,
    siteName: "Orchesis",
    images: [{ url: `${BASE}/api/og`, width: 1200, height: 630, alt: "Orchesis for OpenClaw Telegram — Silent Drop Detection" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orchesis for OpenClaw Telegram — Silent Drop Detection",
    description: "Your bot says running. Messages aren't arriving. Orchesis tells you why.",
    images: [`${BASE}/api/og`],
  },
};

export default function TelegramLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
