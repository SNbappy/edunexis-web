import { motion } from "framer-motion"
import { BookMarked } from "lucide-react"
import CTEventCard from "./CTEventCard"
import type { CTEventDto } from "@/types/ct.types"
import type { ReactNode } from "react"

interface CTEventsListProps {
  ctEvents: CTEventDto[]
  onView: (ct: CTEventDto) => void
  onDelete?: (ct: CTEventDto) => void
  onPublish?: (id: string) => void
  onUnpublish?: (id: string) => void
  onUploadKhata?: (ct: CTEventDto) => void
  onEnterMarks?: (ct: CTEventDto) => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
}

export default function CTEventsList({
  ctEvents, onView, onDelete, onPublish, onUnpublish, onUploadKhata, onEnterMarks,
  emptyTitle = "No class tests yet", emptyDescription, emptyAction,
}: CTEventsListProps) {
  if (ctEvents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-300 bg-teal-100 dark:border-teal-700 dark:bg-teal-900/60">
          <BookMarked className="h-7 w-7 text-teal-700 dark:text-teal-200" strokeWidth={1.75} />
        </div>
        <h3 className="mt-5 font-display text-[16px] font-bold text-foreground">
          {emptyTitle}
        </h3>
        {emptyDescription && (
          <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
            {emptyDescription}
          </p>
        )}
        {emptyAction && <div className="mt-5">{emptyAction}</div>}
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      {ctEvents.map((ct, i) => (
        <CTEventCard
          key={ct.id}
          ct={ct}
          index={i}
          onView={onView}
          onDelete={onDelete}
          onPublish={onPublish}
          onUnpublish={onUnpublish}
          onUploadKhata={onUploadKhata}
          onEnterMarks={onEnterMarks}
        />
      ))}
    </div>
  )
}