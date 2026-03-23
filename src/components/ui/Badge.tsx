import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-semibold rounded-full select-none transition-all duration-200",
  {
    variants: {
      variant: {
        primary: "badge-primary",
        accent:  "badge-accent",
        success: "badge-success",
        warning: "badge-warning",
        danger:  "badge-danger",
        neutral: "badge-neutral",
        solid:   "gradient-primary text-white shadow-glow-xs",
        warm:    "gradient-warm text-white shadow-[0_2px_12px_rgba(236,72,153,0.32)]",
        ocean:   "gradient-ocean text-white shadow-glow-accent",
        outline: "bg-transparent border border-border text-muted-foreground hover:border-primary-300 hover:text-primary-700",
      },
      size: {
        xs: "px-1.5 py-0.5 text-[9px]",
        sm: "px-2   py-0.5 text-[10px]",
        md: "px-2.5 py-1   text-[11px]",
        lg: "px-3   py-1.5 text-xs",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?:      boolean
  dotColor?: string
  icon?:     React.ReactNode
  pulse?:    boolean
}

export default function Badge({
  className, variant, size, dot, dotColor, icon, pulse, children, ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {dot && (
        <span className="relative inline-flex shrink-0" style={{ width: 6, height: 6 }}>
          {pulse && (
            <span
              className="absolute inline-flex w-full h-full rounded-full animate-ping opacity-60"
              style={{ background: dotColor ?? "currentColor" }}
            />
          )}
          <span
            className="relative inline-block rounded-full"
            style={{
              width: 6, height: 6,
              background: dotColor ?? "currentColor",
            }}
          />
        </span>
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  )
}

export { badgeVariants }
