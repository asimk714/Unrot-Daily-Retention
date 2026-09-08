# GitHub & Vercel Hosting Report: Unrot Daily

**Project:** Unrot Daily Retention Prototype  
**Date:** September 9, 2026  
**Repository:** https://github.com/asimk714/Unrot-Daily-Retention.git  
**Framework:** Next.js 16.3.4 (App Router, Turbopack)  
**Database Provider:** Neon Serverless PostgreSQL  
**Prisma Version:** 7.10.0 with `@prisma/adapter-pg` and `pg.Pool`  

---

## 1. Hosting Architecture & Service Mapping

- **Code Storage & Version Control:** GitHub (`asimk714/Unrot-Daily-Retention`, branch `main`).
- **Application Hosting & Serverless Compute:** Vercel (Next.js App Router runtime).
- **Persistent Database:** Neon PostgreSQL serverless database with connection pooling.
- **Client Architecture:** Dynamic server-rendered routes (`export const dynamic = "force-dynamic"`) connecting to Neon via `@prisma/adapter-pg`.

---

## 2. Database Migration & Persistence Verification

- **Datasource Migration:** Migrated from local SQLite to PostgreSQL in `prisma/schema.prisma`.
- **Driver Adapter:** Replaced `@prisma/adapter-better-sqlite3` with `@prisma/adapter-pg` using a pooled connection (`pg.Pool`).
- **Schema & Migration:** Created and verified initial PostgreSQL migration in `prisma/migrations/20260909000000_init_postgresql/migration.sql`.
- **Local SQLite State:** `dev.db` was preserved, and historical SQLite migration was safely archived to `prisma/migrations_sqlite_archive/`.
- **Persistence Verification:** Verified against an isolated Neon test branch:
  - 35/35 automated unit and integration tests passing.
  - Idempotent user preferences, reminder upserts, lesson progress, and analytics events verified against PostgreSQL.
  - No database mutations reset or lost.

---

## 3. Verified Route Coverage

All core user flows and API routes were verified:
- `/`: Landing page with dynamic session resolution and event logging.
- `/onboarding`: 4-step interactive goal and role calibration wizard.
- `/plan`: Tailored 5-day curriculum path overview.
- `/learn/today`: 5-minute interactive lesson reader with practical example and mastery check.
- `/learn/complete`: Lesson celebration, tomorrow's preview card, and daily reminder preferences.
- `/home`: Returning-learner dashboard with curriculum progress bar and 1-click Day 2 launch.
- `/analytics`: Retention analytics dashboard computing calendar-day D1 retention, funnel metrics, and cohort tables.
- `/api/health`: Healthcheck endpoint returning HTTP 200 OK (`{"status":"ok","service":"unrot-daily"}`).

---

## 4. Design System & Viewport Testing

- **Dual-Theme Parity:** Tested Light mode and Dark mode across all routes with central CSS semantic tokens.
- **Zero Flash of Unstyled Theme (FOUT):** Verified synchronous theme restoration script.
- **Mobile Viewport:** Responsive single-column layouts verified across standard mobile and desktop widths.
- **Accessibility:** Keyboard navigation and ARIA polite validation alerts verified on interactive quiz elements.

---

## 5. Known Limitations

- **Authentication:** Relies on an HTTP-only demo session cookie (`unrot_demo_user_id`). Future work will integrate OAuth or magic-link authentication.
- **Notification Delivery:** Reminder times and timezones are persisted in the database; actual scheduled email (Resend) or web push dispatch is planned for Phase 2.
- **Analytics Ingestion:** Analytics events are captured in the Neon PostgreSQL database; third-party BI pipelines (PostHog/Mixpanel) are planned for production rollout.

---

## 6. Rollback Instructions

If a deployment rollback is required:
1. **In Vercel Dashboard:** Navigate to **Deployments**, locate the last known healthy deployment, and click **Promote to Production**.
2. **In Git:**
   ```bash
   git revert HEAD
   git push origin main
   ```

---

## 7. Security & Secrets Confirmation

- `.env` and `.env.test` are **strictly ignored** via `.gitignore` and have never been committed.
- `DATABASE_URL` is kept strictly server-side and is never exposed to client bundles or logged in telemetry.
- Zero passwords, tokens, cookies, or private keys exist in the Git repository history.
