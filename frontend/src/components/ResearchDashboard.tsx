"use client";

import React, { useState } from "react";
import { Search, Sparkles, Layers, Sliders, ArrowRight, BookOpen, Cpu, TrendingUp } from "lucide-react";

interface ResearchDashboardProps {
  topic: string;
  setTopic: (t: string) => void;
  mode: string;
  setMode: (m: string) => void;
  maxSources: number;
  setMaxSources: (n: number) => void;
  onLaunch: () => void;
  loading: boolean;
}

const MODES = [
  {
    id: "comprehensive",
    label: "Comprehensive",
    icon: Layers,
    desc: "Complete 360° strategic market, technical, and regulatory breakdown",
  },
  {
    id: "market_intelligence",
    label: "Market Intelligence",
    icon: TrendingUp,
    desc: "TAM, market share, unit economics, competitor moves & CAGR",
  },
  {
    id: "tech_due_diligence",
    label: "Tech Due Diligence",
    icon: Cpu,
    desc: "Architecture benchmarks, patent moves, engineering tradeoffs & stack",
  },
  {
    id: "quick_brief",
    label: "Executive Brief",
    icon: BookOpen,
    desc: "Rapid high-level synthesis designed for executive briefings",
  },
];

const EXAMPLE_PROMPTS = [
  {
    title: "Indian AdTech Market 2026",
    topic: "Analyse the Indian AdTech market in 2026, including competitors, business models, market opportunities and emerging technologies.",
    tag: "Market Intelligence",
  },
  {
    title: "Solid-State Battery Breakthroughs",
    topic: "Assess the commercialization viability and production bottlenecks of solid-state EV batteries by 2027.",
    tag: "Deep Tech",
  },
  {
    title: "Post-Quantum Cryptography Migration",
    topic: "Evaluate NIST post-quantum cryptographic standards adoption across enterprise banking infrastructure.",
    tag: "Cybersecurity",
  },
  {
    title: "Agentic AI Frameworks Benchmark",
    topic: "Compare enterprise multi-agent frameworks: LangGraph, CrewAI, AutoGen and OpenAI Swarm on production scalability.",
    tag: "AI Architecture",
  },
];

export const ResearchDashboard: React.FC<ResearchDashboardProps> = ({
  topic,
  setTopic,
  mode,
  setMode,
  maxSources,
  setMaxSources,
  onLaunch,
  loading,
}) => {
  return (
    <div id="research-input-section" className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-700">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Autonomous Research Query</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sliders className="w-3.5 h-3.5" />
            <span>Target Sources:</span>
            <select
              value={maxSources}
              onChange={(e) => setMaxSources(Number(e.target.value))}
              disabled={loading}
              className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value={5}>5 Sources (Fast)</option>
              <option value={10}>10 Sources (Standard)</option>
              <option value={15}>15 Sources (In-depth)</option>
            </select>
          </div>
        </div>

        {/* Input box */}
        <div className="relative">
          <textarea
            rows={4}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
            placeholder="Enter research topic or market question... e.g. 'Analyse the Indian AdTech market in 2026, including competitors, business models, market opportunities and emerging technologies.'"
            className="w-full text-base sm:text-lg text-slate-900 placeholder-slate-400 p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none transition-all"
          />
        </div>

        {/* Mode Selector */}
        <div className="mt-5">
          <div className="text-xs font-medium text-slate-500 mb-2.5">
            Select Research Intelligence Mode:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {MODES.map((m) => {
              const Icon = m.icon;
              const isSelected = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  disabled={loading}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/20"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/70"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon
                      className={`w-4 h-4 ${
                        isSelected ? "text-indigo-600" : "text-slate-500"
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold ${
                        isSelected ? "text-indigo-900" : "text-slate-800"
                      }`}
                    >
                      {m.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                    {m.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Powered by Tavily Web Search & Multi-Agent LangGraph verification.
          </div>
          <button
            type="button"
            onClick={onLaunch}
            disabled={loading || topic.trim().length < 3}
            className={`w-full sm:w-auto px-7 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm ${
              loading || topic.trim().length < 3
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:translate-y-0"
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Conducting Research...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Launch Research Workflow</span>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Example Prompt Chips */}
      <div className="mt-6">
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 px-1">
          Example Research Prompts:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXAMPLE_PROMPTS.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (!loading) setTopic(ex.topic);
              }}
              disabled={loading}
              className="text-left p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {ex.title}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {ex.tag}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {ex.topic}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
