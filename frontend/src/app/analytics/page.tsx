'use client';

import { useEffect, useState } from 'react';
import { getAuthHeaders } from '@/utils/auth';

interface CategoryStat {
  category: string;
  count: number;
}

interface TopArticle {
  id: number;
  title: string;
  category: string;
  view_count: number;
  source: string;
}

interface DailyTrend {
  date: string;
  count: number;
}

interface StatsData {
  articles: number;
  users: number;
  bookmarks: number;
  total_views: number;
  categories: CategoryStat[];
  sentiment: Record<string, number>;
  top_articles: TopArticle[];
  daily_trend: DailyTrend[];
}

const CATEGORY_ICONS: Record<string, string> = {
  technology: 'computer',
  sports: 'sports_soccer',
  politics: 'account_balance',
  health: 'favorite',
  business: 'bar_chart',
  entertainment: 'movie',
  science: 'science',
  world: 'public',
};

const SENTIMENT_COLORS: Record<string, string> = {
  Positive: 'bg-emerald-500',
  Negative: 'bg-rose-500',
  Neutral: 'bg-amber-400',
  Unknown: 'bg-stone-300',
};

const SENTIMENT_TEXT: Record<string, string> = {
  Positive: 'text-emerald-700',
  Negative: 'text-rose-700',
  Neutral: 'text-amber-700',
  Unknown: 'text-stone-500',
};

