import { FOCUS } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"

export type ProfileTabKey = "overview" | "courses" | "research" | "about"

interface TabDef {
  key: ProfileTabKey
  label: string
}

interface ProfileTabsProps {
  tabs: TabDef[]
  active: ProfileTabKey
  onChange: (key: ProfileTabKey) => void
}

/**
 * Profile section tabs.
 *
 * An underline rail, the same shape the course tabs and the public faculty
 * tabs use. It was a segmented control floating in its own bordered track,
 * which read as a filter control rather than as page navigation — and it was
 * the only place in the app where switching *pages of a profile* looked
 * different from switching pages of a course.
 */
export default function ProfileTabs({ tabs, active, onChange }: ProfileTabsProps) {
  return (
    <nav
      role="tablist"
      aria-label="Profile sections"
      className="-mb-px flex items-center gap-1 overflow-x-auto"
      style={{ scrollbarWidth: "none" }}
    >
      {tabs.map(t => {
        const isActive = active === t.key
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.key)}
            className={cn(
              "relative shrink-0 whitespace-nowrap px-3 pb-3 pt-1 text-[13px] transition-colors duration-120 sm:px-4",
              FOCUS,
              isActive
                ? "font-semibold text-primary"
                : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {isActive && (
              <span className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-primary" />
            )}
          </button>
        )
      })}
    </nav>
  )
}
