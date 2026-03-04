import CTEventCard from './CTEventCard'
import type { CTEventDto } from '@/types/ct.types'
import { ReactNode } from 'react'

interface Props {
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
    ctEvents, onView, onDelete, onPublish, onUnpublish,
    onUploadKhata, onEnterMarks,
    emptyTitle = 'No CT events', emptyDescription = '', emptyAction
}: Props) {
    if (ctEvents.length === 0) return (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <p className="text-base font-semibold text-foreground">{emptyTitle}</p>
            {emptyDescription && <p className="text-sm text-muted-foreground">{emptyDescription}</p>}
            {emptyAction}
        </div>
    )

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
