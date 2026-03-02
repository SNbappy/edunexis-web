import { motion } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { useCourseMembers } from '../hooks/useCourseMembers'
import { formatRelative } from '@/utils/dateUtils'

interface Props { courseId: string }

export default function JoinRequestsPanel({ courseId }: Props) {
    const { joinRequests, isRequestsLoading, reviewRequest, isReviewing } = useCourseMembers(courseId)
    const pending = joinRequests.filter((r) => r.status === 'Pending')

    if (isRequestsLoading) {
        return <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
    }

    if (pending.length === 0) {
        return (
            <EmptyState
                icon={<CheckCircle2 className="w-6 h-6" />}
                title="No pending requests"
                className="py-8"
            />
        )
    }

    return (
        <div className="space-y-2">
            {pending.map((req, i) => (
                <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5"
                >
                    <Avatar src={req.profilePhotoUrl} name={req.studentName} size="sm" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{req.studentName}</p>
                        <p className="text-xs text-muted-foreground">{req.studentEmail}</p>
                        <p className="text-xs text-muted-foreground">{formatRelative(req.requestedAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            size="sm"
                            variant="secondary"
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => reviewRequest({ requestId: req.id, status: 'Rejected' })}
                            disabled={isReviewing}
                        >
                            <XCircle className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => reviewRequest({ requestId: req.id, status: 'Approved' })}
                            disabled={isReviewing}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve
                        </Button>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
