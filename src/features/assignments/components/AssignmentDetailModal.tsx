import { motion } from 'framer-motion'
import {
    Clock, Users, FileText, Award,
    Send, AlertCircle,
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
import type { AssignmentDto, SubmitAssignmentRequest } from '@/types/assignment.types'
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

    const isPastDue = isPast(parseISO(assignment.deadline))
    const canSubmit = assignment.isOpen &&
        (!isPastDue || assignment.allowLateSubmission) &&
        !teacher

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
                            isPastDue ? 'text-destructive' : 'text-muted-foreground'
                        )}>
                            <Clock className="w-3.5 h-3.5" />
                            Due: {formatDateTime(assignment.deadline)}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5" />
                            {assignment.maxMarks} marks
                        </span>
                        {assignment.allowLateSubmission && (
                            <Badge variant="muted">Late submission OK</Badge>
                        )}
                        {teacher && (
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Users className="w-3.5 h-3.5" />
                                {assignment.submissionCount ?? 0} submissions
                            </span>
                        )}
                    </div>

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
                            {assignment.instructions && (
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Instructions</p>
                                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                                        <p className="text-sm text-foreground whitespace-pre-wrap">{assignment.instructions}</p>
                                    </div>
                                </div>
                            )}
                            {assignment.rubricNotes && (
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Rubric notes</p>
                                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                                        <p className="text-sm text-foreground whitespace-pre-wrap">{assignment.rubricNotes}</p>
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
                            maxMarks={assignment.maxMarks}
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
                                Submit assignment
                            </Button>
                        </div>
                    )}

                    {!teacher && isPastDue && !assignment.allowLateSubmission && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            Submission deadline has passed.
                        </div>
                    )}
                </div>
            </Modal>

            <SubmitAssignmentModal
                isOpen={submitOpen}
                onClose={() => setSubmitOpen(false)}
                assignment={assignment}
                onSubmit={(data: SubmitAssignmentRequest) =>
                    submitAssignment(
                        { assignmentId: assignment.id, data },
                        { onSuccess: () => { setSubmitOpen(false); onClose() } }
                    )
                }
                isLoading={isSubmitting}
            />
        </>
    )
}

