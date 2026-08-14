import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface RouteProgressProps {
  /**
   * Reserve vertical space while the route chunk loads. Without this the
   * layout collapses and the footer jumps up into an empty viewport.
   */
  spacer?: boolean
}

/**
 * Route-transition feedback.
 *
 * Used as the Suspense fallback, so it mounts only while a lazy route chunk is
 * actually in flight and unmounts the moment it lands — no timers guessing at
 * navigation state.
 *
 * The 300ms delay is the important part. Most chunks resolve in ~100-300ms; a
 * loader shown instantly would flash on and off and make the app feel slower
 * and jumpier than showing nothing at all. Below the threshold the navigation
 * simply reads as instant. Above it, a slim bar says "working" without
 * blanking the page the way a full-screen splash does.
 */
export default function RouteProgress({ spacer = true }: RouteProgressProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setShow(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      {show && (
        <div
          className="fixed inset-x-0 top-0 z-[200] h-[3px] overflow-hidden bg-teal-950/10"
          role="progressbar"
          aria-label="Loading page"
        >
          {/* Eases toward 90% and waits — it never completes on its own,
              because completion is the chunk arriving and this unmounting. */}
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "90%" }}
            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-r-full bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-300 shadow-[0_0_12px_rgba(45,212,191,0.7)]"
          />
        </div>
      )}
      {spacer && <div aria-hidden className="min-h-screen" />}
    </>
  )
}
