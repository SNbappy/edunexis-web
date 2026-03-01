import AssignmentCard from './AssignmentCard'
import EmptyState from '@/components/ui/EmptyState'
import { ClipboardList } from 'lucide-react'
import type { AssignmentDto } from '@/types/assignment.types'

interface Props {
    assignments: AssignmentDto[]
    onView: (a: AssignmentDto) => void
    onDelete?: (id: string) => void
    onPublish?: (id: string) => void
    onClose?: (id: string) => void
    emptyTitle?: string
    emptyDescription?: string
    emptyAction?: React.ReactNode
}

export default function AssignmentsList({ assignments, onView, onDelete, onPublish, onClose, emptyTitle, emptyDescription, emptyAction }: Props) {
    if (assignments.length === 0) {
        return (
            <EmptyState
                icon={<ClipboardList className="w-8 h-8" />}
                title={emptyTitle ?? 'No assignments yet'}
                description={emptyDescription}
                action={emptyAction}
            />
        )
    }

    return (
        <div className="space-y-3">
            {assignments.map((a, i) => (
                <AssignmentCard
                    key={a.id}
                    assignment={a}
                    index={i}
                    onView={onView}
                    onDelete={onDelete}
                    onPublish={onPublish}
                    onClose={onClose}
                />
            ))}
        </div>
    )
}
