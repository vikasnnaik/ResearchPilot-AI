"use client";

import React from "react";
import { ArrowRight, Compass, Search, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

interface HeroLandingProps {
  onStartResearch: () => void;
  onViewSample?: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({ onStartResearch, onViewSample }) => {
  return (
    <div className="relative overflow-hidden pt-10 pb-12 border-b border-slate-200/60 bg-gradient-to-b from-white via-slate-50/50 to-white">
      {/* Decorative subtle background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50/80 border border-indigo-200/70 text-indigo-700 text-xs font-semibold mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
          Tavily-Powered Autonomous Multi-Agent Research System
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
          Autonomous Research Intelligence.
          <br />
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
            Rigorous Evidence. Zero Hallucinations.
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
          Provide any market, technology, or competitive topic. ResearchPilot decomposes the problem,
          executes multi-query web research using Tavily, cross-examines factual evidence, audits contradictions,
          and compiles an executive-ready dossier with verifiable source citations.
        </p>

        {/* CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartResearch}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all"
          >
            <span>Start Deep Research</span>
            <ArrowRight className="w-4 h-4 text-slate-300" />
          </button>
          {onViewSample && (
            <button
              onClick={onViewSample}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Explore Sample Dossier</span>
            </button>
          )}
        </div>

        {/* Key Pipeline Architecture Pills */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:border-slate-300 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-slate-900">1. Planner Agent</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Deconstructs topics into 4–6 strategic sub-questions.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:border-slate-300 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <Search className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-slate-900">2. Research Agent</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Tavily Search API web querying & URL deduplication.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:border-slate-300 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-slate-900">3. Verification Agent</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Audits claims, detects conflicts & unverified assertions.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:border-slate-300 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-slate-900">4. Report Agent</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Executive dossier with citations & explicit limitations.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
