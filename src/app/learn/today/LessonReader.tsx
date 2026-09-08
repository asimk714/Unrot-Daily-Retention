"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import type { NormalizedLessonContent } from "@/lib/lesson-content";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  startLessonAction,
  recordSectionViewedAction,
  recordQuizStartedAction,
  submitQuizAction,
  completeLessonAction,
} from "@/app/learn/actions";

export interface LessonReaderProps {
  lesson: {
    id: string;
    dayNumber: number;
    title: string;
    summary: string;
    durationMinutes: number;
  };
  content: NormalizedLessonContent;
  initialProgress?: {
    startedAt: string | null;
    completedAt: string | null;
    quizScore: number | null;
  } | null;
}

export function LessonReader({ lesson, content, initialProgress }: LessonReaderProps) {
  const sections = content.sections;
  const totalSections = sections.length;
  // Step indices: 0 to (totalSections - 1) are content sections; totalSections is Quiz step
  const QUIZ_STEP = totalSections;

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(
    initialProgress?.quizScore !== null && initialProgress?.quizScore !== undefined
  );
  const [isCorrect, setIsCorrect] = useState<boolean | null>(
    initialProgress?.quizScore !== null && initialProgress?.quizScore !== undefined
      ? initialProgress.quizScore >= 1.0
      : null
  );
  const [explanation, setExplanation] = useState<string | null>(
    quizSubmitted ? content.quiz.explanation : null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  // On mount: ensure lesson is recorded as started
  useEffect(() => {
    startLessonAction(lesson.id);
    recordSectionViewedAction(lesson.id, 0);
  }, [lesson.id]);

  // Navigate to previous section
  const handleBack = () => {
    setErrorMessage(null);
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      if (prev < totalSections) {
        recordSectionViewedAction(lesson.id, prev);
      }
    }
  };

  // Navigate to next section or enter quiz
  const handleNext = () => {
    setErrorMessage(null);
    if (currentStep < totalSections) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (next < totalSections) {
        recordSectionViewedAction(lesson.id, next);
      } else if (next === QUIZ_STEP) {
        recordQuizStartedAction(lesson.id);
      }
    }
  };

  // Handle quiz submission
  const handleQuizSubmit = () => {
    if (selectedOption === null) {
      setErrorMessage("Please choose an answer before submitting.");
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const res = await submitQuizAction(lesson.id, selectedOption);
      if (!res.success || !res.data) {
        setErrorMessage(res.error || "Failed to submit answer. Please try again.");
        return;
      }

      setQuizSubmitted(true);
      setIsCorrect(res.data.isCorrect);
      setExplanation(res.data.explanation);
    });
  };

  // Allow retrying if answered incorrectly
  const handleRetryQuiz = () => {
    setQuizSubmitted(false);
    setIsCorrect(null);
    setSelectedOption(null);
    setExplanation(null);
    setErrorMessage(null);
  };

  // Complete lesson and redirect
  const handleCompleteLesson = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await completeLessonAction(lesson.id);
      if (res && res.error) {
        setErrorMessage(res.error);
      }
    });
  };

  const isReadingSection = currentStep < totalSections;
  const currentSection = isReadingSection ? sections[currentStep] : null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-text font-sans">
      {/* Top Header */}
      <header className="border-b border-border px-6 py-4 sticky top-0 bg-surface/95 backdrop-blur-xs z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-text hover:opacity-80 transition-opacity"
          >
            Unrot Daily
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/plan"
              className="text-xs sm:text-sm font-medium text-muted hover:text-text transition-colors flex items-center gap-1"
            >
              ← Back to plan
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Lesson Metadata Header */}
          <div className="space-y-2 border-b border-border pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                Day {lesson.dayNumber}
              </span>
              <span>⏱ ~{lesson.durationMinutes} minutes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              {lesson.title}
            </h1>
            <p className="text-sm text-muted leading-relaxed">
              {lesson.summary}
            </p>
          </div>

          {/* Progress Indicator */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-muted mb-2">
              <span>
                {isReadingSection
                  ? `Section ${currentStep + 1} of ${totalSections}`
                  : "Knowledge Check"}
              </span>
              <span>
                {Math.round(((currentStep + (quizSubmitted ? 1 : 0)) / (totalSections + 1)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${((currentStep + (quizSubmitted ? 1 : 0)) / (totalSections + 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Global error alert */}
          {errorMessage && (
            <div
              role="alert"
              aria-live="polite"
              className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl dark:text-red-400 dark:bg-red-950/40 dark:border-red-900/60"
            >
              {errorMessage}
            </div>
          )}

          {/* Section Reader Content */}
          {isReadingSection && currentSection && (
            <article className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                  {currentSection.heading}
                </h2>
                <div className="text-base text-text/85 leading-relaxed whitespace-pre-line space-y-4">
                  {currentSection.body}
                </div>
              </div>

              {/* Practical Example Panel (displayed on final reading section if present) */}
              {currentStep === totalSections - 1 && content.example && (
                <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-accent/5 border border-accent/20 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                    <span role="img" aria-label="Example">
                      💡
                    </span>
                    <span>Practical Example: {content.example.title}</span>
                  </div>
                  <p className="text-sm text-text/85 leading-relaxed">
                    {content.example.content}
                  </p>
                </div>
              )}
            </article>
          )}

          {/* Knowledge Check Step */}
          {currentStep === QUIZ_STEP && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary">
                  Quick Knowledge Check
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                  Check your understanding
                </h2>
              </div>

              <fieldset className="space-y-4">
                <legend className="text-base sm:text-lg font-medium text-text mb-3">
                  {content.quiz.question}
                </legend>

                <div
                  className="space-y-2.5"
                  role="radiogroup"
                  aria-label="Knowledge check options"
                >
                  {content.quiz.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrectAnswer = idx === content.quiz.correctIndex;
                    let optionStyle =
                      "border-border hover:border-primary/40 text-text bg-surface";

                    if (quizSubmitted) {
                      if (isCorrectAnswer) {
                        optionStyle =
                          "border-success bg-success/10 text-text font-medium ring-1 ring-success/30";
                      } else if (isSelected && !isCorrect) {
                        optionStyle =
                          "border-red-500 bg-red-500/10 text-text font-medium ring-1 ring-red-500/30";
                      } else {
                        optionStyle =
                          "border-border/60 opacity-50 text-muted bg-surface";
                      }
                    } else if (isSelected) {
                      optionStyle =
                        "border-primary bg-primary/5 text-text font-medium ring-1 ring-primary/40 shadow-xs";
                    }

                    return (
                      <label
                        key={idx}
                        className={`w-full p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all text-sm sm:text-base focus-within:ring-2 focus-within:ring-primary ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3 pr-2">
                          <input
                            type="radio"
                            name="quiz-answer"
                            value={idx}
                            checked={isSelected}
                            disabled={quizSubmitted || isPending}
                            onChange={() => setSelectedOption(idx)}
                            className="sr-only"
                          />
                          <span>{option}</span>
                        </div>

                        <span
                          className={`h-4 w-4 rounded-full border shrink-0 flex items-center justify-center ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-border"
                          }`}
                        >
                          {isSelected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* Feedback Alert and Explanation */}
              {quizSubmitted && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`p-5 rounded-2xl border space-y-2.5 shadow-xs ${
                    isCorrect
                      ? "bg-success/10 border-success/30 text-text"
                      : "bg-amber-500/10 border-amber-500/30 text-text"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                    {isCorrect ? (
                      <>
                        <span role="img" aria-label="Success">
                          ✅
                        </span>
                        <span className="text-success">Correct! Great work.</span>
                      </>
                    ) : (
                      <>
                        <span role="img" aria-label="Incorrect">
                          ⚠️
                        </span>
                        <span className="text-accent">Not quite right.</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed opacity-90">{explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation & Action Controls */}
        <div className="mt-12 pt-6 border-t border-border flex items-center justify-between gap-3">
          {/* Back button */}
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0 || isPending}
            className="px-5 py-2.5 rounded-full border border-border text-sm font-medium text-text hover:bg-surface transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Back
          </button>

          {/* Forward / Action buttons */}
          <div className="flex items-center gap-2">
            {isReadingSection && (
              <button
                type="button"
                onClick={handleNext}
                disabled={isPending}
                className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {currentStep === totalSections - 1
                  ? "Go to Knowledge Check →"
                  : "Next Section →"}
              </button>
            )}

            {currentStep === QUIZ_STEP && !quizSubmitted && (
              <button
                type="button"
                onClick={handleQuizSubmit}
                disabled={selectedOption === null || isPending}
                className="px-7 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex items-center gap-2"
              >
                {isPending ? "Submitting..." : "Submit answer"}
              </button>
            )}

            {currentStep === QUIZ_STEP && quizSubmitted && (
              <div className="flex items-center gap-2">
                {!isCorrect && (
                  <button
                    type="button"
                    onClick={handleRetryQuiz}
                    disabled={isPending}
                    className="px-4 py-2.5 rounded-full border border-border text-sm font-medium text-text hover:bg-surface transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Retry
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCompleteLesson}
                  disabled={isPending}
                  className="px-7 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex items-center gap-2"
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
                      <span>Completing...</span>
                    </>
                  ) : (
                    "Complete lesson ✓"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
