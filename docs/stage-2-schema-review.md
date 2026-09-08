# Stage 2 — Schema Review Report

**Date:** 2026-09-08 18:34 IST

---

## 1. Project Path

```
C:\Users\asimk\Documents\unrot-daily-retention-prototype
```

---

## 2. Prisma Version

| Component          | Version |
| ------------------ | ------- |
| `prisma` (CLI)     | 7.10.0  |
| `@prisma/client`   | 7.10.0  |
| `@prisma/adapter-pg` | 7.10.0 |

---

## 3. Packages Installed

| Package               | Version  | Type           | Purpose                          |
| --------------------- | -------- | -------------- | -------------------------------- |
| `prisma`              | 7.10.0   | devDependency  | CLI: format, validate, generate  |
| `@prisma/client`      | 7.10.0   | dependency     | Prisma Client runtime            |
| `@prisma/adapter-pg`  | 7.10.0   | dependency     | PostgreSQL driver adapter (Prisma 7) |
| `tsx`                  | 4.23.13  | devDependency  | TypeScript execution for seed script |

---

## 4. Files Created or Changed

| File                                  | Action   | Purpose                                    |
| ------------------------------------- | -------- | ------------------------------------------ |
| `prisma/schema.prisma`               | Created  | Data model (7 models)                      |
| `prisma/seed.ts`                     | Created  | Seed data: 3 paths × 5 lessons            |
| `prisma.config.ts`                   | Created  | Prisma 7 configuration (schema path only) |
| `src/lib/prisma.ts`                  | Created  | Singleton PrismaClient for server use      |
| `src/generated/prisma/`              | Generated| Client output (gitignored)                 |
| `.gitignore`                         | Modified | Added `src/generated/` exclusion           |
| `package.json`                       | Modified | Added db:* scripts, prisma seed config     |
| `pnpm-lock.yaml`                     | Modified | Updated with new dependencies              |
| `docs/stage-2-schema-review.md`      | Created  | This report                                |

---

## 5. Complete Model List

| Model               | Fields | Primary Key | Purpose                              |
| -------------------- | ------ | ----------- | ------------------------------------ |
| `User`               | 5 + relations | UUID   | Core user account                    |
| `UserPreference`     | 9 + relation  | UUID   | Onboarding choices (role, goal)      |
| `LearningPath`       | 6 + relation  | UUID   | Curated multi-day learning paths     |
| `Lesson`             | 8 + relations | UUID   | Individual day's lesson content      |
| `LessonProgress`     | 7 + relations | UUID   | Per-user, per-lesson tracking        |
| `ReminderPreference` | 6 + relation  | UUID   | Notification preferences             |
| `AnalyticsEvent`     | 7 + relation  | UUID   | Flexible event log                   |

---

## 6. Important Relationships

```
User 1──1 UserPreference       (onDelete: Cascade)
User 1──1 ReminderPreference   (onDelete: Cascade)
User 1──∞ LessonProgress       (onDelete: Cascade)
User 1──∞ AnalyticsEvent       (onDelete: SetNull — preserves anonymous events)

LearningPath 1──∞ Lesson       (onDelete: Cascade)
Lesson 1──∞ LessonProgress     (onDelete: Cascade)
```

---

## 7. Unique Constraints

| Model            | Constraint                      | Reason                                      |
| ---------------- | ------------------------------- | ------------------------------------------- |
| `User`           | `email`                         | One account per email address               |
| `UserPreference` | `userId`                        | One-to-one with User                        |
| `ReminderPreference` | `userId`                   | One-to-one with User                        |
| `Lesson`         | `[learningPathId, dayNumber]`   | No duplicate day numbers within a path      |
| `LessonProgress` | `[userId, lessonId]`            | One progress record per user per lesson     |

---

## 8. Indexes

| Model            | Indexed Field(s)                | Query Pattern                               |
| ---------------- | ------------------------------- | ------------------------------------------- |
| `LearningPath`   | `[role, goal]`                  | Match paths to user preferences             |
| `LessonProgress` | `userId`                        | Fetch all progress for a user               |
| `LessonProgress` | `lessonId`                      | Fetch all users who started a lesson        |
| `AnalyticsEvent` | `eventName`                     | Filter events by type                       |
| `AnalyticsEvent` | `occurredAt`                    | Time-range queries for analytics dashboards |
| `AnalyticsEvent` | `userId`                        | Fetch events for a specific user            |

---

## 9. Delete / Cascade Behavior

| Parent → Child               | Behavior     | Rationale                                                 |
| ----------------------------- | ------------ | --------------------------------------------------------- |
| User → UserPreference        | **Cascade**  | Preferences are meaningless without the user              |
| User → ReminderPreference    | **Cascade**  | Reminders belong to the user                              |
| User → LessonProgress        | **Cascade**  | Progress data is user-specific                            |
| User → AnalyticsEvent        | **SetNull**  | Preserves event data for aggregate analytics after user deletion |
| LearningPath → Lesson        | **Cascade**  | Lessons are part of the path; removing a path removes its lessons |
| Lesson → LessonProgress      | **Cascade**  | Progress for a deleted lesson is no longer meaningful      |

