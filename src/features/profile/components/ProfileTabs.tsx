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

export default function ProfileTabs({ tabs, active, onChange }: ProfileTabsProps) {
  return (
    <nav
      role="tablist"
      aria-label="Profile sections"
      className="inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm ring-1 ring-stone-200/50 dark:ring-white/5"
    >
      {tabs.map(t => {
        const isActive = active === t.key
        const tabClass = isActive
          ? "bg-teal-600 text-white shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.key)}
            className={"whitespace-nowrap rounded-lg px-4 py-2 text-[13px] font-bold transition-colors " + tabClass}
          >
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}