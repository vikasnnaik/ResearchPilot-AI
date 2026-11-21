"""
ResearchPilot AI - Report Agent
Synthesizes the comprehensive, multi-section evidence-grounded final research dossier.
"""

from typing import Dict, Any, List
from langchain_core.messages import SystemMessage, HumanMessage
from backend.services.llm_service import get_llm, invoke_with_retry
from backend.schemas import FinalReport, ResearchWorkflowState


REPORTER_SYSTEM_PROMPT = """You are the Senior Research Editor & Principal Author at ResearchPilot AI.
You synthesize findings, verified evidence, source citations, and methodological notes into an authoritative, publication-ready research intelligence report.

The report must contain:
1. title: An authoritative, executive-level report title.
2. executive_summary: A high-impact 2-3 paragraph strategic briefing summarizing the core conclusions.
3. research_methodology: Narrative describing the research objective, multi-query web search strategy, and evidence cross-examination process.
4. key_findings: A list of 4-8 bulleted key takeaways with precise data points.
5. detailed_analysis: An extensive, deep-dive multi-section breakdown in GitHub-flavored Markdown (e.g. Market Dynamics, Competitive Landscape, Business Models & Unit Economics, Emerging Tech & Architectures, Strategic Recommendations). Include citations like [S1], [S2] referencing the source IDs.
6. conflicting_information: An explicit analysis detailing where sources diverged, contradictory metrics, disputed forecasts, or conflicting market size estimates.
7. limitations: Candor regarding data freshness, geographic or language scope, private market visibility, or unverified claims.
8. sources_and_citations: A structured list of all sources cited with their ID, title, URL, and brief context snippet.
"""


def generate_report(state: ResearchWorkflowState) -> Dict[str, Any]:
    """
    LangGraph node: Report Agent.
    Generates the final comprehensive intelligence dossier.
    """
    topic = state.get("topic", "")
    plan = state.get("plan", {})
    sources = state.get("sources", [])
    findings = state.get("findings", [])
    verifications = state.get("verifications", [])
    logs = list(state.get("logs", []))
    errors = list(state.get("errors", []))

    logs.append(f"[Report Agent] Compiling final intelligence dossier for topic: '{topic}'...")

    # Build context for report generation
    sources_summary = "\n".join([
        f"[{s.get('id', '')}] {s.get('title', '')} | URL: {s.get('url', '')}\nSnippet: {s.get('content', '')[:500]}"
        for s in sources
    ])

    findings_summary = "\n".join([
        f"- [{f.get('id', '')} - {f.get('category', '')}] {f.get('headline', '')}: {f.get('details', '')} (Sources: {', '.join(f.get('source_urls', []))})"
        for f in findings
    ])

    verifications_summary = "\n".join([
        f"- Status: {v.get('status', '').upper()} | Claim: {v.get('claim', '')}\n  Reasoning: {v.get('reasoning', '')}\n  Supporting: {', '.join(v.get('supporting_sources', []))}\n  Opposing: {', '.join(v.get('opposing_sources', []))}"
        for v in verifications
    ])

    user_prompt = f"""TOPIC: {topic}
METHODOLOGY PLAN:
{plan.get('methodology_summary', 'Multi-agent iterative research')}

KEY FINDINGS:
{findings_summary}

VERIFIED CLAIMS AND CONFLICT AUDIT:
{verifications_summary}

RETRIEVED SOURCES:
{sources_summary}

Generate the comprehensive FinalReport with all required sections."""

    try:
        llm = get_llm(temperature=0.2)
        structured_llm = llm.with_structured_output(FinalReport)
        report: FinalReport = invoke_with_retry(
            structured_llm,
            [
                SystemMessage(content=REPORTER_SYSTEM_PROMPT),
                HumanMessage(content=user_prompt)
            ],
            max_retries=5,
            base_delay=3.5
        )

        report_dict = report.model_dump()
        logs.append(f"[Report Agent] Successfully generated final report: '{report.title}' with {len(report.key_findings)} key findings.")

        return {
            "final_report": report_dict,
            "stage": "completed",
            "logs": logs,
        }
    except Exception as e:
        error_msg = f"[Report Agent Error]: {str(e)}"
        logs.append(error_msg)
        errors.append(error_msg)
        return {
            "final_report": None,
            "errors": errors,
            "logs": logs,
            "stage": "reporting_failed"
        }
