import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
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
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Dashboard | Unrot Daily",
  description: "Welcome back to your daily AI learning habit.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const authUser = await getCurrentUser();
  const demoUser = !authUser ? await getDemoUser() : null;
  const user = authUser || demoUser;

  if (!user) {
    redirect("/login");
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

  const displayName = user.name || (user.email.includes("@") ? user.email.split("@")[0] : "Learner");

  return (
    <div className="min-h-screen flex flex-col bg-background text-text font-sans">
      {/* Simulation Banner (only when preview cookie is set) */}
      {isPreviewMode && <DemoReturnActiveBanner />}

      {/* Navigation Header */}
      <AppHeader currentPath="/home" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 space-y-7">
        {/* Welcome Back Greeting */}
        <div className="space-y-2">
          <Badge variant="success" dot>
            Daily Retention Streak Active
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text">
            Welcome back, {displayName}!
          </h1>
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            {isCompleted
              ? "You have completed your 5-day curriculum. Fantastic consistency!"
              : "5 focused minutes today keeps your AI knowledge current, applied, and sharp."}
          </p>
        </div>

        {/* Current Path Overview */}
        <Card variant="default">
          <CardContent className="p-5 sm:p-6 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase tracking-wider text-muted">Curriculum Track</span>
              <span className="font-medium text-text">{matchedPath.role}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-text">
              {matchedPath.title}
            </h2>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              {matchedPath.description}
            </p>
          </CardContent>
        </Card>

        {/* Hero Card: Next Incomplete Lesson */}
        {!isCompleted && nextLesson ? (
          <Card variant="highlight" className="p-1 sm:p-2 shadow-card">
            <CardContent className="p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between">
                <Badge variant="primary">
                  Today&apos;s Focus · Day {nextLesson.dayNumber}
                </Badge>
                <span className="text-xs font-semibold text-muted">
                  ⏱ ~{nextLesson.durationMinutes} min
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                  {nextLesson.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {nextLesson.summary}
                </p>
              </div>

              <div>
                <Link href="/learn/today" className="w-full block">
                  <Button variant="primary" size="lg" className="w-full text-base">
                    Start Day {nextLesson.dayNumber} Session →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card variant="default" className="text-center p-6 sm:p-8 space-y-4 border-success/30">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-success/10 text-success text-2xl mx-auto shadow-xs">
              ✓
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-text">
                All 5 Lessons Completed!
              </h3>
              <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
                You have reached 100% completion on this curriculum. Review past lessons or adjust your learning goal anytime.
              </p>
            </div>
            <Link href="/plan" className="inline-block">
              <Button variant="primary" size="md">
                Review Full Curriculum
              </Button>
            </Link>
          </Card>
        )}

        {/* Progress Overview Card */}
        <Card variant="default">
          <CardContent className="p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="font-semibold uppercase tracking-wider text-muted">Path Progress</span>
              <span className="font-bold text-text">{completedCount} of {totalCount} Lessons ({progressPercentage}%)</span>
            </div>

            <ProgressBar value={progressPercentage} variant="primary" size="md" />

            <div className="flex justify-between items-center text-xs text-muted pt-1">
              <span>5-day retention habit</span>
              <span>{isCompleted ? "Goal achieved!" : `${totalCount - completedCount} lessons remaining`}</span>
            </div>
          </CardContent>
        </Card>

        {/* Daily Reminder Status Card */}
        <Card variant="default">
          <CardContent className="p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span role="img" aria-label="Bell" className="text-base">
                  🔔
                </span>
                <h4 className="text-sm font-bold text-text">
                  Daily Morning Reminder
                </h4>
              </div>
              <Badge variant={reminderPref?.enabled ? "success" : "neutral"}>
                {reminderPref?.enabled ? "Active" : "Off"}
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              {reminderPref?.enabled
                ? `Scheduled daily at ${reminderPref.reminderTime} (${reminderPref.timezone}).`
                : "Morning reminder is currently off. Set a consistent daily time to anchor your return streak."}
            </p>

            <div className="pt-1">
              <Link
                href="/learn/complete"
                className="text-xs font-semibold text-primary hover:underline transition-all inline-flex items-center gap-1"
              >
                <span>Update reminder time or notification preferences</span>
                <span>→</span>
              </Link>
            </div>
          </CardContent>
        </Card>

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