> **Note:** `AnalyticsEvent.userId` uses `SetNull` (not `Cascade`) so that event counts, funnels, and aggregate metrics survive user account deletion. The `userId` field is nullable to support this.

---

## 10. Seed Data Summary

| Learning Path                  | Role              | Goal             | Lessons |
| ------------------------------ | ----------------- | ---------------- | ------- |
| AI for Product Managers        | product-manager   | upskilling       | 5       |
| AI for Software Engineers      | software-engineer | upskilling       | 5       |
| AI for General Professionals   | general           | staying-current  | 5       |

**Total:** 3 paths, 15 lessons.

Each lesson contains:
- Title, summary, and duration (5 minutes)
- 3 instructional sections with heading and body
- 1 practical example with title and description
- 1 knowledge-check question with 4 options and correct answer index

All content is original and covers real AI literacy topics.

---

## 11. Commands Run

| #  | Command                          | Exit Code | Result                        |
| -- | -------------------------------- | --------- | ----------------------------- |
| 1  | `pnpm add prisma@7.10.0 -D`     | 0*        | Installed CLI                 |
| 2  | `pnpm add @prisma/client@7.10.0 @prisma/adapter-pg@7.10.0` | 0* | Installed runtime |
| 3  | `pnpm approve-builds prisma @prisma/engines` | 0 | Approved postinstall scripts |
| 4  | `pnpm add tsx -D`                | 0*        | Installed for seed execution  |
| 5  | `pnpm approve-builds esbuild`   | 0         | Approved esbuild postinstall  |
| 6  | `pnpm db:format`                 | 0         | Schema formatted              |
| 7  | `pnpm db:validate`               | 0         | Schema valid                  |
| 8  | `pnpm db:generate`               | 0         | Client generated              |
| 9  | `pnpm lint`                      | 0         | Zero errors, zero warnings    |
| 10 | `pnpm build`                     | 0         | Production build succeeded    |
| 11 | `git status`                     | 0         | All files untracked           |

*Exit code 1 initially due to pnpm build-script approval policy; resolved with `pnpm approve-builds`.

---

## 12. Validation Results

| Check              | Status | Detail                                |
| ------------------ | ------ | ------------------------------------- |
| `prisma format`    | ✅     | Formatted in 27ms                     |
| `prisma validate`  | ✅     | Schema is valid                       |
| `prisma generate`  | ✅     | Client generated to src/generated/prisma |
| `pnpm lint`        | ✅     | Zero errors, zero warnings            |
| `pnpm build`       | ✅     | Compiled, TypeScript passed, pages generated |

---

## 13. Database Provisioning Confirmation

- ❌ **No cloud database was provisioned.**
- ❌ **No local database was configured.**
- ❌ **No `.env` file with credentials was created.**
- ✅ `.env.example` contains only empty/placeholder values.
- ✅ `.gitignore` excludes `.env` and `.env.*` (but not `.env.example`).

---

## 14. Migration / Push Confirmation

- ❌ `prisma db push` was **NOT** run.
- ❌ `prisma migrate dev` was **NOT** run.
- ❌ `prisma migrate deploy` was **NOT** run.
- No migration files exist in the project.

---

## 15. Open Decisions for Review

1. **Database provider selection:** The schema targets PostgreSQL. Confirm this is the intended provider (alternatives: MySQL, SQLite for local dev, CockroachDB).

2. **UUID strategy:** Using Prisma's `@default(uuid())` which generates v4 UUIDs. Consider `cuid()` if shorter, URL-safe IDs are preferred.

3. **`AnalyticsEvent.onDelete: SetNull` vs `Cascade`:** Currently set to `SetNull` to preserve aggregate analytics after user deletion. Confirm this aligns with data-retention policy.

4. **`UserPreference.reminderTime` type:** Stored as `String` (e.g., `"08:00"`). An alternative is to store minutes-since-midnight as `Int` for easier arithmetic. The current approach is more human-readable.

5. **Content schema validation:** `contentJson` is a free-form `Json` field. Consider adding runtime validation (e.g., Zod) to enforce the expected structure (sections, example, knowledgeCheck) at the application layer.

6. **Node.js version:** Prisma 7.10.0 officially supports Node 20.19+, 22.12+, 24.0+. The project uses Node 26.7.0 which is not yet in Prisma's official support matrix. All commands completed successfully but this should be monitored.

7. **ESLint version:** ESLint 9.39.5 is deprecated upstream (10.10.0 available). Migration to ESLint 10 may be needed before production.
