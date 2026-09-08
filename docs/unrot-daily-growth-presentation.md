# Unrot Daily — Building a Five-Minute AI Learning Habit

**Deck Format:** 10-Slide Product & Growth Presentation  
**Target Audience:** Product Reviewers, Design Reviewers, Technical Stakeholders, Internship Evaluators  
**Prototype Working Directory:** `C:\Users\asimk\Documents\unrot-daily-retention-prototype`  
**Outline & Delivery Guide:** [`docs/unrot-daily-growth-presentation-outline.md`](./unrot-daily-growth-presentation-outline.md)

---

## Slide 1: Title Slide

### Slide Title
**Unrot Daily — Building a Five-Minute AI Learning Habit**

### Main Message
Unrot Daily transforms fast-moving AI literacy into an effortless, daily micro-learning habit engineered from the ground up for Day 1 learner retention.

### Key Points
- **Product Overview:** A personalized, web-based daily learning companion for knowledge workers and software teams.
- **Core Mechanism:** 5-minute focused daily lessons paired with contextual role calibration, practical workplace examples, and proactive re-entry loops.
- **Prototype Status:** Fully functioning local Next.js & SQLite prototype featuring active onboarding, lesson reader, reminder preferences, returning-user dashboard, and retention analytics.
- **Design Standard:** Enterprise productivity tool aesthetic featuring light/dark themes, WCAG AAA body contrast, and keyboard accessibility.

### Suggested Visual
- **Layout:** High-impact split layout.
- **Left:** Bold typographic header with product title, subtitle, and badge ("Enterprise Learning Prototype · Next.js & SQLite").
- **Right:** Crisp side-by-side mockup displaying the Unrot Daily desktop hero card and the mobile interactive lesson reader in both Light and Dark mode.

### Speaker Notes
> "Welcome everyone. Today I'm presenting Unrot Daily, a product engineered to solve one of the most persistent challenges in digital professional education: early learner drop-off. 
> 
> Modern professionals know they need to keep pace with generative AI, but traditional learning formats demand time they simply don't have. Unrot Daily turns this around by delivering focused 5-minute daily modules tailored specifically to a learner's workplace role, reinforced with immediate practical applications and forward-looking re-entry mechanics. 
> 
> Over the next 15 minutes, I'll walk through the user problem, our behavioral insights, a live prototype walkthrough, our calendar-day retention measurement framework, our controlled experiment plan, and our transparent technical boundaries."

### Approximate Speaking Time
**1.0 Minute**

---

## Slide 2: The Problem: The Professional Upskilling Drop-Off

### Slide Title
**The Upskilling Dilemma: High Ambition, Rapid Abandonment**

### Main Message
Traditional online courses and unstructured social feeds fail working professionals because they require unsustainable calendar blocks and lack immediate workplace utility.

### Key Points
- **The Cognitive Overload Barrier:** Modern enterprise learning platforms demand 30-to-60 minute sessions, leading to high initial signups but severe drop-off within 24 to 48 hours.
- **The Noise vs. Depth Problem:** Social feeds and newsletters provide bite-sized snippets but lack structured progression, hands-on validation, or personal relevance.
- **The Missing Re-Entry Bridge:** Most educational tools assume learner self-motivation and provide no compelling bridge between finishing Day 1 and returning on Day 2.
- **The Resulting Habit Decay:** Without an intentional, low-friction next-day habit loop, professionals postpone study, lose momentum, and abandon the curriculum.

### Suggested Visual
- **Layout:** Three comparison callout cards depicting learner failure modes.
- **Card 1 (Long-Form MOOCs):** Illustration of a 45-minute video with a steep drop-off curve icon ("Too heavy for daily workdays").
- **Card 2 (Social Feeds):** Illustration of disconnected post snippets ("Passive reading without retention or validation").
- **Card 3 (Unrot Daily Gap):** Centered highlighted box showing the sweet spot: "5-Minute Structured Micro-Habit + Explicit Next-Day Re-Entry Hook".

