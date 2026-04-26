"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { getAuthHeaders, getToken } from "@/utils/auth";
import Link from "next/link";

interface Stats {
  articles: number;
  users: number;
  bookmarks: number;
}

interface BatchResult {
  message: string;
  pending_articles: number;
}

export default function AdminConsole() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);

  // Stats
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Batch AI
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);

  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (getToken()) {
      setIsAuthenticated(true);
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/api/admin/stats", {
        headers: getAuthHeaders(),
      });
      setStats(res.data);
    } catch (e) {
      console.error("Stats fetch failed:", e);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleScrape = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/admin/scrape",
        {},
        { headers: getAuthHeaders() }
      );
      setStatus(response.data);
      // Refresh stats after scrape
      setTimeout(() => fetchStats(), 1500);
    } catch (error: any) {
      console.error("Scrape failed:", error);
      setStatus({
        error:
          error.response?.data?.detail || "Scraping failed. Check server logs.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSentiment = async () => {
    setBatchLoading(true);
    setBatchResult(null);
    try {
      const res = await axios.post(
        "http://localhost:8000/api/ai/batch-sentiment",
        {},
        { headers: getAuthHeaders() }
      );
      setBatchResult(res.data);
    } catch (e: any) {
      setBatchResult({
        message: e.response?.data?.detail || "Batch sentiment failed.",
        pending_articles: 0,
      });
    } finally {
      setBatchLoading(false);
    }
  };

  if (!mounted) {
    return null; // Prevent hydration error by waiting for client-side render
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 pb-32">
        <span className="material-symbols-outlined text-[48px] text-outline mb-4">
          gavel
        </span>
        <h2 className="font-serif text-3xl font-black text-on-surface mb-4">
          Restricted Zone
        </h2>
        <p className="font-mono-data text-on-surface-variant mb-6">
          Administrator clearance required.
        </p>
        <Link
          href="/login"
          className="bg-primary text-on-primary px-6 py-2 font-mono-label uppercase text-[12px] brutalist-outset"
        >
          Authenticate
        </Link>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Articles",
      value: stats?.articles ?? "—",
      icon: "newspaper",
      color: "text-sky-700",
      bg: "bg-sky-50 border-sky-200",
    },
    {
      label: "Registered Users",
      value: stats?.users ?? "—",
      icon: "group",
      color: "text-violet-700",
      bg: "bg-violet-50 border-violet-200",
    },
    {
      label: "Total Bookmarks",
      value: stats?.bookmarks ?? "—",
      icon: "bookmark",
      color: "text-amber-700",
      bg: "bg-amber-50 border-amber-200",
    },
  ];

  return (
    <>
      {/* ── PAGE HEADER ── */}
      <div className="border-b-4 border-stone-900 pb-4 mb-8">
        <p className="font-mono-label text-error uppercase tracking-widest mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">
            admin_panel_settings
          </span>
          Command Center
        </p>
        <h1 className="font-serif text-5xl font-black text-on-surface">
          System Operations
        </h1>
      </div>

      {/* ── STATS DASHBOARD ── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono-label uppercase tracking-widest text-on-surface font-bold text-[14px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">
              monitoring
            </span>
            Live Statistics
          </h2>
          <button
            onClick={fetchStats}
            disabled={statsLoading}
            className="font-mono-data text-[11px] text-outline hover:text-on-surface flex items-center gap-1 transition-colors disabled:opacity-50"
            id="refresh-stats-btn"
          >
            <span
              className={`material-symbols-outlined text-[14px] ${statsLoading ? "animate-spin" : ""}`}
            >
              refresh
            </span>
            {statsLoading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-2xl border p-6 flex items-center gap-4 ${card.bg}`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white border border-current/20 ${card.color}`}
              >
                <span className={`material-symbols-outlined text-[24px]`}>
                  {card.icon}
                </span>
              </div>
              <div>
                <p className="font-mono-data text-[11px] text-on-surface-variant uppercase tracking-wider mb-0.5">
                  {card.label}
                </p>
                <p
                  className={`font-serif text-4xl font-black ${card.color} leading-none`}
                >
                  {statsLoading ? (
                    <span className="inline-block w-16 h-8 bg-current/20 rounded animate-pulse" />
                  ) : (
                    Number(card.value).toLocaleString()
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── OPERATIONS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* SCRAPER PANEL */}
        <div className="bg-surface rounded-3xl p-8 brutalist-border brutalist-outset flex flex-col items-start">
          <div className="w-16 h-16 rounded-2xl bg-surface-variant flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[32px] text-primary">
              precision_manufacturing
            </span>
          </div>
          <h2 className="font-serif text-2xl font-black text-on-surface mb-2">
            Initialize Data Pipeline
          </h2>
          <p className="font-body-md text-on-surface-variant mb-6">
            Manually trigger the web scraping sequence to fetch the latest
            global intelligence reports from NewsAPI and process them into the
            databank.
          </p>
          <button
            onClick={handleScrape}
            disabled={loading}
            id="execute-scrape-btn"
            className="bg-primary text-on-primary px-6 py-3 font-mono-label uppercase text-[13px] tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50 brutalist-outset flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  refresh
                </span>
                Processing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  satellite_alt
                </span>
                Execute Scrape Sequence
              </>
            )}
          </button>

          {/* Pipeline output log */}
          <div className="w-full mt-6 bg-stone-900 rounded-xl p-4 font-mono-data text-[11px]">
            <p className="text-stone-500 uppercase tracking-widest mb-2 text-[10px]">
              Pipeline Output Log
            </p>
            {status ? (
              status.error ? (
                <div className="text-rose-400">[ERROR]: {status.error}</div>
              ) : (
                <div className="text-emerald-400 flex flex-col gap-1">
                  <div>[STATUS]: {status.message}</div>
                  {status.scraped !== undefined && (
                    <div>[SCRAPED]: {status.scraped} articles fetched</div>
                  )}
                  {status.saved !== undefined && (
                    <div>[SAVED]: {status.saved} new articles added</div>
                  )}
                  {status.duplicates !== undefined && (
                    <div>[DUPLICATES]: {status.duplicates} skipped</div>
                  )}
                </div>
              )
            ) : (
              <div className="text-stone-600">
                Waiting for command execution...
              </div>
            )}
          </div>
        </div>

        {/* ── AI BATCH SENTIMENT PANEL ── */}
        <div className="bg-surface rounded-3xl p-8 border border-outline-variant flex flex-col items-start">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[32px] text-violet-600">
              psychology
            </span>
          </div>
          <h2 className="font-serif text-2xl font-black text-on-surface mb-2">
            AI Sentiment Analysis
          </h2>
          <p className="font-body-md text-on-surface-variant mb-6">
            Run batch sentiment analysis (Positive / Negative / Neutral) on all
            articles that haven't been processed yet. Uses the DistilBERT model
            via HuggingFace in the background.
          </p>
          <button
            onClick={handleBatchSentiment}
            disabled={batchLoading}
            id="batch-sentiment-btn"
            className="bg-violet-600 text-white px-6 py-3 font-mono-label uppercase text-[13px] tracking-widest hover:bg-violet-700 transition-colors disabled:opacity-50 rounded-xl flex items-center gap-2"
          >
            {batchLoading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  refresh
                </span>
                Running Analysis...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  batch_prediction
                </span>
                Run Batch Sentiment
              </>
            )}
          </button>

          {batchResult && (
            <div className="w-full mt-6 rounded-xl p-4 bg-violet-50 border border-violet-200 font-mono-data text-[12px] text-violet-800">
              <p className="font-bold mb-1">✓ {batchResult.message}</p>
              <p>
                Articles queued:{" "}
                <strong>{batchResult.pending_articles}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
