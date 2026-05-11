import type { Metadata } from "next";
import BlogIndexClient from "./BlogIndexClient";

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "Orchesis Blog",
  "description": "AI agent security research and analysis",
  "url": "https://orchesis.ai/blog",
  "publisher": { "@type": "Organization", "name": "Orchesis", "url": "https://orchesis.ai" },
};

export const metadata: Metadata = {
  title: "AI Agent Security Blog",
  description: "Original research on AI agent security. MCP vulnerabilities, real incident analysis, impossibility proofs. Based on 4,549 tests and 67 Paperclip issues analyzed.",
  alternates: { canonical: "https://orchesis.ai/blog" },
  openGraph: {
    type: "website",
    title: "AI Agent Security Blog | Orchesis",
    description: "Original research on AI agent security. MCP vulnerabilities, real incident analysis, impossibility proofs.",
    url: "https://orchesis.ai/blog",
    siteName: "Orchesis",
    images: [{ url: "https://orchesis.ai/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Agent Security Blog | Orchesis",
    description: "Original research on AI agent security. MCP vulnerabilities, real incident analysis, impossibility proofs.",
    images: ["https://orchesis.ai/og-image.png"],
  },
};

export default function Blog() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <BlogIndexClient />
    </>
  );
}
