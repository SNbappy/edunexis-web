export type FacultyTabKey = "overview" | "research" | "courses" | "about"

interface TabDef {
  key: FacultyTabKey
  label: string
}

interface Props {
  tabs: TabDef[]
  active: FacultyTabKey
  onChange: (key: FacultyTabKey) => void
}

export default function PublicFacultyTabs({ tabs, active, onChange }: Props) {
  return (
    <nav
      role="tablist"
      aria-label="Faculty profile sections"
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