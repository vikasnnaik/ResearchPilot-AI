"""
ResearchPilot AI - Tavily Search Service
Executes web research searches, normalizes source metadata, and deduplicates URLs.
"""

import os
import re
from typing import List, Dict, Any, Optional
from tavily import TavilyClient


def is_tavily_configured() -> bool:
    """Checks whether the Tavily API key is set."""
    return bool(os.getenv("TAVILY_API_KEY", "").strip())


def normalize_url(url: str) -> str:
    """Strip trailing slash and URL tracking fragments for clean deduplication."""
    if not url:
        return ""
    clean = url.strip()
    clean = re.sub(r"[?&]utm_[^&]+", "", clean)
    clean = clean.rstrip("?&/")
    return clean


class TavilySearchService:
    def __init__(self, api_key: Optional[str] = None):
        key = api_key or os.getenv("TAVILY_API_KEY", "").strip()
        if not key:
            raise ValueError(
                "TAVILY_API_KEY is not configured. Please set TAVILY_API_KEY in your environment or .env file."
            )
        self.client = TavilyClient(api_key=key)

    def search_question(
        self,
        query: str,
        max_results: int = 5,
        search_depth: str = "advanced"
    ) -> List[Dict[str, Any]]:
        """
        Executes a single search query against Tavily API.
        """
        try:
            response = self.client.search(
                query=query,
                search_depth=search_depth,
                max_results=max_results,
                include_raw_content=False,
            )
            raw_results = response.get("results", [])
            formatted = []
            for item in raw_results:
                formatted.append({
                    "title": item.get("title", "Untitled Source"),
                    "url": item.get("url", ""),
                    "content": item.get("content", ""),
                    "score": item.get("score"),
                    "published_date": item.get("published_date"),
                    "query": query,
                })
            return formatted
        except Exception as e:
            raise RuntimeError(f"Tavily search failed for query '{query}': {str(e)}")

    def search_batch(
        self,
        queries: List[str],
        max_results_per_query: int = 4,
        max_total_sources: int = 15,
        search_depth: str = "advanced"
    ) -> List[Dict[str, Any]]:
        """
        Executes searches for multiple questions, deduplicating by URL.
        """
        seen_urls = set()
        deduplicated_sources: List[Dict[str, Any]] = []
        source_counter = 1

        for query in queries:
            if len(deduplicated_sources) >= max_total_sources:
                break

            try:
                results = self.search_question(
                    query=query,
                    max_results=max_results_per_query,
                    search_depth=search_depth
                )
            except Exception as e:
                # Log error and continue to other queries so one query failure does not break the entire workflow
                continue

            for res in results:
                raw_url = res.get("url", "")
                norm = normalize_url(raw_url)
                if not norm or norm in seen_urls:
                    continue

                seen_urls.add(norm)
                source_item = {
                    "id": f"S{source_counter}",
                    "title": res.get("title") or "Untitled Source",
                    "url": raw_url,
                    "content": res.get("content") or "",
                    "score": res.get("score"),
                    "published_date": res.get("published_date"),
                    "query": query,
                }
                deduplicated_sources.append(source_item)
                source_counter += 1

                if len(deduplicated_sources) >= max_total_sources:
                    break

        return deduplicated_sources
