import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import Sidebar from "./Sidebar"

interface MobileSidebarProps { isOpen: boolean; onClose: () => void }

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 lg:hidden bg-foreground/40 backdrop-blur-sm"
            aria-hidden
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 lg:hidden flex"
          >
            <div className="relative flex-1 flex flex-col overflow-hidden shadow-2xl">
              <Sidebar />
            </div>

            <button
              onClick={onClose}
              aria-label="Close menu"
              className="absolute -right-12 top-4 h-10 w-10 rounded-xl inline-flex items-center justify-center bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
