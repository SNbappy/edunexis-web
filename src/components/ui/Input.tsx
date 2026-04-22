import { forwardRef } from "react"
import { cn } from "@/utils/cn"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:     string
  error?:     string
  hint?:      string
  leftIcon?:  React.ReactNode
  rightIcon?: React.ReactNode
  sizeVariant?: "sm" | "md" | "lg"
}

const SIZE = {
  sm: "h-9  text-xs",
  md: "h-10 text-sm",
  lg: "h-11 text-[15px]",
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, sizeVariant = "md", ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-foreground/90">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:w-4 [&_svg]:h-4">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              // Base
              "w-full rounded-xl font-medium placeholder:text-muted-foreground/70",
              "bg-input text-foreground",
              "border transition-[border-color,box-shadow,background-color] duration-150 ease-out",
              "outline-none",
              // Normal / error border
              error
                ? "border-destructive/60"
                : "border-border hover:border-border-strong",
              // Focus — via :focus, not inline style
              error
                ? "focus:border-destructive focus:shadow-[0_0_0_3px_rgb(var(--destructive)/0.15)]"
                : "focus:border-primary focus:shadow-[0_0_0_3px_rgb(var(--ring)/0.18)]",
              // Disabled
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted",
              // Size
              SIZE[sizeVariant],
              // Padding adjusts for icons
              leftIcon  ? "pl-10" : "pl-3.5",
              rightIcon ? "pr-10" : "pr-3.5",
              className,
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:w-4 [&_svg]:h-4">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs font-medium text-destructive flex items-center gap-1">
            <span aria-hidden>⚠</span>
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    )
  },
)
Input.displayName = "Input"
export default Input
