import { z } from "zod";

export const rawSectionSchema = z.object({
  heading: z.string().min(1, "Section heading cannot be empty"),
  body: z.string().min(1, "Section body cannot be empty"),
});

export const rawExampleSchema = z
  .object({
    title: z.string().min(1, "Example title cannot be empty"),
    content: z.string().optional(),
    description: z.string().optional(),
  })
  .refine((data) => !!(data.content || data.description), {
    message: "Example must contain either content or description",
  });

export const rawQuizSchema = z.object({
  question: z.string().min(1, "Quiz question cannot be empty"),
  options: z.array(z.string().min(1)).min(2, "Quiz must contain at least two options"),
  correctIndex: z.number().int().min(0, "correctIndex must be non-negative"),
  explanation: z.string().optional(),
});

export const rawLessonContentSchema = z.object({
  sections: z.array(rawSectionSchema).min(1, "Lesson must have at least one section"),
  example: rawExampleSchema.optional(),
  quiz: rawQuizSchema.optional(),
  knowledgeCheck: rawQuizSchema.optional(),
  action: z.string().optional(),
});

export interface NormalizedSection {
  heading: string;
  body: string;
}

export interface NormalizedExample {
  title: string;
  content: string;
}

export interface NormalizedQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface NormalizedLessonContent {
  sections: NormalizedSection[];
  example?: NormalizedExample;
  quiz: NormalizedQuiz;
  action?: string;
}

/**
 * Parses and strictly validates raw contentJson from the database into a normalized format.
 * Accommodates both 'quiz' and 'knowledgeCheck', and 'example.content' vs 'example.description'.
 */
export function parseAndValidateLessonContent(rawJson: string): NormalizedLessonContent {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    throw new Error(
      `Malformed JSON in lesson content: ${err instanceof Error ? err.message : "Parse error"}`
    );
  }

  const result = rawLessonContentSchema.safeParse(parsed);
  if (!result.success) {
    const firstIssue = result.error.issues[0]?.message ?? "Invalid lesson schema";
    throw new Error(`Lesson content schema validation failed: ${firstIssue}`);
  }

  const data = result.data;
  const rawQuiz = data.quiz || data.knowledgeCheck;
  if (!rawQuiz) {
    throw new Error("Lesson content must specify either 'quiz' or 'knowledgeCheck'");
  }

  if (rawQuiz.correctIndex >= rawQuiz.options.length) {
    throw new Error(
      `Quiz correctIndex (${rawQuiz.correctIndex}) is out of bounds for options length (${rawQuiz.options.length})`
    );
  }

  const exampleText = data.example?.content || data.example?.description || "";
  const example: NormalizedExample | undefined = data.example
    ? {
        title: data.example.title,
        content: exampleText,
      }
    : undefined;

  const defaultExplanation = `Correct! "${rawQuiz.options[rawQuiz.correctIndex]}" is the correct concept covered in this lesson.`;

  return {
    sections: data.sections,
    example,
    quiz: {
      question: rawQuiz.question,
      options: rawQuiz.options,
      correctIndex: rawQuiz.correctIndex,
      explanation: rawQuiz.explanation || defaultExplanation,
    },
    action: data.action,
  };
}
