import { ChevronRight, Home } from 'lucide-react'
import type { BreadcrumbItem } from '@/types/material.types'

interface Props {
    items: BreadcrumbItem[]
    onNavigate: (index: number) => void
}

export default function MaterialsBreadcrumb({ items, onNavigate }: Props) {
    if (items.length <= 1) return null
    return (
        <nav className="flex items-center gap-1 text-sm flex-wrap">
            {items.map((item, i) => {
                const isLast = i === items.length - 1
                return (
                    <div key={i} className="flex items-center gap-1">
                        {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                        <button
                            onClick={() => !isLast && onNavigate(i)}
                            className={isLast
                                ? 'font-semibold text-foreground cursor-default'
                                : 'text-muted-foreground hover:text-primary transition-colors'
                            }
                        >
                            {i === 0 ? (
                                <span className="flex items-center gap-1">
                                    <Home className="w-3.5 h-3.5" /> {item.label}
                                </span>
                            ) : item.label}
                        </button>
                    </div>
                )
            })}
        </nav>
    )
}
