"use client";

import { useState } from "react";

interface StepJobStatusProps {
  data?: string;
  onNext: (value: string) => Promise<void> | void;
  onBack?: () => void;
}

const OPTIONS = [
  "Actively looking",
  "Not looking but open to offers",
  "Not looking and closed to offers",
];

export default function StepJobStatus({ data = "", onNext, onBack }: StepJobStatusProps) {
  const [status, setStatus] = useState<string>(data);

  const handleContinue = async () => {
    if (!status) return;
    try {
      await onNext(status);
    } catch (error: any) {
      console.error("Onboarding Save Error:", error?.message || error);
      alert("Error: " + (error?.message || "Failed to save preferences"));
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-gray-100 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Lastly, what&apos;s the status of your job search?
        </h1>
      </div>

      <div className="space-y-3">
        {OPTIONS.map((option) => {
          const active = status === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setStatus(option)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                active
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-gray-700 bg-slate-800 text-gray-200 hover:border-gray-500"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            ← Back
          </button>
        )}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!status}
          className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            status
              ? "bg-blue-600 text-white hover:bg-blue-500"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
        >
          Save & Finish
        </button>
      </div>
    </div>
  );
}