import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import { SkeletonCard } from '@/components/ui/Skeleton'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import CTEventsList from './CTEventsList'
import CreateCTEventModal from './CreateCTEventModal'
import { useCTEvents } from '../hooks/useCTEvents'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { CTEventDto } from '@/types/ct.types'

interface Props { courseId: string }
type FilterTab = 'all' | 'draft' | 'published'

export default function CTTab({ courseId }: Props) {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const teacher  = isTeacher(user?.role ?? 'Student')

    const {
        ctEvents, isLoading,
        createCT, isCreating,
        deleteCT, isDeleting,
        publishCT, unpublishCT,
    } = useCTEvents(courseId)

    const [createOpen, setCreateOpen] = useState(false)
    const [deleteId,   setDeleteId]   = useState<string | null>(null)
    const [filter,     setFilter]     = useState<FilterTab>('all')

    const filtered = ctEvents.filter(ct => {
        if (filter === 'draft')     return ct.status === 'Draft'
        if (filter === 'published') return ct.status === 'Published'
        return true
    })

    const draftCount = ctEvents.filter(ct => ct.status === 'Draft').length

    const goToDetail = (ct: CTEventDto) =>
        navigate('/courses/' + courseId + '/ct/' + ct.id)

    const handleEnterMarks = (ct: CTEventDto) => {
        if (ct.status === 'Published') {
            toast.error('Cannot edit a published CT. Unpublish it first.')
            return
        }
        goToDetail(ct)
    }

    const handleUploadKhata = (ct: CTEventDto) => {
        if (ct.status === 'Published') {
            toast.error('Cannot re-upload khata on a published CT. Unpublish it first.')
            return
        }
        goToDetail(ct)
    }

    const handleDelete = (ct: CTEventDto) => {
        if (ct.status === 'Published') {
            toast.error('Cannot delete a published CT. Unpublish it first.')
            return
        }
        setDeleteId(ct.id)
    }

    return (
        <div className="space-y-5 max-w-3xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3"
            >
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Class Tests (CT)</h2>
                    {draftCount > 0 && (
                        <p className="text-xs text-amber-500 font-medium mt-0.5">
                            {draftCount} pending publication
                        </p>
                    )}
                </div>
                {teacher && (
                    <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
                        New CT
                    </Button>
                )}
            </motion.div>

            <Tabs
                variant="boxed"
                tabs={[
                    { key: 'all',       label: 'All'                      },
                    { key: 'draft',     label: 'Draft', badge: draftCount },
                    { key: 'published', label: 'Published'                },
                ]}
                active={filter}
                onChange={k => setFilter(k as FilterTab)}
            />

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <SkeletonCard key={i} className="h-24" />)}
                </div>
            ) : (
                <CTEventsList
                    ctEvents={filtered}
                    onView={goToDetail}
                    onDelete={teacher ? handleDelete : undefined}
                    onPublish={teacher ? id => publishCT(id) : undefined}
                    onUnpublish={teacher ? id => unpublishCT(id) : undefined}
                    onUploadKhata={teacher ? handleUploadKhata : undefined}
                    onEnterMarks={teacher ? handleEnterMarks : undefined}
                    emptyTitle={filter === 'all' ? 'No CT events yet' : ('No ' + filter + ' CTs')}
                    emptyDescription={teacher ? 'Create your first class test' : 'No class tests yet'}
                    emptyAction={teacher && filter === 'all' ? (
                        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
                            New CT
                        </Button>
                    ) : undefined}
                />
            )}

            <CreateCTEventModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                courseId={courseId}
                onSubmit={(data) => createCT(data, { onSuccess: () => setCreateOpen(false) })}
                isLoading={isCreating}
            />

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => {
                    if (deleteId) deleteCT(deleteId, { onSuccess: () => setDeleteId(null) })
                }}
                title="Delete CT Event"
                description="This will permanently delete the CT and all associated marks. This action cannot be undone."
                confirmLabel="Delete"
                isLoading={isDeleting}
            />
        </div>
    )
}



