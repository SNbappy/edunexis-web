import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import { useThemeStore } from "@/store/themeStore"

export default function ThemeToggle() {
  const { dark, toggle } = useThemeStore()
  return (
    <motion.button
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
      onClick={toggle}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
      style={{
        background: dark ? "rgba(99,102,241,0.18)" : "#f1f5f9",
        border:     dark ? "1px solid rgba(99,102,241,0.3)" : "1px solid #e2e8f0",
        color:      dark ? "#a5b4fc" : "#64748b",
      }}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait">
        {dark ? (
          <motion.div key="sun"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0,   scale: 1   }}
            exit={{    opacity: 0, rotate:  90,  scale: 0.5 }}
            transition={{ duration: 0.18 }}
          >
            <Sun style={{ width: 16, height: 16 }} strokeWidth={2} />
          </motion.div>
        ) : (
          <motion.div key="moon"
            initial={{ opacity: 0, rotate:  90, scale: 0.5 }}
            animate={{ opacity: 1, rotate:   0, scale: 1   }}
            exit={{    opacity: 0, rotate: -90, scale: 0.5 }}
            transition={{ duration: 0.18 }}
          >
            <Moon style={{ width: 16, height: 16 }} strokeWidth={2} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
