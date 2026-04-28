import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, FileCheck2 } from "lucide-react"
import PresentationsList from "./PresentationsList"
import CreatePresentationModal from "./CreatePresentationModal"
import PresentationDetailModal from "./PresentationDetailModal"
import PresentationMarkEntryModal from "./PresentationMarkEntryModal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { usePresentations } from "../hooks/usePresentations"
import { useAttendance } from "@/features/attendance/hooks/useAttendance"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import type { PresentationDto } from "@/types/presentation.types"

interface Props { courseId: string }
type FilterTab = "all" | "upcoming" | "completed" | "cancelled"

export default function PresentationsTab({ courseId }: Props) {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")

  const {
    presentations, isLoading,
    createPresentation, isCreating,
    deletePresentation, isDeleting,
    updateStatus,
  } = usePresentations(courseId)
  const { members } = useAttendance(courseId)

  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<PresentationDto | null>(null)
  const [markEntry, setMarkEntry] = useState<PresentationDto | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterTab>("all")

  const upcomingCount = presentations.filter((p: any) => p.status === "Scheduled" || p.status === "Ongoing").length
  const completedCount = presentations.filter((p: any) => p.status === "Completed").length
  const cancelledCount = presentations.filter((p: any) => p.status === "Cancelled").length

  const filtered = presentations.filter((p: any) => {
    if (filter === "upcoming") return p.status === "Scheduled" || p.status === "Ongoing"
    if (filter === "completed") return p.status === "Completed"
    if (filter === "cancelled") return p.status === "Cancelled"
    return true
  })

  const FILTERS = [
    { key: "all" as FilterTab, label: "All", count: presentations.length },
    { key: "upcoming" as FilterTab, label: "Upcoming", count: upcomingCount },
    { key: "completed" as FilterTab, label: "Completed", count: completedCount },
    { key: "cancelled" as FilterTab, label: "Cancelled", count: cancelledCount },
  ]

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
      {/* Toolbar */}
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
                ? "Nothing scheduled yet"
                : upcomingCount > 0
                  ? upcomingCount + " upcoming · " + presentations.length + " total"
                  : presentations.length + " total"
              }
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter chips */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted p-1">
            {FILTERS.map(tab => {
              const active = filter === tab.key
              return (
                <motion.button
                  key={tab.key}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(tab.key)}
                  className={
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors " +
                    (active
                      ? "bg-card text-teal-700 shadow-sm dark:text-teal-300"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold " +
                      (active
                        ? "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                        : "bg-card text-muted-foreground")
                    }>
                      {tab.count}
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>

          {teacher && createButton}
        </div>
      </motion.div>

      {/* List */}
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
        <PresentationsList
          presentations={filtered}
          onView={setSelected}
          onDelete={teacher ? (id: string) => setDeleteId(id) : undefined}
          onUpdateStatus={teacher ? (id: string, status: any) => updateStatus({ id, status }) : undefined}
          emptyTitle={filter === "all" ? "No tests scheduled yet" : "No " + filter + " tests"}
          emptyDescription={teacher
            ? "Schedule any kind of marked event — oral tests, vivas, lab tests, presentations, or pop quizzes."
            : "Your teacher hasn't scheduled any tests yet. Check back later."
          }
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

      <PresentationDetailModal
        isOpen={!!selected && !markEntry}
        onClose={() => setSelected(null)}
        presentation={selected}
        onEnterMarks={(p: any) => { setSelected(null); setMarkEntry(p) }}
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
          if (deleteId) {
            deletePresentation(deleteId, {
              onSuccess: () => setDeleteId(null),
            })
          }
        }}
        title="Delete test"
        description="This permanently deletes the test and all associated marks. This cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  )
}