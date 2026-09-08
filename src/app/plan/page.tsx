import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import { matchLearningPath } from "@/lib/learning-path";
import { recordEvent } from "@/lib/analytics";
import { AppHeader } from "@/components/navigation/AppHeader";

export const metadata: Metadata = {
  title: "Your Learning Plan | Unrot Daily",
  description: "Your personalized 5-minute daily AI review path.",
};

export default async function PlanPage() {
  // 1. Read demo user from HTTP-only cookie
  const user = await getDemoUser();

  if (!user) {
    redirect("/onboarding");
  }

  // 2. Load user preferences
  const preferences = await prisma.userPreference.findUnique({
    where: { userId: user.id },
  });

  if (!preferences) {
    redirect("/onboarding");
  }

  // 3. Load matched learning path with lessons ordered by dayNumber
  const matchedPath = await matchLearningPath(
    preferences.role,
    preferences.learningGoal
  );

  // 4. Record plan_viewed analytics event
  await recordEvent(
    "plan_viewed",
    user.id,
    {
      role: preferences.role,
      goal: preferences.learningGoal,
      pathId: matchedPath?.id ?? null,
    },
    "/plan"
  );

  // Recovery state if no matching path is found
  if (!matchedPath || matchedPath.lessons.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-text">
        <AppHeader currentPath="/plan" />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-surface border border-border rounded-2xl p-8 space-y-4 shadow-xs">
            <h1 className="text-2xl font-bold text-text">
              Learning Path Unavailable
            </h1>
            <p className="text-sm text-muted leading-relaxed">
              We could not find an active learning path for your selected role and goal.
              Please update your preferences to generate a path.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors shadow-xs"
            >
              Update preferences
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const todayLesson = matchedPath.lessons[0];
  const upcomingLessons = matchedPath.lessons.slice(1, 3);

  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      {/* Header */}
      <AppHeader currentPath="/plan" />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* Title Section */}
        <div className="space-y-2">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary">
            Personalized Curriculum
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text">
            Your Learning Plan
          </h1>
          <h2 className="text-lg sm:text-xl font-semibold text-text/90">
            {matchedPath.title}
          </h2>
          <p className="text-base text-muted max-w-2xl leading-relaxed">
            {matchedPath.description}
          </p>
        </div>

        {/* User Preferences Pill Card */}
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Your Profile Calibration
            </h2>
            <Link
              href="/onboarding"
              className="text-xs text-primary font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              Edit
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="block text-muted text-xs mb-1">Target Role</span>
              <span className="font-semibold text-text">{preferences.role}</span>
            </div>
            <div>
              <span className="block text-muted text-xs mb-1">Primary Goal</span>
              <span className="font-semibold text-text">{preferences.learningGoal}</span>
            </div>
            <div>
              <span className="block text-muted text-xs mb-1">Experience Level</span>
              <span className="font-semibold text-text">{preferences.experienceLevel}</span>
            </div>
          </div>
        </div>

        {/* Today's First Lesson Card */}
        {todayLesson && (
          <div className="border-2 border-primary/30 dark:border-primary/40 rounded-2xl p-6 sm:p-8 bg-surface shadow-xs space-y-6 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-primary text-white">
                Today · Day {todayLesson.dayNumber}
              </span>
              <span className="text-xs font-medium text-muted flex items-center gap-1">
                ⏱ ~{todayLesson.durationMinutes} minutes
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
                {todayLesson.title}
              </h2>
              <p className="text-base text-muted leading-relaxed">
                {todayLesson.summary}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/learn/today"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold text-base transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Start today’s lesson
              </Link>
            </div>
          </div>
        )}

        {/* Upcoming Lessons Preview */}
        {upcomingLessons.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Tomorrow & Ahead
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-5 rounded-xl border border-border bg-surface hover:border-primary/40 transition-colors space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="font-semibold">Day {lesson.dayNumber}</span>
                    <span>~{lesson.durationMinutes} min</span>
                  </div>
                  <h3 className="font-bold text-text text-base">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                    {lesson.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
