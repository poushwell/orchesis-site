// Component 0 — mine what answer-engines ALREADY cite for our target queries.
// Output (scripts/beacon/citation-graph.json):
//  - topCitedDomains: who currently owns agent-security answers (competitive map)
//  - vendorAuthority: same map with ubiquitous PLATFORMS removed (reddit/youtube/arxiv/…)
//    -> reveals which VENDOR domains are emerging as canonical (the real competition)
//  - vacuumCandidates: queries no vendor owns yet (thin vendor authority = our openings)
//  - perQuery: full cited URLs + domains + whether orchesis.ai already appears (baseline)
// Run: node scripts/beacon/citation-graph.mjs   (env K=repeats-per-query, default 2)
import { askPerplexity, domainOf } from "./probe.mjs";
import { readFileSync, writeFileSync } from "node:fs";

const OURS = "orchesis.ai";
const K = Number(process.env.K || 2); // engines are stochastic → sample K times
const QUERIES_FILE = process.env.QUERIES_FILE || "./queries.txt";
const OUT = process.env.OUT || "./citation-graph.json";
// Ubiquitous, non-vendor surfaces Perplexity cites for almost everything. Owning these
// is an off-page/video play, not a "own-the-definition" play — so we score vendor
// authority with them removed to find where NO vendor has claimed the term yet.
const PLATFORMS = new Set([
  "reddit.com", "youtube.com", "arxiv.org", "linkedin.com", "medium.com",
  "github.com", "x.com", "twitter.com", "stackoverflow.com", "quora.com",
  "news.ycombinator.com", "substack.com", "wikipedia.org",
]);
const isPlatform = (d) => PLATFORMS.has(d) || [...PLATFORMS].some((p) => d.endsWith("." + p));

const queries = readFileSync(new URL(QUERIES_FILE, import.meta.url), "utf8")
  .split("\n").map((s) => s.trim()).filter((s) => s && !s.startsWith("#"));

const domainFreq = {};        // all domains
const vendorFreq = {};        // non-platform domains only
const perQuery = [];

for (const q of queries) {
  const domains = new Set();
  const urls = new Set();
  let ours = false;
  for (let k = 0; k < K; k++) {
    try {
      const { citations } = await askPerplexity(q);
      for (const u of citations) {
        urls.add(u);
        const d = domainOf(u);
        domains.add(d);
        domainFreq[d] = (domainFreq[d] || 0) + 1;
        if (!isPlatform(d)) vendorFreq[d] = (vendorFreq[d] || 0) + 1;
        if (d.includes(OURS)) ours = true;
      }
    } catch (e) { console.error(`err "${q}": ${e.message}`); }
  }
  perQuery.push({ query: q, citedUrls: [...urls], citedDomains: [...domains], citesOurs: ours });
  console.log(`${ours ? "●" : "○"} ${q}  → ${[...domains].slice(0, 5).join(", ")}`);
}

const topDomains = Object.entries(domainFreq).sort((a, b) => b[1] - a[1]).slice(0, 25);
const topVendors = Object.entries(vendorFreq).sort((a, b) => b[1] - a[1]).slice(0, 25);

// Vacuum = no VENDOR owns the term: the strongest non-platform domain cited for this
// query is weak (appears <= VAC_MAX times across all queries) and we're not already there.
// Perplexity always fills ~5 slots, so "few citations" never fires — vendor-thinness does.
const VAC_MAX = Number(process.env.VAC_MAX || 2);
const vacuums = perQuery.filter((p) => {
  if (p.citesOurs) return false;
  const vendorHits = p.citedDomains.filter((d) => !isPlatform(d)).map((d) => vendorFreq[d] || 0);
  const strongest = vendorHits.length ? Math.max(...vendorHits) : 0;
  return strongest <= VAC_MAX; // no vendor has claimed this term yet
});

const out = {
  queries: queries.length, K,
  topCitedDomains: topDomains.map(([domain, count]) => ({ domain, count })),
  vendorAuthority: topVendors.map(([domain, count]) => ({ domain, count })),
  vacuumCandidates: vacuums.map((v) => v.query),
  perQuery,
};
writeFileSync(new URL(OUT, import.meta.url), JSON.stringify(out, null, 2));

console.log(`\n=== TOP CITED DOMAINS (all — who owns agent-security answers) ===`);
for (const [d, c] of topDomains) console.log(`  ${String(c).padStart(3)}  ${d}${isPlatform(d) ? "  (platform)" : ""}`);
console.log(`\n=== VENDOR AUTHORITY (platforms removed — the real competition) ===`);
for (const [d, c] of topVendors.slice(0, 15)) console.log(`  ${String(c).padStart(3)}  ${d}`);
console.log(`\n=== VACUUM CANDIDATES (no vendor owns it → our openings): ${vacuums.length} ===`);
vacuums.forEach((v) => console.log("  • " + v.query));
console.log(`\nSaved → scripts/beacon/${OUT.replace(/^\.\//, "")}`);
