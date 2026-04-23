import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface ShowAdvancedToggleProps {
  /** Stable key — used to persist open/closed state across refreshes. */
  storageKey?: string
  /** Default open state if no storage entry exists. */
  defaultOpen?: boolean
  /** Button label. */
  label?: string
  children: React.ReactNode
}

export default function ShowAdvancedToggle({
  storageKey, defaultOpen = false, label = "Show advanced options", children,
}: ShowAdvancedToggleProps) {
  const [open, setOpen] = useState<boolean>(() => {
    if (!storageKey || typeof window === "undefined") return defaultOpen
    try {
      const stored = window.sessionStorage.getItem(storageKey)
      return stored === null ? defaultOpen : stored === "1"
    } catch {
      return defaultOpen
    }
  })

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return
    try { window.sessionStorage.setItem(storageKey, open ? "1" : "0") }
    catch { /* noop */ }
  }, [storageKey, open])

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-teal-700 transition-colors hover:text-teal-800"
      >
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="inline-flex"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
        {open ? "Hide advanced options" : label}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
