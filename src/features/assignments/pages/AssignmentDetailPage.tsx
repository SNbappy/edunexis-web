import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft, Clock, BookOpen, Users, Download,
    Send, AlertCircle, CheckCircle2, FileText,
    CalendarClock, Award, Paperclip,
} from 'lucide-react'
import { isPast, parseISO, formatDistanceToNow, differenceInSeconds } from 'date-fns'
import { useAssignment } from '../hooks/useAssignments'
import { useSubmissions } from '../hooks/useSubmissions'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import { formatDateTime } from '@/utils/dateUtils'
import { cn } from '@/utils/cn'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Tabs from '@/components/ui/Tabs'
import { SkeletonCard } from '@/components/ui/Skeleton'
import SubmissionsPanel from '../components/SubmissionsPanel'
import SubmitAssignmentModal from '../components/SubmitAssignmentModal'
import type { SubmitAssignmentRequest } from '@/types/assignment.types'

function Countdown({ deadline }: { deadline: string }) {
    const [timeLeft, setTimeLeft] = useState('')
    const [urgent, setUrgent] = useState(false)

    useEffect(() => {
        const update = () => {
            const secs = differenceInSeconds(parseISO(deadline), new Date())
            if (secs <= 0) { setTimeLeft('Deadline passed'); return }
            setUrgent(secs < 86400)
            if (secs > 172800) {
                setTimeLeft(formatDistanceToNow(parseISO(deadline), { addSuffix: true }))
            } else {
                const h = Math.floor(secs / 3600)
                const m = Math.floor((secs % 3600) / 60)
                const s = secs % 60
                setTimeLeft(String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0') + ' remaining')
            }
        }
        update()
        const id = setInterval(update, 1000)
        return () => clearInterval(id)
    }, [deadline])

    return (
        <span className={cn('font-mono text-sm font-semibold', urgent ? 'text-destructive' : 'text-amber-500')}>
            {timeLeft}
        </span>
    )
}

export default function AssignmentDetailPage() {
    const { courseId = '', assignmentId = '' } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
    const [activeTab, setActiveTab] = useState<'details' | 'submissions'>('details')
    const [submitOpen, setSubmitOpen] = useState(false)

    const { assignment, isLoading, isError, mySubmission, submitAssignment, isSubmitting } =
        useAssignment(courseId, assignmentId)

    const { submissions, isLoading: subsLoading } = useSubmissions(courseId, assignmentId)

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
                <SkeletonCard className="h-10 w-48" />
                <SkeletonCard className="h-32" />
                <SkeletonCard className="h-64" />
            </div>
        )
    }

    if (isError || !assignment) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
                <AlertCircle className="w-12 h-12 text-destructive" />
                <p className="text-lg font-semibold text-foreground">Assignment not found</p>
                <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        )
    }

    const isPastDue = isPast(parseISO(assignment.deadline))
    const canSubmit = !mySubmission && assignment.isOpen && (!isPastDue || assignment.allowLateSubmission) && !teacher
    const gradedCount = teacher ? submissions.filter((s) => s.isGraded).length : 0

    return (
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

            {/* Back Button */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <button
                    onClick={() => navigate(`/courses/${courseId}/assignments`)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back to Assignments
                </button>
            </motion.div>

            {/* Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-6 space-y-4"
            >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={assignment.isOpen ? 'success' : 'muted'}>
                                {assignment.isOpen ? 'Active' : 'Closed'}
                            </Badge>
                            {isPastDue && assignment.isOpen && (
                                <Badge variant="destructive">Overdue</Badge>
                            )}
                            {assignment.allowLateSubmission && (
                                <Badge variant="muted">Late submission allowed</Badge>
                            )}
                            {!teacher && mySubmission && (
                                <Badge variant="success">
                                    <CheckCircle2 className="w-3 h-3 inline mr-1" />Submitted
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-foreground truncate">{assignment.title}</h1>
                        <p className="text-xs text-muted-foreground">
                            Posted {formatDistanceToNow(parseISO(assignment.createdAt), { addSuffix: true })}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap shrink-0">
                        <div className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl bg-muted/50 border border-border min-w-[80px]">
                            <Award className="w-4 h-4 text-primary" />
                            <span className="text-lg font-bold text-foreground">{assignment.maxMarks}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Marks</span>
                        </div>
                        {teacher && (
                            <div className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl bg-muted/50 border border-border min-w-[80px]">
                                <Users className="w-4 h-4 text-blue-500" />
                                <span className="text-lg font-bold text-foreground">{assignment.submissionCount}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Submitted</span>
                            </div>
                        )}
                        {teacher && (
                            <div className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl bg-muted/50 border border-border min-w-[80px]">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-lg font-bold text-foreground">{gradedCount}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Graded</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-6 flex-wrap pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground">Due:</span>
                        <span className={cn('text-sm font-medium', isPastDue ? 'text-destructive' : 'text-foreground')}>
                            {formatDateTime(assignment.deadline)}
                        </span>
                    </div>
                    {!isPastDue && (
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                            <Countdown deadline={assignment.deadline} />
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Teacher Tabs */}
            {teacher && (
                <Tabs
                    variant="underline"
                    tabs={[
                        { key: 'details', label: 'Details', icon: <FileText className="w-3.5 h-3.5" /> },
                        {
                            key: 'submissions', label: 'Submissions',
                            icon: <Users className="w-3.5 h-3.5" />,
                            badge: assignment.submissionCount
                        },
                    ]}
                    active={activeTab}
                    onChange={(k) => setActiveTab(k as 'details' | 'submissions')}
                />
            )}

            {/* Details Panel */}
            {(activeTab === 'details' || !teacher) && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-5"
                >
                    {/* Left - Main content */}
                    <div className="lg:col-span-2 space-y-4">
                        {assignment.instructions && (
                            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Instructions</h3>
                                </div>
                                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                    {assignment.instructions}
                                </p>
                            </div>
                        )}

                        {assignment.rubricNotes && (
                            <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-5 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Award className="w-4 h-4 text-amber-600" />
                                    <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Rubric / Grading Notes</h3>
                                </div>
                                <p className="text-sm text-amber-800 dark:text-amber-300 whitespace-pre-wrap leading-relaxed">
                                    {assignment.rubricNotes}
                                </p>
                            </div>
                        )}

                        {assignment.referenceFileUrl && (
                            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Paperclip className="w-4 h-4 text-primary" />
                                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Reference File</h3>
                                </div>
                                <a
                                    href={assignment.referenceFileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/40 hover:bg-muted transition-colors group"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">Download Reference File</p>
                                        <p className="text-xs text-muted-foreground">Click to open or download</p>
                                    </div>
                                    <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Right - Sidebar */}
                    <div className="space-y-4">
                        {/* Student submission card */}
                        {!teacher && (
                            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Your Submission</h3>

                                {mySubmission ? (
                                    <div className="space-y-3">
                                        {/* Submitted badge */}
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Submitted</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDateTime(mySubmission.submittedAt)}
                                                    {mySubmission.isLate ? ' ? Late' : ''}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Text preview */}
                                        {mySubmission.textContent && (
                                            <div className="p-3 rounded-xl bg-muted/50 border border-border max-h-36 overflow-y-auto">
                                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Your Answer</p>
                                                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{mySubmission.textContent}</p>
                                            </div>
                                        )}

                                        {/* File link */}
                                        {mySubmission.fileUrl && (
                                            <a href={mySubmission.fileUrl} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-3 rounded-xl border border-border bg-muted/40 hover:bg-muted transition-colors">
                                                <FileText className="w-4 h-4 text-primary shrink-0" />
                                                <span className="text-sm text-foreground flex-1">View submitted file</span>
                                                <Download className="w-3.5 h-3.5 text-muted-foreground" />
                                            </a>
                                        )}

                                        {/* Link submission */}
                                        {mySubmission.linkUrl && (
                                            <a href={mySubmission.linkUrl} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-3 rounded-xl border border-border bg-muted/40 hover:bg-muted transition-colors">
                                                <Send className="w-4 h-4 text-primary shrink-0" />
                                                <span className="text-sm text-primary truncate flex-1">{mySubmission.linkUrl}</span>
                                            </a>
                                        )}

                                        {/* Grade */}
                                        {mySubmission.isGraded ? (
                                            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Grade</p>
                                                    <span className="text-xl font-bold text-primary">{mySubmission.marks}<span className="text-sm font-normal text-muted-foreground">/{assignment.maxMarks}</span></span>
                                                </div>
                                                {mySubmission.feedback && (
                                                    <div>
                                                        <p className="text-xs font-semibold text-muted-foreground mb-1">Feedback</p>
                                                        <p className="text-sm text-foreground">{mySubmission.feedback}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-center text-muted-foreground py-1">? Awaiting grade from teacher</p>
                                        )}

                                        {/* Resubmit if still open */}
                                        {assignment.isOpen && (!isPastDue || assignment.allowLateSubmission) && (
                                            <Button size="sm" variant="secondary" className="w-full" onClick={() => setSubmitOpen(true)}>
                                                Update Submission
                                            </Button>
                                        )}
                                    </div>
                                ) : canSubmit ? (
                                    <>
                                        <p className="text-sm text-muted-foreground">Submit your work before the deadline.</p>
                                        <Button className="w-full" leftIcon={<Send className="w-4 h-4" />} onClick={() => setSubmitOpen(true)}>
                                            Submit Assignment
                                        </Button>
                                    </>
                                ) : isPastDue && !assignment.allowLateSubmission ? (
                                    <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>Submission deadline has passed.</span>
                                    </div>
                                ) : !assignment.isOpen ? (
                                    <div className="flex items-start gap-2 p-3 rounded-xl bg-muted border border-border text-sm text-muted-foreground">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>This assignment is closed.</span>
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {/* Assignment Info */}
                        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Details</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between gap-2">
                                    <span className="text-muted-foreground">Max Marks</span>
                                    <span className="font-medium text-foreground">{assignment.maxMarks}</span>
                                </div>
                                <div className="flex justify-between gap-2">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className={cn('font-medium', assignment.isOpen ? 'text-green-500' : 'text-muted-foreground')}>
                                        {assignment.isOpen ? 'Open' : 'Closed'}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-2">
                                    <span className="text-muted-foreground">Late Submission</span>
                                    <span className={cn('font-medium', assignment.allowLateSubmission ? 'text-green-500' : 'text-destructive')}>
                                        {assignment.allowLateSubmission ? 'Allowed' : 'Not allowed'}
                                    </span>
                                </div>
                                {teacher && (
                                    <div className="flex justify-between gap-2">
                                        <span className="text-muted-foreground">Graded</span>
                                        <span className="font-medium text-foreground">
                                            {gradedCount} / {assignment.submissionCount}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Submissions Panel (teacher) */}
            {teacher && activeTab === 'submissions' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <SubmissionsPanel
                        courseId={courseId}
                        assignmentId={assignmentId}
                        maxMarks={assignment.maxMarks}
                    />
                </motion.div>
            )}

            {/* Submit Modal */}
            <SubmitAssignmentModal
                isOpen={submitOpen}
                onClose={() => setSubmitOpen(false)}
                assignment={assignment}
                onSubmit={(data: SubmitAssignmentRequest) =>
                    submitAssignment(data, { onSuccess: () => setSubmitOpen(false) })
                }
                isLoading={isSubmitting}
            />
        </div>
    )
}
