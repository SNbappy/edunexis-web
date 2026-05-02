import { useMemo } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

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

export default function CourseTabNav({ courseId, tabs, activeTab }: CourseTabNavProps) {
  /* Each underline needs a stable layoutId so Framer Motion animates
     between them when the active tab changes. */
  const layoutId = useMemo(() => "course-tab-underline-" + courseId, [courseId])

  return (
    <div className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <nav
          className="flex items-center gap-0.5 overflow-x-auto scroll-smooth"
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
                className={
                  "relative inline-flex h-12 shrink-0 items-center gap-2 whitespace-nowrap px-4 text-[13px] font-semibold transition-colors " +
                  (active
                    ? "text-teal-700"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                <Icon
                  className={"h-4 w-4 transition-colors " + (active ? "text-teal-600" : "")}
                  strokeWidth={active ? 2.25 : 2}
                />
                <span>{t.label}</span>

                {hasBadge && (
                  <span
                    className={
                      "inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9.5px] font-bold leading-none " +
                      (active
                        ? "bg-teal-600 text-white"
                        : "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300")
                    }
                    aria-label={t.badge + " pending"}
                  >
                    {t.badge! > 9 ? "9+" : t.badge}
                  </span>
                )}

                {active && (
                  <motion.span
                    layoutId={layoutId}
                    className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-teal-600"
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

