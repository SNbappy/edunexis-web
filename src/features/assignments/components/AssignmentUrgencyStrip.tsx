import { useMemo } from "react"
import { ArrowRight, Clock } from "lucide-react"
import {
  getStudentDisplay, getTeacherDisplay,
  type AssignmentDisplay,
} from "@/utils/assignmentStatus"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import { ICON_STROKE, FOCUS, TEXT } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"
import type { AssignmentDto } from "@/types/assignment.types"

interface AssignmentUrgencyStripProps {
  assignments: AssignmentDto[]
  onView: (a: AssignmentDto) => void
}

const URGENCY_THRESHOLD = 35
const MAX_ITEMS = 3

/**
 * The few assignments that need action now.
 *
 * This used to be an amber-to-red gradient panel with its own badges and
 * card style — the only screen in the app still speaking a different
 * visual language, which made it look bolted on rather than designed in.
 *
 * The urgency now comes from position and one accent, not from wrapping
 * everything in a warm gradient: the strip sits at the top of the tab,
 * each item carries a left rail in its own tone, and the deadline is the
 * only coloured text. Same information, and it stops competing with the
 * course header directly above it.
 */
export default function AssignmentUrgencyStrip({
  assignments, onView,
}: AssignmentUrgencyStripProps) {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")

  const decorated = useMemo(
    () => assignments.map(a => ({
      assignment: a,
      display: teacher ? getTeacherDisplay(a) : getStudentDisplay(a),
      ungraded: Math.max(0, (a.submissionCount ?? 0) - (a.gradedCount ?? 0)),
      pastDue: new Date(a.deadline).getTime() < Date.now(),
    })),
    [assignments, teacher],
  )

  /* Students keep a single "Due soon" shortcut. */
  if (!teacher) {
    const due = decorated
      .filter(x => x.display.urgencyRank <= URGENCY_THRESHOLD)
      .sort((a, b) => a.display.urgencyRank - b.display.urgencyRank)
      .slice(0, MAX_ITEMS)

    if (due.length === 0 || due.length >= assignments.length) return null

    return <Strip title="Due soon" items={due} onView={onView} />
  }

  /* Teachers get one strip, and it is deliberately NOT "needs grading".
     The list below already has a "Needs grading" group, so a strip with that
     same heading printed the identical cards twice on one screen under the
     identical title.

     What the list cannot express is urgency: it groups by status, so an
     assignment whose deadline shut yesterday sits in the same block as one that
     closed last term. That is what this strip is for — the window has passed
     and it is now genuinely on the teacher, either because nobody submitted or
     because what arrived is still unmarked. Marking work before the deadline is
     normal and is not called out here. */
  const needsAttention = decorated
    .filter(x => x.pastDue && (x.ungraded > 0 || (x.assignment.submissionCount ?? 0) === 0))
    .sort((a, b) => a.display.urgencyRank - b.display.urgencyRank)
    .slice(0, MAX_ITEMS)

  if (needsAttention.length === 0) return null

  return <Strip title="Needs your attention" items={needsAttention} onView={onView} />
}

function Strip({
  title, items, onView, count,
}: {
  title: string
  items: { assignment: AssignmentDto; display: AssignmentDisplay }[]
  onView: (a: AssignmentDto) => void
  count?: string
}) {
  return (
    <section aria-label={title}>
      <div className="mb-2.5 flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-warning" strokeWidth={ICON_STROKE} />
        <h3 className={TEXT.eyebrow}>{title}</h3>
        <span className="rounded-full bg-warning-soft px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-warning">
          {count ?? items.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ assignment, display }) => (
          <UrgencyCard
            key={assignment.id}
            assignment={assignment}
            display={display}
            onView={onView}
          />
        ))}
      </div>
    </section>
  )
}

interface UrgencyCardProps {
  assignment: AssignmentDto
  display: AssignmentDisplay
  onView: (a: AssignmentDto) => void
}

/**
 * Tone is mapped onto the semantic tokens rather than raw palette classes,
 * so these follow the theme and stay consistent with every other status
 * colour in the app.
 */
const TONE: Record<string, { rail: string; text: string }> = {
  red:     { rail: "bg-destructive", text: "text-destructive" },
  amber:   { rail: "bg-warning",     text: "text-warning" },
  emerald: { rail: "bg-success",     text: "text-success" },
  teal:    { rail: "bg-primary",     text: "text-primary" },
  violet:  { rail: "bg-info",        text: "text-info" },
}

function UrgencyCard({ assignment, display, onView }: UrgencyCardProps) {
  const tone = TONE[display.tone] ?? { rail: "bg-border-strong", text: "text-muted-foreground" }

  return (
    <button
      type="button"
      onClick={() => onView(assignment)}
      className={cn(
        "group relative flex w-full items-start gap-3 overflow-hidden rounded-xl border border-border bg-card p-3 text-left shadow-xs",
        "transition-all duration-180 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md",
        FOCUS,
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-[3px]", tone.rail)} aria-hidden />

      <div className="min-w-0 flex-1 pl-1">
        <p className="line-clamp-1 text-[13px] font-semibold text-foreground">
          {assignment.title}
        </p>
        <p className={cn("mt-1 text-[11.5px] font-semibold", tone.text)}>
          {display.detail}
        </p>
      </div>

      <ArrowRight
        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-120 group-hover:translate-x-0.5 group-hover:text-foreground"
        strokeWidth={ICON_STROKE}
      />
    </button>
  )
}
