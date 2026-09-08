import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import { matchLearningPath } from "@/lib/learning-path";
import {
  getNextIncompleteLesson,
  getReminderPreference,
  isDemoReturnPreviewActive,
} from "@/lib/reminders";
import { recordEvent } from "@/lib/analytics";
import { DemoReturnActiveBanner } from "@/components/reminders/DemoReturnControls";
import { AppHeader } from "@/components/navigation/AppHeader";

export const metadata: Metadata = {
  title: "Dashboard | Unrot Daily",
  description: "Welcome back to your daily AI learning habit.",
};

export default async function HomePage() {
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

  // Determine progress and next incomplete lesson
  const { nextLesson, completedCount, totalCount, isCompleted } =
    await getNextIncompleteLesson(user.id, matchedPath.id);

  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  // Retrieve reminder settings
  const reminderPref = await getReminderPreference(user.id);
  const isPreviewMode = await isDemoReturnPreviewActive();

  // Record analytics:
  // CRITICAL RULE: When in demo preview mode, DO NOT emit session_returned_d1.
  // Instead, record demo_return_previewed or return_home_viewed.
  if (isPreviewMode) {
    await recordEvent(
      "demo_return_previewed",
      user.id,
      {
        pathId: matchedPath.id,
        completedCount,
        nextDayNumber: nextLesson?.dayNumber ?? null,
      },
      "/home"
    );
  } else {
    await recordEvent(
      "return_home_viewed",
      user.id,
      {
        pathId: matchedPath.id,
        completedCount,
        isCompleted,
      },
      "/home"
    );
  }

  const displayName = user.name || "Learner";

  return (
    <div className="min-h-screen flex flex-col bg-background text-text font-sans">
      {/* Simulation Banner (only when demo preview cookie is active) */}
      {isPreviewMode && <DemoReturnActiveBanner />}

      {/* Navigation Header */}
      <AppHeader currentPath="/home" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 space-y-7">
        {/* Welcome Back Greeting */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-muted text-xs font-semibold uppercase tracking-wider shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Daily Habit Loop Active
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text">
            {`Welcome back, ${displayName}!`}
          </h1>
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            {isCompleted
              ? "You have completed your 5-day curriculum. Fantastic consistency!"
              : "5 focused minutes today keeps your AI knowledge current and sharp."}
          </p>
        </div>

        {/* Current Path & Goal Overview */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="font-semibold uppercase tracking-wider">Your Learning Goal</span>
            <span>{matchedPath.role}</span>
          </div>
          <h2 className="text-lg font-bold text-text">
            {matchedPath.title}
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            {matchedPath.description}
          </p>
        </div>

        {/* Next Incomplete Lesson Card (Hero) */}
        {!isCompleted && nextLesson ? (
          <div className="rounded-2xl border-2 border-primary/30 dark:border-primary/40 bg-surface p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider">
                {`Today's Focus · Day ${nextLesson.dayNumber}`}
              </span>
              <span className="text-xs font-medium text-muted">
                {`⏱ ~${nextLesson.durationMinutes} min`}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-text">
                {nextLesson.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {nextLesson.summary}
              </p>
            </div>

            <Link
              href="/learn/today"
              className="w-full inline-flex items-center justify-center py-3.5 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-base transition-colors shadow-xs text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {`Start Day ${nextLesson.dayNumber} Session →`}
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-success/30 bg-surface p-6 sm:p-7 space-y-4 text-center shadow-xs">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-success/10 text-success text-2xl mx-auto">
              ✓
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-text">
                All 5 Lessons Completed!
              </h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                You have reached 100% completion on this learning path. Review past lessons or explore your plan anytime.
              </p>
            </div>
            <Link
              href="/plan"
              className="inline-flex items-center justify-center py-2.5 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors shadow-xs"
            >
              Review Full Curriculum
            </Link>
          </div>
        )}

        {/* Progress Overview Card */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-muted">
            <span className="font-semibold uppercase tracking-wider text-muted">Path Progress</span>
            <span className="font-semibold text-text">{`${completedCount} of ${totalCount} Lessons Complete (${progressPercentage}%)`}</span>
          </div>

          <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs text-muted pt-1">
            <span>Started 5-day habit</span>
            <span>{isCompleted ? "Goal achieved!" : `${totalCount - completedCount} lessons remaining`}</span>
          </div>
        </div>

        {/* Daily Reminder Status Card */}
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span role="img" aria-label="Bell" className="text-base">
                🔔
              </span>
              <h4 className="text-sm font-bold text-text">
                Daily Reminder
              </h4>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                reminderPref?.enabled
                  ? "bg-success/10 text-success"
                  : "bg-border text-muted"
              }`}
            >
              {reminderPref?.enabled ? "Active" : "Not Set / Off"}
            </span>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            {reminderPref?.enabled
              ? `Scheduled daily at ${reminderPref.reminderTime} (${reminderPref.timezone}).`
              : "Morning reminder is currently off. Set a consistent daily time to keep your streak alive."}
          </p>

          <div className="pt-1 flex items-center justify-between">
            <Link
              href="/learn/complete"
              className="text-xs font-semibold text-primary underline hover:opacity-80 transition-opacity"
            >
              Update reminder time or preferences →
            </Link>
          </div>
        </div>

        {/* Footer Navigation Link */}
        <div className="pt-2 text-center">
          <Link
            href="/plan"
            className="text-xs sm:text-sm font-medium text-muted hover:text-text transition-colors inline-flex items-center gap-1.5"
          >
            <span>← View full 5-day syllabus &amp; lesson archive</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
