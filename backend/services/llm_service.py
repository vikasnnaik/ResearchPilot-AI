"""
ResearchPilot AI - LLM Service
Integrates OpenAI and OpenAI-compatible LLMs using LangChain.
Supports OpenAI, Google Gemini (via OpenAI-compatible endpoint), Groq, OpenRouter, and local Ollama.
"""

import os
from typing import Optional, Any
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv(override=True)
_backend_env = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
if os.path.exists(_backend_env):
    load_dotenv(_backend_env, override=True)


def get_llm(temperature: float = 0.2, model: Optional[str] = None) -> ChatOpenAI:
    """
    Returns an initialized ChatOpenAI instance.
    Auto-detects:
    1. Google Gemini via OpenAI-compat (GEMINI_API_KEY or AQ./AIza key)
    2. Standard OpenAI (OPENAI_API_KEY)
    3. Groq / OpenRouter / Custom OpenAI-compatible endpoints via OPENAI_API_BASE
    """
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    groq_key = os.getenv("GROQ_API_KEY", "").strip()

    base_url = os.getenv("OPENAI_API_BASE", "").strip() or None
    default_model = os.getenv("OPENAI_MODEL", "").strip()

    if gemini_key or (openai_key and (openai_key.startswith("AQ.") or openai_key.startswith("AIza"))):
        api_key = gemini_key or openai_key
        if not base_url:
            base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"
        if not default_model or default_model in ("gpt-4o-mini", "gemini-1.5-flash", "gemini-3.8-flash", "gemini-3.1-flash-lite"):
            default_model = "gemini-3.5-flash-lite"
    elif openai_key:
        api_key = openai_key
    elif groq_key or (openai_key and openai_key.startswith("gsk_")):
        api_key = groq_key or openai_key
        if not base_url:
            base_url = "https://api.groq.com/openai/v1"
        if not default_model:
            default_model = "llama-3.3-70b-versatile"
    else:
        raise ValueError(
            "No LLM API key configured. Please set GEMINI_API_KEY, OPENAI_API_KEY, or GROQ_API_KEY in backend/.env."
        )

    model_name = model or default_model or "gemini-3.5-flash-lite"

    return ChatOpenAI(
        model=model_name,
        temperature=temperature,
        api_key=api_key,
        base_url=base_url,
        timeout=120,
        max_retries=4,
    )


def is_llm_configured() -> bool:
    """Checks whether any supported LLM API key is configured."""
    return bool(
        os.getenv("OPENAI_API_KEY", "").strip()
        or os.getenv("GEMINI_API_KEY", "").strip()
        or os.getenv("GROQ_API_KEY", "").strip()
    )


def invoke_with_retry(runnable: Any, input_data: Any, max_retries: int = 5, base_delay: float = 3.5) -> Any:
    """
    Invokes a LangChain Runnable or Chat model with automated backoff for transient 503 / 429 errors.
    Essential for Google AI Studio / Gemini rate limits.
    """
    import time
    last_err = None
    for attempt in range(1, max_retries + 1):
        try:
            return runnable.invoke(input_data)
        except Exception as e:
            last_err = e
            err_msg = str(e).lower()
            is_transient = "503" in err_msg or "overloaded" in err_msg or "429" in err_msg or "rate" in err_msg or "timeout" in err_msg
            if is_transient and attempt < max_retries:
                sleep_duration = base_delay * attempt
                time.sleep(sleep_duration)
                continue
            raise last_err

