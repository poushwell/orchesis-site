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

    queries = _load_queries()
    committee = Committee()
    xs, ys = [], []
    for url, label in samples:
        html = fetch(url)
        if not html: continue
        res = page_score(html, queries, committee)
        best = max((s["composite"] for s in res["per_query"].values()), default=0.0)
        xs.append(best); ys.append(label)
        print(f"  {best:.3f}  label={label}  {url}")

    if len(set(ys)) < 2:
        sys.exit("Need both cited (1) and non-cited (0) samples to compute separation.")
    from scipy.stats import spearmanr
    import numpy as np
    rho, _ = spearmanr(xs, ys)
    # simple AUC
    xs, ys = np.array(xs), np.array(ys)
    pos_s, neg_s = xs[ys == 1], xs[ys == 0]
    auc = np.mean([1.0*(p > n) + 0.5*(p == n) for p in pos_s for n in neg_s])
    print(f"\n=== H1: Spearman rho = {rho:.3f} | AUC = {auc:.3f} ===")
    print("GATE:", "PASS ✅ (build the factory)" if (auc >= 0.70 or rho >= 0.5) else "FAIL ❌ (local proxy is blind — rethink scorer)")

if __name__ == "__main__":
    main()
