# Unrot Daily — Presentation Outline & Delivery Guide

**Presentation Title:** Unrot Daily — Building a five-minute AI learning habit  
**Target Delivery Duration:** 12–15 Minutes (plus 5–10 Minutes Q&A)  
**Primary Audiences:** Product Reviewers, Design Reviewers, Technical Stakeholders, Internship Evaluators  
**Prototype Working Directory:** `C:\Users\asimk\Documents\unrot-daily-retention-prototype`  
**Accompanying Slide Content:** [`docs/unrot-daily-growth-presentation.md`](./unrot-daily-growth-presentation.md)

---

## 1. Executive Narrative Arc

The presentation follows a classic Product & Growth narrative arc divided into four clean phases:

1. **The Retention Diagnosis (Slides 1–3):** Establishes why professionals fail to build learning habits in fast-moving fields like AI (cognitive overload, time friction, lack of immediate workplace relevance), and frames the product insight around daily micro-learning with explicit re-entry loops.
2. **The Product Experience (Slides 4–6):** Walkthrough of the working prototype—demonstrating how 3-question role/goal calibration delivers an immediate 5-minute lesson, practical workplace example, quick knowledge check, and clear Day 2 bridge.
3. **Rigorous Measurement & Experimentation (Slides 7–8):** Grounded methodology for Day 1 (D1) calendar retention, event taxonomy instrumentation, and a statistically disciplined randomized controlled trial (RCT) design.
4. **Strategic Roadmap & Engineering Realism (Slides 9–10):** Honest technical limitations of the prototype (local SQLite, demo session cookie, simulated notifications), structured growth horizons, and concrete pre-production requirements.

---

## 2. 10-Slide Deck Matrix & Time Allocation

| Slide | Title | Core Objective | Time |
| :---: | :--- | :--- | :---: |
| **1** | **Title Slide** | Establish identity, project scope, and purpose. | 0.5 min |
| **2** | **The Problem: The Professional Upskilling Drop-Off** | Articulate why standard courses suffer massive drop-off. | 1.0 min |
| **3** | **Product Insight: The 5-Minute Habit Re-Entry Loop** | Explain micro-commitment + forward hook theory. | 1.5 min |
| **4** | **The Solution: Unrot Daily** | Highlight key features: personalized path, micro-session, reminder. | 1.5 min |
| **5** | **The End-to-End Learner Journey** | Diagram Day 0 onboarding through Day 1 return. | 1.5 min |
| **6** | **Prototype Experience Walkthrough** | Screen-by-screen demonstration of implemented UI/UX. | 2.5 min |
| **7** | **Retention Hypothesis & D1 Measurement Framework** | Define calendar-day D1 formula, qualifying vs. excluded events. | 2.0 min |
| **8** | **A/B Experimentation Design** | Present Control vs. Treatment, metrics, guardrails, sample sizing. | 2.0 min |
| **9** | **Structured Growth Roadmap** | Outline 3 phased horizons from prototype to enterprise scale. | 1.5 min |
| **10** | **Current Status, Technical Limitations & Next Steps** | Transparent disclosure of constraints and pre-launch engineering. | 1.0 min |
| **Total** | | | **15.0 min** |

---

## 3. Detailed Slide Breakdown & Transition Plan

### Slide 1: Title Slide
- **Headline Message:** Transforming modern AI knowledge building into an effortless 5-minute daily habit.
- **Presenter Goal:** Set an energetic, credible tone. Anchor the presentation as an end-to-end product design, implementation, and retention experiment proposal.
- **Transition to Slide 2:** *"Before looking at our solution, let's examine why traditional professional learning tools struggle with retention."*

### Slide 2: The Problem: The Professional Upskilling Drop-Off
- **Headline Message:** Busy professionals want to keep pace with AI, but heavy courses and unstructured feeds destroy daily consistency.
- **Presenter Goal:** Frame the problem around friction: 45-minute modules require rare calendar blocks; social feeds offer superficial noise without compounding progression.
- **Transition to Slide 3:** *"To solve this, we stepped back to understand what actually drives recurring human habit formation."*

### Slide 3: Product Insight: The 5-Minute Habit Re-Entry Loop
- **Headline Message:** Long-term retention is won on Day 1 by pairing a frictionless first win with an explicit, anticipated return bridge.
- **Presenter Goal:** Introduce the behavioral loop: Tiny investment (5 min) -> Immediate workplace relevance -> Tomorrow's preview hook -> User-controlled timing prompt.
- **Transition to Slide 4:** *"This insight directly guided the architecture and feature set of Unrot Daily."*

### Slide 4: The Solution: Unrot Daily
- **Headline Message:** A lightweight web application delivering tailored 5-minute daily AI lessons with built-in re-entry mechanics.
- **Presenter Goal:** Summarize core product pillars: goal calibration, focused 3-part micro-lessons, and scheduled learner re-entry.
- **Transition to Slide 5:** *"Let's see how these pillars come together in the end-to-end user journey."*

