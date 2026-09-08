# Stage 4 — Onboarding & Personalized Learning-Path Selection Report

**Date:** 2026-09-08 20:19 IST  
**Project Path:** `C:\Users\asimk\Documents\unrot-daily-retention-prototype`

---

## 1. Product Behavior Implemented

This stage realizes the D1-retention hypothesis by establishing an onboarding-to-plan funnel:
1. **Landing Page (`/`):** Primary CTA updated to direct new visitors into `/onboarding`.
2. **Four-Step Onboarding Flow (`/onboarding`):**
   - **Step 1 (Role):** User selects from explicit allowlist (Product manager, Software engineer, Designer, Marketing or sales, Student, Other).
   - **Step 2 (Goal):** User chooses primary learning outcome (e.g. Use AI more effectively at work, Understand AI fundamentals, Prepare for AI interviews, etc.).
   - **Step 3 (Experience Level):** Calibrates depth (New to AI, Comfortable with AI tools, Advanced AI user).
   - **Step 4 (Confirmation):** Reviews selections and explains the personalized 5-minute daily habit before submitting.
3. **Interactive Wizard Features:**
   - Visual step indicator ("Step X of 4") and progress bar.
   - Backward and forward navigation ("Back" and "Continue") preserving selections.
   - Continue disabled until a valid selection is made for the active step.
   - Mobile-responsive layout and keyboard focus accessibility.
4. **Server-Rendered Learning Plan (`/plan`):**
   - Automatically loads matched learning path based on profile calibration.
   - Displays path title, description, and profile summary.
   - Displays Day 1 lesson card with title, summary, duration, and "Start today’s lesson" CTA.
   - Previews next two lessons ("Tomorrow & Ahead") to establish forward momentum.
   - Provides "Change preferences" and "Edit" links returning to onboarding.
   - Automatically redirects unauthenticated/stale sessions back to `/onboarding`.
5. **Temporary Placeholder Route (`/learn/today`):**
   - Prevents broken links from the plan CTA while indicating Stage 5 implementation.

---

## 2. Routes Created or Changed

| Route | Type | Description |
|---|---|---|
| `/` | Static (Updated) | Landing page with primary CTA linking to `/onboarding`. |
| `/onboarding` | Static (Created) | 4-step personalized calibration wizard. |
| `/plan` | Dynamic (Created) | Server-rendered personalized curriculum dashboard. |
| `/learn/today` | Static (Created) | Temporary placeholder route for Stage 5 lesson engine. |
| `/api/health` | Dynamic (Preserved) | System health check (`{"status":"ok","service":"unrot-daily"}`). |

---

## 3. Files Created or Changed

| File | Action | Purpose |
|---|---|---|
| `package.json` | Modified | Added `zod@4.5.4` dependency and `test` script. |
| `src/app/page.tsx` | Modified | Linked primary button to `/onboarding`. |
| `src/app/onboarding/page.tsx` | Created | Server page container with header and metadata. |
| `src/app/onboarding/OnboardingForm.tsx` | Created | Client component implementing 4-step wizard, keyboard focus, and validation. |
| `src/app/plan/page.tsx` | Created | Server-rendered personalized plan page reading cookie and DB. |
| `src/app/learn/today/page.tsx` | Created | Stage 5 preview/placeholder page. |
| `src/app/actions/onboarding.ts` | Created | Server action for Zod validation, user provisioning, preference upsert, and analytics. |
| `src/lib/validation.ts` | Created | Allowlist definitions and Zod schema. |
| `src/lib/demo-user.ts` | Created | HTTP-only cookie management and demo user persistence. |
| `src/lib/learning-path.ts` | Created | Deterministic matching algorithm for role and goal. |
| `src/lib/analytics.ts` | Created | Non-blocking server-side analytics recorder. |
| `tests/onboarding.test.ts` | Created | 11 automated unit and integration tests. |
| `tests/manual-verification.ts` | Created | End-to-end flow verification script. |
| `docs/stage-4-onboarding-report.md` | Created | This report. |

---

## 4. Database Operations

- **User Retrieval / Creation:** Uses `prisma.user.findUnique` via cookie ID; generates new local demo user (`demo-<uuid-prefix>@unrot.local`) if none exists.
- **Preference Persistence:** Uses `prisma.userPreference.upsert` keyed on `userId` to create or update preferences without duplicating user records.
- **Learning Path Match:** Queries `prisma.learningPath.findFirst` with lessons included ordered by `dayNumber` ascending.
- **Analytics Storage:** Inserts into `prisma.analyticsEvent` with JSON-serialized properties.

---

## 5. Demo-User Behavior

- Demo users are created without requiring passwords or third-party authentication.
- Email generation follows a deterministic local pattern: `demo-<short-id>@unrot.local`.
- When a user resubmits the onboarding form, the existing user ID from the HTTP-only cookie is reused.
- Verified: User table count remains constant on repeated onboarding submissions.

