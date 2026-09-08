import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";

export const SESSION_COOKIE_NAME = "unrot_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

/**
 * Creates a persistent server-side session record in PostgreSQL and returns the secret token.
 */
export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

/**
 * Validates a session token against the database.
 * If expired, cleans it up and returns null.
 * If valid, returns the associated User.
 */
export async function validateSessionToken(token: string): Promise<User | null> {
  if (!token || typeof token !== "string") {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  // Check expiration
  if (session.expiresAt.getTime() <= Date.now()) {
    // Eagerly delete expired session
    try {
      await prisma.session.delete({ where: { token } });
    } catch {
      // Ignore concurrency deletion errors
    }
    return null;
  }

  return session.user;
}

/**
 * Invalidates (deletes) a session record in the database.
 */
export async function invalidateSession(token: string): Promise<void> {
  if (!token) return;
  try {
    await prisma.session.deleteMany({
      where: { token },
    });
  } catch {
    // Ignore if already deleted
  }
}

/**
 * Reads the current session token from HTTP-only cookies and resolves the active authenticated user.
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const user = await validateSessionToken(token);
  if (!user) {
    // Clear stale cookie
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  return user;
}

/**
 * Sets the HTTP-only session cookie in the Next.js response.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
}

/**
 * Clears the HTTP-only session cookie.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}