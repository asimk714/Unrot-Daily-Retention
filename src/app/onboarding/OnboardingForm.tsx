"use client";

import { useState, useTransition } from "react";
import {
  ALLOWED_ROLES,
  ALLOWED_GOALS,
  ALLOWED_EXPERIENCES,
  type AllowedRole,
  type AllowedGoal,
  type AllowedExperience,
} from "@/lib/validation";
import { submitOnboarding } from "@/app/actions/onboarding";

export function OnboardingForm() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [role, setRole] = useState<AllowedRole | "">("");
  const [learningGoal, setLearningGoal] = useState<AllowedGoal | "">("");
  const [experienceLevel, setExperienceLevel] = useState<AllowedExperience | "">("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleContinue = () => {
    setErrorMessage(null);
    if (step === 1 && !role) return;
    if (step === 2 && !learningGoal) return;
    if (step === 3 && !experienceLevel) return;
    if (step < 4) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleSubmit = () => {
    if (!role || !learningGoal || !experienceLevel) {
      setErrorMessage("Please complete all steps before creating your plan.");
      return;
    }

    setErrorMessage(null);
    const formData = new FormData();
    formData.append("role", role);
    formData.append("learningGoal", learningGoal);
    formData.append("experienceLevel", experienceLevel);

    startTransition(async () => {
      const result = await submitOnboarding(null, formData);
      if (result && result.error) {
        setErrorMessage(result.error);
      }
    });
  };

  // Determine if Continue button should be enabled
  const isContinueDisabled =
    (step === 1 && !role) ||
    (step === 2 && !learningGoal) ||
    (step === 3 && !experienceLevel);

  return (
    <div className="w-full max-w-xl mx-auto bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs">
      {/* Progress header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted mb-2">
          <span>Step {step} of 4</span>
          <span>{Math.round((step / 4) * 100)}% completed</span>
        </div>
        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl dark:text-red-400 dark:bg-red-950/40 dark:border-red-900/60"
        >
          {errorMessage}
        </div>
      )}

      {/* Step 1: Role */}
      {step === 1 && (
        <fieldset className="space-y-4">
          <legend className="text-xl sm:text-2xl font-bold tracking-tight text-text mb-1">
            What is your current role?
          </legend>
          <p className="text-sm text-muted mb-4">
            We personalize your daily examples and focus areas based on what you do.
          </p>
          <div className="grid grid-cols-1 gap-2.5" role="radiogroup" aria-label="Role options">
            {ALLOWED_ROLES.map((option) => {
              const isSelected = role === option;
              return (
                <button
                  type="button"
                  key={option}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setRole(option)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer font-medium text-sm sm:text-base flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isSelected
                      ? "border-primary bg-primary/5 text-text ring-1 ring-primary/40 shadow-xs"
                      : "border-border hover:border-primary/40 text-text bg-surface"
                  }`}
                >
                  <span>{option}</span>
                  <span
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-border"
                    }`}
                  >
                    {isSelected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Step 2: Learning Goal */}
      {step === 2 && (
        <fieldset className="space-y-4">
          <legend className="text-xl sm:text-2xl font-bold tracking-tight text-text mb-1">
            What is your primary learning goal?
          </legend>
          <p className="text-sm text-muted mb-4">
            Choose the outcome you want from your 5-minute daily sessions.
          </p>
          <div className="grid grid-cols-1 gap-2.5" role="radiogroup" aria-label="Goal options">
            {ALLOWED_GOALS.map((option) => {
              const isSelected = learningGoal === option;
              return (
                <button
                  type="button"
                  key={option}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setLearningGoal(option)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer font-medium text-sm sm:text-base flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isSelected
                      ? "border-primary bg-primary/5 text-text ring-1 ring-primary/40 shadow-xs"
                      : "border-border hover:border-primary/40 text-text bg-surface"
                  }`}
                >
                  <span>{option}</span>
                  <span
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-border"
                    }`}
                  >
                    {isSelected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Step 3: Experience Level */}
      {step === 3 && (
        <fieldset className="space-y-4">
          <legend className="text-xl sm:text-2xl font-bold tracking-tight text-text mb-1">
            What is your experience with AI?
          </legend>
          <p className="text-sm text-muted mb-4">
            This calibrates the depth and technical terminology of your daily reviews.
          </p>
          <div
            className="grid grid-cols-1 gap-2.5"
            role="radiogroup"
            aria-label="Experience level options"
          >
            {ALLOWED_EXPERIENCES.map((option) => {
              const isSelected = experienceLevel === option;
              return (
                <button
                  type="button"
                  key={option}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setExperienceLevel(option)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer font-medium text-sm sm:text-base flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isSelected
                      ? "border-primary bg-primary/5 text-text ring-1 ring-primary/40 shadow-xs"
                      : "border-border hover:border-primary/40 text-text bg-surface"
                  }`}
                >
                  <span>{option}</span>
                  <span
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-border"
                    }`}
                  >
                    {isSelected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text mb-2">
              Ready to start your plan
            </h2>
            <p className="text-sm text-muted">
              We will generate a personalized 5-minute daily learning path matched to your selections.
            </p>
          </div>

          <div className="bg-background border border-border rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted font-medium">Role:</span>
              <span className="text-text font-semibold">{role}</span>
            </div>
            <div className="border-t border-border pt-3 flex items-center justify-between text-sm">
              <span className="text-muted font-medium">Primary Goal:</span>
              <span className="text-text font-semibold text-right">{learningGoal}</span>
            </div>
            <div className="border-t border-border pt-3 flex items-center justify-between text-sm">
              <span className="text-muted font-medium">Experience:</span>
              <span className="text-text font-semibold">{experienceLevel}</span>
            </div>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            Your plan contains focused 5-minute sessions with concise explanations, practical examples, and quick knowledge checks.
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="mt-8 pt-6 border-t border-border flex items-center justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            disabled={isPending}
            className="px-5 py-2.5 rounded-full border border-border text-sm font-medium text-text hover:bg-background transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={handleContinue}
            disabled={isContinueDisabled}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isContinueDisabled
                ? "bg-border text-muted cursor-not-allowed"
                : "bg-primary hover:bg-primary-hover text-white cursor-pointer shadow-xs"
            }`}
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="px-7 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {isPending ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Creating your plan...</span>
              </>
            ) : (
              "Create my learning plan"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
