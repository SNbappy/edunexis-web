import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, AlertCircle, Star, ChevronDown } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import GradeSubmissionModal from './GradeSubmissionModal'
import { useSubmissions } from '../hooks/useSubmissions'
import { formatRelative } from '@/utils/dateUtils'
import type { SubmissionDto } from '@/types/assignment.types'
import { cn } from '@/utils/cn'

interface Props {
    courseId: string
    assignmentId: string
    totalMarks: number
}

const statusConfig = {
    Submitted: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, variant: 'default' as const, color: 'text-blue-500' },
    Late: { icon: <AlertCircle className="w-3.5 h-3.5" />, variant: 'warning' as const, color: 'text-amber-500' },
    Graded: { icon: <Star className="w-3.5 h-3.5" />, variant: 'success' as const, color: 'text-emerald-500' },
    Returned: { icon: <Clock className="w-3.5 h-3.5" />, variant: 'muted' as const, color: 'text-muted-foreground' },
}

export default function SubmissionsPanel({ courseId, assignmentId, totalMarks }: Props) {
    const { submissions, isLoading, gradeSubmission, isGrading } = useSubmissions(courseId, assignmentId)
    const [grading, setGrading] = useState<SubmissionDto | null>(null)

    if (isLoading) {
        return <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
    }

    const graded = submissions.filter((s) => s.status === 'Graded').length
    const pending = submissions.filter((s) => s.status !== 'Graded').length

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">{submissions.length} submissions</span>
                <span className="text-emerald-500 font-medium">{graded} graded</span>
                {pending > 0 && <span className="text-amber-500 font-medium">{pending} pending</span>}
            </div>

            {submissions.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">No submissions yet</div>
            ) : (
                submissions.map((sub, i) => {
                    const sc = statusConfig[sub.status]
                    return (
                        <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/20 transition-all"
                        >
                            <Avatar src={sub.studentPhoto} name={sub.studentName} size="sm" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{sub.studentName}</p>
                                <p className="text-xs text-muted-foreground">{formatRelative(sub.submittedAt)}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                {sub.status === 'Graded' && sub.obtainedMarks !== null && (
                                    <span className="text-sm font-bold text-emerald-500">{sub.obtainedMarks}/{totalMarks}</span>
                                )}
                                <Badge variant={sc.variant}>{sub.status}</Badge>
                                <Button
                                    size="sm"
                                    variant={sub.status === 'Graded' ? 'secondary' : 'primary'}
                                    onClick={() => setGrading(sub)}
                                >
                                    {sub.status === 'Graded' ? 'Edit Grade' : 'Grade'}
                                </Button>
                            </div>
                        </motion.div>
                    )
                })
            )}

            <GradeSubmissionModal
                isOpen={!!grading}
                onClose={() => setGrading(null)}
                submission={grading}
                totalMarks={totalMarks}
                onGrade={(data) => gradeSubmission(
                    { submissionId: grading!.id, data },
                    { onSuccess: () => setGrading(null) }
                )}
                isLoading={isGrading}
            />
        </div>
    )
}
