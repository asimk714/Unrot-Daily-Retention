"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  invalidateSession,
  setSessionCookie,
  clearSessionCookie,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { recordEvent, recordFirstSessionStarted } from "@/lib/analytics";
import { cookies } from "next/headers";

export interface AuthActionState {
  error?: string | null;
  success?: boolean;
}

const authSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long."),
  name: z.string().trim().max(100).optional(),
});

/**
 * Server Action to register a new user account.
 * Validates inputs, hashes password, provisions User and Session, sets cookie,
 * records analytics, and redirects to /onboarding.
 */
export async function signUpAction(
  _prevState: AuthActionState | null,
  formData: FormData
): Promise<AuthActionState> {
  const rawEmail = formData.get("email")?.toString() ?? "";
  const rawPassword = formData.get("password")?.toString() ?? "";
  const rawName = formData.get("name")?.toString() ?? "";

  const parsed = authSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
    name: rawName || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid credentials entered.",
      success: false,
    };
  }

  const { email, password, name } = parsed.data;

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      error: "An account with this email address already exists. Please log in.",
      success: false,
    };
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
      },
    });

    // Create session & set HTTP-only cookie
    const token = await createSession(user.id);
    await setSessionCookie(token);

    // Record signup analytics
    await recordEvent("user_signed_up", user.id, { emailDomain: email.split("@")[1] }, "/signup");
    await recordFirstSessionStarted(user.id, { source: "direct_signup" }, "/signup");
  } catch (err) {
    console.error("[SignUpAction] Error:", err instanceof Error ? err.message : "Unknown error");
    return {
      error: "Unable to complete registration. Please try again.",
      success: false,
    };
  }

  // Direct newly registered user to onboarding
  redirect("/onboarding");
}

/**
 * Server Action to log in an existing user.
 * Validates credentials, checks password hash, establishes session, sets cookie,
 * and navigates to /home (or /onboarding if preferences not yet set).
 */
export async function logInAction(
  _prevState: AuthActionState | null,
  formData: FormData
): Promise<AuthActionState> {
  const rawEmail = formData.get("email")?.toString() ?? "";
  const rawPassword = formData.get("password")?.toString() ?? "";

  if (!rawEmail || !rawPassword) {
    return {
      error: "Please enter both email and password.",
      success: false,
    };
  }

  const email = rawEmail.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    include: { preference: true },
  });

  if (!user || !user.passwordHash) {
    return {
      error: "Invalid email or password. Please check your credentials.",
      success: false,
    };
  }

  const isValidPassword = await verifyPassword(rawPassword, user.passwordHash);
  if (!isValidPassword) {
    return {
      error: "Invalid email or password. Please check your credentials.",
      success: false,
    };
  }

  let destination = "/home";
  try {
    const token = await createSession(user.id);
    await setSessionCookie(token);

    await recordEvent("user_logged_in", user.id, {}, "/login");

    if (!user.preference) {
      destination = "/onboarding";
    }
  } catch (err) {
    console.error("[LogInAction] Error:", err instanceof Error ? err.message : "Unknown error");
    return {
      error: "An error occurred while logging in. Please try again.",
      success: false,
    };
  }

  redirect(destination);
}

/**
 * Server Action to log out the active user.
 * Invalidates the session in the database, clears the HTTP-only cookie,
 * and redirects to /login.
 */
export async function logOutAction(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await invalidateSession(token);
  }

  await clearSessionCookie();
  redirect("/login");
}