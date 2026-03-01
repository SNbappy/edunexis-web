import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    hint?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
        const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
        return (
            <div className="space-y-1.5">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            'w-full h-11 rounded-xl border bg-card text-foreground text-sm transition-all duration-200',
                            'placeholder:text-muted-foreground',
                            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            error
                                ? 'border-destructive focus:ring-destructive/50 focus:border-destructive'
                                : 'border-border hover:border-primary/40',
                            leftIcon ? 'pl-10' : 'pl-4',
                            rightIcon ? 'pr-10' : 'pr-4',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && <p className="text-xs text-destructive font-medium">{error}</p>}
                {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
            </div>
        )
    }
)

Input.displayName = 'Input'
export default Input
