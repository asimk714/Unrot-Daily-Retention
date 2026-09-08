"use server";

import { redirect } from "next/navigation";
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
 * Validates selections, provisions or reuses the demo user,
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
    // 2. Provision or retrieve existing demo user (cookie-backed)
    const { user, isNew } = await getOrCreateDemoUser();

    // 3. Upsert user preferences (prevents duplicate users on repeated submissions)
    await prisma.userPreference.upsert({
      where: { userId: user.id },
      update: {
        role,
        learningGoal,
        experienceLevel,
        reminderTime: null,
        timezone: null,
      },
      create: {
        userId: user.id,
        role,
        learningGoal,
        experienceLevel,
        reminderTime: null,
        timezone: null,
      },
    });

    // 4. Record analytics events safely
    if (isNew) {
      await recordEvent("onboarding_started", user.id, {}, "/onboarding");
    }
    await recordEvent("role_selected", user.id, { role }, "/onboarding");
    await recordEvent("goal_selected", user.id, { goal: learningGoal }, "/onboarding");
    await recordEvent(
      "experience_level_selected",
      user.id,
      { experienceLevel },
      "/onboarding"
    );
    await recordEvent(
      "onboarding_completed",
      user.id,
      { role, goal: learningGoal, experienceLevel },
      "/onboarding"
    );
    await recordFirstSessionStarted(
      user.id,
      { role, goal: learningGoal, experienceLevel },
      "/onboarding"
    );
    await recordEvent(
      "plan_created",
      user.id,
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
