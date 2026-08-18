import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { useIsFetching } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"

/**
 * Whole-navigation progress.
 *
 * `RouteProgress` is the Suspense fallback, so it covers only the lazy chunk
 * download and disappears the instant the module lands. But a page is not
 * usable when its module arrives — it is usable when its data does, and that is
 * where the wait actually is: the course page mounts, then sits on skeletons
 * while the course, members, assignments and notifications queries resolve.
 * Nothing told the user anything was happening during that second, which is
 * what made navigation feel slow rather than merely take a moment.
 *
 * This spans the whole transition: it arms on a route change and clears once
 * the query cache goes quiet.
 *
 * Two details keep it from becoming noise in its own right:
 *
 * - It only ever arms on a navigation. Half the queries in this app poll on an
 *   8-second interval, so a bar bound to `useIsFetching` alone would blink
 *   across the top of a page nobody was navigating away from.
 * - It waits 250ms before drawing. A cached route resolves well inside that,
 *   and a bar that flashes on and off reads as jank, not as speed.
 */
export default function NavigationProgress() {
  const { pathname } = useLocation()
  const isFetching = useIsFetching()
  const [active, setActive] = useState(false)
  const [visible, setVisible] = useState(false)

  /* Arm on navigation. The cap is a safety net: if a query never settles —
     an offline API, a request that hangs — the bar must not stay up forever. */
  useEffect(() => {
    setActive(true)
    const cap = window.setTimeout(() => setActive(false), 10_000)
    return () => window.clearTimeout(cap)
  }, [pathname])

  /* Disarm once nothing is in flight. The short grace period stops the bar
     tearing down between two queries that fire back to back. */
  useEffect(() => {
    if (!active || isFetching > 0) return
    const t = window.setTimeout(() => setActive(false), 150)
    return () => window.clearTimeout(t)
  }, [active, isFetching])

  useEffect(() => {
    if (!active) { setVisible(false); return }
    const t = window.setTimeout(() => setVisible(true), 250)
    return () => window.clearTimeout(t)
  }, [active])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="nav-progress"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-x-0 top-0 z-[200] h-[3px] overflow-hidden bg-primary/10"
          role="progressbar"
          aria-label="Loading page"
        >
          {/* Eases toward 90% and holds — it never completes on its own,
              because completion is this component unmounting. */}
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "90%" }}
            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-r-full bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-300 shadow-[0_0_12px_rgba(45,212,191,0.7)]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
