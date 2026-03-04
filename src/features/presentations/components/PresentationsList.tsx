import PresentationCard from './PresentationCard'
import EmptyState from '@/components/ui/EmptyState'
import { Mic } from 'lucide-react'
import type { PresentationDto } from '@/types/presentation.types'

interface Props {
    presentations: PresentationDto[]
    onDelete?: (id: string) => void
    onUpdateStatus?: (id: string, status: string) => void
    emptyTitle?: string
    emptyDescription?: string
    emptyAction?: React.ReactNode
}

export default function PresentationsList({ presentations, onDelete, onUpdateStatus, emptyTitle, emptyDescription, emptyAction }: Props) {
    if (presentations.length === 0) {
        return <EmptyState icon={<Mic className="w-8 h-8" />} title={emptyTitle ?? 'No presentations scheduled'} description={emptyDescription} action={emptyAction} />
    }
    return (
        <div className="space-y-3">
            {presentations.map((p, i) => (
                <PresentationCard key={p.id} presentation={p} index={i} onDelete={onDelete} onUpdateStatus={onUpdateStatus} />
            ))}
        </div>
    )
}
