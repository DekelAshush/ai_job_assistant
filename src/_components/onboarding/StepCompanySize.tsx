 "use client";

import { useMemo, useState } from "react";

interface StepCompanySizeProps {
  data?: string[];
  onNext: (values: string[]) => void;
  onBack?: () => void;
}

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1,000 employees",
  "1,001-5,000 employees",
  "5,001-10,000 employees",
  "10,001+ employees",
];

export default function StepCompanySize({ data = [], onNext, onBack }: StepCompanySizeProps) {
  const [selected, setSelected] = useState<string[]>(data);

  const allSelected = useMemo(
    () => COMPANY_SIZES.every((s) => selected.includes(s)),
    [selected]
  );

  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(COMPANY_SIZES);
    }
  };

  const handleContinue = () => {
    if (selected.length > 0) onNext(selected);
  };

  return (
    <div className="max-w-4xl mx-auto text-gray-100">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
        What is your ideal company size?
      </h1>
      <div className="flex items-center gap-2 text-sm text-gray-300 mb-6">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          className="h-4 w-4 rounded border-gray-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
        />
        <span>Select all sizes</span>
      </div>

      <div className="space-y-2">
        {COMPANY_SIZES.map((size) => {
          const active = selected.includes(size);
          return (
            <button
              key={size}
              onClick={() => toggle(size)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                active
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-gray-700 bg-slate-800 text-gray-200 hover:border-gray-500"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p className="mt-6 text-sm text-gray-300">{selected.length} selected</p>
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
