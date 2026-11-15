import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResearchPilot AI - Evidence-Grounded Multi-Agent Research System",
  description:
    "Autonomous research intelligence powered by Tavily Search and LangGraph multi-agent verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
