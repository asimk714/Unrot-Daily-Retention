import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { onboardingSchema } from "../src/lib/validation";
import { matchLearningPath } from "../src/lib/learning-path";
import { prisma } from "../src/lib/prisma";
import { serializeJson, parseJson } from "../src/lib/json";

describe("Stage 4 Onboarding & Path Selection Tests", () => {
  describe("1. Allowlist Validation", () => {
    it("should accept valid combinations of role, goal, and experience", () => {
      const validPayload = {
        role: "Product manager",
        learningGoal: "Use AI more effectively at work",
        experienceLevel: "Comfortable with AI tools",
      };
      const result = onboardingSchema.safeParse(validPayload);
      assert.equal(result.success, true);
    });

    it("should reject unlisted roles", () => {
      const invalidPayload = {
        role: "Chef",
        learningGoal: "Use AI more effectively at work",
        experienceLevel: "Comfortable with AI tools",
      };
      const result = onboardingSchema.safeParse(invalidPayload);
      assert.equal(result.success, false);
    });

    it("should reject unlisted learning goals", () => {
      const invalidPayload = {
        role: "Product manager",
        learningGoal: "Become an astronaut",
        experienceLevel: "Comfortable with AI tools",
      };
      const result = onboardingSchema.safeParse(invalidPayload);
      assert.equal(result.success, false);
    });

    it("should reject unlisted experience levels", () => {
      const invalidPayload = {
        role: "Product manager",
        learningGoal: "Use AI more effectively at work",
        experienceLevel: "Supreme Master",
      };
      const result = onboardingSchema.safeParse(invalidPayload);
      assert.equal(result.success, false);
    });
  });

  describe("2. Deterministic Learning Path Matching", () => {
    it("should match Product Manager to AI for Product Managers", async () => {
      const path = await matchLearningPath(
        "Product manager",
        "Use AI more effectively at work"
      );
      assert.ok(path, "Learning path should be found");
      assert.equal(path?.title, "AI for Product Managers");
      assert.equal(path?.lessons.length, 5);
      assert.equal(path?.lessons[0].dayNumber, 1);
    });

    it("should match Software Engineer to AI for Software Engineers", async () => {
      const path = await matchLearningPath(
        "Software engineer",
        "Understand AI fundamentals"
      );
      assert.ok(path, "Learning path should be found");
      assert.equal(path?.title, "AI for Software Engineers");
      assert.equal(path?.lessons.length, 5);
    });

    it("should match General / Other roles to AI for General Professionals", async () => {
      const path = await matchLearningPath(
        "Designer",
        "Keep up with AI news"
      );
      assert.ok(path, "Learning path should be found");
      assert.equal(path?.title, "AI for General Professionals");
      assert.equal(path?.lessons.length, 5);
    });

    it("should fallback deterministically when an unmatched goal is provided", async () => {
      const path = await matchLearningPath(
        "Student",
        "Learn prompt engineering"
      );
      assert.ok(path, "Fallback learning path should be returned");
      assert.ok(path?.lessons.length > 0, "Fallback path must include lessons");
    });
  });

  describe("3. Analytics Property Serialization", () => {
    it("should serialize and deserialize JSON properties safely", () => {
      const properties = { role: "Software engineer", goal: "AI news", step: 3 };
      const serialized = serializeJson(properties);
      assert.equal(typeof serialized, "string");

      const deserialized = parseJson(serialized);
      assert.deepEqual(deserialized, properties);
    });

    it("should store valid JSON in AnalyticsEvent propertiesJson column", async () => {
      const event = await prisma.analyticsEvent.create({
        data: {
          eventName: "test_event",
          propertiesJson: serializeJson({ testKey: "testValue", timestamp: 12345 }),
          route: "/test",
        },
      });

      assert.ok(event.id);
      const parsed = parseJson(event.propertiesJson);
      assert.deepEqual(parsed, { testKey: "testValue", timestamp: 12345 });

      // Clean up test event
      await prisma.analyticsEvent.delete({ where: { id: event.id } });
    });
  });

  describe("4. Duplicate User & Preference Persistence Prevention", () => {
    it("should upsert preferences without creating duplicate users", async () => {
      const testEmail = `test-user-${Date.now()}@unrot.local`;
      const user = await prisma.user.create({
        data: {
          email: testEmail,
          name: "Test Learner",
        },
      });

      // First submission
      await prisma.userPreference.upsert({
        where: { userId: user.id },
        update: { role: "Product manager", learningGoal: "Goal 1", experienceLevel: "New to AI" },
        create: { userId: user.id, role: "Product manager", learningGoal: "Goal 1", experienceLevel: "New to AI" },
      });

      // Second submission for same user
      await prisma.userPreference.upsert({
        where: { userId: user.id },
        update: { role: "Software engineer", learningGoal: "Goal 2", experienceLevel: "Advanced AI user" },
        create: { userId: user.id, role: "Software engineer", learningGoal: "Goal 2", experienceLevel: "Advanced AI user" },
      });

      // Verify user count is still 1 for this email
      const userCount = await prisma.user.count({ where: { id: user.id } });
      assert.equal(userCount, 1);

      // Verify preference updated
      const pref = await prisma.userPreference.findUnique({ where: { userId: user.id } });
      assert.equal(pref?.role, "Software engineer");
      assert.equal(pref?.learningGoal, "Goal 2");

      // Cleanup test user (cascades to preference)
      await prisma.user.delete({ where: { id: user.id } });
    });
  });
});
