# Stage 6 — Reminder Preferences & Simulated Next-Day Return Loop Report

**Date:** 2026-09-08 20:35 IST  
**Project Path:** `C:\Users\asimk\Documents\unrot-daily-retention-prototype`

---

## 1. Product Behavior

Stage 6 delivers the daily retention loop infrastructure that motivates and guides learners to return for subsequent daily sessions:

1. **Daily Reminder Preferences (`/learn/complete`):**
   - **Habit Formation Mechanism:** Learners can establish an intentional daily practice by selecting a daily reminder hour.
   - **Accessible Form Controls:** Accessible toggle for enabling/pausing reminders, HTML `<input type="time">` accepting 24-hour time (`HH:mm`), and client-side device timezone auto-detection via `Intl.DateTimeFormat().resolvedOptions().timeZone` with a safe fallback to `UTC`.
   - **Idempotent Persistence:** Upserts into the `ReminderPreference` table (`userId` unique constraint) and syncs reminder fields to `UserPreference`.
   - **Clear Prototype Disclosure:** Explicit disclosure informs the user that the prototype runs locally and stores preferences to model habit timing without sending real emails or external push notifications.
   - **Live Status Feedback:** Accessible `aria-live="polite"` banners provide instant feedback on save without page reloads.

2. **Simulated Next-Day Return Loop (Evaluation Mode):**
   - **Instant Retrospective Preview:** Evaluators and learners can test tomorrow's returning experience without waiting 24 hours.
   - **Strict Data Integrity:** The simulation does **not** modify the operating system clock, fake database timestamps, or mutate real lesson dates.
   - **Isolated Cookie State:** Operates through a dedicated HTTP-only cookie (`unrot_demo_return_preview=1`) completely separated from the learner's identity cookie (`unrot_demo_user_id`).
   - **Safe Analytics Enforcement:** Triggers `demo_return_previewed` and **strictly prohibits** emitting `session_returned_d1` during preview mode.
   - **Visual Mode Indicators & Exit Control:** In simulation mode, `/home` displays a prominent banner (*"Prototype demo: preview tomorrow's learner return experience"*) with an *"Exit demo preview"* button that clears the cookie immediately.

3. **Dedicated Returning-Learner Experience (`/home` & `/learn`):**
   - **Personalized Welcome:** Greets returning learners by name and confirms their active daily habit streak.
   - **Path & Goal Summary:** Re-anchors learner motivation to their chosen learning path and professional goal.
   - **Dynamic "Up Next" Hero Lesson:** Automatically calculates the next incomplete lesson (e.g., Day 2 when Day 1 is completed) and provides a single direct CTA to start the next session.
   - **Completion Handling:** When all 5 lessons are finished, displays an achievement badge with options to review the curriculum.
   - **Curriculum Progress Bar:** Visual indicator displaying completed lessons count and percentage completion.
   - **Daily Reminder Status Card:** Displays the learner's active reminder hour and timezone with a direct link to adjust preferences.
   - **Curriculum Syllabus Link:** Quick access back to `/plan` to review past topics or syllabus structure.
   - **Dynamic `/learn/today`:** Automatically resolves and loads the learner's next incomplete lesson when resumed.

---

## 2. Routes Created or Changed

| Route | Type | Purpose |
|---|---|---|
| `/home` | Dynamic (Server) | Returning-learner dashboard displaying personalized welcome, active path, next incomplete lesson, progress overview, and reminder status. |
| `/learn` | Static Redirect | Redirects learners directly to `/home`. |
| `/learn/complete` | Dynamic (Server) | Extended with the `ReminderForm` component and the `DemoReturnTriggerCard` preview trigger. |
| `/learn/today` | Dynamic (Server + Client) | Upgraded to automatically select and deliver the user's next incomplete lesson (e.g., Day 2) upon return. |
| `/plan` | Dynamic (Server) | Full 5-day curriculum overview. |
| `/onboarding` | Static | Handles new user onboarding and redirects invalid/missing sessions. |
| `/api/health` | Dynamic | System health check (returns HTTP 200). |

---

## 3. Files Created or Changed

| File | Action | Purpose |
|---|---|---|
| `src/lib/reminders.ts` | Created | Validation helpers for 24h time (`HH:mm`), IANA timezone detection & UTC fallback, next incomplete lesson resolver, and preview cookie management. |
| `src/app/reminders/actions.ts` | Created | Server Actions for saving reminder preferences (`saveReminderPreferenceAction`) and managing simulation mode (`activateDemoReturnPreviewAction`, `exitDemoReturnPreviewAction`). |
| `src/components/reminders/ReminderForm.tsx` | Created | Accessible React component utilizing `useSyncExternalStore` for timezone detection and `useTransition` for zero-flicker preference saving. |
| `src/components/reminders/DemoReturnControls.tsx` | Created | Simulation trigger card on `/learn/complete` and simulation banner with exit button on `/home`. |
| `src/app/home/page.tsx` | Created | Returning-learner experience route with next incomplete lesson card, progress bar, reminder status, and plan links. |
| `src/app/learn/page.tsx` | Created | Route redirecting `/learn` traffic to `/home`. |
| `src/app/learn/complete/page.tsx` | Modified | Integrated reminder settings form, return preview card, and dashboard navigation. |
| `src/app/learn/today/page.tsx` | Modified | Integrated `getNextIncompleteLesson` to serve subsequent lessons dynamically. |
| `tests/reminders.test.ts` | Created | Automated unit and integration tests covering time format validation, timezone normalization, SQLite upsert, next incomplete lesson resolution, and cookie isolation. |
| `tests/stage6-manual-verification.ts` | Created | 11-step end-to-end integration and HTTP verification script. |
| `docs/stage-6-reminder-report.md` | Created | This stage report. |

