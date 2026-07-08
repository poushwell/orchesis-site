#!/usr/bin/env python3
"""
Component B — local citability scorer (the fitness function).

No API needed. Runs on your GPU (or CPU for bge-reranker).
Combines:
  (1) GEO-16-style deterministic checklist (pure Python, no model) — the causal
      gatekeeper fields research found (BLUF, concrete number, fresh date, evidence)
      plus soft differentiators (JSON-LD, one h1, h2s, FAQ, entity density, length).
  (2) An open-weight reranker committee (P(passage answers query)) — the same class
      of model that sits inside the answer engines. Committee min = anti-Goodhart.

Composite score in [0,1] = the local proxy for "will this get cited".

Usage:
  python scorer.py public/lab/mcp-tool-poisoning.html "what is MCP tool poisoning"
  python scorer.py --scan          # score every public/lab/*.html vs queries.txt
  python scorer.py --geo-only ...  # skip the reranker (checklist only, zero deps)
"""
import re, sys, glob, math
from pathlib import Path

BEACON_DIR = Path(__file__).resolve().parent
LAB_DIR = BEACON_DIR.parent.parent / "public" / "lab"

# ---------------- GEO-16-style checklist (deterministic, no model) ----------------
def _text(html: str) -> str:
    t = re.sub(r"<script.*?</script>", " ", html, flags=re.S | re.I)
    t = re.sub(r"<style.*?</style>", " ", t, flags=re.S | re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", t).strip()

def _entity_density(text: str) -> float:
    ents = re.findall(r"\b([A-Z]{2,}|[A-Z][a-z]+(?:[A-Z][a-z]+)+|MCP|CASURA|OWASP)\b", text)
    return len(ents) / max(1, len(text.split()))

def geo16_score(html: str):
    text = _text(html)
    words = text.split()
    first80 = " ".join(words[:80]).lower()
    b = {}
    # gatekeepers (hard — failing any nearly zeroes citation odds)
    b["bluf"]       = bool(re.search(r"\bis\b|\bare\b|\brefers to\b|\bmeans\b", first80))
    b["number"]     = bool(re.search(r"\b\d+(\.\d+)?%?\b", text))
    b["fresh_date"] = bool(re.search(r"(19|20)\d{2}", html)) and (
        bool(re.search(r'datemodified', html, re.I)) or bool(re.search(r"last updated", html, re.I)))
    b["evidence"]   = bool(re.search(r'source|according to|reference|"[^"]{20,}"', text, re.I))
    # differentiators (soft)
    b["json_ld"]      = "application/ld+json" in html
    b["one_h1"]       = html.lower().count("<h1") == 1
    b["has_h2"]       = html.lower().count("<h2") >= 2
    b["faq"]          = ("FAQPage" in html) or ("QAPage" in html)
    b["entity_dense"] = _entity_density(text) >= 0.015
    b["length_ok"]    = 150 <= len(words) <= 2500
    gates = ["bluf", "number", "fresh_date", "evidence"]
    soft  = ["json_ld", "one_h1", "has_h2", "faq", "entity_dense", "length_ok"]
    g_ok, s_ok = sum(b[k] for k in gates), sum(b[k] for k in soft)
    G = (g_ok / len(gates)) * 0.6 + (s_ok / len(soft)) * 0.4
    b["_gates"], b["_soft"], b["_G"] = f"{g_ok}/{len(gates)}", f"{s_ok}/{len(soft)}", round(G, 3)
    return G, b

# ---------------- reranker committee (open-weight) ----------------
class _QwenMember:
    """Qwen3-Reranker (4B/8B) — a causal-LM judge, NOT a CrossEncoder. It reads the logit of
    the 'yes' vs 'no' token given an instruction+query+document prompt. This is the SAME family
    of stronger reranker that sits inside modern answer engines → a better local surrogate."""
    PREFIX = ('<|im_start|>system\nJudge whether the Document meets the requirements based on the '
              'Query and the Instruct provided. Note that the answer can only be "yes" or "no".'
              '<|im_end|>\n<|im_start|>user\n')
    SUFFIX = "<|im_end|>\n<|im_start|>assistant\n<think>\n\n</think>\n\n"
    INSTRUCT = "Given a web search query, judge whether the Document is a relevant, citable answer to it."
    def __init__(self, name):
        import torch
        from transformers import AutoTokenizer, AutoModelForCausalLM
        self.torch = torch
        self.tok = AutoTokenizer.from_pretrained(name, padding_side="left")
        self.cuda = torch.cuda.is_available()
        dtype = torch.float16 if self.cuda else torch.float32
        self.model = AutoModelForCausalLM.from_pretrained(name, torch_dtype=dtype).eval()
        if self.cuda: self.model = self.model.cuda()
        self.no_id = self.tok.convert_tokens_to_ids("no")
        self.yes_id = self.tok.convert_tokens_to_ids("yes")
    def predict_prob(self, query, passage):
        torch = self.torch
        text = self.PREFIX + f"<Instruct>: {self.INSTRUCT}\n<Query>: {query}\n<Document>: {passage}" + self.SUFFIX
        inp = self.tok(text, return_tensors="pt", truncation=True, max_length=2048)
        if self.cuda: inp = {k: v.cuda() for k, v in inp.items()}
        with torch.no_grad():
            last = self.model(**inp).logits[:, -1, :]
            pair = torch.stack([last[:, self.no_id], last[:, self.yes_id]], dim=1)
            return float(torch.softmax(pair, dim=1)[0, 1])  # P(yes) in [0,1]

class _CrossEncoderMember:
    def __init__(self, name):
        from sentence_transformers import CrossEncoder
        self.m = CrossEncoder(name, max_length=512)
    def predict_prob(self, query, passage):
        raw = float(self.m.predict([(query, passage)])[0])
        return 1.0 / (1.0 + math.exp(-raw))  # -> [0,1]

class Committee:
    """One or more open-weight rerankers; committee score = min (anti-Goodhart).
    Select via env BEACON_RERANKER (comma-separated). Examples:
      BEACON_RERANKER=bge                          -> BAAI/bge-reranker-v2-m3 (light, ~600MB)
      BEACON_RERANKER=qwen                         -> Qwen/Qwen3-Reranker-4B (fp16 ~8GB, GPU)
      BEACON_RERANKER=qwen,bge                     -> both, min-aggregated (strongest anti-Goodhart)
    Prefix a spec with 'ce:' or 'qwen:' to pass an explicit HF name."""
    ALIASES = {"bge": "ce:BAAI/bge-reranker-v2-m3",
               "qwen": "qwen:Qwen/Qwen3-Reranker-4B",
               "qwen8": "qwen:Qwen/Qwen3-Reranker-8B"}
    def __init__(self, model_names=None):
        import os
        specs = model_names or os.environ.get("BEACON_RERANKER", "bge").split(",")
        self.models = []
        for s in specs:
            s = self.ALIASES.get(s.strip(), s.strip())
            if not s: continue
            try:
                if s.startswith("qwen:"):
                    self.models.append((s, _QwenMember(s.split(":", 1)[1])))
                else:
                    self.models.append((s, _CrossEncoderMember(s.split(":", 1)[1] if s.startswith("ce:") else s)))
            except Exception as e:
                print(f"[warn] reranker {s} not loaded ({e}); run --geo-only or pip install -r requirements.txt", file=sys.stderr)
    def ok(self): return len(self.models) > 0
    def score(self, query: str, passage: str) -> float:
        vals = [m.predict_prob(query, passage) for _, m in self.models]
        return min(vals) if vals else 0.0  # min = anti-Goodhart

def _passages(html: str):
    """Split page into H2 sections (+ the lead paragraph) as candidate answer-units."""
    parts = re.split(r"(?i)<h2[^>]*>", html)
    return [_text(p)[:1200] for p in parts if _text(p).strip()]

def page_score(html: str, queries, committee: "Committee|None"):
    G, breakdown = geo16_score(html)
    passages = _passages(html) or [_text(html)[:1200]]
    per_q = {}
    for q in queries:
        r = max((committee.score(q, p) for p in passages), default=0.0) if committee and committee.ok() else None
        # composite: 0.5 reranker + 0.5 GEO, hard-capped if a gatekeeper fails
        gates_ok = breakdown["_gates"].startswith(str(len(["bluf","number","fresh_date","evidence"])))
        comp = (0.5 * r + 0.5 * G) if r is not None else G
        if not gates_ok:
            comp *= 0.5
        per_q[q] = {"reranker": None if r is None else round(r, 3), "geo": round(G, 3), "composite": round(comp, 3)}
    return {"geo_breakdown": breakdown, "per_query": per_q}

# ---------------- CLI ----------------
def _load_queries():
    f = BEACON_DIR / "queries.txt"
    return [l.strip() for l in f.read_text(encoding="utf-8").splitlines() if l.strip() and not l.startswith("#")]

if __name__ == "__main__":
    geo_only = "--geo-only" in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    committee = None if geo_only else Committee()
    if "--scan" in sys.argv:
        queries = _load_queries()
        for path in sorted(glob.glob(str(LAB_DIR / "*.html"))):
            html = Path(path).read_text(encoding="utf-8")
            res = page_score(html, queries, committee)
            best = sorted(res["per_query"].items(), key=lambda kv: kv[1]["composite"], reverse=True)[:3]
            print(f"\n{Path(path).name}  GEO {res['geo_breakdown']['_G']} (gates {res['geo_breakdown']['_gates']})")
            for q, s in best:
                print(f"   {s['composite']:.3f}  {q}")
    else:
        page, queries = args[0], (args[1:] or _load_queries())
        html = Path(page).read_text(encoding="utf-8")
        res = page_score(html, queries, committee)
        print("GEO-16:", res["geo_breakdown"])
        for q, s in res["per_query"].items():
            print(f"  {s['composite']:.3f}  (rerank {s['reranker']}, geo {s['geo']})  {q}")
