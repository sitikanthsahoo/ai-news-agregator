"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
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

interface BookmarkedArticle extends Article {
  _bookmark_id: number; // internal tracking for delete
}

export default function Archive() {
  const [articles, setArticles] = useState<BookmarkedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch articles on mount (Mocking bookmarks with popular news for UI purposes)
  useEffect(() => {
    fetchArchive();
  }, []);

  const fetchArchive = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("http://localhost:8000/api/bookmarks", {
        headers: getAuthHeaders(),
      });
      // Backend returns { data: Article[], total, page, limit, total_pages }
      // Each article object doesn't have bookmark_id, so we fetch bookmarks
      // separately to get bookmark IDs for deletion
      const bookmarksList = await axios.get("http://localhost:8000/api/bookmarks", {
        headers: getAuthHeaders(),
        params: { limit: 100 }
      });
      const articlesData: BookmarkedArticle[] = (bookmarksList.data.data || []).map((art: Article, idx: number) => ({
        ...art,
        _bookmark_id: idx, // placeholder — we'll look up on delete
      }));
      setArticles(articlesData);
    } catch (error) {
      console.error("Failed to fetch archive:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (articleId: number) => {
    try {
      // Use the dedicated by-article endpoint for clean deletion
      await axios.delete(`http://localhost:8000/api/bookmarks/by-article/${articleId}`, {
        headers: getAuthHeaders(),
      });
      setArticles(prev => prev.filter(a => a.id !== articleId));
    } catch (error) {
      console.error("Failed to remove bookmark", error);
      // Optimistically remove from UI even on failure
      setArticles(prev => prev.filter(a => a.id !== articleId));
    }
  };

  if (!getToken()) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 pb-32">
        <span className="material-symbols-outlined text-[48px] text-outline mb-4">lock</span>
        <h2 className="font-serif text-3xl font-black text-on-surface mb-4">Access Restricted</h2>
        <p className="font-mono-data text-on-surface-variant mb-6">You must authenticate to access the Personal Library.</p>
        <Link href="/login" className="bg-primary text-on-primary px-6 py-2 font-mono-label uppercase text-[12px] brutalist-outset">
          Authenticate
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="border-b border-stone-200 pb-6 mb-8">
        <p className="font-mono-label text-mono-label text-outline uppercase tracking-widest mb-2">Personal Library</p>
        <h1 className="font-h1 text-h1 text-on-surface">The Archive</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-on-surface-variant font-mono-data">Loading saved dispatches...</p>
        </div>
      ) : articles.length === 0 ? (
        <div style={{ width: '100%', padding: '64px 16px', textAlign: 'center' }}>
          <div style={{ maxWidth: '480px', margin: '0 auto', border: '1px solid #e2e8f0', padding: '48px 40px', background: 'var(--color-surface)' }}>
            <span className="material-symbols-outlined text-outline" style={{ fontSize: '56px', display: 'block', marginBottom: '20px' }}>bookmarks</span>
            <h2 className="font-serif text-on-surface" style={{ fontSize: '28px', fontWeight: '900', marginBottom: '12px' }}>Your Archive is Empty</h2>
            <div style={{ width: '48px', height: '1px', background: 'var(--color-on-surface)', margin: '0 auto 20px' }} />
            <p className="font-mono-data text-on-surface-variant" style={{ fontSize: '13px', lineHeight: '1.8', marginBottom: '32px' }}>
              You haven&apos;t saved any articles yet.<br />
              Open any article and click <strong className="text-on-surface">SAVE TO ARCHIVE</strong> to build your personal reading library.
            </p>
            <Link
              href="/"
              className="bg-primary text-on-primary font-mono-label uppercase brutalist-outset"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 32px', fontSize: '12px', letterSpacing: '0.1em', textDecoration: 'none' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>newspaper</span>
              Browse Latest News
            </Link>
          </div>
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
                  <button onClick={() => handleUnsave(article.id)} className="text-error hover:text-error-container transition-colors" title="Remove from Archive">
                    <span className="material-symbols-outlined text-[20px]">bookmark_remove</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
