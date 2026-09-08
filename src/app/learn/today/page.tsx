import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDemoUser, DEMO_USER_COOKIE } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import { matchLearningPath } from "@/lib/learning-path";
import { parseAndValidateLessonContent } from "@/lib/lesson-content";
import { recordEvent } from "@/lib/analytics";
import { AppHeader } from "@/components/navigation/AppHeader";
import { LessonReader } from "./LessonReader";

export const metadata: Metadata = {
  title: "Today's Lesson | Unrot Daily",
  description: "Focused 5-minute daily AI review session.",
};

export default async function LearnTodayPage() {
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get(DEMO_USER_COOKIE)?.value;

  if (!rawCookie) {
    redirect("/onboarding");
  }

  const user = await getDemoUser();
  if (!user) {
    // Cookie is stale or points to non-existent user: clear cookie safely and redirect
    cookieStore.delete(DEMO_USER_COOKIE);
    redirect("/onboarding");
  }

  // 1. Load preferences
  const preferences = await prisma.userPreference.findUnique({
    where: { userId: user.id },
  });

  if (!preferences) {
    redirect("/onboarding");
  }

  // 2. Load learning path
  const matchedPath = await matchLearningPath(
    preferences.role,
    preferences.learningGoal
  );

  if (!matchedPath || matchedPath.lessons.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-text">
        <AppHeader currentPath="/learn/today" />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-surface border border-border rounded-2xl p-8 space-y-4 shadow-xs">
            <h1 className="text-2xl font-bold text-text">
              No Active Lessons
            </h1>
            <p className="text-sm text-muted leading-relaxed">
              We could not find active lessons for your learning path. Please review
              your curriculum plan.
            </p>
            <Link
              href="/plan"
              className="inline-flex px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors shadow-xs"
            >
              Return to Plan
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // 2.5 Determine active incomplete lesson
  const { getNextIncompleteLesson } = await import("@/lib/reminders");
  const nextLessonInfo = await getNextIncompleteLesson(user.id, matchedPath.id);

  if (nextLessonInfo.isCompleted && !nextLessonInfo.nextLesson) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-text">
        <AppHeader currentPath="/learn/today" />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-surface border border-border rounded-2xl p-8 space-y-4 shadow-xs">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success/10 text-success text-3xl mb-1">
              ✓
            </div>
            <h1 className="text-2xl font-bold text-text">
              Curriculum Completed!
            </h1>
            <p className="text-sm text-muted leading-relaxed">
              You have completed all 5 daily lessons in this curriculum. You can review your completed plan or start a new path.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/home"
                className="w-full sm:w-auto inline-flex px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors shadow-xs"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/plan"
                className="w-full sm:w-auto inline-flex px-6 py-2.5 rounded-full border border-border text-text text-sm font-medium hover:bg-surface transition-colors"
              >
                View Plan
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const todayLesson = nextLessonInfo.nextLesson ?? matchedPath.lessons[0];

  // 3. Parse and strictly validate lesson contentJson
  let normalizedContent;
  try {
    normalizedContent = parseAndValidateLessonContent(todayLesson.contentJson);
  } catch (err) {
    console.error(
      `[LearnTodayPage] Failed to parse lesson content for lesson ${todayLesson.id}:`,
      err instanceof Error ? err.message : "Unknown error"
    );

    return (
      <div className="min-h-screen flex flex-col bg-background text-text">
        <AppHeader currentPath="/learn/today" />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-surface border border-border rounded-2xl p-8 space-y-4 shadow-xs">
            <h1 className="text-2xl font-bold text-text">
              Lesson Content Unavailable
            </h1>
            <p className="text-sm text-muted leading-relaxed">
              We encountered an issue preparing today&apos;s lesson content. Please return
              to your plan or try again shortly.
            </p>
            <Link
              href="/plan"
              className="inline-flex px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors shadow-xs"
            >
              Back to your plan
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // 4. Load existing progress if available
  const existingProgress = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId: todayLesson.id,
      },
    },
  });

  // 5. Record lesson_viewed analytics
  await recordEvent(
    "lesson_viewed",
    user.id,
    {
      lessonId: todayLesson.id,
      lessonDay: todayLesson.dayNumber,
      pathId: matchedPath.id,
    },
    "/learn/today"
  );

  return (
    <LessonReader
      lesson={{
        id: todayLesson.id,
        dayNumber: todayLesson.dayNumber,
        title: todayLesson.title,
        summary: todayLesson.summary,
        durationMinutes: todayLesson.durationMinutes,
      }}
      content={normalizedContent}
      initialProgress={
        existingProgress
          ? {
              startedAt: existingProgress.startedAt?.toISOString() ?? null,
              completedAt: existingProgress.completedAt?.toISOString() ?? null,
              quizScore: existingProgress.quizScore,
            }
          : null
      }
    />
  );
}
