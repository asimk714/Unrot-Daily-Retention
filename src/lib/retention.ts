import { isValidTimezone } from "@/lib/reminders";

export interface RawAnalyticsEvent {
  id?: string;
  userId: string | null;
  eventName: string;
  propertiesJson?: string;
  occurredAt: Date;
  sessionId?: string | null;
  route?: string | null;
}

/**
 * Documented qualifying return events.
 * A user must log at least one of these on the calendar day after first_session_started.
 */
export const QUALIFYING_RETURN_EVENTS = [
  "return_home_viewed",
  "lesson_viewed",
  "lesson_started",
  "plan_viewed",
  "next_lesson_started",
  "session_returned_d1",
] as const;

/**
 * Excluded events that must NEVER be counted as a valid retention event.
 */
export const EXCLUDED_RETENTION_EVENTS = [
  "demo_return_previewed",
] as const;

/**
 * Converts a UTC Date into a YYYY-MM-DD calendar date string in the given timezone.
 * Falls back to UTC if timezone parsing fails.
 */
export function getCalendarDateString(date: Date, timeZone: string = "UTC"): string {
  try {
    const tz = isValidTimezone(timeZone) ? timeZone : "UTC";
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  } catch (err) {
    console.warn(
      `[Retention] Failed to format date in timezone "${timeZone}". Falling back to UTC:`,
      err instanceof Error ? err.message : "Unknown error"
    );
    return date.toISOString().slice(0, 10);
  }
}

/**
 * Calculates the exact calendar-day difference from dateStrA to dateStrB (dateStrB - dateStrA).
 * Format: "YYYY-MM-DD".
 */
export function getCalendarDayDiff(dateStrA: string, dateStrB: string): number {
  const [yA, mA, dA] = dateStrA.split("-").map(Number);
  const [yB, mB, dB] = dateStrB.split("-").map(Number);
  const utcA = Date.UTC(yA, mA - 1, dA);
  const utcB = Date.UTC(yB, mB - 1, dB);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((utcB - utcA) / msPerDay);
}

export interface FirstSessionInfo {
  userId: string;
  firstSessionTime: Date;
  calendarDate: string;
  timezone: string;
}

/**
 * Extracts each distinct user's earliest first_session_started event.
 */
export function getFirstSessionByUser(
  events: RawAnalyticsEvent[],
  userTimezones: Map<string, string> = new Map()
): Map<string, FirstSessionInfo> {
  const map = new Map<string, FirstSessionInfo>();

  for (const event of events) {
    if (event.eventName !== "first_session_started" || !event.userId) {
      continue;
    }

    const tz = userTimezones.get(event.userId) || "UTC";
    const existing = map.get(event.userId);

    if (!existing || event.occurredAt.getTime() < existing.firstSessionTime.getTime()) {
      map.set(event.userId, {
        userId: event.userId,
        firstSessionTime: event.occurredAt,
        calendarDate: getCalendarDateString(event.occurredAt, tz),
        timezone: tz,
      });
    }
  }

  return map;
}

export interface CohortRow {
  cohortDate: string;
  eligibleUsers: number;
  d1RetainedUsers: number;
  d1Percentage: number;
  status: "complete" | "incomplete";
  userIds: string[];
  retainedUserIds: string[];
}

export interface RetentionRateResult {
  eligibleUsers: number;
  retainedUsers: number;
  d1Percentage: number;
  hasEnoughData: boolean;
}

/**
 * Evaluates cohorts and D1 returns based on the assignment's exact D1 definition:
 * - New-user cohort: users with first_session_started
 * - First session: earliest first_session_started
 * - D1 return: qualifying return event on the next calendar day
 * - Incomplete cohorts: cohort date whose D1 return window has not fully concluded
 */
