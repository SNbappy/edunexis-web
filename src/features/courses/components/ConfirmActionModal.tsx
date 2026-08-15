import { AlertTriangle } from "lucide-react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"

export type ConfirmActionTone = "primary" | "danger" | "warning"

interface ConfirmActionModalProps {
  isOpen:       boolean
  onClose:      () => void
  onConfirm:    () => void
  title:        string
  description:  string
  /** Short inline warning shown above the buttons (e.g. "This cannot be undone."). */
  warning?:     string
  confirmLabel: string
  cancelLabel?: string
  tone?:        ConfirmActionTone
  isLoading?:   boolean
}

const toneStyles: Record<ConfirmActionTone, {
  iconWrap: string
  icon:     string
  button:   "primary" | "danger"
  warning:  string
}> = {
  primary: {
    iconWrap: "bg-primary-soft border-primary/25 text-primary",
    icon:     "text-primary",
    button:   "primary",
    warning:  "text-muted-foreground",
  },
  warning: {
    iconWrap: "bg-warning-soft border-warning/25 text-warning",
    icon:     "text-warning",
    button:   "primary",
    warning:  "text-warning",
  },
  danger: {
    iconWrap: "bg-destructive-soft border-destructive/25 text-destructive",
    icon:     "text-destructive",
    button:   "danger",
    warning:  "text-destructive",
  },
}

export default function ConfirmActionModal({
  isOpen, onClose, onConfirm, title, description, warning,
  confirmLabel, cancelLabel = "Cancel", tone = "primary", isLoading,
}: ConfirmActionModalProps) {
  const styles = toneStyles[tone]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title="" hideHeader>
      <div className="px-1 py-1">
        <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${styles.iconWrap}`}>
          <AlertTriangle className={`h-7 w-7 ${styles.icon}`} strokeWidth={2} />
        </div>

        <h3 className="text-center text-lg font-bold text-foreground">
          {title}
        </h3>

        <p className="mt-2 text-center text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </p>

        {warning && (
          <p className={`mt-4 rounded-xl border border-current/20 bg-current/5 px-4 py-2.5 text-center text-[12px] font-semibold ${styles.warning}`}>
            {warning}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={styles.button as any}
            className="flex-1"
            loading={isLoading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
