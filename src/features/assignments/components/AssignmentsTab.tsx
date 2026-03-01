import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter } from 'lucide-react'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import { SkeletonCard } from '@/components/ui/Skeleton'
import AssignmentsList from './AssignmentsList'
import CreateAssignmentModal from './CreateAssignmentModal'
import AssignmentDetailModal from './AssignmentDetailModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useAssignments } from '../hooks/useAssignments'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { AssignmentDto } from '@/types/assignment.types'

interface Props { courseId: string }

type FilterTab = 'all' | 'active' | 'draft' | 'closed'

export default function AssignmentsTab({ courseId }: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')

    const {
        assignments, isLoading,
        createAssignment, isCreating,
        deleteAssignment, isDeleting,
        publishAssignment, closeAssignment,
    } = useAssignments(courseId)

    const [createOpen, setCreateOpen] = useState(false)
    const [selected, setSelected] = useState<AssignmentDto | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [filter, setFilter] = useState<FilterTab>('all')

    const filterTabs = teacher
        ? [
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Published' },
            { key: 'draft', label: 'Drafts' },
            { key: 'closed', label: 'Closed' },
        ]
        : [
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'closed', label: 'Closed' },
        ]

    const filtered = assignments.filter((a) => {
        if (filter === 'all') return true
        if (filter === 'active') return a.status === 'Published'
        if (filter === 'draft') return a.status === 'Draft'
        if (filter === 'closed') return a.status === 'Closed'
        return true
    })

    // For students: pending (not submitted) + submitted + graded counts
    const pendingCount = !teacher
        ? assignments.filter((a) => a.status === 'Published' && !a.mySubmission).length
        : 0

    return (
        <div className="space-y-5 max-w-3xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Assignments</h2>
                    {!teacher && pendingCount > 0 && (
                        <p className="text-xs text-amber-500 font-medium mt-0.5">{pendingCount} pending submission{pendingCount > 1 ? 's' : ''}</p>
                    )}
                </div>
                {teacher && (
                    <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
                        Create Assignment
                    </Button>
                )}
            </motion.div>

            {/* Filter tabs */}
            <Tabs
                variant="boxed"
                tabs={filterTabs.map((t) => ({
                    ...t,
                    badge: t.key === 'active' && !teacher ? pendingCount : undefined,
                }))}
                active={filter}
                onChange={(k) => setFilter(k as FilterTab)}
            />

            {/* List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => <SkeletonCard key={i} className="h-24" />)}
                </div>
            ) : (
                <AssignmentsList
                    assignments={filtered}
                    onView={setSelected}
                    onDelete={teacher ? (id) => setDeleteId(id) : undefined}
                    onPublish={teacher ? publishAssignment : undefined}
                    onClose={teacher ? closeAssignment : undefined}
                    emptyTitle={filter === 'all' ? 'No assignments yet' : `No ${filter} assignments`}
                    emptyDescription={
                        teacher
                            ? 'Create your first assignment to get started'
                            : 'Your teacher has not posted any assignments yet'
                    }
                    emptyAction={
                        teacher ? (
                            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
                                Create Assignment
                            </Button>
                        ) : undefined
                    }
                />
            )}

            {/* Modals */}
            <CreateAssignmentModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                courseId={courseId}
                onSubmit={(data) => createAssignment(data, { onSuccess: () => setCreateOpen(false) })}
                isLoading={isCreating}
            />

            <AssignmentDetailModal
                isOpen={!!selected}
                onClose={() => setSelected(null)}
                assignment={selected}
                courseId={courseId}
            />

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => {
                    if (deleteId) deleteAssignment(deleteId, { onSuccess: () => setDeleteId(null) })
                }}
                title="Delete Assignment"
                description="This will permanently delete the assignment and all its submissions."
                confirmLabel="Delete"
                isLoading={isDeleting}
            />
        </div>
    )
}
