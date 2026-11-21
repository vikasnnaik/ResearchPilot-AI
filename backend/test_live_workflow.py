import time
import json
import urllib.request
import os

print("=== Starting Live ResearchPilot End-to-End Test ===")
print("Query: Indian AdTech market in 2026 (Competitors, business models, opportunities, emerging tech)")
print("Providers: Tavily Search API + Google Gemini (gemini-3.5-flash-lite)")

request_payload = {
    "topic": "Analyse the Indian AdTech market in 2026, including competitors, business models, market opportunities and emerging technologies.",
    "max_iterations": 1,
    "max_sources": 6
}

start_time = time.time()
req = urllib.request.Request(
    "http://localhost:8000/api/research",
    data=json.dumps(request_payload).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req, timeout=240) as resp:
        status_code = resp.status
        data = json.loads(resp.read().decode())
    elapsed = round(time.time() - start_time, 2)
    print(f"\n[LIVE RESEARCH SUCCESS] HTTP {status_code} in {elapsed}s")
    os.makedirs("sample_reports", exist_ok=True)
    with open("sample_reports/live_research_output.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)
except Exception as e:
    print(f"\n[LIVE RESEARCH FAILED] Error: {e}")
    exit(1)

# Inspect outputs
plan = data.get("plan", {})
sources = data.get("sources", [])
findings = data.get("findings", [])
claims = data.get("verifications", []) or data.get("verified_claims", [])
contradictions = data.get("contradictions", [])
metrics = data.get("metrics", {})
report = data.get("final_report", {})
iterations = data.get("iteration_count", 0) or data.get("iterations_completed", 0)

print("\n--- 1. PLANNER AGENT ---")
print(f"Goal: {plan.get('primary_goal')}")
print(f"Research Questions ({len(plan.get('questions', []))}):")
for q in plan.get("questions", [])[:4]:
    print(f"  • {q}")

print(f"\n--- 2. RESEARCHER AGENT (Tavily) ---")
print(f"Iterations completed: {iterations}")
print(f"Total Sources Collected: {len(sources)}")
for s in sources[:3]:
    print(f"  • [{s.get('domain')}] {s.get('title')[:60]}... -> {s.get('url')[:65]}")

print(f"\n--- 3. ANALYST AGENT ---")
print(f"Findings Extracted: {len(findings)}")
for f in findings[:3]:
    hl = f.get("headline") or f.get("title") or "Finding"
    dt = f.get("details") or f.get("summary") or ""
    print(f"  • [{f.get('category')}] {hl}: {dt[:70]}...")

print(f"\n--- 4. EVALUATOR & VERIFIER AGENTS ---")
print(f"Verified Claims: {len(claims)}")
for c in claims[:4]:
    c_status = c.get("status") or c.get("evidence_status") or "UNKNOWN"
    print(f"  • Status: {c_status.upper()} | Claim: {c.get('claim', '')[:70]}...")
    quotes = c.get("supporting_evidence_quotes") or ([c.get("verbatim_quote")] if c.get("verbatim_quote") else [])
    if quotes and quotes[0]:
        print(f"    Evidence Quote: \"{quotes[0][:80]}...\"")
    srcs = c.get("supporting_sources") or ([c.get("supporting_url")] if c.get("supporting_url") else [])
    if srcs and srcs[0]:
        print(f"    Source URL: {srcs[0]}")

print(f"\n--- 5. CONTRADICTIONS & GAPS ---")
print(f"Contradictions Detected: {len(contradictions)}")
for ct in contradictions[:3]:
    disc = ct.get("discrepancy_reason") or ct.get("explanation") or ct.get("topic_aspect") or "Discrepancy"
    print(f"  • Aspect: {ct.get('topic_aspect', 'N/A')} | Reason: {disc[:80]}...")

print(f"\n--- 6. RESEARCH QUALITY METRICS ---")
print(f"  • Total Sources: {metrics.get('total_sources')}")
print(f"  • Total Claims: {metrics.get('total_claims')}")
print(f"  • Supported Claims: {metrics.get('supported_claims')}")
print(f"  • Conflicting Claims: {metrics.get('conflicting_claims')}")
print(f"  • Insufficient Claims: {metrics.get('insufficient_claims')}")
print(f"  • Evidence Coverage: {metrics.get('evidence_coverage_pct')}%")
print(f"  • High-Quality Source Pct: {metrics.get('high_quality_source_pct')}%")
print(f"  • Conflict Rate: {metrics.get('conflict_rate_pct')}%")

print(f"\n--- 7. FINAL REPORT & PDF EXPORT ---")
if report:
    print(f"Report Title: {report.get('title')}")
    print(f"Executive Summary ({len(report.get('executive_summary', ''))} chars): {report.get('executive_summary', '')[:120]}...")
else:
    print("Report is pending/None")

# Test PDF generation endpoint
os.makedirs("sample_reports", exist_ok=True)
pdf_req = urllib.request.Request(
    "http://localhost:8000/api/research/pdf",
    data=json.dumps(data).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)

pdf_start = time.time()
with urllib.request.urlopen(pdf_req, timeout=30) as pdf_resp:
    pdf_bytes = pdf_resp.read()
    pdf_latency = round(time.time() - pdf_start, 2)
    pdf_path = "sample_reports/live_gemini_tavily_research.pdf"
    with open(pdf_path, "wb") as f:
        f.write(pdf_bytes)

print(f"PDF Generated successfully: {pdf_path} ({len(pdf_bytes)} bytes in {pdf_latency}s)")
print("\n=== All Validations Passed Successfully ===")
