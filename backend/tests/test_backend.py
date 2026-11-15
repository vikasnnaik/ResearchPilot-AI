"""
ResearchPilot AI - Comprehensive Test Suite
Tests conditional looping, maximum iteration limits, evidence coverage calculations,
contradiction resolution, source quality evaluation, PDF generation, and API failure handling.
"""

from unittest.mock import patch, MagicMock
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.schemas import (
    ResearchRequest,
    ResearchResponse,
    ResearchPlan,
    ResearchQuestion,
    SourceDocument,
    SourceAssessment,
    Finding,
    VerifiedClaim,
    Contradiction,
    ResearchQualityMetrics,
    FinalReport,
)
from backend.services.tavily_service import normalize_url
from backend.services.source_evaluator import assess_source, assess_all_sources
from backend.services.pdf_generator import build_pdf_report
from backend.graph import should_continue_research
from backend.agents.verifier import verify_quotation_grounding

client = TestClient(app)


def test_health_endpoint():
    """Verify GET /api/health returns 200 and proper health status structure."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "services" in data
    assert "tavily_search" in data["services"]
    assert "llm" in data["services"]
    assert "ready" in data


def test_research_request_validation():
    """Verify input validation rejecting empty topics and bounding max_iterations."""
    response = client.post("/api/research", json={"topic": ""})
    assert response.status_code in [400, 422]

    # Valid schema structure with max_iterations
    req = ResearchRequest(topic="Test topic on AI agents", max_iterations=3)
    assert req.topic == "Test topic on AI agents"
    assert req.max_iterations == 3


def test_research_missing_credentials():
    """Verify that calling /api/research without API keys returns 422 with actionable guidance."""
    with patch("backend.main.is_tavily_configured", return_value=False), \
         patch("backend.main.is_llm_configured", return_value=False):
        response = client.post("/api/research", json={"topic": "Analyze Indian AdTech in 2026"})
        assert response.status_code == 422
        assert "Required credentials missing" in response.json()["detail"]


def test_url_normalization():
    """Verify URL cleaner strips tracking parameters and trailing slashes."""
    url1 = "https://example.com/article/?utm_source=twitter&utm_medium=social"
    assert normalize_url(url1) == "https://example.com/article"

    url2 = "https://example.com/test/"
    assert normalize_url(url2) == "https://example.com/test"


def test_source_quality_assessment():
    """Verify source assessment categorizes primary, secondary, and evaluates quality."""
    # Government/Primary
    res_primary = assess_source(
        url="https://rbi.org.in/reports/bulletin.html",
        title="RBI Bulletin",
        content="Official monetary policy metrics and credit growth data.",
        query="Indian financial growth"
    )
    assert res_primary.source_type == "primary"
    assert res_primary.overall_quality == "high"
    assert "Official government" in res_primary.quality_justification

    # Blog/Opinion
    res_blog = assess_source(
        url="https://techblog.medium.com/my-thoughts-on-adtech",
        title="Personal Blog",
        content="Quick informal overview.",
        query="Adtech trends"
    )
    assert res_blog.source_type == "tertiary"
    assert res_blog.overall_quality == "low"


def test_conditional_research_looping_and_iteration_limit():
    """Verify conditional edge stops at max_iterations (max 3) and loops when gaps remain."""
    # Iteration 1 with gaps: should continue to researcher
    state_continue = {
        "iteration": 2,
        "max_iterations": 3,
        "should_continue": True,
    }
    assert should_continue_research(state_continue) == "researcher"

    # Iteration 3 reached: should proceed to verifier
    state_limit_reached = {
        "iteration": 3,
        "max_iterations": 3,
        "should_continue": False,
    }
    assert should_continue_research(state_limit_reached) == "verifier"

    # Beyond limit: must terminate to verifier
    state_beyond = {
        "iteration": 4,
        "max_iterations": 3,
        "should_continue": True,
    }
    assert should_continue_research(state_beyond) == "verifier"


def test_evidence_coverage_and_quality_metrics_calculation():
    """Verify mathematical definitions of evidence coverage and conflict rates."""
    total_claims = 5
    supported_claims = 3
    conflicting_claims = 1
    insufficient_claims = 1

    coverage_pct = round((supported_claims / total_claims) * 100, 1)
    conflict_pct = round((conflicting_claims / total_claims) * 100, 1)

    assert coverage_pct == 60.0
    assert conflict_pct == 20.0

    metrics = ResearchQualityMetrics(
        total_sources=8,
        total_claims=total_claims,
        supported_claims=supported_claims,
        conflicting_claims=conflicting_claims,
        insufficient_claims=insufficient_claims,
        evidence_coverage_pct=coverage_pct,
        conflict_rate_pct=conflict_pct,
        high_quality_sources_pct=75.0,
        total_iterations=2,
    )
    assert metrics.evidence_coverage_pct == 60.0
    assert "evidence_coverage_pct" in metrics.formula_definitions


def test_pdf_report_generation():
    """Verify that build_pdf_report generates valid PDF binary bytes containing report structure."""
    mock_payload = {
        "topic": "Indian AdTech 2026",
        "final_report": {
            "title": "Comprehensive Intelligence Dossier: Indian AdTech 2026",
            "executive_summary": "The Indian digital advertising market is poised for hyper-growth.",
            "research_methodology": "Multi-agent iterative retrieval via Tavily Search.",
            "key_findings": [
                "Programmatic ad spend projected to hit 60% share.",
                "Connected TV (CTV) advertising growing at 38% CAGR."
            ],
            "detailed_analysis": "### Market Dynamics\nRapid expansion driven by tier-2 and tier-3 mobile internet.",
            "conflicting_information": "Differing valuations between IAMAI and eMarketer.",
            "limitations": "Unlisted AdTech startups offer limited public financial statements.",
            "sources_and_citations": [
                {"id": "S1", "title": "Indian AdTech 2026 Report", "url": "https://example.com/adtech"}
            ]
        },
        "sources": [
            {
                "id": "S1",
                "title": "Indian AdTech 2026 Report",
                "url": "https://example.com/adtech",
                "content": "Ad spend in India reached record levels.",
                "assessment": {"overall_quality": "high", "domain_category": "industry_analyst"}
            }
        ],
        "verifications": [
            {
                "claim": "Programmatic ad spend will reach 60% by 2026",
                "status": "supported",
                "supporting_sources": ["https://example.com/adtech"],
                "supporting_evidence_quotes": ["Programmatic buying is projected to capture 60% of all digital display."],
                "reasoning": "Explicitly confirmed by S1."
            }
        ],
        "contradictions": [
            {
                "id": "X1",
                "topic_aspect": "2026 Total Digital Ad Spend",
                "claim_a": "Ad spend will reach $6.5 Billion",
                "source_a_id": "S1",
                "source_a_url": "https://example.com/adtech",
                "source_a_quote": "Projected at $6.5B in 2026.",
                "claim_b": "Ad spend will reach $8.0 Billion",
                "source_b_id": "S2",
                "source_b_url": "https://example.com/other",
                "source_b_quote": "Estimated to hit $8B by late 2026.",
                "discrepancy_reason": "Diverging TAM definitions (gross vs net)",
                "contextual_resolution": "Source A measures net ad spend; Source B includes agency commission fees."
            }
        ],
        "metrics": {
            "evidence_coverage_pct": 100.0,
            "supported_claims": 1,
            "conflicting_claims": 0,
        }
    }

    pdf_bytes = build_pdf_report(mock_payload)
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF")  # Standard PDF magic header


def test_quotation_grounding_verification():
    """Verify that ungrounded quotations are downgraded to insufficient_evidence."""
    sources = [
        {
            "id": "S1",
            "url": "https://example.com/adtech",
            "content": "The Indian digital advertising market grew by 24% year over year.",
        }
    ]

    claims = [
        {
            "claim": "Indian ad spend grew 24%",
            "status": "supported",
            "supporting_evidence_quotes": ["The Indian digital advertising market grew by 24% year over year."],
            "reasoning": "Direct match."
        },
        {
            "claim": "Indian ad spend will exceed 50 billion dollars tomorrow",
            "status": "supported",
            "supporting_evidence_quotes": ["Total spend will immediately exceed 50 billion dollars tomorrow without delay."],
            "reasoning": "Uncorroborated quote."
        }
    ]

    verified = verify_quotation_grounding(claims, sources)
    assert verified[0]["status"] == "supported"
    assert len(verified[0]["supporting_evidence_quotes"]) == 1

    # Second claim must be downgraded because quote does not exist in source text
    assert verified[1]["status"] == "insufficient_evidence"
    assert "Epistemic Grounding" in verified[1]["reasoning"]


def test_quota_exhausted_error_handling():
    """Verify that OpenAI 429 quota exhaustion is caught and returns HTTP 429."""
    with patch("backend.main.is_tavily_configured", return_value=True), \
         patch("backend.main.is_llm_configured", return_value=True), \
         patch("backend.main.research_graph.invoke", side_effect=Exception("Error code: 429 - You have no credits remaining.")):
        response = client.post("/api/research", json={"topic": "Analyze Indian AdTech"})
        assert response.status_code == 429
        assert "Quota Exhausted" in response.json()["detail"]


def test_pdf_export_api_endpoint():
    """Verify POST /api/research/pdf endpoint returns PDF content type and headers."""
    mock_payload = {
        "topic": "Quantum Computing 2026",
        "final_report": {
            "title": "Quantum Computing Technical Due Diligence",
            "executive_summary": "Quantum computing is entering the NISQ-plus era.",
            "key_findings": ["1000-qubit milestone achieved."],
        },
        "sources": [],
        "verifications": [],
    }

    response = client.post("/api/research/pdf", json=mock_payload)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "attachment; filename=" in response.headers["content-disposition"]
    assert response.content.startswith(b"%PDF")

