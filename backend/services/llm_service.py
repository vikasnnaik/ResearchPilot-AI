"""
ResearchPilot AI - LLM Service
Integrates OpenAI and OpenAI-compatible LLMs using LangChain.
Supports OpenAI, Google Gemini (via OpenAI-compatible endpoint), Groq, OpenRouter, and local Ollama.
"""

import os
from typing import Optional, Any
from langchain_openai import ChatOpenAI


def get_llm(temperature: float = 0.2, model: Optional[str] = None) -> ChatOpenAI:
    """
    Returns an initialized ChatOpenAI instance.
    Auto-detects:
    1. Standard OpenAI (OPENAI_API_KEY)
    2. Google Gemini via OpenAI-compat (GEMINI_API_KEY or key starting with AIza)
    3. Groq / OpenRouter / Custom OpenAI-compatible endpoints via OPENAI_API_BASE
    """
    api_key = (
        os.getenv("OPENAI_API_KEY", "").strip()
        or os.getenv("GEMINI_API_KEY", "").strip()
        or os.getenv("GROQ_API_KEY", "").strip()
    )

    if not api_key:
        raise ValueError(
            "No LLM API key configured. Please set OPENAI_API_KEY (or GEMINI_API_KEY / GROQ_API_KEY) in backend/.env."
        )

    base_url = os.getenv("OPENAI_API_BASE", "").strip() or None
    default_model = os.getenv("OPENAI_MODEL", "").strip()

    # Auto-detection for Google Gemini keys
    if (os.getenv("GEMINI_API_KEY") or api_key.startswith("AIzaSy")) and not base_url:
        base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"
        if not default_model:
            default_model = "gemini-1.5-flash"

    # Auto-detection for Groq keys
    if (os.getenv("GROQ_API_KEY") or api_key.startswith("gsk_")) and not base_url:
        base_url = "https://api.groq.com/openai/v1"
        if not default_model:
            default_model = "llama-3.3-70b-versatile"

    model_name = model or default_model or "gpt-4o-mini"

    return ChatOpenAI(
        model=model_name,
        temperature=temperature,
        api_key=api_key,
        base_url=base_url,
        timeout=30,
        max_retries=1,
    )


def is_llm_configured() -> bool:
    """Checks whether any supported LLM API key is configured."""
    return bool(
        os.getenv("OPENAI_API_KEY", "").strip()
        or os.getenv("GEMINI_API_KEY", "").strip()
        or os.getenv("GROQ_API_KEY", "").strip()
    )
