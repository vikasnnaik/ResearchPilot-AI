"use client";

import React from "react";
import { Sparkles, Activity, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { HealthResponse } from "@/lib/api";

interface NavbarProps {
  health: HealthResponse | null;
  healthLoading: boolean;
  onRefreshHealth: () => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  healthLoading,
  onRefreshHealth,
  onReset,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={onReset}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg text-slate-900 tracking-tight">
                ResearchPilot
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                AI MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-500 -mt-0.5">
              Evidence-Grounded Multi-Agent Intelligence
            </p>
          </div>
        </div>

        {/* Center / Hackathon Badge */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
          <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span>Global AI Hackathon 2026</span>
          <span className="text-slate-300">•</span>
          <span className="font-medium text-slate-700">Tavily Research Agent</span>
        </div>

        {/* Right side status */}
        <div className="flex items-center gap-3">
          {healthLoading ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 px-3 py-1.5 rounded-full bg-slate-100 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
              <span>Checking backend...</span>
            </div>
          ) : health ? (
            <div
              className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${
                health.ready
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
              title={health.message}
            >
              {health.ready ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ready & Grounded</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Config Missing</span>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-rose-700 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200">
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              <span>Backend Offline</span>
            </div>
          )}

          <button
            onClick={onRefreshHealth}
            title="Refresh backend status"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${healthLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
