import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orchesis — AI Agent Control Plane",
  description: "Transparent HTTP proxy for AI agent security, cost optimization, and reliability. 17-phase detection pipeline. Zero dependencies. Zero code changes.",
  keywords: ["AI agent security", "LLM proxy", "AI agent control plane", "prompt injection detection", "AI cost optimization"],
  openGraph: {
    title: "Orchesis — AI Agent Control Plane",
    description: "Transparent HTTP proxy for AI agent security, cost optimization, and reliability.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
