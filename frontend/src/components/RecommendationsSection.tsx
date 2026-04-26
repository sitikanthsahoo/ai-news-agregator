"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { getToken, getAuthHeaders } from "@/utils/auth";

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

interface RecommendationResponse {
  data: Article[];
  based_on: string[];
  total: number;
}

export default function RecommendationsSection() {
  const [recommendations, setRecommendations] = useState<Article[]>([]);
  const [basedOn, setBasedOn] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      if (getToken()) {
        // Personalised recommendations for logged-in users
        const response = await axios.get<RecommendationResponse>(
          "http://localhost:8000/api/recommendations?limit=4",
          { headers: getAuthHeaders() }
        );
        setRecommendations(response.data.data || []);
        setBasedOn(response.data.based_on || []);
      } else {
        // Fallback: popular articles for guests
        const response = await axios.get(
          "http://localhost:8000/api/news?sort=popular&limit=4"
        );
        setRecommendations(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 h-48 bg-surface-container rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <section>
      {/* Section Header */}
      <div className="flex items-center justify-between border-b-2 border-stone-900 pb-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[20px] text-secondary">
            {getToken() ? "recommend" : "trending_up"}
          </span>
          <h2 className="font-mono-label uppercase tracking-widest text-on-surface font-bold text-[16px]">
            {getToken() ? "Recommended For You" : "Trending Now"}
          </h2>
        </div>
        {basedOn.length > 0 && (
          <div className="hidden md:flex items-center gap-2 font-mono-data text-[11px] text-outline">
            <span>Based on:</span>
            {basedOn.map((cat) => (
              <span
                key={cat}
                className="bg-surface-container px-2 py-0.5 rounded uppercase tracking-wider"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {recommendations.map((article, idx) => (
          <article
            key={article.id}
            className="group bg-surface rounded-2xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            {/* Rank Badge */}
            <div className="relative w-full aspect-[16/9] bg-surface-variant overflow-hidden">
              {article.image_url ? (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                />
              ) : null}
              <div className={`${article.image_url ? 'hidden' : ''} w-full h-full flex items-center justify-center`}>
                <span className="material-symbols-outlined text-[32px] text-outline">
                  auto_awesome
                </span>
              </div>
              {getToken() && (
                <div className="absolute top-3 left-3 w-7 h-7 bg-primary text-on-primary rounded-full flex items-center justify-center font-mono-label text-[11px] font-bold shadow">
                  {idx + 1}
                </div>
              )}
              <div className="absolute top-3 right-3 bg-surface/80 backdrop-blur-sm px-2 py-0.5 rounded font-mono-data text-[10px] uppercase text-on-surface">
                {article.category || "General"}
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <Link href={`/article/${article.id}`}>
                <h3 className="font-h3 text-[17px] leading-snug text-on-surface group-hover:text-primary group-hover:underline transition-colors line-clamp-3 mb-2">
                  {article.title}
                </h3>
              </Link>
              <p className="font-body-md text-[13px] text-on-surface-variant line-clamp-2 mb-3 flex-1">
                {article.summary || article.content}
              </p>
              <div className="flex justify-between items-center border-t border-stone-100 pt-3 mt-auto">
                <span className="font-mono-data text-[10px] text-outline flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                  {article.view_count.toLocaleString()}
                </span>
                <span className="font-mono-data text-[10px] text-outline">
                  {article.source || "Syndicate"}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!getToken() && (
        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="font-mono-data text-[12px] text-secondary hover:underline"
          >
            Sign in to get personalized recommendations →
          </Link>
        </div>
      )}
    </section>
  );
}
