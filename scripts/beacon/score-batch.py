#!/usr/bin/env python3
"""Score new beacon pages against their target queries (QA gate) with the reranker
loaded once. Usage: BEACON_RERANKER=qwen python scripts/beacon/score-batch.py"""
import sys
from pathlib import Path
BEACON = Path(__file__).resolve().parent
sys.path.insert(0, str(BEACON))
from scorer import page_score, Committee  # noqa

LAB = BEACON.parent.parent / "public" / "lab"
PAIRS = [
    ("malicious-mcp-server.html",   "what is a malicious MCP server"),
    ("mcp-confused-deputy.html",    "what is a confused deputy attack in agentic AI"),
    ("agent-sandbox-escape.html",   "what is agent sandbox escape"),
    ("agent-data-exfiltration.html","what is data exfiltration through AI agents"),
    ("mcp-line-jumping.html",       "what is line jumping in MCP"),
    ("agent-impersonation.html",    "what is agent impersonation"),
]
committee = Committee()
print(f"reranker: {[n for n,_ in committee.models]}\n")
worst = 1.0
for fname, q in PAIRS:
    html = (LAB / fname).read_text(encoding="utf-8")
    res = page_score(html, [q], committee)
    s = res["per_query"][q]
    gb = res["geo_breakdown"]
    flag = "OK" if s["composite"] >= 0.9 else ("WEAK" if s["composite"] >= 0.75 else "FAIL")
    worst = min(worst, s["composite"])
    print(f"  {s['composite']:.3f}  [{flag}]  GEO {gb['_G']} ({gb['_gates']})  rerank {s['reranker']}  {fname}")
    print(f"          → {q}")
print(f"\nweakest new page: {worst:.3f}  (gate: all >= 0.90 to ship as-is)")
