import { useEffect, useRef, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MoreVertical } from "lucide-react"
import { FOCUS, ICON_STROKE } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"

export interface RowMenuItem {
  label: string
  icon?: ReactNode
  onSelect: () => void
  /** Renders in the destructive colour and sits below a divider. */
  danger?: boolean
}

/**
 * The "…" menu on a list row.
 *
 * Replaces rows that revealed one icon button per action on hover. That pattern
 * costs a button of width for every action, only appears on hover — so it is
 * invisible on touch — and grows unreadable the moment a row has more than two
 * things you can do to it.
 *
 * Destructive items still confirm, but inside the menu rather than by swapping
 * the row's controls for an armed state.
 */
export default function RowMenu({
  items,
  label = "More actions",
  className,
  align = "right",
}: {
  items: RowMenuItem[]
  label?: string
  className?: string
  align?: "left" | "right"
}) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setConfirming(null)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setConfirming(null) }
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  if (items.length === 0) return null

  return (
    <div ref={ref} className={cn("relative shrink-0", open ? "z-50" : "z-0", className)}>
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setConfirming(null) }}
        aria-label={label}
        aria-expanded={open}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          FOCUS,
        )}
      >
        <MoreVertical className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.13 }}
            className={cn(
              "absolute top-8 z-50 min-w-[152px] rounded-xl border border-border bg-card p-1 shadow-xl",
              align === "right" ? "right-0" : "left-0",
            )}
            role="menu"
          >
            {items.map((item, i) => {
              const armed = confirming === item.label
              return (
                <div key={item.label}>
                  {item.danger && i > 0 && (
                    <div className="my-1 h-px bg-border" aria-hidden />
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      if (item.danger && !armed) { setConfirming(item.label); return }
                      setOpen(false)
                      setConfirming(null)
                      item.onSelect()
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] font-medium transition-colors",
                      item.danger
                        ? armed
                          ? "bg-destructive text-white"
                          : "text-destructive hover:bg-destructive-soft"
                        : "text-foreground hover:bg-muted",
                      FOCUS,
                    )}
                  >
                    {item.icon}
                    {armed ? `${item.label}?` : item.label}
                  </button>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
