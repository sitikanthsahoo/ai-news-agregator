export default function TermsPage() {
  const sections = [
    {
      title: "Acceptance of Terms",
      content: "By accessing or using The Chronicle, you agree to be bound by these Terms of Service. If you do not agree, you may not use our service.",
    },
    {
      title: "Use of Service",
      content: "The Chronicle is provided for personal, non-commercial use. You may not scrape, redistribute, or republish content without explicit written permission. You may not use the platform to spread misinformation or violate applicable laws.",
    },
    {
      title: "User Accounts",
      content: "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access to your account. We reserve the right to terminate accounts that violate these terms.",
    },
    {
      title: "AI-Generated Content",
      content: "AI summaries and sentiment labels are generated automatically and may contain errors. They are provided for convenience only and should not be considered as editorial opinions or factual verification of the source article.",
    },
    {
      title: "Intellectual Property",
      content: "Article content belongs to their respective publishers. The Chronicle's proprietary technology, UI, and AI pipeline are the intellectual property of Chronicle Syndicate. The Chronicle logo and name may not be used without permission.",
    },
    {
      title: "Limitation of Liability",
      content: "The Chronicle is provided 'as is' without warranties of any kind. We are not liable for any damages arising from your use of the service, including inaccurate news summaries or service interruptions.",
    },
    {
      title: "Changes to Terms",
      content: "We may update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms. We will notify registered users of material changes via email.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8">
      <p className="font-mono-label uppercase tracking-widest text-secondary text-[13px] mb-3">Legal</p>
      <h1 className="font-serif text-5xl font-black text-on-surface mb-2 leading-tight">Terms of Service</h1>
      <p className="font-mono-data text-[12px] text-on-surface-variant mb-6">Last updated: April 24, 2026</p>
      <div className="border-t-4 border-stone-900 pt-8 mb-8" />

      <p className="font-body-lg text-on-surface-variant text-[16px] leading-relaxed mb-8">
        Please read these terms carefully before using The Chronicle. These terms govern your use of our platform and services.
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

      <div className="mt-10 p-5 bg-surface-container rounded-2xl border border-outline-variant">
        <p className="font-mono-data text-[13px] text-on-surface-variant">
          Questions about these terms? Contact us at{" "}
          <a href="mailto:legal@chronicle.ai" className="text-secondary hover:underline">legal@chronicle.ai</a>
        </p>
      </div>
    </div>
  );
}
