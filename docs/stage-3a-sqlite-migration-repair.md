# Stage 3a — SQLite Migration Repair Report

**Date:** 2026-09-08 20:05 IST  
**Project Path:** `C:\Users\asimk\Documents\unrot-daily-retention-prototype`

---

## 1. Original Error

During initial migration execution (`pnpm prisma migrate dev --name init_sqlite`), Prisma failed with error code **P3018**:

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

In `prisma/schema.prisma`, the `AnalyticsEvent` model was declared with:
```prisma
propertiesJson Json @default("{}")
```
When targeting SQLite, Prisma's migration engine generates DDL with an unquoted JSON literal:
```sql
"propertiesJson" JSONB NOT NULL DEFAULT {}
```
SQLite's SQL parser does not support `{}` as an unquoted default token for column definitions. SQLite column defaults must be numbers, string literals, `NULL`, or recognized keyword expressions. As a result, SQLite rejected the table creation with `unrecognized token: "{"`.

---

## 3. Json Fields Inspected

A full schema inspection identified two `Json` fields:

| Model | Field | Definition Before Fix | Default Value | SQLite Compatibility |
|---|---|---|---|---|
| `Lesson` | `contentJson` | `contentJson Json` | None | Compatible (generates `"contentJson" JSONB NOT NULL`) |
| `AnalyticsEvent` | `propertiesJson` | `propertiesJson Json @default("{}")` | `@default("{}")` | Incompatible (generates invalid unquoted `DEFAULT {}`) |

---

## 4. Schema Changes

To resolve the SQLite incompatibility without altering field types, relationships, or product behavior, the invalid `@default("{}")` was removed from `AnalyticsEvent`:

```prisma
// Before
model AnalyticsEvent {
  ...
  propertiesJson Json     @default("{}")
  ...
}

// After
model AnalyticsEvent {
  ...
  propertiesJson Json
  ...
}
```

- **Field type:** Preserved as `Json`.
- **Model relationships:** Preserved (`user User? @relation(...)`).
- **Indexes:** Preserved (`@@index([eventName])`, `@@index([occurredAt])`, `@@index([userId])`).
- **Application behavior:** The analytics logging layer passes valid JSON (e.g. `{}` or payload) when creating events.

---

## 5. Migration Recovery Steps

Because this is a disposable local development database with no production or user data:
1. Removed the failed migration folder: `prisma/migrations/20260908142841_init_sqlite/`
2. Removed `prisma/migrations/migration_lock.toml`
3. Removed the failed local development database file (`dev.db`)
4. Verified `prisma/schema.prisma` and `prisma/seed.ts` remained intact
5. Configured seed execution command under `migrations.seed` in `prisma.config.ts` for Prisma 7 compatibility
6. Generated a clean initial migration: `pnpm prisma migrate dev --name init_sqlite`
7. Seeded the database: `pnpm db:seed`
8. Verified migration status: `pnpm prisma migrate status`

---

## 6. Migration Details

- **Migration Name:** `20260908143348_init_sqlite`
- **Location:** `prisma/migrations/20260908143348_init_sqlite/migration.sql`
- **Migration Status:** Applied successfully (`Database schema is up to date!`).

---

## 7. Seed Counts & Verification

Direct read-only verification executed against the local database:

| Entity | Target | Actual Count | Status |
|---|---|---|---|
| Users | 0 | 0 | Expected (pre-onboarding) |
| Learning Paths | 3 | 3 | Verified |
| Lessons | 15 | 15 | Verified (5 per path) |

### Learning Paths Verified:
1. **AI for Product Managers** (role: `product-manager`, goal: `upskilling`, 5 lessons)
2. **AI for Software Engineers** (role: `software-engineer`, goal: `upskilling`, 5 lessons)
3. **AI for General Professionals** (role: `general`, goal: `staying-current`, 5 lessons)

---

## 8. Validation Results

| Command | Exit Code | Status |
|---|---|---|
| `pnpm prisma format` | 0 | Passed (28ms) |
| `pnpm prisma validate` | 0 | Passed ("The schema is valid 🚀") |
| `pnpm prisma migrate dev --name init_sqlite` | 0 | Passed (created & applied migration) |
| `pnpm db:seed` | 0 | Passed (seeded 3 paths, 15 lessons) |
| `pnpm prisma migrate status` | 0 | Passed ("Database schema is up to date!") |
| `pnpm lint` | 0 | Passed (zero errors, zero warnings) |
| `pnpm build` | 0 | Passed (client generated, Next.js build succeeded) |

---

## 9. Environment Confirmations

- **Local SQLite only:** Yes. Database resides strictly in a local file.
- **Docker used:** No.
- **PostgreSQL used:** No.
- **Cloud database used:** No.
- **Git status:** Local database files (`*.db`, `*.db-journal`, `*.sqlite`, `*.sqlite3`) and `.env` are strictly excluded by `.gitignore`.

---

## 10. Remaining Warnings

- **Prisma Node.js version advisory:** Prisma 7 emits an advisory regarding Node.js 26 (officially validated on 20, 22, 24). All CLI commands and runtime operations executed without failure.
- **ESLint 9 deprecation:** ESLint 9 is deprecated upstream; upgrade to ESLint 10 can be scheduled for a future cycle.

---

## 11. Safe Commands for Future Local Development

- Start development server: `pnpm dev`
- Inspect database in browser: `pnpm db:studio`
- Format schema: `pnpm db:format`
- Validate schema: `pnpm db:validate`
- Re-run migrations: `pnpm db:migrate`
- Reset and re-seed local database safely:
  ```bash
  # Delete local dev.db and re-run migrations + seed
  pnpm prisma migrate reset
  ```
