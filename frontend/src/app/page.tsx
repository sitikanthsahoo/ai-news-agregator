"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import RecommendationsSection from "@/components/RecommendationsSection";

// ── Sentiment badge ───────────────────────────────────────────────────
const SENTIMENT_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  Positive:  { label: "POS",  icon: "sentiment_very_satisfied",     color: "text-emerald-700 bg-emerald-50  border-emerald-300" },
  Negative:  { label: "NEG",  icon: "sentiment_very_dissatisfied",  color: "text-rose-700    bg-rose-50     border-rose-300" },
  Neutral:   { label: "NEU",  icon: "sentiment_neutral",            color: "text-sky-700     bg-sky-50      border-sky-300" },
};

function SentimentBadge({ sentiment }: { sentiment: string | null }) {
  if (!sentiment) return null;
  const cfg = SENTIMENT_CONFIG[sentiment] || SENTIMENT_CONFIG["Neutral"];
  return (
    <span className={`inline-flex items-center gap-0.5 border rounded px-1.5 py-0 font-mono-label text-[9px] uppercase tracking-wider ${cfg.color}`}>
      <span className="material-symbols-outlined text-[11px]">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

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

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/news?limit=15");
      setArticles(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSynthesize = async (articleId: number) => {
    setGeneratingId(articleId);
    try {
      const response = await axios.post("http://localhost:8000/api/ai/summarize", {
        article_id: articleId
      });
      setArticles(prev => prev.map(a => 
        a.id === articleId ? { ...a, ai_summary: response.data.summary.join("|") } : a
      ));
    } catch (error) {
      console.error("Failed to summarize:", error);
      alert("Error generating summary.");
    } finally {
      setGeneratingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-on-surface-variant font-mono-data uppercase tracking-widest animate-pulse">Loading intelligence...</p>
      </div>
    );
  }

  if (articles.length === 0) return null;

  const leadStory = articles[0];
  const leftColumnStories = articles.slice(1, 6);
  const rightColumnStories = articles.slice(6, 10);
  const bottomGridStories = articles.slice(10, 14);

  return (
    <div className="flex flex-col gap-8">
      {/* 3-Column Newspaper Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Latest Updates */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="border-b-2 border-stone-900 pb-2 mb-2 flex items-center justify-between">
            <h2 className="font-mono-label uppercase tracking-widest text-on-surface font-bold text-[14px]">Latest Updates</h2>
            <span className="material-symbols-outlined text-[18px] text-secondary">update</span>
          </div>
          <div className="flex flex-col divide-y divide-stone-200">
            {leftColumnStories.map((article) => (
              <article key={article.id} className="py-4 group">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono-data text-[10px] text-outline uppercase tracking-wider">
                    {article.category || 'General'} • {article.published_at ? new Date(article.published_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                  </span>
                  <SentimentBadge sentiment={article.sentiment} />
                </div>
                <Link href={`/article/${article.id}`}>
                  <h3 className="font-h3 text-[18px] text-on-surface group-hover:text-primary group-hover:underline transition-colors leading-tight">
                    {article.title}
                  </h3>
                </Link>
              </article>
            ))}
          </div>
          <Link href="/dispatch" className="brutalist-outset bg-surface text-center py-2 font-mono-label text-[12px] uppercase hover:bg-stone-100 transition-colors">
            View All Updates
          </Link>
        </div>

        {/* CENTER COLUMN: Lead Story */}
        <div className="lg:col-span-6 flex flex-col gap-4 border-x border-stone-200 px-4 lg:px-8">
          <article className="flex flex-col gap-4">
            <Link href={`/article/${leadStory.id}`}>
              <h1 className="font-serif text-4xl md:text-5xl font-black text-on-surface leading-[1.05] hover:text-secondary transition-colors cursor-pointer text-center md:text-left">
                {leadStory.title}
              </h1>
            </Link>
            
            <div className="flex justify-between items-center border-y border-stone-200 py-2">
              <div className="flex gap-4 font-mono-data text-[12px] text-outline uppercase tracking-wider items-center">
                <span>By {leadStory.source || 'Chronicle Syndicate'}</span>
                {leadStory.sentiment && (
                  <span className="hidden md:inline-flex items-center gap-1">
                    Sentiment: <SentimentBadge sentiment={leadStory.sentiment} />
                  </span>
                )}
              </div>
              <div className="flex gap-2 items-center">
                <span className="chip hidden sm:inline-block">Lead Story</span>
              </div>
            </div>

            <Link href={`/article/${leadStory.id}`}>
              <div className="w-full aspect-[4/3] relative group overflow-hidden bg-surface-variant cursor-pointer brutalist-border">
                {leadStory.image_url ? (
                  <img
                    src={leadStory.image_url}
                    alt={leadStory.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                  />
                ) : null}
                <div className={`${leadStory.image_url ? 'hidden' : ''} w-full h-full flex items-center justify-center`}><span className="material-symbols-outlined text-[48px] text-outline">newspaper</span></div>
                {/* Decorative Photo corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-stone-900 m-2"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-stone-900 m-2"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-stone-900 m-2"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-stone-900 m-2"></div>
              </div>
            </Link>

            {leadStory.ai_summary ? (
              <div className="brutalist-inset p-4 mt-2">
                <div className="flex items-center gap-2 mb-3 text-secondary border-b border-stone-300 pb-2">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  <span className="font-mono-label text-[12px] uppercase">AI Synthesis</span>
                </div>
                <ul className="list-disc pl-5 font-body-lg text-[18px] text-on-surface-variant space-y-2">
                  {leadStory.ai_summary.split('|').map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="font-body-lg text-[18px] text-on-surface-variant leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:mr-2 first-letter:float-left first-letter:leading-none">
                {leadStory.summary || leadStory.content}
              </p>
            )}

            {!leadStory.ai_summary && (
              <div className="flex justify-center mt-4">
                <button 
                  onClick={() => handleSynthesize(leadStory.id)}
                  disabled={generatingId === leadStory.id}
                  className="bg-primary text-on-primary px-8 py-3 font-mono-label text-[13px] uppercase tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center gap-2 brutalist-outset"
                >
                  <span className="material-symbols-outlined text-[18px]">psychology</span> 
                  {generatingId === leadStory.id ? 'Generating Synthesis...' : 'Synthesize Full Report'}
                </button>
              </div>
            )}
          </article>
        </div>

        {/* RIGHT COLUMN: Trending & Ads */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          {/* Ad Space Placeholder */}
          <div className="w-full bg-[#f4f0ef] brutalist-border p-4 text-center">
            <p className="font-mono-data text-[10px] text-outline uppercase mb-2">Advertisement</p>
            <div className="w-full aspect-[4/5] bg-stone-200 border border-stone-300 flex items-center justify-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
               <div className="text-center z-10 p-4">
                 <h4 className="font-serif text-2xl font-bold text-stone-800 mb-2">Chronicle+</h4>
                 <p className="font-body-md text-stone-600 mb-4">Unlock premium algorithmic insights.</p>
                 <Link href="/subscribe" className="inline-block bg-secondary text-stone-50 px-4 py-2 font-mono-label text-[12px] uppercase hover:opacity-90 transition-opacity">Subscribe Now</Link>
               </div>
            </div>
          </div>

          {/* Editor's Picks */}
          <div>
            <div className="border-b-2 border-stone-900 pb-2 mb-4 flex items-center justify-between">
              <h2 className="font-mono-label uppercase tracking-widest text-on-surface font-bold text-[14px]">Trending Signals</h2>
              <span className="material-symbols-outlined text-[18px] text-secondary">trending_up</span>
            </div>
            <div className="flex flex-col gap-4">
              {rightColumnStories.map((article) => (
                <article key={article.id} className="flex gap-4 group cursor-pointer items-start">
                  <div className="w-16 h-16 shrink-0 bg-surface-variant overflow-hidden brutalist-border">
                    {article.image_url ? (
                      <img src={article.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt=""
                        onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                      />
                    ) : null}
                    <div className={`${article.image_url ? 'hidden' : ''} w-full h-full flex items-center justify-center text-outline`}><span className="material-symbols-outlined text-[20px]">feed</span></div>
                  </div>
                  <div className="flex-1">
                    <Link href={`/article/${article.id}`}>
                      <h3 className="font-h3 text-[16px] leading-tight group-hover:text-primary transition-colors line-clamp-3">
                        {article.title}
                      </h3>
                    </Link>
                    {article.sentiment && <div className="mt-1"><SentimentBadge sentiment={article.sentiment} /></div>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="double-divider my-4"></div>

      {/* RECOMMENDATIONS SECTION */}
      <RecommendationsSection />

      <div className="double-divider my-4"></div>

      {/* BOTTOM GRID: More News */}
      <div>
        <div className="border-b-2 border-stone-900 pb-2 mb-6 flex items-center justify-between">
          <h2 className="font-mono-label uppercase tracking-widest text-on-surface font-bold text-[16px]">Around The World</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bottomGridStories.map((article) => (
            <article key={article.id} className="flex flex-col group cursor-pointer">
              <div className="w-full aspect-[16/9] mb-3 bg-surface-variant overflow-hidden brutalist-border">
                {article.image_url ? (
                  <img src={article.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt=""
                    onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                  />
                ) : null}
                <div className={`${article.image_url ? 'hidden' : ''} w-full h-full flex items-center justify-center text-outline`}><span className="material-symbols-outlined text-[32px]">public</span></div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono-data text-[10px] text-outline uppercase tracking-wider">{article.category || 'General'}</span>
                <SentimentBadge sentiment={article.sentiment} />
              </div>
              <Link href={`/article/${article.id}`}>
                <h3 className="font-h3 text-[18px] leading-tight group-hover:underline transition-all">
                  {article.title}
                </h3>
              </Link>
              <p className="font-body-md text-[14px] text-on-surface-variant mt-2 line-clamp-3">
                {article.summary || article.content}
              </p>
            </article>
          ))}
        </div>
      </div>

    </div>
  );
}
