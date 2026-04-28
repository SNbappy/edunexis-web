import { useMemo } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Flame } from "lucide-react"
import {
  getStudentDisplay, getTeacherDisplay, getToneClasses,
  type AssignmentDisplay, type Tone,
} from "@/utils/assignmentStatus"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import type { AssignmentDto } from "@/types/assignment.types"

interface AssignmentUrgencyStripProps {
  assignments: AssignmentDto[]
  onView: (a: AssignmentDto) => void
}

const URGENCY_THRESHOLD = 35
const MAX_ITEMS = 3

export default function AssignmentUrgencyStrip({
  assignments, onView,
}: AssignmentUrgencyStripProps) {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")

  const items = useMemo(() => {
    return assignments
      .map(a => ({
        assignment: a,
        display: teacher ? getTeacherDisplay(a) : getStudentDisplay(a),
      }))
      .filter(x => x.display.urgencyRank <= URGENCY_THRESHOLD)
      .sort((a, b) => a.display.urgencyRank - b.display.urgencyRank)
      .slice(0, MAX_ITEMS)
  }, [assignments, teacher])

  if (items.length === 0) return null

  const heading = teacher ? "Needs your attention" : "Due soon"

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50/40 to-red-50/30 p-4 dark:border-amber-900 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-red-950/20"
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-200 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
          <Flame className="h-3.5 w-3.5" strokeWidth={2.4} />
        </div>
        <h3 className="font-display text-[13px] font-bold text-amber-900 dark:text-amber-200">
          {heading}
        </h3>
        <span className="rounded-md border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          {items.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ assignment, display }) => (
          <UrgencyCard
            key={assignment.id}
            assignment={assignment}
            display={display}
            onView={onView}
          />
        ))}
      </div>
    </motion.div>
  )
}

interface UrgencyCardProps {
  assignment: AssignmentDto
  display: AssignmentDisplay
  onView: (a: AssignmentDto) => void
}

function UrgencyCard({ assignment, display, onView }: UrgencyCardProps) {
  const tone = getToneClasses(display.tone)
  const dominantTextClass = dominantTextFor(display.tone)

  return (
    <motion.button
      type="button"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onView(assignment)}
      className={
        "group flex w-full items-start gap-3 rounded-xl border bg-card p-3 text-left shadow-sm transition-all hover:shadow-md " +
        tone.border
      }
    >
      <div className={"mt-0.5 h-full w-[3px] shrink-0 rounded-full " + tone.stripe} aria-hidden />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-1.5">
          <span className={"inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider " + tone.badgeBg + " " + tone.badgeText}>
            {display.label}
          </span>
        </div>
        <p className="line-clamp-1 text-[13px] font-bold text-foreground">
          {assignment.title}
        </p>
        <p className={"mt-0.5 text-[11.5px] font-semibold " + dominantTextClass}>
          {display.detail}
        </p>
      </div>

      <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
    </motion.button>
  )
}

function dominantTextFor(tone: Tone): string {
  switch (tone) {
    case "red": return "text-red-700 dark:text-red-300"
    case "amber": return "text-amber-700 dark:text-amber-300"
    case "violet": return "text-violet-700 dark:text-violet-300"
    case "emerald": return "text-emerald-700 dark:text-emerald-300"
    case "teal": return "text-teal-700 dark:text-teal-300"
    default: return "text-muted-foreground"
  }
}