"use client";

import React from "react";
import {
  Compass,
  Search,
  Brain,
  Repeat,
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Terminal,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { ResearchPlan, SourceDocument, InformationGap } from "@/lib/api";

interface ExecutionViewProps {
  loading: boolean;
  error: string | null;
  logs: string[];
  plan: ResearchPlan | null;
  sources: SourceDocument[];
  gaps?: InformationGap[];
  iterationCount?: number;
  onRetry: () => void;
}

const STAGES = [
  {
    key: "planner",
    name: "Planner Agent",
    desc: "Deconstructs topic into 4-6 strategic research questions",
    icon: Compass,
    logKeyword: "[Planner Agent]",
  },
  {
    key: "researcher",
    name: "Research Agent",
    desc: "Executes targeted searches via Tavily & deduplicates canonical sources",
    icon: Search,
    logKeyword: "[Research Agent",
  },
  {
    key: "analyst",
    name: "Analysis Agent",
    desc: "Extracts factual data points, trends, and categorized findings",
    icon: Brain,
    logKeyword: "[Analysis Agent]",
  },
  {
    key: "evaluator",
    name: "Gap Evaluator Agent",
    desc: "Audits evidence saturation & formulates follow-up queries (max 3 loops)",
    icon: Repeat,
    logKeyword: "[Gap Evaluator",
  },
  {
    key: "verifier",
    name: "Verification Agent",
    desc: "Audits claims, extracts verbatim quotes & detects empirical conflicts",
    icon: ShieldCheck,
    logKeyword: "[Verification Agent]",
  },
  {
    key: "reporter",
    name: "Report Agent",
    desc: "Synthesizes final publication-grade intelligence dossier with citations",
    icon: FileText,
    logKeyword: "[Report Agent]",
  },
];

export const ExecutionView: React.FC<ExecutionViewProps> = ({
  loading,
  error,
  logs,
  plan,
  sources,
  gaps = [],
  iterationCount = 1,
  onRetry,
}) => {
  const logsText = logs.join(" ");

  const getStageStatus = (stage: typeof STAGES[0], index: number) => {
    const hasLog = logsText.includes(stage.logKeyword);
    const nextStageHasLog =
      index < STAGES.length - 1 && logsText.includes(STAGES[index + 1].logKeyword);

    if (error && hasLog && !nextStageHasLog) {
      return "failed";
    }
    if (nextStageHasLog || (index === STAGES.length - 1 && logsText.includes("Successfully generated final report"))) {
      return "completed";
    }
    if (hasLog && loading) {
      return "active";
    }
    return "pending";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Status Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-3 h-3 rounded-full ${
                error
                  ? "bg-rose-500"
                  : loading
                  ? "bg-indigo-600 animate-ping"
                  : "bg-emerald-500"
              }`}
            />
            <h2 className="text-base font-semibold text-slate-900">
              {error
                ? "Workflow Interrupted"
                : loading
                ? `Autonomous Multi-Agent Workflow in Progress (Cycle ${iterationCount}/3)`
                : "Research Execution Complete"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
              Iteration {iterationCount} of 3 Max
            </span>
            <span className="text-xs font-mono text-slate-400">
              {logs.length} events logged
            </span>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-900">Workflow Execution Error:</p>
                <p className="mt-1 font-mono text-rose-700 break-words">{error}</p>
                {error.includes("Required credentials missing") && (
                  <div className="mt-3 p-3 bg-white/80 rounded-lg border border-rose-200">
                    <p className="font-semibold text-slate-800">To configure credentials:</p>
                    <ol className="list-decimal list-inside mt-1 space-y-1 text-slate-600">
                      <li>Copy <code className="bg-slate-100 px-1 py-0.5 rounded">backend/.env.example</code> to <code className="bg-slate-100 px-1 py-0.5 rounded">backend/.env</code></li>
                      <li>Add your valid <code className="text-indigo-600 font-bold">TAVILY_API_KEY</code> and <code className="text-indigo-600 font-bold">OPENAI_API_KEY</code></li>
                      <li>Retry the workflow execution below.</li>
                    </ol>
                  </div>
                )}
                {(error.includes("Quota Exhausted") || error.includes("credits") || error.includes("429")) && (
                  <div className="mt-3 p-3.5 bg-amber-50/90 rounded-lg border border-amber-300 text-amber-900">
                    <p className="font-bold flex items-center gap-1.5 text-amber-950">
                      <span>LLM Provider Quota Exhausted (HTTP 429)</span>
                    </p>
                    <p className="mt-1 text-slate-700">
                      Your configured OpenAI API key currently has <b>$0 credits remaining</b>.
                    </p>
                    <div className="mt-2 text-slate-700 space-y-1 text-[11px]">
                      <div>
                        <b>Option 1:</b> Add prepaid credits at{" "}
                        <a
                          href="https://platform.openai.com/settings/organization/billing/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-700 font-semibold underline"
                        >
                          platform.openai.com/settings/organization/billing
                        </a>
                      </div>
                      <div>
                        <b>Option 2:</b> Add a free Google Gemini API key or Groq API key in{" "}
                        <code className="bg-white px-1 py-0.5 rounded border border-amber-300">backend/.env</code>:
                        <div className="mt-1 font-mono text-[10px] bg-white p-2 rounded border border-slate-200 text-slate-800">
                          GEMINI_API_KEY=your_gemini_key<br />
                          # or GROQ_API_KEY=your_groq_key
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={onRetry}
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Workflow</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Agent Workflow Timeline */}
        <div className="space-y-3">
          {STAGES.map((stage, idx) => {
            const status = getStageStatus(stage, idx);
            const Icon = stage.icon;

            return (
              <div
                key={stage.key}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  status === "active"
                    ? "border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500/20"
                    : status === "completed"
                    ? "border-emerald-200 bg-emerald-50/20"
                    : status === "failed"
                    ? "border-rose-200 bg-rose-50/20"
                    : "border-slate-100 bg-slate-50/40 opacity-70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      status === "active"
                        ? "bg-indigo-600 text-white animate-pulse"
                        : status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : status === "failed"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {stage.name}
                      </span>
                      {status === "active" && (
                        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                          Processing
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{stage.desc}</p>
                  </div>
                </div>

                <div>
                  {status === "completed" && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                  {status === "active" && (
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  )}
                  {status === "failed" && (
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  )}
                  {status === "pending" && (
                    <Clock className="w-4 h-4 text-slate-300" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discovered Gaps (if looping occurred) */}
      {gaps && gaps.length > 0 && (
        <div className="bg-amber-50/60 rounded-2xl border border-amber-200/80 p-5 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
            <Repeat className="w-4 h-4 text-amber-600" />
            <span>Information Gaps Targeted for Research Iteration</span>
          </div>
          <div className="space-y-2 mt-2">
            {gaps.map((g, i) => (
              <div key={i} className="p-3 bg-white rounded-xl border border-amber-200 text-xs">
                <div className="font-semibold text-slate-900">{g.description}</div>
                <div className="text-slate-600 mt-0.5">
                  <span className="font-medium text-amber-800">Target Query: </span>
                  <code className="text-indigo-600 bg-slate-50 px-1 py-0.5 rounded">
                    {g.proposed_search_query}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discovered Questions */}
      {plan && plan.questions && plan.questions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Planner Agent Output ({plan.questions.length} Targeted Questions)</span>
            </h3>
            <span className="text-xs text-slate-400">Objective: {plan.objective}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {plan.questions.map((q) => (
              <div
                key={q.id}
                className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-indigo-700">{q.id}</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-600">
                    {q.category}
                  </span>
                </div>
                <p className="font-medium text-slate-800">{q.question}</p>
                <p className="text-[11px] text-slate-500 mt-1 italic">{q.rationale}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Agent Telemetry Terminal */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md p-5 text-slate-300 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">Autonomous Workflow Activity Log</span>
          </div>
          <span className="text-[10px] text-slate-500">Real Backend Telemetry</span>
        </div>
        <div className="max-h-60 overflow-y-auto space-y-1.5 pr-2 font-mono text-[11px]">
          {logs.map((log, i) => (
            <div key={i} className="leading-relaxed flex items-start gap-2">
              <span className="text-slate-600 select-none">›</span>
              <span
                className={
                  log.includes("Error")
                    ? "text-rose-400"
                    : log.includes("Successfully") || log.includes("complete")
                    ? "text-emerald-400"
                    : log.includes("Iteration") || log.includes("Identified")
                    ? "text-amber-400"
                    : log.includes("Initiating") || log.includes("Querying")
                    ? "text-indigo-400"
                    : "text-slate-300"
                }
              >
                {log}
              </span>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-indigo-400 pt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>Orchestrating next agent node...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
