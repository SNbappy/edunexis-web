import { forwardRef } from "react"
import { cn } from "@/utils/cn"
import InlineSpinner from "./InlineSpinner"

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "success" | "warning" | "accent"
type Size    = "sm" | "md" | "lg" | "xl" | "icon" | "icon-sm" | "icon-lg"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant
  size?:      Size
  loading?:   boolean
  leftIcon?:  React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const SIZE: Record<Size, string> = {
  sm:         "h-8  px-3   text-xs   gap-1.5 rounded-lg",
  md:         "h-10 px-4   text-sm   gap-2   rounded-xl",
  lg:         "h-11 px-5   text-sm   gap-2   rounded-xl",
  xl:         "h-12 px-6   text-[15px] gap-2.5 rounded-2xl",
  icon:       "h-10 w-10   rounded-xl",
  "icon-sm":  "h-8  w-8    rounded-lg",
  "icon-lg":  "h-11 w-11   rounded-xl",
}

const VARIANT: Record<Variant, string> = {
  primary:   "bg-primary text-primary-foreground shadow-sm hover:bg-primary-700 dark:hover:bg-primary-400 active:translate-y-px",
  secondary: "bg-muted text-foreground border border-border hover:bg-subtle hover:border-border-strong",
  ghost:     "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
  outline:   "bg-transparent text-foreground border border-border-strong hover:bg-muted",
  danger:    "bg-destructive text-white shadow-sm hover:brightness-110 active:translate-y-px",
  success:   "bg-success text-white shadow-sm hover:brightness-110 active:translate-y-px",
  warning:   "bg-warning-soft text-accent-foreground hover:bg-warning hover:text-white",
  accent:    "bg-accent text-accent-foreground shadow-sm hover:brightness-105 active:translate-y-px",
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, leftIcon, rightIcon, fullWidth, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Structure
          "relative inline-flex items-center justify-center whitespace-nowrap font-semibold select-none",
          "transition-[background-color,color,box-shadow,transform,filter,opacity] duration-150 ease-out",
          // A11y + focus
          "focus-ring",
          // Disabled
          "disabled:pointer-events-none disabled:opacity-50",
          // Size + variant
          SIZE[size],
          VARIANT[variant],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading ? (
          <InlineSpinner className="text-current" />
        ) : leftIcon ? (
          <span className="shrink-0 inline-flex">{leftIcon}</span>
        ) : null}
        {children}
        {!loading && rightIcon && <span className="shrink-0 inline-flex">{rightIcon}</span>}
      </button>
    )
  },
)
Button.displayName = "Button"
export default Button
