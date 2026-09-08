# Unrot Daily — Retention Prototype

A lightweight daily micro-learning web application built to validate the Day 1 (D1) habit retention loop for knowledge workers.

---

## 1. Product Purpose & Problem

Professionals frequently study complex topics (such as Applied AI) but forget key concepts within days due to the lack of immediate reinforcement. **Unrot Daily** delivers bite-sized, 5-minute daily review sessions tailored to the learner’s professional role and goal, reinforcing retention before memory decays.

---

## 2. The D1 Retention Hypothesis

> **Hypothesis:** Providing newly acquired learners with a **personalized 5-day curriculum path**, an **explicit preview of tomorrow’s lesson topic upon Day 0 completion**, and an **optional daily morning reminder commitment** will significantly increase calendar-day D1 retention from the **16% assignment baseline** toward the **22% target benchmark** without increasing Day 0 drop-off.

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.3.4 (App Router with Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Database & ORM** | Local SQLite (`better-sqlite3` driver adapter) + Prisma 7.10.0 |
| **Validation** | Zod 4.5.4 + Type-Safe Allowlist Schema |
| **Testing** | Node.js Test Runner + `tsx` (35 unit and integration tests) |
| **Linting** | ESLint 9 + `eslint-config-next` (0 errors, 0 warnings) |
| **Package Manager** | pnpm 11.24.0 |
| **Runtime** | Node.js 26.7.0 |

---

## 4. Application Routes

| Route | Rendering | Purpose |
|---|---|---|
| `/` | Dynamic (Server) | Landing page with product introduction, onboarding entry, and analytics link. Emits `landing_viewed`. |
| `/onboarding` | Static (Client) | 3-step interactive questionnaire capturing role, goal, and experience level. |
| `/plan` | Dynamic (Server) | Personalized 5-day curriculum dashboard matched deterministically to learner inputs. Emits `plan_viewed`. |
| `/learn/today` | Dynamic (Server + Client) | 5-minute interactive lesson reader with section progression and single-question knowledge check. |
| `/learn/complete` | Dynamic (Server) | Session celebration, tomorrow’s lesson preview, accessible reminder form, and demo return simulation trigger. |
| `/home` | Dynamic (Server) | Returning-learner dashboard highlighting the next incomplete lesson (e.g. Day 2), progress count, and reminder status. |
| `/learn` | Static Redirect | Server-side redirect sending learners directly to `/home`. |
| `/analytics` | Dynamic (Server) | Retention analytics dashboard with core KPIs, 8-step retention funnel, daily cohort table, and event taxonomy audit. |
| `/api/health` | Dynamic (Server) | Health-check endpoint returning `{ status: "ok", timestamp: "..." }`. |

---

## 5. Local Setup & Quickstart

```bash
# 1. Clone the repository and navigate to the project directory
cd unrot-daily-retention-prototype

# 2. Install dependencies
pnpm install

# 3. Create a local environment file
cp .env.example .env

# 4. Initialize and seed the local SQLite database
npx prisma generate
pnpm db:seed

# 5. Start the development server
pnpm dev
```

The application will be running at [http://localhost:3000](http://localhost:3000).

---

## 6. Development & Verification Commands

| Command | Description |
|---|---|
| `pnpm dev` | Starts local Next.js development server on port 3000 |
| `pnpm test` | Runs all 35 automated unit and integration tests (`--test-concurrency=1`) |
| `pnpm lint` | Runs ESLint across all TypeScript and React files |
| `pnpm build` | Generates Prisma client and creates an optimized Turbopack production build |
| `pnpm db:seed` | Seeds the 3 learning paths and 15 lessons into local SQLite |
| `npx tsx tests/stage8-audit.ts` | Runs the full 15-step end-to-end quality audit |

---

## 7. D1 Retention Measurement Standard

The prototype implements the assignment's exact D1 measurement rules:
- **Calendar-Day Definition:** D1 retention is the percentage of new users who return on the calendar day after their first session ($D_0 + 1$).
- **Start Event:** The earliest server-recorded `first_session_started` event per user (recorded idempotently upon onboarding completion).
- **Qualifying Return Events:** `return_home_viewed`, `lesson_viewed`, `lesson_started`, `plan_viewed`, `next_lesson_started`, and `session_returned_d1`.
- **Excluded Demo Events:** `demo_return_previewed` and demo simulation activities are strictly excluded from D1 calculation.
- **Timezone Awareness:** Evaluated in the learner’s configured reminder timezone (`ReminderPreference.timezone`) with safe UTC fallback.
- **Incomplete Cohort Policy:** Cohorts on date $D$ remain marked `incomplete` until date $D + 2$ has closed, preventing incomplete cohorts from diluting official D1 retention.

---

## 8. Documentation Directory (`docs/`)

- [`docs/final-qa-report.md`](docs/final-qa-report.md): Complete functional, responsive, accessibility, and metric audit results.
- [`docs/demo-script.md`](docs/demo-script.md): 3-minute live walkthrough script covering exact click paths, speaking points, and hypothesis validation.
- [`docs/submission-checklist.md`](docs/submission-checklist.md): Comprehensive readiness checklist for repository, tests, builds, and submission artifacts.
- [`docs/architecture.md`](docs/architecture.md): System architecture, server/client boundaries, Prisma SQLite configuration, and PostgreSQL migration roadmap.
- [`docs/known-limitations.md`](docs/known-limitations.md): Documented prototype boundaries (local SQLite, demo auth, simulated notifications).
- [`docs/experiment-plan.md`](docs/experiment-plan.md): Rigorous A/B experiment design (hypotheses, sample size power analysis, guardrails, decision rules).
- Stage Reports: `docs/stage-1-initialization-report.md` through `docs/stage-7-analytics-report.md`.

---

## 9. License

Private prototype for evaluation and submission.
