import { forwardRef } from "react"
import { cn } from "@/utils/cn"
import Spinner from "./Spinner"
import { useThemeStore } from "@/store/themeStore"

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "success" | "warning"
type Size    = "sm" | "md" | "lg" | "xl" | "icon" | "icon-sm" | "icon-lg"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant
  size?:      Size
  loading?:   boolean
  leftIcon?:  React.ReactNode
  rightIcon?: React.ReactNode
}

const SIZE_CLASSES: Record<Size, string> = {
  sm:       "h-8  px-3.5 text-xs  rounded-lg",
  md:       "h-10 px-4   text-sm  rounded-xl",
  lg:       "h-11 px-6   text-sm  rounded-xl",
  xl:       "h-12 px-8   text-base rounded-2xl",
  icon:     "h-9  w-9    rounded-xl",
  "icon-sm":"h-8  w-8    rounded-lg",
  "icon-lg":"h-11 w-11   rounded-xl",
}

function getVariantStyle(variant: Variant, dark: boolean): React.CSSProperties {
  switch (variant) {
    case "primary":
      return { background: "linear-gradient(135deg,#6366f1,#0891b2)", color: "white", border: "none", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }
    case "secondary":
      return { background: dark ? "rgba(255,255,255,0.07)" : "#f3f4f6", color: dark ? "#e2e8f8" : "#374151", border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}` }
    case "ghost":
      return { background: "transparent", color: dark ? "#8896c8" : "#6b7280", border: "1px solid transparent" }
    case "outline":
      return { background: "transparent", color: dark ? "#a5b4fc" : "#6366f1", border: `1px solid ${dark ? "rgba(99,102,241,0.3)" : "#c7d2fe"}` }
    case "danger":
      return { background: dark ? "rgba(239,68,68,0.12)" : "#fef2f2", color: "#ef4444", border: `1px solid ${dark ? "rgba(239,68,68,0.25)" : "#fecaca"}` }
    case "success":
      return { background: "linear-gradient(135deg,#059669,#0891b2)", color: "white", border: "none", boxShadow: "0 4px 14px rgba(5,150,105,0.35)" }
    case "warning":
      return { background: dark ? "rgba(217,119,6,0.15)" : "#fffbeb", color: "#d97706", border: `1px solid ${dark ? "rgba(217,119,6,0.3)" : "#fde68a"}` }
    default:
      return { background: "linear-gradient(135deg,#6366f1,#0891b2)", color: "white", border: "none" }
  }
}

function getHoverStyle(variant: Variant, dark: boolean): React.CSSProperties {
  switch (variant) {
    case "primary":
    case "success":
      return { filter: "brightness(1.1)", transform: "scale(1.02)" }
    case "secondary":
      return { background: dark ? "rgba(255,255,255,0.11)" : "#e5e7eb" }
    case "outline":
      return { background: dark ? "rgba(99,102,241,0.1)" : "#eef2ff" }
    case "danger":
      return { background: dark ? "rgba(239,68,68,0.2)" : "#fee2e2" }
    case "ghost":
      return { background: dark ? "rgba(255,255,255,0.06)" : "#f3f4f6" }
    case "warning":
      return { background: dark ? "rgba(217,119,6,0.25)" : "#fef3c7" }
    default:
      return {}
  }
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, leftIcon, rightIcon, children, disabled, style, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const { dark } = useThemeStore()
    const baseStyle = getVariantStyle(variant, dark)
    const hoverStyle = getHoverStyle(variant, dark)

    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 font-semibold",
          "transition-all duration-150 ease-out select-none overflow-hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50",
          "disabled:pointer-events-none disabled:opacity-40",
          "active:scale-[0.96]",
          SIZE_CLASSES[size ?? "md"],
          className
        )}
        style={{ ...baseStyle, ...style }}
        disabled={disabled || loading}
        onMouseEnter={e => {
          Object.assign(e.currentTarget.style, hoverStyle)
          onMouseEnter?.(e)
        }}
        onMouseLeave={e => {
          Object.assign(e.currentTarget.style, baseStyle)
          e.currentTarget.style.filter = ""
          e.currentTarget.style.transform = ""
          onMouseLeave?.(e)
        }}
        {...props}
      >
        {loading ? <Spinner size="sm" className="text-current" /> : (leftIcon ?? null)}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }
)
Button.displayName = "Button"
export default Button
