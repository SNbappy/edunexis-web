import { forwardRef } from "react"
import { FOCUS } from "@/components/ui/appTokens"
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

/**
 * Button.
 *
 * Sized on a 32/36/40/44 ramp so buttons line up with inputs and table rows
 * instead of each control picking its own height. Filled variants carry a top
 * inner highlight and a shadow tinted with their own hue — the detail that
 * separates a button that looks printed on from one that looks like an object.
 */
const SIZE: Record<Size, string> = {
  sm:         "h-8  px-3   text-[12.5px] gap-1.5 rounded-lg",
  md:         "h-9  px-3.5 text-[13.5px] gap-2   rounded-xl",
  lg:         "h-10 px-4   text-[14px]   gap-2   rounded-xl",
  xl:         "h-11 px-6   text-[15px]   gap-2.5 rounded-xl",
  icon:       "h-9  w-9    rounded-xl",
  "icon-sm":  "h-8  w-8    rounded-lg",
  "icon-lg":  "h-10 w-10   rounded-xl",
}

/** Inner top highlight shared by every filled variant. */
const FILL = "shadow-[inset_0_1px_0_rgb(255_255_255/0.18)] active:translate-y-px"

const VARIANT: Record<Variant, string> = {
  primary:
    `bg-primary text-primary-foreground ${FILL} shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_1px_2px_rgb(var(--primary)/0.28),0_6px_16px_-8px_rgb(var(--primary)/0.55)] hover:bg-primary-700 dark:hover:bg-primary-400`,
  secondary:
    "bg-card text-foreground border border-border shadow-xs hover:bg-muted hover:border-border-strong active:translate-y-px",
  ghost:
    "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
  outline:
    "bg-transparent text-foreground border border-border-strong hover:bg-muted active:translate-y-px",
  danger:
    `bg-destructive text-white ${FILL} shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_6px_16px_-8px_rgb(var(--destructive)/0.55)] hover:brightness-105`,
  success:
    `bg-success text-white ${FILL} shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_6px_16px_-8px_rgb(var(--success)/0.55)] hover:brightness-105`,
  warning:
    "bg-warning-soft text-accent-foreground border border-warning/25 hover:bg-warning hover:text-white active:translate-y-px",
  accent:
    `bg-accent text-accent-foreground ${FILL} shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_6px_16px_-8px_rgb(var(--accent)/0.55)] hover:brightness-105`,
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, leftIcon, rightIcon, fullWidth, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex select-none items-center justify-center whitespace-nowrap font-semibold",
          "transition-[background-color,color,box-shadow,transform,filter,opacity] duration-120 ease-out",
          FOCUS,
          "disabled:pointer-events-none disabled:opacity-50",
          // Icons inside buttons inherit one size, so callers can't drift.
          "[&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
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
          <span className="inline-flex shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!loading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    )
  },
)
Button.displayName = "Button"
export default Button
