"use client";

import { useRouter } from "next/navigation";

interface ProgressHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
}

export default function ProgressHeader({
  currentStep,
  totalSteps,
  onBack,
}: ProgressHeaderProps) {
  const router = useRouter();
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="flex items-center gap-4 mb-8">
      <button
        onClick={handleBack}
        className="text-gray-400 hover:text-gray-200 transition-colors text-sm font-medium"
      >
        ← BACK
      </button>

      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gray-300 min-w-[3rem]">
          {progressPercentage}%
        </span>
      </div>
    </div>
  );
}

