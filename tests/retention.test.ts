import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getCalendarDateString,
  getCalendarDayDiff,
  getFirstSessionByUser,
  getCohortRows,
  calculateD1Retention,
  calculateRetentionFunnel,
  getEventAudit,
  type RawAnalyticsEvent,
} from "../src/lib/retention";
import { recordFirstSessionStarted } from "../src/lib/analytics";
import { prisma } from "../src/lib/prisma";

describe("Stage 7 Retention & Analytics Tests", () => {
  describe("1. Calendar Date & Timezone Conversion", () => {
    it("should accurately format calendar dates in different timezones", () => {
      // 2026-09-08 22:00:00 UTC
      const date = new Date("2026-09-08T22:00:00.000Z");

      // In UTC, date is 2026-09-08
      assert.equal(getCalendarDateString(date, "UTC"), "2026-09-08");

      // In Asia/Kolkata (+05:30), 22:00 UTC is 03:30 next morning (2026-09-09)
      assert.equal(getCalendarDateString(date, "Asia/Kolkata"), "2026-09-09");

      // In America/New_York (-04:00 EDT), 22:00 UTC is 18:00 (2026-09-08)
      assert.equal(getCalendarDateString(date, "America/New_York"), "2026-09-08");
    });

    it("should gracefully fallback to UTC for invalid timezones", () => {
      const date = new Date("2026-09-08T12:00:00.000Z");
      assert.equal(getCalendarDateString(date, "Invalid/TimeZone"), "2026-09-08");
    });

    it("should compute exact calendar day differences", () => {
      assert.equal(getCalendarDayDiff("2026-09-08", "2026-09-09"), 1, "Next calendar day is diff 1");
      assert.equal(getCalendarDayDiff("2026-09-08", "2026-09-08"), 0, "Same day is diff 0");
      assert.equal(getCalendarDayDiff("2026-09-08", "2026-09-10"), 2, "Two days later is diff 2");
      assert.equal(getCalendarDayDiff("2026-09-09", "2026-09-08"), -1, "Previous day is diff -1");
    });
  });

  describe("2. First-Session Idempotency in Database", () => {
    it("should record first_session_started idempotently without creating duplicate events", async () => {
      const testUserId = crypto.randomUUID();
      const user = await prisma.user.create({
        data: {
          id: testUserId,
          email: `test-firstsession-${Date.now()}@unrot.local`,
          name: "First Session Tester",
        },
      });

      // 1. Initial record -> should succeed
      const firstRecorded = await recordFirstSessionStarted(user.id, { test: 1 });
      assert.equal(firstRecorded, true, "First session should be recorded");

      // 2. Immediate duplicate call -> should return false (no duplicate record created)
      const secondRecorded = await recordFirstSessionStarted(user.id, { test: 2 });
      assert.equal(secondRecorded, false, "Duplicate first session should be prevented");

      // 3. Verify exactly 1 event exists in database
      const count = await prisma.analyticsEvent.count({
        where: {
          userId: user.id,
          eventName: "first_session_started",
        },
      });
      assert.equal(count, 1, "Must have exactly 1 first_session_started event row");

      // Cleanup
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe("3. Comprehensive D1 Retention Fixture", () => {
    /**
     * Test fixture with all 6 required persona behaviors:
     * 1. user-retained: first session 2026-09-01, qualifying return 2026-09-02 (diff 1 -> Retained)
     * 2. user-non-retained: first session 2026-09-01, no return (Not retained)
     * 3. user-same-day: first session 2026-09-01 09:00, return 2026-09-01 17:00 (diff 0 -> Not D1)
     * 4. user-two-days-later: first session 2026-09-01, return 2026-09-03 (diff 2 -> Not D1)
     * 5. user-demo-only: first session 2026-09-01, only demo_return_previewed on 2026-09-02 (Excluded -> Not D1)
     * 6. user-tz-edge: first session 2026-09-01 22:00 UTC (Asia/Kolkata: 2026-09-02), return 2026-09-02 20:00 UTC (Asia/Kolkata: 2026-09-03) (diff 1 in Asia/Kolkata -> Retained)
     */
    const userTimezones = new Map<string, string>([
      ["user-retained", "UTC"],
      ["user-non-retained", "UTC"],
      ["user-same-day", "UTC"],
      ["user-two-days-later", "UTC"],
      ["user-demo-only", "UTC"],
      ["user-tz-edge", "Asia/Kolkata"],
    ]);

    const fixtureEvents: RawAnalyticsEvent[] = [
      // 1. Retained user
      {
        userId: "user-retained",
        eventName: "first_session_started",
        occurredAt: new Date("2026-09-01T10:00:00Z"),
      },
      {
        userId: "user-retained",
        eventName: "return_home_viewed",
        occurredAt: new Date("2026-09-02T11:00:00Z"), // Next calendar day
      },

      // 2. Non-retained user
      {
        userId: "user-non-retained",
        eventName: "first_session_started",
        occurredAt: new Date("2026-09-01T11:00:00Z"),
      },

      // 3. Same-day repeat user
      {
        userId: "user-same-day",
        eventName: "first_session_started",
        occurredAt: new Date("2026-09-01T09:00:00Z"),
      },
      {
        userId: "user-same-day",
        eventName: "lesson_viewed",
        occurredAt: new Date("2026-09-01T17:00:00Z"), // Same calendar day (NOT D1)
      },

      // 4. Two-days-later user
      {
        userId: "user-two-days-later",
        eventName: "first_session_started",
        occurredAt: new Date("2026-09-01T12:00:00Z"),
      },
      {
        userId: "user-two-days-later",
        eventName: "return_home_viewed",
        occurredAt: new Date("2026-09-03T10:00:00Z"), // 2 calendar days later (NOT D1)
      },

      // 5. Demo-simulation-only user
      {
        userId: "user-demo-only",
        eventName: "first_session_started",
        occurredAt: new Date("2026-09-01T14:00:00Z"),
      },
      {
        userId: "user-demo-only",
        eventName: "demo_return_previewed",
        occurredAt: new Date("2026-09-02T14:00:00Z"), // Excluded demo event!
      },

      // 6. Timezone edge case user (Asia/Kolkata)
      // 2026-09-01 22:00 UTC = 2026-09-02 03:30 IST (Day 0 in Asia/Kolkata is 2026-09-02)
      {
        userId: "user-tz-edge",
        eventName: "first_session_started",
        occurredAt: new Date("2026-09-01T22:00:00Z"),
      },
      // 2026-09-02 20:00 UTC = 2026-09-03 01:30 IST (Day 1 in Asia/Kolkata is 2026-09-03, diff = 1 -> D1 Retained!)
      {
        userId: "user-tz-edge",
        eventName: "plan_viewed",
        occurredAt: new Date("2026-09-02T20:00:00Z"),
      },
    ];

    it("should correctly identify earliest first_session_started per user", () => {
      const map = getFirstSessionByUser(fixtureEvents, userTimezones);
      assert.equal(map.size, 6);
      assert.equal(map.get("user-retained")?.calendarDate, "2026-09-01");
      // Timezone user Day 0 is 2026-09-02 in Asia/Kolkata
      assert.equal(map.get("user-tz-edge")?.calendarDate, "2026-09-02");
    });

    it("should compute exact cohort retention rates for closed cohorts", () => {
      // Evaluation reference date: 2026-09-10 (both 2026-09-01 and 2026-09-02 are closed)
      const refDate = new Date("2026-09-10T12:00:00Z");
      const rows = getCohortRows(fixtureEvents, userTimezones, refDate);

      // We have 2 cohort dates:
      // Cohort 2026-09-01: 5 users (user-retained, user-non-retained, user-same-day, user-two-days-later, user-demo-only)
      // Cohort 2026-09-02: 1 user (user-tz-edge)
      assert.equal(rows.length, 2);

      const cohort1 = rows.find((r) => r.cohortDate === "2026-09-01")!;
      assert.equal(cohort1.eligibleUsers, 5);
      assert.equal(cohort1.d1RetainedUsers, 1, "Only user-retained must be counted as D1");
      assert.deepEqual(cohort1.retainedUserIds, ["user-retained"]);
      assert.equal(cohort1.d1Percentage, 20.0);
      assert.equal(cohort1.status, "complete");

      const cohort2 = rows.find((r) => r.cohortDate === "2026-09-02")!;
      assert.equal(cohort2.eligibleUsers, 1);
      assert.equal(cohort2.d1RetainedUsers, 1, "user-tz-edge returned on calendar day 2026-09-03 in Asia/Kolkata");
      assert.deepEqual(cohort2.retainedUserIds, ["user-tz-edge"]);
      assert.equal(cohort2.d1Percentage, 100.0);
      assert.equal(cohort2.status, "complete");

      // Overall D1 calculation across closed cohorts
      const totalD1 = calculateD1Retention(fixtureEvents, userTimezones, refDate);
      assert.equal(totalD1.eligibleUsers, 6);
      assert.equal(totalD1.retainedUsers, 2);
      assert.equal(Math.round(totalD1.d1Percentage * 10) / 10, 33.3);
      assert.equal(totalD1.hasEnoughData, true);
    });

    it("should mark in-progress cohorts as incomplete and exclude them from main D1 rate", () => {
      // If reference date is 2026-09-02 12:00 UTC:
      // - Cohort 2026-09-01 is only 1 day old (diff 1 -> in progress / incomplete)
      // - Cohort 2026-09-02 is 0 days old (same day -> incomplete)
      const earlyRefDate = new Date("2026-09-02T12:00:00Z");
      const rows = getCohortRows(fixtureEvents, userTimezones, earlyRefDate);

      for (const row of rows) {
        assert.equal(row.status, "incomplete", `Cohort ${row.cohortDate} should be incomplete`);
      }

      // calculateD1Retention excludes incomplete cohorts:
      const rate = calculateD1Retention(fixtureEvents, userTimezones, earlyRefDate);
      assert.equal(rate.hasEnoughData, false);
      assert.equal(rate.eligibleUsers, 0);
      assert.equal(rate.retainedUsers, 0);
    });

    it("should handle empty analytics events without errors", () => {
      const emptyResult = calculateD1Retention([]);
      assert.equal(emptyResult.hasEnoughData, false);
      assert.equal(emptyResult.eligibleUsers, 0);
      assert.equal(emptyResult.retainedUsers, 0);
      assert.equal(emptyResult.d1Percentage, 0);

      const emptyFunnel = calculateRetentionFunnel([]);
      assert.equal(emptyFunnel.totalNewUsers, 0);

      const emptyAudit = getEventAudit([]);
      assert.equal(emptyAudit.length, 0);
    });
  });

  describe("4. Funnel & Event Audit Aggregations", () => {
    it("should count distinct users accurately through the retention funnel", () => {
      const events: RawAnalyticsEvent[] = [
        { userId: "u1", eventName: "first_session_started", occurredAt: new Date("2026-09-01T10:00:00Z") },
        { userId: "u1", eventName: "onboarding_completed", occurredAt: new Date("2026-09-01T10:01:00Z") },
        { userId: "u1", eventName: "plan_viewed", occurredAt: new Date("2026-09-01T10:02:00Z") },
        { userId: "u1", eventName: "lesson_started", occurredAt: new Date("2026-09-01T10:03:00Z") },
        { userId: "u1", eventName: "lesson_completed", occurredAt: new Date("2026-09-01T10:08:00Z") },
        { userId: "u1", eventName: "reminder_enabled", occurredAt: new Date("2026-09-01T10:10:00Z") },
        { userId: "u1", eventName: "return_home_viewed", occurredAt: new Date("2026-09-02T10:00:00Z") },

        { userId: "u2", eventName: "first_session_started", occurredAt: new Date("2026-09-01T11:00:00Z") },
        { userId: "u2", eventName: "onboarding_completed", occurredAt: new Date("2026-09-01T11:01:00Z") },
        // u2 drops off before plan viewed
      ];

      const funnel = calculateRetentionFunnel(events, new Map(), new Date("2026-09-10T12:00:00Z"));
      assert.equal(funnel.totalNewUsers, 2);

      const newUsersStep = funnel.steps.find((s) => s.stepName === "New users")!;
      assert.equal(newUsersStep.distinctUsers, 2);
      assert.equal(newUsersStep.percentageOfTotal, 100);

      const onboardingStep = funnel.steps.find((s) => s.stepName === "Onboarding completed")!;
      assert.equal(onboardingStep.distinctUsers, 2);
      assert.equal(onboardingStep.percentageOfTotal, 100);

      const planStep = funnel.steps.find((s) => s.stepName === "Plan viewed")!;
      assert.equal(planStep.distinctUsers, 1);
      assert.equal(planStep.percentageOfTotal, 50);

      const d1ReturnStep = funnel.steps.find((s) => s.stepName === "Real D1 return")!;
      assert.equal(d1ReturnStep.distinctUsers, 1);
      assert.equal(d1ReturnStep.percentageOfTotal, 50);
    });

    it("should aggregate event audit stats with distinct user counts and timestamps", () => {
      const now = new Date();
      const earlier = new Date(now.getTime() - 60000);

      const events: RawAnalyticsEvent[] = [
        { userId: "u1", eventName: "landing_viewed", occurredAt: earlier },
        { userId: "u2", eventName: "landing_viewed", occurredAt: now },
        { userId: "u1", eventName: "landing_viewed", occurredAt: now },
        { userId: "u1", eventName: "lesson_started", occurredAt: now },
      ];

      const audit = getEventAudit(events);
      assert.equal(audit.length, 2);

      const landingAudit = audit.find((a) => a.eventName === "landing_viewed")!;
      assert.equal(landingAudit.distinctUsers, 2);
      assert.equal(landingAudit.totalEvents, 3);
      assert.equal(landingAudit.earliestTimestamp?.getTime(), earlier.getTime());
      assert.equal(landingAudit.latestTimestamp?.getTime(), now.getTime());
    });
  });
});
