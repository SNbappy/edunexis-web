import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/utils/cn"

interface ModalProps {
  isOpen: boolean; onClose: () => void
  title?: string; description?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  hideClose?: boolean; scrollable?: boolean
  accent?: string
}

const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" }

export default function Modal({
  isOpen, onClose, title, description, children,
  size = "md", hideClose, scrollable, accent = "#4f46e5"
}: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0"
            style={{ background: "rgba(3,7,18,0.8)", backdropFilter: "blur(8px)" }} />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn("relative w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col", sizes[size], scrollable && "max-h-[90vh]")}
            style={{
              background: "linear-gradient(145deg,#0a1428 0%,#070e21 100%)",
              border: `1px solid ${accent}28`,
              boxShadow: `0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px ${accent}10, 0 4px 24px ${accent}15`,
            }}>

            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg,transparent,${accent}80,transparent)` }} />

            {/* Header */}
            {(title || !hideClose) && (
              <div className="flex items-start justify-between p-6 pb-4 shrink-0"
                style={{ borderBottom: `1px solid ${accent}12` }}>
                <div>
                  {title && (
                    <h2 className="text-[16px] font-bold" style={{ color: "#e2e8f0" }}>{title}</h2>
                  )}
                  {description && (
                    <p className="text-[13px] mt-0.5" style={{ color: "#475569" }}>{description}</p>
                  )}
                </div>
                {!hideClose && (
                  <button onClick={onClose}
                    className="p-1.5 rounded-lg transition-all ml-4 shrink-0"
                    style={{ color: "#475569" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.1)"; (e.currentTarget as HTMLElement).style.color = "#818cf8" }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#475569" }}>
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className={cn("p-6", scrollable && "overflow-y-auto")}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
