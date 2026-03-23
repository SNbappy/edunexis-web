import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, FileText, Paperclip, Clock, BookOpen } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import FileDropzone from '@/components/ui/FileDropzone'
import { formatDateTime } from '@/utils/dateUtils'
import type { AssignmentDto, SubmitAssignmentRequest } from '@/types/assignment.types'

interface Props {
  isOpen: boolean; onClose: () => void
  assignment: AssignmentDto
  onSubmit: (d: SubmitAssignmentRequest) => void
  isLoading?: boolean
}

const TABS = [
  { key: 'file', label: 'Upload File',   icon: Paperclip },
  { key: 'text', label: 'Write Answer',  icon: FileText  },
] as const

export default function SubmitAssignmentModal({ isOpen, onClose, assignment, onSubmit, isLoading }: Props) {
  const [tab,         setTab]         = useState<'file' | 'text'>('file')
  const [textContent, setTextContent] = useState('')
  const [files,       setFiles]       = useState<File[]>([])

  const handleClose = () => { setTextContent(''); setFiles([]); onClose() }
  const canSubmit   = tab === 'text' ? textContent.trim().length > 0 : files.length > 0

  const handleSubmit = () => {
    if (tab === 'file') onSubmit({ submissionType: 'File', file: files[0] })
    else onSubmit({ submissionType: 'Text', textContent })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Submit Assignment" size="lg">
      <div className="space-y-4">

        {/* Assignment info card */}
        <div className="p-4 rounded-2xl space-y-2"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)' }}>
          <p className="text-[13.5px] font-bold" style={{ color: '#e2e8f0' }}>{assignment.title}</p>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-[11.5px]" style={{ color: '#818cf8' }}>
              <Clock className="w-3.5 h-3.5" /> Due: {formatDateTime(assignment.deadline)}
            </span>
            <span className="flex items-center gap-1.5 text-[11.5px]" style={{ color: '#475569' }}>
              <BookOpen className="w-3.5 h-3.5" /> {assignment.maxMarks} marks
            </span>
          </div>
          {assignment.instructions && (
            <p className="text-[11.5px] pt-2 border-t" style={{ color: '#475569', borderColor: 'rgba(99,102,241,0.15)' }}>
              {assignment.instructions}
            </p>
          )}
        </div>

        {/* Submission type toggle */}
        <div className="flex gap-2 p-1 rounded-xl"
          style={{ background: 'rgba(6,13,31,0.6)', border: '1px solid rgba(99,102,241,0.15)' }}>
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.key
            return (
              <motion.button key={t.key} whileTap={{ scale: 0.96 }}
                onClick={() => setTab(t.key)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12.5px] font-bold transition-all"
                style={{
                  background: active ? 'rgba(99,102,241,0.25)' : 'transparent',
                  color:      active ? '#818cf8' : '#475569',
                  border:     active ? '1px solid rgba(99,102,241,0.35)' : '1px solid transparent',
                }}>
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </motion.button>
            )
          })}
        </div>

        {/* Input area */}
        {tab === 'file' ? (
          <FileDropzone onFilesSelected={setFiles} multiple={false}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.txt,.py,.java,.cpp,.c,.cs" />
        ) : (
          <div>
            <textarea
              value={textContent} onChange={e => setTextContent(e.target.value)}
              rows={8} placeholder="Write your answer here..."
              className="w-full rounded-xl text-sm px-4 py-3 focus:outline-none transition-all resize-none"
              style={{ background: 'rgba(6,13,31,0.7)', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
              onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')}
              onBlur={e  => (e.target.style.borderColor = 'rgba(99,102,241,0.2)')}
            />
            <p className="text-[11px] text-right mt-1" style={{ color: '#334155' }}>{textContent.length} characters</p>
          </div>
        )}

        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#818cf8' }}>
            Cancel
          </motion.button>
          <motion.button
            whileHover={canSubmit ? { scale: 1.02, boxShadow: '0 6px 24px rgba(99,102,241,0.45)' } : {}}
            whileTap={canSubmit ? { scale: 0.97 } : {}}
            onClick={handleSubmit} disabled={!canSubmit || !!isLoading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: canSubmit ? 'linear-gradient(135deg,#4f46e5,#06b6d4)' : 'rgba(99,102,241,0.1)', color: canSubmit ? '#fff' : '#334155', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading
              ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" /> Submitting...</>
              : <><Send className="w-4 h-4" /> Submit Assignment</>
            }
          </motion.button>
        </div>
      </div>
    </Modal>
  )
}