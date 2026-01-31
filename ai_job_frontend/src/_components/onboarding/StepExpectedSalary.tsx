 "use client";

import { useMemo, useState } from "react";

interface StepExpectedSalaryProps {
  data?: number;
  onNext: (value: number) => void;
  onBack?: () => void;
}

const MIN_SALARY = 0;
const MAX_SALARY = 300000;

export default function StepExpectedSalary({
  data = 0,
  onNext,
  onBack,
}: StepExpectedSalaryProps) {
  const [salary, setSalary] = useState<number>(data);

  const stepFor = (value: number) => {
    if (value < 100000) return 1000;
    if (value < 200000) return 5000;
    return 10000;
  };

  const display = useMemo(() => {
    if (salary >= 100000) {
      return `$${Math.round(salary / 1000)}k`;
    }
    const thousands = Math.round(salary / 1000) * 1000;
    return `$${thousands.toLocaleString()}`;
  }, [salary]);

  const handleContinue = () => {
    onNext(salary);
  };

  return (
    <div className="max-w-4xl mx-auto text-gray-100 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          What is your minimum expected salary?
        </h1>
        <p className="text-sm text-gray-300">We&apos;ll only use this to match you with jobs.</p>
      </div>

      <div className="mx-auto max-w-xl">
        <div className="flex items-center gap-3 rounded-xl border border-gray-700 bg-slate-800/80 px-4 py-3 shadow">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-sm font-semibold text-white">
            💬
          </div>
          <div className="text-sm text-gray-200">
            We&apos;ll only use this to match you with jobs and will not share this data.
          </div>
        </div>
      </div>

      <div className="mx-auto flex flex-col items-center gap-6">
        <div className="h-32 w-32 rounded-full border-4 border-blue-500/40 bg-slate-800 flex flex-col items-center justify-center text-center shadow-lg">
          <p className="text-xs text-gray-400 mb-1">At least</p>
          <p className="text-2xl font-bold text-white">{display}</p>
          <p className="text-[11px] uppercase tracking-wide text-gray-400">USD</p>
        </div>

        <div className="w-full max-w-xl px-4">
          <input
            type="range"
            min={MIN_SALARY}
            max={MAX_SALARY}
            step={1000}
            value={salary}
            onChange={(e) => {
              const raw = Number(e.target.value);
              const stepSize = stepFor(raw);
              const snapped = Math.min(
                MAX_SALARY,
                Math.max(MIN_SALARY, Math.round(raw / stepSize) * stepSize)
              );
              setSalary(snapped);
            }}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>${MIN_SALARY.toLocaleString()}</span>
            <span>${MAX_SALARY.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
          className="px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-500"
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