export default function Analytics() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats', { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to load stats');
        const data = await res.json();
        setStats(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <>
        <div className="border-b border-stone-200 pb-6 mb-8">
          <p className="font-mono-label text-mono-label text-outline uppercase tracking-widest mb-2">Metrics Dashboard</p>
          <h1 className="font-h1 text-h1 text-on-surface">Analytics</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-mono-label text-outline uppercase tracking-widest text-[11px]">Loading analytics…</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !stats) {
    return (
      <>
        <div className="border-b border-stone-200 pb-6 mb-8">
          <p className="font-mono-label text-mono-label text-outline uppercase tracking-widest mb-2">Metrics Dashboard</p>
          <h1 className="font-h1 text-h1 text-on-surface">Analytics</h1>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center">
          <span className="material-symbols-outlined text-[40px] text-rose-400 mb-3 block">error</span>
          <p className="font-mono-label text-rose-700 uppercase tracking-widest text-[12px]">
            {error || 'Could not load analytics. Please log in as an admin.'}
          </p>
        </div>
      </>
    );
  }

  // Compute dominant sentiment
  const totalSentimentArticles = Object.values(stats.sentiment).reduce((a, b) => a + b, 0);
  const dominantSentiment = Object.entries(stats.sentiment).sort((a, b) => b[1] - a[1])[0];

  // Bar chart max for daily trend
  const maxTrend = Math.max(...stats.daily_trend.map(d => d.count), 1);

  // Bar chart max for categories
  const maxCat = Math.max(...stats.categories.map(c => c.count), 1);

  return (
    <>
      <div className="border-b border-stone-200 pb-6 mb-8">
        <p className="font-mono-label text-mono-label text-outline uppercase tracking-widest mb-2">Metrics Dashboard</p>
        <h1 className="font-h1 text-h1 text-on-surface">Analytics</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: 'article', label: 'Total Articles', value: stats.articles.toLocaleString(), trend: null, color: 'text-blue-600' },
          { icon: 'visibility', label: 'Total Views', value: stats.total_views.toLocaleString(), trend: null, color: 'text-violet-600' },
          { icon: 'group', label: 'Users', value: stats.users.toLocaleString(), trend: null, color: 'text-emerald-600' },
          { icon: 'bookmark', label: 'Bookmarks', value: stats.bookmarks.toLocaleString(), trend: null, color: 'text-amber-600' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-surface rounded-2xl p-5 shadow-sm border border-stone-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="font-mono-label text-outline uppercase tracking-widest text-[11px] mb-3 flex items-center gap-2">
              <span className={`material-symbols-outlined text-[16px] ${kpi.color}`}>{kpi.icon}</span>
              {kpi.label}
            </div>
            <div className="font-space-grotesk text-[2.2rem] leading-none font-semibold text-on-surface tabular-nums" style={{ fontVariantNumeric: 'lining-nums tabular-nums' }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Sentiment Distribution */}
      <div className="bg-surface rounded-3xl p-7 shadow-sm border border-stone-100 mb-8">
        <h3 className="font-mono-label text-mono-label text-on-surface uppercase tracking-widest mb-1">Sentiment Distribution</h3>
        <p className="font-mono-data text-[11px] text-outline mb-5">
          Dominant: <span className="font-semibold">{dominantSentiment?.[0] ?? 'N/A'}</span>
          {' '}({dominantSentiment ? Math.round((dominantSentiment[1] / totalSentimentArticles) * 100) : 0}% of analyzed)
        </p>
        <div className="flex gap-2 h-8 rounded-full overflow-hidden mb-4">
          {Object.entries(stats.sentiment).sort((a, b) => b[1] - a[1]).map(([label, count]) => (
            <div
              key={label}
              className={`${SENTIMENT_COLORS[label] ?? 'bg-stone-300'} h-full transition-all duration-500 rounded-full`}
              style={{ width: `${(count / totalSentimentArticles) * 100}%`, minWidth: '4px' }}
              title={`${label}: ${count}`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          {Object.entries(stats.sentiment).sort((a, b) => b[1] - a[1]).map(([label, count]) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${SENTIMENT_COLORS[label] ?? 'bg-stone-300'}`} />
              <span className={`font-mono-data text-[12px] ${SENTIMENT_TEXT[label] ?? 'text-stone-500'}`}>
                {label} — {count} ({Math.round((count / totalSentimentArticles) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Publication Trend */}
      <div className="bg-surface rounded-3xl p-7 shadow-sm border border-stone-100 mb-8">
        <h3 className="font-mono-label text-mono-label text-on-surface uppercase tracking-widest mb-6">7-Day Publication Trend</h3>
        <div className="h-48 w-full flex items-end justify-between gap-2 border-b border-stone-200 pb-2">
          {stats.daily_trend.map((day, idx) => {
            const heightPct = maxTrend > 0 ? Math.max((day.count / maxTrend) * 100, day.count > 0 ? 4 : 0) : 0;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-0 justify-end h-full group">
                <div
                  className="w-full bg-primary/20 hover:bg-primary rounded-t-md transition-all duration-500 relative"
                  style={{ height: `${heightPct}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-900 text-stone-50 font-mono-data text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {day.count} articles
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 font-mono-data text-[10px] text-outline uppercase">
          {stats.daily_trend.map((day, idx) => (
            <span key={idx} className="flex-1 text-center">{day.date}</span>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-surface rounded-3xl p-7 shadow-sm border border-stone-100 mb-8">
        <h3 className="font-mono-label text-mono-label text-on-surface uppercase tracking-widest mb-6">Articles by Category</h3>
        <div className="space-y-4">
          {stats.categories.map((cat) => {
            const pct = maxCat > 0 ? (cat.count / maxCat) * 100 : 0;
            return (
              <div key={cat.category} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-36 shrink-0">
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    {CATEGORY_ICONS[cat.category?.toLowerCase()] ?? 'label'}
                  </span>
                  <span className="font-mono-label text-[12px] text-on-surface uppercase tracking-wider truncate capitalize">
                    {cat.category}
                  </span>
                </div>
                <div className="flex-1 bg-surface-variant rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-mono-data text-[12px] text-outline w-10 text-right tabular-nums">
                  {cat.count}
                </span>
              </div>
            );
          })}
          {stats.categories.length === 0 && (
            <p className="font-mono-data text-outline text-[12px] text-center py-4">No category data yet.</p>
          )}
        </div>
      </div>

      {/* Top Articles by Views */}
      <div className="bg-surface rounded-3xl p-7 shadow-sm border border-stone-100">
        <h3 className="font-mono-label text-mono-label text-on-surface uppercase tracking-widest mb-6">Top Articles by Views</h3>
        <div className="divide-y divide-stone-100">
          {stats.top_articles.map((article, idx) => (
            <div key={article.id} className="flex items-center gap-4 py-3 group">
              <span className="font-space-grotesk text-[1.6rem] font-bold text-outline w-8 tabular-nums leading-none" style={{ fontVariantNumeric: 'lining-nums' }}>
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <a
                  href={`/article/${article.id}`}
                  className="font-h3 text-[15px] text-on-surface group-hover:text-primary transition-colors line-clamp-1"
                >
                  {article.title}
                </a>
                <p className="font-mono-data text-[11px] text-outline capitalize mt-0.5">
                  {article.category} · {article.source}
                </p>
              </div>
              <div className="flex items-center gap-1 text-violet-600 shrink-0">
                <span className="material-symbols-outlined text-[14px]">visibility</span>
                <span className="font-mono-data text-[12px] tabular-nums">{article.view_count.toLocaleString()}</span>
              </div>
            </div>
          ))}
          {stats.top_articles.length === 0 && (
            <p className="font-mono-data text-outline text-[12px] text-center py-4">No articles viewed yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
