/**
 * Safe JSON serialization and parsing helpers for SQLite string-backed JSON fields.
 */

export function serializeJson<T>(value: T): string {
  return JSON.stringify(value);
}

export function parseJson<T = unknown>(value: string, fallback?: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error("Failed to parse JSON string");
  }
}
