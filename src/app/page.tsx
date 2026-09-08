import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getDemoUser } from "@/lib/demo-user";
import { recordEvent, EVENT_NAMES } from "@/lib/analytics";
import { AppHeader } from "@/components/navigation/AppHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function Home() {
  const authUser = await getCurrentUser();
  const demoUser = !authUser ? await getDemoUser() : null;
  const user = authUser || demoUser;

  await recordEvent(EVENT_NAMES.LANDING_VIEWED, user?.id ?? null, {}, "/");

  return (
    <div className="min-h-screen flex flex-col bg-background text-text font-sans">
      <AppHeader currentPath="/" showDashboardLink={!!user} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-14 sm:py-24">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center space-y-8">
          {/* Eyebrow Badge */}
          <Badge variant="primary" dot>
            Daily Micro-Learning &amp; Retention Loop
          </Badge>

          {/* Hero Typography */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text leading-[1.12]">
              Retain what you learn, <br className="hidden sm:inline" />
              <span className="text-primary">5 minutes a day.</span>
            </h1>
            <p className="max-w-xl mx-auto text-base sm:text-lg leading-relaxed text-muted font-normal">
              Knowledge decays without deliberate recall. Unrot Daily delivers personalized 5-minute review sessions matched to your role and goals, building lasting mental models.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto pt-2">
            <Link href={user ? "/home" : "/signup"} className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                {user ? "Resume learning dashboard →" : "Start 5-day habit"}
              </Button>
            </Link>
            <Link href="/analytics" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View telemetry
              </Button>
            </Link>
          </div>

          {/* Subtext info */}
          <div className="pt-1">
            {!user ? (
              <span className="text-xs text-muted">
                30-second setup · No credit card required · Free evaluation
              </span>
            ) : (
              <span className="text-xs text-muted font-medium">
                Active session detected for {user.email}
              </span>
            )}
          </div>

          {/* 3 Core Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-8 border-t border-border">
            <Card variant="default" className="text-left">
              <CardContent className="p-5 space-y-1.5">
                <Badge variant="primary" size="sm">
                  01 · Tailored
                </Badge>
                <h2 className="text-sm font-bold text-text pt-1">Role-Calibrated Track</h2>
                <p className="text-xs text-muted leading-relaxed">
                  Curated 5-day paths for Product Managers, Software Engineers, and General Professionals.
                </p>
              </CardContent>
            </Card>

            <Card variant="default" className="text-left">
              <CardContent className="p-5 space-y-1.5">
                <Badge variant="secondary" size="sm">
                  02 · Active Recall
                </Badge>
                <h2 className="text-sm font-bold text-text pt-1">5-Minute Sessions</h2>
                <p className="text-xs text-muted leading-relaxed">
                  Structured mental models with instant comprehension checks and real-world cases.
                </p>
              </CardContent>
            </Card>

            <Card variant="default" className="text-left">
              <CardContent className="p-5 space-y-1.5">
                <Badge variant="success" size="sm">
                  03 · Habit Loop
                </Badge>
                <h2 className="text-sm font-bold text-text pt-1">Next-Day Return</h2>
                <p className="text-xs text-muted leading-relaxed">
                  Tomorrow previews and morning reminder commitments drive consistent Day 1 return.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 text-center text-xs text-muted">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Unrot Daily MVP · Private Evaluation Build</span>
          <div className="flex items-center gap-4">
            <Link href="/plan" className="hover:text-text transition-colors">
              Plan
            </Link>
            <Link href="/analytics" className="hover:text-text transition-colors">
              Analytics
            </Link>
            <Link href="/api/health" className="hover:text-text transition-colors font-mono">
              /api/health
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}