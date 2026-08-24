"use client";
import React from "react";
import { Check } from "lucide-react";

export default function WizardStepIndicator({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}) {
  return (
    <nav aria-label="Course creation wizard steps" className="w-full py-4">
      <ol className="flex items-center justify-between w-full max-w-3xl mx-auto px-4">
        {steps.map((step, idx) => {
          const isCompleted = completedSteps?.has(idx);
          const isActive = currentStep === idx;
          const isClickable = isCompleted || idx <= currentStep;

          return (
            <li
              key={step.id || step.label}
              className="flex items-center flex-1 last:flex-none relative"
            >
              <button
                type="button"
                disabled={!isClickable}
                aria-current={isActive ? "step" : undefined}
                onClick={() => isClickable && onStepClick && onStepClick(idx)}
                className={`flex items-center gap-2 group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all shadow-xs ${
                    isCompleted
                      ? "bg-accent text-white"
                      : isActive
                      ? "bg-accent/20 border-2 border-accent text-brand-text font-bold"
                      : "bg-muted border border-gray-300 text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : idx + 1}
                </div>
                <span
                  className={`hidden sm:inline-block text-sm font-medium transition-colors ${
                    isActive
                      ? "text-foreground font-semibold"
                      : isCompleted
                      ? "text-brand-text"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {/* Connecting line */}
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mx-2 sm:mx-4 transition-colors ${
                    idx < currentStep ? "bg-accent" : "bg-gray-200"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
