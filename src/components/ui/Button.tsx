import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import Spinner from './Spinner'

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
    {
        variants: {
            variant: {
                primary:
                    'gradient-primary text-white shadow-glow-primary hover:shadow-lg hover:scale-[1.02] hover:brightness-110',
                secondary:
                    'bg-muted text-foreground border border-border hover:bg-muted/80 hover:border-primary/50',
                ghost:
                    'text-muted-foreground hover:bg-muted hover:text-foreground',
                outline:
                    'border border-border text-foreground hover:bg-muted hover:border-primary/50',
                danger:
                    'bg-destructive text-white hover:bg-destructive/90 shadow-sm',
                glass:
                    'glass text-foreground hover:bg-white/15 dark:hover:bg-white/10',
            },
            size: {
                sm: 'h-8 px-3 text-sm',
                md: 'h-10 px-4 text-sm',
                lg: 'h-12 px-6 text-base',
                xl: 'h-14 px-8 text-base',
                icon: 'h-9 w-9',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
)

interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    loading?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(buttonVariants({ variant, size, className }))}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <Spinner size="sm" className="text-current" />
                ) : leftIcon ? (
                    leftIcon
                ) : null}
                {children}
                {!loading && rightIcon}
            </button>
        )
    }
)

Button.displayName = 'Button'
export default Button
export { buttonVariants }
