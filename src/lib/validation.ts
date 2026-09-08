import { z } from "zod";

export const ALLOWED_ROLES = [
  "Product manager",
  "Software engineer",
  "Designer",
  "Marketing or sales",
  "Student",
  "Other",
] as const;

export const ALLOWED_GOALS = [
  "Use AI more effectively at work",
  "Understand AI fundamentals",
  "Prepare for AI interviews",
  "Learn prompt engineering",
  "Keep up with AI news",
] as const;

export const ALLOWED_EXPERIENCES = [
  "New to AI",
  "Comfortable with AI tools",
  "Advanced AI user",
] as const;

export type AllowedRole = (typeof ALLOWED_ROLES)[number];
export type AllowedGoal = (typeof ALLOWED_GOALS)[number];
export type AllowedExperience = (typeof ALLOWED_EXPERIENCES)[number];

export const onboardingSchema = z.object({
  role: z.enum(ALLOWED_ROLES, {
    error: "Please select a valid role from the list.",
  }),
  learningGoal: z.enum(ALLOWED_GOALS, {
    error: "Please select a valid learning goal from the list.",
  }),
  experienceLevel: z.enum(ALLOWED_EXPERIENCES, {
    error: "Please select a valid experience level from the list.",
  }),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
