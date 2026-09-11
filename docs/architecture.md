# Technical Architecture & System Design

**Project:** Unrot Daily Retention Prototype  
**Date:** 2026-09-08  
**Architecture Style:** Next.js 16 App Router + PostgreSQL with Prisma 7 Driver Adapter

---

## 1. System Overview & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                              BROWSER / CLIENT                          │
│                                                                        │
│   Landing (/)         Onboarding (/onboarding)     Lesson (/learn/today) │
│   Plan (/plan)        Dashboard (/home)            Complete (/learn/...)│
│                       Analytics (/analytics)                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / Server Actions
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS SERVER RUNTIME                          │
│                                                                        │
│   ┌─────────────────────┐   ┌───────────────────┐   ┌───────────────┐  │
│   │ App Router Pages    │   │ Server Actions    │   │ API Routes    │  │
│   │ (Server Components) │   │ (learn, onboard,  │   │ (/api/health) │  │
│   │                     │   │  reminders)       │   │               │  │
│   └──────────┬──────────┘   └─────────┬─────────┘   └───────┬───────┘  │
│              │                        │                     │          │
│              ▼                        ▼                     │          │
│   ┌─────────────────────────────────────────────────────────▼──────┐  │
│   │                     DOMAIN & BUSINESS LOGIC                     │  │
│   │                                                                 │  │
│   │   • Learning Path Matcher (learning-path.ts)                    │  │
│   │   • Lesson Content Parser & Zod Validator (lesson-content.ts)  │  │
│   │   • Reminder & Incomplete Lesson Selector (reminders.ts)        │  │
│   │   • Pure D1 Retention & Funnel Calculator (retention.ts)        │  │
│   │   • Server Analytics Logger (analytics.ts)                      │  │
│   └───────────────────────────────────┬─────────────────────────────┘  │
│                                       │                                │
│                                       ▼                                │
│   ┌────────────────────────────────────────────────────────────────┐  │
│   │                     PRISMA ORM (7.10.0)                        │  │
│   │   • @prisma/adapter-pg (PostgreSQL driver adapter)              │  │
│   │   • pg Pool (max: 10 connections, SSL in production)            │  │
│   └───────────────────────────────────┬────────────────────────────┘  │
└───────────────────────────────────────┼────────────────────────────────┘
                                        │
                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        STORAGE / PERSISTENCE                           │
│   Managed PostgreSQL (Neon or equivalent)                              │
│   Schema: 7 models — User, Session, UserPreference, LearningPath,      │
│           Lesson, LessonProgress, ReminderPreference, AnalyticsEvent    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Server vs. Client Boundary

Unrot Daily adheres to strict server-first rendering principles:

- **Server Components (Default):**
  - All page entries (`/`, `/plan`, `/home`, `/learn/today`, `/learn/complete`, `/analytics`) are React Server Components.
  - Directly access database records via `prisma` on the server without exposing database credentials or clients to the browser bundle.
  - Read and mutate cookies via `next/headers`.

- **Client Components (`"use client"`):**
  - Restricted strictly to interactive stateful subtrees:
    - `OnboardingForm.tsx`: Multi-step form step management and optimistic transition states.
    - `LessonReader.tsx`: Local section pagination, reading progress bar, quiz selection, and immediate feedback.
    - `ReminderForm.tsx`: Browser timezone auto-detection (`useSyncExternalStore`), time picker, and inline status banners.
    - `DemoReturnControls.tsx`: Demo return preview buttons and exit control.

- **Server Actions:**
  - Placed in dedicated action files (`src/app/actions/onboarding.ts`, `src/app/learn/actions.ts`, `src/app/reminders/actions.ts`).
  - Marked with `"use server"` to enforce server execution, input validation via Zod, atomic database writes, and path revalidation.

---

## 3. Data Models & Relational Schema

Configured in `prisma/schema.prisma` with 7 relational models:

