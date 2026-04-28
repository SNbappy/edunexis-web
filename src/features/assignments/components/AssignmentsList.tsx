import { useMemo } from "react"
import { motion } from "framer-motion"
import { ClipboardList } from "lucide-react"
import AssignmentCard from "./AssignmentCard"
import {
  getStudentDisplay, getTeacherDisplay,
} from "@/utils/assignmentStatus"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import type { AssignmentDto } from "@/types/assignment.types"

interface AssignmentsListProps {
  assignments:       AssignmentDto[]
  onView:            (a: AssignmentDto) => void
  onEdit?:           (a: AssignmentDto) => void
  onDelete?:         (id: string) => void
  emptyTitle?:       string
  emptyDescription?: string
  emptyAction?:      React.ReactNode
}

interface Section {
  key:   string
  label: string
  items: AssignmentDto[]
}

interface SectionLabelProps {
  label: string
  count: number
}

function SectionLabel({ label, count }: SectionLabelProps) {
  return (
    <div className="mb-2.5 flex items-center gap-2 px-1">
      <span className="text-[10.5px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
        {count}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

export default function AssignmentsList({
  assignments, onView, onEdit, onDelete,
  emptyTitle, emptyDescription, emptyAction,
}: AssignmentsListProps) {
  const { user } = useAuthStore()
  const teacher  = isTeacher(user?.role ?? "Student")

  const sections = useMemo<Section[]>(() => {
    if (assignments.length === 0) return []

    if (teacher) {
      const needsGrading: AssignmentDto[] = []
      const active:       AssignmentDto[] = []
      const closed:       AssignmentDto[] = []
      const fullyGraded:  AssignmentDto[] = []

      for (const a of assignments) {
        const d = getTeacherDisplay(a)
        if (d.kind === "needs-grading" || d.kind === "closed-ungraded") needsGrading.push(a)
        else if (d.kind === "active") active.push(a)
        else if (d.kind === "fully-graded") fullyGraded.push(a)
        else closed.push(a)
      }
      return [
        { key: "needs-grading", label: "Needs grading",   items: needsGrading },
        { key: "active",        label: "Active",          items: active       },
        { key: "fully-graded",  label: "Fully graded",    items: fullyGraded  },
        { key: "closed",        label: "Closed",          items: closed       },
      ].filter(s => s.items.length > 0)
    }

    /* Student */
    const actionNeeded:  AssignmentDto[] = []
    const submitted:     AssignmentDto[] = []
    const graded:        AssignmentDto[] = []
    const closed:        AssignmentDto[] = []

    for (const a of assignments) {
      const d = getStudentDisplay(a)
      if (d.kind === "graded") graded.push(a)
      else if (d.kind === "submitted-pending" || d.kind === "submitted-late") submitted.push(a)
      else if (d.kind === "closed-missed" || d.kind === "closed") closed.push(a)
      else actionNeeded.push(a)
    }
    return [
      { key: "action",    label: "Action needed",       items: actionNeeded },
      { key: "submitted", label: "Awaiting grade",      items: submitted    },
      { key: "graded",    label: "Graded",              items: graded       },
      { key: "closed",    label: "Closed",              items: closed       },
    ].filter(s => s.items.length > 0)
  }, [assignments, teacher])

  if (assignments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/50">
          <ClipboardList className="h-7 w-7 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />
        </div>
        <h3 className="mt-5 font-display text-[16px] font-bold text-foreground">
          {emptyTitle ?? "No assignments yet"}
        </h3>
        {emptyDescription && (
          <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">
            {emptyDescription}
          </p>
        )}
        {emptyAction && <div className="mt-5">{emptyAction}</div>}
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {sections.map(section => (
        <section key={section.key}>
          <SectionLabel label={section.label} count={section.items.length} />
          <div className="space-y-3">
            {section.items.map((a, i) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                index={i}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
