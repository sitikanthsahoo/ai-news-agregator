"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface Article {
  id: number;
  title: string;
}

export default function BreakingNewsTicker() {
  const [headlines, setHeadlines] = useState<Article[]>([]);

  useEffect(() => {
    fetchHeadlines();
  }, []);

  const fetchHeadlines = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/news?sort=latest&limit=5");
      setHeadlines(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch breaking news:", error);
    }
  };

  if (headlines.length === 0) return null;

  return (
    <div className="w-full bg-primary text-on-primary flex items-center h-10 border-y border-stone-900 overflow-hidden">
      <div className="px-4 py-1 bg-secondary text-on-primary font-mono-label text-[12px] uppercase tracking-widest font-bold z-10 whitespace-nowrap h-full flex items-center shrink-0">
        <span className="material-symbols-outlined text-[16px] mr-2 animate-pulse">emergency</span>
        Breaking News
      </div>
      <div className="relative flex-1 h-full overflow-hidden flex items-center">
        {/* CSS Marquee */}
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12 font-mono-data text-[13px]">
          {headlines.concat(headlines).map((article, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim inline-block"></span>
              <Link href={`/article/${article.id}`} className="hover:underline">
                {article.title}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
