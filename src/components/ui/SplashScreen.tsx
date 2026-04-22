import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

/**
 * Full-brand splash shown once per browser-tab session.
 * After it finishes (or on user interaction), it fades out and calls onDone().
 */
interface Props {
  onDone: () => void
  /** Total duration before auto-dismissing (ms). User interaction dismisses earlier. */
  duration?: number
}

function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path d="M8 12L16 8L24 12L16 16L8 12Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      <path d="M11 14V18C11 19.5 13.2 21 16 21C18.8 21 21 19.5 21 18V14" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="24" cy="12" r="1.2" fill="white" />
    </svg>
  )
}

export default function SplashScreen({ onDone, duration = 900 }: Props) {
  const [visible, setVisible] = useState(true)

  // Auto-dismiss after duration
  useEffect(() => {
    const t = window.setTimeout(() => setVisible(false), duration)
    return () => window.clearTimeout(t)
  }, [duration])

  // Skippable — click anywhere, press any key, or touch
  useEffect(() => {
    const skip = () => setVisible(false)
    window.addEventListener("click",    skip)
    window.addEventListener("keydown",  skip)
    window.addEventListener("touchend", skip)
    return () => {
      window.removeEventListener("click",    skip)
      window.removeEventListener("keydown",  skip)
      window.removeEventListener("touchend", skip)
    }
  }, [])

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background"
          role="status"
          aria-label="Loading EduNexis"
        >
          <div className="relative flex flex-col items-center gap-6">
            {/* Ambient glow behind mark */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-[260px] h-[260px] rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgb(var(--primary) / 0.22) 0%, transparent 65%)",
                filter: "blur(30px)",
              }}
              aria-hidden
            />

            {/* Mark — zooms in with blur-to-sharp */}
            <motion.div
              initial={{ opacity: 0, scale: 0.4, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1,   filter: "blur(0px)"  }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative text-primary"
              style={{ willChange: "transform, filter" }}
            >
              <Mark size={72} />
            </motion.div>

            {/* Wordmark block */}
            <div className="relative flex flex-col items-center gap-2.5">
              <motion.span
                initial={{ opacity: 0, y: 8, letterSpacing: "0.05em" }}
                animate={{ opacity: 1, y: 0, letterSpacing: "-0.015em" }}
                transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="font-display font-bold text-[22px] text-foreground"
              >
                EduNexis
              </motion.span>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.3, ease: "easeOut" }}
                className="h-px w-24 bg-primary/40 origin-center"
                aria-hidden
              />

              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
                className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground"
              >
                Academic Management Platform
              </motion.span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
