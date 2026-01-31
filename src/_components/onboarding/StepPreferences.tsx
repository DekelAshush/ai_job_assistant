"use client";

import { useState } from "react";

interface StepPreferencesProps {
  data?: string[];
  onNext: (values: string[]) => void;
  onBack?: () => void;
}

const VALUE_OPTIONS = [
  "Diversity & inclusion",
  "Impactful work",
  "Independence & autonomy",
  "Innovative product & tech",
  "Mentorship & career development",
  "Progressive leadership",
  "Recognition & reward",
  "Role mobility",
  "Social responsibility & sustainability",
  "Transparency & communication",
  "Work-life balance",
];

export default function StepPreferences({
  data = [],
  onNext,
  onBack,
}: StepPreferencesProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>(data);
  const maxSelections = 3;

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      // Deselect
      setSelectedValues(selectedValues.filter((v) => v !== value));
    } else {
      // Select (only if under limit)
      if (selectedValues.length < maxSelections) {
        setSelectedValues([...selectedValues, value]);
      }
    }
  };

  const handleContinue = () => {
    if (selectedValues.length > 0) {
      onNext(selectedValues);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Main Title */}
      <h1 className="text-4xl font-bold text-white mb-4">
        Let's get started!
      </h1>

      {/* Core Question */}
      <h2 className="text-3xl font-bold text-white mb-2">
        What do you value in a new role?
      </h2>

      {/* Instruction */}
      <p className="text-gray-300 mb-8">
        Select up to {maxSelections}
      </p>

      {/* Value Tags Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {VALUE_OPTIONS.map((value) => {
          const isSelected = selectedValues.includes(value);
          const isDisabled =
            !isSelected && selectedValues.length >= maxSelections;

          return (
            <button
              key={value}
              onClick={() => toggleValue(value)}
              disabled={isDisabled}
              className={`
                px-6 py-3 rounded-full border-2 text-left transition-all
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-600 text-white font-medium"
                    : "border-gray-600 bg-slate-800 text-gray-200 hover:border-gray-500"
                }
                ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {value}
            </button>
          );
        })}
      </div>

      {/* Selection Counter */}
      {selectedValues.length > 0 && (
        <p className="text-sm text-gray-400 mb-6">
          {selectedValues.length} of {maxSelections} selected
        </p>
      )}

      {/* Save and Continue Button */}
      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          disabled={selectedValues.length === 0}
          className={`
            px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2
            ${
              selectedValues.length > 0
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          Save and Continue
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
