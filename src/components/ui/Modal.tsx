import { useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { ICON, ICON_STROKE, FOCUS, MOTION, SURFACE } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  hideClose?: boolean
  /** Suppress the whole header bar — for dialogs that draw their own. */
  hideHeader?: boolean
  /** Pinned action bar. Stays visible while the body scrolls. */
  footer?: React.ReactNode
}

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
}

function ModalContent({
  isOpen, onClose, title, description, children,
  size = "md", hideClose, hideHeader, footer,
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

  const showHeader = !hideHeader && (title || !hideClose)

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 flex items-center justify-center overflow-y-auto p-3 sm:p-4"
          style={{ zIndex: 99999 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION.overlay }}
            onClick={onClose}
            className={cn("fixed inset-0", SURFACE.scrim)}
          />

          {/* Rises a little rather than scaling up from small: at dialog size a
              scale-in reads as a pop, and this gets opened dozens of times a day. */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 8,  scale: 0.99 }}
            transition={{ duration: MOTION.overlay, ease: MOTION.ease }}
            className={cn(
              SURFACE.overlay,
              "relative flex w-full flex-col overflow-hidden",
              SIZES[size],
              "max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)]",
            )}
          >
            {showHeader && (
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4">
                <div className="min-w-0 flex-1">
                  {title && (
                    <h2 className="font-display text-[15.5px] font-bold leading-tight text-foreground">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
                {!hideClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className={cn(
                      "-mr-1 -mt-0.5 shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors duration-120 hover:bg-muted hover:text-foreground",
                      FOCUS,
                    )}
                  >
                    <X className={ICON.sm} strokeWidth={ICON_STROKE} />
                  </button>
                )}
              </div>
            )}

            {/* The body always scrolls.
                It used to scroll only when `scrollable` or a footer was set, so
                any modal taller than the viewport without either simply had its
                overflow clipped by the container — the bottom of the form,
                including its buttons, became unreachable. Making this
                unconditional means a long modal degrades to a scroll instead of
                losing content, whatever the caller passed.

                `scrollbar-hide` keeps the track invisible while the content
                still scrolls, so a short modal does not gain a stray gutter. */}
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4",
                "scrollbar-hide",
              )}
            >
              {children}
            </div>

            {footer && (
              <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/40 px-5 py-3.5">
                {footer}
              </div>
            )}
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
