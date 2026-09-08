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
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL || "file:./dev.db";

  const adapter = new PrismaBetterSqlite3({
    url: connectionString,
    timeout: 10000,
  });

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
