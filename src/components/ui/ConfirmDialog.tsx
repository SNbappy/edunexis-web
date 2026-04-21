import Modal from "./Modal"
import Button from "./Button"
import { AlertTriangle } from "lucide-react"
import { useThemeStore } from "@/store/themeStore"

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

export default function ConfirmDialog({
  isOpen, onClose, onConfirm, title, description,
  confirmLabel = "Confirm", cancelLabel = "Cancel",
  isLoading, variant = "danger",
}: Props) {
  const { dark } = useThemeStore()

  const isDanger  = variant === "danger"
  const iconColor = isDanger ? "#ef4444" : "#d97706"
  const iconBg    = dark
    ? (isDanger ? "rgba(239,68,68,0.12)" : "rgba(217,119,6,0.12)")
    : (isDanger ? "#fef2f2"              : "#fffbeb")
  const iconBorder= dark
    ? (isDanger ? "rgba(239,68,68,0.25)" : "rgba(217,119,6,0.25)")
    : (isDanger ? "#fecaca"              : "#fde68a")
  const textMain  = dark ? "#e2e8f8" : "#111827"
  const textSub   = dark ? "#8896c8" : "#6b7280"

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" accent={iconColor}>
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
          style={{ background: iconBg, border: `1px solid ${iconBorder}` }}>
          <AlertTriangle style={{ width: 26, height: 26, color: iconColor }} strokeWidth={2} />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-[16px] font-bold" style={{ color: textMain }}>{title}</h3>
          <p className="text-[13px] leading-relaxed" style={{ color: textSub }}>{description}</p>
        </div>
        <div className="flex gap-3 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm} loading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
