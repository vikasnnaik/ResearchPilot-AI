
export interface ResearchQuestion {
  id: string;
  question: string;
  rationale: string;
  category: string;
}

export interface ResearchPlan {
  topic: string;
  objective: string;
  questions: ResearchQuestion[];
  methodology_summary: string;
}

export interface SourceAssessment {
  domain: string;
  domain_category: string;
  source_type: "primary" | "secondary" | "tertiary";
  relevance_score: number;
  overall_quality: "high" | "medium" | "low";
  quality_justification: string;
}

export interface SourceDocument {
  id: string;
  title: string;
  url: string;
  content: string;
  published_date?: string | null;
  score?: number | null;
  query: string;
  assessment?: SourceAssessment | null;
}

export interface Finding {
  id: string;
  category: string;
  headline: string;
  details: string;
  source_urls: string[];
  source_ids?: string[];
}

export interface VerifiedClaim {
  id?: string;
  claim: string;
  status: "supported" | "conflicting" | "insufficient_evidence";
  supporting_sources: string[];
  supporting_source_ids?: string[];
  supporting_evidence_quotes?: string[];
  opposing_sources: string[];
  opposing_source_ids?: string[];
  opposing_evidence_quotes?: string[];
  evidence_sufficiency?: "sufficient" | "partial" | "insufficient";
  reasoning: string;
}

export interface Contradiction {
  id: string;
  topic_aspect: string;
  claim_a: string;
  source_a_id: string;
  source_a_url: string;
  source_a_date?: string | null;
  source_a_quote: string;
  claim_b: string;
  source_b_id: string;
  source_b_url: string;
  source_b_date?: string | null;
  source_b_quote: string;
  discrepancy_reason: string;
  contextual_resolution: string;
}

export interface InformationGap {
  description: string;
  unanswered_question: string;
  missing_evidence_type: string;
  proposed_search_query: string;
}

export interface ResearchQualityMetrics {
  total_sources: number;
  total_claims: number;
  supported_claims: number;
  conflicting_claims: number;
  insufficient_claims: number;
  evidence_coverage_pct: number;
  conflict_rate_pct: number;
  high_quality_sources_pct: number;
  total_iterations: number;
  formula_definitions?: Record<string, string>;
}

export interface FinalReport {
  title: string;
  executive_summary: string;
  research_methodology: string;
  key_findings: string[];
  detailed_analysis: string;
  conflicting_information: string;
  limitations: string;
  sources_and_citations: Array<{
    id?: string;
    title?: string;
    url?: string;
    snippet?: string;
    [key: string]: any;
  }>;
}

export interface ResearchResponse {
  success: boolean;
  topic: string;
  plan?: ResearchPlan | null;
  sources: SourceDocument[];
  findings: Finding[];
  verifications: VerifiedClaim[];
  contradictions: Contradiction[];
  metrics?: ResearchQualityMetrics | null;
  final_report?: FinalReport | null;
  iteration_count?: number;
  gaps?: InformationGap[];
  logs: string[];
  errors?: string[] | null;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  services: {
    tavily_search: {
      configured: boolean;
      provider: string;
    };
    llm: {
      configured: boolean;
      provider: string;
      model: string;
    };
  };
  ready: boolean;
  message: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? `http://${window.location.hostname}:8000`
    : "http://127.0.0.1:8000");

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/api/health`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.statusText}`);
  }
  return res.json();
}

export async function executeResearch(
  topic: string,
  mode: string = "comprehensive",
  max_sources: number = 12,
  max_iterations: number = 3
): Promise<ResearchResponse> {
  const res = await fetch(`${API_BASE}/api/research`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic,
      mode,
      max_sources,
      max_iterations,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const errorDetail = data?.detail || `API error (${res.status}): ${res.statusText}`;
    throw new Error(errorDetail);
  }

  return data;
}

export async function downloadPdfReport(payload: any, filename?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/research/pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`PDF export failed with status ${res.status}`);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "ResearchPilot_Intelligence_Report.pdf";
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
