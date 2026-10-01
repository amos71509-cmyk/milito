import React from "react";
import { Check } from "lucide-react";

export type SwapStepNumber = 1 | 2 | 3 | 4;

interface SwapProgressBarProps {
  currentStep: SwapStepNumber;
  onStepClick?: (step: SwapStepNumber) => void;
  maxReachedStep: SwapStepNumber;
}

const STEPS = [
  { step: 1 as SwapStepNumber, label: "01 Device", title: "Select Device" },
  { step: 2 as SwapStepNumber, label: "02 Condition", title: "Assessment" },
  { step: 3 as SwapStepNumber, label: "03 Upgrade", title: "Target Device" },
  { step: 4 as SwapStepNumber, label: "04 Submit", title: "Review & Send" },
];

export default function SwapProgressBar({
  currentStep,
  onStepClick,
  maxReachedStep
}: SwapProgressBarProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8 sm:mb-12">
      {/* Mobile view step badge */}
      <div className="sm:hidden flex items-center justify-between bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-2xl mb-4">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Step {currentStep} of 4
        </span>
        <span className="text-xs font-black text-milito-green flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-milito-green animate-pulse" />
          {STEPS[currentStep - 1].title}
        </span>
      </div>

      {/* Desktop / Tablet progress bar */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
        {STEPS.map(({ step, label, title }) => {
          const isActive = currentStep === step;
          const isCompleted = currentStep > step;
          const isClickable = step <= maxReachedStep && onStepClick;

          return (
            <button
              key={step}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(step)}
              className={`text-left p-3 sm:p-4 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between ${
                isActive
                  ? "bg-white border-milito-green ring-2 ring-milito-green/20 shadow-md scale-[1.02]"
                  : isCompleted
                  ? "bg-emerald-50/50 border-emerald-200 hover:border-milito-green/50 cursor-pointer"
                  : "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] sm:text-xs font-black tracking-wider uppercase ${
                    isActive
                      ? "text-milito-green"
                      : isCompleted
                      ? "text-emerald-700"
                      : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
                {isCompleted ? (
                  <span className="w-4 h-4 rounded-full bg-milito-green text-black flex items-center justify-center flex-shrink-0 text-[10px]">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                ) : (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? "bg-milito-green animate-ping" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-xs sm:text-sm font-bold truncate hidden sm:block ${
                  isActive ? "text-gray-950" : isCompleted ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {title}
              </span>

              {/* Active Bottom Highlight Line */}
              {isActive && (
                <div className="absolute bottom-0 inset-x-3 h-0.5 bg-milito-green rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
