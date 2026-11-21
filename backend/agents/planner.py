"""
ResearchPilot AI - Planner Agent
Analyzes the research objective and formulates 4-6 high-impact research questions.
"""

from typing import Dict, Any
from langchain_core.messages import SystemMessage, HumanMessage
from backend.services.llm_service import get_llm, invoke_with_retry
from backend.schemas import ResearchPlan, ResearchWorkflowState


PLANNER_SYSTEM_PROMPT = """You are the Senior Research Director for ResearchPilot AI, an autonomous intelligence system.
Your mission is to understand the user's research topic and formulate a rigorous, multi-faceted research plan.

Instructions:
1. Formulate a crisp strategic objective for the research.
2. Break down the core topic into 4 to 6 focused, non-overlapping, high-impact research questions.
3. For each question:
   - Provide a unique ID (e.g., Q1, Q2, Q3...)
   - Phrase the question precisely for web search retrieval
   - Explain the rationale for why this question is critical to investigate
   - Assign a domain category (e.g., Market Size & Growth, Competitive Landscape, Business Models, Emerging Tech & Disruptions, Regulatory & Risk)
4. Provide a brief summary of the research methodology and focus areas.

Ensure questions are objective, search-friendly, and capable of discovering concrete factual data, market statistics, competitor moves, and technological shifts.
"""


def plan_research(state: ResearchWorkflowState) -> Dict[str, Any]:
    """
    LangGraph node: Planner Agent.
    Generates structured research questions and overall methodology.
    """
    topic = state.get("topic", "")
    mode = state.get("mode", "comprehensive")
    logs = list(state.get("logs", []))
    logs.append(f"[Planner Agent] Initiating strategic research breakdown for topic: '{topic}' (Mode: {mode})")

    llm = get_llm(temperature=0.2)

    prompt = f"""Research Topic: {topic}
Research Mode: {mode}

Generate a comprehensive research plan with 4-6 targeted research questions."""

    try:
        # Use LangChain structured output
        structured_llm = llm.with_structured_output(ResearchPlan)
        plan: ResearchPlan = invoke_with_retry(
            structured_llm,
            [
                SystemMessage(content=PLANNER_SYSTEM_PROMPT),
                HumanMessage(content=prompt)
            ],
            max_retries=3,
            base_delay=2.0
        )

        plan_dict = plan.model_dump()
        logs.append(f"[Planner Agent] Generated {len(plan.questions)} targeted research questions.")

        return {
            "plan": plan_dict,
            "stage": "planning_completed",
            "logs": logs,
        }
    except Exception as e:
        error_msg = f"[Planner Agent Error]: {str(e)}"
        logs.append(error_msg)
        errors = list(state.get("errors", []))
        errors.append(error_msg)
        if "429" in str(e) or "credits" in str(e) or "RateLimit" in str(e):
            raise RuntimeError(f"OpenAI API Quota Exhausted: {str(e)}")
        return {
            "errors": errors,
            "logs": logs,
            "stage": "planning_failed"
        }
