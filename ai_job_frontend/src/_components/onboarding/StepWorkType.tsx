 "use client";

import { useState } from "react";

interface StepWorkTypeProps {
  data?: string[];
  onNext: (values: string[]) => void;
  onBack?: () => void;
}

const WORK_TYPES = ["Internship", "Full-Time", "Part-Time", "Contract"];
const LEVELS = [
  "Entry Level & New Grad",
  "Junior (1 to 2 years)",
  "Mid-level (3 to 4 years)",
  "Senior (5 to 8 years)",
  "Expert & Leadership (9+ years)",
];
const LEADERSHIP_OPTIONS = [
  "Individual Contributor",
  "Manager",
  "I don't have a preference",
];

export default function StepWorkType({ data = [], onNext, onBack }: StepWorkTypeProps) {
  const [selected, setSelected] = useState<string[]>(data);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [leadership, setLeadership] = useState<string | null>(null);

  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const toggleLevel = (value: string) => {
    setSelectedLevels((prev) => {
      if (prev.includes(value)) return prev.filter((v) => v !== value);
      if (prev.length >= 2) return prev; // cap at 2
      return [...prev, value];
    });
  };

  const handleContinue = () => {
    if (selected.length > 0) onNext(selected);
  };

  const showLeadership =
    selectedLevels.some((level) =>
      ["Mid-level", "Senior", "Expert"].some((keyword) => level.startsWith(keyword))
    );

  return (
    <div className="max-w-4xl mx-auto text-gray-100">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
        What type of roles are you looking for?
      </h1>
      <p className="text-sm text-gray-300 mb-8">Select one or more role types.</p>

      <div className="space-y-3">
        {WORK_TYPES.map((type) => {
          const active = selected.includes(type);
          return (
            <button
              key={type}
              onClick={() => toggle(type)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                active
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-gray-700 bg-slate-800 text-gray-200 hover:border-gray-500"
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <>
          <p className="mt-6 text-sm text-gray-300">{selected.length} selected</p>

          <div className="mt-8 rounded-xl border border-gray-700 bg-slate-800/80 p-6 space-y-4 shadow-lg">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-semibold text-white">
                What level of roles are you looking for?
              </h2>
              <p className="text-xs text-gray-400">Select up to 2</p>
            </div>

            <div className="space-y-2">
              {LEVELS.map((level) => {
                const active = selectedLevels.includes(level);
                return (
                  <button
                    key={level}
                    onClick={() => toggleLevel(level)}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                      active
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-gray-700 bg-slate-900 text-gray-200 hover:border-gray-500"
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-gray-400">
              {selectedLevels.length}/2 selected
              {selectedLevels.length === 2 ? " (max)" : ""}
            </p>
          </div>

          {showLeadership && (
            <div className="mt-6 rounded-xl border border-gray-700 bg-slate-800/80 p-6 space-y-4 shadow-lg">
              <div className="text-center space-y-1">
                <h3 className="text-base font-semibold text-white">
                  Are you looking for a specific leadership role?
                </h3>
                <p className="text-xs text-gray-400">Choose one</p>
              </div>
              <div className="space-y-2">
                {LEADERSHIP_OPTIONS.map((option) => {
                  const active = leadership === option;
                  return (
                    <button
                      key={option}
                      onClick={() => setLeadership((prev) => (prev === option ? null : option))}
                      className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                        active
                          ? "border-blue-500 bg-blue-600 text-white"
                          : "border-gray-700 bg-slate-900 text-gray-200 hover:border-gray-500"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
          disabled={selected.length === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            selected.length > 0
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
