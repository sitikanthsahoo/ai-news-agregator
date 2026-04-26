"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative bg-[#F4F3E6] shadow-inner flex items-center h-9 rounded-full px-4">
      <span className="material-symbols-outlined text-[18px] text-stone-500 mr-2">search</span>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch(e as unknown as React.FormEvent)}
        className="bg-transparent border-none focus:ring-0 p-0 font-mono-data text-mono-data w-48 text-on-surface placeholder:text-outline rounded-full outline-none" 
        placeholder="Search archive..." 
        type="text"
      />
      <button type="submit" className="hidden" />
    </form>
  );
}
