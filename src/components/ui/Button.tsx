import { forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/cn"
import Spinner from "./Spinner"

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
    "active:scale-[0.96] select-none overflow-hidden",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: cn(
          "gradient-primary text-white btn-shine",
          "shadow-btn-primary hover:shadow-btn-hover",
          "hover:brightness-[1.08] hover:scale-[1.02]",
        ),
        secondary: cn(
          "bg-white text-foreground border border-border",
          "shadow-xs",
          "hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700",
          "hover:shadow-glow-xs hover:scale-[1.01]",
        ),
        ghost: cn(
          "text-muted-foreground",
          "hover:bg-primary-50/60 hover:text-primary-700",
          "hover:scale-[1.01]",
        ),
        outline: cn(
          "border border-border bg-white/70 text-foreground",
          "shadow-xs",
          "hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700",
          "hover:shadow-glow-xs hover:scale-[1.01]",
        ),
        danger: cn(
          "bg-red-50 text-red-600 border border-red-200",
          "hover:bg-red-100 hover:border-red-300",
          "hover:shadow-glow-danger hover:scale-[1.01]",
        ),
        glass: cn(
          "glass text-foreground",
          "hover:bg-white/90 hover:border-primary-300",
          "hover:shadow-glow-xs hover:scale-[1.01]",
        ),
        accent: cn(
          "gradient-ocean text-white btn-shine",
          "shadow-glow-accent",
          "hover:brightness-[1.08] hover:scale-[1.02]",
        ),
        success: cn(
          "gradient-success text-white btn-shine",
          "shadow-glow-success",
          "hover:brightness-[1.08] hover:scale-[1.02]",
        ),
        warm: cn(
          "gradient-warm text-white btn-shine",
          "shadow-[0_4px_18px_rgba(236,72,153,0.38)]",
          "hover:brightness-[1.08] hover:scale-[1.02]",
        ),
      },
      size: {
        sm:       "h-8  px-3.5 text-xs",
        md:       "h-10 px-4   text-sm",
        lg:       "h-11 px-6   text-sm",
        xl:       "h-13 px-8   text-base",
        icon:     "h-9  w-9",
        "icon-sm":"h-8  w-8",
        "icon-lg":"h-11 w-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?:   boolean
  leftIcon?:  React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size="sm" className="text-current" /> : (leftIcon ?? null)}
      {children}
      {!loading && rightIcon}
    </button>
  )
)
Button.displayName = "Button"
export default Button
export { buttonVariants }
