import Link from "next/link";
import { getDemoUser } from "@/lib/demo-user";
import { recordEvent, EVENT_NAMES } from "@/lib/analytics";
import { AppHeader } from "@/components/navigation/AppHeader";

export default async function Home() {
  const user = await getDemoUser();
  await recordEvent(EVENT_NAMES.LANDING_VIEWED, user?.id ?? null, {}, "/");

  return (
    <div className="min-h-screen flex flex-col bg-background text-text font-sans">
      <AppHeader currentPath="/" showDashboardLink={!!user} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center space-y-8">
          {/* Accent Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface shadow-xs text-xs font-medium text-muted">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span>Daily Micro-Learning &amp; Retention Loop</span>
          </div>

          {/* Hero Typography */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text leading-[1.15]">
              Retain what you learn, <br className="hidden sm:inline" />
              <span className="text-primary">one day at a time.</span>
            </h1>
            <p className="max-w-xl mx-auto text-base sm:text-lg leading-relaxed text-muted">
              Knowledge decays rapidly without deliberate recall. Unrot Daily surfaces
              tailored 5-minute review sessions matched to your role and goals, building lasting mental models.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto pt-2">
            <Link
              href="/onboarding"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary hover:bg-primary-hover px-7 text-sm font-semibold text-white transition-colors cursor-pointer shadow-xs w-full sm:w-auto focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
            >
              Start learning
            </Link>
            <Link
              href="/analytics"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface hover:bg-border/30 px-6 text-sm font-medium text-text transition-colors cursor-pointer shadow-xs w-full sm:w-auto focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
            >
              View analytics
            </Link>
          </div>

          {/* Secondary Status & Resume Link */}
          <div className="pt-2">
            {user ? (
              <Link
                href="/home"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline transition-colors"
              >
                <span>Resume your active learning dashboard</span>
                <span>→</span>
              </Link>
            ) : (
              <span className="text-xs text-muted">
                30-second setup · No credit card required · Free prototype
              </span>
            )}
          </div>

          {/* 3 Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-8 border-t border-border">
            <div className="p-4 rounded-xl border border-border bg-surface/50 text-left space-y-1">
              <div className="text-primary font-bold text-xs uppercase tracking-wider">
                01 · Role Tailored
              </div>
              <h2 className="text-sm font-bold text-text">Targeted Curriculum</h2>
              <p className="text-xs text-muted leading-normal">
                Curated 5-day tracks for Product Managers, Engineers, and General professionals.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface/50 text-left space-y-1">
              <div className="text-accent font-bold text-xs uppercase tracking-wider">
                02 · Active Recall
              </div>
              <h2 className="text-sm font-bold text-text">5-Minute Sessions</h2>
              <p className="text-xs text-muted leading-normal">
                Structured mental models with instant comprehension checks and real-world cases.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface/50 text-left space-y-1">
              <div className="text-success font-bold text-xs uppercase tracking-wider">
                03 · Habit Loop
              </div>
              <h2 className="text-sm font-bold text-text">Next-Day Return</h2>
              <p className="text-xs text-muted leading-normal">
                Tomorrow previews and morning reminder commitments drive Day 1 re-entry.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 text-center text-xs text-muted">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Unrot Daily Retention Prototype · Private Evaluation Build</span>
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
