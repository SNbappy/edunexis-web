import { useState } from "react"
import { LogOut } from "lucide-react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"

interface LeaveCourseModalProps {
  isOpen:      boolean
  onClose:     () => void
  onConfirm:   (password: string) => void
  courseTitle: string
  courseCode:  string
  isLoading?:  boolean
}

export default function LeaveCourseModal({
  isOpen, onClose, onConfirm, courseTitle, courseCode, isLoading,
}: LeaveCourseModalProps) {
  const [codeInput, setCodeInput] = useState("")
  const [password, setPassword]   = useState("")

  const codeMatches = codeInput.trim().toUpperCase() === courseCode.toUpperCase()
  const canSubmit   = codeMatches && password.length > 0 && !isLoading

  const handleClose = () => {
    setCodeInput("")
    setPassword("")
    onClose()
  }

  const handleConfirm = () => {
    if (!canSubmit) return
    onConfirm(password)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" title="" hideHeader>
      <div className="px-1 py-1">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive">
          <LogOut className="h-7 w-7" strokeWidth={2} />
        </div>

        <h3 className="text-center text-lg font-bold text-foreground">
          Leave this course?
        </h3>

        <p className="mt-2 text-center text-[13px] leading-relaxed text-muted-foreground">
          You will lose access to{" "}
          <span className="font-semibold text-foreground">{courseTitle}</span>.
          Your attendance records and marks will be kept, but you will need to
          request to join again if you change your mind.
        </p>

        <div className="mt-5 space-y-3">
          <div>
            <label
              htmlFor="leave-course-code-confirm"
              className="mb-1.5 block text-[12px] font-semibold text-foreground"
            >
              Type <span className="font-mono text-destructive">{courseCode}</span> to confirm
            </label>
            <input
              id="leave-course-code-confirm"
              name="leave-course-code-confirm"
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
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-destructive focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="leave-course-password-confirm"
              className="mb-1.5 block text-[12px] font-semibold text-foreground"
            >
              Enter your password to confirm
            </label>
            <input
              id="leave-course-password-confirm"
              name="leave-course-password-confirm"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your account password"
              autoComplete="new-password"
              data-lpignore="true"
              data-1p-ignore="true"
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground transition-all focus:border-destructive focus:outline-none focus:ring-2 focus:ring-red-500/20"
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
            Leave course
          </Button>
        </div>
      </div>
    </Modal>
  )
}
