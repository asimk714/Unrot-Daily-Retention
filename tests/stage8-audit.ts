import { prisma } from "../src/lib/prisma";
import { recordFirstSessionStarted } from "../src/lib/analytics";
import { DEMO_RETURN_PREVIEW_COOKIE } from "../src/lib/reminders";

async function runStage8Audit() {
  console.log("=== Stage 8: Comprehensive Quality & Verification Audit ===");

  // 1. Health check
  const healthRes = await fetch("http://localhost:3000/api/health");
  console.log("1. /api/health -> Status:", healthRes.status);
  assert(healthRes.status === 200, "/api/health must return 200");
  const healthJson = await healthRes.json();
  assert(healthJson.status === "ok", "Health JSON status must be ok");

  // 2. Missing-cookie redirects
  console.log("2. Checking missing-cookie redirects...");
  const redirectRoutes = ["/plan", "/learn/today", "/learn/complete", "/home"];
  for (const r of redirectRoutes) {
    const res = await fetch(`http://localhost:3000${r}`, { redirect: "manual" });
    assert(res.status === 307 || res.status === 308, `${r} without cookie must redirect (307/308)`);
    console.log(`   - ${r} redirects to:`, res.headers.get("location"));
  }

  // 3. Landing page (/)
  console.log("3. Checking landing page (/) ...");
  const landingRes = await fetch("http://localhost:3000/");
  assert(landingRes.status === 200, "Landing page must return 200");
  const landingHtml = await landingRes.text();
  assert(landingHtml.includes("Unrot Daily"), "Landing must contain product title");
  assert(landingHtml.includes('href="/onboarding"'), "Landing must have CTA to /onboarding");
  assert(landingHtml.includes('href="/analytics"'), "Landing must have link to /analytics");
  console.log("   - Landing page verified ✓");

  // 4. Onboarding page (/onboarding)
  console.log("4. Checking onboarding page (/onboarding) ...");
  const onboardingRes = await fetch("http://localhost:3000/onboarding");
  assert(onboardingRes.status === 200, "Onboarding must return 200");
  const onboardingHtml = await onboardingRes.text();
  assert(onboardingHtml.includes("role") || onboardingHtml.includes("Product manager"), "Onboarding renders form");
  console.log("   - Onboarding page verified ✓");

  // 5. Setup test user and simulate complete learner journey
  console.log("5. Simulating full learner lifecycle...");
  const testUserId = crypto.randomUUID();
  const user = await prisma.user.create({
    data: {
      id: testUserId,
      email: `audit-user-${testUserId.slice(0, 8)}@unrot.local`,
      name: "Jordan Taylor",
    },
  });

  // Idempotent first session
  const firstSessionOk = await recordFirstSessionStarted(user.id, { role: "Product manager" });
  assert(firstSessionOk, "first_session_started must be recorded");

  await prisma.userPreference.create({
    data: {
      userId: user.id,
      role: "Product manager",
      learningGoal: "Use AI more effectively at work",
      experienceLevel: "Comfortable with AI tools",
    },
  });

  const path = await prisma.learningPath.findFirst({
    where: { role: "product-manager", goal: "upskilling" },
    include: { lessons: { orderBy: { dayNumber: "asc" } } },
  });
  assert(path && path.lessons.length >= 5, "Learning path must exist");

  const cookies = `unrot_demo_user_id=${user.id}`;

  // 6. Plan page (/plan) with cookie
  console.log("6. Checking /plan with active user session...");
  const planRes = await fetch("http://localhost:3000/plan", { headers: { Cookie: cookies } });
  assert(planRes.status === 200, "/plan must return 200");
  const planHtml = await planRes.text();
  assert(planHtml.includes(path.title), "/plan renders matched path title");
  assert(planHtml.includes('href="/learn/today"'), "/plan renders CTA to /learn/today");
  console.log("   - Plan page verified ✓");

  // 7. Today's lesson (/learn/today) before completion (serves Day 1)
  console.log("7. Checking /learn/today initial lesson (Day 1)...");
  const todayRes = await fetch("http://localhost:3000/learn/today", { headers: { Cookie: cookies } });
  assert(todayRes.status === 200, "/learn/today must return 200");
  const todayHtml = await todayRes.text();
  assert(todayHtml.includes(path.lessons[0].title), "/learn/today serves Day 1 title");
  console.log("   - Lesson reader Day 1 verified ✓");

  // 8. Progress and Completion
  console.log("8. Completing Day 1 lesson...");
  const completedAt = new Date();
  await prisma.lessonProgress.create({
    data: {
      userId: user.id,
      lessonId: path.lessons[0].id,
      startedAt: new Date(),
      completedAt,
      quizScore: 1.0,
    },
  });

  // 9. Completion page (/learn/complete)
  console.log("9. Checking /learn/complete...");
  const completeRes = await fetch("http://localhost:3000/learn/complete", { headers: { Cookie: cookies } });
  assert(completeRes.status === 200, "/learn/complete must return 200");
  const completeHtml = await completeRes.text();
  assert(completeHtml.includes("Day 1 Complete!"), "Renders Day 1 celebration");
  assert(completeHtml.includes(path.lessons[1].title), "Renders Day 2 preview");
  assert(completeHtml.includes("Daily Reminder Preferences"), "Renders reminder form");
  assert(completeHtml.includes("Prototype Disclosure:"), "Renders prototype disclosure notice");
  assert(completeHtml.includes("Simulate Tomorrow"), "Renders return simulation trigger card");
  console.log("   - Completion page verified ✓");

  // 10. Reminder persistence and upsert idempotency
  console.log("10. Checking reminder preferences persistence...");
  const rem1 = await prisma.reminderPreference.upsert({
    where: { userId: user.id },
    update: { enabled: true, reminderTime: "08:15", timezone: "Asia/Kolkata" },
    create: { userId: user.id, enabled: true, reminderTime: "08:15", timezone: "Asia/Kolkata" },
  });
  assert(rem1.reminderTime === "08:15", "Reminder time saved");
  const remCount = await prisma.reminderPreference.count({ where: { userId: user.id } });
  assert(remCount === 1, "Exactly 1 reminder row per user");
  console.log("   - Reminder preferences verified ✓");

  // 11. Returning user dashboard (/home)
  console.log("11. Checking returning-user dashboard (/home)...");
  const homeRes = await fetch("http://localhost:3000/home", { headers: { Cookie: cookies } });
  assert(homeRes.status === 200, "/home must return 200");
  const homeHtml = await homeRes.text();
  assert(homeHtml.includes("Welcome back, Jordan Taylor!"), "Greets returning user");
  assert(homeHtml.includes(path.lessons[1].title), "Highlights next incomplete lesson (Day 2)");
  assert(homeHtml.includes("1 of 5 Lessons Complete (20%)"), "Shows progress percentage");
  assert(homeHtml.includes("Scheduled daily at 08:15 (Asia/Kolkata)"), "Shows reminder status");
  console.log("   - Returning user dashboard verified ✓");

  // 12. Simulated return preview mode
  console.log("12. Checking simulated return preview mode...");
  const simRes = await fetch("http://localhost:3000/home", {
    headers: { Cookie: `${cookies}; ${DEMO_RETURN_PREVIEW_COOKIE}=1` },
  });
  assert(simRes.status === 200, "/home in preview mode must return 200");
  const simHtml = await simRes.text();
  assert(simHtml.includes("Prototype demo"), "Shows prototype demo badge");
  assert(simHtml.includes("Exit demo preview"), "Shows exit demo preview button");
  // Crucial check: zero session_returned_d1 events
  const d1Events = await prisma.analyticsEvent.count({
    where: { userId: user.id, eventName: "session_returned_d1" },
  });
  assert(d1Events === 0, "session_returned_d1 must NEVER be emitted during simulation");
  console.log("   - Demo simulation mode verified ✓");

  // 13. Next day lesson selection (/learn/today now serves Day 2)
  console.log("13. Checking /learn/today automatically delivers Day 2 for returning learner...");
  const today2Res = await fetch("http://localhost:3000/learn/today", { headers: { Cookie: cookies } });
  assert(today2Res.status === 200, "/learn/today must return 200");
  const today2Html = await today2Res.text();
  assert(today2Html.includes(path.lessons[1].title), "Serves Day 2 title for returning learner");
  console.log("   - Day 2 progression verified ✓");

  // 14. Retention analytics dashboard (/analytics)
  console.log("14. Checking /analytics dashboard...");
  const analyticsRes = await fetch("http://localhost:3000/analytics");
  assert(analyticsRes.status === 200, "/analytics must return 200");
  const analyticsHtml = await analyticsRes.text();
  assert(analyticsHtml.includes("Retention Analytics"), "Header present");
  assert(analyticsHtml.includes("Prototype analytics—not live Unrot production data"), "Disclaimer present");
  assert(analyticsHtml.includes("Assignment baseline:"), "Baseline context label present");
  assert(analyticsHtml.includes("16%"), "Baseline 16% present");
  assert(analyticsHtml.includes("Target benchmark:"), "Target benchmark context label present");
  assert(analyticsHtml.includes("22%"), "Target benchmark 22% present");
  assert(analyticsHtml.includes("New Users"), "New users KPI present");
  assert(analyticsHtml.includes("Retention &amp; Engagement Funnel") || analyticsHtml.includes("Retention & Engagement Funnel"), "Funnel present");
  assert(analyticsHtml.includes("Daily Cohort Retention Table"), "Cohort table present");
  assert(analyticsHtml.includes("Illustrative Example Only"), "Illustrative section present");
  assert(analyticsHtml.includes("Event Taxonomy Audit"), "Event audit present");
  assert(analyticsHtml.includes("Measurement Methodology &amp; Definitions") || analyticsHtml.includes("Measurement Methodology & Definitions"), "Methodology present");
  console.log("   - Analytics dashboard verified ✓");

  // 15. Cleanup test user
  console.log("15. Cleaning up test user...");
  await prisma.user.delete({ where: { id: user.id } });
  console.log("=== All Stage 8 Quality Audit checks passed successfully! ===");
  await prisma.$disconnect();
}

function assert(condition: unknown, msg: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

runStage8Audit().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
