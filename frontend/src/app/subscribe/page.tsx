"use client";

import React, { useState } from "react";
import Link from "next/link";

const PLANS = [
  {
    id: "free",
    name: "Chronicle Free",
    price: "₹0",
    period: "forever",
    description: "Full access to breaking news and live feeds.",
    features: [
      "Unlimited article reading",
      "Breaking news alerts",
      "Category filters",
      "Basic search",
    ],
    cta: "Current Plan",
    highlight: false,
    ctaDisabled: true,
  },
  {
    id: "plus",
    name: "Chronicle+",
    price: "₹199",
    period: "per month",
    description: "Unlock AI synthesis and personalized recommendations.",
    features: [
      "Everything in Free",
      "AI article summarization",
      "Sentiment analysis badges",
      "Personalized recommendations",
      "Unlimited bookmarks",
      "Reading history",
    ],
    cta: "Start Free Trial",
    highlight: true,
    ctaDisabled: false,
  },
  {
    id: "pro",
    name: "Chronicle Pro",
    price: "₹499",
    period: "per month",
    description: "For power readers. Full analytics and priority feeds.",
    features: [
      "Everything in Chronicle+",
      "Full reading analytics dashboard",
      "Priority live dispatch feed",
      "Admin content tools",
      "API access",
      "Export articles",
    ],
    cta: "Go Pro",
    highlight: false,
    ctaDisabled: false,
  },
];

type Plan = (typeof PLANS)[number];

function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: Plan;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  // Dark (highlight) card: near-black → warm dark brown on hover
  // Light cards: pure white → warm cream with accent border on hover
  const cardStyle: React.CSSProperties = {
    transform: hovered ? "translateY(-12px)" : "translateY(0px)",
    boxShadow: hovered
      ? plan.highlight
        ? "0 32px 64px rgba(0,0,0,0.45)"
        : "0 20px 40px rgba(0,0,0,0.15)"
      : plan.highlight
      ? "0 8px 24px rgba(0,0,0,0.2)"
      : "0 2px 8px rgba(0,0,0,0.06)",
    backgroundColor: plan.highlight
      ? hovered ? "#5c4033" : "#1c1917"   // dark brown ← near-black
      : hovered ? "#fdf6ec" : "#ffffff",  // warm cream ← white
    outline: !plan.highlight && hovered ? "2px solid #c2820a" : "none",
    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative flex flex-col rounded-3xl p-8 border ${
        plan.highlight
          ? "border-stone-900 text-stone-50"
          : "border-stone-200"
      }`}
    >
      {plan.highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary px-4 py-1 rounded-full font-mono-label text-[11px] uppercase tracking-widest whitespace-nowrap">
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <h2 className={`font-mono-label uppercase tracking-widest text-[13px] mb-1 ${plan.highlight ? "text-stone-400" : "text-on-surface-variant"}`}>
          {plan.name}
        </h2>
        <div className="flex items-end gap-2 mb-2">
          <span className={`font-serif text-5xl font-black leading-none ${plan.highlight ? "text-stone-50" : "text-on-surface"}`}>
            {plan.price}
          </span>
          <span className={`font-mono-data text-[12px] mb-1 ${plan.highlight ? "text-stone-400" : "text-on-surface-variant"}`}>
            {plan.period}
          </span>
        </div>
        <p className={`font-body-md text-[14px] ${plan.highlight ? "text-stone-300" : "text-on-surface-variant"}`}>
          {plan.description}
        </p>
      </div>

      <ul className="flex flex-col gap-3 mb-8 flex-1">
        {plan.features.map((feat) => (
          <li key={feat} className={`flex items-start gap-2 font-body-md text-[14px] ${plan.highlight ? "text-stone-200" : "text-on-surface"}`}>
            <span className={`material-symbols-outlined text-[18px] mt-0.5 shrink-0 ${plan.highlight ? "text-secondary" : "text-emerald-600"}`}>
              check_circle
            </span>
            {feat}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan.id)}
        disabled={plan.ctaDisabled || selected === plan.id}
        style={{ opacity: plan.ctaDisabled || selected === plan.id ? 0.6 : 1 }}
        className={`w-full py-3 font-mono-label text-[13px] uppercase tracking-widest rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
          plan.highlight
            ? "bg-secondary text-on-secondary"
            : plan.ctaDisabled
            ? "bg-surface-container text-on-surface-variant cursor-default"
            : "bg-stone-900 text-stone-50"
        }`}
      >
        {selected === plan.id ? (
          <>
            <span className="material-symbols-outlined text-[16px]">check</span>
            Selected
          </>
        ) : (
          plan.cta
        )}
      </button>
    </div>
  );
}

export default function SubscribePage() {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (planId: string) => {
    if (planId === "free") return;
    setSelected(planId);
  };

  return (
    <>
      {/* Header */}
      <div className="text-center mb-12 border-b border-stone-200 pb-10">
        <p className="font-mono-label uppercase tracking-widest text-secondary text-[13px] mb-3">
          Syndicate Membership
        </p>
        <h1 className="font-serif text-5xl md:text-6xl font-black text-on-surface mb-4 leading-tight">
          Upgrade Your Chronicle
        </h1>
        <p className="font-body-lg text-on-surface-variant w-full max-w-2xl mx-auto leading-relaxed">
          Support independent algorithmic journalism. Unlock AI-powered insights,
          sentiment analysis, and personalized feeds.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-stretch">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            selected={selected}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* CTA Banner */}
      {selected && selected !== "free" && (
        <div className="text-center mb-10 p-8 bg-surface-container rounded-3xl border border-outline-variant animate-fade-in">
          <p className="font-mono-label text-on-surface uppercase tracking-widest mb-2">
            You selected:{" "}
            <strong className="text-secondary">
              {PLANS.find((p) => p.id === selected)?.name}
            </strong>
          </p>
          <p className="font-body-md text-on-surface-variant mb-4">
            Payment integration coming soon. You&apos;ll be notified when it&apos;s live.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 font-mono-label text-[12px] uppercase tracking-widest brutalist-outset"
          >
            <span className="material-symbols-outlined text-[16px]">
              arrow_back
            </span>
            Back to Chronicle
          </Link>
        </div>
      )}

      {/* FAQ */}
      <div className="border-t border-stone-200 pt-10">
        <h2 className="font-serif text-3xl font-black text-on-surface mb-6 text-center">
          Frequently Asked
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            {
              q: "Is there a free trial?",
              a: "Chronicle+ includes a 7-day free trial with full access before any charge.",
            },
            {
              q: "Can I cancel anytime?",
              a: "Yes — cancel from your account settings at any time. No questions asked.",
            },
            {
              q: "What payment methods are accepted?",
              a: "UPI, debit/credit cards, and net banking will be supported at launch.",
            },
            {
              q: "What is AI Synthesis?",
              a: "Our HuggingFace model generates a 3-point bullet summary and sentiment tag for every article automatically.",
            },
          ].map((item) => (
            <div key={item.q} className="p-5 bg-surface-container rounded-2xl">
              <p className="font-mono-label text-[13px] text-on-surface uppercase tracking-wider mb-2">
                {item.q}
              </p>
              <p className="font-body-md text-[14px] text-on-surface-variant">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
