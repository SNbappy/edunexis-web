import { forwardRef } from "react"
import { cn } from "@/utils/cn"
import { useThemeStore } from "@/store/themeStore"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?:  string
  leftIcon?:  React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const { dark } = useThemeStore()
    const inputId  = id ?? label?.toLowerCase().replace(/\s+/g, "-")

    const baseBg     = dark ? "rgba(255,255,255,0.05)" : "#f9fafb"
    const baseBorder = error
      ? (dark ? "rgba(239,68,68,0.5)" : "#fca5a5")
      : (dark ? "rgba(255,255,255,0.1)" : "#e5e7eb")
    const textColor  = dark ? "#e5e7eb" : "#111827"
    const labelColor = dark ? "#9ca3af" : "#374151"

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId}
            className="block text-[13px] font-semibold"
            style={{ color: labelColor }}>
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: dark ? "#6b7280" : "#9ca3af" }}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-10 rounded-xl text-[13.5px] font-medium outline-none transition-all duration-150",
              leftIcon  ? "pl-10" : "pl-4",
              rightIcon ? "pr-10" : "pr-4",
              className
            )}
            style={{
              background:   baseBg,
              border:       `1px solid ${baseBorder}`,
              color:        textColor,
            }}
            onFocus={e => {
              e.target.style.borderColor = error
                ? (dark ? "rgba(239,68,68,0.7)" : "#f87171")
                : (dark ? "rgba(99,102,241,0.5)" : "#6366f1")
              e.target.style.boxShadow = error
                ? "0 0 0 3px rgba(239,68,68,0.08)"
                : "0 0 0 3px rgba(99,102,241,0.1)"
              e.target.style.background = dark ? "rgba(255,255,255,0.07)" : "#ffffff"
            }}
            onBlur={e => {
              e.target.style.borderColor = baseBorder
              e.target.style.boxShadow   = "none"
              e.target.style.background  = baseBg
            }}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: dark ? "#6b7280" : "#9ca3af" }}>
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-[12px] font-medium" style={{ color: "#ef4444" }}>{error}</p>
        )}
        {!error && hint && (
          <p className="text-[12px]" style={{ color: dark ? "#6b7280" : "#9ca3af" }}>{hint}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"
export default Input
