"use client";

import { useState } from "react";

export default function FooterSubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = () => {
    if (!email || !email.includes("@")) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }
    // In a real app this would POST to /api/subscribe
    setStatus("success");
    setEmail("");
    setTimeout(() => setStatus("idle"), 4000);
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Email Address"
          className={`bg-stone-800 border text-stone-50 font-mono-data text-[13px] px-3 py-2 rounded-sm w-full outline-none focus:ring-1 transition-colors ${
            status === "error"
              ? "border-red-500 focus:ring-red-500"
              : "border-transparent focus:ring-secondary"
          }`}
        />
        <button
          onClick={handleSubmit}
          className="bg-secondary text-on-primary px-4 font-mono-label uppercase text-[12px] rounded-sm hover:opacity-90 transition-opacity shrink-0"
        >
          Submit
        </button>
      </div>
      {status === "success" && (
        <p className="mt-2 font-mono-data text-[11px] text-emerald-400 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">check_circle</span>
          Subscribed! You'll receive the daily brief.
        </p>
      )}
      {status === "error" && (
        <p className="mt-2 font-mono-data text-[11px] text-red-400 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          Please enter a valid email address.
        </p>
      )}
    </div>
  );
}
