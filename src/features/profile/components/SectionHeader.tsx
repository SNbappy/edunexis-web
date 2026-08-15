interface SectionHeaderProps {
  title: string
  count?: number
  action?: React.ReactNode
}

export default function SectionHeader({ title, count, action }: SectionHeaderProps) {
  return (
    /* The teal underline is gone. It was purely decorative, and repeated once
       per section it turned a profile into a stack of banners. Section headings
       match the rest of the app now: weight and size do the work. */
    <header className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-baseline gap-2">
        <h2 className="font-display text-[15px] font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {typeof count === "number" && count > 0 ? (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-muted-foreground">
            {count}
          </span>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}