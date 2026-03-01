import { useState } from 'react'
import { useParams, Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Settings, Archive, Users } from 'lucide-react'
import CourseTabNav from '../components/CourseTabNav'
import CourseInfoCard from '../components/CourseInfoCard'
import EditCourseModal from '../components/EditCourseModal'
import JoinRequestsPanel from '../components/JoinRequestsPanel'
import CourseMembersList from '../components/CourseMembersList'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { useCourseDetail } from '../hooks/useCourseDetail'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import { COURSE_TABS } from '@/config/constants'

export default function CourseDetailPage() {
    const { courseId, tab } = useParams()
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
    const { course, isLoading, isError, updateCourse, isUpdating } = useCourseDetail(courseId!)
    const [editOpen, setEditOpen] = useState(false)

    if (!tab) return <Navigate to={`/courses/${courseId}/${COURSE_TABS.STREAM}`} replace />
    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <Spinner size="lg" className="text-primary" />
        </div>
    )
    if (isError || !course) return (
        <div className="p-6 text-center text-muted-foreground">Course not found.</div>
    )

    const renderTab = () => {
        switch (tab) {
            case COURSE_TABS.STREAM:
                return <PlaceholderTab label="📢 Announcements / Stream" phase="F-5" />
            case COURSE_TABS.ATTENDANCE:
                return <PlaceholderTab label="📅 Attendance" phase="F-6" />
            case COURSE_TABS.MATERIALS:
                return <PlaceholderTab label="📂 Materials" phase="F-7" />
            case COURSE_TABS.ASSIGNMENTS:
                return <PlaceholderTab label="📝 Assignments" phase="F-8" />
            case COURSE_TABS.CT:
                return <PlaceholderTab label="🧾 CT Events" phase="F-9" />
            case COURSE_TABS.PRESENTATIONS:
                return <PlaceholderTab label="🎤 Presentations" phase="F-10" />
            case COURSE_TABS.MARKS:
                return <PlaceholderTab label="📊 Marks & Grading" phase="F-11" />
            case COURSE_TABS.MEMBERS:
                return teacher ? (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Pending Join Requests
                            </h3>
                            <JoinRequestsPanel courseId={courseId!} />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-foreground mb-3">Course Members</h3>
                            <CourseMembersList courseId={courseId!} />
                        </div>
                    </div>
                ) : <PlaceholderTab label="👥 Members" phase="visible" />
            default:
                return <Navigate to={`/courses/${courseId}/${COURSE_TABS.STREAM}`} replace />
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Course header */}
            <div className="border-b border-border bg-card">
                <div className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-foreground truncate">{course.title}</h1>
                        <p className="text-sm text-muted-foreground">{course.courseCode} · {course.department} · {course.semester}</p>
                    </div>
                    {teacher && course.teacherId === user?.id && (
                        <div className="flex items-center gap-2 shrink-0">
                            <Button size="sm" variant="secondary" leftIcon={<Settings className="w-4 h-4" />} onClick={() => setEditOpen(true)}>
                                Edit
                            </Button>
                        </div>
                    )}
                </div>
                <CourseTabNav />
            </div>

            {/* Content area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Main tab content */}
                <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex-1 overflow-y-auto p-6"
                >
                    {renderTab()}
                </motion.div>

                {/* Sidebar — course info */}
                <div className="hidden xl:block w-72 shrink-0 border-l border-border overflow-y-auto p-4">
                    <CourseInfoCard course={course} />
                </div>
            </div>

            {/* Edit modal */}
            <EditCourseModal
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                course={course}
                onSubmit={(data) => updateCourse(data, { onSuccess: () => setEditOpen(false) })}
                isLoading={isUpdating}
            />
        </div>
    )
}

function PlaceholderTab({ label, phase }: { label: string; phase: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-4xl mb-4">{label.split(' ')[0]}</div>
            <p className="text-lg font-semibold text-foreground">{label.split(' ').slice(1).join(' ')}</p>
            {phase !== 'visible' && (
                <p className="text-sm text-muted-foreground mt-1">Coming in phase {phase}</p>
            )}
        </div>
    )
}
