"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import type { NormalizedLessonContent } from "@/lib/lesson-content";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Stepper } from "@/components/ui/Stepper";
import { LessonTakeaway } from "@/components/ui/LessonTakeaway";
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
  const totalSteps = totalSections + 1;

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

  const handleRetryQuiz = () => {
    setQuizSubmitted(false);
    setIsCorrect(null);
    setSelectedOption(null);
    setExplanation(null);
    setErrorMessage(null);
  };

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

  const stepLabels = [
    ...sections.map((_, i) => `Section ${i + 1}`),
    "Knowledge Check",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-text font-sans">
      {/* Distraction-free Top Header */}
      <header className="border-b border-border px-6 py-3.5 sticky top-0 bg-surface/95 backdrop-blur-md z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-extrabold tracking-tight text-text hover:text-primary transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white font-bold text-xs shadow-xs">
              U
            </div>
            <span>Unrot Daily</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/plan"
              className="text-xs sm:text-sm font-medium text-muted hover:text-text transition-colors flex items-center gap-1"
            >
              <span>← Back to plan</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Reading Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Lesson Metadata Header */}
          <div className="space-y-2 border-b border-border pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant="primary" dot>
                Day {lesson.dayNumber} Focus
              </Badge>
              <span className="text-xs font-semibold text-muted">
                ⏱ ~{lesson.durationMinutes} minutes
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-text">
              {lesson.title}
            </h1>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              {lesson.summary}
            </p>
          </div>

          {/* Stepper Progress */}
          <Stepper
            totalSteps={totalSteps}
            currentStep={currentStep + 1}
            stepLabels={stepLabels}
          />

          {/* Error alert */}
          {errorMessage && (
            <Alert variant="danger" title="Review note">
              {errorMessage}
            </Alert>
          )}

          {/* Section Reader Content */}
          {isReadingSection && currentSection && (
            <article className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                  {currentSection.heading}
                </h2>
                <div className="text-sm sm:text-base text-text/85 leading-relaxed whitespace-pre-line space-y-4 font-normal">
                  {currentSection.body}
                </div>
              </div>

              {/* Practical Example Takeaway Card (displayed on final section) */}
              {currentStep === totalSections - 1 && content.example && (
                <div className="pt-2">
                  <LessonTakeaway
                    title={content.example.title}
                    icon="💡"
                    tag="Applied Mental Model"
                  >
                    {content.example.content}
                  </LessonTakeaway>
                </div>
              )}
            </article>
          )}

          {/* Knowledge Check Step */}
          {currentStep === QUIZ_STEP && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <Badge variant="primary" dot>
                  Active Recall
                </Badge>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                  Verify your mental model
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
                          "border-danger bg-danger/10 text-text font-medium ring-1 ring-danger/30";
                      } else {
                        optionStyle =
                          "border-border/60 opacity-50 text-muted bg-surface";
                      }
                    } else if (isSelected) {
                      optionStyle =
                        "border-primary bg-primary/5 text-text font-medium ring-1 ring-primary shadow-xs";
                    }

                    return (
                      <label
                        key={idx}
                        className={`w-full p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-150 text-sm sm:text-base focus-within:ring-2 focus-within:ring-primary ${optionStyle}`}
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
                          className={`h-4 w-4 rounded-full border shrink-0 flex items-center justify-center transition-colors ${
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

              {/* Feedback and Explanation Alert */}
              {quizSubmitted && (
                <Alert
                  variant={isCorrect ? "success" : "warning"}
                  title={isCorrect ? "Correct! Concept validated." : "Not quite right."}
                >
                  {explanation}
                </Alert>
              )}
            </div>
          )}
        </div>

        {/* Navigation & Action Controls */}
        <div className="mt-12 pt-6 border-t border-border flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleBack}
            disabled={currentStep === 0 || isPending}
          >
            Back
          </Button>

          <div className="flex items-center gap-2">
            {isReadingSection && (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleNext}
                disabled={isPending}
              >
                {currentStep === totalSections - 1
                  ? "Go to Knowledge Check →"
                  : "Next Section →"}
              </Button>
            )}

            {currentStep === QUIZ_STEP && !quizSubmitted && (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleQuizSubmit}
                disabled={selectedOption === null || isPending}
                isLoading={isPending}
              >
                Submit answer
              </Button>
            )}

            {currentStep === QUIZ_STEP && quizSubmitted && (
              <div className="flex items-center gap-2">
                {!isCorrect && (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleRetryQuiz}
                    disabled={isPending}
                  >
                    Retry
                  </Button>
                )}
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleCompleteLesson}
                  isLoading={isPending}
                >
                  Complete lesson ✓
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}