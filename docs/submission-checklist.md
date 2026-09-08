# Submission Readiness Checklist

**Date:** 2026-09-08  
**Project Path:** `C:\Users\asimk\Documents\unrot-daily-retention-prototype`  
**Evaluation Scope:** Unrot Daily Retention Prototype (Stages 1 – 8)

---

## 1. Prototype & Application Status

- [x] **Full User Flow Operable:** Landing (`/`) $\to$ Onboarding (`/onboarding`) $\to$ Plan (`/plan`) $\to$ Reader (`/learn/today`) $\to$ Completion (`/learn/complete`) $\to$ Return (`/home`).
- [x] **Returning-Learner Engine:** Automatically selects and renders the next incomplete lesson (Day 2 progression).
- [x] **Daily Reminders Configured:** Time (`HH:mm`) and timezone capture with SQLite upsert persistence.
- [x] **Demo Return Preview Simulation:** Operates cleanly via `unrot_demo_return_preview` cookie without clock tampering.
- [x] **Analytics Dashboard:** Live at `/analytics` with KPIs, 8-step funnel, daily cohort table, and event audit.
- [x] **Health Check Endpoint:** Live at `/api/health` returning HTTP 200 `{ status: "ok" }`.

---

## 2. Code Quality & Test Status

- [x] **Automated Tests:** 35 / 35 tests passing (`pnpm test` across all 4 suites).
- [x] **Linter Clean:** 0 errors, 0 warnings (`pnpm lint`).
- [x] **Production Build Clean:** Next.js 16.3.4 App Router compiled successfully with Turbopack (`pnpm build`).
- [x] **Idempotency Validated:** Repeated lesson starts, quiz answers, completions, and first session records do not duplicate rows.
- [x] **Server-Only Boundaries:** Prisma Client and SQLite connection strictly isolated to server components and actions.

---

## 3. Repository & Hygiene Checks

- [x] **Environment Security:** `.env` and `.env.local` strictly excluded in `.gitignore`. Only safe `.env.example` tracked.
- [x] **Database Isolation:** `dev.db`, `dev.db-journal`, and `*.sqlite` ignored in `.gitignore`.
- [x] **No Secrets Leaked:** Zero hardcoded API keys, passwords, database credentials, or private tokens.
- [x] **Tracked Schemas & Migrations:** `prisma/schema.prisma` and `prisma/migrations/` tracked.
- [x] **Complete README:** Updated with architecture, tech stack, quickstart, route map, and testing commands.

---

## 4. Documentation Status

- [x] [`README.md`](../README.md): Comprehensive project overview and setup instructions.
- [x] [`docs/final-qa-report.md`](final-qa-report.md): 20-point quality audit, responsive tests, and accessibility verification.
- [x] [`docs/demo-script.md`](demo-script.md): 3-minute live demonstration script with spoken script and click paths.
- [x] [`docs/experiment-plan.md`](experiment-plan.md): Rigorous A/B testing design with sample size power analysis and decision rules.
- [x] [`docs/architecture.md`](architecture.md): Full technical architecture, data models, and PostgreSQL migration guide.
- [x] [`docs/known-limitations.md`](known-limitations.md): Explicit disclosure of prototype boundaries and production roadmap.
- [x] [`docs/submission-checklist.md`](submission-checklist.md): This verification checklist.
- [x] Stage Reports: `stage-1-initialization-report.md` through `stage-7-analytics-report.md`.

---

## 5. Artifacts for Final Submission

1. **Source Code Repository:** Complete Next.js application with SQLite database and migration files.
2. **Local Running Instance:** Reproducible locally via `pnpm install && pnpm db:seed && pnpm dev`.
3. **Verification Suites:** Automated test runner (`pnpm test`) and audit runner (`npx tsx tests/stage8-audit.ts`).
4. **Slide Deck / Demo Video Outline:** Guided by `docs/demo-script.md`.
