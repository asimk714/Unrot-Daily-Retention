"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrCreateDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validation";
import { recordEvent, recordFirstSessionStarted } from "@/lib/analytics";

export interface OnboardingState {
  error?: string | null;
  success?: boolean;
}

/**
 * Server Action for handling onboarding form submission.
 * Validates selections, associates with active authenticated user (or fallback demo user),
 * upserts user preferences, records server-side analytics, and redirects to /plan.
 */
export async function submitOnboarding(
  _prevState: OnboardingState | null,
  formData: FormData
): Promise<OnboardingState> {
  const rawRole = formData.get("role")?.toString() ?? "";
  const rawGoal = formData.get("learningGoal")?.toString() ?? "";
  const rawExperience = formData.get("experienceLevel")?.toString() ?? "";

  // 1. Validate inputs server-side with Zod
  const parsed = onboardingSchema.safeParse({
    role: rawRole,
    learningGoal: rawGoal,
    experienceLevel: rawExperience,
  });

  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Please make a valid selection for all steps.";
    return { error: message, success: false };
  }

  const { role, learningGoal, experienceLevel } = parsed.data;

  try {
    // 2. Resolve active authenticated user; fallback to demo user for backward compatibility
    let userId: string;
    let isNew = false;

    const authUser = await getCurrentUser();
    if (authUser) {
      userId = authUser.id;
    } else {
      const demoResult = await getOrCreateDemoUser();
      userId = demoResult.user.id;
      isNew = demoResult.isNew;
    }

    // 3. Upsert user preferences (prevents duplicate preferences on repeated submissions)
    await prisma.userPreference.upsert({
      where: { userId },
      update: {
        role,
        learningGoal,
        experienceLevel,
        reminderTime: null,
        timezone: null,
      },
      create: {
        userId,
        role,
        learningGoal,
        experienceLevel,
        reminderTime: null,
        timezone: null,
      },
    });

    // 4. Record analytics events safely
    if (isNew) {
      await recordEvent("onboarding_started", userId, {}, "/onboarding");
    }
    await recordEvent("role_selected", userId, { role }, "/onboarding");
    await recordEvent("goal_selected", userId, { goal: learningGoal }, "/onboarding");
    await recordEvent(
      "experience_level_selected",
      userId,
      { experienceLevel },
      "/onboarding"
    );
    await recordEvent(
      "onboarding_completed",
      userId,
      { role, goal: learningGoal, experienceLevel },
      "/onboarding"
    );
    await recordFirstSessionStarted(
      userId,
      { role, goal: learningGoal, experienceLevel },
      "/onboarding"
    );
    await recordEvent(
      "plan_created",
      userId,
      { role, goal: learningGoal },
      "/onboarding"
    );
  } catch (err) {
    console.error(
      "[OnboardingAction] Failed to persist onboarding:",
      err instanceof Error ? err.message : "Unknown error"
    );
    return {
      error: "Unable to save your learning plan. Please try again.",
      success: false,
    };
  }

  // 5. Navigate to /plan after successful persistence
  redirect("/plan");
}