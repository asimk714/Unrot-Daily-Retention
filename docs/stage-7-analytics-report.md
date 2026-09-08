# Stage 7 — Analytics Instrumentation & Retention Dashboard Report

**Date:** 2026-09-08 20:42 IST  
**Project Path:** `C:\Users\asimk\Documents\unrot-daily-retention-prototype`

---

## 1. Product Measurement & D1 Definition

Stage 7 implements rigorous, server-side analytics instrumentation and retention reporting adhering to the assignment's exact D1 measurement standard:

- **D1 Retention Definition:** The percentage of new users who return on the calendar day after their first session.
- **New-User Cohort:** Users who record a `first_session_started` event.
- **First Session (Day 0):** The earliest `first_session_started` event recorded for a user.
- **D1 Return:** The same user logs at least one qualifying engagement event on the next calendar day ($D_0 + 1$).
- **Qualifying Return Events:** Real user engagement actions including `return_home_viewed`, `lesson_viewed`, `lesson_started`, `plan_viewed`, `next_lesson_started`, and `session_returned_d1`.
- **Excluded Events:** `demo_return_previewed` and any simulated preview actions are strictly excluded from retention calculations.
- **Calendar-Day Accounting:** Evaluated by calendar dates (`YYYY-MM-DD`), never elapsed rolling 24-hour windows.
- **Timezone Policy:** Derived from the user's stored reminder preference (`ReminderPreference.timezone` or `UserPreference.timezone`). If invalid or unspecified, safely normalizes to `"UTC"`.
- **Cohort Completeness:** A cohort on date $D_0$ is marked `incomplete` until date $D_0 + 2$, ensuring the full 24-hour Day 1 return window has concluded before calculating the official D1 rate.
- **Single Count Per User:** Distinct users are counted at most once per cohort.

---

## 2. Event Taxonomy

| Category | Event Name | Trigger Point |
|---|---|---|
| **Acquisition & Onboarding** | `landing_viewed` | Visitor opens home landing page (`/`). |
| | `onboarding_started` | Visitor begins onboarding questionnaire (`/onboarding`). |
| | `role_selected` | User selects professional role. |
| | `goal_selected` | User selects learning goal. |
| | `experience_level_selected` | User selects experience level. |
| | `onboarding_completed` | User finishes onboarding form submission. |
| | `plan_created` | Personalized 5-day path assigned. |
| | `plan_viewed` | User navigates to `/plan`. |
| **Lesson** | `lesson_viewed` | User opens lesson reader (`/learn/today`). |
| | `lesson_started` | User initiates reading session. |
| | `lesson_section_viewed` | Section cards viewed in reader. |
| | `quiz_started` | User navigates to knowledge check. |
| | `quiz_answered` | Option selected and checked. |
| | `quiz_completed` | Knowledge check finished with score. |
| | `lesson_completed` | User completes entire lesson. |
| **Reminder** | `reminder_settings_viewed` | User views reminder card on `/learn/complete`. |
| | `reminder_preference_saved` | User updates reminder time or toggle. |
| | `reminder_enabled` | Reminder active state toggled on. |
| | `reminder_disabled` | Reminder active state toggled off. |
| **Return** | `first_session_started` | Earliest session started; **idempotent server-side record**. |
| | `return_home_viewed` | Returning learner views `/home` in normal mode. |
| | `next_lesson_started` | User starts Day 2+ lesson. |
| | `session_returned_d1` | Genuine calendar-day return marker. |
| **Demo Simulation** | `demo_return_previewed` | Prototype next-day simulation previewed (isolated from D1). |

---

## 3. Architecture & Implementation

### 3.1 Analytics Helper (`src/lib/analytics.ts`)
- **Server-Side Only:** Non-blocking asynchronous database inserts into `AnalyticsEvent`.
- **Sanitized Serialization:** Encodes properties with `JSON.stringify()`; scrubs tokens, passwords, database URLs, and cookie secrets.
- **Typed Event Constants:** Defined via `EVENT_NAMES` enum for type-safe event logging.
- **Idempotent First Session:** `recordFirstSessionStarted()` queries existing events before creation; subsequent invocations return `false` without creating duplicate rows.

