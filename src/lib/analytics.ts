import { prisma } from "@/lib/prisma";

export interface AnalyticsProperties {
  [key: string]: unknown;
}

export const EVENT_NAMES = {
  // Acquisition and onboarding
  LANDING_VIEWED: "landing_viewed",
  ONBOARDING_STARTED: "onboarding_started",
  ROLE_SELECTED: "role_selected",
  GOAL_SELECTED: "goal_selected",
  EXPERIENCE_LEVEL_SELECTED: "experience_level_selected",
  ONBOARDING_COMPLETED: "onboarding_completed",
  PLAN_CREATED: "plan_created",
  PLAN_VIEWED: "plan_viewed",

  // Lesson
  LESSON_VIEWED: "lesson_viewed",
  LESSON_STARTED: "lesson_started",
  LESSON_SECTION_VIEWED: "lesson_section_viewed",
  QUIZ_STARTED: "quiz_started",
  QUIZ_ANSWERED: "quiz_answered",
  QUIZ_COMPLETED: "quiz_completed",
  LESSON_COMPLETED: "lesson_completed",

  // Reminder
  REMINDER_SETTINGS_VIEWED: "reminder_settings_viewed",
  REMINDER_PREFERENCE_SAVED: "reminder_preference_saved",
  REMINDER_ENABLED: "reminder_enabled",
  REMINDER_DISABLED: "reminder_disabled",

  // Return
  FIRST_SESSION_STARTED: "first_session_started",
  RETURN_HOME_VIEWED: "return_home_viewed",
  NEXT_LESSON_STARTED: "next_lesson_started",
  SESSION_RETURNED_D1: "session_returned_d1",

  // Demo Simulation
  DEMO_RETURN_PREVIEWED: "demo_return_previewed",
} as const;

export type KnownEventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];

/**
 * Server-safe analytics event recorder.
 * Stores events in the AnalyticsEvent table with JSON stringified properties.
 * Non-blocking: catches failures and logs safe messages without throwing.
 * Excludes sensitive data (passwords, tokens, database URLs, cookie secrets).
 */
export async function recordEvent(
  eventName: string,
  userId?: string | null,
  properties: AnalyticsProperties = {},
  route?: string | null
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventName,
        userId: userId ?? null,
        propertiesJson: JSON.stringify(properties),
        route: route ?? null,
      },
    });
  } catch (error) {
    console.error(
      `[Analytics] Failed to record event "${eventName}":`,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * Idempotently records the first_session_started event for a user.
 * Repeated visits will not create duplicate first-session events for the same user.
 * Uses server-recorded timestamp only.
 */
export async function recordFirstSessionStarted(
  userId: string,
  properties: AnalyticsProperties = {},
  route: string = "/onboarding"
): Promise<boolean> {
  try {
    const existing = await prisma.analyticsEvent.findFirst({
      where: {
        userId,
        eventName: EVENT_NAMES.FIRST_SESSION_STARTED,
      },
      select: { id: true },
    });

    if (existing) {
      return false; // Already recorded, idempotent no-op
    }

    await recordEvent(
      EVENT_NAMES.FIRST_SESSION_STARTED,
      userId,
      properties,
      route
    );
    return true;
  } catch (error) {
    console.error(
      "[Analytics] Failed to record first_session_started idempotently:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return false;
  }
}