### Speaker Notes
> "Let's examine why traditional upskilling fails knowledge workers. When professionals decide to learn AI, they typically face two extremes. On one end are traditional online courses: 40-minute lectures and extensive assignments. Even the most ambitious workers struggle to protect a 45-minute block every day. They complete session one on Sunday, miss Monday due to meetings, and by Wednesday the habit is dead.
> 
> On the other end are newsletters and social feeds. They're quick, but they're passive, fragmented, and rarely connect directly to the user's specific day-to-day job duties.
> 
> Crucially, neither model solves the re-entry problem: what brings the learner back tomorrow morning at 8:00 AM? Without an intentional next-day bridge, retention collapses."

### Approximate Speaking Time
**1.5 Minutes**

---

## Slide 3: Product Insight: The 5-Minute Habit Re-Entry Loop

### Slide Title
**The Behavioral Insight: Long-Term Retention Is Won on Day 1**

### Main Message
Sustainable learning habits require a frictionless first-session win followed immediately by forward curiosity and user-controlled re-entry timing.

### Key Points
- **Friction Reduction:** Capping daily study to 5 minutes removes calendar resistance and cognitive dread.
- **Immediate Value Confirmation:** Grounding every lesson in a real-world workplace scenario provides an immediate payoff during the work day.
- **The 'Tomorrow Preview' Hook:** Showing tomorrow's lesson title and topic at the moment of today's completion creates active anticipation and unfinished business.
- **Permissioned Daily Prompts:** Giving the learner explicit agency over their morning study hour anchors the product into an existing daily workflow.

### Suggested Visual
- **Layout:** Circular habit loop diagram with 4 interconnected nodes.
- **Node 1 (Top):** Calibrated Onboarding (Role + Goal match in 30 seconds).
- **Node 2 (Right):** 5-Minute Lesson (Concise concept + Practical example + 1-question check).
- **Node 3 (Bottom):** Immediate Win & Tomorrow Preview (Celebration + Day 2 focus peek).
- **Node 4 (Left):** Scheduled Re-Entry Trigger (User-chosen reminder time and timezone).
- **Center:** "Consistent Calendar-Day D1 Return".

### Speaker Notes
> "To solve this drop-off, our product design relies on a specific behavioral insight: habit formation doesn't require more content; it requires a tighter, more rewarding loop.
> 
> First, we eliminate barrier to entry: 5 minutes fits into morning coffee or the transition between meetings.
> 
> Second, we provide an immediate win: not theoretical trivia, but an applied workplace pattern—like how a product manager reviews an AI brief or how a software engineer prompts for unit tests.
> 
> Third, and most importantly for retention: we introduce the 'tomorrow preview' at the exact peak of accomplishment. When a user completes Day 1, we don't say 'goodbye'. We celebrate their completion and immediately show them what Day 2 unlocks. Pairing that curiosity with a user-selected reminder hour completes the re-entry bridge."

### Approximate Speaking Time
**1.5 Minutes**

---

## Slide 4: The Solution: Unrot Daily

### Slide Title
**Unrot Daily: Personalized, Micro-Sized, Habit-Forming AI Education**

### Main Message
Unrot Daily delivers tailored 5-minute daily AI lessons through an intuitive interface built specifically for consistency and daily return.

### Key Points
- **Goal-Based Calibration:** A frictionless 3-question onboarding flow calibrating the learner's target role, primary objective, and current AI familiarity.
- **Deterministic Learning Paths:** Matches users directly to structured 5-day curriculum tracks (Product Managers, Software Engineers, General Professionals).
- **Focused Daily Reader:** Short modular reading sections, a dedicated workplace example panel, and a single knowledge check validating comprehension.
- **Integrated Re-Entry Mechanics:** Immediate next-day syllabus preview, local reminder scheduling with auto-detected timezone, and a returning-user dashboard.
- **Enterprise-Grade Experience:** Refined neutral surfaces, royal blue primary actions, warm orange accents, and dark/light mode parity.

### Suggested Visual
- **Layout:** 3-column feature architecture showcase.
- **Column 1 (Calibrate):** Screenshot of Onboarding role & goal selection cards with active blue border states.
- **Column 2 (Learn):** Screenshot of the Lesson Reader showing Section 1 text, the practical example panel (`💡 Practical Example`), and the multiple-choice quiz.
- **Column 3 (Return):** Screenshot of `/learn/complete` showing the celebration badge, tomorrow's preview card, and the daily reminder preference toggle.

