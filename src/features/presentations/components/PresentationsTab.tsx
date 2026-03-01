import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import { SkeletonCard } from '@/components/ui/Skeleton'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import PresentationsList from './PresentationsList'
import CreatePresentationModal from './CreatePresentationModal'
import PresentationDetailModal from './PresentationDetailModal'
import PresentationMarkEntryModal from './PresentationMarkEntryModal'
import { usePresentations } from '../hooks/usePresentations'
import { useAttendance } from '@/features/attendance/hooks/useAttendance'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { PresentationDto } from '@/types/presentation.types'

interface Props { courseId: string }
type FilterTab = 'all' | 'upcoming' | 'completed' | 'cancelled'

export default function PresentationsTab({ courseId }: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')

    const { presentations, isLoading, createPresentation, isCreating, deletePresentation, isDeleting, updateStatus } = usePresentations(courseId)
    const { members } = useAttendance(courseId)

    const [createOpen, setCreateOpen] = useState(false)
    const [selected, setSelected] = useState<PresentationDto | null>(null)
    const [markEntry, setMarkEntry] = useState<PresentationDto | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [filter, setFilter] = useState<FilterTab>('all')

    const filtered = presentations.filter((p) => {
        if (filter === 'all') return true
        if (filter === 'upcoming') return p.status === 'Scheduled' || p.status === 'Ongoing'
        if (filter === 'completed') return p.status === 'Completed'
        if (filter === 'cancelled') return p.status === 'Cancelled'
        return true
    })

    const upcomingCount = presentations.filter((p) => p.status === 'Scheduled' || p.status === 'Ongoing').length

    return (
        <div className="space-y-5 max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Presentations</h2>
                    {upcomingCount > 0 && (
                        <p className="text-xs text-violet-500 font-medium mt-0.5">{upcomingCount} upcoming</p>
                    )}
                </div>
                {teacher && (
                    <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
                        Schedule Presentation
                    </Button>
                )}
            </motion.div>

            <Tabs
                variant="boxed"
                tabs={[
                    { key: 'all', label: 'All' },
                    { key: 'upcoming', label: 'Upcoming', badge: upcomingCount },
                    { key: 'completed', label: 'Completed' },
                    { key: 'cancelled', label: 'Cancelled' },
                ]}
                active={filter}
                onChange={(k) => setFilter(k as FilterTab)}
            />

            {isLoading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} className="h-24" />)}</div>
            ) : (
                <PresentationsList
                    presentations={filtered}
                    onView={setSelected}
                    onDelete={teacher ? (id) => setDeleteId(id) : undefined}
                    onUpdateStatus={teacher ? (id, status) => updateStatus({ id, status }) : undefined}
                    emptyTitle={filter === 'all' ? 'No presentations yet' : `No ${filter} presentations`}
                    emptyDescription={teacher ? 'Schedule your first presentation' : 'No presentations scheduled yet'}
                    emptyAction={teacher ? (
                        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
                            Schedule Presentation
                        </Button>
                    ) : undefined}
                />
            )}

            <CreatePresentationModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                courseId={courseId}
                onSubmit={(data) => createPresentation(data, { onSuccess: () => setCreateOpen(false) })}
                isLoading={isCreating}
            />

            <PresentationDetailModal
                isOpen={!!selected && !markEntry}
                onClose={() => setSelected(null)}
                presentation={selected}
                onEnterMarks={(p) => { setSelected(null); setMarkEntry(p) }}
            />

            <PresentationMarkEntryModal
                isOpen={!!markEntry}
                onClose={() => setMarkEntry(null)}
                presentation={markEntry}
                courseId={courseId}
                members={members}
            />

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => { if (deleteId) deletePresentation(deleteId, { onSuccess: () => setDeleteId(null) }) }}
                title="Delete Presentation"
                description="This will permanently delete the presentation and all associated marks."
                confirmLabel="Delete"
                isLoading={isDeleting}
            />
        </div>
    )
}
