"""
ResearchPilot AI - FastAPI Backend Server
Provides API endpoints for health monitoring, multi-agent research execution,
and professional PDF dossier compilation.
"""

import os
from typing import Dict, Any
from datetime import datetime, timezone
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

from backend.schemas import ResearchRequest, ResearchResponse
from backend.services.tavily_service import is_tavily_configured
from backend.services.llm_service import is_llm_configured
from backend.services.pdf_generator import build_pdf_report
from backend.graph import research_graph

app = FastAPI(
    title="ResearchPilot AI Backend",
    description="Autonomous multi-agent research intelligence API powered by Tavily and LangGraph.",
    version="2.0.0",
)

# CORS configuration
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    """
    Health check endpoint returning system status and credentials configuration.
    """
    tavily_ok = is_tavily_configured()
    llm_ok = is_llm_configured()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "tavily_search": {
                "configured": tavily_ok,
                "provider": "Tavily Search API",
            },
            "llm": {
                "configured": llm_ok,
                "provider": "OpenAI-Compatible",
                "model": model,
            },
        },
        "ready": tavily_ok and llm_ok,
        "message": (
            "System is fully operational and ready for research."
            if (tavily_ok and llm_ok)
            else "Missing credentials. Please configure TAVILY_API_KEY and OPENAI_API_KEY."
        ),
    }


@app.post("/api/research", response_model=ResearchResponse)
def execute_research_endpoint(request: ResearchRequest):
    """
    Executes the advanced multi-agent research workflow with conditional looping:
    1. Strategic Planning
    2. Deep Web Search with Tavily (Initial Queries)
    3. Factual Evidence Analysis
    4. Information Gap Assessment & Conditional Re-search (Up to 3 iterations)
    5. Cross-Verification & Contradiction Auditing
    6. Final Synthesis & Report Generation
    """
    topic = request.topic.strip()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Research topic cannot be empty.",
        )

    # Check credentials
    missing = []
    if not is_tavily_configured():
        missing.append("TAVILY_API_KEY")
    if not is_llm_configured():
        missing.append("OPENAI_API_KEY")

    if missing:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Required credentials missing: {', '.join(missing)}. "
                "Please configure them in backend/.env before running research."
            ),
        )

    max_iter = min(max(request.max_iterations or 3, 1), 3)

    # Prepare initial LangGraph workflow state
    initial_state = {
        "topic": topic,
        "mode": request.mode or "comprehensive",
        "max_sources": request.max_sources or 12,
        "iteration": 1,
        "max_iterations": max_iter,
        "plan": None,
        "sources": [],
        "findings": [],
        "gaps": [],
        "verifications": [],
        "contradictions": [],
        "metrics": None,
        "final_report": None,
        "queries_executed": [],
        "should_continue": False,
        "stage": "starting",
        "logs": [f"Pipeline started for topic: '{topic}' at {datetime.now(timezone.utc).isoformat()}"],
        "errors": [],
    }

    try:
        final_state = research_graph.invoke(initial_state)

        return ResearchResponse(
            success=len(final_state.get("errors", [])) == 0,
            topic=topic,
            plan=final_state.get("plan"),
            sources=final_state.get("sources", []),
            findings=final_state.get("findings", []),
            verifications=final_state.get("verifications", []),
            contradictions=final_state.get("contradictions", []),
            metrics=final_state.get("metrics"),
            final_report=final_state.get("final_report"),
            iteration_count=final_state.get("iteration", 1),
            gaps=final_state.get("gaps", []),
            logs=final_state.get("logs", []),
            errors=final_state.get("errors") or None,
        )
    except Exception as e:
        err_str = str(e)
        if "429" in err_str or "credits" in err_str or "RateLimit" in err_str:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=(
                    "OpenAI API Quota Exhausted: You have no credits remaining on your account. "
                    "Please add credits at https://platform.openai.com/settings/organization/billing/ "
                    "or configure an alternate provider (Groq / OpenRouter / Gemini) in backend/.env."
                ),
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Research workflow failed: {err_str}",
        )


@app.post("/api/research/pdf")
def export_pdf_endpoint(payload: Dict[str, Any]):
    """
    Generates and returns an executive-grade PDF research dossier from actual research output.
    """
    try:
        pdf_bytes = build_pdf_report(payload)
        topic_slug = "".join([c if c.isalnum() else "_" for c in payload.get("topic", "Research")[:30]])
        filename = f"ResearchPilot_{topic_slug}_{datetime.now().strftime('%Y%m%d')}.pdf"

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF generation failed: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("BACKEND_HOST", "0.0.0.0")
    port = int(os.getenv("BACKEND_PORT", "8000"))
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)
