import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { ICON, ICON_STROKE, FOCUS } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"

export interface CourseTabItem {
  key:    string
  label:  string
  icon:   LucideIcon
  /** Optional badge number (e.g. pending join requests). Omit or 0 to hide. */
  badge?: number
}

interface CourseTabNavProps {
  courseId:    string
  tabs:        CourseTabItem[]
  activeTab:   string
}

/**
 * Course tabs.
 *
 * Sticks to the top of the scroll area, so the eight sections stay reachable
 * from the bottom of a long gradebook without scrolling back up. The active tab
 * is marked by an underline that slides between tabs — the movement tells you
 * where you came from, which a colour swap alone does not.
 */
export default function CourseTabNav({ courseId, tabs, activeTab }: CourseTabNavProps) {
  /* Each underline needs a stable layoutId so Framer Motion animates
     between them when the active tab changes. */
  const layoutId = useMemo(() => "course-tab-underline-" + courseId, [courseId])

  /* Scroll affordance.
     Eight tabs do not fit a phone: at 390px the strip ends mid-word on
     "Assignments" with nothing to say the rest exists, so Marks and Members
     were effectively undiscoverable on mobile. These edge fades appear only on
     the side that still has tabs off-screen, which is also how you can tell
     you have reached the end. */
  const navRef = useRef<HTMLElement>(null)
  const [edges, setEdges] = useState({ left: false, right: false })

  const syncEdges = useCallback(() => {
    const el = navRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setEdges({ left: el.scrollLeft > 1, right: el.scrollLeft < max - 1 })
  }, [])

  useEffect(() => {
    syncEdges()
    const el = navRef.current
    if (!el) return
    el.addEventListener("scroll", syncEdges, { passive: true })
    window.addEventListener("resize", syncEdges)
    return () => {
      el.removeEventListener("scroll", syncEdges)
      window.removeEventListener("resize", syncEdges)
    }
  }, [syncEdges, tabs.length])

  return (
    /* On the ink, continuing the header band above it.
       These tabs navigate *within* a course, so they belong to the course
       header rather than to the page beneath. Sitting on light between the
       dark band and the light content, they were the one element that had
       not picked a side. Now band + tabs read as a single dark header, and
       content starts cleanly below it.

       Sticky still works: scrolled, the ink tab bar meets the ink topbar
       and the two read as one continuous chrome column. */
    <div className="sticky top-0 z-20 border-b border-white/10 bg-teal-950">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        {/* `relative` wraps the scroller itself, not the padded container, so
            each fade lands exactly on the edge where tabs get clipped.
            Fades sit above the strip but must never eat a tap. */}
        <div className="relative">
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-teal-950 via-teal-950/80 to-transparent transition-opacity duration-200",
            edges.left ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-teal-950 via-teal-950/80 to-transparent transition-opacity duration-200",
            edges.right ? "opacity-100" : "opacity-0",
          )}
        />
        <nav
          ref={navRef}
          className="-mx-1 flex items-center gap-0.5 overflow-x-auto scroll-smooth px-1"
          style={{ scrollbarWidth: "none" }}
          aria-label="Course sections"
        >
          {tabs.map(t => {
            const active = t.key === activeTab
            const Icon = t.icon
            const hasBadge = !!t.badge && t.badge > 0

            return (
              <Link
                key={t.key}
                to={"/courses/" + courseId + "/" + t.key}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-[12.5px] transition-colors duration-120 sm:gap-2 sm:px-3 sm:text-[13px]",
                  FOCUS,
                  active
                    ? "font-semibold text-white"
                    : "font-medium text-teal-100/60 hover:text-white",
                )}
              >
                <Icon
                  className={cn(ICON.sm, active && "text-teal-300")}
                  strokeWidth={ICON_STROKE}
                />
                <span>{t.label}</span>

                {hasBadge && (
                  <span
                    className={cn(
                      "inline-flex h-[16px] min-w-[16px] items-center justify-center rounded-full px-1 text-[9.5px] font-bold leading-none",
                      active
                        ? "bg-teal-300 text-teal-950"
                        : "bg-white/15 text-teal-100/80",
                    )}
                    aria-label={t.badge + " pending"}
                  >
                    {t.badge! > 9 ? "9+" : t.badge}
                  </span>
                )}

                {active && (
                  <motion.span
                    layoutId={layoutId}
                    className="absolute inset-x-2.5 -bottom-px h-[2px] rounded-full bg-teal-300"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>
        </div>
      </div>
    </div>
  )
}
