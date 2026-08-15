import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"

interface DeleteCourseModalProps {
  isOpen:      boolean
  onClose:     () => void
  onConfirm:   (password: string, courseCodeConfirmation: string) => void
  courseTitle: string
  courseCode:  string
  isLoading?:  boolean
}

export default function DeleteCourseModal({
  isOpen, onClose, onConfirm, courseTitle, courseCode, isLoading,
}: DeleteCourseModalProps) {
  const [codeInput, setCodeInput] = useState("")
  const [password, setPassword] = useState("")

  const codeMatches = codeInput.trim() === courseCode
  const canSubmit = codeMatches && password.length > 0 && !isLoading

  const handleClose = () => {
    setCodeInput("")
    setPassword("")
    onClose()
  }

  const handleConfirm = () => {
    if (!canSubmit) return
    onConfirm(password, codeInput.trim())
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" title="" hideHeader>
      <div className="px-1 py-1">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-warning/25 bg-warning-soft text-warning">
          <AlertTriangle className="h-7 w-7" strokeWidth={2} />
        </div>

        <h3 className="text-center text-lg font-bold text-foreground">
          Delete this course?
        </h3>

        <p className="mt-2 text-center text-[13px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">{courseTitle}</span> will move to
          Recently Deleted. All attendance records, assignments, materials, and marks are kept
          and you can restore the course within 30 days.
        </p>

        {/* `autoComplete` is a form/input attribute; on a div it did nothing. */}
        <div className="mt-5 space-y-3">
          <div>
            <label htmlFor="delete-course-code-confirm" className="mb-1.5 block text-[12px] font-semibold text-foreground">
              Type <span className="font-mono text-warning">{courseCode}</span> to confirm
            </label>
            <input
              id="delete-course-code-confirm"
              name="delete-course-code-confirm"
              type="text"
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
              placeholder={courseCode}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-lpignore="true"
              data-1p-ignore="true"
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-warning focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label htmlFor="delete-course-password-confirm" className="mb-1.5 block text-[12px] font-semibold text-foreground">
              Enter your password to confirm
            </label>
            <input
              id="delete-course-password-confirm"
              name="delete-course-password-confirm"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your account password"
              autoComplete="new-password"
              data-lpignore="true"
              data-1p-ignore="true"
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground transition-all focus:border-warning focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            loading={isLoading}
            disabled={!canSubmit}
            onClick={handleConfirm}
          >
            Delete course
          </Button>
        </div>
      </div>
    </Modal>
  )
}