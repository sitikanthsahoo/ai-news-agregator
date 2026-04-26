"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { getAuthHeaders, getToken } from "@/utils/auth";

interface Article {
  id: number;
  title: string;
  summary: string | null;
  content: string | null;
  url: string;
  source: string | null;
  category: string | null;
  image_url: string | null;
  sentiment: string | null;
  ai_summary: string | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
}

// ── Sentiment badge helper ────────────────────────────────────────────
const SENTIMENT_CONFIG: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  Positive: {
    label: "POSITIVE",
    icon: "sentiment_very_satisfied",
    color: "text-emerald-700 bg-emerald-50 border-emerald-300",
  },
  Negative: {
    label: "NEGATIVE",
    icon: "sentiment_very_dissatisfied",
    color: "text-rose-700 bg-rose-50 border-rose-300",
  },
  Neutral: {
    label: "NEUTRAL",
    icon: "sentiment_neutral",
    color: "text-sky-700 bg-sky-50 border-sky-300",
  },
};

function SentimentBadge({
  sentiment,
  size = "md",
}: {
  sentiment: string | null;
  size?: "sm" | "md";
}) {
  const key = sentiment || "Neutral";
  const cfg = SENTIMENT_CONFIG[key] || SENTIMENT_CONFIG["Neutral"];
  const textSize = size === "sm" ? "text-[10px]" : "text-[11px]";
  const iconSize = size === "sm" ? "text-[13px]" : "text-[15px]";
  return (
    <span
      className={`inline-flex items-center gap-1 border rounded px-2 py-0.5 font-mono-label ${textSize} ${cfg.color} uppercase tracking-wider`}
    >
      <span className={`material-symbols-outlined ${iconSize}`}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

export default function ArticleDetail() {
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [bookmarkMsg, setBookmarkMsg] = useState("");

  // AI states
  const [aiSummary, setAiSummary] = useState<string[] | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [sentimentLoading, setSentimentLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchArticle();
      checkBookmark();
      trackHistory();
    }
  }, [id]);

  // Silently record article view in reading history
  const trackHistory = async () => {
    if (!getToken()) return;
    try {
      await axios.get(`http://localhost:8000/api/news/${id}`, {
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.debug("History tracking skipped:", error);
    }
  };

  const checkBookmark = async () => {
    if (!getToken()) return;
    try {
      const response = await axios.get(`http://localhost:8000/api/bookmarks`, {
        headers: getAuthHeaders(),
        params: { limit: 100 },
      });
      const articles: { id: number }[] = response.data?.data || [];
      setIsBookmarked(articles.some((a) => a.id === parseInt(id)));
    } catch (error) {
      console.debug("Bookmark check skipped:", error);
    }
  };

  const fetchArticle = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/news/${id}`);
      const data: Article = response.data;
      setArticle(data);

      // Pre-populate AI states from DB if already computed
      if (data.ai_summary) {
        setAiSummary(data.ai_summary.split("|"));
      }
      if (data.sentiment) {
        setSentiment(data.sentiment);
      } else {
        // Auto-fetch sentiment in background (fast, lightweight model)
        fetchSentiment();
      }
    } catch (error) {
      console.error("Failed to fetch article:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── Sentiment: auto-fetch on load if not cached ───────────────────
  const fetchSentiment = async () => {
    setSentimentLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8000/api/ai/article/${id}/sentiment`
      );
      setSentiment(res.data.sentiment);
    } catch (e) {
      console.debug("Sentiment fetch skipped:", e);
    } finally {
      setSentimentLoading(false);
    }
  };

  // ── Summary: on-demand via button ─────────────────────────────────
  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const res = await axios.get(
        `http://localhost:8000/api/ai/article/${id}/summarize`
      );
      setAiSummary(res.data.summary);
    } catch (e: any) {
      setSummaryError(
        e.response?.data?.detail || "Failed to generate summary."
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  const showMsg = (msg: string) => {
    setBookmarkMsg(msg);
    setTimeout(() => setBookmarkMsg(""), 2500);
  };

  const handleBookmark = async () => {
    if (!getToken()) {
      window.location.href = "/login";
      return;
    }
    if (bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await axios.delete(
          `http://localhost:8000/api/bookmarks/by-article/${id}`,
          { headers: getAuthHeaders() }
        );
        setIsBookmarked(false);
        showMsg("Removed from Archive");
      } else {
        await axios.post(
          `http://localhost:8000/api/bookmarks`,
          { article_id: parseInt(id) },
          { headers: getAuthHeaders() }
        );
        setIsBookmarked(true);
        showMsg("Saved to Archive ✓");
      }
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 400 || status === 409) {
        setIsBookmarked(true);
        showMsg("Already in Archive");
      } else if (status === 401) {
        showMsg("Sign in to save articles");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
      } else {
        showMsg("Failed — please try again");
        console.error("Bookmark error:", error);
      }
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full pt-32">
        <p className="text-on-surface-variant font-mono-data">
          Loading intelligence report...
        </p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex justify-center items-center h-full pt-32">
        <p className="text-error font-mono-data">Article not found.</p>
      </div>
    );
  }

  // Derive live sentiment (prefer live state over stale article.sentiment)
  const liveSentiment = sentiment || article.sentiment;

  return (
    <>
      {/* Breadcrumbs & Meta Top */}
      <div className="flex justify-between items-end mb-lg border-b border-outline pb-sm">
        <div className="flex gap-2 items-center font-mono-label text-mono-label text-on-surface-variant uppercase">
          <span>{article.category || "General"}</span>
          <span>/</span>
          <span className="text-on-background">REPORT</span>
        </div>
        <div className="font-mono-data text-mono-data text-on-surface-variant">
          ID: {article.id} | VIEWS: {article.view_count}
        </div>
      </div>

      <article className="grid grid-cols-12 gap-gutter">
        {/* Header Section */}
        <header className="col-span-12 mb-xl">
          <h1 className="font-h1 text-h1 text-on-background mb-lg">
            {article.title}
          </h1>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 py-sm double-divider mb-lg">
            <div className="flex items-center gap-md">
              <div className="w-12 h-12 brutalist-border bg-surface-container overflow-hidden flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px] text-outline">
                  source
                </span>
              </div>
              <div>
                <div className="font-mono-label text-mono-label text-on-background uppercase">
                  BY {article.source || "SYNDICATE"}
                </div>
                <div className="font-mono-data text-mono-data text-on-surface-variant">
                  PUBLISHED:{" "}
                  {article.published_at
                    ? new Date(article.published_at).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
            </div>

            {/* ── LIVE SENTIMENT BADGE ── */}
            <div className="flex gap-2 items-center">
              <span className="chip">AI VERIFIED</span>
              {sentimentLoading ? (
                <span className="inline-flex items-center gap-1 border rounded px-2 py-0.5 font-mono-label text-[11px] text-outline border-outline bg-surface-container uppercase tracking-wider animate-pulse">
                  <span className="material-symbols-outlined text-[15px]">
                    psychology
                  </span>
                  ANALYZING…
                </span>
              ) : (
                <SentimentBadge sentiment={liveSentiment} />
              )}
            </div>
          </div>

          {/* Hero Image */}
          {article.image_url && (
            <figure className="w-full mb-lg brutalist-border p-xs bg-surface-container-low">
              <div className="aspect-video w-full bg-surface-container-high overflow-hidden brutalist-inset relative">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-full object-cover opacity-80"
                  onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                />
                <div className="hidden w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-[64px] text-outline">newspaper</span>
                </div>
              </div>
            </figure>
          )}
        </header>

        {/* Sidebar / Metadata (Left Column on Desktop) */}
        <aside className="col-span-12 md:col-span-3 order-2 md:order-1 flex flex-col gap-lg">
          {/* Data Well */}
          <div className="brutalist-inset p-md">
            <h3 className="font-mono-label text-mono-label text-on-background mb-sm border-b border-outline pb-xs">
              METRICS
            </h3>
            <ul className="font-mono-data text-mono-data text-on-surface-variant space-y-xs">
              <li className="flex justify-between">
                <span>READ TIME</span>
                <span className="text-on-background">
                  ~{Math.ceil((article.content?.length || 1000) / 1000)} MIN
                </span>
              </li>
              <li className="flex justify-between">
                <span>SOURCE</span>
                <span
                  className="text-on-background truncate max-w-[100px]"
                  title={article.url}
                >
                  {new URL(article.url || "http://localhost").hostname}
                </span>
              </li>
              <li className="flex justify-between items-center gap-2">
                <span>SENTIMENT</span>
                {sentimentLoading ? (
                  <span className="text-outline animate-pulse">…</span>
                ) : (
                  <SentimentBadge sentiment={liveSentiment} size="sm" />
                )}
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div className="brutalist-border p-sm flex flex-col gap-xs">
            {bookmarkMsg && (
              <div className="font-mono-data text-[11px] text-center py-1 px-2 bg-surface-container text-on-surface-variant border border-outline-variant">
                {bookmarkMsg}
              </div>
            )}
            <button
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              className="brutalist-outset bg-background text-on-background px-md py-sm font-mono-label text-mono-label w-full flex justify-between items-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {bookmarkLoading
                ? "SAVING..."
                : isBookmarked
                ? "REMOVE FROM ARCHIVE"
                : "SAVE TO ARCHIVE"}
              <span
                className="material-symbols-outlined text-[16px]"
                style={
                  isBookmarked ? { fontVariationSettings: "'FILL' 1" } : {}
                }
              >
                {bookmarkLoading ? "hourglass_empty" : "bookmark"}
              </span>
            </button>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="brutalist-outset bg-background text-on-background px-md py-sm font-mono-label text-mono-label w-full flex justify-between items-center cursor-pointer"
            >
              VIEW ORIGINAL{" "}
              <span className="material-symbols-outlined text-[16px]">
                open_in_new
              </span>
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="brutalist-outset bg-background text-on-background px-md py-sm font-mono-label text-mono-label w-full flex justify-between items-center cursor-pointer"
            >
              SHARE DISPATCH{" "}
              <span className="material-symbols-outlined text-[16px]">
                share
              </span>
            </button>
          </div>
        </aside>

        {/* Main Article Body */}
        <div className="col-span-12 md:col-span-9 order-1 md:order-2 flex flex-col gap-lg pb-xl">

          {/* ── AI SUMMARY PANEL ─────────────────────────────────── */}
          {aiSummary ? (
            <div className="brutalist-border p-md bg-surface-container-low mb-md relative mt-4 animate-fade-in">
              <div className="absolute -top-3 left-md bg-background px-xs font-mono-label text-mono-label text-on-background brutalist-border flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  auto_awesome
                </span>
                AI SYNTHESIS
              </div>
              <ul className="list-none pl-0 font-body-md text-body-md text-on-surface-variant mt-sm space-y-3">
                {aiSummary.filter(Boolean).map((point, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <span className="mt-1 w-5 h-5 shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center font-mono-label text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              {summaryError && (
                <p className="mt-3 text-error font-mono-data text-[12px]">
                  {summaryError}
                </p>
              )}
            </div>
          ) : (
            /* ── AI SUMMARY CALL-TO-ACTION ── */
            <div className="brutalist-border p-md bg-surface-container-low mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[28px] text-secondary">
                  psychology
                </span>
                <div>
                  <p className="font-mono-label text-[13px] text-on-surface uppercase tracking-wider">
                    AI Analysis Available
                  </p>
                  <p className="font-mono-data text-[11px] text-on-surface-variant mt-0.5">
                    Generate a 3-point bullet summary of this article using
                    HuggingFace AI
                  </p>
                </div>
              </div>
              <button
                onClick={handleGenerateSummary}
                disabled={summaryLoading}
                id="generate-ai-summary-btn"
                className="shrink-0 bg-primary text-on-primary px-6 py-2.5 font-mono-label text-[12px] uppercase tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center gap-2 brutalist-outset"
              >
                {summaryLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      refresh
                    </span>
                    Generating…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">
                      auto_awesome
                    </span>
                    Synthesize Report
                  </>
                )}
              </button>
              {summaryError && (
                <p className="mt-2 text-error font-mono-data text-[11px] w-full">
                  {summaryError}
                </p>
              )}
            </div>
          )}

          {/* Article Content */}
          <div className="prose max-w-none font-body-lg text-body-lg text-on-background space-y-md">
            {(
              article.content ||
              article.summary ||
              "No content available for this report."
            )
              .split("\n\n")
              .map((paragraph, idx) => (
                <p
                  key={idx}
                  className={
                    idx === 0
                      ? "first-letter:text-5xl first-letter:font-bold first-letter:mr-2 first-letter:float-left first-letter:leading-none"
                      : ""
                  }
                >
                  {paragraph}
                </p>
              ))}
          </div>
        </div>
      </article>
    </>
  );
}
