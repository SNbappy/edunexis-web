import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, BookMarked } from "lucide-react"
import CTEventsList from "./CTEventsList"
import CTEventDetailModal from "./CTEventDetailModal"
import CreateCTEventModal from "./CreateCTEventModal"
import CTMarkEntryModal from "./CTMarkEntryModal"
import UploadKhataModal from "./UploadKhataModal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { useCTEvents } from "../hooks/useCTEvents"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import type { CTEventDto, CreateCTEventRequest } from "@/types/ct.types"

interface Member { userId: string; fullName: string; studentId?: string; profilePhotoUrl?: string }
interface Props { courseId: string; members?: Member[] }
type FilterTab = "all" | "draft" | "published"

export default function CTTab({ courseId, members = [] }: Props) {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")

  const {
    ctEvents, isLoading,
    createCT, isCreating,
    deleteCT, isDeleting,
    publishCT, unpublishCT,
  } = useCTEvents(courseId)

  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<CTEventDto | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [marksTarget, setMarksTarget] = useState<CTEventDto | null>(null)
  const [khataTarget, setKhataTarget] = useState<CTEventDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CTEventDto | null>(null)
  const [filter, setFilter] = useState<FilterTab>("all")

  const draftCount = ctEvents.filter((c: any) => c.status === "Draft").length
  const publishedCount = ctEvents.filter((c: any) => c.status === "Published").length

  const filtered = ctEvents.filter((c: any) => {
    if (filter === "draft") return c.status === "Draft"
    if (filter === "published") return c.status === "Published"
    return true
  })

  const handleView = (ct: CTEventDto) => { setSelected(ct); setDetailOpen(true) }

  const FILTERS = [
    { key: "all" as FilterTab, label: "All", count: ctEvents.length },
    { key: "draft" as FilterTab, label: "Draft", count: draftCount },
    { key: "published" as FilterTab, label: "Published", count: publishedCount },
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
      New CT
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
            <BookMarked className="h-4 w-4" strokeWidth={2} />
          </div>
          <div>
            <h2 className="font-display text-[15px] font-bold text-foreground">
              Class tests
            </h2>
            <p className="text-[11.5px] text-muted-foreground">
              {ctEvents.length === 0
                ? "Nothing posted yet"
                : publishedCount > 0
                  ? publishedCount + " published · " + ctEvents.length + " total"
                  : ctEvents.length + " total"
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
        <CTEventsList
          ctEvents={filtered}
          onView={handleView}
          onDelete={teacher ? (ct: any) => setDeleteTarget(ct) : undefined}
          onPublish={teacher ? (id: string) => publishCT(id) : undefined}
          onUnpublish={teacher ? (id: string) => unpublishCT(id) : undefined}
          onUploadKhata={teacher ? (ct: any) => setKhataTarget(ct) : undefined}
          onEnterMarks={teacher ? (ct: any) => setMarksTarget(ct) : undefined}
          emptyTitle={filter === "all" ? "No class tests yet" : "No " + filter + " class tests"}
          emptyDescription={teacher
            ? "Create your first CT, upload the marked scripts, then enter student marks."
            : "Your teacher hasn't posted any class tests yet. Check back later."
          }
          emptyAction={teacher ? createButton : undefined}
        />
      )}

      <CreateCTEventModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        courseId={courseId}
        onSubmit={(d: CreateCTEventRequest) => createCT(d, { onSuccess: () => setCreateOpen(false) })}
        isLoading={isCreating}
      />

      <CTEventDetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        ct={selected}
        onEnterMarks={teacher ? (ct: any) => { setDetailOpen(false); setMarksTarget(ct) } : undefined}
        onUploadKhata={teacher ? (ct: any) => { setDetailOpen(false); setKhataTarget(ct) } : undefined}
        onPublish={teacher ? (id: string) => { setDetailOpen(false); publishCT(id) } : undefined}
      />

      {marksTarget && (
        <CTMarkEntryModal
          isOpen={!!marksTarget}
          onClose={() => setMarksTarget(null)}
          ct={marksTarget}
          courseId={courseId}
          members={members}
        />
      )}

      {khataTarget && (
        <UploadKhataModal
          isOpen={!!khataTarget}
          onClose={() => setKhataTarget(null)}
          ct={khataTarget}
          courseId={courseId}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteCT(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            })
          }
        }}
        title="Delete class test"
        description="This permanently deletes the CT and all student marks. This cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  )
}