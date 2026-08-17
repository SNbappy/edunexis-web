/**
 * A greeting that fits the actual hour, across the whole 24-hour clock.
 *
 * The dashboard used three buckets — morning / afternoon / evening — so anyone
 * working at 2am was told "Good evening", which is the one time of day a person
 * definitely notices being addressed wrongly. Students submit at midnight and
 * teachers mark late; the small hours are a real part of this product's day.
 *
 * Each slot carries a few phrasings so the dashboard is not word-for-word
 * identical every time you open it, picked by the day of the month rather than
 * at random so it stays stable across a re-render.
 */

interface Slot {
  /** First hour of the slot, 0-23. Slots run to the next slot's `from`. */
  from: number
  greetings: string[]
}

const SLOTS: Slot[] = [
  // 00:00-04:59 — the small hours.
  {
    from: 0,
    greetings: ["Still up", "Burning the midnight oil", "Late night"],
  },
  // 05:00-07:59 — early.
  {
    from: 5,
    greetings: ["Early start", "Good morning", "Up with the sun"],
  },
  // 08:00-11:59 — morning proper.
  {
    from: 8,
    greetings: ["Good morning", "Morning"],
  },
  // 12:00-16:59 — afternoon.
  {
    from: 12,
    greetings: ["Good afternoon", "Afternoon"],
  },
  // 17:00-20:59 — evening.
  {
    from: 17,
    greetings: ["Good evening", "Evening"],
  },
  // 21:00-23:59 — night, but not yet the small hours.
  {
    from: 21,
    greetings: ["Working late", "Good evening", "Winding down"],
  },
]

/**
 * @param now  Injectable for tests — defaults to the current time.
 */
export function getGreeting(now: Date = new Date()): string {
  const hour = now.getHours()

  // Last slot whose start hour we have reached. SLOTS is ordered and starts
  // at 0, so this always matches.
  const slot = [...SLOTS].reverse().find(s => hour >= s.from) ?? SLOTS[0]

  // Vary by date, not Math.random: a greeting that changes on every re-render
  // reads as a glitch rather than a flourish.
  const index = now.getDate() % slot.greetings.length
  return slot.greetings[index]
}
