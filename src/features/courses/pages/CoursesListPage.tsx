import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, BookOpen, Users, Archive } from 'lucide-react'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import CourseGrid from '../components/CourseGrid'
import CreateCourseModal from '../components/CreateCourseModal'
import JoinCourseModal from '../components/JoinCourseModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useCourses } from '../hooks/useCourses'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'

type FilterTab = 'active' | 'archived'

export default function CoursesListPage() {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')

    const {
        courses, isLoading,
        createCourse, isCreating,
        joinCourse, isJoining,
        archiveCourse, deleteCourse, isDeleting,
    } = useCourses()

    const [createOpen, setCreateOpen] = useState(false)
    const [joinOpen, setJoinOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [filter, setFilter] = useState<FilterTab>('active')
    const [search, setSearch] = useState('')

    const filtered = courses
        .filter((c) => filter === 'active' ? !c.isArchived : c.isArchived)
        .filter((c) =>
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.courseCode.toLowerCase().includes(search.toLowerCase()) ||
            c.department.toLowerCase().includes(search.toLowerCase())
        )

    const archivedCount = courses.filter((c) => c.isArchived).length

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-4 flex-wrap"
            >
                <div>
                    <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {courses.length} course{courses.length !== 1 ? 's' : ''} total
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {teacher ? (
                        <Button
                            leftIcon={<Plus className="w-4 h-4" />}
                            onClick={() => setCreateOpen(true)}
                        >
                            Create Course
                        </Button>
                    ) : (
                        <Button
                            variant="secondary"
                            leftIcon={<Users className="w-4 h-4" />}
                            onClick={() => setJoinOpen(true)}
                        >
                            Join Course
                        </Button>
                    )}
                </div>
            </motion.div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
                <Tabs
                    variant="pills"
                    tabs={[
                        { key: 'active', label: 'Active', icon: <BookOpen className="w-3.5 h-3.5" /> },
                        { key: 'archived', label: 'Archived', icon: <Archive className="w-3.5 h-3.5" />, badge: archivedCount },
                    ]}
                    active={filter}
                    onChange={(k) => setFilter(k as FilterTab)}
                />
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-sm ml-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search courses..."
                        className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-60 rounded-2xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : (
                <CourseGrid
                    courses={filtered}
                    onArchive={teacher ? archiveCourse : undefined}
                    onDelete={teacher ? (id) => setDeleteId(id) : undefined}
                    emptyTitle={filter === 'active' ? 'No active courses' : 'No archived courses'}
                    emptyDescription={
                        teacher
                            ? filter === 'active'
                                ? 'Create your first course to get started'
                                : 'Archived courses will appear here'
                            : filter === 'active'
                                ? 'Join a course using the joining code from your teacher'
                                : 'Your archived courses will appear here'
                    }
                    emptyAction={
                        teacher && filter === 'active' ? (
                            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
                                Create Course
                            </Button>
                        ) : !teacher && filter === 'active' ? (
                            <Button variant="secondary" leftIcon={<Users className="w-4 h-4" />} onClick={() => setJoinOpen(true)}>
                                Join a Course
                            </Button>
                        ) : undefined
                    }
                />
            )}

            {/* Modals */}
            <CreateCourseModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={(data) => createCourse(data, { onSuccess: () => setCreateOpen(false) })}
                isLoading={isCreating}
            />

            <JoinCourseModal
                isOpen={joinOpen}
                onClose={() => setJoinOpen(false)}
                onJoin={(data) => joinCourse(data, { onSuccess: () => setJoinOpen(false) })}
                isLoading={isJoining}
            />

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => { if (deleteId) deleteCourse(deleteId, { onSuccess: () => setDeleteId(null) }) }}
                title="Delete Course"
                description="This will permanently delete the course and all its content. This action cannot be undone."
                confirmLabel="Delete Course"
                isLoading={isDeleting}
            />
        </div>
    )
}
