import { useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/utils/cn"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  hideClose?: boolean
  scrollable?: boolean
}

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
}

function ModalContent({
  isOpen, onClose, title, description, children,
  size = "md", hideClose, scrollable,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = previous }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 99999 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className={cn(
              "relative flex w-full flex-col rounded-2xl border border-border bg-card shadow-2xl",
              SIZES[size],
              scrollable && "max-h-[90vh]",
            )}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-transparent via-teal-500 to-transparent"
              aria-hidden
            />

            {(title || !hideClose) && (
              <div className="flex shrink-0 items-start justify-between border-b border-border px-6 py-5">
                <div className="min-w-0 flex-1 pr-4">
                  {title && (
                    <h2 className="font-display text-[16px] font-bold leading-tight text-foreground">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
                  )}
                </div>
                {!hideClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="shrink-0 rounded-xl bg-muted p-1.5 text-muted-foreground transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            <div className={cn("px-6 py-5", scrollable && "flex-1 overflow-y-auto")}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default function Modal(props: ModalProps) {
  if (typeof document === "undefined") return null
  return createPortal(<ModalContent {...props} />, document.body)
}