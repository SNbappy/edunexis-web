import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Plus, ClipboardList } from "lucide-react"
import AssignmentsList from "./AssignmentsList"
import CreateAssignmentModal from "./CreateAssignmentModal"
import EditAssignmentModal from "./EditAssignmentModal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { useAssignments } from "../hooks/useAssignments"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"
import { isTeacher } from "@/utils/roleGuard"
import type { AssignmentDto, CreateAssignmentRequest, UpdateAssignmentRequest } from "@/types/assignment.types"

interface Props { courseId: string }
type FilterTab = "all" | "active" | "closed"

export default function AssignmentsTab({ courseId }: Props) {
  const navigate   = useNavigate()
  const { user }   = useAuthStore()
  const { dark }   = useThemeStore()
  const teacher    = isTeacher(user?.role ?? "Student")

  const { assignments, isLoading, createAssignment, isCreating, updateAssignment, isUpdating, deleteAssignment, isDeleting } = useAssignments(courseId)

  const [createOpen, setCreateOpen] = useState(false)
  const [editing,    setEditing]    = useState<AssignmentDto | null>(null)
  const [deleteId,   setDeleteId]   = useState<string | null>(null)
  const [filter,     setFilter]     = useState<FilterTab>("all")

  const activeCount = assignments.filter((a: any) => a.isOpen).length
  const closedCount = assignments.filter((a: any) => !a.isOpen).length

  const filtered = assignments.filter((a: any) => {
    if (filter === "active") return a.isOpen
    if (filter === "closed") return !a.isOpen
    return true
  })

  const counts: Record<FilterTab, number | undefined> = {
    all:    assignments.length,
    active: activeCount || undefined,
    closed: closedCount || undefined,
  }

  // Theme
  const cardBg   = dark ? "rgba(16,24,44,0.75)" : "rgba(255,255,255,0.92)"
  const blur     = "blur(20px)"
  const border   = dark ? "rgba(99,102,241,0.15)" : "#e5e7eb"
  const textMain = dark ? "#e2e8f8" : "#111827"
  const textSub  = dark ? "#8896c8" : "#6b7280"
  const inputBg  = dark ? "rgba(255,255,255,0.04)" : "#f9fafb"

  const FILTERS = [
    { key: "all" as FilterTab,    label: "All",    count: assignments.length },
    { key: "active" as FilterTab, label: "Active", count: activeCount        },
    { key: "closed" as FilterTab, label: "Closed", count: closedCount        },
  ]

  return (
    <div className="space-y-4 max-w-3xl mx-auto">

      {/* Toolbar */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 p-4 rounded-2xl flex-wrap"
        style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: dark ? "rgba(219,39,119,0.15)" : "#fdf2f8", border: dark ? "1px solid rgba(219,39,119,0.25)" : "1px solid #fbcfe8" }}>
            <ClipboardList style={{ width: 16, height: 16, color: "#db2777" }} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold" style={{ color: textMain }}>Assignments</h2>
            <p className="text-[11px]" style={{ color: textSub }}>
              {activeCount > 0
                ? <span style={{ color: "#059669" }}>{activeCount} active</span>
                : <span>No active assignments</span>
              }
              {closedCount > 0 && <span style={{ color: textSub }}> - {closedCount} closed</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: inputBg, border: `1px solid ${border}` }}>
            {FILTERS.map(tab => (
              <motion.button key={tab.key} whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(tab.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                style={{
                  background: filter === tab.key ? (dark ? "rgba(99,102,241,0.2)" : "#eef2ff") : "transparent",
                  color:      filter === tab.key ? "#6366f1" : textSub,
                  border:     filter === tab.key ? (dark ? "1px solid rgba(99,102,241,0.3)" : "1px solid #c7d2fe") : "1px solid transparent",
                }}>
                {tab.label}
                {tab.count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: filter === tab.key ? (dark ? "rgba(99,102,241,0.2)" : "#c7d2fe") : (dark ? "rgba(255,255,255,0.07)" : "#f3f4f6"), color: filter === tab.key ? "#6366f1" : textSub }}>
                    {tab.count}
                  </span>
                )}
              </motion.button>
            ))}
          </div>

          {teacher && (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white"
              style={{ background: "linear-gradient(135deg,#6366f1,#0891b2)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
              <Plus style={{ width: 14, height: 14 }} /> Create
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 rounded-2xl animate-pulse"
              style={{ background: dark ? "rgba(99,102,241,0.06)" : "#f3f4f6" }} />
          ))}
        </div>
      ) : (
        <AssignmentsList
          assignments={filtered}
          onView={a => navigate(`/courses/${courseId}/assignments/${a.id}`)}
          onEdit={teacher ? a => setEditing(a) : undefined}
          onDelete={teacher ? id => setDeleteId(id) : undefined}
          emptyTitle={filter === "all" ? "No assignments yet" : `No ${filter} assignments`}
          emptyDescription={teacher ? "Create your first assignment to get started" : "Your teacher has not posted any assignments yet"}
          emptyAction={teacher
            ? <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white"
                style={{ background: "linear-gradient(135deg,#6366f1,#0891b2)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
                <Plus style={{ width: 14, height: 14 }} /> Create Assignment
              </motion.button>
            : undefined
          }
        />
      )}

      <CreateAssignmentModal isOpen={createOpen} onClose={() => setCreateOpen(false)}
        onSubmit={data => createAssignment(data as CreateAssignmentRequest, { onSuccess: () => setCreateOpen(false) })}
        isLoading={isCreating} />
      {editing && (
        <EditAssignmentModal isOpen={!!editing} onClose={() => setEditing(null)} assignment={editing}
          onSubmit={data => updateAssignment({ id: editing.id, data: data as UpdateAssignmentRequest }, { onSuccess: () => setEditing(null) })}
          isLoading={isUpdating} />
      )}
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteAssignment(deleteId, { onSuccess: () => setDeleteId(null) }) }}
        title="Delete Assignment" description="This will permanently delete the assignment and all submissions."
        confirmLabel="Delete" isLoading={isDeleting} />
    </div>
  )
}
