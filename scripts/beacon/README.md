# Beacon lab — scripts

Experiment: can we get AI answer-engines (ChatGPT/Perplexity/Gemini/Claude) to **cite**
our pages on agent-security terms? Everything here is on branch `beacon-lab`.
Rollback point: tag `pre-beacon-baseline` (`git reset --hard pre-beacon-baseline`).

## Setup
1. Put your key in `.env.local` (gitignored — stays local):
   ```
   PPLX_API_KEY=pplx-xxxxxxxx
   ```
   (Perplexity Sonar — its API actually browses + cites. Needs a funded balance.)
2. Node 18+ (has global fetch). Load env: on Windows PowerShell
   `$env:PPLX_API_KEY = (Select-String -Path .env.local -Pattern 'PPLX_API_KEY=(.+)').Matches.Groups[1].Value`
   or just export it in the shell.

## Run (Phase 0)
```
# Component 0 — map who ALREADY gets cited + find vacuum openings
node scripts/beacon/citation-graph.mjs        # writes citation-graph.json

# self-probe — check if orchesis.ai is cited on our target queries (baseline = ~0)
node scripts/beacon/self-probe.mjs
```

## What each file does
- `probe.mjs` — shared: ask Perplexity, return answer + citations.
- `citation-graph.mjs` — **Component 0**: mine existing citations → competitive map + vacuum candidates (this tells us which terms to build pages for; also gives ground-truth to calibrate the local scorer).
- `self-probe.mjs` — did an engine cite us / echo the canary token.
- `queries.txt` — target agent-security queries (edit freely).

## Pages
- `public/lab/*.html` — static beacon pages. **NOT linked from site nav** — discoverable only by crawlers via `public/sitemap-lab.xml`. A human on the homepage cannot click to them.
- `middleware.ts` (repo root) — logs AI-bot visits to `/lab/*` (see Vercel logs, grep `AI-BOT`).

## Next (after Phase 0 signal)
Component B (local reranker scorer, Qwen3-Reranker on the 5070 Ti) → H1 gate (local score ↔ real citation, ρ>0.5) → GEPA optimization loop → factory (on a throwaway domain, not the main site).
