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
    const {
        announcements, isLoading,
        create, isCreating,
        deleteAnnouncement, togglePin,
    } = useAnnouncements(courseId)

    if (isLoading) {
        return (
            <div className="space-y-4">
                <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
        )
    }

    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            {teacher && (
                <CreateAnnouncementForm
                    courseId={courseId}
                    onSubmit={create}
                    isLoading={isCreating}
                />
            )}

            {announcements.length === 0 ? (
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
                announcements.map((a, i) => (
                    <AnnouncementCard
                        key={a.id}
                        announcement={a}
                        index={i}
                        canPin={teacher}
                        canDelete={teacher || a.authorId === user?.id}
                        onPin={togglePin}
                        onDelete={deleteAnnouncement}
                    />
                ))
            )}
        </div>
    )
}
