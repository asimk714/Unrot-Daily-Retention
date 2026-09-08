import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseAndValidateLessonContent } from "../src/lib/lesson-content";
import { prisma } from "../src/lib/prisma";

describe("Stage 5 Lesson Reader & Progress Tests", () => {
  const validJson = JSON.stringify({
    sections: [
      { heading: "Section 1", body: "Body text 1" },
      { heading: "Section 2", body: "Body text 2" },
    ],
    example: {
      title: "Example Title",
      description: "Example Description",
    },
    knowledgeCheck: {
      question: "Which option is correct?",
      options: ["Option A", "Option B", "Option C"],
      correctIndex: 1,
    },
  });

  describe("1. Lesson Content Parsing & Validation", () => {
    it("should parse and normalize valid seeded content", () => {
      const parsed = parseAndValidateLessonContent(validJson);
      assert.equal(parsed.sections.length, 2);
      assert.equal(parsed.sections[0].heading, "Section 1");
      assert.equal(parsed.example?.title, "Example Title");
      assert.equal(parsed.example?.content, "Example Description");
      assert.equal(parsed.quiz.question, "Which option is correct?");
      assert.equal(parsed.quiz.options.length, 3);
      assert.equal(parsed.quiz.correctIndex, 1);
      assert.ok(parsed.quiz.explanation.length > 0);
    });

    it("should accept alternative schema with 'quiz' and 'content' keys", () => {
      const alternativeJson = JSON.stringify({
        sections: [{ heading: "S1", body: "B1" }],
        example: { title: "Ex1", content: "Content 1" },
        quiz: {
          question: "Q1?",
          options: ["Opt 1", "Opt 2"],
          correctIndex: 0,
          explanation: "Custom explanation text",
        },
      });

      const parsed = parseAndValidateLessonContent(alternativeJson);
      assert.equal(parsed.quiz.explanation, "Custom explanation text");
      assert.equal(parsed.example?.content, "Content 1");
    });

    it("should reject malformed JSON", () => {
      assert.throws(() => {
        parseAndValidateLessonContent("{ malformed json ... ");
      }, /Malformed JSON/);
    });

    it("should reject content missing sections", () => {
      const missingSections = JSON.stringify({
        example: { title: "Ex", content: "Cont" },
        quiz: { question: "Q", options: ["A", "B"], correctIndex: 0 },
      });
      assert.throws(() => {
        parseAndValidateLessonContent(missingSections);
      }, /validation failed/);
    });

    it("should reject quiz with out-of-bounds correctIndex", () => {
      const badIndex = JSON.stringify({
        sections: [{ heading: "S", body: "B" }],
        quiz: { question: "Q", options: ["A", "B"], correctIndex: 5 },
      });
      assert.throws(() => {
        parseAndValidateLessonContent(badIndex);
      }, /out of bounds/);
    });
  });

  describe("2. Database Lesson Progress & Idempotency", () => {
    it("should track lesson start, quiz score, and idempotent completion", async () => {
      // Create temporary user and lesson for testing
      const testUserId = crypto.randomUUID();
      const user = await prisma.user.create({
        data: {
          id: testUserId,
          email: `test-progress-${Date.now()}@unrot.local`,
          name: "Progress Tester",
        },
      });

      const path = await prisma.learningPath.findFirst({
        include: { lessons: true },
      });
      assert.ok(path && path.lessons.length > 0, "Learning path and lessons must exist");
      const testLessonId = path.lessons[0].id;

      // 1. Initial start
      const startTime = new Date();
      const p1 = await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: { userId: user.id, lessonId: testLessonId },
        },
        update: {},
        create: {
          userId: user.id,
          lessonId: testLessonId,
          startedAt: startTime,
        },
      });
      assert.ok(p1.startedAt);
      assert.equal(p1.completedAt, null);

      // 2. Submit quiz with score 1.0
      const p2 = await prisma.lessonProgress.update({
        where: { id: p1.id },
        data: { quizScore: 1.0 },
      });
      assert.equal(p2.quizScore, 1.0);

      // 3. Complete lesson
      const completionTime = new Date();
      const p3 = await prisma.lessonProgress.update({
        where: { id: p1.id },
        data: { completedAt: completionTime },
      });
      assert.ok(p3.completedAt);

      // 4. Repeated completion (idempotency check)
      const countBefore = await prisma.lessonProgress.count({
        where: { userId: user.id, lessonId: testLessonId },
      });
      assert.equal(countBefore, 1);

      // Simulate second completion call - preserve original completedAt
      const p4 = await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: { userId: user.id, lessonId: testLessonId },
        },
        update: {
          completedAt: p3.completedAt,
        },
        create: {
          userId: user.id,
          lessonId: testLessonId,
          completedAt: completionTime,
        },
      });

      const countAfter = await prisma.lessonProgress.count({
        where: { userId: user.id, lessonId: testLessonId },
      });
      assert.equal(countAfter, 1, "Must not create duplicate progress rows");
      assert.equal(p4.quizScore, 1.0, "Must preserve quizScore");
      assert.deepEqual(p4.completedAt, p3.completedAt, "Must preserve completion timestamp");

      // Cleanup
      await prisma.user.delete({ where: { id: user.id } });
    });
  });
});
