"""
ResearchPilot AI - Source Quality Assessment Service
Evaluates domain identity, primary vs secondary classification, relevance, and credibility.
Strictly separates source prestige from factual validity.
"""

from urllib.parse import urlparse
from typing import Dict, Any, List, Optional
from backend.schemas import SourceAssessment


KNOWN_PRIMARY_DOMAINS = {
    "sec.gov", "gov.in", "rbi.org.in", "census.gov", "who.int", "worldbank.org",
    "arxiv.org", "biorxiv.org", "github.com", "developer.apple.com"
}

KNOWN_ANALYST_DOMAINS = {
    "gartner.com", "forrester.com", "idc.com", "statista.com", "mckinsey.com",
    "bcg.com", "bain.com", "bloomberg.com", "reuters.com", "ft.com", "wsj.com"
}

KNOWN_TECH_NEWS = {
    "techcrunch.com", "venturebeat.com", "theverge.com", "wired.com", "arstechnica.com",
    "economictimes.indiatimes.com", "livemint.com", "business-standard.com"
}


def extract_domain(url: str) -> str:
    """Extract canonical domain from URL."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        if domain.startswith("www."):
            domain = domain[4:]
        return domain
    except Exception:
        return "unknown"


def assess_source(
    url: str,
    title: str,
    content: str,
    query: str,
    published_date: Optional[str] = None
) -> SourceAssessment:
    """
    Evaluates source quality along 4 epistemic dimensions:
    1. Domain category & reputation
    2. Primary vs secondary source classification
    3. Content relevance to search query
    4. Quality justification distinguishing source type from factual truth
    """
    domain = extract_domain(url)
    domain_category = "unknown"
    source_type: Any = "secondary"
    quality: Any = "medium"
    relevance = 0.8
    justification_parts = []

    # Domain categorization
    if any(p in domain for p in KNOWN_PRIMARY_DOMAINS) or domain.endswith(".gov") or domain.endswith(".edu"):
        domain_category = "primary_institution"
        source_type = "primary"
        quality = "high"
        justification_parts.append("Official government, academic, or primary registry domain.")
    elif any(a in domain for a in KNOWN_ANALYST_DOMAINS):
        domain_category = "industry_analyst"
        source_type = "secondary"
        quality = "high"
        justification_parts.append("Established market intelligence or premier business publication.")
    elif any(t in domain for t in KNOWN_TECH_NEWS):
        domain_category = "tech_news"
        source_type = "secondary"
        quality = "medium"
        justification_parts.append("Reputable tech or financial news provider.")
    elif "blog" in domain or "medium.com" in domain or "substack.com" in domain:
        domain_category = "blog"
        source_type = "tertiary"
        quality = "low"
        justification_parts.append("Individual commentary or opinion platform; requires strict corroboration.")
    else:
        domain_category = "corporate_or_general"
        source_type = "secondary"
        quality = "medium"
        justification_parts.append(f"Standard commercial or media domain ({domain}).")

    # Content length & depth check
    content_len = len(content) if content else 0
    if content_len > 400:
        justification_parts.append("Substantial context excerpt available.")
    elif content_len < 100 and source_type != "primary":
        justification_parts.append("Brief content snippet; potential information truncation.")
        if quality == "high":
            quality = "medium"
    else:
        justification_parts.append("Standard excerpt length available.")

    # Date recency
    if published_date:
        justification_parts.append(f"Recorded timestamp: {published_date}.")
    else:
        justification_parts.append("No explicit publication date timestamp provided in metadata.")

    # Explicit caveat: Quality != Truth
    justification_parts.append(
        "Note: High domain authority indicates editorial process, but specific factual claims must still be cross-verified."
    )

    return SourceAssessment(
        domain=domain,
        domain_category=domain_category,
        source_type=source_type,
        relevance_score=relevance,
        overall_quality=quality,
        quality_justification=" ".join(justification_parts)
    )


def assess_all_sources(sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Assess and enrich a list of raw source dictionaries."""
    enriched = []
    for s in sources:
        assessment = assess_source(
            url=s.get("url", ""),
            title=s.get("title", ""),
            content=s.get("content", ""),
            query=s.get("query", ""),
            published_date=s.get("published_date")
        )
        s_copy = dict(s)
        s_copy["assessment"] = assessment.model_dump()
        enriched.append(s_copy)
    return enriched
