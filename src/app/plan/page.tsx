import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import { matchLearningPath } from "@/lib/learning-path";
import { recordEvent } from "@/lib/analytics";
import { AppHeader } from "@/components/navigation/AppHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Your Learning Plan | Unrot Daily",
  description: "Your personalized 5-minute daily AI review path.",
};

export const dynamic = "force-dynamic";

export default async function PlanPage() {
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

  if (!matchedPath || matchedPath.lessons.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-text font-sans">
        <AppHeader currentPath="/plan" />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Card variant="default" className="max-w-md p-6 space-y-4">
            <h1 className="text-xl font-bold text-text">
              Learning Path Unavailable
            </h1>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              We could not find an active path for your calibration. Update your preferences to generate your curriculum.
            </p>
            <Link href="/onboarding">
              <Button variant="primary" size="md">
                Update preferences
              </Button>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  const todayLesson = matchedPath.lessons[0];
  const upcomingLessons = matchedPath.lessons.slice(1, 5);

  return (
    <div className="min-h-screen flex flex-col bg-background text-text font-sans">
      <AppHeader currentPath="/plan" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* Title Section */}
        <PageHeader
          eyebrow={
            <Badge variant="primary">
              Personalized Curriculum
            </Badge>
          }
          title="Your 5-Day Learning Plan"
          subtitle={`${matchedPath.title}: ${matchedPath.description}`}
        />

        {/* Profile Calibration Card */}
        <Card variant="default">
          <CardContent className="p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Profile Calibration
              </span>
              <Link
                href="/onboarding"
                className="text-xs text-primary font-semibold hover:underline transition-colors"
              >
                Edit Preferences
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-sm">
              <div className="bg-background/80 p-3 rounded-xl border border-border-subtle">
                <span className="block text-muted text-xs mb-0.5 font-medium">Target Role</span>
                <span className="font-bold text-text">{preferences.role}</span>
              </div>
              <div className="bg-background/80 p-3 rounded-xl border border-border-subtle">
                <span className="block text-muted text-xs mb-0.5 font-medium">Primary Goal</span>
                <span className="font-bold text-text">{preferences.learningGoal}</span>
              </div>
              <div className="bg-background/80 p-3 rounded-xl border border-border-subtle">
                <span className="block text-muted text-xs mb-0.5 font-medium">Experience</span>
                <span className="font-bold text-text">{preferences.experienceLevel}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's First Lesson Card */}
        {todayLesson && (
          <Card variant="highlight" className="shadow-card">
            <CardContent className="p-6 sm:p-8 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="primary">
                  Today · Day {todayLesson.dayNumber}
                </Badge>
                <span className="text-xs font-semibold text-muted flex items-center gap-1">
                  ⏱ ~{todayLesson.durationMinutes} minutes
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
                  {todayLesson.title}
                </h2>
                <p className="text-sm sm:text-base text-muted leading-relaxed">
                  {todayLesson.summary}
                </p>
              </div>

              <div className="pt-2">
                <Link href="/learn/today" className="inline-block">
                  <Button variant="primary" size="lg">
                    Start today&apos;s lesson →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Lessons Preview */}
        {upcomingLessons.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
                Upcoming Curriculum Schedule
              </h2>
              <span className="text-xs text-muted">5-day track</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingLessons.map((lesson) => (
                <Card key={lesson.id} variant="default" className="hover:border-primary/40 transition-colors">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <Badge variant="neutral" size="sm">
                        Day {lesson.dayNumber}
                      </Badge>
                      <span className="font-medium">~{lesson.durationMinutes} min</span>
                    </div>
                    <h3 className="font-bold text-text text-base tracking-tight">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                      {lesson.summary}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}