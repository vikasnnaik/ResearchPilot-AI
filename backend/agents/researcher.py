"""
ResearchPilot AI - Research Agent
Executes web research searches using Tavily API, retrieves content, normalizes sources,
and enriches each source with epistemic quality assessment.
"""

from typing import Dict, Any, List
from backend.services.tavily_service import TavilySearchService
from backend.services.source_evaluator import assess_all_sources
from backend.schemas import ResearchWorkflowState


def execute_research(state: ResearchWorkflowState) -> Dict[str, Any]:
    """
    LangGraph node: Research Agent.
    Searches web for active questions/gaps, deduplicates, and collects source documents.
    Supports both initial queries and iterative gap-directed queries.
    """
    plan = state.get("plan")
    topic = state.get("topic", "")
    max_sources = state.get("max_sources", 12)
    iteration = state.get("iteration", 1)
    existing_sources = list(state.get("sources", []))
    queries_executed = list(state.get("queries_executed", []))
    gaps = state.get("gaps", [])
    logs = list(state.get("logs", []))
    errors = list(state.get("errors", []))

    # Determine queries to execute in this iteration
    if iteration > 1 and gaps:
        # Use targeted gap queries
        queries = [g.get("proposed_search_query") for g in gaps if g.get("proposed_search_query")]
        logs.append(
            f"[Research Agent (Iteration {iteration})] Executing {len(queries)} gap-filling search queries..."
        )
    else:
        if not plan or not plan.get("questions"):
            queries = [topic, f"{topic} market overview", f"{topic} trends and competitors"]
            logs.append(
                f"[Research Agent (Iteration {iteration})] Notice: No structured questions in plan. Using topic queries."
            )
        else:
            queries = [q["question"] for q in plan["questions"]]
        logs.append(
            f"[Research Agent (Iteration {iteration})] Querying Tavily across {len(queries)} research questions..."
        )

    try:
        tavily_service = TavilySearchService()
        new_sources = tavily_service.search_batch(
            queries=queries,
            max_results_per_query=3,
            max_total_sources=max_sources,
            search_depth="advanced"
        )

        # Merge with existing sources by URL deduplication
        existing_urls = {s.get("url") for s in existing_sources if s.get("url")}
        combined_sources = list(existing_sources)
        counter = len(combined_sources) + 1

        for src in new_sources:
            if src.get("url") not in existing_urls:
                existing_urls.add(src.get("url"))
                src_copy = dict(src)
                src_copy["id"] = f"S{counter}"
                combined_sources.append(src_copy)
                counter += 1

        # Enrich all sources with quality assessment
        enriched_sources = assess_all_sources(combined_sources)

        queries_executed.extend(queries)
        logs.append(
            f"[Research Agent (Iteration {iteration})] Total canonical sources collected: {len(enriched_sources)}."
        )

        return {
            "sources": enriched_sources,
            "queries_executed": queries_executed,
            "stage": f"research_completed_iter_{iteration}",
            "logs": logs,
        }
    except Exception as e:
        error_msg = f"[Research Agent Error (Iteration {iteration})]: {str(e)}"
        logs.append(error_msg)
        errors.append(error_msg)
        return {
            "sources": existing_sources,
            "errors": errors,
            "logs": logs,
            "stage": "research_failed"
        }
