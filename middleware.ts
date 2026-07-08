// orchesis.ai — AI-bot traffic logger (Next.js middleware, Edge runtime).
// Logs every request whose User-Agent looks like an AI crawler/answer-engine.
// Logs appear in Vercel → Project → Logs (search "AI-BOT"). Zero external setup.
// Scope: only /lab beacon pages + discovery files (keeps noise down).

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AI_UA = [
  "gptbot", "oai-searchbot", "chatgpt-user",
  "perplexitybot", "perplexity-user",
  "claudebot", "anthropic-ai", "claude-web",
  "google-extended", "googleother",
  "applebot-extended", "amazonbot", "bytespider",
  "ccbot", "cohere-ai", "meta-externalagent", "meta-externalfetcher",
  "diffbot", "youbot", "timpibot", "duckassistbot",
];

export const config = {
  matcher: ["/lab/:path*", "/llms.txt", "/robots.txt", "/sitemap.xml", "/sitemap-lab.xml"],
};

export function middleware(req: NextRequest) {
  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  const hit = AI_UA.find((b) => ua.includes(b));
  if (hit) {
    console.log(
      "AI-BOT " +
        JSON.stringify({
          bot: hit,
          path: req.nextUrl.pathname,
          ip: req.headers.get("x-forwarded-for") || "",
          ref: req.headers.get("referer") || "",
          ua: req.headers.get("user-agent") || "",
          t: new Date().toISOString(),
        })
    );
  }
  return NextResponse.next();
}
