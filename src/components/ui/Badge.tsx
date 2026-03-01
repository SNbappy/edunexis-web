import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
    'inline-flex items-center gap-1 rounded-full font-medium text-xs px-2.5 py-0.5 transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-primary/10 text-primary',
                success: 'bg-success/10 text-success',
                warning: 'bg-warning/10 text-warning',
                danger: 'bg-destructive/10 text-destructive',
                muted: 'bg-muted text-muted-foreground',
                outline: 'border border-border text-foreground',
                teacher: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
                student: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
                admin: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                cr: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            },
        },
        defaultVariants: { variant: 'default' },
    }
)

interface BadgeProps extends VariantProps<typeof badgeVariants> {
    children: React.ReactNode
    className?: string
    dot?: boolean
}

export default function Badge({ children, variant, className, dot }: BadgeProps) {
    return (
        <span className={cn(badgeVariants({ variant }), className)}>
            {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
            {children}
        </span>
    )
}
