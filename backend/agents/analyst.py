"""
ResearchPilot AI - Analysis Agent
Extracts core thematic findings, categorizes evidence, and links findings to source URLs.
"""

from typing import Dict, Any, List
from pydantic import BaseModel, Field
from langchain_core.messages import SystemMessage, HumanMessage
from backend.services.llm_service import get_llm, invoke_with_retry
from backend.schemas import Finding, ResearchWorkflowState


class AnalysisResult(BaseModel):
    findings: List[Finding] = Field(description="Structured evidence-based findings extracted from sources")


ANALYST_SYSTEM_PROMPT = """You are the Lead Intelligence Analyst for ResearchPilot AI.
Your role is to deeply analyze retrieved web research documents and synthesize grounded, factual findings.

Guidelines:
1. Extract 4 to 8 high-value factual findings across relevant dimensions (e.g. Market Dynamics, Competitive Landscape, Business Models, Technological Innovations, Regulatory Shifts).
2. For each finding:
   - Provide an ID (F1, F2, F3...)
   - Assign a domain Category
   - Formulate an authoritative Headline
   - Write rich, factual Details highlighting data, metrics, companies, and concrete evidence
   - Populate 'source_urls' ONLY with the exact URLs from the provided sources that support this finding
3. Never invent facts or hallucinate statistics that are not evidenced by the sources.
4. If sources disagree or present different figures, make note of the discrepancy.
"""


def analyze_research(state: ResearchWorkflowState) -> Dict[str, Any]:
    """
    LangGraph node: Analysis Agent.
    Synthesizes findings grounded in retrieved source documents.
    """
    topic = state.get("topic", "")
    sources = state.get("sources", [])
    logs = list(state.get("logs", []))
    errors = list(state.get("errors", []))

    if not sources:
        logs.append("[Analysis Agent] No sources available for analysis.")
        return {
            "findings": [],
            "stage": "analysis_skipped",
            "logs": logs,
        }

    logs.append(f"[Analysis Agent] Synthesizing findings from {len(sources)} verified source documents...")

    # Format source documents for prompt with sensible character limit per source
    sources_text = ""
    for s in sources:
        snippet = (s.get("content", "") or "")[:1200]
        sources_text += f"\n--- SOURCE [{s.get('id', '')}]: {s.get('title', '')} ---\nURL: {s.get('url', '')}\nCONTENT: {snippet}\n"

    user_prompt = f"""Research Topic: {topic}

RETRIEVED SOURCES:
{sources_text}

Perform deep synthesis and produce structured evidence-grounded findings with exact source URLs."""

    try:
        llm = get_llm(temperature=0.2)
        structured_llm = llm.with_structured_output(AnalysisResult)
        result: AnalysisResult = invoke_with_retry(
            structured_llm,
            [
                SystemMessage(content=ANALYST_SYSTEM_PROMPT),
                HumanMessage(content=user_prompt)
            ],
            max_retries=5,
            base_delay=3.5
        )

        findings_dict = [f.model_dump() for f in result.findings]
        logs.append(f"[Analysis Agent] Synthesized {len(findings_dict)} distinct categorized findings.")

        return {
            "findings": findings_dict,
            "stage": "analysis_completed",
            "logs": logs,
        }
    except Exception as e:
        error_msg = f"[Analysis Agent Error]: {str(e)}"
        logs.append(error_msg)
        errors.append(error_msg)
        return {
            "findings": [],
            "errors": errors,
            "logs": logs,
            "stage": "analysis_failed"
        }
