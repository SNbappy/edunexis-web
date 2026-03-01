import { forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    options: { value: string | number; label: string }[]
    placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder, className, id, ...props }, ref) => {
        const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
        return (
            <div className="space-y-1.5">
                {label && (
                    <label htmlFor={selectId} className="block text-sm font-medium text-foreground">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={cn(
                            'w-full h-11 rounded-xl border bg-card text-foreground text-sm px-4 pr-10 appearance-none transition-all duration-200',
                            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            error
                                ? 'border-destructive focus:ring-destructive/50'
                                : 'border-border hover:border-primary/40',
                            className
                        )}
                        {...props}
                    >
                        {placeholder && <option value="">{placeholder}</option>}
                        {options.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                {error && <p className="text-xs text-destructive font-medium">{error}</p>}
            </div>
        )
    }
)
Select.displayName = 'Select'
export default Select
