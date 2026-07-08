// Shared probe: ask Perplexity Sonar, return answer + citations.
// Auto-loads PPLX_API_KEY from .env.local (repo root) if not already in env.
import { readFileSync } from "node:fs";

function loadKey() {
  if (process.env.PPLX_API_KEY) return process.env.PPLX_API_KEY;
  try {
    const env = readFileSync(new URL("../../.env.local", import.meta.url), "utf8");
    // accept "PPLX_API_KEY=pplx-..." or a bare "pplx-..." line
    const m = env.match(/^\s*PPLX_API_KEY\s*=\s*["']?(pplx-[^\s"']+)/m) || env.match(/^\s*(pplx-[^\s"']+)/m);
    if (m) return m[1];
  } catch { /* no .env.local */ }
  return null;
}
const KEY = loadKey();

export async function askPerplexity(query, model = "sonar") {
  if (!KEY) throw new Error("PPLX_API_KEY not found (add it to .env.local as PPLX_API_KEY=pplx-... or export it)");
  const r = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model, messages: [{ role: "user", content: query }] }),
  });
  if (!r.ok) throw new Error(`PPLX ${r.status}: ${await r.text()}`);
  const j = await r.json();
  const answer = j?.choices?.[0]?.message?.content || "";
  const citations =
    j?.citations ||
    (j?.search_results ? j.search_results.map((s) => s.url) : []) ||
    [];
  return { query, answer, citations, raw: j };
}

export function domainOf(u) {
  try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return String(u); }
}
