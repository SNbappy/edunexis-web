import CTEventCard from './CTEventCard'
import EmptyState from '@/components/ui/EmptyState'
import { ClipboardCheck } from 'lucide-react'
import type { CTEventDto } from '@/types/ct.types'

interface Props {
    ctEvents: CTEventDto[]
    onView: (ct: CTEventDto) => void
    onDelete?: (id: string) => void
    onUpdateStatus?: (ctId: string, status: string) => void
    emptyTitle?: string
    emptyDescription?: string
    emptyAction?: React.ReactNode
}

export default function CTEventsList({ ctEvents, onView, onDelete, onUpdateStatus, emptyTitle, emptyDescription, emptyAction }: Props) {
    if (ctEvents.length === 0) {
        return (
            <EmptyState
                icon={<ClipboardCheck className="w-8 h-8" />}
                title={emptyTitle ?? 'No CT events scheduled'}
                description={emptyDescription}
                action={emptyAction}
            />
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
                    onUpdateStatus={onUpdateStatus}
                />
            ))}
        </div>
    )
}
