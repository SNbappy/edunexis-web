import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Mic } from "lucide-react"
import PresentationsList from "./PresentationsList"
import CreatePresentationModal from "./CreatePresentationModal"
import PresentationDetailModal from "./PresentationDetailModal"
import PresentationMarkEntryModal from "./PresentationMarkEntryModal"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import { usePresentations } from "../hooks/usePresentations"
import { useAttendance } from "@/features/attendance/hooks/useAttendance"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"
import { isTeacher } from "@/utils/roleGuard"
import type { PresentationDto } from "@/types/presentation.types"

interface Props { courseId: string }
type FilterTab = "all" | "upcoming" | "completed" | "cancelled"

export default function PresentationsTab({ courseId }: Props) {
  const { user }  = useAuthStore()
  const { dark }  = useThemeStore()
  const teacher   = isTeacher(user?.role ?? "Student")

  const { presentations, isLoading, createPresentation, isCreating, deletePresentation, isDeleting, updateStatus } = usePresentations(courseId)
  const { members } = useAttendance(courseId)

  const [createOpen, setCreateOpen] = useState(false)
  const [selected,   setSelected]   = useState<PresentationDto | null>(null)
  const [markEntry,  setMarkEntry]  = useState<PresentationDto | null>(null)
  const [deleteId,   setDeleteId]   = useState<string | null>(null)
  const [filter,     setFilter]     = useState<FilterTab>("all")

  const upcomingCount  = presentations.filter((p: any) => p.status === "Scheduled" || p.status === "Ongoing").length
  const completedCount = presentations.filter((p: any) => p.status === "Completed").length
  const cancelledCount = presentations.filter((p: any) => p.status === "Cancelled").length

  const filtered = presentations.filter((p: any) => {
    if (filter === "upcoming")  return p.status === "Scheduled" || p.status === "Ongoing"
    if (filter === "completed") return p.status === "Completed"
    if (filter === "cancelled") return p.status === "Cancelled"
    return true
  })

  // Theme
  const cardBg  = dark ? "rgba(16,24,44,0.75)" : "rgba(255,255,255,0.92)"
  const blur    = "blur(20px)"
  const border  = dark ? "rgba(99,102,241,0.15)" : "#e5e7eb"
  const textMain= dark ? "#e2e8f8" : "#111827"
  const textSub = dark ? "#8896c8" : "#6b7280"
  const inputBg = dark ? "rgba(255,255,255,0.04)" : "#f9fafb"
  const accentColor = "#0891b2"
  const accentBg    = dark ? "rgba(8,145,178,0.15)"  : "#ecfeff"
  const accentBorder= dark ? "rgba(6,182,212,0.25)"  : "#a5f3fc"

  const FILTERS = [
    { key: "all" as FilterTab,       label: "All",       count: presentations.length },
    { key: "upcoming" as FilterTab,  label: "Upcoming",  count: upcomingCount        },
    { key: "completed" as FilterTab, label: "Completed", count: completedCount       },
    { key: "cancelled" as FilterTab, label: "Cancelled", count: cancelledCount       },
  ]

  return (
    <div className="space-y-4 max-w-3xl mx-auto">

      {/* Toolbar */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 p-4 rounded-2xl flex-wrap"
        style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: accentBg, border: `1px solid ${accentBorder}` }}>
            <Mic style={{ width: 16, height: 16, color: accentColor }} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold" style={{ color: textMain }}>Presentations</h2>
            <p className="text-[11px]" style={{ color: textSub }}>
              {upcomingCount > 0
                ? <span style={{ color: "#059669" }}>{upcomingCount} upcoming</span>
                : <span>No upcoming presentations</span>
              }
              {completedCount > 0 && <span style={{ color: textSub }}> - {completedCount} completed</span>}
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
                  background: filter === tab.key ? accentBg : "transparent",
                  color:      filter === tab.key ? accentColor : textSub,
                  border:     filter === tab.key ? `1px solid ${accentBorder}` : "1px solid transparent",
                }}>
                {tab.label}
                {tab.count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: filter === tab.key ? accentBg : (dark ? "rgba(255,255,255,0.07)" : "#f3f4f6"), color: filter === tab.key ? accentColor : textSub }}>
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
              style={{ background: "linear-gradient(135deg,#0891b2,#6366f1)", boxShadow: "0 4px 16px rgba(8,145,178,0.35)" }}>
              <Plus style={{ width: 14, height: 14 }} /> Schedule
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 rounded-2xl animate-pulse"
              style={{ background: dark ? "rgba(8,145,178,0.06)" : "#f3f4f6" }} />
          ))}
        </div>
      ) : (
        <PresentationsList
          presentations={filtered}
          onView={setSelected}
          onDelete={teacher ? (id: string) => setDeleteId(id) : undefined}
          onUpdateStatus={teacher ? (id: string, status: any) => updateStatus({ id, status }) : undefined}
          emptyTitle={filter === "all" ? "No presentations yet" : `No ${filter} presentations`}
          emptyDescription={teacher ? "Schedule your first presentation to get started" : "No presentations scheduled yet"}
          emptyAction={teacher
            ? <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white"
                style={{ background: "linear-gradient(135deg,#0891b2,#6366f1)", boxShadow: "0 4px 16px rgba(8,145,178,0.3)" }}>
                <Plus style={{ width: 14, height: 14 }} /> Schedule Presentation
              </motion.button>
            : undefined
          }
        />
      )}

      <CreatePresentationModal isOpen={createOpen} onClose={() => setCreateOpen(false)}
        courseId={courseId}
        onSubmit={(data: any) => createPresentation(data, { onSuccess: () => setCreateOpen(false) })}
        isLoading={isCreating} />
      <PresentationDetailModal isOpen={!!selected && !markEntry} onClose={() => setSelected(null)}
        presentation={selected}
        onEnterMarks={(p: any) => { setSelected(null); setMarkEntry(p) }} />
      <PresentationMarkEntryModal isOpen={!!markEntry} onClose={() => setMarkEntry(null)}
        presentation={markEntry} courseId={courseId} members={members} />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deletePresentation(deleteId, { onSuccess: () => setDeleteId(null) }) }}
        title="Delete Presentation"
        description="This will permanently delete the presentation and all associated marks."
        confirmLabel="Delete" isLoading={isDeleting} />
    </div>
  )
}
