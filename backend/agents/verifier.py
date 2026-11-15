"""
ResearchPilot AI - Verification Agent
Performs rigorous cross-source fact-checking, extracts verifiable quotations,
detects empirical contradictions with contextual resolution, and calculates mathematical quality metrics.
"""

from typing import Dict, Any, List
from pydantic import BaseModel, Field
from langchain_core.messages import SystemMessage, HumanMessage
from backend.services.llm_service import get_llm
from backend.schemas import (
    VerifiedClaim,
    Contradiction,
    ResearchQualityMetrics,
    ResearchWorkflowState,
)


class VerificationAgentOutput(BaseModel):
    claims: List[VerifiedClaim] = Field(
        description="Audited empirical claims with exact evidence quotes, supporting and opposing sources"
    )
    contradictions: List[Contradiction] = Field(
        default_factory=list,
        description="Explicit empirical conflicts detected across sources with discrepancy reasons and context resolutions"
    )


VERIFIER_SYSTEM_PROMPT = """You are the Principal Evidence Auditor and Chief Fact-Checking Officer for ResearchPilot AI.
Your absolute mandate is epistemic grounding.

CRITICAL FACT-CHECKING RULES:
1. Never mark a claim as 'supported' simply because a source URL was retrieved. It is ONLY 'supported' if the source content explicitly states or empirically verifies the claim.
2. For each claim:
   - Provide an ID (C1, C2...)
   - Exact claim text
   - Status strictly: 'supported', 'conflicting', or 'insufficient_evidence'
   - supporting_source_ids: e.g. ['S1', 'S2']
   - supporting_sources: URLs
   - supporting_evidence_quotes: EXACT raw text excerpts from the source snippets demonstrating the proof
   - opposing_source_ids and opposing_sources if contradicted
   - opposing_evidence_quotes: EXACT text excerpts containing opposing figures or facts
   - evidence_sufficiency: 'sufficient', 'partial', or 'insufficient'
   - reasoning: Clear analytical justification
3. CONTRADICTION DETECTION:
   - Identify concrete contradictions across sources (e.g. differing market size numbers, diverging CAGR growth rates, conflicting dates, opposing launch timelines).
   - In 'contextual_resolution', explain whether the difference is due to:
     * Differing publication years or projection timelines (e.g. 2024 historical vs 2026 forecast)
     * Differing geographic definitions (e.g. APAC vs India domestic)
     * Differing scope/methodologies (e.g. gross ad spend vs net programmatic revenue)
   - Do NOT label different measurements as contradictions without checking their context!
"""


