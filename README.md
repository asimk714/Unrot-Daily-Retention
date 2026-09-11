# Unrot Daily — Retention Prototype

A lightweight daily micro-learning web application built to validate the Day 1 (D1) habit retention loop for knowledge workers.

---

## 1. Product Purpose & Problem

Professionals frequently study complex topics (such as Applied AI) but forget key concepts within days due to the lack of immediate reinforcement. **Unrot Daily** delivers bite-sized, 5-minute daily review sessions tailored to the learner's professional role and goal, reinforcing retention before memory decays.

---

## 2. The D1 Retention Hypothesis

> **Hypothesis:** Providing newly acquired learners with a **personalized 5-day curriculum path**, an **explicit preview of tomorrow's lesson topic upon Day 0 completion**, and an **optional daily morning reminder commitment** will significantly increase calendar-day D1 retention from the **16% assignment baseline** toward the **22% target benchmark** without increasing Day 0 drop-off.

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.3.4 (App Router with Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Database & ORM** | PostgreSQL (`@prisma/adapter-pg` + `pg`) + Prisma 7.10.0 |
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
| `/learn/complete` | Dynamic (Server) | Session celebration, tomorrow's lesson preview, accessible reminder form, and demo return simulation trigger. |
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

# 4. Configure DATABASE_URL to point to your PostgreSQL database
#    See .env.example for the connection string format

# 5. Run migrations and seed the database
npx prisma migrate deploy
pnpm db:seed

# 6. Generate the Prisma client and start the development server
pnpm db:generate
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
| `pnpm db:seed` | Seeds the 3 learning paths and 15 lessons into PostgreSQL |
| `npx tsx tests/stage8-audit.ts` | Runs the full 15-step end-to-end quality audit |

---

## 7. D1 Retention Measurement Standard

The prototype implements the assignment's exact D1 measurement rules:
- **Calendar-Day Definition:** D1 retention is the percentage of new users who return on the calendar day after their first session ($D_0 + 1$).
- **Start Event:** The earliest server-recorded `first_session_started` event per user (recorded idempotently upon onboarding completion).
- **Qualifying Return Events:** `return_home_viewed`, `lesson_viewed`, `lesson_started`, `plan_viewed`, `next_lesson_started`, and `session_returned_d1`.
- **Excluded Demo Events:** `demo_return_previewed` and demo simulation activities are strictly excluded from D1 calculation.
- **Timezone Awareness:** Evaluated in the learner's configured reminder timezone (`ReminderPreference.timezone`) with safe UTC fallback.
- **Incomplete Cohort Policy:** Cohorts on date $D$ remain marked `incomplete` until date $D + 2$ has closed, preventing incomplete cohorts from diluting official D1 retention.

---

## 8. Deployment

The application is designed for deployment on Vercel with a managed PostgreSQL database (e.g. Neon).

**Deployment prerequisites:**
- A PostgreSQL database (Neon free tier or equivalent)
- `DATABASE_URL` environment variable configured in the deployment platform
- `NEXT_PUBLIC_APP_URL` set to the production Vercel URL

**Deployment steps:**
1. Connect the repository to Vercel
2. Add `DATABASE_URL` as a production environment variable in Vercel
3. Add `NEXT_PUBLIC_APP_URL` set to the production URL
4. Deploy — Vercel auto-detects the Next.js build configuration
5. Run `npx prisma migrate deploy` against the production database (or configure
   the build command to include migration deployment)
6. Run `pnpm db:seed` against the production database to populate learning paths

**Environment variables:**
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (required; do not commit) |
| `NEXT_PUBLIC_APP_URL` | Public application URL for client-side links |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | Toggle analytics event recording (`"true"` / `"false"`) |
| `DEMO_MODE` | Enable/disable demo return preview (`"true"` / `"false"`) |
| `NODE_ENV` | Set to `"production"` on Vercel (controls SSL and logging) |

**Connection pooling:** The application uses a `pg` Pool with `max: 10` connections
and SSL enabled in production. This is compatible with serverless deployments on
Vercel when used with a connection-pooler-enabled PostgreSQL provider such as Neon.

---

## 9. Documentation Directory (`docs/`)

- [`docs/final-qa-report.md`](docs/final-qa-report.md): Complete functional, responsive, accessibility, and metric audit results.
- [`docs/demo-script.md`](docs/demo-script.md): 3-minute live walkthrough script covering exact click paths, speaking points, and hypothesis validation.
- [`docs/submission-checklist.md`](docs/submission-checklist.md): Comprehensive readiness checklist for repository, tests, builds, and submission artifacts.
- [`docs/architecture.md`](docs/architecture.md): System architecture, server/client boundaries, Prisma PostgreSQL configuration, and deployment design.
- [`docs/known-limitations.md`](docs/known-limitations.md): Documented prototype boundaries (PostgreSQL, demo auth, simulated notifications).
- [`docs/experiment-plan.md`](docs/experiment-plan.md): Rigorous A/B experiment design (hypotheses, sample size power analysis, guardrails, decision rules).
- Stage Reports: `docs/stage-1-initialization-report.md` through `docs/stage-7-analytics-report.md`.

---

## 10. Limitations

This is a **prototype**, not a production application with real users.

- No real user population exists yet.
- No real D1 retention outcome has been measured.
- No acquisition or GTM evidence exists yet.
- No scale or growth evidence exists yet.
- Analytics events are recorded only when the deployed application is used —
  there are no pre-populated fake cohorts or fabricated retention results.

---

## 11. License

Private prototype for evaluation and submission.
