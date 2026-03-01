import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { useCourseMembers } from '../hooks/useCourseMembers'

interface Props { courseId: string }

export default function CourseMembersList({ courseId }: Props) {
    const { members, isMembersLoading } = useCourseMembers(courseId)

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
        <div className="space-y-2">
            {members.map((m, i) => (
                <motion.div
                    key={m.userId}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
                >
                    <Avatar src={m.profilePhotoUrl} name={m.fullName} size="sm" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{m.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                    </div>
                    {m.studentId && (
                        <span className="text-xs text-muted-foreground font-mono shrink-0">{m.studentId}</span>
                    )}
                    <Badge variant="student">Student</Badge>
                </motion.div>
            ))}
        </div>
    )
}
