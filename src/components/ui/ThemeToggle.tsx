import { AnimatePresence, motion } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import { useThemeStore } from "@/store/themeStore"
import { ICON, ICON_STROKE, FOCUS } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"

export default function ThemeToggle() {
  const { dark, toggle } = useThemeStore()

  return (
    <button
      onClick={toggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
      /* Ink-styled: this only ever renders in the topbar, which is part of
         the dark app chrome. */
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl text-teal-100/60 transition-colors duration-120 hover:bg-white/[0.08] hover:text-white",
        FOCUS,
      )}
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
            <Sun className={ICON.md} strokeWidth={ICON_STROKE} />
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
            <Moon className={ICON.md} strokeWidth={ICON_STROKE} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
