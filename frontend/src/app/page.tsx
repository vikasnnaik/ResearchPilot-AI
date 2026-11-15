"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroLanding } from "@/components/HeroLanding";
import { ResearchDashboard } from "@/components/ResearchDashboard";
import { ExecutionView } from "@/components/ExecutionView";
import { ResultsView } from "@/components/ResultsView";
import {
  fetchHealth,
  executeResearch,
  HealthResponse,
  ResearchResponse,
} from "@/lib/api";
import { SAMPLE_RESEARCH_DOSSIER } from "@/lib/sampleDossier";

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(true);

  // Research Inputs
  const [topic, setTopic] = useState<string>("");
  const [mode, setMode] = useState<string>("comprehensive");
  const [maxSources, setMaxSources] = useState<number>(12);
  const [maxIterations, setMaxIterations] = useState<number>(3);

  // Workflow State
  const [viewState, setViewState] = useState<"idle" | "running" | "completed">("idle");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [resultData, setResultData] = useState<ResearchResponse | null>(null);

  // Health check
  const checkBackendHealth = async () => {
    setHealthLoading(true);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch (err: any) {
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const handleLaunchResearch = async () => {
    if (!topic.trim()) return;

    setError(null);
    setLoading(true);
    setViewState("running");
    setResultData(null);
    setLogs([
      `[Client] Dispatching research request for: '${topic}'`,
      `[Client] Mode: ${mode} | Max sources: ${maxSources} | Max loops: ${maxIterations}`,
      `[Pipeline] Contacting ResearchPilot autonomous multi-agent backend...`,
    ]);

    try {
      const response = await executeResearch(topic, mode, maxSources, maxIterations);
      setResultData(response);
      setLogs(response.logs || [
        "[Pipeline] Autonomous research workflow completed successfully.",
      ]);

      if (response.success && response.final_report) {
        setViewState("completed");
      } else if (response.errors && response.errors.length > 0) {
        setError(response.errors.join("; "));
      }
    } catch (err: any) {
      setError(err?.message || "Failed to execute research workflow.");
      setLogs((prev) => [
        ...prev,
        `[Pipeline Error] ${err?.message || "Internal server error"}`,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setViewState("idle");
    setError(null);
    setResultData(null);
    setLogs([]);
  };

  const handleLoadSample = () => {
    setTopic(SAMPLE_RESEARCH_DOSSIER.topic);
    setResultData(SAMPLE_RESEARCH_DOSSIER);
    setViewState("completed");
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        health={health}
        healthLoading={healthLoading}
        onRefreshHealth={checkBackendHealth}
        onReset={handleReset}
      />

      <main className="flex-1 pb-16">
        {viewState === "idle" && (
          <>
            <HeroLanding
              onStartResearch={() => {
                const el = document.getElementById("research-input-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              onViewSample={handleLoadSample}
            />
            <ResearchDashboard
              topic={topic}
              setTopic={setTopic}
              mode={mode}
              setMode={setMode}
              maxSources={maxSources}
              setMaxSources={setMaxSources}
              onLaunch={handleLaunchResearch}
              loading={loading}
            />
          </>
        )}

        {viewState === "running" && (
          <ExecutionView
            loading={loading}
            error={error}
            logs={logs}
            plan={resultData?.plan || null}
            sources={resultData?.sources || []}
            gaps={resultData?.gaps || []}
            iterationCount={resultData?.iteration_count || 1}
            onRetry={handleLaunchResearch}
          />
        )}

        {viewState === "completed" && resultData && (
          <ResultsView data={resultData} onNewResearch={handleReset} />
        )}
      </main>

      <footer className="border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700">ResearchPilot AI</span> • Global AI Hackathon 2026 (Tavily Research Agent)
          </div>
          <div className="flex items-center gap-4">
            <span>Iterative LangGraph Orchestration</span>
            <span>•</span>
            <span>Tavily Grounded Verification</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
