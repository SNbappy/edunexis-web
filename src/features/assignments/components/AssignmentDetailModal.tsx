import { motion } from 'framer-motion'
import {
    Clock, Users, FileText, CheckCircle2,
    Send, AlertCircle, BookOpen, Star,
} from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Tabs from '@/components/ui/Tabs'
import SubmissionsPanel from './SubmissionsPanel'
import SubmitAssignmentModal from './SubmitAssignmentModal'
import { useSubmissions } from '../hooks/useSubmissions'
import { formatDateTime, formatRelative } from '@/utils/dateUtils'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import { isPast, parseISO } from 'date-fns'
import { useState } from 'react'
import type { AssignmentDto } from '@/types/assignment.types'
import { cn } from '@/utils/cn'

interface Props {
    isOpen: boolean
    onClose: () => void
    assignment: AssignmentDto | null
    courseId: string
}

export default function AssignmentDetailModal({ isOpen, onClose, assignment, courseId }: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
    const [activeTab, setActiveTab] = useState<'details' | 'submissions'>('details')
    const [submitOpen, setSubmitOpen] = useState(false)

    const { submitAssignment, isSubmitting } = useSubmissions(
        courseId,
        assignment?.id ?? ''
    )

    if (!assignment) return null

    const isPastDue = isPast(parseISO(assignment.dueDate))
    const canSubmit = assignment.status === 'Published' &&
        (!isPastDue || assignment.allowLateSubmission) &&
        !teacher

    const submission = assignment.mySubmission

    return (
        <>
            <Modal
                isOpen={isOpen && !submitOpen}
                onClose={onClose}
                title={assignment.title}
                size="xl"
            >
                <div className="space-y-5">
                    {/* Meta row */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className={cn(
                            'flex items-center gap-1.5 text-xs font-medium',
                            isPastDue && assignment.status !== 'Closed' ? 'text-destructive' : 'text-muted-foreground'
                        )}>
                            <Clock className="w-3.5 h-3.5" />
                            Due: {formatDateTime(assignment.dueDate)}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            {assignment.totalMarks} marks
                        </span>
                        {assignment.allowLateSubmission && (
                            <Badge variant="muted">Late submission allowed</Badge>
                        )}
                        {teacher && (
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Users className="w-3.5 h-3.5" />
                                {assignment.submissionCount ?? 0} submissions
                            </span>
                        )}
                    </div>

                    {/* Student submission status */}
                    {!teacher && submission && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={cn(
                                'p-4 rounded-xl border space-y-2',
                                submission.status === 'Graded'
                                    ? 'bg-emerald-500/5 border-emerald-500/30'
                                    : 'bg-blue-500/5 border-blue-500/30'
                            )}
                        >
                            <div className="flex items-center gap-2">
                                {submission.status === 'Graded'
                                    ? <Star className="w-4 h-4 text-emerald-500" />
                                    : <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                                <span className={cn(
                                    'text-sm font-semibold',
                                    submission.status === 'Graded' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
                                )}>
                                    {submission.status === 'Graded'
                                        ? `Graded: ${submission.obtainedMarks}/${assignment.totalMarks} marks`
                                        : 'Submitted — awaiting grade'}
                                </span>
                            </div>
                            {submission.feedback && (
                                <p className="text-xs text-muted-foreground border-t border-border/50 pt-2">
                                    💬 {submission.feedback}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Submitted {formatRelative(submission.submittedAt)}
                            </p>
                        </motion.div>
                    )}

                    {/* Teacher tabs */}
                    {teacher && (
                        <Tabs
                            variant="underline"
                            tabs={[
                                { key: 'details', label: 'Details', icon: <FileText className="w-3.5 h-3.5" /> },
                                { key: 'submissions', label: 'Submissions', icon: <Users className="w-3.5 h-3.5" />, badge: assignment.submissionCount },
                            ]}
                            active={activeTab}
                            onChange={(k) => setActiveTab(k as 'details' | 'submissions')}
                        />
                    )}

                    {/* Details panel */}
                    {(activeTab === 'details' || !teacher) && (
                        <div className="space-y-4">
                            {assignment.description && (
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Description</p>
                                    <p className="text-sm text-foreground">{assignment.description}</p>
                                </div>
                            )}
                            {assignment.instructions && (
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Instructions</p>
                                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                                        <p className="text-sm text-foreground whitespace-pre-wrap">{assignment.instructions}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submissions panel (teacher) */}
                    {teacher && activeTab === 'submissions' && (
                        <SubmissionsPanel
                            courseId={courseId}
                            assignmentId={assignment.id}
                            totalMarks={assignment.totalMarks}
                        />
                    )}

                    {/* Student action */}
                    {!teacher && canSubmit && (
                        <div className="pt-2 border-t border-border">
                            <Button
                                className="w-full"
                                leftIcon={<Send className="w-4 h-4" />}
                                onClick={() => setSubmitOpen(true)}
                            >
                                {submission ? 'Resubmit Assignment' : 'Submit Assignment'}
                            </Button>
                        </div>
                    )}

                    {!teacher && isPastDue && !assignment.allowLateSubmission && !submission && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            Submission deadline has passed.
                        </div>
                    )}
                </div>
            </Modal>

            {/* Submit modal */}
            <SubmitAssignmentModal
                isOpen={submitOpen}
                onClose={() => setSubmitOpen(false)}
                assignment={assignment}
                onSubmit={(data) =>
                    submitAssignment(
                        { ...data, assignmentId: assignment.id, courseId },
                        { onSuccess: () => { setSubmitOpen(false); onClose() } }
                    )
                }
                isLoading={isSubmitting}
            />
        </>
    )
}
