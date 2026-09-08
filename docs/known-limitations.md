# Known Limitations & Future Work

**Project:** Unrot Daily Retention Prototype  
**Date:** 2026-09-08  
**Scope:** Transparent disclosure of prototype boundaries and engineering tradeoffs.

---

## 1. Authentication & Session Management

- **Current Prototype State:** Uses lightweight, HTTP-only demo session cookies (`unrot_demo_user_id`) generated locally upon onboarding. No passwords, social logins, or multi-factor authentication are configured.
- **Limitation:** Clearing cookies resets learner state. A learner cannot log in from a separate device to resume their 5-day habit streak.
- **Future Production Work:** Integrate standard authentication (Auth.js / NextAuth, Clerk, or Supabase Auth) with email magic links or Google OAuth to bind user IDs to verified identities.

---

## 2. Local Database & File-Based SQLite

- **Current Prototype State:** Built entirely on a local SQLite database (`dev.db`) using Prisma with the `@prisma/adapter-better-sqlite3` driver adapter configured with a 10,000ms busy timeout.
- **Limitation:** SQLite is single-writer and file-based. It cannot run concurrently across distributed multi-region serverless instances (e.g. AWS Lambda / Vercel Edge).
- **Future Production Work:** Migrate to PostgreSQL hosted on Supabase, Neon, or AWS Aurora with connection pooling (`pgbouncer`). See [`docs/architecture.md`](architecture.md) for the migration plan.

---

## 3. Reminder Delivery & Notification Infrastructure

- **Current Prototype State:** Captures preferred 24-hour reminder time (`HH:mm`) and auto-detected device timezone, storing them in `ReminderPreference`. Clearly discloses that no real emails or push notifications are sent.
- **Limitation:** Learners do not receive external nudges; retention depends on organic re-entry or the simulated return preview.
- **Future Production Work:** Implement background worker queues (e.g. Inngest, BullMQ, or AWS SQS) paired with transactional delivery providers:
  - **Email:** Resend, Postmark, or SendGrid scheduled at the learner's preferred local time.
  - **Mobile / Web Push:** Web Push API and Apple/Firebase Push Notification Service.

---

## 4. Analytics & Telemetry Provider

- **Current Prototype State:** Fully self-contained local telemetry table (`AnalyticsEvent`) queried dynamically by `/analytics` to calculate calendar-day D1 retention, cohort rows, and funnel steps.
- **Limitation:** Lacks external BI dashboards, session recordings, or multi-touch attribution.
- **Future Production Work:** Stream events server-side to product analytics platforms (PostHog, Amplitude, or Mixpanel) and data warehouses (Snowflake, BigQuery).

---

## 5. Experimentation & Retention Claims

- **Current Prototype State:** The prototype establishes the instrumentation and infrastructure required to measure D1 retention. It includes an illustrative synthetic cohort table to show target benchmark trajectory.
- **CRITICAL TRANSPARENCY NOTICE:** The prototype **does not claim that retention has improved**, nor does it claim statistical significance. Real D1 retention can only be measured once real users are exposed across multiple calendar days.
- **Future Production Work:** Run the controlled A/B experiment outlined in [`docs/experiment-plan.md`](experiment-plan.md) with ~1,400 randomized learners over a 2-week period.

---

## 6. Content Breadth & Knowledge Checks

- **Current Prototype State:** Database seeded with 3 distinct learning paths (Product Managers, Software Engineers, General Professionals) containing 5 daily lessons each (15 lessons total), each with 1 knowledge check question.
- **Limitation:** Once a learner finishes all 5 days of their matched path, no further lessons exist in that curriculum.
- **Future Production Work:** Expand to 30-day mastery tracks with dynamic question banks and spaced-repetition review intervals (D1, D3, D7, D14, D30).
