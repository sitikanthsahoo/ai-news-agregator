export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <p className="font-mono-label uppercase tracking-widest text-secondary text-[13px] mb-3">Who We Are</p>
      <h1 className="font-serif text-5xl font-black text-on-surface mb-6 leading-tight">About The Chronicle</h1>
      <div className="border-t-4 border-stone-900 pt-8 mb-10" />
      
      <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden mb-12 shadow-2xl border border-stone-200">
        <img 
          src="/chronicle_hq_about_1777180944647.png" 
          alt="Chronicle HQ" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="prose prose-stone max-w-none space-y-6">
        <p className="font-body-lg text-on-surface-variant text-[16px] leading-relaxed">
          <strong className="text-on-surface">The Chronicle</strong> is an AI-powered news aggregator built to surface the world's most important stories — curated, classified, and summarized by advanced language models so you can read smarter, not longer.
        </p>
        <p className="font-body-md text-on-surface-variant text-[15px] leading-relaxed">
          We pull from dozens of global sources, run every article through sentiment analysis and AI synthesis, and deliver a clean, bias-aware reading experience. No clickbait. No noise. Just intelligence.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {[
            { icon: "bolt", label: "Real-Time", desc: "Breaking news delivered via live WebSocket feed the moment it's published." },
            { icon: "psychology", label: "AI-Powered", desc: "Every article is summarized and sentiment-tagged by HuggingFace models." },
            { icon: "public", label: "Global Sources", desc: "NewsAPI, BBC, Reuters — aggregated from 80+ publishers worldwide." },
          ].map((item) => (
            <div key={item.label} className="bg-surface-container rounded-2xl p-6 border border-outline-variant">
              <span className="material-symbols-outlined text-[32px] text-secondary mb-3 block">{item.icon}</span>
              <h3 className="font-mono-label uppercase tracking-wider text-[12px] text-on-surface mb-2">{item.label}</h3>
              <p className="font-body-md text-[14px] text-on-surface-variant">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 p-6 bg-stone-900 text-stone-50 rounded-2xl">
          <p className="font-mono-label uppercase tracking-widest text-[12px] text-stone-400 mb-2">Our Mission</p>
          <p className="font-serif text-2xl font-bold leading-snug">"To make the world's intelligence accessible, understandable, and actionable — for everyone."</p>
        </div>
      </div>
    </div>
  );
}
