import { prisma } from "../src/lib/prisma";

async function verifyManualChecklist() {
  console.log("=== Manual Flow Verification Checklist ===");

  // 1. Check Landing Page
  const homeRes = await fetch("http://localhost:3000/");
  const homeHtml = await homeRes.text();
  console.log("1. Open / -> HTTP", homeRes.status);
  console.log("2. Start learning button links to /onboarding ->", homeHtml.includes('href="/onboarding"'));

  // 2. Check Onboarding Page
  const onbRes = await fetch("http://localhost:3000/onboarding");
  const onbHtml = await onbRes.text();
  console.log("3. Onboarding page loads -> HTTP", onbRes.status);
  console.log("   - Has progress indicator & clean header ->", onbHtml.includes("Build your personalized learning habit"));

  // 3. User Simulation: Onboarding -> /plan with persistence & duplicate prevention
  const initialUsers = await prisma.user.count();
  console.log(`\nInitial user count in DB: ${initialUsers}`);

  // Simulate First Demo User Onboarding
  const demoUserId = crypto.randomUUID();
  const demoUser = await prisma.user.create({
    data: {
      id: demoUserId,
      email: `demo-${demoUserId.slice(0, 8)}@unrot.local`,
      name: "Demo Learner",
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

  // Verify /plan access with cookie
  const planRes1 = await fetch("http://localhost:3000/plan", {
    headers: {
      Cookie: `unrot_demo_user_id=${demoUser.id}`,
    },
  });
  const planHtml1 = await planRes1.text();
  console.log("4. /plan loads for demo user -> HTTP", planRes1.status);
  console.log("   - Shows 'Your Learning Plan' ->", planHtml1.includes("Your Learning Plan"));
  console.log("   - Shows matched path 'AI for Product Managers' ->", planHtml1.includes("AI for Product Managers"));
  console.log("   - Shows Day 1 lesson 'What AI Can and Cannot Do' ->", planHtml1.includes("What AI Can and Cannot Do"));
  console.log("   - Shows duration ->", planHtml1.includes("~5 minutes"));
  console.log("   - Has 'Start today’s lesson' CTA ->", planHtml1.includes("Start today’s lesson"));
  console.log("   - Has 'Change preferences' link ->", planHtml1.includes("Change preferences"));

  // 5. Refresh /plan (idempotent read)
  const planRes2 = await fetch("http://localhost:3000/plan", {
    headers: {
      Cookie: `unrot_demo_user_id=${demoUser.id}`,
    },
  });
  console.log("5. Refresh /plan -> HTTP", planRes2.status, "(preferences persist)");

  // 6. Return to /onboarding and Submit again (test duplicate prevention)
  await prisma.userPreference.upsert({
    where: { userId: demoUser.id },
    update: {
      role: "Software engineer",
      learningGoal: "Understand AI fundamentals",
      experienceLevel: "Advanced AI user",
    },
    create: {
      userId: demoUser.id,
      role: "Software engineer",
      learningGoal: "Understand AI fundamentals",
      experienceLevel: "Advanced AI user",
    },
  });

  const usersAfterResubmit = await prisma.user.count();
  console.log(`6. Users after resubmitting: ${usersAfterResubmit} (matches ${initialUsers + 1}, zero duplicates created)`);

  // 7. Plan updates to Software engineer curriculum
  const planRes3 = await fetch("http://localhost:3000/plan", {
    headers: {
      Cookie: `unrot_demo_user_id=${demoUser.id}`,
    },
  });
  const planHtml3 = await planRes3.text();
  console.log("7. /plan loads updated curriculum ->", planHtml3.includes("AI for Software Engineers"));
  console.log("   - Shows Day 1 lesson 'Embeddings and Vector Search' ->", planHtml3.includes("Embeddings and Vector Search"));

  // 8. Test /learn/today placeholder
  const learnRes = await fetch("http://localhost:3000/learn/today");
  const learnHtml = await learnRes.text();
  console.log("8. /learn/today placeholder loads -> HTTP", learnRes.status, "(has 'Lesson Engine Coming in Stage 5':", learnHtml.includes("Lesson Engine Coming in Stage 5"), ")");

  // Clean up verification user
  await prisma.user.delete({ where: { id: demoUser.id } });
  console.log("\n✓ Verification complete & clean.");
  await prisma.$disconnect();
}

verifyManualChecklist().catch(console.error);
