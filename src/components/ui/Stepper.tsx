import React from "react";

export interface StepperProps {
  totalSteps: number;
  currentStep: number;
  stepLabels?: string[];
  className?: string;
}

export function Stepper({
  totalSteps,
  currentStep,
  stepLabels,
  className = "",
}: StepperProps) {
  return (
    <div className={`w-full space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted">
        <span>
          Step {currentStep} of {totalSteps}
        </span>
        <span>{Math.round((currentStep / totalSteps) * 100)}% complete</span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={stepNumber}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary"
                    : isCurrent
                    ? "bg-primary shadow-xs shadow-primary/30"
                    : "bg-border"
                }`}
              />
              {stepLabels && stepLabels[i] && (
                <span
                  className={`hidden sm:block text-[11px] font-medium truncate w-full text-center ${
                    isCurrent ? "text-primary font-semibold" : "text-muted/70"
                  }`}
                >
                  {stepLabels[i]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}