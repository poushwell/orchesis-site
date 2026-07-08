#!/usr/bin/env python3
"""
H1 gate — does the LOCAL scorer separate pages engines CITE from pages they DON'T?

This is the null hypothesis of the whole system. If the local score can't tell cited
from non-cited pages, the whole optimization loop is blind — stop and rethink.

Inputs:
  - scripts/beacon/citation-graph.json   (from Component 0 — needs the API key; run that first)
    Positives = URLs the engines actually cited for our target queries.
  - a set of NON-cited candidate URLs (negatives) — we sample from search/competitor pages
    that were NOT cited, provided in negatives.txt (one URL per line) OR passed via --neg file.

Method: fetch each page's HTML -> local scorer.page_score() -> take best-query composite ->
compute AUC + Spearman between local score and cited(1)/not-cited(0). GATE: AUC >= 0.70 / rho >= 0.5.

Run (after Component 0 + a funded key):
  python scripts/beacon/h1.py --neg scripts/beacon/negatives.txt
"""
import json, sys, re
from pathlib import Path
import requests

BEACON = Path(__file__).resolve().parent
sys.path.insert(0, str(BEACON))
from scorer import page_score, Committee, _load_queries  # noqa

def fetch(url):
    try:
        return requests.get(url, timeout=15, headers={"User-Agent": "orchesis-beacon-h1"}).text
    except Exception as e:
        print(f"[skip] {url}: {e}", file=sys.stderr); return None

def main():
    cg_path = BEACON / "citation-graph.json"
    if not cg_path.exists():
        sys.exit("Run Component 0 first: node scripts/beacon/citation-graph.mjs  (needs PPLX_API_KEY)")
    cg = json.loads(cg_path.read_text(encoding="utf-8"))
    # positives: the ACTUAL cited article URLs engines returned (full URLs, not domain roots).
    # Fall back to domain roots only for old graphs that didn't store citedUrls.
    pos, seen = [], set()
    for pq in cg.get("perQuery", []):
        urls = pq.get("citedUrls") or ["https://" + d for d in pq.get("citedDomains", [])]
        for u in urls:
            if u not in seen:
                seen.add(u); pos.append((u, 1))
    neg_file = None
    if "--neg" in sys.argv:
        neg_file = sys.argv[sys.argv.index("--neg") + 1]
    negs = []
    if neg_file and Path(neg_file).exists():
        negs = [(u.strip(), 0) for u in Path(neg_file).read_text(encoding="utf-8").splitlines()
                if u.strip() and not u.startswith("#")]
    samples = pos[:100] + negs
    if not samples:
        sys.exit("No samples. Provide --neg negatives.txt and ensure citation-graph.json has data.")

    # Platform citations (reddit/youtube/arxiv/...) are won by BEING on the platform, not by
    # passage quality — a passage-reranker structurally can't predict them. Our optimization
    # lever applies to the CONTENT slot (vendor/definitional pages), so we report AUC on the
    # full pool AND on the content slot (non-platform positives vs negatives) — the population
    # a page-optimization loop can actually move.
    PLATFORMS = ("reddit.com", "youtube.com", "arxiv.org", "linkedin.com", "facebook.com",
                 "x.com", "twitter.com", "quora.com", "medium.com", "substack.com",
                 "news.ycombinator.com")
    is_platform = lambda u: any(p in u for p in PLATFORMS)

    queries = _load_queries()
    committee = Committee()
    rows = []  # (score, label, is_platform, url)
    for url, label in samples:
        html = fetch(url)
        if not html: continue
        res = page_score(html, queries, committee)
        best = max((s["composite"] for s in res["per_query"].values()), default=0.0)
        plat = bool(label == 1 and is_platform(url))
        rows.append((best, label, plat, url))
        print(f"  {best:.3f}  label={label}{'  [platform]' if plat else ''}  {url}")

    import numpy as np
    from scipy.stats import spearmanr
    def auc(pos_s, neg_s):
        if not len(pos_s) or not len(neg_s): return float("nan")
        return float(np.mean([1.0*(p > n) + 0.5*(p == n) for p in pos_s for n in neg_s]))

    neg_s   = np.array([r[0] for r in rows if r[1] == 0])
    pos_all = np.array([r[0] for r in rows if r[1] == 1])
    pos_ctt = np.array([r[0] for r in rows if r[1] == 1 and not r[2]])  # non-platform positives
    if not len(neg_s) or not len(pos_all):
        sys.exit("Need both cited (1) and non-cited (0) samples to compute separation.")

    xs_all = np.array([r[0] for r in rows]); ys_all = np.array([r[1] for r in rows])
    rho_all, _ = spearmanr(xs_all, ys_all)
    ctt_rows = [r for r in rows if r[1] == 0 or not r[2]]
    rho_ctt, _ = spearmanr([r[0] for r in ctt_rows], [r[1] for r in ctt_rows])
    auc_all, auc_ctt = auc(pos_all, neg_s), auc(pos_ctt, neg_s)

    print(f"\n=== H1 (all citations, mixes platform + content mechanisms) ===")
    print(f"    Spearman rho = {rho_all:.3f} | AUC = {auc_all:.3f}   (n_pos={len(pos_all)}, n_neg={len(neg_s)})")
    print(f"=== H1 (CONTENT slot — the population page-optimization can move) ===")
    print(f"    Spearman rho = {rho_ctt:.3f} | AUC = {auc_ctt:.3f}   (n_pos={len(pos_ctt)}, n_neg={len(neg_s)})")
    passed = (auc_ctt >= 0.70 or rho_ctt >= 0.5)
    print("\nGATE:", "PASS (build the factory)" if passed else "FAIL (local proxy is blind - rethink scorer)")
    print("      [gate is judged on the CONTENT slot; platform citations are an off-page play]")

if __name__ == "__main__":
    main()
