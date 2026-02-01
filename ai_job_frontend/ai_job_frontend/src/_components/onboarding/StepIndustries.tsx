 "use client";

import { useState } from "react";

interface StepIndustriesProps {
  dataWant?: string[];
  dataAvoid?: string[];
  onNext: (want: string[], avoid: string[]) => void;
  onBack?: () => void;
}

const INDUSTRIES = [
  "Aerospace",
  "AI & Machine Learning",
  "Automotive & Transportation",
  "Biotechnology",
  "Consulting",
  "Consumer Goods",
  "Consumer Software",
  "Crypto & Web3",
  "Cybersecurity",
  "Data & Analytics",
  "Defense",
  "Design",
  "Education",
  "Energy",
  "Enterprise Software",
  "Entertainment",
  "Financial Services",
  "Fintech",
  "Food & Agriculture",
  "Gaming",
  "Government & Public Sector",
  "Hardware",
  "Healthcare",
  "Industrial & Manufacturing",
  "Legal",
  "Quantitative Finance",
  "Real Estate",
  "Robotics & Automation",
  "Social Impact",
  "Venture Capital",
  "VR & AR",
];

export default function StepIndustries({
  dataWant = [],
  dataAvoid = [],
  onNext,
  onBack,
}: StepIndustriesProps) {
  const [want, setWant] = useState<string[]>(dataWant);
  const [avoid, setAvoid] = useState<string[]>(dataAvoid);

  const toggleWant = (industry: string) => {
    setWant((prev) => {
      const exists = prev.includes(industry);
      const updated = exists ? prev.filter((i) => i !== industry) : [...prev, industry];
      // remove from avoid if added to want
      if (!exists && avoid.includes(industry)) {
        setAvoid((a) => a.filter((i) => i !== industry));
      }
      return updated;
    });
  };

  const toggleAvoid = (industry: string) => {
    setAvoid((prev) => {
      const exists = prev.includes(industry);
      const updated = exists ? prev.filter((i) => i !== industry) : [...prev, industry];
      // remove from want if added to avoid
      if (!exists && want.includes(industry)) {
        setWant((w) => w.filter((i) => i !== industry));
      }
      return updated;
    });
  };

  const handleContinue = () => {
    if (want.length > 0) onNext(want, avoid);
  };

  const chipClasses = (active: boolean, variant: "want" | "avoid") =>
    [
      "px-4 py-2 rounded-full text-sm font-medium border transition-all",
      active
        ? variant === "want"
          ? "bg-blue-600 border-blue-500 text-white"
          : "bg-rose-600 border-rose-500 text-white"
        : "bg-white/5 border-gray-600 text-gray-200 hover:border-gray-400",
    ].join(" ");

  return (
    <div className="max-w-4xl mx-auto text-gray-100 space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          What industries are exciting to you?
        </h1>
        <p className="text-sm text-gray-300">
          Pick the industries you prefer. You can also mark ones to avoid.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-green-300">
          <span role="img" aria-label="check">
            ✅
          </span>
          <span>First, what industries are exciting to you?</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map((industry) => {
            const active = want.includes(industry);
            return (
              <button
                key={`want-${industry}`}
                onClick={() => toggleWant(industry)}
                className={chipClasses(active, "want")}
              >
                {industry}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-700 bg-slate-800/80 p-6 shadow-lg">
        <div className="flex items-center gap-2 text-sm text-rose-300">
          <span role="img" aria-label="alert">
            🚫
          </span>
          <div>
            <p className="text-sm font-semibold text-white">
              Second, are there any industries you don&apos;t want to work in?
            </p>
            <p className="text-xs text-gray-400">Choosing here removes them from your preferred list.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map((industry) => {
            const active = avoid.includes(industry);
            return (
              <button
                key={`avoid-${industry}`}
                onClick={() => toggleAvoid(industry)}
                className={chipClasses(active, "avoid")}
              >
                {industry}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            ← Back
          </button>
        )}
        <button
          onClick={handleContinue}
          disabled={want.length === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            want.length > 0
              ? "bg-blue-600 text-white hover:bg-blue-500"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
        >
          Save and Continue
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
