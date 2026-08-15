import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/cn"

/**
 * Badge.
 *
 * Every variant previously pointed at a class — `badge-primary`, `gradient-warm`,
 * `shadow-glow-xs` — that does not exist in the stylesheet, so badges rendered
 * as bare unstyled text everywhere in the app. They are real styles now.
 *
 * All variants are soft fills: a tinted background, a matching border at low
 * alpha, and the hue itself as the text colour. Badges annotate rows and cards;
 * a saturated block would out-shout the content it is labelling. The three
 * gradient variants are kept as names so existing callers still compile, but
 * they resolve to the same quiet system — the app reads as one product now.
 */
const badgeVariants = cva(
  "inline-flex select-none items-center gap-1.5 rounded-full border font-semibold leading-none transition-colors duration-120",
  {
    variants: {
      variant: {
        primary: "border-primary/20  bg-primary/10      text-primary",
        accent:  "border-accent/25    bg-accent-soft     text-accent-foreground",
        success: "border-success/20   bg-success-soft    text-success",
        warning: "border-warning/25   bg-warning-soft    text-accent-foreground",
        danger:  "border-destructive/20 bg-destructive-soft text-destructive",
        neutral: "border-border       bg-muted           text-muted-foreground",
        muted:   "border-transparent  bg-muted           text-muted-foreground",
        info:    "border-info/20      bg-info-soft       text-info",
        // Aliases. Callers across the app ask for these names; without them the
        // variant falls through to no styling at all, which is how badges came
        // to render as bare text in the first place.
        default:     "border-border       bg-muted           text-muted-foreground",
        destructive: "border-destructive/20 bg-destructive-soft text-destructive",
        solid:   "border-transparent  bg-primary         text-primary-foreground",
        warm:    "border-accent/25    bg-accent-soft     text-accent-foreground",
        ocean:   "border-info/20      bg-info-soft       text-info",
        outline: "border-border bg-transparent text-muted-foreground hover:border-border-strong hover:text-foreground",
      },
      size: {
        xs: "px-1.5 py-[3px]  text-[10px]",
        sm: "px-2   py-[3.5px] text-[10.5px]",
        md: "px-2.5 py-1      text-[11px]",
        lg: "px-3   py-1.5    text-[12px]",
      },
    },
    defaultVariants: { variant: "neutral", size: "md" },
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
        <span className="relative inline-flex h-1.5 w-1.5 shrink-0">
          {pulse && (
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ background: dotColor ?? "currentColor" }}
            />
          )}
          <span
            className="relative inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: dotColor ?? "currentColor" }}
          />
        </span>
      )}
      {icon && <span className="shrink-0 [&_svg]:h-3 [&_svg]:w-3">{icon}</span>}
      {children}
    </span>
  )
}

export { badgeVariants }
