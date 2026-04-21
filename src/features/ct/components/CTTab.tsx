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
import { useThemeStore } from "@/store/themeStore"
import { isTeacher } from "@/utils/roleGuard"
import type { CTEventDto, CreateCTEventRequest } from "@/types/ct.types"

interface Member { userId: string; fullName: string; studentId?: string; profilePhotoUrl?: string }
interface Props { courseId: string; members?: Member[] }
type FilterTab = "all" | "draft" | "published"

export default function CTTab({ courseId, members = [] }: Props) {
  const { user }  = useAuthStore()
  const { dark }  = useThemeStore()
  const teacher   = isTeacher(user?.role ?? "Student")

  const { ctEvents, isLoading, createCT, isCreating, deleteCT, isDeleting, publishCT, unpublishCT } = useCTEvents(courseId)

  const [createOpen,   setCreateOpen]   = useState(false)
  const [selected,     setSelected]     = useState<CTEventDto | null>(null)
  const [detailOpen,   setDetailOpen]   = useState(false)
  const [marksTarget,  setMarksTarget]  = useState<CTEventDto | null>(null)
  const [khataTarget,  setKhataTarget]  = useState<CTEventDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CTEventDto | null>(null)
  const [filter,       setFilter]       = useState<FilterTab>("all")

  const draftCount     = ctEvents.filter((c: any) => c.status === "Draft").length
  const publishedCount = ctEvents.filter((c: any) => c.status === "Published").length

  const filtered = ctEvents.filter((c: any) => {
    if (filter === "draft")     return c.status === "Draft"
    if (filter === "published") return c.status === "Published"
    return true
  })

  const handleView = (ct: CTEventDto) => { setSelected(ct); setDetailOpen(true) }

  // Theme
  const cardBg   = dark ? "rgba(16,24,44,0.75)" : "rgba(255,255,255,0.92)"
  const blur     = "blur(20px)"
  const border   = dark ? "rgba(99,102,241,0.15)" : "#e5e7eb"
  const textMain = dark ? "#e2e8f8" : "#111827"
  const textSub  = dark ? "#8896c8" : "#6b7280"
  const inputBg  = dark ? "rgba(255,255,255,0.04)" : "#f9fafb"

  const FILTERS = [
    { key: "all" as FilterTab,       label: "All",       count: ctEvents.length },
    { key: "draft" as FilterTab,     label: "Draft",     count: draftCount      },
    { key: "published" as FilterTab, label: "Published", count: publishedCount  },
  ]

  return (
    <div className="space-y-4 max-w-3xl mx-auto">

      {/* Toolbar */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 p-4 rounded-2xl flex-wrap"
        style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: dark ? "rgba(124,58,237,0.15)" : "#f5f3ff", border: dark ? "1px solid rgba(124,58,237,0.25)" : "1px solid #ddd6fe" }}>
            <BookMarked style={{ width: 16, height: 16, color: "#7c3aed" }} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold" style={{ color: textMain }}>Class Tests</h2>
            <p className="text-[11px]" style={{ color: textSub }}>
              {publishedCount > 0
                ? <span style={{ color: "#059669" }}>{publishedCount} published</span>
                : <span>No published CTs</span>
              }
              {draftCount > 0 && <span style={{ color: textSub }}> - {draftCount} draft</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: inputBg, border: `1px solid ${border}` }}>
            {FILTERS.map(tab => (
              <motion.button key={tab.key} whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(tab.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                style={{
                  background: filter === tab.key ? (dark ? "rgba(124,58,237,0.2)" : "#f5f3ff") : "transparent",
                  color:      filter === tab.key ? "#7c3aed" : textSub,
                  border:     filter === tab.key ? (dark ? "1px solid rgba(124,58,237,0.3)" : "1px solid #ddd6fe") : "1px solid transparent",
                }}>
                {tab.label}
                {tab.count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: filter === tab.key ? (dark ? "rgba(124,58,237,0.2)" : "#ddd6fe") : (dark ? "rgba(255,255,255,0.07)" : "#f3f4f6"), color: filter === tab.key ? "#7c3aed" : textSub }}>
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
              style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}>
              <Plus style={{ width: 14, height: 14 }} /> Create CT
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 rounded-2xl animate-pulse"
              style={{ background: dark ? "rgba(124,58,237,0.06)" : "#f3f4f6" }} />
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
          emptyTitle={filter === "all" ? "No CT events yet" : `No ${filter} CTs`}
          emptyDescription={teacher ? "Create your first CT to get started" : "No class tests have been posted yet"}
          emptyAction={teacher
            ? <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
                <Plus style={{ width: 14, height: 14 }} /> Create CT
              </motion.button>
            : undefined
          }
        />
      )}

      <CreateCTEventModal isOpen={createOpen} onClose={() => setCreateOpen(false)} courseId={courseId}
        onSubmit={(d: CreateCTEventRequest) => createCT(d, { onSuccess: () => setCreateOpen(false) })}
        isLoading={isCreating} />
      <CTEventDetailModal isOpen={detailOpen} onClose={() => setDetailOpen(false)} ct={selected}
        onEnterMarks={teacher ? (ct: any) => { setDetailOpen(false); setMarksTarget(ct) } : undefined}
        onUploadKhata={teacher ? (ct: any) => { setDetailOpen(false); setKhataTarget(ct) } : undefined}
        onPublish={teacher ? (id: string) => { setDetailOpen(false); publishCT(id) } : undefined} />
      {marksTarget && (
        <CTMarkEntryModal isOpen={!!marksTarget} onClose={() => setMarksTarget(null)}
          ct={marksTarget} courseId={courseId} members={members} />
      )}
      {khataTarget && (
        <UploadKhataModal isOpen={!!khataTarget} onClose={() => setKhataTarget(null)}
          ct={khataTarget} courseId={courseId} />
      )}
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteCT(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) }) }}
        title="Delete CT Event" description="This will permanently delete this CT and all marks."
        confirmLabel="Delete" isLoading={isDeleting} />
    </div>
  )
}