---

## 4. Data Model & Schema Implementation

The existing `ReminderPreference` model in `prisma/schema.prisma` was utilized without requiring any schema migrations:

```prisma
model ReminderPreference {
  id           String   @id @default(uuid())
  userId       String   @unique
  enabled      Boolean  @default(true)
  reminderTime String   // e.g. "08:00"
  timezone     String   // e.g. "Asia/Kolkata"
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

- **One-to-One User Relationship:** Enforced by `@unique` on `userId`.
- **Atomic Upsert:** Updates or inserts preferences idempotently using Prisma's `upsert` API.
- **Bi-directional Sync:** Also updates `UserPreference.reminderTime` and `UserPreference.timezone` to keep user preferences consistent.

---

## 5. Timezone & Validation Rules

- **Reminder Time Format:** Enforced by regular expression `/^([01]\d|2[0-3]):([0-5]\d)$/`.
  - Rejects: single-digit hours (`8:00`), 24+ hours (`24:00`, `25:00`), out-of-range minutes (`08:60`), negative values, and non-time strings.
- **Timezone Validation:** Evaluated via `Intl.DateTimeFormat(undefined, { timeZone: tz })`.
  - Valid IANA zones (`Asia/Kolkata`, `America/New_York`, `UTC`, `Europe/London`) are preserved.
  - Invalid, unlisted, or empty zones safely normalize to `"UTC"`.

---

## 6. Analytics & Event Isolation

The prototype adheres to strict event tracking rules:
- `reminder_preference_saved`: Logged with `{ enabled, reminderTime, timezone }` upon configuration change.
- `reminder_enabled` / `reminder_disabled`: Granular toggle state event.
- `return_home_viewed`: Logged when a returning user navigates to `/home` under standard browsing.
- `demo_return_previewed`: Logged when the simulated preview is activated and viewed.
- **Rule Verification:** The verification test explicitly asserts that `session_returned_d1` has a count of **0** during simulation to prevent skewing genuine retention cohort data.

---

## 7. Verification & Quality Assurance

### Automated Unit & Integration Tests (`pnpm test`):
- **Stage 6 Suite (`tests/reminders.test.ts`):** 8 test cases covering validation, timezone fallback, database upsert, lesson progression, and simulation isolation.
- **Stage 5 Suite (`tests/lesson-reader.test.ts`):** 7 test cases covering lesson parsing and progress idempotency.
- **Stage 4 Suite (`tests/onboarding.test.ts`):** 10 test cases covering onboarding allowlists, path matching, and JSON serialization.
- **Total:** **25 / 25 tests passing (100%)**.

### End-to-End Integration Verification (`tests/stage6-manual-verification.ts`):
All 11 verification points passed over HTTP against the running Next.js application:
1. `/home` without cookie redirected to `/onboarding` (307).
2. `/learn` redirected to `/home` (307).
3. Reminder preferences successfully upserted into SQLite (`08:30`, `Asia/Kolkata`).
4. Day 1 lesson completed for test user.
5. `/learn/complete` rendered celebration, Day 2 preview, reminder form, and simulation card (200).
6. Next incomplete lesson accurately selected Day 2 (*"Reading an AI Product Brief"*).
7. `/home` rendered welcome greeting, path progress (1 of 5 / 20%), up next Day 2 session button, and reminder status (200).
8. `/home` with `unrot_demo_return_preview=1` rendered demo banner and exit button (200).
9. Analytics integrity verified: zero `session_returned_d1` events logged during simulation.
10. `/learn/today` automatically served Day 2 for returning learner (200).
11. Test data cleanly removed.

### Backward Compatibility Verification (`tests/stage5-manual-verification.ts`):
- All 17 verification points in the Stage 5 verification script continue to pass with zero regressions.

### Code Quality & Build Verification:
- **ESLint (`pnpm lint`):** 0 errors, 0 warnings.
- **Production Build (`pnpm build`):** Optimized and compiled all routes successfully in Turbopack.

---

## 8. Commands Run

```bash
pnpm test
pnpm lint
pnpm build
pnpm dev
npx tsx tests/stage6-manual-verification.ts
npx tsx tests/stage5-manual-verification.ts
```

---

## 9. Next-Stage Recommendation

Proceed to Stage 7: analytics instrumentation, retention cohort metrics dashboard, and prototype evaluation summary.
