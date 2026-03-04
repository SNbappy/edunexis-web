import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Star, ExternalLink } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import ProgressBar from '@/components/ui/ProgressBar'
import { formatDateTime } from '@/utils/dateUtils'
import type { SubmissionDto, GradeSubmissionRequest } from '@/types/assignment.types'

interface Props {
    isOpen: boolean
    onClose: () => void
    submission: SubmissionDto | null
    maxMarks: number
    onGrade: (data: GradeSubmissionRequest) => void
    isLoading?: boolean
}

export default function GradeSubmissionModal({ isOpen, onClose, submission, maxMarks, onGrade, isLoading }: Props) {
    const [marks, setMarks] = useState('')
    const [feedback, setFeedback] = useState('')

    useEffect(() => {
        if (submission) {
            setMarks(submission.marks?.toString() ?? '')
            setFeedback(submission.feedback ?? '')
        }
    }, [submission])

    if (!submission) return null

    const pct = marks ? (parseFloat(marks) / maxMarks) * 100 : 0

    const handleSubmit = () => {
        const n = parseFloat(marks)
        if (isNaN(n) || n < 0 || n > maxMarks) return
        onGrade({ obtainedMarks: n, feedback: feedback || undefined })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Grade Submission" size="lg">
            <div className="space-y-5">
                {/* Student info */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                    <Avatar name={submission.studentName} size="md" />
                    <div>
                        <p className="font-semibold text-foreground">{submission.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                            Submitted: {formatDateTime(submission.submittedAt)}
                        </p>
                    </div>
                    {submission.isLate && (
                        <span className="ml-auto text-xs font-semibold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">
                            Late
                        </span>
                    )}
                </div>

                {/* Submission content */}
                {submission.textContent && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Written Answer
                        </p>
                        <div className="p-4 rounded-xl bg-muted/50 border border-border max-h-48 overflow-y-auto">
                            <p className="text-sm text-foreground whitespace-pre-wrap">{submission.textContent}</p>
                        </div>
                    </div>
                )}

                {submission.fileUrl && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border">
                        <FileText className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-sm text-foreground flex-1 truncate">Submitted file</span>
                        <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="secondary" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                                View
                            </Button>
                        </a>
                    </div>
                )}

                {submission.linkUrl && (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-border">
                        <ExternalLink className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-sm text-foreground flex-1 truncate">{submission.linkUrl}</span>
                        <a href={submission.linkUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="secondary">Open</Button>
                        </a>
                    </div>
                )}

                {/* Grade input */}
                <div className="space-y-3 pt-2 border-t border-border">
                    <div className="flex items-center gap-4">
                        <Input
                            label={'Marks (out of ' + maxMarks + ')'}
                            type="number"
                            value={marks}
                            onChange={(e) => setMarks(e.target.value)}
                            placeholder="0"
                            min={0}
                            max={maxMarks}
                            className="w-36"
                        />
                        {marks && !isNaN(pct) && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 pt-6">
                                <ProgressBar
                                    value={pct}
                                    showPercent
                                    color={pct >= 80 ? 'success' : pct >= 60 ? 'primary' : pct >= 40 ? 'warning' : 'danger'}
                                />
                            </motion.div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Feedback (optional)</label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={3}
                            placeholder="Leave constructive feedback for the student..."
                            className="w-full rounded-xl border border-border bg-card text-foreground text-sm px-4 py-3 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button
                        className="flex-1"
                        loading={isLoading}
                        onClick={handleSubmit}
                        disabled={!marks || isNaN(parseFloat(marks))}
                        leftIcon={!isLoading ? <Star className="w-4 h-4" /> : undefined}
                    >
                        Save Grade
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
