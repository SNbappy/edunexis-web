import { ChevronRight, Home } from "lucide-react"
import type { BreadcrumbItem } from "@/types/material.types"

interface MaterialsBreadcrumbProps {
  items: BreadcrumbItem[]
  onNavigate: (index: number) => void
}

export default function MaterialsBreadcrumb({ items, onNavigate }: MaterialsBreadcrumbProps) {
  if (items.length <= 1) return null

  return (
    <nav className="flex flex-wrap items-center gap-1" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        const isHome = i === 0

        return (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
            <button
              type="button"
              onClick={() => !isLast && onNavigate(i)}
              disabled={isLast}
              className={
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[13px] font-semibold transition-colors " +
                (isLast
                  ? "cursor-default border border-primary/20 bg-primary/10 text-primary"
                  : "border border-transparent text-muted-foreground hover:text-primary")
              }
            >
              {isHome ? (
                <>
                  <Home className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </>
              ) : (
                <span className="max-w-[160px] truncate">{item.label}</span>
              )}
            </button>
          </div>
        )
      })}
    </nav>
  )
}