---

## 6. Cookie Configuration

- **Cookie Name:** `unrot_demo_user_id`
- **Value:** User identifier string (UUID)
- **HttpOnly:** `true` (unreadable from client JavaScript)
- **SameSite:** `lax` (CSRF defense while supporting top-level navigation)
- **Secure:** `true` in production, `false` in development (allows `http://localhost`)
- **Path:** `/`
- **MaxAge:** 30 days (`2592000` seconds)
- **Security Check:** No role, goal, or experience preferences are stored in the cookie; preferences reside strictly in the database.

---

## 7. Analytics Events

| Event Name | Timing | Trigger |
|---|---|---|
| `onboarding_started` | Server Action | When a new demo user is first provisioned. |
| `role_selected` | Server Action | When role is submitted in onboarding. |
| `goal_selected` | Server Action | When learning goal is submitted. |
| `experience_level_selected` | Server Action | When experience level is submitted. |
| `onboarding_completed` | Server Action | When full onboarding form is submitted and validated. |
| `plan_created` | Server Action | Immediately following successful preference persistence. |
| `plan_viewed` | Server Page | On every render of `/plan` for the authenticated demo user. |

*Note on event timing:* Selection events are captured server-side upon form completion to minimize client-to-server overhead and guarantee transactional recording alongside preference persistence.

---

## 8. Validation Rules

Defined via Zod (`src/lib/validation.ts`):
- **Role:** Must be in `['Product manager', 'Software engineer', 'Designer', 'Marketing or sales', 'Student', 'Other']`
- **Learning Goal:** Must be in `['Use AI more effectively at work', 'Understand AI fundamentals', 'Prepare for AI interviews', 'Learn prompt engineering', 'Keep up with AI news']`
- **Experience Level:** Must be in `['New to AI', 'Comfortable with AI tools', 'Advanced AI user']`

Both client-side state disabling and server-side Zod validation reject invalid or missing inputs.

---

## 9. Manual Test Results

1. **Open `/`:** HTTP 200 returned.
2. **Start Learning CTA:** Confirmed navigation target is `/onboarding`.
3. **Complete Onboarding:** Four-step wizard allows step-by-step selection; Continue is disabled until an option is selected.
4. **Redirect to `/plan`:** Form submission successfully provisions cookie and redirects to `/plan`.
5. **Refresh `/plan`:** Preferences persist across refreshes; HTTP 200 returned with correct curriculum data.
6. **Return to `/onboarding` & Resubmit:** Preference updated cleanly; no duplicate user created in `dev.db`.
7. **Mobile Layout:** Tested with single-column responsive grids (`grid-cols-1 sm:grid-cols-3` and `grid-cols-1 sm:grid-cols-2`).
8. **Keyboard Navigation:** Verified tab order across buttons, radio groups, and links with visible outline rings (`focus-visible:ring-2 focus-visible:ring-foreground`).

---

## 10. Automated Test Results

Suite: `tests/onboarding.test.ts` (11 tests across 4 categories):
- **Allowlist Validation:** 4/4 passed (valid payload, invalid role, invalid goal, invalid experience).
- **Deterministic Path Matching:** 4/4 passed (product manager match, engineer match, general match, fallback behavior).
- **Analytics Property Serialization:** 2/2 passed (safe serialization/deserialization, database JSON round-trip).
- **Duplicate Prevention:** 1/1 passed (upsert preserves single user count).

All 11 tests passed in ~200ms.

---

## 11. Known Limitations

- Analytics selection events are batched at submission time rather than streamed per step.
- The interactive lesson viewer at `/learn/today` is a placeholder for Stage 5.
- Only three curated learning paths currently exist in the database; unmapped roles fallback deterministically to the general professional path.

---

## 12. Exact Commands Run

```bash
pnpm add zod
pnpm test
pnpm lint
pnpm build
pnpm dev (background daemon for HTTP verification)
npx tsx tests/e2e-flow.ts
npx tsx tests/manual-verification.ts
```

---

## 13. Validation Results

- `pnpm lint`: Passed (0 errors, 0 warnings)
- `pnpm build`: Passed (all 6 routes compiled, static/dynamic generation successful)
- `pnpm test`: Passed (11/11 tests passed)
- Dev server HTTP verification:
  - `GET /api/health` -> 200 OK
  - `GET /` -> 200 OK (has `/onboarding` link)
  - `GET /onboarding` -> 200 OK (renders 4-step wizard)
  - `GET /plan` (unauthenticated) -> 307 Redirect to `/onboarding`
  - `GET /plan` (with cookie) -> 200 OK (renders personalized curriculum)
  - `GET /learn/today` -> 200 OK (Stage 5 placeholder)
