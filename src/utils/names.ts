/**
 * Person-name helpers.
 *
 * Academic names here routinely carry an honorific — "Dr. Taslima Rahman",
 * "Prof. Nurul Amin" — and naive splitting treats it as the first name. That
 * produced "Welcome, Dr." on the profile setup screen and "DT" instead of
 * "TR" on avatars. The same rule was being reimplemented per component, so
 * it lives here once.
 */

/** Honorifics that are not part of a person's name. */
const TITLES = /^(dr|prof|mr|mrs|ms|md|engr)\.?$/i

/** Name split into words, with any leading honorifics removed. */
function nameParts(fullName?: string | null): string[] {
  if (!fullName) return []
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  // Keep the honorific if it is the entire name, so "Dr" never becomes "".
  while (parts.length > 1 && TITLES.test(parts[0])) parts.shift()
  return parts
}

/**
 * First name for greetings. Falls back to `fallback` when there is no usable
 * name, so callers never render "Welcome, ".
 */
export function getFirstName(fullName?: string | null, fallback = "there"): string {
  return nameParts(fullName)[0] ?? fallback
}

/** Up to two initials, honorifics excluded. "Dr. Taslima Rahman" is TR. */
export function getInitials(fullName?: string | null, fallback = "?"): string {
  const parts = nameParts(fullName)
  if (parts.length === 0) return fallback
  return parts.map(p => p[0]).slice(0, 2).join("").toUpperCase()
}
