#!/usr/bin/env python3
"""
H1 (per-query, hard negatives) — the honest version of the gate.

The first H1 scored every page best-of-all-queries vs off-topic negatives. That answers
"can the scorer tell an agent-security article from a photosynthesis page" — too easy.

This version asks the real question, per query Q:
  positives = pages engines actually CITED for Q
  hard negatives = pages engines cited for OTHER queries (on-topic, high-quality, but NOT
                   the answer to Q) + the off-topic floor from negatives.txt
  score each candidate against Q SPECIFICALLY (not best-of-24)
  -> per-query AUC, then macro-average across queries.

If the scorer ranks the right page above equally-on-topic distractors for the same query,
the fitness function has real resolving power (not just topic detection). GATE: macro-AUC >= 0.65.

Content slot only (platform citations reddit/youtube are an off-page mechanism, excluded).

Run:
  BEACON_RERANKER=qwen python scripts/beacon/h1_perquery.py
"""
import json, sys
from pathlib import Path
import requests

BEACON = Path(__file__).resolve().parent
sys.path.insert(0, str(BEACON))
from scorer import geo16_score, _passages, _text, Committee  # noqa

PLATFORMS = ("reddit.com", "youtube.com", "arxiv.org", "linkedin.com", "facebook.com",
             "x.com", "twitter.com", "quora.com", "medium.com", "substack.com",
             "news.ycombinator.com")
is_platform = lambda u: any(p in u for p in PLATFORMS)
MAX_HARD_NEG = int(__import__("os").environ.get("MAX_HARD_NEG", "10"))  # per query, for cost

def fetch(url, cache):
    if url in cache: return cache[url]
    try:
        html = requests.get(url, timeout=15, headers={"User-Agent": "orchesis-beacon-h1"}).text
    except Exception as e:
        print(f"[skip] {url}: {e}", file=sys.stderr); html = None
    cache[url] = html
    return html

def prep(html, cache_key, pcache):
    """GEO + passages once per URL (query-independent)."""
    if cache_key in pcache: return pcache[cache_key]
    G, bd = geo16_score(html)
    gates_ok = bd["_gates"].startswith("4")
    passages = _passages(html) or [_text(html)[:1200]]
    pcache[cache_key] = (G, gates_ok, passages)
    return pcache[cache_key]

def composite(committee, query, prepped):
    G, gates_ok, passages = prepped
    r = max((committee.score(query, p) for p in passages), default=0.0)
    comp = 0.5 * r + 0.5 * G
    if not gates_ok: comp *= 0.5
    return comp

def auc(pos, neg):
    if not pos or not neg: return None
    return sum(1.0*(p > n) + 0.5*(p == n) for p in pos for n in neg) / (len(pos)*len(neg))

def main():
    cg = json.loads((BEACON / "citation-graph.json").read_text(encoding="utf-8"))
    per = cg.get("perQuery", [])
    # url -> set(queries that cited it)   (content slot only)
    cited_by = {}
    for pq in per:
        for u in pq.get("citedUrls", []):
            if not is_platform(u):
                cited_by.setdefault(u, set()).add(pq["query"])
    all_urls = list(cited_by)
    soft_neg = [u.strip() for u in (BEACON / "negatives.txt").read_text(encoding="utf-8").splitlines()
                if u.strip() and not u.startswith("#")]

    committee = Committee()
    if not committee.ok(): sys.exit("no reranker; pip install or set BEACON_RERANKER")
    hcache, pcache = {}, {}

    def score_url(url, query):
        html = fetch(url, hcache)
        if not html: return None
        return composite(committee, query, prep(html, url, pcache))

    aucs, rows = [], []
    for pq in per:
        q = pq["query"]
        pos_urls = [u for u in pq.get("citedUrls", []) if not is_platform(u)]
        if not pos_urls: continue
        # hard negatives: cited for OTHER queries, not this one
        hard = [u for u in all_urls if q not in cited_by[u]][:MAX_HARD_NEG]
        pos = [s for u in pos_urls if (s := score_url(u, q)) is not None]
        neg = [s for u in hard + soft_neg if (s := score_url(u, q)) is not None]
        a = auc(pos, neg)
        if a is None: continue
        aucs.append(a)
        rows.append((a, q, len(pos), len(neg)))
        print(f"  AUC {a:.3f}  ({len(pos)}p/{len(neg)}n)  {q}")

    if not aucs: sys.exit("no per-query AUCs computed")
    macro = sum(aucs) / len(aucs)
    print(f"\n=== H1 per-query (hard negatives, content slot) ===")
    print(f"    macro-AUC = {macro:.3f} over {len(aucs)} queries")
    worst = sorted(rows)[:5]
    print("    weakest queries:")
    for a, q, p, n in worst: print(f"      {a:.3f}  {q}")
    print("\nGATE:", "PASS (fitness has resolving power)" if macro >= 0.65 else "MARGINAL/FAIL (scorer only detects topic, not citability)")

if __name__ == "__main__":
    main()
