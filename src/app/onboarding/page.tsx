import type { Metadata } from "next";
import { AppHeader } from "@/components/navigation/AppHeader";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { OnboardingForm } from "./OnboardingForm";

export const metadata: Metadata = {
  title: "Calibrate Habit | Unrot Daily",
  description: "Personalize your 5-minute daily AI review path.",
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text font-sans">
      <AppHeader currentPath="/onboarding" showDashboardLink={false} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-14">
        <div className="w-full max-w-xl text-center mb-6 sm:mb-8 space-y-2">
          <Badge variant="primary" dot className="mx-auto mb-1">
            5-Minute Habit Calibration
          </Badge>
          <PageHeader
            title="Design your retention path"
            subtitle="Answer three quick questions to generate a focused 5-day curriculum matched to your work."
            className="text-center"
          />
        </div>

        <OnboardingForm />
      </main>
    </div>
  );
}