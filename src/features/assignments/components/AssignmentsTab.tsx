import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Plus, ClipboardList } from "lucide-react"
import AssignmentsList from "./AssignmentsList"
import AssignmentUrgencyStrip from "./AssignmentUrgencyStrip"
import CreateAssignmentModal from "./CreateAssignmentModal"
import EditAssignmentModal from "./EditAssignmentModal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { useAssignments } from "../hooks/useAssignments"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import type {
  AssignmentDto,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
} from "@/types/assignment.types"

interface AssignmentsTabProps {
  courseId: string
}

export default function AssignmentsTab({ courseId }: AssignmentsTabProps) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")

  const {
    assignments, isLoading,
    createAssignment, isCreating,
    updateAssignment, isUpdating,
    deleteAssignment, isDeleting,
  } = useAssignments(courseId)

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<AssignmentDto | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const total = assignments.length
  const activeCount = assignments.filter(a => a.isOpen).length

  const handleView = (a: AssignmentDto) => {
    navigate("/courses/" + courseId + "/assignments/" + a.id)
  }

  const createButton = (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => setCreateOpen(true)}
      className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_14px_-4px_rgba(20,184,166,0.6)] transition-colors hover:bg-teal-700"
    >
      <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
      New assignment
    </motion.button>
  )

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
            <ClipboardList className="h-4 w-4" strokeWidth={2} />
          </div>
          <div>
            <h2 className="font-display text-[15px] font-bold text-foreground">
              Assignments
            </h2>
            <p className="text-[11.5px] text-muted-foreground">
              {total === 0
                ? "Nothing posted yet"
                : activeCount > 0
                  ? activeCount + " active · " + total + " total"
                  : total + " total"
              }
            </p>
          </div>
        </div>

        {teacher && createButton}
      </motion.div>

      {!isLoading && assignments.length > 0 && (
        <AssignmentUrgencyStrip
          assignments={assignments}
          onView={handleView}
        />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : (
        <AssignmentsList
          assignments={assignments}
          onView={handleView}
          onEdit={teacher ? a => setEditing(a) : undefined}
          onDelete={teacher ? id => setDeleteId(id) : undefined}
          emptyTitle="No assignments yet"
          emptyDescription={teacher
            ? "Create your first assignment so students can start submitting work."
            : "Your teacher hasn't posted anything yet. Check back later."
          }
          emptyAction={teacher ? createButton : undefined}
        />
      )}

      <CreateAssignmentModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={data =>
          createAssignment(data as CreateAssignmentRequest, {
            onSuccess: () => setCreateOpen(false),
          })
        }
        isLoading={isCreating}
      />

      {editing && (
        <EditAssignmentModal
          isOpen={!!editing}
          onClose={() => setEditing(null)}
          assignment={editing}
          onSubmit={data =>
            updateAssignment(
              { assignmentId: editing.id, data: data as UpdateAssignmentRequest },
              { onSuccess: () => setEditing(null) },
            )
          }
          isLoading={isUpdating}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteAssignment(deleteId, {
              onSuccess: () => setDeleteId(null),
            })
          }
        }}
        title="Delete assignment"
        description="This permanently deletes the assignment and all student submissions. This cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  )
}