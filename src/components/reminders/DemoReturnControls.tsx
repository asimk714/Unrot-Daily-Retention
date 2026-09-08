"use client";

import { useTransition } from "react";
import {
  activateDemoReturnPreviewAction,
  exitDemoReturnPreviewAction,
} from "@/app/reminders/actions";

/**
 * Trigger button to simulate next-day learner return.
 * Placed on /learn/complete.
 */
export function DemoReturnTriggerCard() {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-7 space-y-4 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-bold text-lg shadow-xs">
          ↻
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-text">
              Simulate Tomorrow&apos;s Return Loop
            </h3>
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
              Prototype Demo
            </span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Evaluate how a returning learner is greeted tomorrow, sees their updated progress, and resumes with Day 2—without modifying the system clock or database timestamps.
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => activateDemoReturnPreviewAction())}
        className="w-full py-3 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {isPending ? "Setting up return preview..." : "Preview Tomorrow's Experience →"}
      </button>

      <p className="text-[11px] text-muted text-center">
        Sets an isolated demo preview cookie (<code>unrot_demo_return_preview</code>). Emits <code>demo_return_previewed</code>.
      </p>
    </div>
  );
}

/**
 * Banner displayed on /home when simulation mode is active, with exit control.
 */
export function DemoReturnActiveBanner() {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/25 text-text px-4 py-3">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider bg-accent/20 text-accent px-2 py-0.5 rounded text-[10px]">
            Prototype demo
          </span>
          <span>
            Previewing tomorrow&apos;s learner return experience (Day 2 progression).
          </span>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => exitDemoReturnPreviewAction())}
          className="shrink-0 px-3 py-1 rounded-md bg-accent hover:bg-accent-hover text-white font-medium transition-colors cursor-pointer text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {isPending ? "Exiting..." : "Exit demo preview"}
        </button>
      </div>
    </div>
  );
}
