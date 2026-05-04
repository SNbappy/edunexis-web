import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GraduationCap } from "lucide-react"

/**
 * Brand intro loader for public-facing pages. Shows on every page refresh.
 * Light theme, triangular grid background, gradient logo emerging with brand reveal.
 * Total duration: ~1.6s before fade-out.
 */
export default function PublicLoader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2400)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="public-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
        >
          {/* Triangular tessellated grid background */}
          <TriangleGrid />

          {/* Soft radial glow centered behind logo */}
          <div
            aria-hidden
            className="absolute h-[500px] w-[500px] rounded-full bg-gradient-radial from-teal-100/60 to-transparent blur-3xl"
            style={{
              background:
                "radial-gradient(circle at center, rgb(204 251 241 / 0.7) 0%, rgb(204 251 241 / 0.3) 40%, transparent 70%)",
            }}
          />

          {/* Logo + wordmark */}
          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 1.1,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-[0_20px_60px_-15px_rgba(13,148,136,0.5)]"
            >
              <GraduationCap className="h-12 w-12" strokeWidth={2.5} />
            </motion.div>

            <motion.div
              initial={{ y: 16, opacity: 0, letterSpacing: "0.4em" }}
              animate={{ y: 0, opacity: 1, letterSpacing: "-0.02em" }}
              transition={{
                duration: 1.2,
                delay: 1.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-6 font-display text-4xl font-extrabold text-stone-900"
            >
              EduNexis
            </motion.div>

          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

/* ── Triangular grid SVG background ────────────────────────────── */

function TriangleGrid() {
  // Light teal triangles tessellated across the screen.
  // Pure SVG pattern — repeats automatically, very lightweight.
  return (
    <svg
      aria-hidden
      className="absolute inset-0 h-full w-full opacity-[0.35]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="triangle-grid"
          x="0"
          y="0"
          width="80"
          height="70"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 0 0 L 40 70 L 80 0 Z"
            fill="none"
            stroke="rgb(20 184 166 / 0.35)"
            strokeWidth="1"
          />
          <path
            d="M 40 70 L 80 0 L 120 70 Z"
            fill="none"
            stroke="rgb(20 184 166 / 0.35)"
            strokeWidth="1"
          />
          <path
            d="M 0 0 L 40 70 L -40 70 Z"
            fill="none"
            stroke="rgb(20 184 166 / 0.25)"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#triangle-grid)" />
    </svg>
  )
}