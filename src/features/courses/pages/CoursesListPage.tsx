import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, BookOpen, Filter } from 'lucide-react'
import Button from '@/components/ui/Button'
import CourseGrid from '../components/CourseGrid'
import CreateCourseModal from '../components/CreateCourseModal'
import JoinCourseModal from '../components/JoinCourseModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useCourses } from '../hooks/useCourses'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import { cn } from '@/utils/cn'

type FilterType = 'all' | 'active' | 'archived'

export default function CoursesListPage() {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
    const { courses, isLoading, createCourse, isCreating, archiveCourse, deleteCourse, isDeleting } = useCourses()

    const [createOpen, setCreateOpen] = useState(false)
    const [joinOpen, setJoinOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<FilterType>('all')

    const filtered = courses.filter((c) => {
        const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.courseCode.toLowerCase().includes(search.toLowerCase())
        const matchFilter = filter === 'all' || (filter === 'active' ? !c.isArchived : c.isArchived)
        return matchSearch && matchFilter
    })

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {teacher ? 'My Courses' : 'Enrolled Courses'}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {courses.length} course{courses.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {teacher ? (
                        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
                            Create Course
                        </Button>
                    ) : (
                        <Button leftIcon={<BookOpen className="w-4 h-4" />} onClick={() => setJoinOpen(true)}>
                            Join Course
                        </Button>
                    )}
                </div>
            </motion.div>

            {/* Search + Filter */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title or code..."
                        className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                </div>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted border border-border shrink-0">
                    {(['all', 'active', 'archived'] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                                filter === f ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Course grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-56 rounded-2xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : (
                <CourseGrid
                    courses={filtered}
                    onArchive={teacher ? archiveCourse : undefined}
                    onDelete={teacher ? (id) => setDeleteId(id) : undefined}
                    emptyTitle={search ? 'No courses match your search' : teacher ? 'No courses yet' : 'Not enrolled in any courses'}
                    emptyDescription={teacher ? 'Create your first course to get started' : 'Ask your teacher for a joining code'}
                    emptyAction={
                        teacher ? (
                            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
                                Create Course
                            </Button>
                        ) : (
                            <Button leftIcon={<BookOpen className="w-4 h-4" />} onClick={() => setJoinOpen(true)}>
                                Join Course
                            </Button>
                        )
                    }
                />
            )}

            {/* Modals */}
            <CreateCourseModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={(data) => { createCourse(data, { onSuccess: () => setCreateOpen(false) }) }}
                isLoading={isCreating}
            />

            <JoinCourseModal isOpen={joinOpen} onClose={() => setJoinOpen(false)} />

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => { if (deleteId) { deleteCourse(deleteId, { onSuccess: () => setDeleteId(null) }) } }}
                title="Delete Course"
                description="This will permanently delete the course and all its data. This action cannot be undone."
                confirmLabel="Delete Course"
                isLoading={isDeleting}
            />
        </div>
    )
}
