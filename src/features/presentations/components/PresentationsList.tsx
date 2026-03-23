import PresentationCard from './PresentationCard'
import type { PresentationDto } from '@/types/presentation.types'
import { ReactNode } from 'react'

interface Props {
    presentations: PresentationDto[]
    onView: (p: PresentationDto) => void
    onDelete?: (p: PresentationDto) => void
    onUpdateStatus?: (id: string, status: string) => void
    onEnterMarks?: (p: PresentationDto) => void
    emptyTitle?: string
    emptyDescription?: string
    emptyAction?: ReactNode
}

export default function PresentationsList({
    presentations, onView, onDelete, onUpdateStatus, onEnterMarks,
    emptyTitle = 'No presentations scheduled', emptyDescription = '', emptyAction,
}: Props) {
    if (presentations.length === 0) return (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <p className="text-base font-semibold text-foreground">{emptyTitle}</p>
            {emptyDescription && <p className="text-sm text-muted-foreground">{emptyDescription}</p>}
            {emptyAction}
        </div>
    )

    return (
        <div className="space-y-3">
            {presentations.map((p, i) => (
                <PresentationCard
                    key={p.id}
                    presentation={p}
                    index={i}
                    onView={onView}
                    onDelete={onDelete}
                    onUpdateStatus={onUpdateStatus}
                    onEnterMarks={onEnterMarks}
                />
            ))}
        </div>
    )
}