### Speaker Notes
> "Here is how Unrot Daily translates that behavioral model into a working product.
> 
> When a learner arrives, they aren't asked to browse a massive course catalog. Instead, our goal-based onboarding asks three simple questions: What is your role? What is your primary learning goal? What is your AI experience level?
> 
> In less than 30 seconds, the system generates a tailored 5-day curriculum path. 
> 
> Each daily session takes approximately five minutes. It contains two or three concise reading sections, a highlighted real-world practical example, and a 1-question knowledge check to prove mastery.
> 
> Once finished, the learner lands on our completion view, which pairs their accomplishment with tomorrow's preview and allows them to configure their daily reminder hour."

### Approximate Speaking Time
**1.5 Minutes**

---

## Slide 5: The End-to-End Learner Journey

### Slide Title
**The Complete User Lifecycle: From Day 0 Landing to Day 1 Habit**

### Main Message
The product architecture guides learners through a cohesive, continuous funnel designed to eliminate drop-off between Day 0 and Day 1.

### Key Points
- **Step 1: Landing & Calibration (`/` & `/onboarding`):** Value proposition clarity followed by role, goal, and experience selection.
- **Step 2: Curriculum Plan (`/plan`):** Calibrated 5-day timeline establishing expectations, highlighting Day 1, and outlining upcoming modules.
- **Step 3: Interactive Lesson (`/learn/today`):** Bite-sized reading, practical application case study, and interactive knowledge check with real-time feedback.
- **Step 4: Completion & Habit Hook (`/learn/complete`):** Milestone celebration, Day 2 preview card, and reminder preference capture.
- **Step 5: Day 1 Re-Entry (`/home`):** Returning user greeting, curriculum progress bar, and immediate single-click resumption of Day 2.

### Suggested Visual
- **Layout:** Horizontal user journey flow diagram with 5 sequential milestones.
- **Milestone 1:** `Landing & Onboarding` -> Card selection, demo session initialized.
- **Milestone 2:** `Curriculum Plan` -> Matched track overview, 'Start today's lesson' CTA.
- **Milestone 3:** `Daily Lesson Reader` -> Sections read, quiz answered correctly (1/1).
- **Milestone 4:** `Completion & Reminder` -> Day 1 complete, Day 2 previewed, 08:00 AM reminder set.
- **Milestone 5:** `Returning Dashboard` -> Next morning return, 'Start Day 2 Session →'.

### Speaker Notes
> "Let's follow the complete learner lifecycle through the application.
> 
> On Day 0, the user lands on our homepage, reviews our value pillars, and launches onboarding. They select their role—say, Product Manager—and their goal of using AI more effectively at work.
> 
> They immediately see their personalized curriculum plan on `/plan`. Clicking 'Start today's lesson' opens the interactive reader. The learner reads two concise sections explaining AI brief evaluation, inspects a practical example, and answers a knowledge check question.
> 
> Upon submitting, they are redirected to `/learn/complete`. Here, they receive clear visual validation: 'Day 1 Complete!', see tomorrow's Day 2 topic, and can confirm their morning reminder hour.
> 
> When they return on Day 1, the dashboard greets them by name, shows their 20% path completion, and presents a prominent one-click button to launch Day 2."

### Approximate Speaking Time
**1.5 Minutes**

---

## Slide 6: Prototype Walkthrough: Implemented Features

### Slide Title
**Live Prototype Capabilities: Built, Instrumented, and Tested**

### Main Message
Every core capability of Unrot Daily is implemented in functional code, styled with semantic design tokens, and backed by a local SQLite database.

### Key Points
- **Interactive Onboarding:** 4-step client wizard with accessible radio groups, instant validation, and zero layout shift.
- **Bite-Sized Reader:** Dynamic lesson rendering from structured JSON schemas, complete with practical example panels and interactive quiz validation.
- **Reminder Persistence:** Idempotent database upsert capturing preferred hour (24h) and auto-detected IANA timezone.
- **Simulated Next-Day Return:** Safe demo trigger allowing evaluators to preview Day 2 progression without altering system clocks or database timestamps.
- **Design System & Theming:** Central semantic color tokens (`primary` blue, `accent` orange, `surface` slate), dual light/dark mode, and zero flash of unstyled theme (FOUT).

