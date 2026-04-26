export default function PrivacyPage() {
  const sections = [
    {
      title: "Information We Collect",
      content: "We collect information you provide directly to us — such as your email address and username when registering. We also collect usage data such as articles viewed, bookmarks saved, and reading history to power personalized recommendations.",
    },
    {
      title: "How We Use Your Information",
      content: "Your data is used solely to operate and improve The Chronicle. This includes: personalizing your news feed, generating reading analytics, sending optional email digests, and improving our AI recommendation models. We do not sell your data to third parties.",
    },
    {
      title: "AI Processing",
      content: "Article content is processed by AI models (HuggingFace Transformers running locally) to generate summaries and sentiment labels. This processing happens server-side and article content is never sent to external AI providers.",
    },
    {
      title: "Data Retention",
      content: "Your account data is retained for as long as your account is active. Reading history is retained for 90 days. You may request deletion of your account and all associated data at any time by contacting us.",
    },
    {
      title: "Cookies",
      content: "We use JWT tokens stored in localStorage for authentication. We do not use tracking cookies or third-party analytics platforms.",
    },
    {
      title: "Contact Us",
      content: "For privacy-related inquiries, contact privacy@chronicle.ai. We respond within 48 hours.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8">
      <p className="font-mono-label uppercase tracking-widest text-secondary text-[13px] mb-3">Legal</p>
      <h1 className="font-serif text-5xl font-black text-on-surface mb-2 leading-tight">Privacy Policy</h1>
      <p className="font-mono-data text-[12px] text-on-surface-variant mb-6">Last updated: April 24, 2026</p>
      <div className="border-t-4 border-stone-900 pt-8 mb-8" />

      <p className="font-body-lg text-on-surface-variant text-[16px] leading-relaxed mb-8">
        Your privacy matters. This policy explains what data The Chronicle collects, how it's used, and how you can control it.
      </p>

      <div className="flex flex-col gap-6">
        {sections.map((s, i) => (
          <div key={s.title} className="border-l-4 border-stone-200 pl-6">
            <h2 className="font-serif text-xl font-bold text-on-surface mb-2">
              <span className="font-mono-data text-secondary text-[13px] mr-2">{String(i + 1).padStart(2, "0")}.</span>
              {s.title}
            </h2>
            <p className="font-body-md text-[15px] text-on-surface-variant leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
