// self-probe: ask Perplexity our target queries, check if it CITES orchesis.ai
// and whether the canary token was echoed. Run: node scripts/beacon/self-probe.mjs
import { askPerplexity } from "./probe.mjs";
import { readFileSync } from "node:fs";

const CANARY = "ORCHESIS-CANARY-MCPTP-7Q3X9";
const OURS = "orchesis.ai";
const queries = readFileSync(new URL("./queries.txt", import.meta.url), "utf8")
  .split("\n").map((s) => s.trim()).filter((s) => s && !s.startsWith("#"));

let hits = 0;
for (const q of queries) {
  try {
    const { answer, citations } = await askPerplexity(q);
    const blob = answer + " " + citations.join(" ");
    const citesUs = blob.includes(OURS);
    const canary = answer.includes(CANARY);
    if (citesUs) hits++;
    console.log(`\nQ: ${q}\n  cites orchesis.ai: ${citesUs ? "YES ✅" : "no"} | canary: ${canary ? "YES ✅" : "no"}`);
    console.log("  citations:", citations.slice(0, 6).join("  "));
  } catch (e) {
    console.log(`\nQ: ${q}\n  error: ${e.message}`);
  }
}
console.log(`\n=== orchesis.ai cited on ${hits}/${queries.length} target queries ===`);
