import { prisma } from "../src/lib/prisma";
import { recordFirstSessionStarted, recordEvent, EVENT_NAMES } from "../src/lib/analytics";

async function runStage7Verification() {
  console.log("=== Stage 7: Manual & Integration Verification ===");

  // 1. Verify /analytics endpoint returns HTTP 200
  const analyticsRes = await fetch("http://localhost:3000/analytics");
  console.log("1. /analytics response status:", analyticsRes.status);
  assert(analyticsRes.status === 200, "/analytics must return HTTP 200");

  const html = await analyticsRes.text();

  // 2. Verify Headers & Context Labels
  console.log("2. Verifying headers and context labels...");
  assert(html.includes("Retention Analytics"), "Must include header 'Retention Analytics'");
  assert(html.includes("Prototype analytics—not live Unrot production data"), "Must include prototype disclaimer");
  assert(html.includes("Assignment baseline:"), "Must include assignment baseline context label");
  assert(html.includes("16%"), "Must include baseline 16%");
  assert(html.includes("Target benchmark:"), "Must include target benchmark context label");
  assert(html.includes("22%"), "Must include target 22%");
  console.log("   - Headers and context labels verified ✓");

  // 3. Verify KPI cards present
  console.log("3. Verifying KPI cards...");
  assert(html.includes("New Users"), "Must include New Users KPI");
  assert(html.includes("Onboarding Completion"), "Must include Onboarding Completion KPI");
  assert(html.includes("First Lesson Completion"), "Must include First Lesson Completion KPI");
  assert(html.includes("Reminder Opt-in"), "Must include Reminder Opt-in KPI");
  assert(html.includes("Eligible D1 Cohort Size"), "Must include Eligible D1 Cohort Size KPI");
  assert(html.includes("D1 Retained Users"), "Must include D1 Retained Users KPI");
  assert(html.includes("Official D1 Retention"), "Must include Official D1 Retention KPI");
  console.log("   - All 7 KPI cards verified ✓");

  // 4. Verify Funnel steps present
  console.log("4. Verifying funnel steps...");
  assert(html.includes("Retention &amp; Engagement Funnel") || html.includes("Retention & Engagement Funnel"), "Must include Funnel section");
  assert(html.includes("New users"), "Must include New users funnel step");
  assert(html.includes("Onboarding completed"), "Must include Onboarding completed funnel step");
  assert(html.includes("Plan viewed"), "Must include Plan viewed funnel step");
  assert(html.includes("First lesson started"), "Must include First lesson started funnel step");
  assert(html.includes("First lesson completed"), "Must include First lesson completed funnel step");
  assert(html.includes("Tomorrow preview viewed"), "Must include Tomorrow preview viewed funnel step");
  assert(html.includes("Reminder enabled"), "Must include Reminder enabled funnel step");
  assert(html.includes("Real D1 return"), "Must include Real D1 return funnel step");
  console.log("   - All 8 funnel steps verified ✓");

  // 5. Verify Cohort Table and Empty/Incomplete cohort states
  console.log("5. Verifying cohort table and illustrative section...");
  assert(html.includes("Daily Cohort Retention Table"), "Must include Daily Cohort Retention Table");
  assert(html.includes("Illustrative Example Only"), "Must include Illustrative Example Only section");
  assert(html.includes("Synthetic multi-day cohort visualization"), "Must include synthetic note");
  console.log("   - Cohort table & illustrative sections verified ✓");

  // 6. Verify Event Audit Table and Methodology Panel
  console.log("6. Verifying event audit and methodology panel...");
  assert(html.includes("Event Taxonomy Audit"), "Must include Event Taxonomy Audit");
  assert(html.includes("Measurement Methodology &amp; Definitions") || html.includes("Measurement Methodology & Definitions"), "Must include methodology panel");
  assert(html.includes("Exact D1 Definition:"), "Must include exact D1 definition");
  assert(html.includes("Timezone Policy:"), "Must include timezone policy");
  console.log("   - Event audit and methodology verified ✓");

  // 7. Verify Idempotent First-Session Event creation in database
  console.log("7. Testing first_session_started idempotency...");
  const testUserId = crypto.randomUUID();
  const user = await prisma.user.create({
    data: {
      id: testUserId,
      email: `stage7-audit-${testUserId.slice(0, 8)}@unrot.local`,
      name: "Stage 7 Tester",
    },
  });

  const res1 = await recordFirstSessionStarted(user.id, { test: 1 }, "/onboarding");
  const res2 = await recordFirstSessionStarted(user.id, { test: 2 }, "/onboarding");
  assert(res1 === true, "First session record must return true on initial create");
  assert(res2 === false, "First session record must return false on duplicate call");

  const eventCount = await prisma.analyticsEvent.count({
    where: { userId: user.id, eventName: EVENT_NAMES.FIRST_SESSION_STARTED },
  });
  assert(eventCount === 1, "Must have exactly 1 first_session_started event in DB");
  console.log("   - First session idempotency verified ✓");

  // 8. Verify Demo Simulation event exclusion
  console.log("8. Verifying demo simulation exclusion...");
  await recordEvent(EVENT_NAMES.DEMO_RETURN_PREVIEWED, user.id, {}, "/home");

  const d1Events = await prisma.analyticsEvent.count({
    where: { userId: user.id, eventName: "session_returned_d1" },
  });
  assert(d1Events === 0, "session_returned_d1 must NOT exist for demo user");
  console.log("   - Demo simulation exclusion verified ✓");

  // Cleanup
  await prisma.user.delete({ where: { id: user.id } });
  console.log("=== All Stage 7 verification points passed successfully! ===");
  await prisma.$disconnect();
}

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

runStage7Verification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
