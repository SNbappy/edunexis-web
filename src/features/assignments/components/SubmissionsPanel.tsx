import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Star, ShieldAlert } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import GradeSubmissionModal from './GradeSubmissionModal'
import PlagiarismReportModal from './PlagiarismReportModal'
import { useSubmissions } from '../hooks/useSubmissions'
import { checkPlagiarismAsync } from '../utils/plagiarismChecker'
import { formatRelative } from '@/utils/dateUtils'
import type { SubmissionDto, PlagiarismReport } from '@/types/assignment.types'
import { cn } from '@/utils/cn'

interface Props {
    courseId: string
    assignmentId: string
    maxMarks: number
}

function getStatus(sub: SubmissionDto): 'Graded' | 'Late' | 'Submitted' {
    if (sub.isGraded) return 'Graded'
    if (sub.isLate) return 'Late'
    return 'Submitted'
}

export default function SubmissionsPanel({ courseId, assignmentId, maxMarks }: Props) {
    const { submissions, isLoading, gradeSubmission, isGrading } = useSubmissions(courseId, assignmentId)
    const [grading, setGrading] = useState<SubmissionDto | null>(null)
    const [plagReport, setPlagReport] = useState<PlagiarismReport | null>(null)
    const [plagOpen, setPlagOpen] = useState(false)
    const [isChecking, setIsChecking] = useState(false)

    const handleCheckPlagiarism = async () => {
        setPlagOpen(true)
        setIsChecking(true)
        try {
            const report = await checkPlagiarismAsync(submissions)
            setPlagReport(report)
        } catch {
            // fallback
        } finally {
            setIsChecking(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
            </div>
        )
    }

    const graded = submissions.filter((s) => s.isGraded).length
    const pending = submissions.filter((s) => !s.isGraded).length
    const hasTextSubs = submissions.some((s) => s.submissionType === 'Text' && s.textContent)

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</span>
                    {graded > 0 && <span className="text-emerald-500 font-medium">{graded} graded</span>}
                    {pending > 0 && <span className="text-amber-500 font-medium">{pending} pending</span>}
                </div>
                {submissions.length >= 1 && (
                    <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
                        onClick={handleCheckPlagiarism}
                        title="Check submissions for plagiarism"
                    >
                        Check Plagiarism
                    </Button>
                )}
            </div>

            {submissions.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">No submissions yet</div>
            ) : (
                submissions.map((sub, i) => {
                    const status = getStatus(sub)
                    return (
                        <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/20 transition-all"
                        >
                            <Avatar name={sub.studentName} size="sm" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{sub.studentName}</p>
                                <p className="text-xs text-muted-foreground">{formatRelative(sub.submittedAt)}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                {sub.isGraded && sub.marks != null && (
                                    <span className="text-sm font-bold text-emerald-500">
                                        {sub.marks}/{maxMarks}
                                    </span>
                                )}
                                <Badge variant={
                                    status === 'Graded' ? 'success' :
                                    status === 'Late' ? 'warning' : 'default'
                                }>
                                    {status === 'Graded'
                                        ? <><Star className="w-3 h-3 inline mr-1" />Graded</>
                                        : status === 'Late'
                                            ? <><AlertCircle className="w-3 h-3 inline mr-1" />Late</>
                                            : <><CheckCircle2 className="w-3 h-3 inline mr-1" />Submitted</>
                                    }
                                </Badge>
                                <Button
                                    size="sm"
                                    variant={sub.isGraded ? 'secondary' : 'primary'}
                                    onClick={() => setGrading(sub)}
                                >
                                    {sub.isGraded ? 'Edit Grade' : 'Grade'}
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
                maxMarks={maxMarks}
                onGrade={(data) => gradeSubmission(
                    { submissionId: grading!.id, data },
                    { onSuccess: () => setGrading(null) }
                )}
                isLoading={isGrading}
            />

            <PlagiarismReportModal
                isOpen={plagOpen}
                onClose={() => setPlagOpen(false)}
                report={plagReport}
                isChecking={isChecking}
            />
        </div>
    )
}
