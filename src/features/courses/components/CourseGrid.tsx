import CourseCard from './CourseCard'
import EmptyState from '@/components/ui/EmptyState'
import { BookOpen } from 'lucide-react'
import type { CourseSummaryDto } from '@/types/course.types'

interface Props {
    courses: CourseSummaryDto[]
    onArchive?: (id: string) => void
    onDelete?: (id: string) => void
    emptyTitle?: string
    emptyDescription?: string
    emptyAction?: React.ReactNode
}

export default function CourseGrid({ courses, onArchive, onDelete, emptyTitle = 'No courses yet', emptyDescription, emptyAction }: Props) {
    if (courses.length === 0) {
        return (
            <EmptyState
                icon={<BookOpen className="w-8 h-8" />}
                title={emptyTitle}
                description={emptyDescription}
                action={emptyAction}
            />
        )
    }
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {courses.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} onArchive={onArchive} onDelete={onDelete} />
            ))}
        </div>
    )
}
