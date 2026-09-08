import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";

export const DEMO_USER_COOKIE = "unrot_demo_user_id";

/**
 * Cookie security options:
 * - httpOnly: true (prevents client-side JS access)
 * - sameSite: "lax" (CSRF defense while allowing navigation)
 * - secure: true in production only (works on local http://localhost)
 * - path: "/"
 * - maxAge: 30 days
 */
export const DEMO_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

export interface DemoUserResult {
  user: User;
  isNew: boolean;
}

/**
 * Retrieves the existing demo user identified by the HTTP-only cookie,
 * or creates a new demo user and sets the cookie.
 */
export async function getOrCreateDemoUser(): Promise<DemoUserResult> {
  const cookieStore = await cookies();
  const existingUserId = cookieStore.get(DEMO_USER_COOKIE)?.value;

  if (existingUserId) {
    const existingUser = await prisma.user.findUnique({
      where: { id: existingUserId },
    });
    if (existingUser) {
      return { user: existingUser, isNew: false };
    }
  }

  // Create a new demo user with a deterministic local format
  const newUserId = crypto.randomUUID();
  const email = `demo-${newUserId.slice(0, 8)}@unrot.local`;

  const newUser = await prisma.user.create({
    data: {
      id: newUserId,
      email,
      name: "Demo Learner",
    },
  });

  // Set HTTP-only cookie containing only the user ID
  cookieStore.set(DEMO_USER_COOKIE, newUser.id, DEMO_COOKIE_OPTIONS);

  return { user: newUser, isNew: true };
}

/**
 * Retrieves the demo user if the cookie is set and valid, without creating a new user.
 */
export async function getDemoUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(DEMO_USER_COOKIE)?.value;

  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
  });
}