```prisma
model User {
  id         String              @id @default(uuid())
  email      String              @unique
  name       String?
  createdAt  DateTime            @default(now())
  updatedAt  DateTime            @updatedAt
  preference UserPreference?
  progress   LessonProgress[]
  reminder   ReminderPreference?
  events     AnalyticsEvent[]
  sessions   Session[]
}

model Session {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
  @@index([token])
}

model UserPreference {
  id              String   @id @default(uuid())
  userId          String   @unique
  role            String   // "product-manager", "software-engineer", "general"
  learningGoal    String   // "staying-current", "interview-prep", "upskilling"
  experienceLevel String   // "beginner", "intermediate", "advanced"
  reminderTime    String?  // "HH:mm" (e.g. "08:30")
  timezone        String?  // IANA time zone (e.g. "Asia/Kolkata")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model LearningPath {
  id          String   @id @default(uuid())
  title       String
  description String
  role        String
  goal        String
  createdAt   DateTime @default(now())
  lessons     Lesson[]
  @@index([role, goal])
}

model Lesson {
  id              String           @id @default(uuid())
  learningPathId  String
  dayNumber       Int
  title           String
  summary         String
  durationMinutes Int              @default(5)
  contentJson     String           // Structured JSON sections, examples, quiz
  createdAt       DateTime         @default(now())
  learningPath    LearningPath     @relation(fields: [learningPathId], references: [id], onDelete: Cascade)
  progress        LessonProgress[]
  @@unique([learningPathId, dayNumber])
}

model LessonProgress {
  id          String    @id @default(uuid())
  userId      String
  lessonId    String
  startedAt   DateTime?
  completedAt DateTime?
  quizScore   Float?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson      Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  @@unique([userId, lessonId])
  @@index([userId])
  @@index([lessonId])
}

model ReminderPreference {
  id           String   @id @default(uuid())
  userId       String   @unique
  enabled      Boolean  @default(true)
  reminderTime String   // "HH:mm"
  timezone     String   // "Asia/Kolkata"
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model AnalyticsEvent {
  id             String   @id @default(uuid())
  userId         String?
  eventName      String
  propertiesJson String   @default("{}")
  occurredAt     DateTime @default(now())
  sessionId      String?
  route          String?
  user           User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  @@index([eventName])
  @@index([occurredAt])
  @@index([userId])
}
```

---

## 4. Analytics & Retention Calculation Engine

### 4.1 Telemetry Recording

- Non-blocking server logging implemented in `src/lib/analytics.ts`.
- Captures sanitized JSON properties (route, duration, options selected) without logging tokens, passwords, or cookies.
- Idempotent `first_session_started` anchors each learner's Day 0 acquisition.

### 4.2 D1 Retention Calculator (`src/lib/retention.ts`)

- Pure TypeScript implementation decoupled from database query syntax.
- Uses `Intl.DateTimeFormat` with `"en-CA"` to evaluate calendar dates (`YYYY-MM-DD`) in the user's configured IANA timezone with safe fallback to `UTC`.
- Excludes `demo_return_previewed`.
- Implements cohort completeness rule: cohorts on date $D$ remain marked `incomplete` until date $D + 2$ has closed, preventing in-progress cohorts from distorting official D1 retention.

---

## 5. Database Configuration

### 5.1 Prisma Schema

The datasource is configured for PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
}
```

### 5.2 Driver Adapter

The Prisma client uses the PostgreSQL adapter:

```typescript
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

### 5.3 Connection Pooling

- `pg` Pool with `max: 10` connections.
- SSL enabled in production (`NODE_ENV === "production"` or `sslmode=require` in connection string).
- Global singleton pattern prevents connection exhaustion during development hot-module reloading.

### 5.4 Serverless Compatibility

The connection pool configuration is compatible with serverless deployments (Vercel) when used with a connection-pooler-enabled PostgreSQL provider such as Neon. The `max: 10` limit and SSL configuration match serverless connection patterns.

---

## 6. Migrations

Two PostgreSQL migrations exist in `prisma/migrations/`:

| Migration | Description |
|---|---|
| `20260909000000_init_postgresql` | Initial schema: all 7 models |
| `20260909100000_add_auth_sessions` | Adds Session model for authenticated user sessions |

Migration lock file confirms PostgreSQL provider:

```toml
# prisma/migrations/migration_lock.toml
provider = "postgresql"
```

---

## 7. Deployment Architecture

### 7.1 Hosting

- **Platform:** Vercel (Next.js auto-detection)
- **Database:** Managed PostgreSQL (Neon free tier or equivalent)

### 7.2 Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_APP_URL` | Public application URL | Yes (production) |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | Analytics recording toggle | Yes |
| `DEMO_MODE` | Demo return preview toggle | Yes |
| `NODE_ENV` | Set to `"production"` on Vercel | Auto-set by Vercel |

### 7.3 Build Command

```
prisma generate && next build
```

### 7.4 Deployment Steps

1. Connect repository to Vercel
2. Configure `DATABASE_URL` as a production environment variable (do not commit)
3. Configure `NEXT_PUBLIC_APP_URL` to the production Vercel URL
4. Deploy — Vercel auto-detects the Next.js configuration
5. Run `npx prisma migrate deploy` against the production database
6. Run `npx tsx prisma/seed.ts` to populate learning paths

---

## 8. Environment Variables Reference

See `.env.example` for the connection string format. Do not commit real credentials.

```bash
# PostgreSQL connection string (required)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Public URL (client-side links)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Analytics toggle
NEXT_PUBLIC_ANALYTICS_ENABLED="false"

# Demo mode
DEMO_MODE="true"
```
