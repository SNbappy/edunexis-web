import { useState } from 'react'
import { Plus, BookOpen, Compass, Search } from 'lucide-react'
import Button from '@/components/ui/Button'
import CourseCard from '../components/CourseCard'
import CreateCourseModal from '../components/CreateCourseModal'
import JoinCourseModal from '../components/JoinCourseModal'
import { SkeletonCard } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { useCourses } from '../hooks/useCourses'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import { cn } from '@/utils/cn'
import type { CourseDto } from '@/types/course.types'

type Tab = 'my' | 'explore'

export default function CoursesPage() {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
    const [tab, setTab] = useState<Tab>('my')
    const [showCreate, setShowCreate] = useState(false)
    const [joiningCourse, setJoiningCourse] = useState<CourseDto | null>(null)
    const [search, setSearch] = useState('')

    const {
        courses, allCourses,
        isLoading, isLoadingAll,
        createCourse, isCreating,
        requestJoin, isJoining,
        archiveCourse, deleteCourse,
    } = useCourses()

    const myIds = new Set(courses.map((c) => c.id))
    const displayed = tab === 'my' ? courses : allCourses

    const filtered = displayed.filter((c) =>
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.courseCode.toLowerCase().includes(search.toLowerCase()) ||
        c.department?.toLowerCase().includes(search.toLowerCase())
    )

    const active = filtered.filter((c) => !c.isArchived)
    const archived = filtered.filter((c) => c.isArchived)
    const loading = tab === 'my' ? isLoading : isLoadingAll

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Courses</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {teacher ? 'Manage your courses' : 'Your learning journey'}
                    </p>
                </div>
                {teacher && (
                    <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>
                        Create Course
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
                    <button
                        onClick={() => setTab('my')}
                        className={cn(
                            'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                            tab === 'my' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <BookOpen className="w-3.5 h-3.5" /> My Courses
                        {courses.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-bold">
                                {courses.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setTab('explore')}
                        className={cn(
                            'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                            tab === 'explore' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <Compass className="w-3.5 h-3.5" />
                        {teacher ? 'All Courses' : 'Explore'}
                        {tab === 'explore' && allCourses.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-muted-foreground/20 text-muted-foreground font-bold">
                                {allCourses.length}
                            </span>
                        )}
                    </button>
                </div>

                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search courses..."
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={tab === 'explore' ? <Compass className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
                    title={tab === 'explore' ? 'No courses found' : 'No courses yet'}
                    description={
                        tab === 'my'
                            ? teacher ? 'Create your first course to get started' : 'Switch to Explore tab to find and join courses'
                            : 'No courses have been created yet'
                    }
                    action={teacher && tab === 'my' ? (
                        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>
                            Create Course
                        </Button>
                    ) : undefined}
                />
            ) : (
                <div className="space-y-8">
                    {active.length > 0 && (
                        <div>
                            {archived.length > 0 && (
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    Active · {active.length}
                                </p>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {active.map((course, i) => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        index={i}
                                        tab={tab}
                                        isMine={myIds.has(course.id)}
                                        onArchive={teacher && myIds.has(course.id) ? archiveCourse : undefined}
                                        onDelete={teacher && myIds.has(course.id) ? deleteCourse : undefined}
                                        onJoin={!teacher && tab === 'explore' && !myIds.has(course.id)
                                            ? (id) => setJoiningCourse(allCourses.find(c => c.id === id) ?? null)
                                            : undefined
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {archived.length > 0 && tab === 'my' && (
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Archived · {archived.length}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {archived.map((course, i) => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        index={i}
                                        tab={tab}
                                        isMine={true}
                                        onArchive={teacher ? archiveCourse : undefined}
                                        onDelete={teacher ? deleteCourse : undefined}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <CreateCourseModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onSubmit={(data) => createCourse(data, { onSuccess: () => setShowCreate(false) })}
                isLoading={isCreating}
            />

            <JoinCourseModal
                course={joiningCourse}
                isOpen={!!joiningCourse}
                onClose={() => setJoiningCourse(null)}
                onSubmit={(courseId, code) => {
                    requestJoin({ courseId, code }, {
                        onSuccess: () => setJoiningCourse(null)
                    })
                }}
                isLoading={isJoining}
            />
        </div>
    )
}
