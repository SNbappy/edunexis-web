import { ReactNode } from "react"
import { motion } from "framer-motion"
import { BookMarked } from "lucide-react"
import CTEventCard from "./CTEventCard"
import { useThemeStore } from "@/store/themeStore"
import type { CTEventDto } from "@/types/ct.types"

interface Props {
  ctEvents:         CTEventDto[]
  onView:           (ct: CTEventDto) => void
  onDelete?:        (ct: CTEventDto) => void
  onPublish?:       (id: string) => void
  onUnpublish?:     (id: string) => void
  onUploadKhata?:   (ct: CTEventDto) => void
  onEnterMarks?:    (ct: CTEventDto) => void
  emptyTitle?:      string
  emptyDescription?: string
  emptyAction?:     ReactNode
}

export default function CTEventsList({ ctEvents, onView, onDelete, onPublish, onUnpublish, onUploadKhata, onEnterMarks, emptyTitle = "No CT events", emptyDescription = "", emptyAction }: Props) {
  const { dark } = useThemeStore()

  if (ctEvents.length === 0) return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 rounded-2xl text-center"
      style={{
        background: dark ? "rgba(16,24,44,0.75)" : "rgba(255,255,255,0.92)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: `2px dashed ${dark ? "rgba(124,58,237,0.2)" : "#ddd6fe"}`,
      }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: dark ? "rgba(124,58,237,0.12)" : "#f5f3ff", border: dark ? "1px solid rgba(124,58,237,0.25)" : "1px solid #ddd6fe" }}>
        <BookMarked style={{ width: 28, height: 28, color: "#7c3aed" }} strokeWidth={1.5} />
      </div>
      <p className="text-[15px] font-bold mb-1" style={{ color: dark ? "#e2e8f8" : "#111827" }}>{emptyTitle}</p>
      {emptyDescription && <p className="text-[13px] mb-5" style={{ color: dark ? "#8896c8" : "#6b7280" }}>{emptyDescription}</p>}
      {emptyAction}
    </motion.div>
  )

  return (
    <div className="space-y-3">
      {ctEvents.map((ct, i) => (
        <CTEventCard key={ct.id} ct={ct} index={i}
          onView={onView} onDelete={onDelete} onPublish={onPublish}
          onUnpublish={onUnpublish} onUploadKhata={onUploadKhata} onEnterMarks={onEnterMarks} />
      ))}
    </div>
  )
}
