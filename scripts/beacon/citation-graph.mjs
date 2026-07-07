// Component 0 — mine what answer-engines ALREADY cite for our target queries.
// Output (scripts/beacon/citation-graph.json):
//  - topCitedDomains: who currently owns agent-security answers (competitive map)
//  - vacuumCandidates: queries with thin/absent authoritative citation = our openings
//  - perQuery: raw per-query cited domains + whether orchesis.ai already appears (baseline)
// Run: node scripts/beacon/citation-graph.mjs   (env K=repeats-per-query, default 2)
import { askPerplexity, domainOf } from "./probe.mjs";
import { readFileSync, writeFileSync } from "node:fs";

const OURS = "orchesis.ai";
const K = Number(process.env.K || 2); // engines are stochastic → sample K times
const queries = readFileSync(new URL("./queries.txt", import.meta.url), "utf8")
  .split("\n").map((s) => s.trim()).filter((s) => s && !s.startsWith("#"));

const domainFreq = {};
const perQuery = [];

for (const q of queries) {
  const domains = new Set();
  let ours = false;
  for (let k = 0; k < K; k++) {
    try {
      const { citations } = await askPerplexity(q);
      for (const u of citations) {
        const d = domainOf(u);
        domains.add(d);
        domainFreq[d] = (domainFreq[d] || 0) + 1;
        if (d.includes(OURS)) ours = true;
      }
    } catch (e) { console.error(`err "${q}": ${e.message}`); }
  }
  perQuery.push({ query: q, citedDomains: [...domains], citesOurs: ours });
  console.log(`${ours ? "●" : "○"} ${q}  → ${[...domains].slice(0, 5).join(", ")}`);
}

const topDomains = Object.entries(domainFreq).sort((a, b) => b[1] - a[1]).slice(0, 25);
// Vacuum = few distinct citing domains AND we're not already there (thin authority = winnable)
const vacuums = perQuery.filter((p) => p.citedDomains.length <= 3 && !p.citesOurs);

const out = {
  queries: queries.length, K,
  topCitedDomains: topDomains.map(([domain, count]) => ({ domain, count })),
  vacuumCandidates: vacuums.map((v) => v.query),
  perQuery,
};
writeFileSync(new URL("./citation-graph.json", import.meta.url), JSON.stringify(out, null, 2));

console.log(`\n=== TOP CITED DOMAINS (who owns agent-security answers) ===`);
for (const [d, c] of topDomains) console.log(`  ${String(c).padStart(3)}  ${d}`);
console.log(`\n=== VACUUM CANDIDATES (thin citation → our openings): ${vacuums.length} ===`);
vacuums.forEach((v) => console.log("  • " + v.query));
console.log(`\nSaved → scripts/beacon/citation-graph.json`);
