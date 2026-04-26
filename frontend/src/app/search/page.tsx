"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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

import { Suspense } from "react";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      fetchResults();
    } else {
      setLoading(false);
    }
  }, [query]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/news/search?q=${encodeURIComponent(query)}`);
      setArticles(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch search results:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="border-b border-stone-200 pb-6 mb-8">
        <p className="font-mono-label text-mono-label text-outline uppercase tracking-widest mb-2">Query Results</p>
        <h1 className="font-h1 text-h1 text-on-surface">Search: "{query}"</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-on-surface-variant font-mono-data">Searching the archives...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <span className="material-symbols-outlined text-[48px] text-outline">search_off</span>
          <p className="text-on-surface-variant font-mono-data">No intelligence found matching your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article key={article.id} className="bg-surface rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden border border-stone-100">
              <div className="bg-surface-container px-4 py-3 flex justify-between items-center">
                <span className="font-mono-label text-[12px] uppercase">{article.category || 'General'}</span>
                <span className="bg-[#e6e8eb] text-[#3b4c63] px-3 py-1 rounded-full font-mono-data text-[11px] uppercase tracking-wider">
                  {article.sentiment || 'Neutral'}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <Link href={`/article/${article.id}`}>
                  <div className="w-full h-32 rounded-2xl mb-5 bg-surface-variant overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative">
                    {article.image_url ? (
                      <img 
                        src={article.image_url} 
                        alt={article.title} 
                        className="absolute inset-0 w-full h-full object-cover" 
                        onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                      />
                    ) : null}
                    <div className={`${article.image_url ? 'hidden' : ''} absolute inset-0 w-full h-full flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-[32px] text-outline">image</span>
                    </div>
                  </div>
                </Link>
                
                <Link href={`/article/${article.id}`}>
                  <h3 className="font-h3 text-h3 text-on-surface mb-3 hover:underline cursor-pointer">{article.title}</h3>
                </Link>
                
                <p className="font-body-md text-body-md text-on-surface-variant mb-4 flex-1 line-clamp-3">
                  {article.summary || article.content}
                </p>
                
                <div className="mt-auto border-t border-stone-100 pt-4 flex justify-between items-center">
                  <span className="font-mono-data text-[12px] text-outline">Source: {article.source || 'Web'}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

export default function SearchResults() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><p className="text-on-surface-variant font-mono-data">Loading search...</p></div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
