"""
ResearchPilot AI - Gap Evaluator Agent
Identifies missing information, evaluates evidence saturation,
and formulates follow-up queries for iterative research looping.
"""

from typing import Dict, Any, List
from pydantic import BaseModel, Field
from langchain_core.messages import SystemMessage, HumanMessage
from backend.services.llm_service import get_llm, invoke_with_retry
from backend.schemas import GapAssessmentResult, InformationGap, ResearchWorkflowState


EVALUATOR_SYSTEM_PROMPT = """You are the Lead Epistemic Auditor for ResearchPilot AI.
Your task is to critically assess whether the currently collected evidence is sufficient to thoroughly answer the research questions, or if critical information gaps remain.

Guidelines:
1. Examine the original research plan and the findings gathered so far.
2. Identify any missing empirical data points (e.g. market numbers, specific competitors, regulatory policies, future estimates).
3. If critical gaps remain AND we need more research:
   - Set needs_more_research = True
   - Provide 1 to 3 targeted InformationGap entries with precise, search-engine-ready proposed_search_query strings designed to fill those exact gaps.
4. If the retrieved evidence already provides solid, well-rounded coverage of the core questions:
   - Set needs_more_research = False
   - Provide an empty gaps list or brief gap summary explaining evidence saturation.
"""


def evaluate_research_gaps(state: ResearchWorkflowState) -> Dict[str, Any]:
    """
    LangGraph node: Evaluates whether an additional research iteration is necessary.
    Guarantees hard stopping at max_iterations (default 3) to prevent infinite loops.
    """
    topic = state.get("topic", "")
    iteration = state.get("iteration", 1)
    max_iterations = state.get("max_iterations", 3)
    max_sources = state.get("max_sources", 12)
    sources = state.get("sources", [])
    findings = state.get("findings", [])
    plan = state.get("plan", {})
    logs = list(state.get("logs", []))

    logs.append(
        f"[Gap Evaluator (Iteration {iteration}/{max_iterations})] Assessing evidence completeness and information gaps..."
    )

    # Hard ceiling to strictly prevent infinite looping
    if iteration >= max_iterations:
        logs.append(
            f"[Gap Evaluator] Reached maximum iteration limit ({iteration}/{max_iterations}). Finalizing evidence collection."
        )
        return {
            "should_continue": False,
            "gaps": [],
            "stage": "evaluation_completed_limit_reached",
            "logs": logs,
        }

    # If we already hit or exceeded max target sources
    if len(sources) >= max_sources:
        logs.append(
            f"[Gap Evaluator] Source target saturated ({len(sources)}/{max_sources} sources). Proceeding to verification."
        )
        return {
            "should_continue": False,
            "gaps": [],
            "stage": "evaluation_completed_sources_saturated",
            "logs": logs,
        }

    # Build context for LLM evaluation
    plan_questions = "\n".join([f"- [{q.get('id')}] {q.get('question')}" for q in plan.get("questions", [])])
    findings_summary = "\n".join([f"- [{f.get('id')}] {f.get('headline')}: {f.get('details')[:250]}" for f in findings])

    prompt = f"""TOPIC: {topic}
RESEARCH QUESTIONS:
{plan_questions}

CURRENT SYNTHESIZED FINDINGS:
{findings_summary}

TOTAL SOURCES COLLECTED SO FAR: {len(sources)} (Target: {max_sources})
CURRENT ITERATION: {iteration} of max {max_iterations}

Determine if critical information gaps remain or if evidence is sufficient."""

    try:
        llm = get_llm(temperature=0.1)
        structured_llm = llm.with_structured_output(GapAssessmentResult)
        result: GapAssessmentResult = invoke_with_retry(
            structured_llm,
            [
                SystemMessage(content=EVALUATOR_SYSTEM_PROMPT),
                HumanMessage(content=prompt)
            ],
            max_retries=3,
            base_delay=2.0
        )

        if result.needs_more_research and result.gaps_identified:
            next_iter = iteration + 1
            logs.append(
                f"[Gap Evaluator] Identified {len(result.gaps_identified)} information gaps. "
                f"Triggering research iteration {next_iter}/{max_iterations} with new queries: "
                f"{[g.proposed_search_query for g in result.gaps_identified]}"
            )
            return {
                "iteration": next_iter,
                "should_continue": True,
                "gaps": [g.model_dump() for g in result.gaps_identified],
                "stage": f"gap_detected_iter_{iteration}",
                "logs": logs,
            }
        else:
            logs.append("[Gap Evaluator] Evidence coverage deemed sufficient. Proceeding to verification.")
            return {
                "should_continue": False,
                "gaps": [],
                "stage": "evaluation_completed_sufficient",
                "logs": logs,
            }
    except Exception as e:
        logs.append(f"[Gap Evaluator Notice]: Evaluation fallback ({str(e)}). Proceeding to verification.")
        return {
            "should_continue": False,
            "gaps": [],
            "stage": "evaluation_skipped_on_error",
            "logs": logs,
        }
