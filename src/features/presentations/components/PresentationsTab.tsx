import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, FileCheck2 } from "lucide-react"
import PresentationsList from "./PresentationsList"
import CreatePresentationModal from "./CreatePresentationModal"
import PresentationMarkEntryModal from "./PresentationMarkEntryModal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { usePresentations } from "../hooks/usePresentations"
import { useAttendance } from "@/features/attendance/hooks/useAttendance"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import type { PresentationDto } from "@/types/presentation.types"

interface Props { courseId: string }

export default function PresentationsTab({ courseId }: Props) {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")

  const {
    presentations, isLoading,
    createPresentation, isCreating,
    deletePresentation, isDeleting,
    publishPresentation,
    unpublishPresentation,
  } = usePresentations(courseId)
  const { members } = useAttendance(courseId)

  const [createOpen, setCreateOpen] = useState(false)
  const [markEntry, setMarkEntry] = useState<PresentationDto | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const publishedCount = presentations.filter((p: any) => p.isPublished).length

  const createButton = (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => setCreateOpen(true)}
      className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_14px_-4px_rgba(20,184,166,0.6)] transition-colors hover:bg-teal-700"
    >
      <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
      New test
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
            <FileCheck2 className="h-4 w-4" strokeWidth={2} />
          </div>
          <div>
            <h2 className="font-display text-[15px] font-bold text-foreground">
              Other tests
            </h2>
            <p className="text-[11.5px] text-muted-foreground">
              {presentations.length === 0
                ? "No tests yet"
                : publishedCount + " published \u00b7 " + presentations.length + " total"}
            </p>
          </div>
        </div>

        {teacher && createButton}
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-muted/40" />
          ))}
        </div>
      ) : (
        <PresentationsList
          presentations={presentations}
          onView={teacher ? (p: PresentationDto) => setMarkEntry(p) : undefined}
          onDelete={teacher ? (id: string) => setDeleteId(id) : undefined}
          onPublish={teacher ? (id: string) => publishPresentation(id) : undefined}
          onUnpublish={teacher ? (id: string) => unpublishPresentation(id) : undefined}
          emptyTitle="No tests yet"
          emptyDescription={teacher
            ? "Create a test \u2014 oral tests, vivas, lab tests, presentations, or pop quizzes."
            : "Your teacher hasn't created any tests yet."}
          emptyAction={teacher ? createButton : undefined}
        />
      )}

      <CreatePresentationModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        courseId={courseId}
        onSubmit={(data: any) =>
          createPresentation(data, { onSuccess: () => setCreateOpen(false) })
        }
        isLoading={isCreating}
      />

      <PresentationMarkEntryModal
        isOpen={!!markEntry}
        onClose={() => setMarkEntry(null)}
        presentation={markEntry}
        courseId={courseId}
        members={members}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deletePresentation(deleteId, { onSuccess: () => setDeleteId(null) })
        }}
        title="Delete test"
        description="This permanently deletes the test and all associated marks. This cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  )
}