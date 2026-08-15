import { useMemo } from "react"
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

  return (
    <div className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <nav
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
                    ? "font-semibold text-primary"
                    : "font-medium text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={ICON.sm} strokeWidth={ICON_STROKE} />
                <span>{t.label}</span>

                {hasBadge && (
                  <span
                    className={cn(
                      "inline-flex h-[16px] min-w-[16px] items-center justify-center rounded-full px-1 text-[9.5px] font-bold leading-none",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                    aria-label={t.badge + " pending"}
                  >
                    {t.badge! > 9 ? "9+" : t.badge}
                  </span>
                )}

                {active && (
                  <motion.span
                    layoutId={layoutId}
                    className="absolute inset-x-2.5 -bottom-px h-[2px] rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
