import { motion } from "framer-motion"
import { ClipboardList } from "lucide-react"
import AssignmentCard from "./AssignmentCard"
import { useThemeStore } from "@/store/themeStore"
import type { AssignmentDto } from "@/types/assignment.types"

interface Props {
  assignments:       AssignmentDto[]
  onView:            (a: AssignmentDto) => void
  onEdit?:           (a: AssignmentDto) => void
  onDelete?:         (id: string) => void
  emptyTitle?:       string
  emptyDescription?: string
  emptyAction?:      React.ReactNode
}

export default function AssignmentsList({ assignments, onView, onEdit, onDelete, emptyTitle, emptyDescription, emptyAction }: Props) {
  const { dark } = useThemeStore()

  if (assignments.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 rounded-2xl text-center"
        style={{
          background: dark ? "rgba(16,24,44,0.7)" : "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: `2px dashed ${dark ? "rgba(99,102,241,0.2)" : "#e5e7eb"}`,
        }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: dark ? "rgba(219,39,119,0.12)" : "#fdf2f8", border: dark ? "1px solid rgba(219,39,119,0.25)" : "1px solid #fbcfe8" }}>
          <ClipboardList style={{ width: 28, height: 28, color: "#db2777" }} strokeWidth={1.5} />
        </div>
        <p className="text-[15px] font-bold mb-1" style={{ color: dark ? "#e2e8f8" : "#111827" }}>
          {emptyTitle ?? "No assignments yet"}
        </p>
        {emptyDescription && (
          <p className="text-[13px] mb-5" style={{ color: dark ? "#8896c8" : "#6b7280" }}>{emptyDescription}</p>
        )}
        {emptyAction}
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      {assignments.map((a, i) => (
        <AssignmentCard key={a.id} assignment={a} index={i} onView={onView} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
