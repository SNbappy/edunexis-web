import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, AlertCircle, FileText, MoreVertical, Trash2, Users, Pencil, CheckCircle2, Lock, CalendarClock } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"
import { isTeacher } from "@/utils/roleGuard"
import { isPast, parseISO, formatDistanceToNow } from "date-fns"
import type { AssignmentDto } from "@/types/assignment.types"

interface Props {
  assignment: AssignmentDto
  index?:     number
  onView:     (a: AssignmentDto) => void
  onEdit?:    (a: AssignmentDto) => void
  onDelete?:  (id: string) => void
}

export default function AssignmentCard({ assignment, index = 0, onView, onEdit, onDelete }: Props) {
  const { user }  = useAuthStore()
  const { dark }  = useThemeStore()
  const teacher   = isTeacher(user?.role ?? "Student")
  const [menuOpen, setMenuOpen] = useState(false)

  const isPastDue = assignment.deadline ? isPast(parseISO(assignment.deadline)) : false
  const isActive  = assignment.isOpen && !isPastDue
  const isLate    = assignment.isOpen && isPastDue && assignment.lateSubmissionAllowed
  const isClosed  = !assignment.isOpen || (isPastDue && !assignment.lateSubmissionAllowed)

  const timeLeft = assignment.deadline && !isPastDue
    ? formatDistanceToNow(parseISO(assignment.deadline), { addSuffix: true })
    : assignment.deadline && isPastDue
      ? formatDistanceToNow(parseISO(assignment.deadline), { addSuffix: true })
      : null

  // Status config
  const status = isActive ? "open" : isLate ? "late" : "closed"
  const STATUS = {
    open:   { color: "#059669", lightBg: "#ecfdf5", darkBg: "rgba(5,150,105,0.15)",  border: "#a7f3d0", darkBorder: "rgba(5,150,105,0.3)",  label: "Open",   icon: CheckCircle2 },
    late:   { color: "#d97706", lightBg: "#fffbeb", darkBg: "rgba(217,119,6,0.15)",  border: "#fde68a", darkBorder: "rgba(217,119,6,0.3)",   label: "Late",   icon: Clock        },
    closed: { color: "#ef4444", lightBg: "#fef2f2", darkBg: "rgba(239,68,68,0.15)",  border: "#fecaca", darkBorder: "rgba(239,68,68,0.3)",   label: "Closed", icon: Lock         },
  }[status]

  // Theme
  const cardBg   = dark ? "rgba(16,24,44,0.75)" : "rgba(255,255,255,0.92)"
  const blur     = "blur(20px)"
  const border   = dark ? "rgba(99,102,241,0.15)" : "#e5e7eb"
  const hoverBorder = dark ? "rgba(99,102,241,0.3)" : "#c7d2fe"
  const textMain = dark ? "#e2e8f8" : "#111827"
  const textSub  = dark ? "#8896c8" : "#6b7280"
  const textMuted= dark ? "#5a6a9a" : "#9ca3af"
  const divider  = dark ? "rgba(255,255,255,0.05)" : "#f3f4f6"
  const menuBg   = dark ? "rgb(16,24,44)" : "white"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.28 }}
      whileHover={{ y: -3, boxShadow: dark ? "0 12px 32px rgba(99,102,241,0.15)" : "0 8px 24px rgba(99,102,241,0.1)" }}
      onClick={() => onView(assignment)}
      className="group relative rounded-2xl p-5 cursor-pointer transition-all"
      style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}` }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = hoverBorder)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = border)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: dark ? STATUS.darkBg : STATUS.lightBg, border: `1px solid ${dark ? STATUS.darkBorder : STATUS.border}` }}>
            <FileText style={{ width: 17, height: 17, color: STATUS.color }} strokeWidth={2} />
          </div>
          {/* Title */}
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-bold leading-snug line-clamp-2 mb-1" style={{ color: textMain }}>
              {assignment.title}
            </h3>
            {assignment.description && (
              <p className="text-[12px] line-clamp-2 leading-relaxed" style={{ color: textSub }}>
                {assignment.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Status badge */}
          <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: dark ? STATUS.darkBg : STATUS.lightBg, color: STATUS.color, border: `1px solid ${dark ? STATUS.darkBorder : STATUS.border}` }}>
            <STATUS.icon style={{ width: 11, height: 11 }} strokeWidth={2.5} />
            {STATUS.label}
          </span>

          {/* Teacher menu */}
          {teacher && (onEdit || onDelete) && (
            <div className="relative">
              <motion.button whileTap={{ scale: 0.9 }}
                onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                style={{ color: textMuted }}
                onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.07)" : "#f3f4f6")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <MoreVertical style={{ width: 15, height: 15 }} />
              </motion.button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1,    y: 0   }}
                    exit={{   opacity: 0, scale: 0.95, y: -4   }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-9 rounded-2xl overflow-hidden z-20 min-w-[140px]"
                    style={{ background: menuBg, border: `1px solid ${border}`, boxShadow: dark ? "0 16px 40px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.12)" }}
                    onClick={e => e.stopPropagation()}
                  >
                    {onEdit && (
                      <button onClick={() => { setMenuOpen(false); onEdit(assignment) }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-colors"
                        style={{ color: textSub }}
                        onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(99,102,241,0.1)" : "#f9fafb")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <Pencil style={{ width: 14, height: 14, color: "#6366f1" }} /> Edit
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => { setMenuOpen(false); onDelete(assignment.id) }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-colors"
                        style={{ color: "#ef4444" }}
                        onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(239,68,68,0.1)" : "#fef2f2")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <Trash2 style={{ width: 14, height: 14 }} /> Delete
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 flex-wrap gap-2"
        style={{ borderTop: `1px solid ${divider}` }}>
        <div className="flex items-center gap-3">
          {/* Deadline */}
          {assignment.deadline && (
            <div className="flex items-center gap-1.5">
              <CalendarClock style={{ width: 13, height: 13, color: isPastDue ? "#ef4444" : textMuted }} />
              <span className="text-[12px] font-medium"
                style={{ color: isPastDue ? "#ef4444" : textSub }}>
                {timeLeft}
              </span>
            </div>
          )}

          {/* Max marks */}
          {assignment.maxMarks != null && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: dark ? "rgba(99,102,241,0.12)" : "#eef2ff", color: "#6366f1" }}>
                {assignment.maxMarks} marks
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Submission count (teacher) */}
          {teacher && assignment.submissionCount != null && (
            <div className="flex items-center gap-1.5">
              <Users style={{ width: 12, height: 12, color: textMuted }} />
              <span className="text-[12px]" style={{ color: textMuted }}>
                {assignment.submissionCount} submitted
              </span>
            </div>
          )}

          {/* Late allowed */}
          {assignment.lateSubmissionAllowed && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: dark ? "rgba(217,119,6,0.12)" : "#fffbeb", color: "#d97706", border: dark ? "1px solid rgba(217,119,6,0.25)" : "1px solid #fde68a" }}>
              Late allowed
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
