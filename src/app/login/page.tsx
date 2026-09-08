import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AppHeader } from "@/components/navigation/AppHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In | Unrot Daily",
  description: "Sign in to resume your daily knowledge retention habit.",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/home");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-text font-sans">
      <AppHeader currentPath="/login" showDashboardLink={false} showPlanLink={false} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <Badge variant="primary" dot className="mx-auto mb-1">
              5-Minute Retention Habit
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              Sign in to resume your personalized daily review sessions.
            </p>
          </div>

          <Card variant="default" className="p-2 sm:p-4">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold">Account Login</CardTitle>
              <CardDescription>
                Enter your credentials to access your syllabus and streak.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}