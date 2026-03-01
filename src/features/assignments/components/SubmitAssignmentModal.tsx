import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, FileText, Paperclip } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import FileDropzone from '@/components/ui/FileDropzone'
import Tabs from '@/components/ui/Tabs'
import { formatDateTime } from '@/utils/dateUtils'
import type { AssignmentDto } from '@/types/assignment.types'

interface Props {
    isOpen: boolean
    onClose: () => void
    assignment: AssignmentDto
    onSubmit: (data: { textContent?: string; file?: File }) => void
    isLoading?: boolean
}

export default function SubmitAssignmentModal({ isOpen, onClose, assignment, onSubmit, isLoading }: Props) {
    const [tab, setTab] = useState<'text' | 'file'>('file')
    const [textContent, setTextContent] = useState('')
    const [files, setFiles] = useState<File[]>([])

    const handleClose = () => {
        setTextContent('')
        setFiles([])
        onClose()
    }

    const handleSubmit = () => {
        onSubmit({
            textContent: tab === 'text' ? textContent : undefined,
            file: tab === 'file' ? files[0] : undefined,
        })
    }

    const alreadySubmitted = !!assignment.mySubmission
    const canSubmit = tab === 'text' ? textContent.trim().length > 0 : files.length > 0

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Submit Assignment" size="lg">
            <div className="space-y-5">
                {/* Assignment info */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                    <p className="text-sm font-semibold text-foreground">{assignment.title}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span>📅 Due: {formatDateTime(assignment.dueDate)}</span>
                        <span>📊 {assignment.totalMarks} marks</span>
                    </div>
                    {assignment.instructions && (
                        <p className="text-xs text-muted-foreground border-t border-primary/20 pt-2 mt-2">
                            {assignment.instructions}
                        </p>
                    )}
                </div>

                {/* Already submitted banner */}
                {alreadySubmitted && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2"
                    >
                        <Send className="w-4 h-4 shrink-0" />
                        Already submitted on {formatDateTime(assignment.mySubmission!.submittedAt)}. Re-submitting will replace your previous submission.
                    </motion.div>
                )}

                {/* Submission type tabs */}
                <Tabs
                    variant="boxed"
                    tabs={[
                        { key: 'file', label: 'Upload File', icon: <Paperclip className="w-3.5 h-3.5" /> },
                        { key: 'text', label: 'Write Answer', icon: <FileText className="w-3.5 h-3.5" /> },
                    ]}
                    active={tab}
                    onChange={(k) => setTab(k as 'file' | 'text')}
                />

                {tab === 'file' ? (
                    <FileDropzone
                        onFilesSelected={setFiles}
                        multiple={false}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.txt,.py,.java,.cpp,.c,.cs"
                    />
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Your Answer</label>
                        <textarea
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            rows={8}
                            placeholder="Write your answer here..."
                            className="w-full rounded-xl border border-border bg-card text-foreground text-sm px-4 py-3 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-right">{textContent.length} characters</p>
                    </div>
                )}

                <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={handleClose}>Cancel</Button>
                    <Button
                        className="flex-1"
                        disabled={!canSubmit}
                        loading={isLoading}
                        leftIcon={!isLoading ? <Send className="w-4 h-4" /> : undefined}
                        onClick={handleSubmit}
                    >
                        {alreadySubmitted ? 'Resubmit' : 'Submit Assignment'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
