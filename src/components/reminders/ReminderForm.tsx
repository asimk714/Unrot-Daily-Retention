"use client";

import { useState, useTransition, useSyncExternalStore } from "react";
import { saveReminderPreferenceAction } from "@/app/reminders/actions";

interface ReminderFormProps {
  initialEnabled?: boolean;
  initialTime?: string;
  initialTimezone?: string;
}

function getTimezoneClientSnapshot(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function getServerSnapshot(): string {
  return "UTC";
}

function subscribeToTimezone(): () => void {
  return () => {};
}

export function ReminderForm({
  initialEnabled = true,
  initialTime = "08:00",
  initialTimezone = "UTC",
}: ReminderFormProps) {
  const [isPending, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [reminderTime, setReminderTime] = useState(initialTime);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Safely synchronize client timezone without cascading renders
  const detectedTimezone = useSyncExternalStore(
    subscribeToTimezone,
    getTimezoneClientSnapshot,
    getServerSnapshot
  );

  const effectiveTimezone = detectedTimezone || initialTimezone;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    const formData = new FormData();
    formData.set("enabled", enabled ? "true" : "false");
    formData.set("reminderTime", reminderTime);
    formData.set("timezone", effectiveTimezone);

    startTransition(async () => {
      const result = await saveReminderPreferenceAction(null, formData);
      if (result.success) {
        setStatusMessage(result.message ?? "Preferences updated.");
      } else {
        setErrorMessage(result.error ?? "Failed to update preferences.");
      }
    });
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span role="img" aria-label="Bell" className="text-lg">
              🔔
            </span>
            <h3 className="text-lg font-bold text-text">
              Daily Reminder Preferences
            </h3>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Stage 6 · Build your daily 5-minute learning habit
          </p>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            enabled
              ? "bg-success/10 text-success"
              : "bg-border text-muted"
          }`}
        >
          {enabled ? "Active" : "Paused"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Enabled Toggle */}
        <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-background border border-border">
          <label
            htmlFor="reminder-enabled"
            className="text-sm font-medium text-text cursor-pointer select-none"
          >
            Send me a daily morning reminder
            <span className="block text-xs font-normal text-muted mt-0.5">
              Reinforces next-day re-entry at your chosen study hour
            </span>
          </label>
          <input
            type="checkbox"
            id="reminder-enabled"
            name="enabled"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-5 w-5 rounded border-border accent-primary cursor-pointer focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Time input (shown when enabled) */}
        {enabled && (
          <div className="space-y-1.5 pt-1">
            <label
              htmlFor="reminder-time"
              className="block text-xs font-semibold uppercase tracking-wider text-muted"
            >
              Preferred Reminder Time (24h)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="time"
                id="reminder-time"
                name="reminderTime"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                required
                className="px-3.5 py-2.5 rounded-xl border border-border bg-background text-text font-mono text-base focus:outline-hidden focus:ring-2 focus:ring-primary w-36"
              />
              <div className="text-xs text-muted leading-tight">
                Timezone:{" "}
                <span className="font-semibold text-text">
                  {effectiveTimezone}
                </span>
                <span className="block text-muted/75 text-[11px]">
                  (auto-detected from device)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Live Status Message */}
        <div aria-live="polite" aria-atomic="true">
          {statusMessage && (
            <div className="p-3 rounded-xl bg-success/10 border border-success/30 text-text text-xs font-medium">
              ✓ {statusMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium">
              ✕ {errorMessage}
            </div>
          )}
        </div>

        {/* Prototype Disclosure Notice */}
        <div className="p-3 rounded-xl bg-background border border-dashed border-border text-[11px] text-muted leading-relaxed">
          <strong className="font-medium text-text">
            Prototype Disclosure:
          </strong>{" "}
          This prototype operates locally and does not deliver real email or
          push notifications. Preferences are stored in the local SQLite database
          to validate retention timing and user engagement patterns.
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {isPending ? "Saving..." : "Save Reminder Preferences"}
        </button>
      </form>
    </div>
  );
}