### Suggested Visual
- **Layout:** 4-quadrant UI component gallery showing actual implemented screens.
- **Top-Left:** `/onboarding` Step 1 role selection with blue focus ring and progress bar.
- **Top-Right:** `/learn/today` Knowledge check quiz card with green validated answer alert.
- **Bottom-Left:** `/learn/complete` Reminder preference form and 'Simulate Tomorrow' trigger card.
- **Bottom-Right:** `/home` Returning user dashboard showing Day 2 next lesson hero card.

### Speaker Notes
> "This is not a clickable Figma prototype—this is a fully implemented, production-structured Next.js application.
> 
> On screen you see four core areas of the build. In the upper left is our accessible 4-step onboarding wizard, utilizing client transitions and keyboard navigation. 
> 
> In the upper right is our lesson reader: notice how the knowledge check provides instant, polite ARIA status feedback when the correct answer is selected.
> 
> In the lower left is our reminder capture and evaluation simulation tool. Because waiting 24 hours to test Day 2 re-entry is impractical during a review, we built a dedicated simulation controller that sets an isolated preview cookie.
> 
> In the lower right is the resulting returning learner dashboard on `/home`, rendering Day 2's lesson card with updated progress metrics.
> 
> All of this is styled with Tailwind v4 semantic tokens and tested against light and dark modes."

### Approximate Speaking Time
**2.0 Minutes**

---

## Slide 7: Retention Hypothesis & D1 Measurement Framework

### Slide Title
**Measurement Discipline: Defining Calendar-Day D1 Retention**

### Main Message
We evaluate habit formation through a strict calendar-day D1 retention metric anchored to a user's initial session, strictly excluding artificial demo previews.

### Key Points
- **The Retention Hypothesis:** *“If users receive a relevant first lesson, see tomorrow’s value, and can optionally set a reminder, more users will return on the next calendar day.”*
- **Cohort Anchor (`first_session_started`):** The cohort Day 0 is strictly defined by the user's initial onboarding session event, recorded idempotently.
- **Strict Calendar-Day Window:** Return is measured strictly during the next calendar day in the user's timezone ($Date_{first} + 1$). Rolling 24-hour windows are prohibited.
- **Qualifying Engagement Events:** Retention requires real learning intent (`lesson_viewed`, `lesson_completed`, `plan_viewed`, `return_home_viewed`).
- **Demo Simulation Exclusion:** Simulated previews (`demo_return_previewed`) are strictly isolated and never emit `session_returned_d1` or pollute real cohorts.
- **Cohort Completeness Rule:** Cohorts remain marked *Incomplete* until $\ge 48$ hours have elapsed ($Date + 2$), ensuring partial days never dilute the metric.

### Suggested Visual
- **Layout:** Technical timeline diagram showing the Day 0 to Day 1 calendar-day evaluation logic.
- **Timeline Top:** `Day 0 (Calendar Date D)` -> User triggers `first_session_started` -> Completes Day 1 lesson.
- **Timeline Middle:** `Day 1 (Calendar Date D + 1)` -> User executes real qualifying action -> Retained ($D1 = 1$).
- **Timeline Bottom (Exclusion Rule):** `Demo Simulation Box` -> Shows preview cookie active -> Triggers `demo_return_previewed` -> Explicit 0 impact on D1 cohort table.

### Speaker Notes
> "Now let's examine our growth measurement discipline. Our retention hypothesis states: 'If users receive a relevant first lesson, see tomorrow’s value, and can optionally set a reminder, more users will return on the next calendar day.'
> 
> To test this honestly, we must define D1 retention with mathematical rigor. Many teams use rolling 24-hour windows. But rolling windows create severe distortions: a user who signs up at 11:00 PM and returns at 8:00 AM the next morning is penalized because 24 hours haven't elapsed, whereas someone returning 25 hours later on the same day counts as D1.
> 
> In Unrot Daily, D1 is strictly calendar-day based in the user's local timezone. A cohort begins when `first_session_started` is recorded. A user is retained if and only if they perform a qualifying action—viewing the dashboard, plan, or lesson—on calendar date D+1.
> 
> Crucially, our prototype's simulation feature is completely walled off: demo preview actions never emit `session_returned_d1` and cannot contaminate the cohort table. Furthermore, cohorts younger than 48 hours are flagged as incomplete so in-flight days don't corrupt the D1 rate."

