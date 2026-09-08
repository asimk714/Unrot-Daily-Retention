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
import { Card, CardContent } from "@/components/ui/Card";
import { Stepper } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";

const STEP_LABELS = ["Target Role", "Learning Goal", "AI Experience", "Calibration Summary"];

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

  const isContinueDisabled =
    (step === 1 && !role) ||
    (step === 2 && !learningGoal) ||
    (step === 3 && !experienceLevel);

  return (
    <Card variant="default" className="w-full max-w-xl mx-auto shadow-card">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Stepper */}
        <Stepper
          totalSteps={4}
          currentStep={step}
          stepLabels={STEP_LABELS}
          className="pb-2"
        />

        {/* Error Alert */}
        {errorMessage && (
          <Alert variant="danger" title="Validation Note">
            {errorMessage}
          </Alert>
        )}

        {/* Step 1: Role */}
        {step === 1 && (
          <fieldset className="space-y-4">
            <div>
              <legend className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                What is your primary role?
              </legend>
              <p className="text-xs sm:text-sm text-muted mt-1">
                Your daily examples and analogies will be calibrated specifically to your day-to-day work.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-1" role="radiogroup" aria-label="Role options">
              {ALLOWED_ROLES.map((option) => {
                const isSelected = role === option;
                return (
                  <button
                    type="button"
                    key={option}
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setRole(option)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer font-medium text-sm sm:text-base flex items-center justify-between focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99] ${
                      isSelected
                        ? "border-primary bg-primary/5 text-text ring-1 ring-primary shadow-xs"
                        : "border-border hover:border-primary/40 text-text bg-surface"
                    }`}
                  >
                    <span>{option}</span>
                    <span
                      className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-border"
                      }`}
                    >
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
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
            <div>
              <legend className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                What is your primary focus?
              </legend>
              <p className="text-xs sm:text-sm text-muted mt-1">
                Choose the concrete outcome you want from your 5-minute daily micro-sessions.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-1" role="radiogroup" aria-label="Goal options">
              {ALLOWED_GOALS.map((option) => {
                const isSelected = learningGoal === option;
                return (
                  <button
                    type="button"
                    key={option}
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setLearningGoal(option)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer font-medium text-sm sm:text-base flex items-center justify-between focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99] ${
                      isSelected
                        ? "border-primary bg-primary/5 text-text ring-1 ring-primary shadow-xs"
                        : "border-border hover:border-primary/40 text-text bg-surface"
                    }`}
                  >
                    <span>{option}</span>
                    <span
                      className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-border"
                      }`}
                    >
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
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
            <div>
              <legend className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                What is your current AI experience?
              </legend>
              <p className="text-xs sm:text-sm text-muted mt-1">
                This fine-tunes technical depth so reviews stay engaging without overwhelming you.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-1" role="radiogroup" aria-label="Experience level options">
              {ALLOWED_EXPERIENCES.map((option) => {
                const isSelected = experienceLevel === option;
                return (
                  <button
                    type="button"
                    key={option}
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setExperienceLevel(option)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer font-medium text-sm sm:text-base flex items-center justify-between focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99] ${
                      isSelected
                        ? "border-primary bg-primary/5 text-text ring-1 ring-primary shadow-xs"
                        : "border-border hover:border-primary/40 text-text bg-surface"
                    }`}
                  >
                    <span>{option}</span>
                    <span
                      className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-border"
                      }`}
                    >
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="success" dot>
                  Calibrated
                </Badge>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                Your 5-day habit is ready
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-1">
                Here is how we have configured your daily micro-curriculum based on your choices:
              </p>
            </div>

            <div className="bg-background border border-border rounded-xl p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted font-medium">Target Role:</span>
                <span className="text-text font-bold">{role}</span>
              </div>
              <div className="border-t border-border-subtle pt-3 flex items-center justify-between text-sm">
                <span className="text-muted font-medium">Primary Goal:</span>
                <span className="text-text font-bold text-right">{learningGoal}</span>
              </div>
              <div className="border-t border-border-subtle pt-3 flex items-center justify-between text-sm">
                <span className="text-muted font-medium">Experience Level:</span>
                <span className="text-text font-bold">{experienceLevel}</span>
              </div>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Sessions take ~5 minutes each day. Each includes a mental model, real-world case study, and an interactive active-recall check.
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleBack}
              disabled={isPending}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleContinue}
              disabled={isContinueDisabled}
            >
              Continue →
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSubmit}
              isLoading={isPending}
            >
              Create my learning plan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}