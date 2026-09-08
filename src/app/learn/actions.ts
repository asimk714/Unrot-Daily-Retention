"use server";

import { redirect } from "next/navigation";
import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import { parseAndValidateLessonContent } from "@/lib/lesson-content";
import { recordEvent } from "@/lib/analytics";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface QuizSubmitResult {
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
}

/**
 * Marks a lesson as started for the active demo user if not already started.
 */
export async function startLessonAction(lessonId: string): Promise<ActionResult> {
  const user = await getDemoUser();
  if (!user) {
    return { success: false, error: "Demo user session not found." };
  }

  try {
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
    });

    const isFirstStart = !existingProgress || !existingProgress.startedAt;

    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
      update: {
        startedAt: existingProgress?.startedAt ?? new Date(),
      },
      create: {
        userId: user.id,
        lessonId,
        startedAt: new Date(),
      },
    });

    if (isFirstStart) {
      await recordEvent("lesson_started", user.id, { lessonId }, "/learn/today");
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { dayNumber: true },
      });
      if (lesson && lesson.dayNumber > 1) {
        await recordEvent(
          "next_lesson_started",
          user.id,
          { lessonId, dayNumber: lesson.dayNumber },
          "/learn/today"
        );
      }
    }

    return { success: true };
  } catch (err) {
    console.error("[startLessonAction] Error:", err instanceof Error ? err.message : "Unknown");
    return { success: false, error: "Failed to record lesson start." };
  }
}

/**
 * Records that a specific section of the lesson was displayed in the reader.
 */
export async function recordSectionViewedAction(
  lessonId: string,
  sectionIndex: number
): Promise<void> {
  const user = await getDemoUser();
  if (!user) return;

  await recordEvent(
    "lesson_section_viewed",
    user.id,
    { lessonId, sectionIndex },
    "/learn/today"
  );
}

/**
 * Records that the quiz section has been reached.
 */
export async function recordQuizStartedAction(lessonId: string): Promise<void> {
  const user = await getDemoUser();
  if (!user) return;

  await recordEvent("quiz_started", user.id, { lessonId }, "/learn/today");
}

/**
 * Validates and scores the user's selected quiz answer, persisting the score.
 */
export async function submitQuizAction(
  lessonId: string,
  selectedIndex: number
): Promise<ActionResult<QuizSubmitResult>> {
  const user = await getDemoUser();
  if (!user) {
    return { success: false, error: "Demo user session not found." };
  }

  // Validate that selectedIndex is a valid non-negative integer
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0) {
    return { success: false, error: "Invalid option selected." };
  }

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return { success: false, error: "Lesson not found." };
    }

    const content = parseAndValidateLessonContent(lesson.contentJson);
    const quiz = content.quiz;

    if (selectedIndex >= quiz.options.length) {
      return { success: false, error: "Selected answer is out of range." };
    }

    const isCorrect = selectedIndex === quiz.correctIndex;
    const score = isCorrect ? 1.0 : 0.0;

    // Persist score in LessonProgress
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
    });

    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
      update: {
        quizScore: score,
        startedAt: existingProgress?.startedAt ?? new Date(),
      },
      create: {
        userId: user.id,
        lessonId,
        quizScore: score,
        startedAt: new Date(),
      },
    });

    // Record analytics events
    await recordEvent(
      "quiz_answered",
      user.id,
      { lessonId, selectedIndex, isCorrect },
      "/learn/today"
    );
    await recordEvent(
      "quiz_completed",
      user.id,
      { lessonId, quizScore: score, isCorrect },
      "/learn/today"
    );

    return {
      success: true,
      data: {
        isCorrect,
        correctIndex: quiz.correctIndex,
        explanation: quiz.explanation,
      },
    };
  } catch (err) {
    console.error("[submitQuizAction] Error:", err instanceof Error ? err.message : "Unknown");
    return { success: false, error: "Failed to evaluate quiz answer." };
  }
}

/**
 * Idempotently marks a lesson as completed and navigates to /learn/complete.
 */
export async function completeLessonAction(lessonId: string): Promise<ActionResult> {
  const user = await getDemoUser();
  if (!user) {
    return { success: false, error: "Demo user session not found." };
  }

  try {
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
    });

    // Idempotent: preserve existing completedAt if already completed
    const completedAt = existingProgress?.completedAt ?? new Date();

    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
      update: {
        completedAt,
      },
      create: {
        userId: user.id,
        lessonId,
        startedAt: new Date(),
        completedAt,
      },
    });

    await recordEvent("lesson_completed", user.id, { lessonId }, "/learn/today");
  } catch (err) {
    console.error("[completeLessonAction] Error:", err instanceof Error ? err.message : "Unknown");
    return { success: false, error: "Failed to complete lesson." };
  }

  redirect("/learn/complete");
}
