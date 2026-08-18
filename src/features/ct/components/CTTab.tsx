import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import { ICON_STROKE, FOCUS } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"
import CTEventsList from "./CTEventsList"
import CreateCTEventModal from "./CreateCTEventModal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { useCTEvents } from "../hooks/useCTEvents"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import type { CTEventDto, CreateCTEventRequest } from "@/types/ct.types"
import { useCourseReadOnly } from "@/features/courses/context/CourseReadOnly"

interface Props { courseId: string }
type FilterTab = "all" | "draft" | "published"

export default function CTTab({ courseId }: Props) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")
  const readOnly = useCourseReadOnly()

  const {
    ctEvents, isLoading,
    createCT, isCreating,
    deleteCT, isDeleting,
    publishCT, unpublishCT,
  } = useCTEvents(courseId)

  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CTEventDto | null>(null)
  const [filter, setFilter] = useState<FilterTab>("all")

  const draftCount = ctEvents.filter((c: any) => c.status === "Draft").length
  const publishedCount = ctEvents.filter((c: any) => c.status === "Published").length

  const filtered = ctEvents.filter((c: any) => {
    if (filter === "draft") return c.status === "Draft"
    if (filter === "published") return c.status === "Published"
    return true
  })

  /* A class test is a workspace, not a summary: it carries the scripts, the
     whole roster, the marks and the publish decision. That never fitted a
     modal — opening marks meant a modal on top of a modal, and nothing about
     it could be linked to or reloaded. It now works exactly like an
     assignment: its own URL, opened by the card or by any of its actions. */
  const openCT = (ct: CTEventDto) => navigate("/courses/" + courseId + "/ct/" + ct.id)

  const FILTERS = [
    { key: "all" as FilterTab, label: "All", count: ctEvents.length },
    { key: "draft" as FilterTab, label: "Draft", count: draftCount },
    { key: "published" as FilterTab, label: "Published", count: publishedCount },
  ]

  const createButton = (
    <Button onClick={() => setCreateOpen(true)} leftIcon={<Plus strokeWidth={ICON_STROKE} />}>
      New CT
    </Button>
  )

  return (
    <div className="space-y-4">
      {/* Status + filters + action. The tab bar already says "CT". */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">
          {/* A student's list is already published-only, so counting drafts
              at them is teacher bookkeeping they cannot act on. */}
          {ctEvents.length === 0
            ? "Nothing posted yet"
            : !teacher
              ? `${ctEvents.length} class ${ctEvents.length === 1 ? "test" : "tests"}`
              : publishedCount > 0
                ? `${publishedCount} published · ${ctEvents.length} total`
                : `${ctEvents.length} total · none published`}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {/* Students only ever receive published CTs, so a Draft/Published
              filter would offer them two states they can never be in. */}
          {teacher && (
          <div className="flex items-center gap-0.5 rounded-xl border border-border bg-muted p-0.5">
            {FILTERS.map(tab => {
              const active = filter === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilter(tab.key)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-[9px] px-2.5 text-[12.5px] font-semibold transition-colors duration-120",
                    FOCUS,
                    active
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground">
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          )}

          {teacher && !readOnly && createButton}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" rounded="2xl" />)}
        </div>
      ) : (
        <CTEventsList
          ctEvents={filtered}
          onView={openCT}
          onDelete={teacher ? (ct: any) => setDeleteTarget(ct) : undefined}
          onPublish={teacher ? (id: string) => publishCT(id) : undefined}
          onUnpublish={teacher ? (id: string) => unpublishCT(id) : undefined}
          onUploadKhata={teacher ? openCT : undefined}
          onEnterMarks={teacher ? openCT : undefined}
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

