import type { Metadata } from "next";
import { AppHeader } from "@/components/navigation/AppHeader";
import { OnboardingForm } from "./OnboardingForm";

export const metadata: Metadata = {
  title: "Get Started | Unrot Daily",
  description: "Personalize your 5-minute daily AI review path.",
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <AppHeader currentPath="/onboarding" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-xl text-center mb-6 sm:mb-8">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-2">
            5-Minute Daily Habit
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text mb-2">
            Build your personalized learning habit
          </h1>
          <p className="text-sm sm:text-base text-muted">
            Answer three quick questions to calibrate your daily review path.
          </p>
        </div>

        <OnboardingForm />
      </main>
    </div>
  );
}
