import { motion } from 'framer-motion'
import { ChevronRight, Home } from 'lucide-react'
import type { BreadcrumbItem } from '@/types/material.types'

interface Props {
  items: BreadcrumbItem[]
  onNavigate: (index: number) => void
}

export default function MaterialsBreadcrumb({ items, onNavigate }: Props) {
  if (items.length <= 1) return null

  return (
    <nav className="flex items-center gap-1 flex-wrap">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(99,102,241,0.3)' }} />}
            <motion.button
              whileHover={!isLast ? { scale: 1.04 } : {}}
              whileTap={!isLast ? { scale: 0.96 } : {}}
              onClick={() => !isLast && onNavigate(i)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: isLast ? 'rgba(99,102,241,0.15)' : 'transparent',
                border: isLast ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                color: isLast ? '#818cf8' : '#475569',
                cursor: isLast ? 'default' : 'pointer',
              }}
              onMouseEnter={e => { if (!isLast) (e.currentTarget as HTMLElement).style.color = '#818cf8' }}
              onMouseLeave={e => { if (!isLast) (e.currentTarget as HTMLElement).style.color = '#475569' }}
            >
              {i === 0 ? (
                <><Home className="w-3.5 h-3.5" /><span>{item.label}</span></>
              ) : item.label}
            </motion.button>
          </div>
        )
      })}
    </nav>
  )
}