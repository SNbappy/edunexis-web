import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, ClipboardCheck } from 'lucide-react'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import { SkeletonCard } from '@/components/ui/Skeleton'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import CTEventsList from './CTEventsList'
import CreateCTEventModal from './CreateCTEventModal'
import CTEventDetailModal from './CTEventDetailModal'
import CTMarkEntryModal from './CTMarkEntryModal'
import { useCTEvents } from '../hooks/useCTEvents'
import { useAttendance } from '@/features/attendance/hooks/useAttendance'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { CTEventDto } from '@/types/ct.types'

interface Props { courseId: string }
type FilterTab = 'all' | 'upcoming' | 'completed' | 'cancelled'

export default function CTTab({ courseId }: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')

    const { ctEvents, isLoading, createCTEvent, isCreating, deleteCTEvent, isDeleting, updateStatus } = useCTEvents(courseId)
    const { members } = useAttendance(courseId)

    const [createOpen, setCreateOpen] = useState(false)
    const [selected, setSelected] = useState<CTEventDto | null>(null)
    const [markEntry, setMarkEntry] = useState<CTEventDto | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [filter, setFilter] = useState<FilterTab>('all')

    const filtered = ctEvents.filter((ct) => {
        if (filter === 'all') return true
        if (filter === 'upcoming') return ct.status === 'Scheduled' || ct.status === 'Ongoing'
        if (filter === 'completed') return ct.status === 'Completed'
        if (filter === 'cancelled') return ct.status === 'Cancelled'
        return true
    })

    const upcomingCount = ctEvents.filter((ct) => ct.status === 'Scheduled' || ct.status === 'Ongoing').length

    return (
        <div className="space-y-5 max-w-3xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Class Tests (CT)</h2>
                    {upcomingCount > 0 && (
                        <p className="text-xs text-primary font-medium mt-0.5">{upcomingCount} upcoming</p>
                    )}
                </div>
                {teacher && (
                    <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
                        Schedule CT
                    </Button>
                )}
            </motion.div>

            {/* Filter tabs */}
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

            {/* List */}
            {isLoading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} className="h-24" />)}</div>
            ) : (
                <CTEventsList
                    ctEvents={filtered}
                    onView={setSelected}
                    onDelete={teacher ? (id) => setDeleteId(id) : undefined}
                    onUpdateStatus={teacher ? (ctId, status) => updateStatus({ ctId, status }) : undefined}
                    emptyTitle={filter === 'all' ? 'No CT events yet' : `No ${filter} events`}
                    emptyDescription={teacher ? 'Schedule your first class test' : 'No class tests scheduled yet'}
                    emptyAction={teacher ? (
                        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
                            Schedule CT
                        </Button>
                    ) : undefined}
                />
            )}

            {/* Modals */}
            <CreateCTEventModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                courseId={courseId}
                onSubmit={(data) => createCTEvent(data, { onSuccess: () => setCreateOpen(false) })}
                isLoading={isCreating}
            />

            <CTEventDetailModal
                isOpen={!!selected && !markEntry}
                onClose={() => setSelected(null)}
                ct={selected}
                onEnterMarks={(ct) => { setSelected(null); setMarkEntry(ct) }}
            />

            <CTMarkEntryModal
                isOpen={!!markEntry}
                onClose={() => setMarkEntry(null)}
                ct={markEntry}
                courseId={courseId}
                members={members}
            />

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => { if (deleteId) deleteCTEvent(deleteId, { onSuccess: () => setDeleteId(null) }) }}
                title="Delete CT Event"
                description="This will permanently delete the CT event and all associated marks."
                confirmLabel="Delete"
                isLoading={isDeleting}
            />
        </div>
    )
}
