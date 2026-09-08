"use client";

import { useSyncExternalStore } from "react";

function subscribeToTheme(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const observer = new MutationObserver(() => callback());
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleMediaChange = (e: MediaQueryListEvent) => {
    if (!localStorage.getItem("theme")) {
      document.documentElement.classList.toggle("dark", e.matches);
      callback();
    }
  };

  mediaQuery.addEventListener("change", handleMediaChange);

  return () => {
    observer.disconnect();
    mediaQuery.removeEventListener("change", handleMediaChange);
  };
}

function getThemeSnapshot(): boolean {
  return document.documentElement.classList.contains("dark");
}

function getThemeServerSnapshot(): boolean {
  return false;
}

function subscribeToMounted(): () => void {
  return () => {};
}

function getMountedClientSnapshot(): boolean {
  return true;
}

function getMountedServerSnapshot(): boolean {
  return false;
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const mounted = useSyncExternalStore(
    subscribeToMounted,
    getMountedClientSnapshot,
    getMountedServerSnapshot
  );

  const isDark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  const toggleTheme = () => {
    const isDarkNow = document.documentElement.classList.contains("dark");
    const nextDark = !isDarkNow;
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Render a placeholder button during SSR to prevent layout shift
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle color theme"
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors opacity-70 ${className}`}
        disabled
      >
        <span className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text hover:bg-border/40 hover:text-text transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shadow-xs ${className}`}
    >
      {isDark ? (
        // Sun Icon
        <svg
          className="h-4 w-4 text-accent"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Moon Icon
        <svg
          className="h-4 w-4 text-muted hover:text-text transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
