// Shared probe: ask Perplexity Sonar, return answer + citations.
// Requires env PPLX_API_KEY (put it in .env.local — it is gitignored).
const KEY = process.env.PPLX_API_KEY;

export async function askPerplexity(query, model = "sonar") {
  if (!KEY) throw new Error("PPLX_API_KEY not set (add it to .env.local or export it)");
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
