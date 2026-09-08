# Experimentation Plan: Unrot Daily Retention (D1 Retention Loop)

**Date:** 2026-09-08  
**Project Path:** `C:\Users\asimk\Documents\unrot-daily-retention-prototype`  
**Status:** Pre-Experiment Design & Protocol Document

---

## 1. Context & Problem Statement

Unrot is a lightweight daily-review platform designed to help knowledge workers retain what they learn in 5-minute micro-learning sessions. 
Under the baseline assignment context, new-learner Day 1 (D1) retention is **16%**. The business goal is to lift D1 retention to a target benchmark of **22%** (+6.0 percentage points absolute lift, representing a 37.5% relative improvement).

Learner drop-off after Day 0 primarily occurs because:
1. Learners lack a tangible, personalized curriculum anchoring their specific role and goal.
2. Learners finish their first session without anticipation or clarity on what tomorrow's session will cover.
3. Learners do not establish a deliberate time commitment or reminder cue for Day 1 re-entry.

---

## 2. Hypothesis

Providing newly acquired learners with a **personalized 5-day curriculum path**, an **explicit preview of tomorrow's lesson topic upon Day 0 completion**, and an **optional daily morning reminder commitment** will significantly increase calendar-day D1 retention from 16% toward the 22% benchmark without increasing Day 0 drop-off.

---

## 3. Experiment Design

### 3.1 Randomization Unit
- **Unit of Randomization:** User ID (or persistent anonymous visitor device ID prior to user registration).
- **Allocation Ratio:** 50% Control / 50% Treatment.
- **Assignment Mechanism:** Deterministic cryptographic hash of `userId` (e.g. `SHA-256(userId + salt) % 100 < 50` for Control). Ensures stable variant assignment across multiple browser visits and sessions.

### 3.2 Variants

| Variant | Experience Description |
|---|---|
| **Control (Variant A)** | Standard generic onboarding. Learners complete onboarding and are assigned a static, unpersonalized lesson list without an explicit 5-day goal syllabus, without tomorrow's lesson preview card on completion, and without reminder preference selection. |
| **Treatment (Variant B)** | Personalized retention loop. Learners select role, goal, and experience level; receive a tailored 5-day curriculum; view tomorrow's lesson preview immediately upon Day 0 completion; set an optional daily reminder time (HH:mm) in their detected timezone; and return to a dedicated `/home` dashboard with the next incomplete lesson highlighted. |

---

## 4. Metrics Framework

### 4.1 Primary Metric
- **Calendar-Day D1 Retention Rate:**
  $$\text{D1 Retention} = \frac{\text{Distinct users in cohort who log } \ge 1 \text{ qualifying return event on calendar day } D_0 + 1}{\text{Total distinct users in new-user cohort with } \text{first\_session\_started on calendar day } D_0}$$
  - **Start Event:** `first_session_started` (recorded server-side upon Day 0 onboarding/session start).
  - **Qualifying Return Events:** `return_home_viewed`, `lesson_viewed`, `lesson_started`, `plan_viewed`, `next_lesson_started`, `session_returned_d1`.
  - **Exclusions:** `demo_return_previewed` and simulation activities are strictly excluded.
  - **Calendar Window:** Evaluated using the user's configured timezone (or UTC fallback). Rolling 24-hour elapsed windows are prohibited.
  - **Cohort Completeness:** A cohort on calendar day $D_0$ is evaluated only after day $D_0 + 1$ has fully closed (i.e. on day $D_0 + 2$).

### 4.2 Secondary Metrics
1. **Day 0 Lesson Completion Rate:** Percentage of new users who complete Day 1 lesson (`lesson_completed` / `first_session_started`).
2. **Tomorrow Preview Exposure Rate:** Percentage of completers who view the Day 2 preview card (`reminder_settings_viewed` / `lesson_completed`).
3. **Daily Reminder Opt-In Rate:** Percentage of completers who opt in to daily reminder (`reminder_enabled` / `onboarding_completed`).
4. **Day 7 (D7) Retention Rate:** Percentage of new users returning on calendar day $D_0 + 7$ (longer-term habit durability).

