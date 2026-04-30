interface SectionHeaderProps {
  title: string
  count?: number
  action?: React.ReactNode
}

export default function SectionHeader({ title, count, action }: SectionHeaderProps) {
  return (
    <header className="mb-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2.5">
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
            {title}
          </h2>
          {typeof count === "number" && count > 0 ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
              {count}
            </span>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-2 h-[2px] w-16 rounded-full bg-teal-600 dark:bg-teal-500" />
    </header>
  )
}