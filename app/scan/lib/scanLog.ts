/**
 * Diagnostic logging for the post-detection product lookup waterfall.
 *
 * LOGGING ONLY — these helpers never alter control flow, return values, or
 * timing. Every line is prefixed with [GORILLA SCAN] so the full waterfall is
 * filterable in the browser console.
 */

export const SCAN_LOG_PREFIX = "[GORILLA SCAN]";

export function scanLog(...args: unknown[]): void {
  console.log(SCAN_LOG_PREFIX, ...args);
}

export function scanWarn(...args: unknown[]): void {
  console.warn(SCAN_LOG_PREFIX, ...args);
}

/** Milliseconds elapsed since a performance.now() mark, rounded to an integer. */
export function sinceMs(start: number): number {
  return Math.round(performance.now() - start);
}

/**
 * Describes a fetch failure: distinguishes an AbortSignal.timeout() firing
 * ("TIMEOUT") from a genuine network/other error ("ERROR: <message>").
 */
export function describeFetchError(err: unknown): string {
  if (err instanceof DOMException && (err.name === "TimeoutError" || err.name === "AbortError")) {
    return "TIMEOUT";
  }
  if (err instanceof Error) return `ERROR: ${err.message}`;
  return `ERROR: ${String(err)}`;
}