### 4.3 Guardrail Metrics (Risk Minimization)
1. **Onboarding Abandonment Rate:** Percentage of users who start onboarding but drop off before plan creation (`1 - onboarding_completed / onboarding_started`). Must not increase by > 2.0 percentage points.
2. **Reminder Disable Rate:** Percentage of users who initially opt in to reminders and subsequently toggle them off (`reminder_disabled` / `reminder_enabled`).
3. **Notification Opt-Out Rate (Future):** Unsubscribe / push block rate once real email/push notifications are integrated.
4. **Lesson Quality & Quiz First-Pass Score:** Average score on first knowledge check submission (guards against rushing through lessons).

---

## 5. Sample Size, Power, and Duration

### 5.1 Sample Size Calculation Requirements
Sample size cannot be fabricated or guessed; it must be calculated using statistical power analysis based on:
- Baseline conversion rate ($p_1 = 0.16$).
- Minimum Detectable Effect ($\text{MDE} = +0.06$, yielding $p_2 = 0.22$).
- Statistical significance level ($\alpha = 0.05$, two-tailed).
- Statistical power ($1 - \beta = 0.80$).

Standard two-sample proportion test formula:
$$n = \frac{\left(Z_{\alpha/2}\sqrt{2\bar{p}(1-\bar{p})} + Z_{\beta}\sqrt{p_1(1-p_1) + p_2(1-p_2)}\right)^2}{(p_2 - p_1)^2}$$
Where:
- $Z_{0.025} \approx 1.96$
- $Z_{0.20} \approx 0.84$
- $\bar{p} = \frac{0.16 + 0.22}{2} = 0.19$

Plugging in parameters yields approximately **650 to 700 eligible new users per variant** (total sample size: ~1,300–1,400 new users).

### 5.2 Test Duration
- Test must run for a minimum of **2 full weeks (14 days)** plus a 2-day cooldown period to allow the final cohort's D1 return window to close.
- Minimum 2-week duration captures weekly seasonality (weekday vs. weekend learning behavior).

---

## 6. Exposure & Exclusion Criteria

### 6.1 Exposure Criteria (Inclusion)
- Net new users visiting the application who start their first session (`first_session_started`).
- Users must successfully receive a variant assignment cookie (`unrot_variant=control` or `unrot_variant=treatment`).

### 6.2 Exclusion Criteria
- Internal team IP addresses and automated test runners.
- Demo preview simulation runs (`demo_return_previewed`).
- Users who fail to generate a valid user session or cookie.
- Stale or incomplete cohorts where fewer than 48 hours have elapsed since Day 0 acquisition.

---

## 7. Decision Rule

| Outcome | Criteria | Decision Action |
|---|---|---|
| **Statistically Significant Win** | D1 Retention Treatment > Control with $p < 0.05$, and guardrail metrics within tolerance. | Roll out Treatment (personalized path, tomorrow preview, daily reminders) to 100% of learners. |
| **Inconclusive / Neutral** | $p \ge 0.05$ with no meaningful lift in primary or secondary metrics. | Do not ship full treatment. Analyze funnel drop-offs (preview exposure vs. reminder opt-in) to form new hypothesis. |
| **Statistically Significant Loss** | D1 Retention Treatment < Control with $p < 0.05$ OR Onboarding Abandonment exceeds guardrail threshold. | Roll back immediately to Control. Investigate onboarding friction. |

---

## 8. Potential Risks & Mitigation

1. **Onboarding Fatigue:** Adding role and goal questions could add friction.  
   *Mitigation:* Kept to 3 simple single-choice selections taking < 30 seconds with immediate payoff (curated 5-day plan).
2. **Notification Annoyance:** Aggressive reminders could cause uninstalls.  
   *Mitigation:* Opt-in only, clearly editable reminder hour, timezone-aware scheduling.
3. **Timezone Misalignment:** Sending reminder at 08:00 UTC to a user in Asia/Kolkata (13:30 local) breaks habit formation.  
   *Mitigation:* Device timezone auto-detection via `Intl.DateTimeFormat().resolvedOptions().timeZone` with persistent storage.

---

## 9. Follow-Up Work
1. Integrate production experimentation engine (e.g. Statsig, GrowthBook, or LaunchDarkly) with server-side variant assignment.
2. Implement actual delivery infrastructure (email via Resend/Postmark, Web Push via Web Push API) matching the stored `reminderTime` and `timezone`.
3. Implement D7 and D30 cohort analysis dashboards.
