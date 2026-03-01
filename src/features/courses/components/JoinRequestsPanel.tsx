import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { formatRelative } from '@/utils/dateUtils'
import { useCourseMembers } from '../hooks/useCourseMembers'

interface Props { courseId: string }

export default function JoinRequestsPanel({ courseId }: Props) {
    const { joinRequests, isRequestsLoading, reviewRequest, isReviewing } = useCourseMembers(courseId)
    const pending = joinRequests.filter((r) => r.status === 'Pending')

    if (isRequestsLoading) return (
        <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
        </div>
    )

    if (pending.length === 0) return (
        <div className="text-center py-8">
            <CheckCircle className="w-10 h-10 text-success/50 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No pending join requests</p>
        </div>
    )

    return (
        <div className="space-y-3">
            {pending.map((req, i) => (
                <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/20 transition-all"
                >
                    <Avatar src={req.profilePhotoUrl} name={req.studentName} size="sm" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{req.studentName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatRelative(req.requestedAt)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => reviewRequest({ requestId: req.id, status: 'Rejected' })}
                            disabled={isReviewing}
                        >
                            <XCircle className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            className="bg-success/10 text-success hover:bg-success/20 shadow-none"
                            onClick={() => reviewRequest({ requestId: req.id, status: 'Approved' })}
                            disabled={isReviewing}
                        >
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                        </Button>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
