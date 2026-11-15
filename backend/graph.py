"""
ResearchPilot AI - LangGraph Multi-Agent Research Workflow
Assembles and connects the multi-agent graph with iterative conditional research loops:
Planner -> Researcher -> Analyst -> Evaluator -(conditional: gaps & iter <= 3)-> Researcher
                                              -(complete or saturated)-> Verifier -> Reporter -> END
"""

from typing import Dict, Any, Literal
from langgraph.graph import StateGraph, END
from backend.schemas import ResearchWorkflowState
from backend.agents.planner import plan_research
from backend.agents.researcher import execute_research
from backend.agents.analyst import analyze_research
from backend.agents.evaluator import evaluate_research_gaps
from backend.agents.verifier import verify_evidence
from backend.agents.reporter import generate_report


def should_continue_research(state: ResearchWorkflowState) -> Literal["researcher", "verifier"]:
    """
    Conditional edge decision function.
    Guarantees strict termination when iteration limit (max 3) or evidence saturation is reached.
    """
    iteration = state.get("iteration", 1)
    max_iterations = state.get("max_iterations", 3)
    should_continue = state.get("should_continue", False)

    if should_continue and iteration <= max_iterations:
        return "researcher"
    return "verifier"


def build_research_graph():
    """
    Constructs and compiles the multi-agent LangGraph workflow with autonomous looping.
    """
    graph = StateGraph(ResearchWorkflowState)

    # Register workflow nodes
    graph.add_node("planner", plan_research)
    graph.add_node("researcher", execute_research)
    graph.add_node("analyst", analyze_research)
    graph.add_node("evaluator", evaluate_research_gaps)
    graph.add_node("verifier", verify_evidence)
    graph.add_node("reporter", generate_report)

    # Primary entry flow
    graph.set_entry_point("planner")
    graph.add_edge("planner", "researcher")
    graph.add_edge("researcher", "analyst")
    graph.add_edge("analyst", "evaluator")

    # Conditional research loop edge
    graph.add_conditional_edges(
        "evaluator",
        should_continue_research,
        {
            "researcher": "researcher",
            "verifier": "verifier",
        }
    )

    # Synthesis & compilation pipeline
    graph.add_edge("verifier", "reporter")
    graph.add_edge("reporter", END)

    return graph.compile()


# Precompiled graph instance
research_graph = build_research_graph()
