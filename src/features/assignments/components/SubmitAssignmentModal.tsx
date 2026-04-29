import { useState } from "react"
import { motion } from "framer-motion"
import { Send, FileText, Paperclip, Clock, Award } from "lucide-react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import FileDropzone from "@/components/ui/FileDropzone"
import { formatDateTime } from "@/utils/dateUtils"
import type { AssignmentDto, SubmitAssignmentRequest } from "@/types/assignment.types"

interface SubmitAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  assignment: AssignmentDto
  onSubmit: (d: SubmitAssignmentRequest) => void
  isLoading?: boolean
}

const TABS = [
  { key: "file" as const, label: "Upload file", icon: Paperclip },
  { key: "text" as const, label: "Write answer", icon: FileText },
]

export default function SubmitAssignmentModal({
  isOpen, onClose, assignment, onSubmit, isLoading,
}: SubmitAssignmentModalProps) {
  const [tab, setTab] = useState<"file" | "text">("file")
  const [textContent, setTextContent] = useState("")
  const [files, setFiles] = useState<File[]>([])

  const handleClose = () => { setTextContent(""); setFiles([]); onClose() }
  const canSubmit = tab === "text" ? textContent.trim().length > 0 : files.length > 0

  const handleSubmit = () => {
    if (tab === "file") onSubmit({ submissionType: "File", file: files[0] })
    else onSubmit({ submissionType: "Text", textContent })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Submit assignment" size="lg">
      <div className="space-y-4">
        {/* Assignment info card */}
        <div className="space-y-2 rounded-2xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-950/40">
          <p className="font-display text-[13.5px] font-bold text-foreground">
            {assignment.title}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-teal-700 dark:text-teal-300">
              <Clock className="h-3 w-3" />
              Due: {formatDateTime(assignment.deadline)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <Award className="h-3 w-3" />
              {assignment.maxMarks} marks
            </span>
          </div>
          {assignment.instructions && (
            <p className="border-t border-teal-200 pt-2 text-[11.5px] leading-relaxed text-muted-foreground dark:border-teal-800">
              {assignment.instructions}
            </p>
          )}
        </div>

        {/* Submission type toggle */}
        <div className="flex gap-1 rounded-xl border border-border bg-muted p-1">
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.key
            return (
              <motion.button
                key={t.key}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setTab(t.key)}
                className={
                  "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-[12.5px] font-bold transition-colors " +
                  (active
                    ? "bg-card text-teal-700 shadow-sm dark:text-teal-300"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </motion.button>
            )
          })}
        </div>

        {/* Input area */}
        {tab === "file" ? (
          <FileDropzone
            onFilesSelected={setFiles}
            multiple={false}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.txt,.py,.java,.cpp,.c,.cs"
          />
        ) : (
          <div>
            <textarea
              value={textContent}
              onChange={e => setTextContent(e.target.value)}
              rows={8}
              placeholder="Write your answer here…"
              className="w-full resize-none rounded-xl border border-border bg-muted/40 px-4 py-3 text-[13px] text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-teal-500 focus:bg-card focus:ring-2 focus:ring-teal-500/20"
            />
            <p className="mt-1 text-right text-[11px] text-muted-foreground">
              {textContent.length} characters
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleSubmit}
            disabled={!canSubmit || !!isLoading}
            loading={isLoading}
          >
            <Send className="h-3.5 w-3.5" />
            Submit assignment
          </Button>
        </div>
      </div>
    </Modal>
  )
}