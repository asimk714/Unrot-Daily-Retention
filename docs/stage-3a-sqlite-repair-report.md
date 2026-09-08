# Stage 3a — SQLite Migration Repair Report

**Date:** 2026-09-08 20:11 IST  
**Project Path:** `C:\Users\asimk\Documents\unrot-daily-retention-prototype`

---

## 1. Original Error

During the initial SQLite migration attempt (`pnpm prisma migrate dev --name init_sqlite`), Prisma failed with error code **P3018**:

```
Applying migration `20260908142841_init_sqlite`
Error: P3018

A migration failed to apply.
Migration name: 20260908142841_init_sqlite
Database error code: 1
Database error: unrecognized token: "{" in 

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "eventName" TEXT NOT NULL,
    "propertiesJson" JSONB NOT NULL DEFAULT {},
...
 at offset 179
```

---

## 2. Root Cause

When using `Json` with `@default("{}")` under SQLite, Prisma's migration generator emitted an unquoted JSON object default in SQLite DDL (`"propertiesJson" JSONB NOT NULL DEFAULT {}`). SQLite syntax does not permit unquoted object literals as column defaults; default values must be quoted string literals, numbers, `NULL`, or recognized keyword expressions. Furthermore, SQLite lacks a native `JSONB` data type.

---

## 3. Chosen Fix

To provide a 100% reliable, native SQLite representation while preserving model integrity and relationships:
- Replaced Prisma's `Json` type with standard SQLite-compatible `String` (stored as `TEXT`).
- For `AnalyticsEvent.propertiesJson`, set a valid quoted string default: `@default("{}")`.
- For `Lesson.contentJson`, set type to `String` (without a default, populated by the seed and application code).
- Updated seed and application helpers to explicitly serialize and deserialize JSON payloads via `JSON.stringify()` and `JSON.parse()`.

---

## 4. Fields Changed from Json to String

| Model | Field | Before | After | SQLite Representation |
|---|---|---|---|---|
| `AnalyticsEvent` | `propertiesJson` | `Json @default("{}")` | `String @default("{}")` | `TEXT NOT NULL DEFAULT '{}'` |
| `Lesson` | `contentJson` | `Json` | `String` | `TEXT NOT NULL` |

All relations, IDs, timestamps, unique constraints, and indexes were strictly preserved.

---

## 5. Serialization Approach

1. **Seed Data:**
   - In `prisma/seed.ts`, lesson structured content objects are serialized using `JSON.stringify(lesson.content)` before insertion.
2. **Application Helpers (`src/lib/json.ts`):**
   - `serializeJson<T>(value: T): string` — safe JSON serialization.
   - `parseJson<T>(value: string, fallback?: T): T` — safe JSON parsing with optional fallback support.

---

## 6. Files Changed

| File | Change Summary |
|---|---|
| `prisma/schema.prisma` | Changed `Lesson.contentJson` and `AnalyticsEvent.propertiesJson` from `Json` to `String` (with `@default("{}")` on `propertiesJson`). |
| `prisma/seed.ts` | Updated `contentJson` insertion to use `JSON.stringify(lesson.content)`. |
| `src/lib/json.ts` | Added `serializeJson` and `parseJson` utilities for application-level data handling. |
| `docs/stage-3a-sqlite-repair-report.md` | Created this repair report. |

---

## 7. Local Cleanup Actions

Before generating the new migration:
1. Confirmed that no cloud, production, or remote database was configured or connected.
2. Confirmed that the local database is a disposable development instance with zero user data.
3. Removed the failed migration folder `prisma/migrations/20260908143348_init_sqlite/` and `migration_lock.toml`.
4. Removed the local SQLite file `dev.db`.
5. Retained the parent `prisma/migrations` folder, schema, seed, and source files intact.

---

## 8. Migration Details

- **Migration Name:** `20260908144012_init_sqlite`
- **Location:** `prisma/migrations/20260908144012_init_sqlite/migration.sql`
- **Migration Status:** Applied cleanly (`Database schema is up to date!`).
- **Inspection of `migration.sql`:**
  - `JSONB` present: **No**
  - `DEFAULT {}` (unquoted) present: **No**
  - `propertiesJson`: Defined as `TEXT NOT NULL DEFAULT '{}'`
  - `contentJson`: Defined as `TEXT NOT NULL`
  - Foreign keys & indexes: **All present and validated**

---

## 9. Seed Counts & Verification

Read-only verification query against the local SQLite database:

| Entity | Target | Actual Count | Status |
|---|---|---|---|
| Users | 0 | 0 | Verified (pre-signup baseline) |
| Learning Paths | 3 | 3 | Verified |
| Lessons | 15 | 15 | Verified (5 per path) |

### Learning Paths Verified:
1. **AI for Product Managers** (role: `product-manager`, goal: `upskilling`, 5 lessons)
2. **AI for Software Engineers** (role: `software-engineer`, goal: `upskilling`, 5 lessons)
3. **AI for General Professionals** (role: `general`, goal: `staying-current`, 5 lessons)

---

## 10. Validation Results

| Command | Exit Code | Result |
|---|---|---|
| `pnpm prisma format` | 0 | Formatted successfully in 27ms |
| `pnpm prisma validate` | 0 | Schema is valid |
| `pnpm prisma generate` | 0 | Generated Prisma Client in 133ms |
| `pnpm prisma migrate dev --name init_sqlite` | 0 | Created and applied migration `20260908144012_init_sqlite` |
| `pnpm db:seed` | 0 | Seeded 3 paths and 15 lessons |
| `pnpm prisma migrate status` | 0 | Database schema is up to date |
| `pnpm lint` | 0 | Zero errors, zero warnings |
| `pnpm build` | 0 | Next.js production build succeeded |

---

## 11. Environment & Architecture Confirmations

- **Local SQLite only:** Yes. Database resides strictly in a local file.
- **Docker used:** No.
- **PostgreSQL used:** No.
- **Cloud database used:** No.
- **Git status:** Local database files (`*.db`, `*.db-journal`, `*.sqlite`, `*.sqlite3`) and `.env` are excluded by `.gitignore`.

---

## 12. Known Limitations

- SQLite stores JSON fields as `TEXT`; schema-level validation of JSON structure is not performed by the database engine.
- SQLite does not support native JSON query operators (e.g. PostgreSQL `->>`, `?`); query filtering on nested JSON properties must be handled via application logic or SQLite JSON1 functions.

---

## 13. Future PostgreSQL Migration Notes

When moving back to PostgreSQL in a later stage:
1. Change datasource provider from `sqlite` to `postgresql`.
2. Swap `@prisma/adapter-better-sqlite3` for `@prisma/adapter-pg`.
3. Optionally migrate `contentJson` and `propertiesJson` from `String` back to `Json` (native `JSONB`).
4. Generate a clean PostgreSQL migration.
