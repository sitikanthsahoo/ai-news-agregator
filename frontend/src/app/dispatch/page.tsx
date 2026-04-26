"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import Link from "next/link";

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

type WsStatus = "connecting" | "live" | "disconnected";

export default function Dispatch() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [newArticleIds, setNewArticleIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [wsStatus, setWsStatus] = useState<WsStatus>("connecting");
  const [breakingCount, setBreakingCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setWsStatus("connecting");
    const ws = new WebSocket("ws://localhost:8000/ws/news");
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus("live");
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "initial" && data.articles) {
          // Initial load from WebSocket — set articles
          setArticles(data.articles);
          setLoading(false);
        } else if (data.type === "breaking_news" && data.articles) {
          // Prepend new articles with animation flag
          const incoming: Article[] = data.articles;
          const incomingIds = new Set(incoming.map((a) => a.id));
          setNewArticleIds((prev) => new Set([...prev, ...incomingIds]));
          setArticles((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const fresh = incoming.filter((a) => !existingIds.has(a.id));
            if (fresh.length > 0) setBreakingCount((c) => c + fresh.length);
            return [...fresh, ...prev];
          });
          // Remove highlight after 8 seconds
          setTimeout(() => {
            setNewArticleIds((prev) => {
              const next = new Set(prev);
              incomingIds.forEach((id) => next.delete(id));
              return next;
            });
          }, 8000);
        }
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    ws.onerror = () => {
      setWsStatus("disconnected");
    };

    ws.onclose = () => {
      setWsStatus("disconnected");
      // Auto-reconnect after 5 seconds
      reconnectTimer.current = setTimeout(() => {
        connectWebSocket();
      }, 5000);
    };
  }, []);

  // Fallback HTTP fetch if WS takes too long
  const fetchFallback = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/news?sort=latest&limit=12"
      );
      setArticles((prev) =>
        prev.length === 0 ? response.data.data || [] : prev
      );
    } catch (error) {
      console.error("Fallback fetch failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    connectWebSocket();
    // Fallback: if WS initial data not received in 3s, use HTTP
    const fallbackTimer = setTimeout(fetchFallback, 3000);

    return () => {
      clearTimeout(fallbackTimer);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connectWebSocket, fetchFallback]);

  const sentimentColor = (s: string | null) => {
    if (!s) return "bg-surface-container text-on-surface-variant";
    const sl = s.toLowerCase();
    if (sl === "positive") return "bg-[#e4ece5] text-[#2c4c3b]";
    if (sl === "negative") return "bg-[#fce8e8] text-[#8b1a1a]";
    return "bg-[#e6e8eb] text-[#3b4c63]";
  };

  return (
    <>
      {/* Header */}
      <div className="border-b border-stone-200 pb-6 mb-8 flex justify-between items-end">
        <div>
          <p className="font-mono-label text-mono-label text-outline uppercase tracking-widest mb-2">
            Live Feed
          </p>
          <h1 className="font-h1 text-h1 text-on-surface">The Dispatch</h1>
        </div>

        {/* WebSocket Status Badge */}
        <div className="flex flex-col items-end gap-2">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono-label text-[11px] uppercase tracking-wider ${
              wsStatus === "live"
                ? "bg-[#e4ece5] text-[#2c4c3b]"
                : wsStatus === "connecting"
                ? "bg-[#fef9e4] text-[#7c6a00]"
                : "bg-[#fce8e8] text-[#8b1a1a]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                wsStatus === "live"
                  ? "bg-[#2c4c3b] animate-pulse"
                  : wsStatus === "connecting"
                  ? "bg-[#7c6a00] animate-ping"
                  : "bg-[#8b1a1a]"
              }`}
            />
            {wsStatus === "live"
              ? "WebSocket Live"
              : wsStatus === "connecting"
              ? "Connecting..."
              : "Reconnecting..."}
          </div>
          {breakingCount > 0 && (
            <span className="font-mono-data text-[11px] text-secondary">
              +{breakingCount} new since arrival
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant font-mono-data animate-pulse uppercase tracking-wider text-[12px]">
            Establishing live connection...
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {articles.map((article) => {
            const isNew = newArticleIds.has(article.id);
            return (
              <article
                key={article.id}
                className={`bg-surface rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col md:flex-row overflow-hidden border ${
                  isNew
                    ? "border-secondary shadow-lg ring-2 ring-secondary/20 animate-fade-in"
                    : "border-stone-100"
                }`}
              >
                {isNew && (
                  <div className="bg-secondary text-on-primary px-4 py-1 font-mono-label text-[11px] uppercase tracking-widest flex items-center gap-2 w-full md:hidden">
                    <span className="w-1.5 h-1.5 bg-on-primary rounded-full animate-pulse" />
                    Breaking — Just In
                  </div>
                )}
                <div className="flex flex-col md:flex-row flex-1 relative">
                  {isNew && (
                    <div className="hidden md:flex absolute -left-0 top-0 bottom-0 w-1 bg-secondary rounded-l-3xl" />
                  )}
                  {article.image_url && (
                    <div className="w-full md:w-64 shrink-0 overflow-hidden bg-surface-variant flex">
                      <Link href={`/article/${article.id}`} className="w-full h-full flex-1 flex">
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-48 md:h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
                          onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                        />
                        <div className="hidden w-full h-48 md:h-full flex items-center justify-center text-outline">
                          <span className="material-symbols-outlined text-[32px]">newspaper</span>
                        </div>
                      </Link>
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-mono-label text-[12px] uppercase text-outline">
                        {article.category || "General"}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full font-mono-data text-[11px] uppercase tracking-wider ${sentimentColor(
                          article.sentiment
                        )}`}
                      >
                        {article.sentiment || "Neutral"}
                      </span>
                    </div>

                    <Link href={`/article/${article.id}`}>
                      <h3 className="font-h3 text-h3 text-on-surface mb-3 hover:underline cursor-pointer">
                        {article.title}
                      </h3>
                    </Link>

                    <p className="font-body-md text-body-md text-on-surface-variant mb-4 flex-1 line-clamp-2">
                      {article.summary || article.content}
                    </p>

                    <div className="mt-auto pt-4 flex justify-between items-center border-t border-stone-100">
                      <span className="font-mono-data text-[12px] text-outline flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">
                          schedule
                        </span>
                        {article.published_at
                          ? new Date(article.published_at).toLocaleString()
                          : "Just now"}
                      </span>
                      <span className="font-mono-data text-[12px] text-outline">
                        {article.source || "Chronicle Syndicate"}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
