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
    /* An underline rail rather than a filled pill.
       The pill put a saturated teal block directly beneath a large teal
       hero, which made the tab row compete with the person's name for
       attention. An underline marks position without shouting, and it
       matches the course tabs inside the app. */
    <nav
      role="tablist"
      aria-label="Faculty profile sections"
      className="flex w-full items-center gap-1 border-b border-stone-200"
    >
      {tabs.map(t => {
        const isActive = active === t.key
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.key)}
            className={
              "relative whitespace-nowrap px-3 pb-3 pt-1 text-[13px] transition-colors sm:px-4 " +
              (isActive
                ? "font-semibold text-teal-700"
                : "font-medium text-stone-500 hover:text-stone-900")
            }
          >
            {t.label}
            {isActive ? (
              <span className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-teal-600" />
            ) : null}
          </button>
        )
      })}
    </nav>
  )
}