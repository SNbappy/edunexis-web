import { useState } from "react"
import { Plus } from "lucide-react"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import { ICON_STROKE, FOCUS } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"
import CTEventsList from "./CTEventsList"
import CTEventDetailModal from "./CTEventDetailModal"
import CreateCTEventModal from "./CreateCTEventModal"
import CTMarkEntryModal from "./CTMarkEntryModal"
import UploadKhataModal from "./UploadKhataModal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { useCTEvents } from "../hooks/useCTEvents"
import { useAttendance } from "@/features/attendance/hooks/useAttendance"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import type { CTEventDto, CreateCTEventRequest } from "@/types/ct.types"
import { useCourseReadOnly } from "@/features/courses/context/CourseReadOnly"

/** `string | null` matches CourseMemberDto — the API sends null, not undefined,
 *  and the narrower type made every hook that returns members unassignable. */
interface Member { userId: string; fullName: string; studentId?: string | null; profilePhotoUrl?: string | null }
interface Props { courseId: string; members?: Member[] }
type FilterTab = "all" | "draft" | "published"

export default function CTTab({ courseId, members = [] }: Props) {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")
  const readOnly = useCourseReadOnly()

  const {
    ctEvents, isLoading,
    createCT, isCreating,
    deleteCT, isDeleting,
    publishCT, unpublishCT,
  } = useCTEvents(courseId)

  const { members: courseMembers } = useAttendance(courseId)
  const memberList = members.length > 0 ? members : courseMembers

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
          members={memberList}
        />
      )}

      {khataTarget && (
        <UploadKhataModal
          isOpen={!!khataTarget}
          onClose={() => setKhataTarget(null)}
          ct={khataTarget}
          members={memberList}
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

