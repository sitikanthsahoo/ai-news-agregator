export default function CareersPage() {
  const roles = [
    { title: "Senior ML Engineer", team: "AI Research", location: "Remote / Bangalore", type: "Full-time" },
    { title: "Frontend Developer (React/Next.js)", team: "Product", location: "Remote", type: "Full-time" },
    { title: "Data Journalist", team: "Editorial", location: "Delhi / Remote", type: "Contract" },
    { title: "Backend Engineer (FastAPI)", team: "Infrastructure", location: "Remote", type: "Full-time" },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8">
      <p className="font-mono-label uppercase tracking-widest text-secondary text-[13px] mb-3">Join The Team</p>
      <h1 className="font-serif text-5xl font-black text-on-surface mb-6 leading-tight">Careers at Chronicle</h1>
      <div className="border-t-4 border-stone-900 pt-8 mb-8" />

      <p className="font-body-lg text-on-surface-variant text-[16px] leading-relaxed mb-10">
        We're building the future of AI-powered journalism. If you're passionate about ML, media, or making information accessible — we want to hear from you.
      </p>

      <h2 className="font-mono-label uppercase tracking-widest text-[13px] text-on-surface-variant mb-4">Open Positions</h2>
      <div className="flex flex-col gap-4 mb-10">
        {roles.map((role) => (
          <div key={role.title} className="bg-surface border border-outline-variant rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div>
              <h3 className="font-serif text-xl font-bold text-on-surface mb-1">{role.title}</h3>
              <div className="flex flex-wrap gap-2">
                <span className="font-mono-data text-[11px] bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full">{role.team}</span>
                <span className="font-mono-data text-[11px] bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full">{role.location}</span>
                <span className="font-mono-data text-[11px] bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full">{role.type}</span>
              </div>
            </div>
            <button className="shrink-0 bg-stone-900 text-stone-50 font-mono-label text-[12px] uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-stone-700 transition-colors">
              Apply Now
            </button>
          </div>
        ))}
      </div>

      <div className="bg-surface-container rounded-2xl p-6 text-center border border-outline-variant">
        <p className="font-mono-label text-on-surface-variant text-[12px] uppercase tracking-wider mb-2">Don't see your role?</p>
        <p className="font-body-md text-on-surface mb-3">Send us your portfolio and we'll keep it on file for future openings.</p>
        <a href="mailto:careers@chronicle.ai" className="inline-flex items-center gap-2 font-mono-label text-[12px] uppercase text-secondary hover:underline">
          <span className="material-symbols-outlined text-[16px]">mail</span>
          careers@chronicle.ai
        </a>
      </div>
    </div>
  );
}
