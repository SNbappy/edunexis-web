import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
    icon?: React.ReactNode
    emoji?: string
    title: string
    description?: string
    action?: React.ReactNode
    className?: string
}

export default function EmptyState({ icon, emoji, title, description, action, className }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}
        >
            {emoji ? (
                <div className="text-5xl mb-4">{emoji}</div>
            ) : icon ? (
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
                    {icon}
                </div>
            ) : null}
            <p className="text-base font-semibold text-foreground">{title}</p>
            {description && <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </motion.div>
    )
}
