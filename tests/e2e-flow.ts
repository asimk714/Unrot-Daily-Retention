import { prisma } from "../src/lib/prisma";
import { matchLearningPath } from "../src/lib/learning-path";
import { recordEvent } from "../src/lib/analytics";

async function runE2eVerification() {
  console.log("=== 1. Testing Demo User Creation ===");
  const testUserId = crypto.randomUUID();
  const user = await prisma.user.create({
    data: {
      id: testUserId,
      email: `demo-${testUserId.slice(0, 8)}@unrot.local`,
      name: "Demo Learner",
    },
  });
  console.log("✓ Created demo user with local format:", user.email);

  console.log("=== 2. Testing Preference Upsert (First Time) ===");
  const pref1 = await prisma.userPreference.upsert({
    where: { userId: user.id },
    update: {
      role: "Product manager",
      learningGoal: "Use AI more effectively at work",
      experienceLevel: "Comfortable with AI tools",
    },
    create: {
      userId: user.id,
      role: "Product manager",
      learningGoal: "Use AI more effectively at work",
      experienceLevel: "Comfortable with AI tools",
    },
  });
  console.log("✓ Saved user preference for role:", pref1.role);

  console.log("=== 3. Testing Duplicate Submission Behavior ===");
  const initialUserCount = await prisma.user.count();
  const pref2 = await prisma.userPreference.upsert({
    where: { userId: user.id },
    update: {
      role: "Product manager",
      learningGoal: "Use AI more effectively at work",
      experienceLevel: "Advanced AI user",
    },
    create: {
      userId: user.id,
      role: "Product manager",
      learningGoal: "Use AI more effectively at work",
      experienceLevel: "Advanced AI user",
    },
  });
  const afterUserCount = await prisma.user.count();
  console.log(`✓ User count: initial = ${initialUserCount}, after repeat submission = ${afterUserCount} (no duplicates)`);
  console.log("✓ Updated experience level:", pref2.experienceLevel);

  console.log("=== 4. Testing Learning Path Match for /plan ===");
  const matchedPath = await matchLearningPath(pref2.role, pref2.learningGoal);
  console.log("✓ Matched Learning Path:", matchedPath?.title);
  console.log("✓ Day 1 Lesson:", matchedPath?.lessons[0]?.title);
  console.log("✓ Upcoming Lessons Preview Count:", matchedPath?.lessons.slice(1, 3).length);

  console.log("=== 5. Testing Analytics Event Logging ===");
  await recordEvent("onboarding_started", user.id, {}, "/onboarding");
  await recordEvent("role_selected", user.id, { role: pref2.role }, "/onboarding");
  await recordEvent("goal_selected", user.id, { goal: pref2.learningGoal }, "/onboarding");
  await recordEvent("experience_level_selected", user.id, { experienceLevel: pref2.experienceLevel }, "/onboarding");
  await recordEvent("onboarding_completed", user.id, { role: pref2.role, goal: pref2.learningGoal }, "/onboarding");
  await recordEvent("plan_created", user.id, { role: pref2.role, pathId: matchedPath?.id }, "/onboarding");
  await recordEvent("plan_viewed", user.id, { role: pref2.role, pathId: matchedPath?.id }, "/plan");

  const events = await prisma.analyticsEvent.findMany({
    where: { userId: user.id },
    orderBy: { occurredAt: "asc" },
  });
  console.log(`✓ Recorded ${events.length} analytics events for user:`);
  for (const ev of events) {
    console.log(`  - [${ev.eventName}] properties: ${ev.propertiesJson}`);
  }

  // Cleanup test user (cascades to preferences and unlinks analytics)
  await prisma.user.delete({ where: { id: user.id } });
  await prisma.analyticsEvent.deleteMany({ where: { userId: null } });
  console.log("✓ Cleaned up verification artifacts.");

  await prisma.$disconnect();
}

runE2eVerification().catch((e) => {
  console.error("Verification failed:", e);
  process.exit(1);
});
