"""
ResearchPilot AI - Core Data Schemas & State Models
Advanced Multi-Agent Autonomous Research & Epistemic Verification
"""

from typing import List, Optional, Dict, Any, Literal
from typing_extensions import TypedDict
from pydantic import BaseModel, Field


class ResearchMode(str):
    COMPREHENSIVE = "comprehensive"
    MARKET_INTELLIGENCE = "market_intelligence"
    TECH_DUE_DILIGENCE = "tech_due_diligence"
    QUICK_BRIEF = "quick_brief"


class ResearchQuestion(BaseModel):
    id: str = Field(description="Unique identifier for question, e.g. Q1")
    question: str = Field(description="The specific research question")
    rationale: str = Field(description="Why this question is critical to investigate")
    category: str = Field(description="Domain category, e.g., Competitors, Business Models, Market Size, Tech")


class ResearchPlan(BaseModel):
    topic: str = Field(description="User original research topic")
    objective: str = Field(description="Synthesized strategic objective")
    questions: List[ResearchQuestion] = Field(description="Targeted research questions")
    methodology_summary: str = Field(description="Summary of research methodology and focus areas")


class SourceAssessment(BaseModel):
    domain: str = Field(description="Domain name of the source")
    domain_category: str = Field(description="Category: news, analyst_report, academic, government, corporate, tech_blog")
    source_type: Literal["primary", "secondary", "tertiary"] = Field(
        default="secondary",
        description="Classification: primary (direct data/filing), secondary (news/report), tertiary (aggregator/encyclopedic)"
    )
    relevance_score: float = Field(
        default=0.8,
        ge=0.0,
        le=1.0,
        description="Relevance to research questions (0.0 to 1.0)"
    )
    overall_quality: Literal["high", "medium", "low"] = Field(
        default="medium",
        description="Source credibility and depth assessment"
    )
    quality_justification: str = Field(
        default="",
        description="Justification distinguishing quality from factual correctness"
    )


class SourceDocument(BaseModel):
    id: str = Field(description="Source identifier, e.g. S1")
    title: str = Field(description="Document title")
    url: str = Field(description="Canonical URL of source")
    content: str = Field(description="Relevant excerpt or parsed content")
    published_date: Optional[str] = Field(default=None, description="Publication date if available")
    score: Optional[float] = Field(default=None, description="Relevance score from search engine")
    query: str = Field(description="Search query that surfaced this source")
    assessment: Optional[SourceAssessment] = Field(default=None, description="Quality and domain assessment")


class Finding(BaseModel):
    id: str = Field(description="Finding identifier, e.g. F1")
    category: str = Field(description="Topic category")
    headline: str = Field(description="High-level finding title")
    details: str = Field(description="In-depth factual synthesis")
    source_urls: List[str] = Field(default_factory=list, description="URLs supporting this finding")
    source_ids: List[str] = Field(default_factory=list, description="Source IDs (e.g. S1, S2)")


class VerifiedClaim(BaseModel):
    id: str = Field(default="C1", description="Claim identifier")
    claim: str = Field(description="Specific factual claim examined")
    status: Literal["supported", "conflicting", "insufficient_evidence"] = Field(
        description="Evidence status based on source verification"
    )
    supporting_sources: List[str] = Field(
        default_factory=list,
        description="URLs of sources providing direct evidence"
    )
    supporting_source_ids: List[str] = Field(
        default_factory=list,
        description="IDs of supporting sources (e.g. ['S1', 'S2'])"
    )
    supporting_evidence_quotes: List[str] = Field(
        default_factory=list,
        description="Exact quotations or empirical excerpts from supporting sources"
    )
    opposing_sources: List[str] = Field(
        default_factory=list,
        description="URLs of sources offering contradicting data points"
    )
    opposing_source_ids: List[str] = Field(
        default_factory=list,
        description="IDs of opposing sources"
    )
    opposing_evidence_quotes: List[str] = Field(
        default_factory=list,
        description="Exact quotations or data points contradicting the claim"
    )
    evidence_sufficiency: Literal["sufficient", "partial", "insufficient"] = Field(
        default="sufficient",
        description="Whether the quantity and quality of evidence is sufficient"
    )
    reasoning: str = Field(description="Analytical justification for the verification status")


class Contradiction(BaseModel):
    id: str = Field(description="Contradiction identifier, e.g. X1")
    topic_aspect: str = Field(description="Subject matter of conflict (e.g. 2026 Market Size Valuation)")
    claim_a: str = Field(description="First asserting factual claim")
    source_a_id: str = Field(description="Source ID for claim A")
    source_a_url: str = Field(description="Source URL for claim A")
    source_a_date: Optional[str] = Field(default=None, description="Publication date of Source A")
    source_a_quote: str = Field(description="Exact quote from Source A")
    claim_b: str = Field(description="Second asserting conflicting claim")
    source_b_id: str = Field(description="Source ID for claim B")
    source_b_url: str = Field(description="Source URL for claim B")
    source_b_date: Optional[str] = Field(default=None, description="Publication date of Source B")
    source_b_quote: str = Field(description="Exact quote from Source B")
    discrepancy_reason: str = Field(description="Why the claims conflict (numbers, timelines, scope)")
    contextual_resolution: str = Field(
        description="Whether discrepancy is explained by different dates, currencies, methodologies or definitions"
    )


