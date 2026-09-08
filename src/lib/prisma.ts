/**
 * Prisma Client singleton for server-side use only.
 *
 * Prisma 7 SQLite setup notes:
 * - Client is generated into src/generated/prisma (explicit output path).
 * - Import PrismaClient from the generated path, NOT from "@prisma/client".
 * - SQLite driver adapter (@prisma/adapter-better-sqlite3) is required at runtime.
 * - In development, a global singleton prevents exhausting connections during
 *   hot-module reloading.
 *
 * DO NOT import this module from client components ("use client").
 */

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  const pool = new Pool({
    connectionString,
    max: 10,
    ssl:
      connectionString?.includes("sslmode=require") ||
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
