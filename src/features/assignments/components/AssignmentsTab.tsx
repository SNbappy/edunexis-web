import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import AssignmentsList from "./AssignmentsList"
import AssignmentUrgencyStrip from "./AssignmentUrgencyStrip"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import { ICON_STROKE } from "@/components/ui/appTokens"
import { useAssignments } from "../hooks/useAssignments"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import type { AssignmentDto } from "@/types/assignment.types"
import { useCourseReadOnly } from "@/features/courses/context/CourseReadOnly"

interface AssignmentsTabProps {
  courseId: string
}

export default function AssignmentsTab({ courseId }: AssignmentsTabProps) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")
  const readOnly = useCourseReadOnly()

  const {
    assignments, isLoading,
    deleteAssignment, isDeleting,
    publishAssignment, unpublishAssignment,
  } = useAssignments(courseId)

  const [deleteId, setDeleteId] = useState<string | null>(null)

  const total = assignments.length
  const activeCount = assignments.filter(a => a.isOpen).length

  const handleView = (a: AssignmentDto) => {
    navigate("/courses/" + courseId + "/assignments/" + a.id)
  }
  const handleEdit = (a: AssignmentDto) => {
    navigate("/courses/" + courseId + "/assignments/" + a.id + "/edit")
  }
  const handleNew = () => {
    navigate("/courses/" + courseId + "/assignments/new")
  }

  const createButton = (
    <Button onClick={handleNew} leftIcon={<Plus strokeWidth={ICON_STROKE} />}>
      New assignment
    </Button>
  )

  return (
    <div className="space-y-4">
      {/* Status + action only — the tab bar already says "Assignments". */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">
          {total === 0
            ? "Nothing posted yet"
            : activeCount > 0
              ? `${activeCount} open \u00b7 ${total} total`
              : `${total} total \u00b7 none open`}
        </p>
        {teacher && !readOnly && createButton}
      </div>

      {!isLoading && assignments.length > 0 && (
        <AssignmentUrgencyStrip
          assignments={assignments}
          onView={handleView}
        />
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" rounded="2xl" />)}
        </div>
      ) : (
        <AssignmentsList
          assignments={assignments}
          onView={handleView}
          onEdit={teacher ? handleEdit : undefined}
          onDelete={teacher ? id => setDeleteId(id) : undefined}
          onPublish={teacher && !readOnly ? a => publishAssignment(a.id) : undefined}
          onUnpublish={teacher && !readOnly ? a => unpublishAssignment(a.id) : undefined}
          emptyTitle="No assignments yet"
          emptyDescription={teacher
            ? "Create your first assignment so students can start submitting work."
            : "Your teacher hasn't posted anything yet. Check back later."
          }
          emptyAction={teacher ? createButton : undefined}
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