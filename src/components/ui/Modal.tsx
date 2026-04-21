import { useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/utils/cn"
import { useThemeStore } from "@/store/themeStore"

interface ModalProps {
  isOpen:       boolean
  onClose:      () => void
  title?:       string
  description?: string
  children:     React.ReactNode
  size?:        "sm" | "md" | "lg" | "xl"
  hideClose?:   boolean
  scrollable?:  boolean
  accent?:      string
}

const SIZES = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" }

function ModalContent({
  isOpen, onClose, title, description, children,
  size = "md", hideClose, scrollable, accent = "#6366f1"
}: ModalProps) {
  const { dark } = useThemeStore()

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  const cardBg      = dark ? "rgb(16,24,44)"           : "#ffffff"
  const border      = dark ? "rgba(99,102,241,0.2)"    : "#e5e7eb"
  const divider     = dark ? "rgba(99,102,241,0.1)"    : "#f3f4f6"
  const textMain    = dark ? "#e2e8f8"                 : "#111827"
  const textSub     = dark ? "#8896c8"                 : "#6b7280"
  const closeBg     = dark ? "rgba(255,255,255,0.06)"  : "#f3f4f6"
  const closeBgHover= dark ? "rgba(239,68,68,0.12)"   : "#fef2f2"

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16, zIndex: 99999,
          }}>

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 0,
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.96, y: 16  }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className={cn(
              "relative w-full rounded-2xl flex flex-col",
              SIZES[size],
              scrollable && "max-h-[90vh]"
            )}
            style={{
              background:  cardBg,
              border:      `1px solid ${border}`,
              boxShadow:   dark
                ? `0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px ${accent}18`
                : `0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.06)`,
              zIndex: 1,
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl pointer-events-none"
              style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
            />

            {/* Header */}
            {(title || !hideClose) && (
              <div className="flex items-start justify-between px-6 py-5 shrink-0"
                style={{ borderBottom: `1px solid ${divider}` }}>
                <div className="flex-1 min-w-0 pr-4">
                  {title && (
                    <h2 className="text-[16px] font-bold leading-tight" style={{ color: textMain }}>
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-[13px] mt-1" style={{ color: textSub }}>{description}</p>
                  )}
                </div>
                {!hideClose && (
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-xl transition-all shrink-0"
                    style={{ background: closeBg, color: textSub }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = closeBgHover
                      ;(e.currentTarget as HTMLElement).style.color = "#ef4444"
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = closeBg
                      ;(e.currentTarget as HTMLElement).style.color = textSub
                    }}
                  >
                    <X style={{ width: 16, height: 16 }} />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className={cn("px-6 py-5", scrollable && "overflow-y-auto flex-1")}>
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
