import { AlertTriangle } from "lucide-react"
import Modal from "./Modal"
import Button from "./Button"
import { ICON_STROKE } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"

interface Props {
  isOpen:        boolean
  onClose:       () => void
  onConfirm:     () => void
  title:         string
  description:   string
  confirmLabel?: string
  cancelLabel?:  string
  isLoading?:    boolean
  variant?:      "danger" | "warning"
}

/**
 * Confirm dialog.
 *
 * Left-aligned with the icon beside the text rather than centred under it:
 * a centred alert reads as an interruption, and most confirms here are routine
 * ("delete this material?"). It also lets the title and body share a baseline
 * with every other dialog in the app.
 *
 * Previously this read the theme store and computed hex colours inline for both
 * modes; it now uses the semantic tokens, which already do that.
 */
export default function ConfirmDialog({
  isOpen, onClose, onConfirm, title, description,
  confirmLabel = "Confirm", cancelLabel = "Cancel",
  isLoading, variant = "danger",
}: Props) {
  const danger = variant === "danger"

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      hideHeader
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "danger" : "warning"}
            onClick={onConfirm}
            loading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3.5 py-1">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
            danger
              ? "border-destructive/20 bg-destructive-soft text-destructive"
              : "border-warning/25 bg-warning-soft text-warning",
          )}
          aria-hidden
        >
          <AlertTriangle className="h-[18px] w-[18px]" strokeWidth={ICON_STROKE} />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-display text-[15.5px] font-bold leading-tight text-foreground">
            {title}
          </h3>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </Modal>
  )
}
