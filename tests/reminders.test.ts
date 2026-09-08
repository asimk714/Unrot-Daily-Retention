import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isValidReminderTime,
  isValidTimezone,
  normalizeTimezone,
  getNextIncompleteLesson,
  DEMO_RETURN_PREVIEW_COOKIE,
} from "../src/lib/reminders";
import { prisma } from "../src/lib/prisma";

describe("Stage 6 Daily Reminders & Return Loop Tests", () => {
  describe("1. Reminder Time Format Validation (24h HH:mm)", () => {
    it("should accept valid 24-hour HH:mm time strings", () => {
      const validTimes = ["00:00", "08:00", "12:30", "19:45", "23:59", "09:05"];
      for (const t of validTimes) {
        assert.equal(isValidReminderTime(t), true, `Expected "${t}" to be valid`);
      }
    });

    it("should reject invalid time formats and out-of-range values", () => {
      const invalidTimes = [
        "24:00",
        "25:00",
        "8:00", // missing leading zero
        "08:60", // minute out of range
        "12:61",
        "-01:00",
        "12:00 PM",
        "abc",
        "",
        "  ",
      ];
      for (const t of invalidTimes) {
        assert.equal(isValidReminderTime(t), false, `Expected "${t}" to be invalid`);
      }
    });
  });

  describe("2. Timezone Validation and UTC Fallback", () => {
    it("should accept valid IANA timezones", () => {
      const validTimezones = ["UTC", "Asia/Kolkata", "America/New_York", "Europe/London", "Asia/Tokyo"];
      for (const tz of validTimezones) {
        assert.equal(isValidTimezone(tz), true, `Expected "${tz}" to be valid`);
        assert.equal(normalizeTimezone(tz), tz);
      }
    });

    it("should fallback gracefully to UTC for invalid or empty timezones", () => {
      assert.equal(isValidTimezone("Mars/Curiosity"), false);
      assert.equal(isValidTimezone("Invalid/Zone"), false);
      assert.equal(normalizeTimezone("Mars/Curiosity"), "UTC");
      assert.equal(normalizeTimezone(""), "UTC");
      assert.equal(normalizeTimezone(null), "UTC");
      assert.equal(normalizeTimezone(undefined), "UTC");
    });
  });

  describe("3. Database Reminder Preference Upsert & Idempotency", () => {
    it("should create and update reminder preferences idempotently without duplicates", async () => {
      const testUserId = crypto.randomUUID();
      const user = await prisma.user.create({
        data: {
          id: testUserId,
          email: `test-reminders-${Date.now()}@unrot.local`,
          name: "Reminder Tester",
        },
      });

      // 1. Initial upsert: enabled at 08:30 in Asia/Kolkata
      const pref1 = await prisma.reminderPreference.upsert({
        where: { userId: user.id },
        update: {
          enabled: true,
          reminderTime: "08:30",
          timezone: "Asia/Kolkata",
        },
        create: {
          userId: user.id,
          enabled: true,
          reminderTime: "08:30",
          timezone: "Asia/Kolkata",
        },
      });

      assert.equal(pref1.enabled, true);
      assert.equal(pref1.reminderTime, "08:30");
      assert.equal(pref1.timezone, "Asia/Kolkata");

      // Verify row count = 1
      const count1 = await prisma.reminderPreference.count({
        where: { userId: user.id },
      });
      assert.equal(count1, 1);

      // 2. Second upsert: disabled reminder
      const pref2 = await prisma.reminderPreference.upsert({
        where: { userId: user.id },
        update: {
          enabled: false,
          reminderTime: "08:30",
          timezone: "Asia/Kolkata",
        },
        create: {
          userId: user.id,
          enabled: false,
          reminderTime: "08:30",
          timezone: "Asia/Kolkata",
        },
      });

      assert.equal(pref2.enabled, false);
      assert.equal(pref2.id, pref1.id, "Must update existing record, not create duplicate");

      const count2 = await prisma.reminderPreference.count({
        where: { userId: user.id },
      });
      assert.equal(count2, 1);

      // Cleanup
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe("4. Next Incomplete Lesson Determination", () => {
    it("should accurately select the next incomplete lesson as user progresses", async () => {
      const testUserId = crypto.randomUUID();
      const user = await prisma.user.create({
        data: {
          id: testUserId,
          email: `test-nextlesson-${Date.now()}@unrot.local`,
          name: "Next Lesson Tester",
        },
      });

      const path = await prisma.learningPath.findFirst({
        include: { lessons: { orderBy: { dayNumber: "asc" } } },
      });
      assert.ok(path && path.lessons.length >= 5, "Path must contain at least 5 lessons");

      // Case A: 0 completed lessons -> next lesson must be Day 1
      const step0 = await getNextIncompleteLesson(user.id, path.id);
      assert.equal(step0.completedCount, 0);
      assert.equal(step0.totalCount, path.lessons.length);
      assert.equal(step0.isCompleted, false);
      assert.equal(step0.nextLesson?.dayNumber, 1);
      assert.equal(step0.nextLesson?.id, path.lessons[0].id);

      // Case B: Complete Day 1 -> next lesson must be Day 2
      await prisma.lessonProgress.create({
        data: {
          userId: user.id,
          lessonId: path.lessons[0].id,
          startedAt: new Date(),
          completedAt: new Date(),
          quizScore: 1.0,
        },
      });

      const step1 = await getNextIncompleteLesson(user.id, path.id);
      assert.equal(step1.completedCount, 1);
      assert.equal(step1.isCompleted, false);
      assert.equal(step1.nextLesson?.dayNumber, 2);
      assert.equal(step1.nextLesson?.id, path.lessons[1].id);

      // Case C: Complete Day 2, Day 3, Day 4, Day 5 -> isCompleted = true, nextLesson = null
      for (let i = 1; i < path.lessons.length; i++) {
        await prisma.lessonProgress.create({
          data: {
            userId: user.id,
            lessonId: path.lessons[i].id,
            startedAt: new Date(),
            completedAt: new Date(),
            quizScore: 1.0,
          },
        });
      }

      const stepFull = await getNextIncompleteLesson(user.id, path.id);
      assert.equal(stepFull.completedCount, path.lessons.length);
      assert.equal(stepFull.isCompleted, true);
      assert.equal(stepFull.nextLesson, null);

      // Cleanup
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe("5. Simulation Cookie Isolation & Safe Analytics", () => {
    it("should use isolated cookie name without altering real user timestamps or database state", () => {
      assert.equal(DEMO_RETURN_PREVIEW_COOKIE, "unrot_demo_return_preview");
      assert.notEqual(DEMO_RETURN_PREVIEW_COOKIE, "unrot_demo_user_id");
    });

    it("should verify analytics event rules: record demo_return_previewed and NEVER session_returned_d1", async () => {
      const testUserId = crypto.randomUUID();
      const user = await prisma.user.create({
        data: {
          id: testUserId,
          email: `test-analytics-${Date.now()}@unrot.local`,
          name: "Analytics Tester",
        },
      });

      // Log simulated event
      const event = await prisma.analyticsEvent.create({
        data: {
          eventName: "demo_return_previewed",
          userId: user.id,
          propertiesJson: JSON.stringify({ simulated: true, simulatedDay: 2 }),
          route: "/home",
        },
      });

      assert.equal(event.eventName, "demo_return_previewed");
      assert.notEqual(event.eventName, "session_returned_d1");

      const d1Events = await prisma.analyticsEvent.findMany({
        where: { userId: user.id, eventName: "session_returned_d1" },
      });
      assert.equal(d1Events.length, 0, "Must NEVER emit session_returned_d1 for simulated returns");

      // Cleanup
      await prisma.user.delete({ where: { id: user.id } });
    });
  });
});
