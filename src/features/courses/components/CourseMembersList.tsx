import { motion } from 'framer-motion'
import { Crown, Mail } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/utils/dateUtils'
import { useCourseMembers } from '../hooks/useCourseMembers'

interface Props { courseId: string }

export default function CourseMembersList({ courseId }: Props) {
    const { members, isMembersLoading } = useCourseMembers(courseId)

    if (isMembersLoading) return (
        <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted animate-pulse h-16" />
            ))}
        </div>
    )

    if (members.length === 0) return (
        <div className="text-center py-8 text-muted-foreground text-sm">No members yet</div>
    )

    return (
        <div className="space-y-2">
            {members.map((member, i) => (
                <motion.div
                    key={member.userId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/20 transition-all"
                >
                    <Avatar src={member.profilePhotoUrl} name={member.fullName} size="sm" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">{member.fullName}</p>
                            {member.isCR && (
                                <Badge variant="cr">
                                    <Crown className="w-2.5 h-2.5" /> CR
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 shrink-0" /> {member.email}
                        </p>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                        {member.studentId && <p className="text-xs font-mono text-muted-foreground">{member.studentId}</p>}
                        <p className="text-xs text-muted-foreground">{formatDate(member.enrolledAt)}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