### Approximate Speaking Time
**2.0 Minutes**

---

## Slide 8: A/B Experimentation Design

### Slide Title
**Proving the Lift: Controlled Experimentation Framework**

### Main Message
A randomized controlled trial (RCT) isolates the retention impact of personalization, forward previews, and reminder preferences against a baseline curriculum.

### Key Points
- **Control Variant (A):** Basic onboarding (role only) paired with a generic, uncalibrated learning path; completion view shows no tomorrow preview and no reminder prompt.
- **Treatment Variant (B):** Full Unrot Daily experience—3-point role/goal/experience calibration, tailored track, tomorrow's preview card, and optional morning reminder.
- **Primary Success Metric:** Calendar-day D1 retention rate across closed cohorts.
- **Secondary Funnel Metrics:** Onboarding completion rate, Day 1 lesson completion rate, reminder opt-in rate, and Day 7 (D7) retention.
- **Guardrail Metrics:** Onboarding drop-off rate, reminder disable rate, client/server error rates, and content quality ratings.
- **Sample Sizing Requirement:** Minimum detectable effect (MDE) and sample size must be calculated *prior* to experiment launch based on baseline traffic to ensure statistical power ($1 - \beta = 0.80$, $\alpha = 0.05$).

### Suggested Visual
- **Layout:** Two-branch A/B split architecture diagram with an accompanying metrics scorecard.
- **Branch A (Control):** Generic Onboarding -> Generic Path -> Standard Complete (No preview, no reminder).
- **Branch B (Treatment):** Calibrated Onboarding -> Tailored Path -> Rich Complete (Tomorrow preview + Reminder capture).
- **Bottom Table:** Metrics Scorecard listing Primary (Calendar-Day D1), Secondary (Funnel steps, D7), and Guardrails (Abandonment, Errors).

### Speaker Notes
> "How do we prove our hypothesis? We designed an A/B experimentation framework ready for production deployment.
> 
> The Control group receives basic onboarding and a generic upskilling track. When they complete Day 1, they see a simple 'Session finished' screen with no peek into tomorrow and no option to schedule a reminder.
> 
> The Treatment group receives the complete Unrot Daily loop: 3-point calibration, tailored curriculum, tomorrow's preview card, and the morning reminder prompt.
> 
> Our primary metric is calendar-day D1 retention. We also track secondary funnel health: onboarding completion, lesson completion, and reminder opt-in.
> 
> Just as importantly, we monitor guardrails: does 3-question onboarding increase drop-off compared to 1 question? Do users immediately disable reminders? 
> 
> Crucially, we emphasize that sample sizing must be calculated before launching the experiment based on baseline variance, rather than peeking or declaring early significance."

### Approximate Speaking Time
**2.0 Minutes**

---

## Slide 9: Structured Growth Roadmap

### Slide Title
**From Prototype to Habit Engine: Phased Growth Roadmap**

### Main Message
A three-phase growth trajectory evolving Unrot Daily from core habit validation to multi-channel notifications and enterprise cohort benchmarking.

### Key Points
- **Phase 1: Core Habit Validation (Current -> MVP Launch)**
  - Transition from local SQLite to hosted PostgreSQL (Supabase/Neon).
  - Deploy production authentication (OAuth / Magic Link) replacing demo cookies.
  - Launch production A/B experiment with live web traffic to validate D1 baseline.
- **Phase 2: Retention & Channel Expansion (Quarter 2)**
  - Implement actual reminder delivery via Email (Resend) and Web Push notifications.
  - Introduce interactive streak tracking, milestone certificates, and weekly recaps.
  - Expand curriculum from 3 tracks (15 lessons) to 10 specialized functional tracks.
- **Phase 3: Enterprise Team Benchmarking (Quarter 3)**
  - Multi-tenant enterprise workspaces with team-level AI literacy analytics.
  - Slack/Teams integration delivering daily 5-minute prompts directly into work channels.
  - Custom organizational learning paths uploaded and managed by enterprise admins.

