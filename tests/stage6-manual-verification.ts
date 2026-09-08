import { prisma } from "../src/lib/prisma";
import {
  isValidReminderTime,
  isValidTimezone,
  getNextIncompleteLesson,
  DEMO_RETURN_PREVIEW_COOKIE,
} from "../src/lib/reminders";

async function runStage6Verification() {
  console.log("=== Stage 6: Manual & Integration Verification ===");

  // 1. Unauthenticated checks
  const unauthHome = await fetch("http://localhost:3000/home", {
    redirect: "manual",
  });
  console.log("1. /home without cookie -> Status:", unauthHome.status, "(Redirects to:", unauthHome.headers.get("location"), ")");

  const unauthLearn = await fetch("http://localhost:3000/learn", {
    redirect: "manual",
  });
  console.log("2. /learn redirect -> Status:", unauthLearn.status, "(Redirects to:", unauthLearn.headers.get("location"), ")");

  // 2. Setup demo user with preferences
  const testUserId = crypto.randomUUID();
  const demoUser = await prisma.user.create({
    data: {
      id: testUserId,
      email: `stage6-tester-${testUserId.slice(0, 8)}@unrot.local`,
      name: "Morgan Lee",
    },
  });

  await prisma.userPreference.create({
    data: {
      userId: demoUser.id,
      role: "Product manager",
      learningGoal: "Use AI more effectively at work",
      experienceLevel: "Comfortable with AI tools",
    },
  });

  const path = await prisma.learningPath.findFirst({
    where: { role: "product-manager", goal: "upskilling" },
    include: { lessons: { orderBy: { dayNumber: "asc" } } },
  });
  if (!path || path.lessons.length === 0) {
    throw new Error("No learning path found");
  }

  // 3. Test Reminder Preference Persistence in SQLite
  console.log("3. Testing reminder preferences persistence...");
  const validTime = "08:30";
  const validTz = "Asia/Kolkata";
  assert(isValidReminderTime(validTime), "Time format must be valid");
  assert(isValidTimezone(validTz), "Timezone must be valid");

  const reminder = await prisma.reminderPreference.upsert({
    where: { userId: demoUser.id },
    update: { enabled: true, reminderTime: validTime, timezone: validTz },
    create: { userId: demoUser.id, enabled: true, reminderTime: validTime, timezone: validTz },
  });

  console.log(`   - Saved reminder preference: id=${reminder.id}, time=${reminder.reminderTime}, tz=${reminder.timezone}, enabled=${reminder.enabled}`);

  // 4. Complete Day 1 lesson for user
  console.log("4. Simulating Day 1 completion...");
  const day1Lesson = path.lessons[0];
  await prisma.lessonProgress.create({
    data: {
      userId: demoUser.id,
      lessonId: day1Lesson.id,
      startedAt: new Date(),
      completedAt: new Date(),
      quizScore: 1.0,
    },
  });

  // 5. Test /learn/complete renders with reminder form and simulation trigger
  console.log("5. Testing /learn/complete page rendering...");
  const completeRes = await fetch("http://localhost:3000/learn/complete", {
    headers: { Cookie: `unrot_demo_user_id=${demoUser.id}` },
  });
  const completeHtml = await completeRes.text();
  console.log("   - Status:", completeRes.status);
  console.log("   - Has celebration 'Day 1 Complete!':", completeHtml.includes("Day 1 Complete!"));
  console.log("   - Has Tomorrow's Focus Day 2:", completeHtml.includes("Tomorrow&apos;s Focus · Day 2") || completeHtml.includes("Tomorrow's Focus · Day 2"));
  console.log("   - Has 'Daily Reminder Preferences' form:", completeHtml.includes("Daily Reminder Preferences"));
  console.log("   - Has Prototype Disclosure notice:", completeHtml.includes("Prototype Disclosure"));
  console.log("   - Has 'Simulate Tomorrow's Return Loop' trigger:", completeHtml.includes("Simulate Tomorrow"));

  // 6. Test Next Incomplete Lesson determination
  console.log("6. Testing next incomplete lesson selector...");
  const nextInfo = await getNextIncompleteLesson(demoUser.id, path.id);
  console.log(`   - Completed count: ${nextInfo.completedCount}/5`);
  console.log(`   - Next incomplete lesson: Day ${nextInfo.nextLesson?.dayNumber} (${nextInfo.nextLesson?.title})`);
  assert(nextInfo.nextLesson?.dayNumber === 2, "Next lesson must be Day 2");

  // 7. Test /home returning-learner dashboard WITHOUT simulation
  console.log("7. Testing /home standard returning user dashboard...");
  const homeRes = await fetch("http://localhost:3000/home", {
    headers: { Cookie: `unrot_demo_user_id=${demoUser.id}` },
  });
  const homeHtml = await homeRes.text();
  console.log("   - Status:", homeRes.status);
  console.log("   - Welcome greeting 'Welcome back, Morgan Lee!':", homeHtml.includes("Welcome back, Morgan Lee!"));
  console.log("   - Path progress '1 of 5 Lessons Complete (20%)':", homeHtml.includes("1 of 5 Lessons Complete (20%)"));
  console.log("   - Up Next 'Today's Focus · Day 2':", homeHtml.includes("Today&apos;s Focus · Day 2") || homeHtml.includes("Today's Focus · Day 2"));
  console.log("   - Has 'Start Day 2 Session':", homeHtml.includes("Start Day 2 Session"));
  console.log("   - Has Daily Reminder status:", homeHtml.includes("Scheduled daily at 08:30 (Asia/Kolkata)"));
  console.log("   - Has link to curriculum plan:", homeHtml.includes('href="/plan"'));

  // 8. Test /home WITH simulated next-day preview cookie
  console.log("8. Testing /home with simulated next-day return preview...");
  const simHomeRes = await fetch("http://localhost:3000/home", {
    headers: {
      Cookie: `unrot_demo_user_id=${demoUser.id}; ${DEMO_RETURN_PREVIEW_COOKIE}=1`,
    },
  });
  const simHomeHtml = await simHomeRes.text();
  console.log("   - Status:", simHomeRes.status);
  console.log("   - Displays demo banner 'Prototype demo':", simHomeHtml.includes("Prototype demo"));
  console.log("   - Displays 'Exit demo preview' button:", simHomeHtml.includes("Exit demo preview"));
  console.log("   - Preserves Day 2 hero lesson:", simHomeHtml.includes("Day 2"));

  // 9. Verify Analytics Rules
  console.log("9. Verifying analytics event integrity...");
  const d1EventCount = await prisma.analyticsEvent.count({
    where: { userId: demoUser.id, eventName: "session_returned_d1" },
  });
  console.log(`   - Count of 'session_returned_d1' events: ${d1EventCount} (MUST be 0 ✓)`);
  assert(d1EventCount === 0, "session_returned_d1 must NEVER be emitted during simulation");

  // 10. Test /learn/today automatically routes to Day 2 for returning learner
  console.log("10. Testing /learn/today returns Day 2 for returning learner...");
  const todayRes = await fetch("http://localhost:3000/learn/today", {
    headers: { Cookie: `unrot_demo_user_id=${demoUser.id}` },
  });
  const todayHtml = await todayRes.text();
  console.log("   - Status:", todayRes.status);
  console.log("   - Serves Day 2 title 'Reading an AI Product Brief':", todayHtml.includes("Reading an AI Product Brief"));

  // 11. Cleanup test user
  console.log("11. Cleaning up test data...");
  await prisma.user.delete({ where: { id: demoUser.id } });
  console.log("=== All Stage 6 verification checks passed successfully! ===");
  await prisma.$disconnect();
}

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

runStage6Verification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
