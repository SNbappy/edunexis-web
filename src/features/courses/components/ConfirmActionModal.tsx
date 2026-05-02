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
    iconWrap: "bg-teal-50 border-teal-200 text-teal-600 dark:bg-teal-950/30 dark:border-teal-900/50 dark:text-teal-300",
    icon:     "text-teal-600",
    button:   "primary",
    warning:  "text-stone-600",
  },
  warning: {
    iconWrap: "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-300",
    icon:     "text-amber-600",
    button:   "primary",
    warning:  "text-amber-700",
  },
  danger: {
    iconWrap: "bg-red-50 border-red-200 text-red-600 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-300",
    icon:     "text-red-600",
    button:   "danger",
    warning:  "text-red-700",
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
