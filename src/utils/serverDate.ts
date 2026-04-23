/**
 * Parse an ISO-ish timestamp string as UTC.
 *
 * Our backend sometimes emits DateTime strings without a trailing "Z"
 * (e.g. "2026-04-23T03:51:06.10742"). The browser defaults to treating
 * those as LOCAL time, which shifts them by the user's UTC offset and
 * breaks any timestamp comparison. This helper appends "Z" when missing
 * so the browser interprets the value as UTC.
 *
 * Safe on strings that already end in "Z" or have an explicit offset.
 */
export function parseServerDate(raw: string | null | undefined): Date | null {
  if (!raw) return null
  // Already has a timezone: Z, +HH:MM, or -HH:MM near the end
  if (/Z$|[+\-]\d{2}:\d{2}$/.test(raw)) return new Date(raw)
  // Otherwise assume UTC
  return new Date(raw + "Z")
}

/** Convenience — returns epoch ms, or 0 if unparseable. */
export function serverDateToMs(raw: string | null | undefined): number {
  const d = parseServerDate(raw)
  return d ? d.getTime() : 0
}