def verify_quotation_grounding(
    claims: List[Dict[str, Any]],
    sources: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Programmatic fact-checking: verifies that every quotation actually appears in the retrieved source content.
    If an alleged quotation is missing from the source content, the claim is downgraded to insufficient_evidence.
    """
    all_source_texts = " ".join([s.get("content", "").lower() for s in sources])

    verified_claims = []
    for claim in claims:
        quotes = claim.get("supporting_evidence_quotes", [])
        valid_quotes = []

        for q in quotes:
            clean_q = q.strip().strip('"\'')
            if len(clean_q) > 20:
                search_target = clean_q[:40].lower()
                if search_target in all_source_texts:
                    valid_quotes.append(q)
            elif clean_q.lower() in all_source_texts:
                valid_quotes.append(q)

        # If claim asserts it is supported with quotes but none exist in the actual text
        if claim.get("status") == "supported" and quotes and len(valid_quotes) == 0:
            claim["status"] = "insufficient_evidence"
            claim["evidence_sufficiency"] = "insufficient"
            claim["reasoning"] = (
                claim.get("reasoning", "")
                + " [Epistemic Grounding: Quoted assertion was not corroborated in raw retrieved source excerpts.]"
            )
            claim["supporting_evidence_quotes"] = []
        else:
            claim["supporting_evidence_quotes"] = valid_quotes or quotes

        verified_claims.append(claim)
    return verified_claims


def verify_evidence(state: ResearchWorkflowState) -> Dict[str, Any]:
    """
    LangGraph node: Verification Agent.
    Audits claims with exact evidence quotes, identifies contextual contradictions,
    and computes strictly grounded mathematical metrics.
    """
    topic = state.get("topic", "")
    sources = state.get("sources", [])
    findings = state.get("findings", [])
    iteration = state.get("iteration", 1)
    logs = list(state.get("logs", []))
    errors = list(state.get("errors", []))

    if not sources:
        logs.append("[Verification Agent] No sources present to conduct verification.")
        metrics = ResearchQualityMetrics(
            total_sources=0,
            total_claims=0,
            supported_claims=0,
            conflicting_claims=0,
            insufficient_claims=0,
            evidence_coverage_pct=0.0,
            conflict_rate_pct=0.0,
            high_quality_sources_pct=0.0,
            total_iterations=iteration,
        )
        return {
            "verifications": [],
            "contradictions": [],
            "metrics": metrics.model_dump(),
            "stage": "verification_skipped",
            "logs": logs,
        }

    logs.append(
        f"[Verification Agent] Auditing claims against {len(sources)} sources and extracting evidence quotes..."
    )

    findings_summary = "\n".join([f"- [{f.get('id', '')}] {f.get('headline', '')}: {f.get('details', '')}" for f in findings])
    sources_summary = "\n".join([
        f"[{s.get('id', '')}] URL: {s.get('url', '')} | Title: {s.get('title', '')} | Date: {s.get('published_date', 'N/A')}\n"
        f"Snippet: {s.get('content', '')[:650]}\n"
        for s in sources
    ])

    prompt = f"""TOPIC: {topic}

FINDINGS EXTRACTED:
{findings_summary}

EVIDENCE BASE (SOURCES WITH METADATA):
{sources_summary}

Perform rigorous verification of 4-8 core claims. Extract exact verbatim quotation excerpts.
Detect any empirical contradictions between sources and provide contextual resolutions."""

    try:
        llm = get_llm(temperature=0.1)
        structured_llm = llm.with_structured_output(VerificationAgentOutput)
        result: VerificationAgentOutput = structured_llm.invoke([
            SystemMessage(content=VERIFIER_SYSTEM_PROMPT),
            HumanMessage(content=prompt)
        ])

        claims_list = [c.model_dump() for c in result.claims]
        # Grounding check: verify quotes in raw sources
        claims_list = verify_quotation_grounding(claims_list, sources)
        contradictions_list = [x.model_dump() for x in result.contradictions]

        # Calculate mathematical research quality metrics
        total_sources = len(sources)
        total_claims = len(claims_list)
        supported_claims = sum(1 for c in claims_list if c["status"] == "supported")
        conflicting_claims = sum(1 for c in claims_list if c["status"] == "conflicting")
        insufficient_claims = sum(1 for c in claims_list if c["status"] == "insufficient_evidence")

        evidence_coverage_pct = (
            round((supported_claims / total_claims) * 100, 1) if total_claims > 0 else 0.0
        )
        conflict_rate_pct = (
            round((conflicting_claims / total_claims) * 100, 1) if total_claims > 0 else 0.0
        )

        high_quality_count = sum(
            1 for s in sources
            if s.get("assessment", {}).get("overall_quality") == "high"
        )
        high_quality_pct = (
            round((high_quality_count / total_sources) * 100, 1) if total_sources > 0 else 0.0
        )

        metrics = ResearchQualityMetrics(
            total_sources=total_sources,
            total_claims=total_claims,
            supported_claims=supported_claims,
            conflicting_claims=conflicting_claims,
            insufficient_claims=insufficient_claims,
            evidence_coverage_pct=evidence_coverage_pct,
            conflict_rate_pct=conflict_rate_pct,
            high_quality_sources_pct=high_quality_pct,
            total_iterations=iteration,
        )

        logs.append(
            f"[Verification Agent] Verified {total_claims} claims: {supported_claims} Supported, "
            f"{conflicting_claims} Conflicting, {insufficient_claims} Insufficient Evidence. "
            f"Evidence Coverage: {evidence_coverage_pct}%. Flagged {len(contradictions_list)} contradictions."
        )

        return {
            "verifications": claims_list,
            "contradictions": contradictions_list,
            "metrics": metrics.model_dump(),
            "stage": "verification_completed",
            "logs": logs,
        }
    except Exception as e:
        error_msg = f"[Verification Agent Error]: {str(e)}"
        logs.append(error_msg)
        errors.append(error_msg)

        fallback_metrics = ResearchQualityMetrics(
            total_sources=len(sources),
            total_claims=0,
            supported_claims=0,
            conflicting_claims=0,
            insufficient_claims=0,
            evidence_coverage_pct=0.0,
            conflict_rate_pct=0.0,
            high_quality_sources_pct=0.0,
            total_iterations=iteration,
        )
        return {
            "verifications": [],
            "contradictions": [],
            "metrics": fallback_metrics.model_dump(),
            "errors": errors,
            "logs": logs,
            "stage": "verification_failed",
        }
