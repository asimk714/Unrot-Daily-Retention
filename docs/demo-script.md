# Unrot Daily — 3-Minute Live Demonstration Script

**Target Duration:** Exactly 3 minutes  
**Presenter:** Candidate / Product Engineer  
**Audience:** Evaluation Team & Hiring Panel  
**Primary Goal:** Demonstrate the Day 1 (D1) habit retention loop, prototype telemetry, and evaluation mechanisms in a live, working environment.

---

## Screen-by-Screen Walkthrough & Click Path

```
[0:00] Landing (/)
  │
[0:25] Onboarding (/onboarding)
  │
[0:50] Curriculum Plan (/plan)
  │
[1:15] Lesson Reader (/learn/today)
  │
[1:45] Completion & Reminders (/learn/complete)
  │
[2:15] Simulated D1 Return (/home)
  │
[2:40] Retention Dashboard (/analytics)
  │
[3:00] Wrap-up
```

---

### Segment 1: The Problem & Landing Page (0:00 – 0:25)
- **URL:** `http://localhost:3000/`
- **Action:** Open landing page. Point to the product value proposition and the two primary links: *"Start learning"* and *"View analytics"*.
- **Spoken Script:**
  > *"Welcome to Unrot Daily. In continuous learning, professionals frequently study complex topics like Applied AI but experience steep knowledge decay within 48 hours. Our core retention hypothesis is that if we anchor learners to a tailored 5-day goal, provide an explicit preview of tomorrow's topic, and establish a daily reminder commitment, we can measurably lift D1 retention from the 16% baseline toward our 22% target benchmark. Let's step through the new learner experience."*
- **Hypothesis Validated:** Initial value proposition and cognitive engagement.

---

### Segment 2: Personalized Onboarding & Path Selection (0:25 – 0:50)
- **URL:** Click *"Start learning"* $\to$ `http://localhost:3000/onboarding`
- **Action:** 
  1. Select role: *"Product manager"*. Click Continue.
  2. Select goal: *"Use AI more effectively at work"*. Click Continue.
  3. Select experience: *"Comfortable with AI tools"*. Click *"Create my learning plan"*.
- **Spoken Script:**
  > *"Instead of generic content dumps, our onboarding takes under 30 seconds to capture the learner's role, goal, and comfort level. When I submit, our server deterministically maps these inputs to a curated 5-day curriculum and creates an isolated, HTTP-only session cookie. This fires our idempotent `first_session_started` event, anchoring the user's Day 0 cohort."*
- **Hypothesis Validated:** Personalization creates relevance, boosting Day 0 completion intent.

---

### Segment 3: Curriculum Plan & Starting Lesson 1 (0:50 – 1:15)
- **URL:** `http://localhost:3000/plan`
- **Action:** Briefly review the 5-day syllabus (*"AI for Product Managers"*). Click *"Start Day 1 Session →"*.
- **Spoken Script:**
  > *"The learner lands on their personalized plan. Notice how the curriculum is framed as a structured, achievable 5-day commitment rather than an endless backlog. Day 1, 'What AI Can and Cannot Do', is active. Let's start the session."*
- **Hypothesis Validated:** Micro-commitments (~5 minutes) reduce intimidation.

---

### Segment 4: Interactive Lesson Reader & Knowledge Check (1:15 – 1:45)
- **URL:** `http://localhost:3000/learn/today`
- **Action:**
  1. Click *"Next"* through the instructional sections.
  2. Highlight the real-world example panel.
  3. On the knowledge check, select option 2 (*"Tasks with high volume, clear patterns..."*).
  4. Click *"Submit Answer"*, observe instant green feedback, then click *"Complete Today's Session"*.
- **Spoken Script:**
  > *"The lesson reader delivers bite-sized insights with a clear progress bar and duration counter. At the end, a single focused knowledge check reinforces the concept. Once submitted, our server action atomically logs `quiz_completed` and `lesson_completed` idempotently, ensuring repeat reloads never duplicate progress."*
- **Hypothesis Validated:** Active recall solidifies learning in under 5 minutes.

---

### Segment 5: Completion, Tomorrow's Preview & Daily Reminder (1:45 – 2:15)
- **URL:** `http://localhost:3000/learn/complete`
- **Action:**
  1. Point to the celebration badge and progress bar (1 of 5 completed, 20%).
  2. Point to the Day 2 preview card (*"Tomorrow's Focus · Day 2: Reading an AI Product Brief"*).
  3. Set reminder time to `08:30` (note auto-detected timezone). Click *"Save Reminder Preferences"*.
  4. Point to the amber disclosure note.
- **Spoken Script:**
  > *"This is the core retention engine. Immediately upon completing Day 1, two psychological drivers occur: First, the learner sees exactly what tomorrow covers—building curiosity. Second, they can set a daily morning reminder at their chosen hour in their local timezone. The prototype disclosure clearly informs users that preferences are saved locally to model retention timing without sending spam."*
- **Hypothesis Validated:** Curiosity gap + implementation intentions trigger Day 1 re-entry.

---

### Segment 6: Simulated Next-Day Return Loop (2:15 – 2:40)
- **URL:** Click *"Preview Tomorrow's Experience →"* $\to$ `http://localhost:3000/home`
- **Action:**
  1. Observe amber banner: *"Prototype demo: preview tomorrow's learner return experience"*.
  2. Point out the hero lesson has automatically advanced to *"Today's Focus · Day 2"*.
  3. Click *"Exit demo preview"* to demonstrate cookie isolation.
- **Spoken Script:**
  > *"To allow evaluation without waiting 24 hours or faking system clocks, we built an interactive return simulation. It sets an isolated demo cookie and routes to `/home`. Day 2 is immediately ready as the primary action. Crucially: this simulation logs `demo_return_previewed` and strictly forbids recording `session_returned_d1`, preserving absolute metric integrity."*
- **Hypothesis Validated:** Return loop experience is seamless and non-destructive to analytics.

---

### Segment 7: Retention Dashboard & Telemetry Audit (2:40 – 3:00)
- **URL:** Navigate to `http://localhost:3000/analytics`
- **Action:**
  1. Point to KPI cards and baseline (16%) / target benchmark (22%) context labels.
  2. Point to the 8-step funnel.
  3. Point to the cohort table (*"Incomplete / In progress"* status).
  4. Point to the Event Taxonomy Audit table.
- **Spoken Script:**
  > *"Finally, `/analytics` displays our pure server-calculated telemetry. Notice that we never fabricate retention: because our test cohort is under 48 hours old, it is honestly marked 'Incomplete' and the official D1 rate displays 'Not enough real cohort data yet'. The baseline 16% and target 22% are clearly labeled as assignment context. An illustrative synthetic table is separated below. Every event is tracked with distinct user counts and strict calendar-day rules."*
- **Hypothesis Validated:** Transparent, honest, statistically sound product measurement.
