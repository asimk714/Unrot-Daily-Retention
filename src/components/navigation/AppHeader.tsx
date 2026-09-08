import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface AppHeaderProps {
  currentPath?: string;
  showDashboardLink?: boolean;
  showPlanLink?: boolean;
  showAnalyticsLink?: boolean;
}

export function AppHeader({
  currentPath = "/",
  showDashboardLink = true,
  showPlanLink = true,
  showAnalyticsLink = true,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-surface/90 backdrop-blur-md transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-1.5 py-1 -ml-1.5"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white font-bold text-xs shadow-xs group-hover:bg-primary-hover transition-colors">
            U
          </div>
          <span className="text-base font-bold tracking-tight text-text group-hover:text-primary transition-colors">
            Unrot Daily
          </span>
          <span className="hidden sm:inline-flex text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-border text-muted">
            Prototype
          </span>
        </Link>

        {/* Right Navigation & Theme Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="flex items-center gap-1 sm:gap-2">
            {showDashboardLink && (
              <Link
                href="/home"
                className={`text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded-md transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                  currentPath === "/home"
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-muted hover:text-text hover:bg-border/30"
                }`}
              >
                Dashboard
              </Link>
            )}

            {showPlanLink && (
              <Link
                href="/plan"
                className={`text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded-md transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                  currentPath === "/plan"
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-muted hover:text-text hover:bg-border/30"
                }`}
              >
                Plan
              </Link>
            )}

            {showAnalyticsLink && (
              <Link
                href="/analytics"
                className={`text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded-md transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                  currentPath === "/analytics"
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-muted hover:text-text hover:bg-border/30"
                }`}
              >
                Analytics
              </Link>
            )}
          </nav>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Theme Toggle Button */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
