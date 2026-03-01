import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface ProgressBarProps {
    value: number
    max?: number
    label?: string
    showPercent?: boolean
    color?: 'primary' | 'success' | 'warning' | 'danger'
    size?: 'sm' | 'md'
    className?: string
    animated?: boolean
}

const colorMap = {
    primary: 'bg-primary',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-destructive',
}

const sizeMap = { sm: 'h-1.5', md: 'h-2.5' }

export default function ProgressBar({
    value, max = 100, label, showPercent = false,
    color = 'primary', size = 'md', className, animated = true,
}: ProgressBarProps) {
    const pct = Math.min(100, Math.max(0, (value / max) * 100))

    return (
        <div className={cn('space-y-1', className)}>
            {(label || showPercent) && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {label && <span>{label}</span>}
                    {showPercent && <span className="font-medium">{pct.toFixed(0)}%</span>}
                </div>
            )}
            <div className={cn('w-full rounded-full bg-muted overflow-hidden', sizeMap[size])}>
                <motion.div
                    initial={animated ? { width: 0 } : { width: `${pct}%` }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={cn('h-full rounded-full', colorMap[color])}
                />
            </div>
        </div>
    )
}
