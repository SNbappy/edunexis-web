import { useState } from 'react'
import { Send, FileText, Paperclip } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import FileDropzone from '@/components/ui/FileDropzone'
import Tabs from '@/components/ui/Tabs'
import { formatDateTime } from '@/utils/dateUtils'
import type { AssignmentDto, SubmitAssignmentRequest } from '@/types/assignment.types'

interface Props {
    isOpen: boolean
    onClose: () => void
    assignment: AssignmentDto
    onSubmit: (data: SubmitAssignmentRequest) => void
    isLoading?: boolean
}

export default function SubmitAssignmentModal({ isOpen, onClose, assignment, onSubmit, isLoading }: Props) {
    const [tab, setTab] = useState<'file' | 'text'>('file')
    const [textContent, setTextContent] = useState('')
    const [files, setFiles] = useState<File[]>([])

    const handleClose = () => {
        setTextContent('')
        setFiles([])
        onClose()
    }

    const handleSubmit = () => {
        if (tab === 'file') {
            onSubmit({ submissionType: 'File', file: files[0] })
        } else {
            onSubmit({ submissionType: 'Text', textContent })
        }
    }

    const canSubmit = tab === 'text' ? textContent.trim().length > 0 : files.length > 0

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Submit Assignment" size="lg">
            <div className="space-y-5">
                {/* Assignment info */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                    <p className="text-sm font-semibold text-foreground">{assignment.title}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span>Due: {formatDateTime(assignment.deadline)}</span>
                        <span>{assignment.maxMarks} marks</span>
                    </div>
                    {assignment.instructions && (
                        <p className="text-xs text-muted-foreground border-t border-primary/20 pt-2 mt-2">
                            {assignment.instructions}
                        </p>
                    )}
                </div>

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
                        Submit Assignment
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
