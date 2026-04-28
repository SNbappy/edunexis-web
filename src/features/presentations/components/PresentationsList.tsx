import { motion } from "framer-motion"
import { FileCheck2 } from "lucide-react"
import PresentationCard from "./PresentationCard"
import type { PresentationDto } from "@/types/presentation.types"
import type { ReactNode } from "react"

interface Props {
    presentations: PresentationDto[]
    onView: (p: PresentationDto) => void
    onDelete?: (id: string) => void
    onUpdateStatus?: (id: string, status: string) => void
    onEnterMarks?: (p: PresentationDto) => void
    emptyTitle?: string
    emptyDescription?: string
    emptyAction?: ReactNode
}

export default function PresentationsList({
    presentations, onView, onDelete, onUpdateStatus, onEnterMarks,
    emptyTitle = "No tests scheduled yet", emptyDescription, emptyAction,
}: Props) {
    if (presentations.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center"
            >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/50">
                    <FileCheck2 className="h-7 w-7 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />
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
            {presentations.map((p, i) => (
                <PresentationCard
                    key={p.id}
                    presentation={p}
                    index={i}
                    onView={onView}
                    onDelete={onDelete ? () => onDelete(p.id) : undefined}
                    onUpdateStatus={onUpdateStatus}
                    onEnterMarks={onEnterMarks}
                />
            ))}
        </div>
    )
}