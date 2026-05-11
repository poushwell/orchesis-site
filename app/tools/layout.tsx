import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Agent Security Tools | Orchesis",
  description:
    "Free browser-based tools for AI agent security: MCP scanner, security scorecard, cost calculator, OWASP MCP guide, glossary, and CVE tracker. No signup required.",
  alternates: { canonical: "https://orchesis.ai/tools" },
  openGraph: {
    type: "website",
    title: "Free AI Agent Security Tools | Orchesis",
    description:
      "Free browser-based AI agent security tools. MCP scanner, scorecard, cost calculator, OWASP guide. No signup.",
    url: "https://orchesis.ai/tools",
    siteName: "Orchesis",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Agent Security Tools | Orchesis",
    description:
      "Free browser-based AI agent security tools. No signup required.",
  },
};

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Orchesis Free AI Agent Security Tools",
  description:
    "Free browser-based tools for AI agent security: MCP scanner, security scorecard, cost calculator, OWASP MCP guide, glossary, and CVE tracker.",
  url: "https://orchesis.ai/tools",
  publisher: {
    "@type": "Organization",
    name: "Orchesis",
    url: "https://orchesis.ai",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What tools does Orchesis offer for free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "MCP security scanner (100+ checks), security scorecard, AI agent cost calculator, OWASP MCP Top 10 reference guide, security glossary, CVE tracker, and attack pattern database. All free, no signup.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to create an account?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. All tools run in your browser. No signup, no data collection, no tracking.",
      },
    },
    {
      "@type": "Question",
      name: "Are these tools open source?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. All tools are part of the Orchesis open source project, MIT license.",
      },
    },
  ],
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
