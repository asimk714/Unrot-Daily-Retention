import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import { matchLearningPath } from "@/lib/learning-path";
import { getReminderPreference } from "@/lib/reminders";
import { ReminderForm } from "@/components/reminders/ReminderForm";
import { DemoReturnTriggerCard } from "@/components/reminders/DemoReturnControls";
import { recordEvent, EVENT_NAMES } from "@/lib/analytics";
import { AppHeader } from "@/components/navigation/AppHeader";

export const metadata: Metadata = {
  title: "Lesson Complete | Unrot Daily",
  description: "Great work completing today's daily session.",
};

export default async function LearnCompletePage() {
  const user = await getDemoUser();
  if (!user) {
    redirect("/onboarding");
  }

  const preferences = await prisma.userPreference.findUnique({
    where: { userId: user.id },
  });

  if (!preferences) {
    redirect("/onboarding");
  }

  const matchedPath = await matchLearningPath(
    preferences.role,
    preferences.learningGoal
  );

  if (!matchedPath || matchedPath.lessons.length === 0) {
    redirect("/plan");
  }

  // Load progress for user's lessons
  const lessonIds = matchedPath.lessons.map((l) => l.id);
  const completedProgresses = await prisma.lessonProgress.findMany({
    where: {
      userId: user.id,
      lessonId: { in: lessonIds },
      completedAt: { not: null },
    },
    orderBy: { completedAt: "desc" },
  });

  // Verify that at least one lesson has been completed
  if (completedProgresses.length === 0) {
    redirect("/learn/today");
  }

  const mostRecentProgress = completedProgresses[0];
  const mostRecentLesson =
    matchedPath.lessons.find((l) => l.id === mostRecentProgress.lessonId) ??
    matchedPath.lessons[0];

  // Find next lesson after the most recently completed one
  const nextLessonIndex =
    matchedPath.lessons.findIndex((l) => l.id === mostRecentLesson.id) + 1;
  const tomorrowLesson =
    nextLessonIndex < matchedPath.lessons.length
      ? matchedPath.lessons[nextLessonIndex]
      : null;

  const completedCount = completedProgresses.length;
  const totalLessons = matchedPath.lessons.length;
  const progressPercentage = Math.round((completedCount / totalLessons) * 100);
  const isQuizPassed =
    mostRecentProgress.quizScore !== null && mostRecentProgress.quizScore >= 1.0;

  // Retrieve existing reminder preferences
  const existingReminder = await getReminderPreference(user.id);

  // Record reminder_settings_viewed
  await recordEvent(
    EVENT_NAMES.REMINDER_SETTINGS_VIEWED,
    user.id,
    {
      enabled: existingReminder?.enabled ?? true,
      hasExistingReminder: !!existingReminder,
    },
    "/learn/complete"
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-text font-sans">
      {/* Header */}
      <AppHeader currentPath="/learn/complete" />

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* Celebration Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success/10 text-success text-3xl mb-1 shadow-xs">
            ✓
          </div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-muted">
            Daily Habit Maintained
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text">
            {`Day ${mostRecentLesson.dayNumber} Complete!`}
          </h1>
          <p className="text-base text-muted max-w-md mx-auto leading-relaxed">
            You finished <span className="font-semibold text-text">&ldquo;{mostRecentLesson.title}&rdquo;</span>.
            Five focused minutes built your knowledge today.
          </p>
        </div>

        {/* Learning Achievement Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Session Summary
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Knowledge Check Score */}
            <div className="p-4 rounded-xl border border-border bg-background space-y-1">
              <span className="text-xs text-muted block">Knowledge Check</span>
              <div className="text-xl font-bold text-text flex items-center gap-2">
                <span>{isQuizPassed ? "1 / 1 Correct" : "Reviewed"}</span>
                {isQuizPassed && <span className="text-success text-sm font-bold">✓</span>}
              </div>
              <p className="text-xs text-muted">
                {isQuizPassed ? "Concept validated" : "Knowledge check reviewed"}
              </p>
            </div>

            {/* Curriculum Progress */}
            <div className="p-4 rounded-xl border border-border bg-background space-y-1">
              <span className="text-xs text-muted block">Path Progress</span>
              <div className="text-xl font-bold text-text">
                {`${completedCount} of ${totalLessons} Lessons`}
              </div>
              <p className="text-xs text-muted">
                {`${progressPercentage}% curriculum completed`}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs text-muted font-medium">
              <span>{matchedPath.title}</span>
              <span>{`${progressPercentage}%`}</span>
            </div>
            <div className="w-full bg-border rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tomorrow's Lesson Preview Card */}
        {tomorrowLesson ? (
          <div className="border border-border rounded-2xl p-6 bg-surface shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted">
              <span>{`Tomorrow's Focus · Day ${tomorrowLesson.dayNumber}`}</span>
              <span>{`⏱ ~${tomorrowLesson.durationMinutes} min`}</span>
            </div>
            <h3 className="text-xl font-bold text-text">
              {tomorrowLesson.title}
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              {tomorrowLesson.summary}
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-2xl p-6 bg-surface text-center space-y-2 shadow-xs">
            <h3 className="text-lg font-bold text-text">
              Congratulations! You completed the entire curriculum.
            </h3>
            <p className="text-sm text-muted">
              Return to your plan anytime to review past topics or select a new goal.
            </p>
          </div>
        )}

        {/* Stage 6: Daily Reminder Preferences Form */}
        <ReminderForm
          initialEnabled={existingReminder?.enabled ?? true}
          initialTime={existingReminder?.reminderTime ?? "08:00"}
          initialTimezone={existingReminder?.timezone ?? preferences.timezone ?? "UTC"}
        />

        {/* Stage 6: Simulated Return Loop Card */}
        <DemoReturnTriggerCard />

        {/* Navigation Action */}
        <div className="pt-2">
          <Link
            href="/plan"
            className="w-full inline-flex items-center justify-center py-3.5 px-6 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold text-base transition-colors shadow-xs text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Back to your plan
          </Link>
        </div>
      </main>
    </div>
  );
}