### Suggested Visual
- **Layout:** 3-column chronological milestone roadmap with milestone badges.
- **Phase 1 (Current / Q1):** `Core Habit Validation` (PostgreSQL, Auth, Production RCT).
- **Phase 2 (Q2):** `Channel & Content Expansion` (Email/Push delivery, Streaks, 10 Tracks).
- **Phase 3 (Q3):** `Enterprise Intelligence` (Slack/Teams apps, Admin dashboard, Team D1/D7 cohorts).

### Speaker Notes
> "Looking beyond the prototype, we have mapped out a structured, three-horizon growth roadmap.
> 
> Phase 1 is about validating the core habit in production. That means replacing our local SQLite database with cloud PostgreSQL, replacing our demo session cookie with secure OAuth, and running the live randomized trial we just outlined.
> 
> In Phase 2, we turn reminder preferences into actual delivery channels: dispatching automated morning emails and web push notifications, adding streak counters, and expanding our curriculum to 10 role tracks.
> 
> In Phase 3, we scale into B2B enterprise teams. Knowledge workers don't just learn individually; engineering and product teams want shared literacy. We will integrate directly into Slack and Microsoft Teams, allowing teams to complete daily 5-minute prompts and giving managers aggregated literacy metrics."

### Approximate Speaking Time
**1.5 Minutes**

---

## Slide 10: Current Status, Limitations, and Next Steps

### Slide Title
**Engineering Realism: Current Boundaries & Next Milestones**

### Main Message
Unrot Daily is a fully functioning, rigorously tested prototype ready for infrastructure hardening and live experiment execution.

### Key Points
- **Fully Verified Prototype Status:**
  - 35/35 automated unit and integration tests passing.
  - Clean ESLint with 0 warnings/errors and passing Next.js Turbopack production build.
  - 15/15 Stage 8 end-to-end audit checks verified against live local HTTP server.
- **Transparent Technical Limitations:**
  - Authentication relies on an HTTP-only demo session cookie, not production OAuth/JWT.
  - Persistence runs on local file-based SQLite, not distributed cloud PostgreSQL.
  - Reminder preferences are captured in database records only; no external notification service is active.
  - Analytics events are stored in local database tables without third-party ingestion (e.g., PostHog/Mixpanel).
  - No live experiment has been run yet; retention improvements remain an unproven hypothesis.
- **Immediate Pre-Launch Next Steps:**
  - Migrate Prisma schema to PostgreSQL and provision cloud database.
  - Integrate production authentication and notification dispatch APIs.
  - Calculate required sample size and deploy the randomized controlled trial.

### Suggested Visual
- **Layout:** Balanced two-column scorecard: "What Is Built & Verified" vs. "Known Boundaries & Prerequisites".
- **Left Column (Green checkmarks):** 35/35 tests passing, Turbopack build clean, 7 active routes styled, accessible light/dark themes, D1 analytics engine verified.
- **Right Column (Amber badges):** Local SQLite, demo cookie auth, mock notification dispatch, unproven statistical lift, pre-experiment sample sizing required.

### Speaker Notes
> "To conclude, I want to be completely transparent about where the prototype stands today.
> 
> We have built a robust, verified proof of concept. All 35 automated tests pass, linting is spotless, our Turbopack production build compiles in 1.2 seconds, and all seven user-facing routes have been verified through end-to-end browser audits.
> 
> But we maintain strict engineering and scientific honesty about our boundaries:
> First, our demo runs on local SQLite with a lightweight demo cookie. 
> Second, we record reminder preferences, but we do not deliver real emails or push notifications.
> Third, our analytics dashboard aggregates local database records, not third-party pipelines.
> And most importantly, we do not claim a proven retention increase—we have built the instrument to measure it, but the hypothesis must be tested on live users.
> 
> Our immediate next steps are clear: provision hosted PostgreSQL, wire up real authentication and notification services, calculate our sample size, and launch the experiment.
> 
> Thank you, and I look forward to your questions."

### Approximate Speaking Time
**1.5 Minutes**

---

## Presentation Delivery Summary

| Metric | Target Value |
| :--- | :--- |
| **Total Slides** | 10 Slides |
| **Total Speaking Time** | ~15.0 Minutes |
| **Target Q&A Buffer** | 5.0–10.0 Minutes |
| **Total Session Time** | 20.0–25.0 Minutes |
| **Audience Focus** | Product & Growth Review, Design Evaluation, Engineering Feasibility |
