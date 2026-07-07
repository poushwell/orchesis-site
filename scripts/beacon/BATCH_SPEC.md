# Fleet batch spec — factory phase (3090 fleet + Strix Halo 128 GB)

Headless, self-contained job for the FACTORY phase (Components C generate + D optimize).
**Run only AFTER H1 passes** (Phase 0). Before that, this fleet sits idle by design —
we prove the foundation cheaply first, then unleash the batch.

## Hardware roles
| Box | Role | Models |
|---|---|---|
| **Strix Halo (128 GB unified)** | COLD loop: high-quality generation | Qwen3-32B / 70B-quant or MoE (fits in 128 GB) as content generator |
| **3090 fleet (24 GB each)** | HOT loop: scoring + evolution | reranker committee: `Qwen3-Reranker-8B` (fp16, 1 card) + `bge-reranker-v2-m3` + `RankZephyr`; parallel batch-scoring |
| **5070 Ti (12 GB)** | dev / light scoring | `bge-reranker-v2-m3` for quick local checks |

Split rationale: generation is COLD (few big calls) → the one big model on Strix Halo;
scoring is HOT (thousands of variants) → parallel across the 3090s. Zero API on the hot path.

## Pipeline (one batch)
1. **Query map** — `citation-graph.json` (Component 0) → vacuum terms → fan-out sub-queries
   (local generator, patent 8-type taxonomy) → HDBSCAN clusters → submodular coverage set.
2. **Generate** (Strix Halo) — for each cluster: IF-GEO "diverge-then-converge" answer-units,
   `XGrammar` constrained decoding forcing gatekeeper slots (BLUF / number / date / cite / entities).
3. **Anti-slop gate** — GEO-16 (scorer.py) + fact-check (OpenFActScore) + dedup (MinHash→SemDeDup).
   Only PASS pages continue.
4. **Score** (3090 fleet) — reranker committee (min aggregation, anti-Goodhart) over each page × its fan-out queries.
5. **Evolve** (GEPA / OpenEvolve) — N generations, reward = composite citability proxy (scorer.py) +
   gatekeeper-compliance + FActScore; keep Pareto elites (MAP-Elites cells = per-engine formats).
6. **Emit** — static HTML → `public/lab/` (or throwaway domain) + `sitemap` + IndexNow ping.
7. **Calibrate** — periodic self-probe (needs key) recalibrates the local proxy → real citation.

## How to run headless (skeleton — fill when we build C/D)
```
# on Strix Halo (generator server)
python -m vllm.entrypoints.openai.api_server --model <qwen3-generator> --port 8001

# on a 3090 box (scorer server)
python scripts/beacon/serve_scorer.py --models Qwen/Qwen3-Reranker-8B,BAAI/bge-reranker-v2-m3 --port 8002

# controller (any box) — reads query map, runs generate→gate→score→evolve→emit
python scripts/beacon/factory.py --gen http://strix:8001 --score http://gpu0:8002 --out public/lab --n 2000
```
`serve_scorer.py` and `factory.py` are built in Phase 2 (after H1). This spec pins the
model choices, box roles, and data flow so the batch is drop-in when we get there.

## Guardrails
- Factory output goes to a **throwaway domain**, not the main orchesis.ai brand (scaled-content risk).
- Quality-per-page is the multiplier (each page a unique fact) — NOT page count.
- Keep a real self-probe loop so the local proxy never drifts from actual citations (Goodhart).
