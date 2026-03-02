import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, UserMinus, AlertTriangle } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { useCourseMembers } from '../hooks/useCourseMembers'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { CourseMemberDto } from '@/types/course.types'

interface Props { courseId: string }

export default function CourseMembersList({ courseId }: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
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

    if (members.length === 0) {
        return (
            <EmptyState
                icon={<Users className="w-7 h-7" />}
                title="No members yet"
                description="Approve join requests to add students"
                className="py-8"
            />
        )
    }

    return (
        <>
            <div className="space-y-2">
                <AnimatePresence>
                    {members.map((m, i) => (
                        <motion.div
                            key={m.userId}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: i * 0.03 }}
                            className="group flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-border/80 transition-all"
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
                            {teacher && (
                                <button
                                    onClick={() => setConfirmTarget(m)}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                                    title="Remove student"
                                >
                                    <UserMinus className="w-4 h-4" />
                                </button>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Confirm remove modal */}
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
