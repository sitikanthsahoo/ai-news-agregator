"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";

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

export default function Category() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchCategoryNews();
    }
  }, [slug]);

  const fetchCategoryNews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/news/category/${encodeURIComponent(slug)}`);
      setArticles(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch category news:", error);
    } finally {
      setLoading(false);
    }
  };

  const title = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "";

  return (
    <>
      <div className="border-b-4 border-stone-900 pb-4 mb-8">
        <p className="font-mono-label text-outline uppercase tracking-widest mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">category</span> 
          Category
        </p>
        <h1 className="font-serif text-5xl font-black text-on-surface">{title} News</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-on-surface-variant font-mono-data animate-pulse">Loading latest reports...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <span className="material-symbols-outlined text-[48px] text-outline">article</span>
          <p className="text-on-surface-variant font-mono-data">No stories found in this category yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Featured Article */}
          {articles[0] && (
            <article className="bg-surface rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-stone-100 flex flex-col md:flex-row mb-4 group">
               {articles[0].image_url && (
                <div className="w-full md:w-1/2 aspect-[16/9] md:aspect-auto shrink-0 bg-surface-variant overflow-hidden brutalist-border relative">
                  <Link href={`/article/${articles[0].id}`}>
                    <img 
                      src={articles[0].image_url} 
                      alt={articles[0].title} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                    />
                    <div className="hidden absolute inset-0 w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-[48px] text-outline">newspaper</span>
                    </div>
                  </Link>
                </div>
              )}
              <div className="p-8 md:w-1/2 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className="chip">Top Story</span>
                  <span className="font-mono-data text-[12px] text-outline uppercase">{articles[0].source || 'Web'}</span>
                </div>
                <Link href={`/article/${articles[0].id}`}>
                  <h2 className="font-serif text-3xl font-black text-on-surface mb-4 leading-tight group-hover:text-primary group-hover:underline transition-colors">{articles[0].title}</h2>
                </Link>
                <p className="font-body-lg text-on-surface-variant mb-6 line-clamp-4 leading-relaxed">
                  {articles[0].summary || articles[0].content}
                </p>
                <div className="mt-auto pt-4 border-t border-stone-200 flex justify-between items-center">
                  <span className="font-mono-data text-[12px] text-outline">
                    {articles[0].published_at ? new Date(articles[0].published_at).toLocaleString() : 'Just now'}
                  </span>
                </div>
              </div>
            </article>
          )}

          {/* Grid of older articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.slice(1).map((article) => (
              <article key={article.id} className="bg-surface rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden border border-stone-100 group">
                <div className="p-6 flex-1 flex flex-col">
                  <Link href={`/article/${article.id}`}>
                    <div className="w-full h-40 rounded-2xl mb-5 bg-surface-variant overflow-hidden relative">
                      {article.image_url ? (
                        <img 
                          src={article.image_url} 
                          alt={article.title} 
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                        />
                      ) : null}
                      <div className={`${article.image_url ? 'hidden' : ''} absolute inset-0 w-full h-full flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-[32px] text-outline">newspaper</span>
                      </div>
                    </div>
                  </Link>
                  
                  <Link href={`/article/${article.id}`}>
                    <h3 className="font-h3 text-[20px] text-on-surface mb-3 group-hover:underline transition-all leading-snug">{article.title}</h3>
                  </Link>
                  
                  <p className="font-body-md text-on-surface-variant mb-4 flex-1 line-clamp-3">
                    {article.summary || article.content}
                  </p>
                  
                  <div className="mt-auto pt-4 flex justify-between items-center">
                    <span className="font-mono-data text-[11px] text-outline uppercase">{article.source || 'Web'}</span>
                    <span className="font-mono-data text-[11px] text-outline uppercase tracking-wider bg-surface-container px-2 py-1 rounded-sm">
                      {article.sentiment || 'Neutral'}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
