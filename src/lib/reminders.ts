import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { Lesson, ReminderPreference } from "@/generated/prisma/client";

export const DEMO_RETURN_PREVIEW_COOKIE = "unrot_demo_return_preview";

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Validates 24-hour time format "HH:mm" (00:00 to 23:59).
 */
export function isValidReminderTime(time: string): boolean {
  if (typeof time !== "string") return false;
  return TIME_REGEX.test(time.trim());
}

/**
 * Validates whether a timezone identifier is a supported IANA time zone.
 */
export function isValidTimezone(tz: string): boolean {
  if (!tz || typeof tz !== "string") return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz.trim() });
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalizes timezone to a valid IANA time zone identifier, falling back to "UTC".
 */
export function normalizeTimezone(tz: string | null | undefined): string {
  if (!tz || typeof tz !== "string") return "UTC";
  const trimmed = tz.trim();
  return isValidTimezone(trimmed) ? trimmed : "UTC";
}

export interface NextLessonResult {
  nextLesson: Lesson | null;
  completedCount: number;
  totalCount: number;
  isCompleted: boolean;
}

/**
 * Determines the next incomplete lesson for a user in a learning path.
 * If all lessons are completed, returns isCompleted: true and nextLesson: null.
 */
export async function getNextIncompleteLesson(
  userId: string,
  pathId: string
): Promise<NextLessonResult> {
  const lessons = await prisma.lesson.findMany({
    where: { learningPathId: pathId },
    orderBy: { dayNumber: "asc" },
  });

  if (lessons.length === 0) {
    return {
      nextLesson: null,
      completedCount: 0,
      totalCount: 0,
      isCompleted: true,
    };
  }

  const lessonIds = lessons.map((l) => l.id);
  const completedProgress = await prisma.lessonProgress.findMany({
    where: {
      userId,
      lessonId: { in: lessonIds },
      completedAt: { not: null },
    },
    select: { lessonId: true },
  });

  const completedSet = new Set(completedProgress.map((p) => p.lessonId));
  const completedCount = completedSet.size;
  const totalCount = lessons.length;

  const nextLesson = lessons.find((l) => !completedSet.has(l.id)) ?? null;
  const isCompleted = completedCount === totalCount;

  return {
    nextLesson,
    completedCount,
    totalCount,
    isCompleted,
  };
}

/**
 * Retrieves the user's stored reminder preference, if any.
 */
export async function getReminderPreference(
  userId: string
): Promise<ReminderPreference | null> {
  return prisma.reminderPreference.findUnique({
    where: { userId },
  });
}

/**
 * Checks whether the demo next-day return preview cookie is currently set.
 */
export async function isDemoReturnPreviewActive(): Promise<boolean> {
  const cookieStore = await cookies();
  const val = cookieStore.get(DEMO_RETURN_PREVIEW_COOKIE)?.value;
  return val === "1" || val === "true";
}