export function getCohortRows(
  events: RawAnalyticsEvent[],
  userTimezones: Map<string, string> = new Map(),
  referenceDate: Date = new Date()
): CohortRow[] {
  const firstSessions = getFirstSessionByUser(events, userTimezones);
  if (firstSessions.size === 0) {
    return [];
  }

  // Pre-filter qualifying events (ignoring excluded events and anonymous events)
  const qualifyingEventsByUser = new Map<string, RawAnalyticsEvent[]>();
  for (const event of events) {
    if (
      !event.userId ||
      EXCLUDED_RETENTION_EVENTS.includes(event.eventName as (typeof EXCLUDED_RETENTION_EVENTS)[number]) ||
      !QUALIFYING_RETURN_EVENTS.includes(event.eventName as (typeof QUALIFYING_RETURN_EVENTS)[number])
    ) {
      continue;
    }

    const list = qualifyingEventsByUser.get(event.userId) ?? [];
    list.push(event);
    qualifyingEventsByUser.set(event.userId, list);
  }

  // Group users into cohort calendar dates
  const cohortGroups = new Map<string, string[]>();
  for (const [userId, info] of firstSessions.entries()) {
    const list = cohortGroups.get(info.calendarDate) ?? [];
    list.push(userId);
    cohortGroups.set(info.calendarDate, list);
  }

  const rows: CohortRow[] = [];
  const sortedDates = Array.from(cohortGroups.keys()).sort();

  for (const cohortDate of sortedDates) {
    const userIds = cohortGroups.get(cohortDate) ?? [];
    const retainedUserIds: string[] = [];

    for (const userId of userIds) {
      const sessionInfo = firstSessions.get(userId)!;
      const userEvents = qualifyingEventsByUser.get(userId) ?? [];

      let hasReturnedD1 = false;
      for (const e of userEvents) {
        const eventDate = getCalendarDateString(e.occurredAt, sessionInfo.timezone);
        const dayDiff = getCalendarDayDiff(sessionInfo.calendarDate, eventDate);

        if (dayDiff === 1) {
          hasReturnedD1 = true;
          break;
        }
      }

      if (hasReturnedD1) {
        retainedUserIds.push(userId);
      }
    }

    // Cohort status:
    // A cohort on day D is complete only if reference date is at least D + 2 days,
    // ensuring the full D + 1 calendar day window has passed.
    const refDateStr = getCalendarDateString(referenceDate, "UTC");
    const diffFromRef = getCalendarDayDiff(cohortDate, refDateStr);
    const isComplete = diffFromRef >= 2;

    const eligible = userIds.length;
    const retained = retainedUserIds.length;
    const percentage = eligible > 0 ? (retained / eligible) * 100 : 0;

    rows.push({
      cohortDate,
      eligibleUsers: eligible,
      d1RetainedUsers: retained,
      d1Percentage: percentage,
      status: isComplete ? "complete" : "incomplete",
      userIds,
      retainedUserIds,
    });
  }

  return rows;
}

/**
 * Calculates overall D1 retention rate across all COMPLETED cohorts only.
 * Incomplete future or in-progress cohorts are excluded from the main rate.
 */
export function calculateD1Retention(
  events: RawAnalyticsEvent[],
  userTimezones: Map<string, string> = new Map(),
  referenceDate: Date = new Date()
): RetentionRateResult {
  const cohortRows = getCohortRows(events, userTimezones, referenceDate);
  const completeCohorts = cohortRows.filter((r) => r.status === "complete");

  const totalEligible = completeCohorts.reduce((acc, r) => acc + r.eligibleUsers, 0);
  const totalRetained = completeCohorts.reduce((acc, r) => acc + r.d1RetainedUsers, 0);

  if (totalEligible === 0) {
    return {
      eligibleUsers: 0,
      retainedUsers: 0,
      d1Percentage: 0,
      hasEnoughData: false,
    };
  }

  return {
    eligibleUsers: totalEligible,
    retainedUsers: totalRetained,
    d1Percentage: (totalRetained / totalEligible) * 100,
    hasEnoughData: true,
  };
}

export interface FunnelStep {
  stepName: string;
  distinctUsers: number;
  percentageOfTotal: number;
}

export interface RetentionFunnelResult {
  totalNewUsers: number;
  steps: FunnelStep[];
}

/**
 * Calculates distinct users at each retention funnel step.
 */
