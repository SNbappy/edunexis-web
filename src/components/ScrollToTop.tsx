import { useEffect } from "react"
import { useLocation } from "react-router-dom"

/**
 * Owns scroll position for the app.
 *
 * Two jobs:
 *  1. On first load, pin to the top. The browser's native restoration is
 *     disabled in main.tsx, otherwise reloading half-way down a long page
 *     shows the footer for a frame before snapping up to the hero.
 *  2. On route change, reset to the top — without this a SPA keeps the old
 *     scroll offset when you navigate, so a new page opens mid-way down.
 *
 * Hash links are left alone so in-page anchors still work.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
