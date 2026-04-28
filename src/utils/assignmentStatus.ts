import type { AssignmentDto } from "@/types/assignment.types"

export type DisplayKind =
  | "overdue-not-submitted"
  | "due-very-soon"
  | "due-soon"
  | "open-not-submitted"
  | "submitted-pending"
  | "graded"
  | "submitted-late"
  | "closed-missed"
  | "closed"
  | "active"
  | "needs-grading"
  | "fully-graded"
  | "closed-ungraded"

export type Tone = "red" | "amber" | "teal" | "stone" | "violet" | "emerald"

export interface AssignmentDisplay {
  kind:        DisplayKind
  tone:        Tone
  label:       string
  /** A short, human time-pressure phrase like "Due in 6h" / "Overdue 2d" / "Submitted". */
  detail:      string
  /** For sorting urgency cards: lower number = more urgent. */
  urgencyRank: number
}

const HOUR = 60 * 60 * 1000
const DAY  = 24 * HOUR

function formatDelta(ms: number, future: boolean): string {
  const abs = Math.abs(ms)
  if (abs < HOUR) {
    const m = Math.max(1, Math.round(abs / (60 * 1000)))
    return future ? "Due in " + m + "m" : "Overdue " + m + "m"
  }
  if (abs < DAY) {
    const h = Math.max(1, Math.round(abs / HOUR))
    return future ? "Due in " + h + "h" : "Overdue " + h + "h"
  }
  const d = Math.max(1, Math.round(abs / DAY))
  return future ? "Due in " + d + "d" : "Overdue " + d + "d"
}

/* Student view */
export function getStudentDisplay(a: AssignmentDto, now = Date.now()): AssignmentDisplay {
  const deadline = new Date(a.deadline).getTime()
  const delta    = deadline - now
  const isPastDue = delta < 0
  const status = a.myStatus ?? "NotSubmitted"

  if (status === "Graded") {
    return {
      kind:  "graded",
      tone:  "emerald",
      label: "Graded",
      detail: typeof a.myMarks === "number"
        ? a.myMarks + " / " + a.maxMarks
        : "Graded",
      urgencyRank: 90,
    }
  }

  if (status === "Submitted") {
    return {
      kind:  a.myIsLate ? "submitted-late" : "submitted-pending",
      tone:  a.myIsLate ? "amber" : "violet",
      label: a.myIsLate ? "Submitted late" : "Submitted",
      detail: "Awaiting grade",
      urgencyRank: 80,
    }
  }

  /* Not submitted */
  if (isPastDue) {
    if (a.allowLateSubmission && a.isOpen) {
      return {
        kind:  "overdue-not-submitted",
        tone:  "red",
        label: "Overdue",
        detail: formatDelta(delta, false) + " · Late ok",
        urgencyRank: 0,
      }
    }
    return {
      kind:  "closed-missed",
      tone:  "red",
      label: "Missed",
      detail: "Closed " + formatDelta(delta, false).replace("Overdue ", ""),
      urgencyRank: 70,
    }
  }

  if (delta < DAY) {
    return {
      kind:  "due-very-soon",
      tone:  "red",
      label: "Due today",
      detail: formatDelta(delta, true),
      urgencyRank: 5,
    }
  }
  if (delta < 3 * DAY) {
    return {
      kind:  "due-soon",
      tone:  "amber",
      label: "Due soon",
      detail: formatDelta(delta, true),
      urgencyRank: 15,
    }
  }
  return {
    kind:  "open-not-submitted",
    tone:  "teal",
    label: "Open",
    detail: formatDelta(delta, true),
    urgencyRank: 30,
  }
}

/* Teacher view */
export function getTeacherDisplay(a: AssignmentDto, now = Date.now()): AssignmentDisplay {
  const deadline = new Date(a.deadline).getTime()
  const delta    = deadline - now
  const isPastDue = delta < 0
  const submissions = a.submissionCount ?? 0
  const graded      = a.gradedCount ?? 0
  const ungraded    = Math.max(0, submissions - graded)

  if (isPastDue) {
    if (submissions === 0) {
      return {
        kind:  "closed",
        tone:  "stone",
        label: "Closed",
        detail: "No submissions",
        urgencyRank: 80,
      }
    }
    if (ungraded > 0) {
      return {
        kind:  "closed-ungraded",
        tone:  "amber",
        label: "Needs grading",
        detail: graded + " / " + submissions + " graded",
        urgencyRank: 5,
      }
    }
    return {
      kind:  "fully-graded",
      tone:  "emerald",
      label: "Fully graded",
      detail: submissions + " / " + submissions + " graded",
      urgencyRank: 90,
    }
  }

  /* Active */
  if (ungraded > 0) {
    return {
      kind:  "needs-grading",
      tone:  "amber",
      label: "Active · grading",
      detail: graded + " / " + submissions + " graded · " + formatDelta(delta, true),
      urgencyRank: 10,
    }
  }
  return {
    kind:  "active",
    tone:  "teal",
    label: "Active",
    detail: submissions + " submitted · " + formatDelta(delta, true),
    urgencyRank: 30,
  }
}

/* Tone -> Tailwind classes (used by both card and strip). */
export interface ToneClasses {
  /** Container border when this tone is the dominant accent. */
  border:     string
  /** Filled badge background. */
  badgeBg:    string
  /** Badge text. */
  badgeText:  string
  /** Stripe / accent line color. */
  stripe:     string
  /** Subtle tinted bg for the card itself when urgency is high. */
  tintedBg:   string
}

export function getToneClasses(tone: Tone): ToneClasses {
  switch (tone) {
    case "red":     return {
      border:    "border-red-300 dark:border-red-800",
      badgeBg:   "bg-red-100 dark:bg-red-950/40",
      badgeText: "text-red-700 dark:text-red-300",
      stripe:    "bg-red-500",
      tintedBg:  "bg-red-50/60 dark:bg-red-950/15",
    }
    case "amber":   return {
      border:    "border-amber-300 dark:border-amber-800",
      badgeBg:   "bg-amber-100 dark:bg-amber-950/40",
      badgeText: "text-amber-700 dark:text-amber-300",
      stripe:    "bg-amber-500",
      tintedBg:  "bg-amber-50/60 dark:bg-amber-950/15",
    }
    case "teal":    return {
      border:    "border-teal-200 dark:border-teal-800",
      badgeBg:   "bg-teal-100 dark:bg-teal-950/40",
      badgeText: "text-teal-700 dark:text-teal-300",
      stripe:    "bg-teal-500",
      tintedBg:  "bg-teal-50/40 dark:bg-teal-950/10",
    }
    case "violet":  return {
      border:    "border-violet-200 dark:border-violet-800",
      badgeBg:   "bg-violet-100 dark:bg-violet-950/40",
      badgeText: "text-violet-700 dark:text-violet-300",
      stripe:    "bg-violet-500",
      tintedBg:  "bg-violet-50/40 dark:bg-violet-950/10",
    }
    case "emerald": return {
      border:    "border-emerald-200 dark:border-emerald-800",
      badgeBg:   "bg-emerald-100 dark:bg-emerald-950/40",
      badgeText: "text-emerald-700 dark:text-emerald-300",
      stripe:    "bg-emerald-500",
      tintedBg:  "bg-emerald-50/40 dark:bg-emerald-950/10",
    }
    case "stone":
    default:        return {
      border:    "border-border",
      badgeBg:   "bg-muted",
      badgeText: "text-muted-foreground",
      stripe:    "bg-stone-400 dark:bg-stone-600",
      tintedBg:  "bg-muted/30",
    }
  }
}
