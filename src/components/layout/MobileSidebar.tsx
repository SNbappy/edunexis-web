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
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: "rgba(3,7,18,0.75)", backdropFilter: "blur(6px)" }}
            onClick={onClose} />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 left-0 z-50 lg:hidden flex"
            style={{ width: 260 }}>
            <div className="relative flex-1 flex flex-col overflow-hidden"
              style={{
                background: "linear-gradient(180deg,#070e21 0%,#060c1d 100%)",
                borderRight: "1px solid rgba(99,102,241,0.12)",
                boxShadow: "8px 0 40px rgba(0,0,0,0.6)"
              }}>
              <Sidebar />
            </div>

            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              onClick={onClose}
              className="absolute -right-11 top-4 w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(10,22,40,0.9)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <X className="w-4 h-4" style={{ color: "#818cf8" }} />
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

