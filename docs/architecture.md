# Technical Architecture & System Design

**Project:** Unrot Daily Retention Prototype  
**Date:** 2026-09-08  
**Architecture Style:** Next.js 16 App Router + Local SQLite with Driver Adapter

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
│   │   • @prisma/adapter-better-sqlite3 (timeout: 10000ms)          │  │
│   │   • SQLite Driver: better-sqlite3                              │  │
│   └───────────────────────────────────┬────────────────────────────┘  │
└───────────────────────────────────────┼────────────────────────────────┘
                                        │
                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        STORAGE / PERSISTENCE                           │
│   Local SQLite Database: dev.db (File-based, zero-network overhead)    │
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
}

model UserPreference {
  id              String   @id @default(uuid())
  userId          String   @unique
  role            String   // "product-manager", "software-engineer", "general"
  learningGoal    String   // "staying-current", "interview-prep", "upskilling"
  experienceLevel String   // "beginner", "intermediate", "advanced"
  reminderTime    String?  // "HH:mm" (e.g. "08:30")
  timezone        String?  // IANA time zone (e.g. "Asia/Kolkata")
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model LearningPath {
  id          String   @id @default(uuid())
  title       String
  description String
  role        String
  goal        String
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
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson      Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  @@unique([userId, lessonId])
}

model ReminderPreference {
  id           String   @id @default(uuid())
  userId       String   @unique
  enabled      Boolean  @default(true)
  reminderTime String   // "HH:mm"
  timezone     String   // "Asia/Kolkata"
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

## 5. PostgreSQL Migration Roadmap

When transitioning from the local SQLite prototype to production PostgreSQL:

1. **Schema Provider Update:**
   Change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`.
2. **Type Mapping:**
   Change `contentJson String` and `propertiesJson String` to native PostgreSQL `Json` or `Jsonb`.
3. **Database Driver Adapter:**
   Replace `@prisma/adapter-better-sqlite3` and `better-sqlite3` with `@prisma/adapter-pg` and `pg`.
4. **Environment Variables:**
   Supply a production connection pool URL (`postgresql://user:password@host:port/dbname?pgbouncer=true`).
5. **Data Migration:**
   Generate PostgreSQL migrations with `npx prisma migrate dev --name init_postgres` and execute initial seed via `npx tsx prisma/seed.ts`.
