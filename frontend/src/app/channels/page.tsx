'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CategoryChannel {
  name: string;
  slug: string;
  icon: string;
  count: number;
  description: string;
}

const CATEGORY_META: Record<string, { icon: string; description: string }> = {
  technology: { icon: 'computer', description: 'AI, software, hardware and the digital frontier.' },
  sports:     { icon: 'sports_soccer', description: 'Live scores, transfers, and sports analysis.' },
  politics:   { icon: 'account_balance', description: 'Elections, policy, and global governance.' },
  health:     { icon: 'favorite', description: 'Medicine, wellness, and public health updates.' },
  business:   { icon: 'bar_chart', description: 'Markets, startups, and economic trends.' },
  entertainment: { icon: 'movie', description: 'Film, music, culture, and celebrity news.' },
  science:    { icon: 'science', description: 'Space, research, climate, and discoveries.' },
  world:      { icon: 'public', description: 'International affairs and global events.' },
};

const DEFAULT_META = { icon: 'label', description: 'News and updates from this channel.' };

// Visual gradient accent per category for variety
const CARD_ACCENTS = [
  'from-blue-500/10 to-violet-500/10',
  'from-emerald-500/10 to-teal-500/10',
  'from-amber-500/10 to-orange-500/10',
  'from-rose-500/10 to-pink-500/10',
  'from-cyan-500/10 to-sky-500/10',
  'from-purple-500/10 to-indigo-500/10',
  'from-lime-500/10 to-green-500/10',
  'from-red-500/10 to-rose-500/10',
];

const ICON_COLORS = [
  'text-blue-500', 'text-emerald-500', 'text-amber-500', 'text-rose-500',
  'text-cyan-500', 'text-purple-500', 'text-lime-600', 'text-red-500',
];

export default function Channels() {
  const [channels, setChannels] = useState<CategoryChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChannels() {
      try {
        // Fetch articles for each known category to get real counts
        const knownCategories = Object.keys(CATEGORY_META);
        const results: CategoryChannel[] = [];

        // Use a single call to get all articles and count per category
        const res = await fetch('/api/news?page=1&limit=1');
        if (!res.ok) throw new Error('Failed to fetch news data');

        // Fetch counts per category
        const categoryPromises = knownCategories.map(async (slug) => {
          const r = await fetch(`/api/news/category/${slug}?page=1&limit=1`);
          if (!r.ok) return null;
          const data = await r.json();
          return {
            slug,
            name: slug.charAt(0).toUpperCase() + slug.slice(1),
            count: data.total ?? 0,
            ...CATEGORY_META[slug],
          };
        });

        const resolved = await Promise.all(categoryPromises);
        const valid = resolved.filter(Boolean) as CategoryChannel[];
        // Sort by count descending
        valid.sort((a, b) => b.count - a.count);
        setChannels(valid);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Could not load channels');
      } finally {
        setLoading(false);
      }
    }
    fetchChannels();
  }, []);

  if (loading) {
    return (
      <>
        <div className="border-b border-stone-200 pb-6 mb-8">
          <p className="font-mono-label text-mono-label text-outline uppercase tracking-widest mb-2">Network Hub</p>
          <h1 className="font-h1 text-h1 text-on-surface">Channels</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-3xl p-6 border border-stone-100 h-48 animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 mb-4" />
              <div className="h-4 bg-stone-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-stone-100 rounded w-full" />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="border-b border-stone-200 pb-6 mb-8">
          <p className="font-mono-label text-mono-label text-outline uppercase tracking-widest mb-2">Network Hub</p>
          <h1 className="font-h1 text-h1 text-on-surface">Channels</h1>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center">
          <span className="material-symbols-outlined text-[40px] text-rose-400 mb-3 block">error</span>
          <p className="font-mono-label text-rose-700 uppercase tracking-widest text-[12px]">{error}</p>
        </div>
      </>
    );
  }

  const activeChannels = channels.filter(c => c.count > 0);
  const emptyChannels = channels.filter(c => c.count === 0);

  return (
    <>
      <div className="border-b border-stone-200 pb-6 mb-8">
        <p className="font-mono-label text-mono-label text-outline uppercase tracking-widest mb-2">Network Hub</p>
        <h1 className="font-h1 text-h1 text-on-surface">Channels</h1>
        <p className="font-body text-on-surface-variant mt-2 text-[15px]">
          {activeChannels.length} active channels · {channels.reduce((a, c) => a + c.count, 0).toLocaleString()} total articles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((channel, idx) => {
          const isActive = channel.count > 0;
          const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length];
          const iconColor = ICON_COLORS[idx % ICON_COLORS.length];

          return (
            <Link
              key={channel.slug}
              href={`/category/${channel.slug}`}
              className={`
                bg-gradient-to-br ${accent} bg-surface rounded-3xl shadow-sm
                hover:shadow-xl transition-all duration-300 hover:-translate-y-1
                p-6 border border-stone-100 flex flex-col justify-between h-52
                group cursor-pointer relative overflow-hidden
              `}
            >
              {/* Background icon watermark */}
              <span
                className="material-symbols-outlined absolute -right-4 -bottom-4 text-[100px] opacity-[0.04] select-none pointer-events-none"
                aria-hidden="true"
              >
                {channel.icon}
              </span>

              <div className="flex justify-between items-start relative z-10">
                <div className={`
                  w-12 h-12 rounded-2xl bg-white/70 flex items-center justify-center
                  group-hover:scale-110 transition-transform duration-300 shadow-sm
                `}>
                  <span className={`material-symbols-outlined text-[24px] ${iconColor}`}>
                    {channel.icon}
                  </span>
                </div>
                {isActive ? (
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-mono-data text-[11px] uppercase tracking-wider shadow-sm">
                    Active
                  </span>
                ) : (
                  <span className="bg-surface-container-high text-outline px-3 py-1 rounded-full font-mono-data text-[11px] uppercase tracking-wider">
                    Empty
                  </span>
                )}
              </div>

              <div className="relative z-10">
                <h3 className="font-h3 text-[20px] text-on-surface mb-1 group-hover:text-primary transition-colors">
                  {channel.name}
                </h3>
                <p className="font-mono-data text-[11px] text-on-surface-variant line-clamp-1 mb-2">
                  {channel.description}
                </p>
                <p className="font-mono-data text-[12px] text-outline flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">article</span>
                  {isActive
                    ? `${channel.count.toLocaleString()} article${channel.count !== 1 ? 's' : ''}`
                    : 'No articles yet'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {emptyChannels.length > 0 && (
        <p className="font-mono-data text-[11px] text-outline uppercase tracking-widest text-center mt-8">
          {emptyChannels.length} channel{emptyChannels.length !== 1 ? 's' : ''} awaiting content — run the scraper to populate them
        </p>
      )}
    </>
  );
}
