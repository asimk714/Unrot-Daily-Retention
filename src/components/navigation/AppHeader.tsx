import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { logOutAction } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/Button";

interface AppHeaderProps {
  currentPath?: string;
  showDashboardLink?: boolean;
  showPlanLink?: boolean;
  showAnalyticsLink?: boolean;
}

export async function AppHeader({
  currentPath = "/",
  showDashboardLink = true,
  showPlanLink = true,
  showAnalyticsLink = true,
}: AppHeaderProps) {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-surface/90 backdrop-blur-md transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-xl px-1.5 py-1 -ml-1.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white font-bold text-xs shadow-xs shadow-primary/30 group-hover:bg-primary-hover transition-colors">
            U
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-text group-hover:text-primary transition-colors">
              Unrot Daily
            </span>
            <span className="hidden sm:inline-flex text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-border-subtle text-muted border border-border">
              MVP
            </span>
          </div>
        </Link>

        {/* Right Navigation, User Controls & Theme */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="flex items-center gap-1 sm:gap-1.5">
            {user && showDashboardLink && (
              <Link
                href="/home"
                className={`text-xs sm:text-sm font-medium px-3 py-1.5 rounded-xl transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                  currentPath === "/home"
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-muted hover:text-text hover:bg-border-subtle"
                }`}
              >
                Dashboard
              </Link>
            )}

            {user && showPlanLink && (
              <Link
                href="/plan"
                className={`text-xs sm:text-sm font-medium px-3 py-1.5 rounded-xl transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                  currentPath === "/plan"
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-muted hover:text-text hover:bg-border-subtle"
                }`}
              >
                Plan
              </Link>
            )}

            {showAnalyticsLink && (
              <Link
                href="/analytics"
                className={`text-xs sm:text-sm font-medium px-3 py-1.5 rounded-xl transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                  currentPath === "/analytics"
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-muted hover:text-text hover:bg-border-subtle"
                }`}
              >
                Analytics
              </Link>
            )}
          </nav>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* User Authentication Status */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-block text-xs font-medium text-muted truncate max-w-[140px]">
                {user.name || user.email}
              </span>
              <form action={logOutAction}>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 px-2.5"
                >
                  Log out
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {currentPath !== "/login" && (
                <Link
                  href="/login"
                  className="text-xs font-semibold text-muted hover:text-text px-2.5 py-1.5 rounded-xl transition-colors"
                >
                  Sign in
                </Link>
              )}
              {currentPath !== "/signup" && (
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center text-xs font-semibold bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                >
                  Sign up
                </Link>
              )}
            </div>
          )}

          <div className="h-4 w-px bg-border" />

          {/* Theme Toggle Button */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}