### 3.2 Pure Retention Calculation Utility (`src/lib/retention.ts`)
- **Database-Independent:** Pure TypeScript utility operating on raw or normalized event arrays.
- **Timezone-Aware Date Conversion:** Uses `Intl.DateTimeFormat` with `"en-CA"` format to generate `YYYY-MM-DD` strings in the user's specific IANA timezone with safe UTC fallback.
- **Cohort Grouping & D1 Calculation:**
  - `getFirstSessionByUser()`: Identifies earliest start date per user.
  - `getCohortRows()`: Groups users by cohort calendar date, assesses Day 1 returns, and assigns `complete` vs `incomplete` status.
  - `calculateD1Retention()`: Calculates official rate across completed cohorts only; returns `hasEnoughData: false` when no complete cohorts exist.
  - `calculateRetentionFunnel()`: Aggregates distinct users through all 8 funnel stages.
  - `getEventAudit()`: Summarizes distinct user counts, total volumes, and earliest/latest timestamps per event.

### 3.3 Analytics Dashboard Route (`/analytics`)
- **Server-Rendered Page:** Loads and processes SQLite event data on request.
- **Visual Structure:**
  1. **Header:** Title and disclaimer: *"Prototype analytics—not live Unrot production data"*.
  2. **Context Labels:** Clearly marks *"Assignment baseline: 16%"* and *"Target benchmark: 22%"* as assignment-provided reference context, not prototype-measured outcomes.
  3. **7 Core KPI Cards:** New users, Onboarding completion rate, First lesson completion rate, Reminder opt-in rate, Eligible D1 cohort size, D1 retained users, and Official D1 retention rate.
  4. **8-Step Funnel:** New users $\to$ Onboarding completed $\to$ Plan viewed $\to$ First lesson started $\to$ First lesson completed $\to$ Tomorrow preview viewed $\to$ Reminder enabled $\to$ Real D1 return.
  5. **Daily Cohort Table:** Complete vs. incomplete status badges, eligible users, D1 retained count, and D1 percentage.
  6. **Illustrative Example Section:** Completely separated and labeled *"Illustrative Example Only"* to demonstrate synthetic multi-day cohort progression without polluting actual local data.
  7. **Event Taxonomy Audit Table:** Live audit showing distinct users, total events, earliest timestamp, and latest timestamp.
  8. **Measurement Methodology & Definitions Panel:** Explains exact D1 definition, start event, return events, demo exclusions, and timezone policy.

---

## 4. Verification & Quality Assurance

### 4.1 Automated Unit & Integration Tests (`pnpm test`)
- **Stage 7 Retention Suite (`tests/retention.test.ts`):** 10 test cases covering:
  - Calendar date & timezone conversion (Asia/Kolkata, America/New_York, UTC fallback).
  - First-session idempotency in SQLite.
  - Test fixture covering all 6 required personas:
    1. Retained user (Day 0 $\to$ Day 1 return: retained ✓).
    2. Non-retained user (Day 0 $\to$ no return: not retained ✓).
    3. Same-day repeat user (Day 0 morning $\to$ Day 0 afternoon: not D1 ✓).
    4. Two-days-later user (Day 0 $\to$ Day 2: not D1 ✓).
    5. Demo-simulation-only user (`demo_return_previewed`: excluded ✓).
    6. Timezone boundary user (evaluated in Asia/Kolkata: retained ✓).
  - Incomplete future cohort exclusion.
  - Empty analytics dataset handling (zero division safety).
  - Funnel and Event Audit distinct user aggregations.
- **Total Test Suite:** **35 / 35 tests passing (100%)** across all stages.

### 4.2 Integration Verification Script (`tests/stage7-manual-verification.ts`)
- `/analytics` returns HTTP 200.
- Disclaimer and baseline (16%) / target benchmark (22%) context labels verified.
- All 7 KPI cards verified.
- All 8 funnel steps verified.
- Cohort table and illustrative section separation verified.
- Event audit and methodology panel verified.
- `first_session_started` idempotency verified in database.
- Demo preview simulation exclusion verified.

### 4.3 Backwards Compatibility
- `tests/stage6-manual-verification.ts`: All 11 verification points passing.
- `tests/stage5-manual-verification.ts`: All 17 verification points passing.

### 4.4 Code Quality & Compilation
- **ESLint (`pnpm lint`):** 0 errors, 0 warnings.
- **Turbopack Production Build (`pnpm build`):** All 10 routes compiled and optimized successfully.

---

## 5. Commands Run

```bash
pnpm test
pnpm lint
pnpm build
pnpm dev
npx tsx tests/stage7-manual-verification.ts
npx tsx tests/stage6-manual-verification.ts
npx tsx tests/stage5-manual-verification.ts
```

---

## 6. Known Limitations

- Real email and push delivery systems are not integrated; reminder preferences are stored locally to evaluate habit intent.
- Local SQLite database only contains local development sessions; closed multi-day cohorts require authentic multi-day elapsed time or synthetic test fixtures.
- User timezone is inferred from reminder preferences; if never set, UTC is used as the default.
