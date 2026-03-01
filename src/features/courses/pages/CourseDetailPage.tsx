import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Settings, Plus } from 'lucide-react'
import CourseTabNav from '../components/CourseTabNav'
import CourseInfoCard from '../components/CourseInfoCard'
import EditCourseModal from '../components/EditCourseModal'
import JoinRequestsPanel from '../components/JoinRequestsPanel'
import CourseMembersList from '../components/CourseMembersList'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Tabs from '@/components/ui/Tabs'
import { useCourseDetail } from '../hooks/useCourseDetail'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import { COURSE_TABS } from '@/config/constants'
import AnnouncementFeed from '@/features/announcements/components/AnnouncementFeed'
import AttendanceRecordsList from '@/features/attendance/components/AttendanceRecordsList'
import AttendanceCalendar from '@/features/attendance/components/AttendanceCalendar'
import AttendanceStatsCard from '@/features/attendance/components/AttendanceStatsCard'
import TakeAttendanceSheet from '@/features/attendance/components/TakeAttendanceSheet'
import StudentAttendanceView from '@/features/attendance/components/StudentAttendanceView'
import { useAttendance } from '@/features/attendance/hooks/useAttendance'
import { useAttendanceStats } from '@/features/attendance/hooks/useAttendanceStats'
import { Users } from 'lucide-react'
import MaterialsTab from '@/features/materials/components/MaterialsTab'

function AttendanceTab({ courseId }: { courseId: string }) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
    const [takeOpen, setTakeOpen] = useState(false)
    const [view, setView] = useState<'list' | 'calendar'>('list')
    const { sessions, members, isSessionsLoading, takeAttendance, isTaking, deleteSession } = useAttendance(courseId)
    const { data: stats } = useAttendanceStats(courseId)

    if (!teacher) return <StudentAttendanceView courseId={courseId} />

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Attendance</h2>
                <div className="flex items-center gap-2">
                    <Tabs
                        variant="boxed"
                        tabs={[{ key: 'list', label: 'List' }, { key: 'calendar', label: 'Calendar' }]}
                        active={view}
                        onChange={(k) => setView(k as 'list' | 'calendar')}
                    />
                    <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setTakeOpen(true)}>
                        Take Attendance
                    </Button>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <AttendanceStatsCard
                    totalSessions={stats.totalSessions}
                    averageAttendance={stats.averageAttendance}
                    totalStudents={stats.studentSummaries?.length}
                    lastSessionDate={stats.lastSessionDate}
                />
            )}

            {/* List / Calendar */}
            {isSessionsLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />)}
                </div>
            ) : view === 'list' ? (
                <AttendanceRecordsList
                    sessions={sessions}
                    onDelete={deleteSession}
                />
            ) : (
                <AttendanceCalendar sessions={sessions} />
            )}

            <TakeAttendanceSheet
                isOpen={takeOpen}
                onClose={() => setTakeOpen(false)}
                members={members}
                courseId={courseId}
                onSubmit={(data) => takeAttendance(data, { onSuccess: () => setTakeOpen(false) })}
                isLoading={isTaking}
            />
        </div>
    )
}

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
                return <AnnouncementFeed courseId={courseId!} />
            case COURSE_TABS.ATTENDANCE:
                return <AttendanceTab courseId={courseId!} />
            case COURSE_TABS.MATERIALS:
                return <MaterialsTab courseId={courseId!} />
            case COURSE_TABS.ASSIGNMENTS:
                return <PlaceholderTab label="📝 Assignments" phase="F-7" />
            case COURSE_TABS.CT:
                return <PlaceholderTab label="🧾 CT Events" phase="F-8" />
            case COURSE_TABS.PRESENTATIONS:
                return <PlaceholderTab label="🎤 Presentations" phase="F-9" />
            case COURSE_TABS.MARKS:
                return <PlaceholderTab label="📊 Marks & Grading" phase="F-10" />
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
            <div className="border-b border-border bg-card">
                <div className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-foreground truncate">{course.title}</h1>
                        <p className="text-sm text-muted-foreground">{course.courseCode} · {course.department} · {course.semester}</p>
                    </div>
                    {teacher && course.teacherId === user?.id && (
                        <Button size="sm" variant="secondary" leftIcon={<Settings className="w-4 h-4" />} onClick={() => setEditOpen(true)}>
                            Edit
                        </Button>
                    )}
                </div>
                <CourseTabNav />
            </div>

            <div className="flex flex-1 overflow-hidden">
                <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex-1 overflow-y-auto p-6"
                >
                    {renderTab()}
                </motion.div>
                <div className="hidden xl:block w-72 shrink-0 border-l border-border overflow-y-auto p-4">
                    <CourseInfoCard course={course} />
                </div>
            </div>

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
