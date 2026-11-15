"use client";

import React, { useState } from "react";
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Layers,
  Search,
  Compass,
  ArrowLeft,
  Calendar,
  Sparkles,
  Info,
  Download,
  ChevronDown,
  ChevronUp,
  Percent,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Scale,
  Repeat,
} from "lucide-react";
import { ResearchResponse, downloadPdfReport } from "@/lib/api";

interface ResultsViewProps {
  data: ResearchResponse;
  onNewResearch: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ data, onNewResearch }) => {
  const [activeTab, setActiveTab] = useState<
    "dossier" | "claims" | "contradictions" | "sources" | "plan"
  >("dossier");
  const [copied, setCopied] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [expandedClaims, setExpandedClaims] = useState<Record<string, boolean>>({});

  const report = data.final_report;
  const sources = data.sources || [];
  const findings = data.findings || [];
  const verifications = data.verifications || [];
  const contradictions = data.contradictions || [];
  const metrics = data.metrics;
  const plan = data.plan;

  const toggleClaim = (idx: string | number) => {
    setExpandedClaims((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const conflictingClaims = verifications.filter((v) => v.status === "conflicting");
  const supportedClaims = verifications.filter((v) => v.status === "supported");
  const insufficientClaims = verifications.filter((v) => v.status === "insufficient_evidence");

  const handleDownloadPdf = async () => {
    setPdfDownloading(true);
    try {
      await downloadPdfReport(data, `ResearchPilot_${data.topic.slice(0, 20).replace(/\s+/g, "_")}.pdf`);
    } catch (err: any) {
      alert(`PDF download failed: ${err?.message || "Unknown error"}`);
    } finally {
      setPdfDownloading(false);
    }
  };

  const copyToClipboard = () => {
    if (!report) return;
    const text = `# ${report.title}

## Executive Summary
${report.executive_summary}

## Key Findings
${report.key_findings.map((f, i) => `${i + 1}. ${f}`).join("\n")}

## Detailed Analysis
${report.detailed_analysis}

## Contradictory Evidence & Conflicts
${report.conflicting_information}

## Limitations & Scope
${report.limitations}

## Sources Cited
${sources.map((s) => `- [${s.id}] ${s.title}: ${s.url}`).join("\n")}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={onNewResearch}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>New Research Query</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {report?.title || data.topic}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Grounded across <span className="font-semibold text-slate-700">{sources.length} canonical sources</span> •{" "}
            <span className="font-semibold text-slate-700">{verifications.length} audited claims</span> •{" "}
            {data.iteration_count || 1} autonomous research iterations
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {/* Download PDF button */}
          <button
            onClick={handleDownloadPdf}
            disabled={pdfDownloading}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            {pdfDownloading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export Executive PDF</span>
              </>
            )}
          </button>

          <button
            onClick={copyToClipboard}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>

          <button
            onClick={onNewResearch}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Query</span>
          </button>
        </div>
      </div>

      {/* RESEARCH QUALITY METRICS SCORECARD */}
      {metrics && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Mathematically Grounded Research Quality Metrics
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Formula: (supported / total_claims) × 100
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] text-slate-500 font-medium">Evidence Coverage</div>
              <div className="text-xl font-extrabold text-emerald-600 mt-0.5">
                {metrics.evidence_coverage_pct}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                {metrics.supported_claims}/{metrics.total_claims} supported
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] text-slate-500 font-medium">Conflict Rate</div>
              <div className="text-xl font-extrabold text-amber-600 mt-0.5">
                {metrics.conflict_rate_pct}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                {metrics.conflicting_claims}/{metrics.total_claims} conflicting
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] text-slate-500 font-medium">High-Quality Sources</div>
              <div className="text-xl font-extrabold text-indigo-600 mt-0.5">
                {metrics.high_quality_sources_pct}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                Primary / Analyst tiers
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] text-slate-500 font-medium">Canonical Sources</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                {metrics.total_sources}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                Deduplicated URLs
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] text-slate-500 font-medium">Claims Audited</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                {metrics.total_claims}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                Empirical statements
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] text-slate-500 font-medium">Research Loops</div>
              <div className="text-xl font-extrabold text-indigo-700 mt-0.5">
                {metrics.total_iterations}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                Autonomous cycles
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 mb-6 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("dossier")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "dossier"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/30"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Executive Dossier</span>
        </button>

        <button
          onClick={() => setActiveTab("claims")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "claims"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/30"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Audited Claims & Quotes ({verifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("contradictions")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "contradictions"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/30"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Contradictions Comparison ({contradictions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("sources")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "sources"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/30"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Sources & Quality ({sources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("plan")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "plan"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/30"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Plan & Gaps</span>
        </button>
      </div>

      {/* TAB 1: EXECUTIVE DOSSIER */}
      {activeTab === "dossier" && (
        <div className="space-y-6">
          {report?.executive_summary && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 mb-3">
                <Sparkles className="w-4 h-4" />
                <span>Executive Summary</span>
              </div>
              <p className="text-base text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                {report.executive_summary}
              </p>
            </div>
          )}

          {report?.key_findings && report.key_findings.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Key Findings & Empirical Insights</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.key_findings.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report?.detailed_analysis && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Detailed In-Depth Analysis</span>
              </h3>
              <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
                {report.detailed_analysis}
              </div>
            </div>
          )}

          {report?.limitations && (
            <div className="bg-amber-50/50 rounded-2xl border border-amber-200/80 p-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
                <Info className="w-4 h-4 text-amber-600" />
                <span>Research Scope & Empirical Limitations</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                {report.limitations}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AUDITED CLAIMS & EVIDENCE QUOTES */}
      {activeTab === "claims" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-slate-800">Verification Engine Audit: </span>
              Claims are checked with verbatim quote extractions. A retrieved URL is never treated as proof without explicit textual backing.
            </div>
            <div className="flex items-center gap-2 font-medium">
              <span className="text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                {supportedClaims.length} Supported
              </span>
              <span className="text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                {conflictingClaims.length} Conflicting
              </span>
              <span className="text-slate-600 bg-slate-200/70 px-2.5 py-0.5 rounded-full">
                {insufficientClaims.length} Insufficient
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {verifications.map((item, idx) => {
              const isExpanded = expandedClaims[idx] || false;
              const hasQuotes = item.supporting_evidence_quotes && item.supporting_evidence_quotes.length > 0;
              const hasOpposing = item.opposing_evidence_quotes && item.opposing_evidence_quotes.length > 0;

              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-start gap-2.5">
                      {item.status === "supported" && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      )}
                      {item.status === "conflicting" && (
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      )}
                      {item.status === "insufficient_evidence" && (
                        <HelpCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                          {item.claim}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-slate-400">
                            Claim {item.id || `C${idx + 1}`}
                          </span>
                          <span className="text-[10px] text-slate-300">•</span>
                          <span className="text-[10px] text-slate-500">
                            Sufficiency: <b>{item.evidence_sufficiency || "sufficient"}</b>
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        item.status === "supported"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : item.status === "conflicting"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mt-2 pl-7">
                    <span className="font-semibold text-slate-800">Analytical Reasoning: </span>
                    {item.reasoning}
                  </p>

                  {/* Supporting Evidence Excerpts */}
                  {hasQuotes && (
                    <div className="mt-3 pl-7">
                      <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                        Supporting Verbatim Quotes:
                      </div>
                      <div className="space-y-1.5">
                        {item.supporting_evidence_quotes!.map((quote, qIdx) => (
                          <div
                            key={qIdx}
                            className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/60 text-xs italic text-slate-700"
                          >
                            "{quote}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Opposing Evidence Excerpts if conflicting */}
                  {hasOpposing && (
                    <div className="mt-3 pl-7">
                      <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider mb-1">
                        Opposing Verbatim Quotes:
                      </div>
                      <div className="space-y-1.5">
                        {item.opposing_evidence_quotes!.map((quote, qIdx) => (
                          <div
                            key={qIdx}
                            className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 text-xs italic text-amber-900"
                          >
                            "{quote}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Source URLs Links */}
                  <div className="mt-3 pl-7 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500">Sources:</span>
                    {item.supporting_sources.map((url, uIdx) => (
                      <a
                        key={uIdx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-indigo-600 hover:text-indigo-800 text-[11px]"
                      >
                        <span className="truncate max-w-[200px]">{url}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CONTRADICTIONS COMPARISON */}
      {activeTab === "contradictions" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 mb-3">
              <Scale className="w-4 h-4 text-amber-600" />
              <span>Contradiction Detection & Discrepancy Comparison</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed mb-6">
              {report?.conflicting_information ||
                "No conflicting evidence detected across the retrieved sources for this topic."}
            </p>

            {contradictions.length > 0 ? (
              <div className="space-y-6">
                {contradictions.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200 text-xs shadow-sm"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-amber-200/60 mb-3">
                      <span className="font-bold text-amber-900 text-sm">
                        Conflict #{idx + 1}: {c.topic_aspect}
                      </span>
                      <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        {c.id}
                      </span>
                    </div>

                    {/* Side-by-Side Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Claim A */}
                      <div className="p-3.5 bg-white rounded-xl border border-amber-200/80">
                        <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                          Assertion A ({c.source_a_id})
                        </div>
                        <div className="font-semibold text-slate-900 text-xs mb-2">
                          {c.claim_a}
                        </div>
                        <div className="p-2 rounded bg-slate-50 text-[11px] italic text-slate-700 border border-slate-200 mb-2">
                          "{c.source_a_quote}"
                        </div>
                        <a
                          href={c.source_a_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          <span className="truncate max-w-[200px]">{c.source_a_url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* Claim B */}
                      <div className="p-3.5 bg-white rounded-xl border border-amber-200/80">
                        <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                          Assertion B ({c.source_b_id})
                        </div>
                        <div className="font-semibold text-slate-900 text-xs mb-2">
                          {c.claim_b}
                        </div>
                        <div className="p-2 rounded bg-slate-50 text-[11px] italic text-slate-700 border border-slate-200 mb-2">
                          "{c.source_b_quote}"
                        </div>
                        <a
                          href={c.source_b_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          <span className="truncate max-w-[200px]">{c.source_b_url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Resolution & Context */}
                    <div className="p-3 bg-white/80 rounded-xl border border-amber-200/80 space-y-1.5">
                      <div>
                        <span className="font-semibold text-slate-800">Discrepancy Cause: </span>
                        <span className="text-slate-700">{c.discrepancy_reason}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-amber-900">Contextual Resolution: </span>
                        <span className="text-slate-700">{c.contextual_resolution}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                All audited empirical claims demonstrated consistent consensus across retrieved sources.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SOURCES & QUALITY */}
      {activeTab === "sources" && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 mb-2">
            Canonical web sources retrieved by Tavily, evaluated by domain authority & epistemic quality:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((s) => {
              const assessment = s.assessment;
              const quality = assessment?.overall_quality || "medium";
              const qualityBadgeClass =
                quality === "high"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : quality === "medium"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "bg-slate-100 text-slate-600 border-slate-200";

              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:border-indigo-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {s.id}
                        </span>
                        {assessment?.source_type && (
                          <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {assessment.source_type} source
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${qualityBadgeClass}`}>
                        {quality} Quality
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug mb-2">
                      {s.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                      {s.content}
                    </p>

                    {assessment?.quality_justification && (
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500 mb-3">
                        <span className="font-semibold text-slate-700">Assessment: </span>
                        {assessment.quality_justification}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{s.published_date || "Recent"}</span>
                    </div>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      <span>Visit Source</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: PLAN & GAPS */}
      {activeTab === "plan" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2">
            <Compass className="w-4 h-4" />
            <span>Autonomous Plan Formulation</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">
            Strategic Objective: {plan?.objective}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            {plan?.methodology_summary}
          </p>

          <div className="space-y-3 mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Formulated Research Questions ({plan?.questions?.length || 0}):
            </h4>
            {plan?.questions?.map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-indigo-700">{q.id}</span>
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded">
                    {q.category}
                  </span>
                </div>
                <div className="font-semibold text-slate-800 text-sm">{q.question}</div>
                <div className="text-slate-500 mt-1 italic">{q.rationale}</div>
              </div>
            ))}
          </div>

          {/* Gaps detected during iterative looping */}
          {data.gaps && data.gaps.length > 0 && (
            <div className="pt-6 border-t border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-3 flex items-center gap-2">
                <Repeat className="w-4 h-4 text-amber-600" />
                <span>Information Gaps Resolved Across Iteration Loops</span>
              </h4>
              <div className="space-y-2">
                {data.gaps.map((g, i) => (
                  <div key={i} className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-xs">
                    <div className="font-semibold text-slate-900">{g.description}</div>
                    <div className="text-slate-600 mt-1">
                      <span className="font-medium text-slate-700">Follow-up Query: </span>
                      <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200 text-indigo-600">
                        {g.proposed_search_query}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