export function calculateRetentionFunnel(
  events: RawAnalyticsEvent[],
  userTimezones: Map<string, string> = new Map(),
  referenceDate: Date = new Date()
): RetentionFunnelResult {
  const userSets = {
    newUsers: new Set<string>(),
    onboardingCompleted: new Set<string>(),
    planViewed: new Set<string>(),
    firstLessonStarted: new Set<string>(),
    firstLessonCompleted: new Set<string>(),
    tomorrowPreviewViewed: new Set<string>(),
    reminderEnabled: new Set<string>(),
    realD1Return: new Set<string>(),
  };

  for (const e of events) {
    if (!e.userId) continue;

    if (e.eventName === "first_session_started" || e.eventName === "onboarding_started") {
      userSets.newUsers.add(e.userId);
    }
    if (e.eventName === "onboarding_completed") {
      userSets.onboardingCompleted.add(e.userId);
    }
    if (e.eventName === "plan_viewed" || e.eventName === "plan_created") {
      userSets.planViewed.add(e.userId);
    }
    if (e.eventName === "lesson_started") {
      userSets.firstLessonStarted.add(e.userId);
    }
    if (e.eventName === "lesson_completed") {
      userSets.firstLessonCompleted.add(e.userId);
      userSets.tomorrowPreviewViewed.add(e.userId);
    }
    if (e.eventName === "reminder_settings_viewed") {
      userSets.tomorrowPreviewViewed.add(e.userId);
    }
    if (e.eventName === "reminder_enabled") {
      userSets.reminderEnabled.add(e.userId);
    }
  }

  // Ensure newUsers contains any user who completed later steps
  for (const uid of userSets.onboardingCompleted) userSets.newUsers.add(uid);
  for (const uid of userSets.planViewed) userSets.newUsers.add(uid);
  for (const uid of userSets.firstLessonStarted) userSets.newUsers.add(uid);

  // Compute real D1 returners
  const cohortRows = getCohortRows(events, userTimezones, referenceDate);
  for (const row of cohortRows) {
    for (const uid of row.retainedUserIds) {
      userSets.realD1Return.add(uid);
    }
  }

  const total = userSets.newUsers.size;
  const calcPct = (count: number) => (total > 0 ? (count / total) * 100 : 0);

  return {
    totalNewUsers: total,
    steps: [
      { stepName: "New users", distinctUsers: userSets.newUsers.size, percentageOfTotal: 100 },
      { stepName: "Onboarding completed", distinctUsers: userSets.onboardingCompleted.size, percentageOfTotal: calcPct(userSets.onboardingCompleted.size) },
      { stepName: "Plan viewed", distinctUsers: userSets.planViewed.size, percentageOfTotal: calcPct(userSets.planViewed.size) },
      { stepName: "First lesson started", distinctUsers: userSets.firstLessonStarted.size, percentageOfTotal: calcPct(userSets.firstLessonStarted.size) },
      { stepName: "First lesson completed", distinctUsers: userSets.firstLessonCompleted.size, percentageOfTotal: calcPct(userSets.firstLessonCompleted.size) },
      { stepName: "Tomorrow preview viewed", distinctUsers: userSets.tomorrowPreviewViewed.size, percentageOfTotal: calcPct(userSets.tomorrowPreviewViewed.size) },
      { stepName: "Reminder enabled", distinctUsers: userSets.reminderEnabled.size, percentageOfTotal: calcPct(userSets.reminderEnabled.size) },
      { stepName: "Real D1 return", distinctUsers: userSets.realD1Return.size, percentageOfTotal: calcPct(userSets.realD1Return.size) },
    ],
  };
}

export interface EventAuditRow {
  eventName: string;
  distinctUsers: number;
  totalEvents: number;
  earliestTimestamp: Date | null;
  latestTimestamp: Date | null;
}

/**
 * Aggregates event audit log metrics across all recorded analytics events.
 */
export function getEventAudit(events: RawAnalyticsEvent[]): EventAuditRow[] {
  const auditMap = new Map<
    string,
    {
      users: Set<string>;
      total: number;
      earliest: Date;
      latest: Date;
    }
  >();

  for (const e of events) {
    const existing = auditMap.get(e.eventName);
    if (!existing) {
      const users = new Set<string>();
      if (e.userId) users.add(e.userId);
      auditMap.set(e.eventName, {
        users,
        total: 1,
        earliest: e.occurredAt,
        latest: e.occurredAt,
      });
    } else {
      if (e.userId) existing.users.add(e.userId);
      existing.total += 1;
      if (e.occurredAt.getTime() < existing.earliest.getTime()) {
        existing.earliest = e.occurredAt;
      }
      if (e.occurredAt.getTime() > existing.latest.getTime()) {
        existing.latest = e.occurredAt;
      }
    }
  }

  const rows: EventAuditRow[] = [];
  const sortedNames = Array.from(auditMap.keys()).sort();

  for (const name of sortedNames) {
    const data = auditMap.get(name)!;
    rows.push({
      eventName: name,
      distinctUsers: data.users.size,
      totalEvents: data.total,
      earliestTimestamp: data.earliest,
      latestTimestamp: data.latest,
    });
  }

  return rows;
}