### Slide 5: The End-to-End Learner Journey
- **Headline Message:** A tight, intentional path from Day 0 acquisition to Day 1 return and habit reinforcement.
- **Presenter Goal:** Walk through the 5 key stages: Role Calibration -> Plan Generation -> Interactive Lesson -> Celebration & Preview -> Returning Dashboard.
- **Transition to Slide 6:** *"Everything shown in this journey has been fully designed, implemented, and verified in our working prototype."*

### Slide 6: Prototype Experience Walkthrough
- **Headline Message:** An enterprise-ready productivity aesthetic with responsive dark/light theming, clean typography, and interactive learning tools.
- **Presenter Goal:** Highlight concrete UI implementations: 4-step wizard card, section-by-section reader, knowledge check validation, Day 2 preview card, and dual theme support.
- **Transition to Slide 7:** *"A polished interface is meaningless without disciplined retention measurement. Let's look at our analytics framework."*

### Slide 7: Retention Hypothesis & D1 Measurement Framework
- **Headline Message:** D1 retention is strictly measured on the next calendar day and anchored by the user's initial session event.
- **Presenter Goal:** Explain the technical measurement definitions: `first_session_started`, calendar-day evaluation in user timezone, exclusion of demo simulation events, and closed-cohort completeness rules.
- **Transition to Slide 8:** *"With our measurement framework defined, how do we scientifically prove our retention hypothesis?"*

### Slide 8: A/B Experimentation Design
- **Headline Message:** A controlled randomized trial comparing generic upskilling against tailored onboarding with tomorrow previews and reminder preferences.
- **Presenter Goal:** Detail Control vs. Treatment specifications, Primary Metric (Calendar-Day D1), Secondary Metrics (Onboarding, Day 1 completion, Reminder opt-in, D7), Guardrails (bounce rate, errors), and pre-experiment statistical power calculations.
- **Transition to Slide 9:** *"Beyond this initial experiment, how does Unrot Daily scale into a mature enterprise learning engine?"*

### Slide 9: Structured Growth Roadmap
- **Headline Message:** A three-phase growth strategy progressing from core habit validation to content syndication and team benchmarking.
- **Presenter Goal:** Present Phase 1 (Core Habit Validation), Phase 2 (Retention & Channel Expansion), and Phase 3 (Enterprise Team Benchmarking).
- **Transition to Slide 10:** *"Finally, let's review the exact current state of our prototype and our honest technical limitations."*

### Slide 10: Current Status, Technical Limitations & Next Steps
- **Headline Message:** The prototype delivers a complete, verified local experience ready for production-hardening and cloud infrastructure.
- **Presenter Goal:** Maintain absolute intellectual honesty: demo cookie session, local SQLite database, no actual email/push dispatch, and unproven statistical lifts. Outline immediate next steps.

---

## 4. Key Talking Points & Audience Alignment

### For Product Reviewers:
- Focus on the behavioral loop (Micro-lesson -> Value confirmation -> Tomorrow preview -> Scheduled trigger).
- Emphasize the calendar-day D1 retention metric precision vs. misleading 24h rolling windows.
- Highlight the structured experiment plan with pre-calculated sample sizes and guardrail metrics.

### For Design Reviewers:
- Highlight the enterprise-tech productivity aesthetic (neutral slate surfaces, blue primary actions, orange accent highlights).
- Walk through accessibility compliance: WCAG AAA contrast for body copy, visible focus rings on all inputs, and system-level `prefers-reduced-motion` overrides.
- Discuss the zero-flash blocking theme script and `useSyncExternalStore` architecture for instant theme switching.

### For Technical Stakeholders:
- Explain Next.js App Router architecture, Server Actions, and Turbopack production compilation.
- Discuss the local SQLite schema (`User`, `UserPreference`, `LearningPath`, `Lesson`, `LessonProgress`, `ReminderPreference`, `AnalyticsEvent`).
- Point out analytics instrumentation discipline: idempotent first session tracking, timezone-aware calendar partitioning, and strict exclusion of demo previews from metric pipelines.

### For Internship Evaluators:
- Demonstrates complete product lifecycle execution: problem framing, UX design, full-stack implementation, automated testing (35/35 passing tests), strict linting, and honest technical boundary assessment.

---

## 5. Potential Audience Q&A Anticipation

1. **Q: Why calendar-day D1 instead of rolling 24-hour retention?**
   - *A:* Rolling 24-hour windows count a return at hour 25 as D1, but count a return at hour 23 on the next calendar day as D0. Calendar-day tracking matches human routine: returning the next morning or work day is the true habit signal.
2. **Q: Why exclude the demo simulation from analytics?**
   - *A:* The simulation is an interactive evaluator preview that allows stakeholders to see Day 2 immediately without waiting 24 hours. Polluting production cohorts with instant simulation triggers would artificially inflate D1 metrics.
3. **Q: Does the prototype actually send email or push notifications?**
   - *A:* No. The prototype captures user time preferences and timezones in SQLite to measure intent and readiness, but intentionally avoids external notification dependencies at this stage.
4. **Q: How are learning paths matched?**
   - *A:* Matched deterministically based on user role and learning goal against seeded curriculum tracks (`product-manager`, `software-engineer`, and `general-professional`).
