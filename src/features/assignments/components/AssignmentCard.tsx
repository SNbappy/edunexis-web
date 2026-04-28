import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ClipboardList, MoreVertical, Pencil, Trash2,
  Users, CalendarClock, Award,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import {
  getStudentDisplay, getTeacherDisplay, getToneClasses,
} from "@/utils/assignmentStatus"
import type { AssignmentDto } from "@/types/assignment.types"

interface AssignmentCardProps {
  assignment: AssignmentDto
  index?:     number
  onView:     (a: AssignmentDto) => void
  onEdit?:    (a: AssignmentDto) => void
  onDelete?:  (id: string) => void
}

export default function AssignmentCard({
  assignment, index = 0, onView, onEdit, onDelete,
}: AssignmentCardProps) {
  const { user } = useAuthStore()
  const teacher  = isTeacher(user?.role ?? "Student")
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const display = teacher
    ? getTeacherDisplay(assignment)
    : getStudentDisplay(assignment)
  const tone = getToneClasses(display.tone)

  useEffect(() => {
    if (!menuOpen) return
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [menuOpen])

  const showMenu = teacher && (onEdit || onDelete)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.2), duration: 0.25 }}
      onClick={() => onView(assignment)}
      whileHover={{ y: -2 }}
      className={
        "group relative cursor-pointer rounded-2xl border bg-card shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_12px_32px_-8px_rgba(20,184,166,0.18)] " +
        tone.border + " " +
        (menuOpen ? "z-30" : "z-0")
      }
    >
      <div
        className={"pointer-events-none absolute bottom-3 left-0 top-3 w-[3px] rounded-full " + tone.stripe}
        aria-hidden
      />

      <div className="flex items-start gap-3 px-5 py-4 pl-6">
        {/* Icon */}
        <div className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-xl " + tone.badgeBg + " " + tone.badgeText}>
          <ClipboardList className="h-4 w-4" strokeWidth={2} />
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-display text-[14px] font-bold leading-snug text-foreground">
              {assignment.title}
            </h3>

            <div className="flex shrink-0 items-center gap-1.5">
              <span className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider " + tone.badgeBg + " " + tone.badgeText}>
                {display.label}
              </span>

              {showMenu && (
                <div className="relative" ref={menuRef}>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
                    aria-label="Assignment actions"
                    aria-expanded={menuOpen}
                    className={
                      "flex h-7 w-7 items-center justify-center rounded-lg transition-colors " +
                      (menuOpen
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground")
                    }
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </motion.button>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 top-9 z-50 w-40 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
                        onClick={e => e.stopPropagation()}
                      >
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => { setMenuOpen(false); onEdit(assignment) }}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-foreground transition-colors hover:bg-teal-50 dark:hover:bg-teal-950/30"
                          >
                            <Pencil className="h-3.5 w-3.5 text-teal-700 dark:text-teal-300" />
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => { setMenuOpen(false); onDelete(assignment.id) }}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {assignment.instructions && (
            <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
              {assignment.instructions}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarClock className={"h-3 w-3 " + (display.tone === "red" ? "text-red-600 dark:text-red-400" : "")} />
              <span className={display.tone === "red" ? "font-semibold text-red-600 dark:text-red-400" : ""}>
                {display.detail}
              </span>
            </span>

            {typeof assignment.maxMarks === "number" && (
              <span className="inline-flex items-center gap-1">
                <Award className="h-3 w-3" />
                {assignment.maxMarks} marks
              </span>
            )}

            {teacher && typeof assignment.submissionCount === "number" && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" />
                {assignment.submissionCount} submitted
              </span>
            )}

            {assignment.allowLateSubmission && (
              <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                Late ok
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
