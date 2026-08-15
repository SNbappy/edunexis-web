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
 * A segmented control on a shared track, matching the view switchers in
 * Attendance, Materials, Members and CT. It was a filled teal pill in a
 * ring-and-shadow bar, which made a set of four tabs read louder than the
 * primary action sitting next to it.
 */
export default function ProfileTabs({ tabs, active, onChange }: ProfileTabsProps) {
  return (
    <nav
      role="tablist"
      aria-label="Profile sections"
      className="inline-flex items-center gap-0.5 rounded-xl border border-border bg-muted p-0.5"
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
              "h-8 whitespace-nowrap rounded-[9px] px-3 text-[12.5px] font-semibold transition-colors duration-120",
              FOCUS,
              isActive
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}
