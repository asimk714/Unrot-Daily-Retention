import { prisma } from "@/lib/prisma";
import type { LearningPath, Lesson } from "@/generated/prisma/client";

export interface LearningPathWithLessons extends LearningPath {
  lessons: Lesson[];
}

/**
 * Normalizes user-facing role strings to database category keys:
 * - "Product manager" -> "product-manager"
 * - "Software engineer" -> "software-engineer"
 * - All other roles ("Designer", "Marketing or sales", "Student", "Other") -> "general"
 */
export function normalizeRole(role: string): string {
  const normalized = role.trim().toLowerCase();
  if (normalized.includes("product")) return "product-manager";
  if (normalized.includes("software") || normalized.includes("engineer")) return "software-engineer";
  return "general";
}

/**
 * Normalizes user-facing goal strings to database goal keys:
 * - "Keep up with AI news" -> "staying-current"
 * - "Prepare for AI interviews" -> "interview-prep"
 * - Others ("Use AI more effectively at work", "Understand AI fundamentals", "Learn prompt engineering") -> "upskilling"
 */
export function normalizeGoal(goal: string): string {
  const normalized = goal.trim().toLowerCase();
  if (normalized.includes("news")) return "staying-current";
  if (normalized.includes("interview")) return "interview-prep";
  return "upskilling";
}

/**
 * Deterministic Learning Path Matcher:
 * 1. First attempt exact match by role and goal (or normalized role and goal).
 * 2. If no exact match exists, attempt match by goal (or normalized goal).
 * 3. If still no match exists, return the first available learning path ordered by createdAt ascending.
 */
export async function matchLearningPath(
  role: string,
  goal: string
): Promise<LearningPathWithLessons | null> {
  const normRole = normalizeRole(role);
  const normGoal = normalizeGoal(goal);

  // Step 1: Match by role and goal
  const exactMatch = await prisma.learningPath.findFirst({
    where: {
      OR: [
        { role: normRole, goal: normGoal },
        { role, goal },
        { role: normRole },
      ],
    },
    include: {
      lessons: {
        orderBy: { dayNumber: "asc" },
      },
    },
  });

  if (exactMatch) {
    return exactMatch;
  }

  // Step 2: Match by goal
  const goalMatch = await prisma.learningPath.findFirst({
    where: {
      OR: [
        { goal: normGoal },
        { goal },
      ],
    },
    include: {
      lessons: {
        orderBy: { dayNumber: "asc" },
      },
    },
  });

  if (goalMatch) {
    return goalMatch;
  }

  // Step 3: Fallback to the first available learning path
  return prisma.learningPath.findFirst({
    orderBy: { createdAt: "asc" },
    include: {
      lessons: {
        orderBy: { dayNumber: "asc" },
      },
    },
  });
}
