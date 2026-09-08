import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  calculateD1Retention,
  calculateRetentionFunnel,
  getCohortRows,
  getEventAudit,
  QUALIFYING_RETURN_EVENTS,
  EXCLUDED_RETENTION_EVENTS,
} from "@/lib/retention";
import { AppHeader } from "@/components/navigation/AppHeader";

export const metadata: Metadata = {
  title: "Retention Analytics | Unrot Daily",
  description: "Prototype retention analytics, cohort analysis, and funnel metrics.",
};

export default async function AnalyticsPage() {
  // 1. Fetch raw analytics events from local database
  const events = await prisma.analyticsEvent.findMany({
    orderBy: { occurredAt: "asc" },
  });

  // 2. Fetch reminder preference timezones for timezone-aware date parsing
  const reminderPrefs = await prisma.reminderPreference.findMany({
    select: { userId: true, timezone: true },
  });
  const userTimezones = new Map<string, string>();
  for (const p of reminderPrefs) {
    if (p.timezone) {
      userTimezones.set(p.userId, p.timezone);
    }
  }

  // 3. Compute retention, funnel, cohort, and audit metrics
  const now = new Date();
  const d1Result = calculateD1Retention(events, userTimezones, now);
  const funnel = calculateRetentionFunnel(events, userTimezones, now);
  const cohortRows = getCohortRows(events, userTimezones, now);
  const eventAudit = getEventAudit(events);

  // Derived KPI metrics
  const newUsersCount = funnel.totalNewUsers;
  const onboardingCompletedCount =
    funnel.steps.find((s) => s.stepName === "Onboarding completed")?.distinctUsers ?? 0;
  const onboardingRate =
    newUsersCount > 0 ? (onboardingCompletedCount / newUsersCount) * 100 : 0;

  const firstLessonCompletedCount =
    funnel.steps.find((s) => s.stepName === "First lesson completed")?.distinctUsers ?? 0;
  const firstLessonRate =
    newUsersCount > 0 ? (firstLessonCompletedCount / newUsersCount) * 100 : 0;

  const reminderOptInCount =
    funnel.steps.find((s) => s.stepName === "Reminder enabled")?.distinctUsers ?? 0;
  const reminderRate =
    newUsersCount > 0 ? (reminderOptInCount / newUsersCount) * 100 : 0;

  // Separate illustrative data for demo walkthrough (does not affect real KPIs)
  const illustrativeCohortExample = [
    { cohortDate: "2026-08-30", eligible: 50, returnedD1: 11, pct: "22.0%", status: "Complete" },
    { cohortDate: "2026-08-31", eligible: 48, returnedD1: 10, pct: "20.8%", status: "Complete" },
    { cohortDate: "2026-09-01", eligible: 55, returnedD1: 13, pct: "23.6%", status: "Complete" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-text font-sans">
      {/* Shared Header */}
      <AppHeader currentPath="/analytics" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-10">
        {/* Page Title & Context Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Retention Analytics
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-primary/10 text-primary">
              Prototype
            </span>
          </div>
          <p className="text-xs text-muted">
            Prototype analytics—not live Unrot production data
          </p>
        </div>

        {/* KPI Cards Grid */}
        <section aria-labelledby="kpi-heading" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <h2 id="kpi-heading" className="text-xl font-bold tracking-tight text-text">
                Core Metrics Overview
              </h2>
              <p className="text-xs text-muted">
                Aggregated from local prototype database sessions
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-surface border border-border text-muted">
                Assignment baseline: <strong className="text-text">16%</strong> (context)
              </span>
              <span className="px-2.5 py-1 rounded-md bg-surface border border-border text-muted">
                Target benchmark: <strong className="text-text">22%</strong> (context)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* New Users */}
            <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-1">
              <span className="text-xs text-muted font-medium block">
                New Users
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-text">
                {newUsersCount}
              </div>
              <p className="text-xs text-muted/70">
                Users with first session started
              </p>
            </div>

            {/* Onboarding Completion Rate */}
            <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-1">
              <span className="text-xs text-muted font-medium block">
                Onboarding Completion
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-text">
                {`${onboardingRate.toFixed(1)}%`}
              </div>
              <p className="text-xs text-muted/70">
                {`${onboardingCompletedCount} of ${newUsersCount} created plan`}
              </p>
            </div>

            {/* First Lesson Completion Rate */}
            <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-1">
              <span className="text-xs text-muted font-medium block">
                First Lesson Completion
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-text">
                {`${firstLessonRate.toFixed(1)}%`}
              </div>
              <p className="text-xs text-muted/70">
                {`${firstLessonCompletedCount} of ${newUsersCount} completed Day 1`}
              </p>
            </div>

            {/* Reminder Opt-in Rate */}
            <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-1">
              <span className="text-xs text-muted font-medium block">
                Reminder Opt-in
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-text">
                {`${reminderRate.toFixed(1)}%`}
              </div>
              <p className="text-xs text-muted/70">
                {`${reminderOptInCount} of ${newUsersCount} enabled daily prompt`}
              </p>
            </div>
          </div>

          {/* D1 Retention KPI Card */}
          <div className="p-6 rounded-2xl border-2 border-primary/30 dark:border-primary/40 bg-surface shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Primary Retention Metric · D1 Retention Rate
                </span>
                <h3 className="text-lg font-bold text-text">
                  Calendar-Day D1 Return Percentage
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-primary/10 text-primary w-fit">
                Excludes simulated demo preview
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-background border border-border space-y-0.5">
                <span className="text-xs text-muted block">Eligible D1 Cohort Size</span>
                <div className="text-xl font-bold text-text">
                  {`${d1Result.eligibleUsers} users`}
                </div>
                <p className="text-[11px] text-muted/70">Closed cohorts (≥ 48h old)</p>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border space-y-0.5">
                <span className="text-xs text-muted block">D1 Retained Users</span>
                <div className="text-xl font-bold text-text">
                  {`${d1Result.retainedUsers} users`}
                </div>
                <p className="text-[11px] text-muted/70">Returned on next calendar day</p>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border space-y-0.5">
                <span className="text-xs text-muted block">Official D1 Retention</span>
                <div className="text-xl font-bold text-text">
                  {d1Result.hasEnoughData
                    ? `${d1Result.d1Percentage.toFixed(1)}%`
                    : "Not enough real cohort data yet"}
                </div>
                <p className="text-[11px] text-muted/70">
                  {d1Result.hasEnoughData
                    ? "Measured across closed cohorts"
                    : "Requires cohorts ≥ 48h after Day 0"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Retention Funnel Section */}
        <section aria-labelledby="funnel-heading" className="space-y-4">
          <div className="border-b border-border pb-2">
            <h2 id="funnel-heading" className="text-xl font-bold tracking-tight text-text">
              Retention &amp; Engagement Funnel
            </h2>
            <p className="text-xs text-muted">
              Distinct user drop-off across the onboarding, learning, and return loop
            </p>
          </div>

          <div className="space-y-3 bg-surface border border-border rounded-2xl p-6 shadow-xs">
            {funnel.steps.map((step, idx) => (
              <div key={step.stepName} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted w-4">
                      {`${idx + 1}.`}
                    </span>
                    <span className="font-semibold text-text">{step.stepName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-muted">{`${step.distinctUsers} users`}</span>
                    <span className="font-bold text-text w-12 text-right">
                      {`${step.percentageOfTotal.toFixed(1)}%`}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${step.percentageOfTotal}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cohort Analysis Table */}
        <section aria-labelledby="cohort-heading" className="space-y-4">
          <div className="border-b border-border pb-2">
            <h2 id="cohort-heading" className="text-xl font-bold tracking-tight text-text">
              Daily Cohort Retention Table
            </h2>
            <p className="text-xs text-muted">
              Calendar-day tracking: Day 0 acquisition to Day 1 next-calendar-day return
            </p>
          </div>

          {cohortRows.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-border text-center bg-surface space-y-2">
              <p className="text-sm font-semibold text-text">
                Not enough real cohort data yet.
              </p>
              <p className="text-xs text-muted max-w-md mx-auto">
                No new users with a recorded <code>first_session_started</code> event exist in the local SQLite database. Complete onboarding to create the first cohort.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border shadow-xs bg-surface">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-background text-muted font-semibold border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Cohort Date</th>
                    <th className="py-3 px-4">Eligible Users</th>
                    <th className="py-3 px-4">D1 Retained Users</th>
                    <th className="py-3 px-4">D1 Rate (%)</th>
                    <th className="py-3 px-4">Cohort Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono text-xs">
                  {cohortRows.map((row) => (
                    <tr key={row.cohortDate} className="hover:bg-background/50 transition-colors">
                      <td className="py-3 px-4 font-semibold font-sans text-text">{row.cohortDate}</td>
                      <td className="py-3 px-4 text-text">{row.eligibleUsers}</td>
                      <td className="py-3 px-4 text-text">{row.d1RetainedUsers}</td>
                      <td className="py-3 px-4 font-bold text-text">{`${row.d1Percentage.toFixed(1)}%`}</td>
                      <td className="py-3 px-4 font-sans">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            row.status === "complete"
                              ? "bg-success/10 text-success"
                              : "bg-accent/15 text-accent"
                          }`}
                        >
                          {row.status === "complete" ? "Complete (Closed)" : "Incomplete (In progress)"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Illustrative Example Only Section */}
        <section aria-labelledby="illustrative-heading" className="space-y-4">
          <div className="border-b border-border pb-2 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 id="illustrative-heading" className="text-base font-bold text-text">
                  Illustrative Example Only
                </h2>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  Simulation Sample
                </span>
              </div>
              <p className="text-xs text-muted">
                Synthetic multi-day cohort visualization showing target 22% benchmark trajectory. Completely isolated from real local metrics.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-dashed border-primary/30 bg-primary/5">
            <table className="w-full text-left text-xs">
              <thead className="text-muted font-semibold border-b border-primary/20">
                <tr>
                  <th className="py-2.5 px-4">Sample Date</th>
                  <th className="py-2.5 px-4">Sample Users</th>
                  <th className="py-2.5 px-4">Sample D1 Returns</th>
                  <th className="py-2.5 px-4">Sample Rate</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/15 font-mono text-xs">
                {illustrativeCohortExample.map((ex) => (
                  <tr key={ex.cohortDate}>
                    <td className="py-2.5 px-4 font-sans text-text">{ex.cohortDate}</td>
                    <td className="py-2.5 px-4 text-text">{ex.eligible}</td>
                    <td className="py-2.5 px-4 text-text">{ex.returnedD1}</td>
                    <td className="py-2.5 px-4 font-bold text-primary">{ex.pct}</td>
                    <td className="py-2.5 px-4 font-sans text-muted">{ex.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Event Audit Log Table */}
        <section aria-labelledby="audit-heading" className="space-y-4">
          <div className="border-b border-border pb-2">
            <h2 id="audit-heading" className="text-xl font-bold tracking-tight text-text">
              Event Taxonomy Audit
            </h2>
            <p className="text-xs text-muted">
              Total volume and distinct user participation per instrumented event
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border shadow-xs bg-surface">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-background text-muted font-semibold border-b border-border">
                <tr>
                  <th className="py-3 px-4">Event Name</th>
                  <th className="py-3 px-4">Distinct Users</th>
                  <th className="py-3 px-4">Total Occurrences</th>
                  <th className="py-3 px-4">Earliest Recorded</th>
                  <th className="py-3 px-4">Latest Recorded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-xs">
                {eventAudit.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted font-sans">
                      No analytics events recorded yet.
                    </td>
                  </tr>
                ) : (
                  eventAudit.map((row) => (
                    <tr key={row.eventName} className="hover:bg-background/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-text font-mono">
                        {row.eventName}
                      </td>
                      <td className="py-3 px-4 text-text">{row.distinctUsers}</td>
                      <td className="py-3 px-4 text-text">{row.totalEvents}</td>
                      <td className="py-3 px-4 text-muted">
                        {row.earliestTimestamp ? row.earliestTimestamp.toISOString() : "—"}
                      </td>
                      <td className="py-3 px-4 text-muted">
                        {row.latestTimestamp ? row.latestTimestamp.toISOString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Explanation & Methodology Panel */}
        <section aria-labelledby="explanation-heading" className="p-6 rounded-2xl bg-surface border border-border space-y-4 text-xs leading-relaxed text-muted shadow-xs">
          <h3 id="explanation-heading" className="text-sm font-bold text-text uppercase tracking-wider">
            Measurement Methodology &amp; Definitions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <strong className="text-text block font-semibold">Exact D1 Definition:</strong>
              <p>
                D1 retention is defined strictly as the percentage of new users who return on the <em>calendar day</em> after their first session. Rolling 24-hour windows are prohibited.
              </p>
            </div>

            <div className="space-y-1.5">
              <strong className="text-text block font-semibold">Cohort Start Event:</strong>
              <p>
                The new-user cohort is anchored by the earliest <code>first_session_started</code> event. This event is recorded idempotently upon onboarding and cannot be duplicated.
              </p>
            </div>

            <div className="space-y-1.5">
              <strong className="text-text block font-semibold">Qualifying Return Events:</strong>
              <p>
                A user is counted as retained if they execute at least one real engagement action on the next calendar day:{" "}
                <code>{QUALIFYING_RETURN_EVENTS.join(", ")}</code>.
              </p>
            </div>

            <div className="space-y-1.5">
              <strong className="text-text block font-semibold">Excluded Demo Events:</strong>
              <p>
                Events from the interactive preview (<code>{EXCLUDED_RETENTION_EVENTS.join(", ")}</code>) are strictly excluded from retention calculations and cohort rows.
              </p>
            </div>

            <div className="space-y-1.5">
              <strong className="text-text block font-semibold">Timezone Policy:</strong>
              <p>
                Calendar dates are evaluated in the user&apos;s configured reminder timezone (stored in <code>ReminderPreference</code> or <code>UserPreference</code>). If unavailable or invalid, dates fall back to UTC.
              </p>
            </div>

            <div className="space-y-1.5">
              <strong className="text-text block font-semibold">Cohort Completeness Rule:</strong>
              <p>
                A cohort on date <em>D</em> is marked <em>incomplete</em> until date <em>D + 2</em>, ensuring the full 24 hours of Day 1 have closed before computing the official D1 rate.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
