import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, UserMinus, AlertTriangle, GraduationCap, ChalkboardTeacher } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { useCourseMembers } from '../hooks/useCourseMembers'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { CourseMemberDto, CourseDto } from '@/types/course.types'

interface Props { courseId: string; course?: CourseDto }

export default function CourseMembersList({ courseId, course }: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
    const navigate = useNavigate()
    const { members, isMembersLoading, removeMember, isRemoving } = useCourseMembers(courseId)
    const [confirmTarget, setConfirmTarget] = useState<CourseMemberDto | null>(null)

    if (isMembersLoading) {
        return (
            <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
                ))}
            </div>
        )
    }

    const handleVisitProfile = (userId: string, memberData: object) => {
        navigate(`/users/${userId}`, { state: { member: memberData } })
    }

    return (
        <>
            <div className="space-y-3">

                {/* Teacher card */}
                {course && (
                    <div className="mb-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                            Instructor
                        </p>
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => handleVisitProfile(course.teacherId, {
                                userId: course.teacherId,
                                fullName: course.teacherName,
                                role: 'Teacher',
                            })}
                            className="flex items-center gap-3 p-3 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 cursor-pointer transition-all"
                        >
                            <Avatar name={course.teacherName} size="sm" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{course.teacherName}</p>
                                <p className="text-xs text-muted-foreground">Course Teacher</p>
                            </div>
                            <Badge variant="primary">Teacher</Badge>
                        </motion.div>
                    </div>
                )}

                {/* Students */}
                {members.length === 0 ? (
                    <EmptyState
                        icon={<Users className="w-7 h-7" />}
                        title="No students yet"
                        description="Approve join requests to add students"
                        className="py-8"
                    />
                ) : (
                    <>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                            Students ({members.length})
                        </p>
                        <AnimatePresence>
                            {members.map((m, i) => (
                                <motion.div
                                    key={m.userId}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="group flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/40 cursor-pointer transition-all"
                                    onClick={() => handleVisitProfile(m.userId, m)}
                                >
                                    <Avatar src={m.profilePhotoUrl} name={m.fullName} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{m.fullName}</p>
                                        <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                                    </div>
                                    {m.studentId && (
                                        <span className="text-xs text-muted-foreground font-mono shrink-0 hidden sm:block">
                                            {m.studentId}
                                        </span>
                                    )}
                                    {m.isCR
                                        ? <Badge variant="primary">CR</Badge>
                                        : <Badge variant="student">Student</Badge>
                                    }
                                    {teacher && user?.id !== m.userId && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setConfirmTarget(m) }}
                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                                            title="Remove student"
                                        >
                                            <UserMinus className="w-4 h-4" />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </>
                )}
            </div>

            <Modal
                isOpen={!!confirmTarget}
                onClose={() => setConfirmTarget(null)}
                title="Remove Student"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                        <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                        <p className="text-sm text-foreground">
                            Remove <span className="font-semibold">{confirmTarget?.fullName}</span> from this course?
                            They can re-request to join later.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" className="flex-1" onClick={() => setConfirmTarget(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1"
                            loading={isRemoving}
                            onClick={() => {
                                if (confirmTarget)
                                    removeMember(confirmTarget.userId, {
                                        onSuccess: () => setConfirmTarget(null)
                                    })
                            }}
                        >
                            <UserMinus className="w-4 h-4" /> Remove
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
