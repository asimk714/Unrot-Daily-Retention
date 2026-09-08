"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDemoUser, DEMO_COOKIE_OPTIONS } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import {
  isValidReminderTime,
  normalizeTimezone,
  DEMO_RETURN_PREVIEW_COOKIE,
} from "@/lib/reminders";
import { recordEvent } from "@/lib/analytics";

export interface ReminderActionState {
  success: boolean;
  message?: string;
  error?: string;
  enabled?: boolean;
  reminderTime?: string;
  timezone?: string;
}

/**
 * Saves or updates daily reminder preferences for the current demo user.
 */
export async function saveReminderPreferenceAction(
  _prevState: ReminderActionState | null,
  formData: FormData
): Promise<ReminderActionState> {
  const user = await getDemoUser();
  if (!user) {
    return {
      success: false,
      error: "No active session found. Please complete onboarding first.",
    };
  }

  const enabledRaw = formData.get("enabled");
  const enabled = enabledRaw === "true" || enabledRaw === "on" || enabledRaw === "1";
  const rawTime = (formData.get("reminderTime") as string | null) ?? "08:00";
  const rawTimezone = (formData.get("timezone") as string | null) ?? "UTC";

  const reminderTime = rawTime.trim();
  if (enabled && !isValidReminderTime(reminderTime)) {
    return {
      success: false,
      error: "Please enter a valid 24-hour time format (HH:mm between 00:00 and 23:59).",
    };
  }

  const timezone = normalizeTimezone(rawTimezone);

  try {
    await prisma.reminderPreference.upsert({
      where: { userId: user.id },
      update: {
        enabled,
        reminderTime: isValidReminderTime(reminderTime) ? reminderTime : "08:00",
        timezone,
      },
      create: {
        userId: user.id,
        enabled,
        reminderTime: isValidReminderTime(reminderTime) ? reminderTime : "08:00",
        timezone,
      },
    });

    // Mirror to UserPreference if record exists
    await prisma.userPreference.updateMany({
      where: { userId: user.id },
      data: {
        reminderTime: enabled ? reminderTime : null,
        timezone,
      },
    });

    // Record analytics
    await recordEvent(
      "reminder_preference_saved",
      user.id,
      { enabled, reminderTime, timezone },
      "/learn/complete"
    );

    await recordEvent(
      enabled ? "reminder_enabled" : "reminder_disabled",
      user.id,
      { reminderTime, timezone },
      "/learn/complete"
    );

    revalidatePath("/learn/complete");
    revalidatePath("/home");
    revalidatePath("/plan");

    return {
      success: true,
      message: enabled
        ? `Daily reminder scheduled for ${reminderTime} (${timezone}).`
        : "Daily reminders turned off.",
      enabled,
      reminderTime,
      timezone,
    };
  } catch (err) {
    console.error("[ReminderAction] Failed to save reminder preference:", err);
    return {
      success: false,
      error: "An unexpected error occurred while saving your preferences. Please try again.",
    };
  }
}

/**
 * Activates the demo simulated next-day return loop.
 * Sets the demo simulation cookie and records 'demo_return_previewed' (never session_returned_d1).
 */
export async function activateDemoReturnPreviewAction(): Promise<void> {
  const user = await getDemoUser();
  const cookieStore = await cookies();

  // Set the simulation cookie (isolated from user identity cookie)
  cookieStore.set(DEMO_RETURN_PREVIEW_COOKIE, "1", {
    ...DEMO_COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24, // 24 hours
  });

  if (user) {
    await recordEvent(
      "demo_return_previewed",
      user.id,
      { simulated: true, simulatedDay: 2 },
      "/home"
    );
  }

  revalidatePath("/home");
  revalidatePath("/learn/complete");
  redirect("/home");
}

/**
 * Exits the demo simulated return loop.
 * Clears the preview cookie and returns to /home or /plan.
 */
export async function exitDemoReturnPreviewAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_RETURN_PREVIEW_COOKIE);

  revalidatePath("/home");
  revalidatePath("/learn/complete");
  redirect("/home");
}
