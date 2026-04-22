import { AnimatePresence, motion } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import { useThemeStore } from "@/store/themeStore"

export default function ThemeToggle() {
  const { dark, toggle } = useThemeStore()

  return (
    <button
      onClick={toggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
      className="h-10 w-10 inline-flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted focus-ring transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        {dark ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: -60, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0,   scale: 1   }}
            exit={{    opacity: 0, rotate: 60,  scale: 0.7 }}
            transition={{ duration: 0.15 }}
            className="inline-flex"
          >
            <Sun className="h-[18px] w-[18px]" strokeWidth={2} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: 60,  scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0,   scale: 1   }}
            exit={{    opacity: 0, rotate: -60, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            className="inline-flex"
          >
            <Moon className="h-[18px] w-[18px]" strokeWidth={2} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
