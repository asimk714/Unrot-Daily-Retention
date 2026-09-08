import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import { matchLearningPath } from "@/lib/learning-path";
import { getReminderPreference } from "@/lib/reminders";
import { ReminderForm } from "@/components/reminders/ReminderForm";
import { DemoReturnTriggerCard } from "@/components/reminders/DemoReturnControls";
import { recordEvent, EVENT_NAMES } from "@/lib/analytics";
import { AppHeader } from "@/components/navigation/AppHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";

export const metadata: Metadata = {
  title: "Lesson Complete | Unrot Daily",
  description: "Great work completing today's daily session.",
};

export const dynamic = "force-dynamic";

export default async function LearnCompletePage() {
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

  if (completedProgresses.length === 0) {
    redirect("/learn/today");
  }

  const mostRecentProgress = completedProgresses[0];
  const mostRecentLesson =
    matchedPath.lessons.find((l) => l.id === mostRecentProgress.lessonId) ??
    matchedPath.lessons[0];

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

  const existingReminder = await getReminderPreference(user.id);

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
      <AppHeader currentPath="/learn/complete" />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* Celebration Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success/10 text-success text-3xl mb-1 shadow-xs mx-auto">
            ✓
          </div>
          <div>
            <Badge variant="success" dot className="mx-auto mb-1">
              Daily Habit Maintained
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text">
            Day {mostRecentLesson.dayNumber} Complete!
          </h1>
          <p className="text-sm sm:text-base text-muted max-w-md mx-auto leading-relaxed">
            You finished <span className="font-bold text-text">&ldquo;{mostRecentLesson.title}&rdquo;</span>.
            Five focused minutes successfully reinforced your knowledge today.
          </p>
        </div>

        {/* Session Summary Card */}
        <Card variant="default">
          <CardContent className="p-6 sm:p-7 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted block">
              Session Summary
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-background/60 space-y-1">
                <span className="text-xs text-muted block font-medium">Knowledge Check</span>
                <div className="text-xl font-extrabold text-text flex items-center gap-2">
                  <span>{isQuizPassed ? "1 / 1 Correct" : "Reviewed"}</span>
                  {isQuizPassed && <span className="text-success text-sm font-bold">✓</span>}
                </div>
                <p className="text-xs text-muted">
                  {isQuizPassed ? "Concept validated" : "Knowledge check completed"}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background/60 space-y-1">
                <span className="text-xs text-muted block font-medium">Path Progress</span>
                <div className="text-xl font-extrabold text-text">
                  {completedCount} of {totalLessons} Lessons
                </div>
                <p className="text-xs text-muted">
                  {progressPercentage}% curriculum completed
                </p>
              </div>
            </div>

            <ProgressBar
              value={progressPercentage}
              label={matchedPath.title}
              showPercentage
              variant="primary"
            />
          </CardContent>
        </Card>

        {/* Tomorrow's Lesson Preview Card */}
        {tomorrowLesson ? (
          <Card variant="highlight">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="primary">
                  Tomorrow&apos;s Focus · Day {tomorrowLesson.dayNumber}
                </Badge>
                <span className="text-xs font-semibold text-muted">
                  ⏱ ~{tomorrowLesson.durationMinutes} min
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-text">
                {tomorrowLesson.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                {tomorrowLesson.summary}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card variant="default" className="text-center p-6 space-y-2 border-success/30">
            <h3 className="text-lg font-bold text-text">
              Congratulations! You completed the entire 5-day curriculum.
            </h3>
            <p className="text-xs sm:text-sm text-muted">
              Return to your plan anytime to review past topics or select a new focus.
            </p>
          </Card>
        )}

        {/* Daily Reminder Preferences Form */}
        <ReminderForm
          initialEnabled={existingReminder?.enabled ?? true}
          initialTime={existingReminder?.reminderTime ?? "08:00"}
          initialTimezone={existingReminder?.timezone ?? preferences.timezone ?? "UTC"}
        />

        {/* Simulated Return Loop Card */}
        <DemoReturnTriggerCard />

        {/* Action Link */}
        <div className="pt-2">
          <Link href="/plan" className="w-full block">
            <Button variant="primary" size="lg" className="w-full">
              Back to your plan
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}