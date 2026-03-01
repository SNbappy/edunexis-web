import { useMemo } from 'react'
import { Megaphone } from 'lucide-react'
import AnnouncementCard from './AnnouncementCard'
import CreateAnnouncementForm from './CreateAnnouncementForm'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useAnnouncements } from '../hooks/useAnnouncements'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'

interface Props { courseId: string }

export default function AnnouncementFeed({ courseId }: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
    const { announcements, isLoading, create, isCreating, deleteAnnouncement, pinAnnouncement } = useAnnouncements(courseId)

    // Pinned first, then newest
    const sorted = useMemo(() => {
        return [...announcements].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1
            if (!a.isPinned && b.isPinned) return 1
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    }, [announcements])

    if (isLoading) {
        return (
            <div className="space-y-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        )
    }

    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            {/* Create form — teachers only */}
            {teacher && (
                <CreateAnnouncementForm
                    courseId={courseId}
                    onSubmit={create}
                    isLoading={isCreating}
                />
            )}

            {/* Feed */}
            {sorted.length === 0 ? (
                <EmptyState
                    icon={<Megaphone className="w-8 h-8" />}
                    title="No announcements yet"
                    description={
                        teacher
                            ? 'Post an announcement to keep your students informed'
                            : 'Your teacher has not posted any announcements yet'
                    }
                />
            ) : (
                sorted.map((a, i) => (
                    <AnnouncementCard
                        key={a.id}
                        announcement={a}
                        index={i}
                        onDelete={teacher ? deleteAnnouncement : undefined}
                        onPin={teacher ? pinAnnouncement : undefined}
                    />
                ))
            )}
        </div>
    )
}