class InformationGap(BaseModel):
    description: str = Field(description="Description of missing or unverified information")
    unanswered_question: str = Field(description="Specific research question lacking evidence")
    missing_evidence_type: str = Field(description="Type: market_size, competitor_stats, tech_spec, regulation")
    proposed_search_query: str = Field(description="Targeted search query to resolve this gap")


class GapAssessmentResult(BaseModel):
    needs_more_research: bool = Field(description="True if critical information gaps remain")
    gaps_identified: List[InformationGap] = Field(default_factory=list, description="Specific gaps discovered")
    gap_summary: str = Field(description="Narrative assessment of evidence completeness")


class ResearchQualityMetrics(BaseModel):
    total_sources: int = Field(default=0, description="Total unique sources retrieved and deduplicated")
    total_claims: int = Field(default=0, description="Total empirical claims audited")
    supported_claims: int = Field(default=0, description="Claims with direct corroborating evidence")
    conflicting_claims: int = Field(default=0, description="Claims with contradictory evidence across sources")
    insufficient_claims: int = Field(default=0, description="Claims lacking direct evidence")
    evidence_coverage_pct: float = Field(
        default=0.0,
        description="Formula: (supported_claims / total_claims) * 100"
    )
    conflict_rate_pct: float = Field(
        default=0.0,
        description="Formula: (conflicting_claims / total_claims) * 100"
    )
    high_quality_sources_pct: float = Field(
        default=0.0,
        description="Formula: (high_quality_sources / total_sources) * 100"
    )
    total_iterations: int = Field(default=1, description="Number of iterative research cycles executed")
    formula_definitions: Dict[str, str] = Field(
        default_factory=lambda: {
            "evidence_coverage_pct": "round((supported_claims / total_claims) * 100, 1)",
            "conflict_rate_pct": "round((conflicting_claims / total_claims) * 100, 1)",
            "high_quality_sources_pct": "round((high_quality_sources / total_sources) * 100, 1)"
        },
        description="Exact mathematical formulas used to derive metrics"
    )


class FinalReport(BaseModel):
    title: str = Field(description="Formal title of research report")
    executive_summary: str = Field(description="High-level executive briefing")
    research_methodology: str = Field(description="Description of research questions and search approach")
    key_findings: List[str] = Field(description="Numbered or bulleted core takeaways")
    detailed_analysis: str = Field(description="Multi-section in-depth analysis in markdown format")
    conflicting_information: str = Field(
        description="Explicit documentation of contradictory data points, ambiguities, or divergent estimates"
    )
    limitations: str = Field(
        description="Data freshness, missing information, geographic scope limitations"
    )
    sources_and_citations: List[Dict[str, Any]] = Field(
        description="List of all referenced sources with URLs and metadata"
    )


class ResearchRequest(BaseModel):
    topic: str = Field(
        min_length=3,
        max_length=1500,
        description="The research topic or question to explore",
        examples=["Analyse the Indian AdTech market in 2026, including competitors, business models, market opportunities and emerging technologies."]
    )
    mode: Optional[str] = Field(
        default="comprehensive",
        description="Research mode: comprehensive, market_intelligence, tech_due_diligence, quick_brief"
    )
    max_sources: Optional[int] = Field(
        default=12,
        ge=3,
        le=25,
        description="Target maximum unique sources to gather"
    )
    max_iterations: Optional[int] = Field(
        default=3,
        ge=1,
        le=3,
        description="Maximum autonomous research iteration loops (capped at 3)"
    )


class ResearchResponse(BaseModel):
    success: bool
    topic: str
    plan: Optional[ResearchPlan] = None
    sources: List[SourceDocument] = Field(default_factory=list)
    findings: List[Finding] = Field(default_factory=list)
    verifications: List[VerifiedClaim] = Field(default_factory=list)
    contradictions: List[Contradiction] = Field(default_factory=list)
    metrics: Optional[ResearchQualityMetrics] = None
    final_report: Optional[FinalReport] = None
    iteration_count: int = Field(default=1)
    gaps: List[InformationGap] = Field(default_factory=list)
    logs: List[str] = Field(default_factory=list)
    errors: Optional[List[str]] = None


# LangGraph State Definition
class ResearchWorkflowState(TypedDict):
    topic: str
    mode: str
    max_sources: int
    iteration: int
    max_iterations: int
    plan: Optional[Dict[str, Any]]
    sources: List[Dict[str, Any]]
    findings: List[Dict[str, Any]]
    gaps: List[Dict[str, Any]]
    verifications: List[Dict[str, Any]]
    contradictions: List[Dict[str, Any]]
    metrics: Optional[Dict[str, Any]]
    final_report: Optional[Dict[str, Any]]
    queries_executed: List[str]
    should_continue: bool
    stage: str
    logs: List[str]
    errors: List[str]
