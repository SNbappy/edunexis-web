import { forwardRef } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/utils/cn"
import { useThemeStore } from "@/store/themeStore"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:       string
  error?:       string
  hint?:        string
  options:      { value: string | number; label: string }[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, ...props }, ref) => {
    const { dark }   = useThemeStore()
    const selectId   = id ?? label?.toLowerCase().replace(/\s+/g, "-")
    const baseBg     = dark ? "rgba(255,255,255,0.05)" : "#f9fafb"
    const baseBorder = error
      ? (dark ? "rgba(239,68,68,0.5)" : "#fca5a5")
      : (dark ? "rgba(255,255,255,0.1)" : "#e5e7eb")
    const textColor  = dark ? "#e5e7eb" : "#111827"
    const labelColor = dark ? "#9ca3af" : "#374151"

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={selectId}
            className="block text-[13px] font-semibold"
            style={{ color: labelColor }}>
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref} id={selectId}
            className={cn("w-full h-10 rounded-xl text-[13.5px] font-medium pl-4 pr-10 appearance-none outline-none transition-all duration-150 disabled:opacity-50", className)}
            style={{ background: baseBg, border: `1px solid ${baseBorder}`, color: textColor }}
            onFocus={e => {
              e.target.style.borderColor = error ? "#ef4444" : "#6366f1"
              e.target.style.boxShadow = error ? "0 0 0 3px rgba(239,68,68,0.08)" : "0 0 0 3px rgba(99,102,241,0.1)"
              e.target.style.background = dark ? "rgba(255,255,255,0.07)" : "#ffffff"
            }}
            onBlur={e => {
              e.target.style.borderColor = baseBorder
              e.target.style.boxShadow   = "none"
              e.target.style.background  = baseBg
            }}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(o => (
              <option key={o.value} value={o.value}
                style={{ background: dark ? "rgb(16,24,44)" : "white", color: textColor }}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: dark ? "#6b7280" : "#9ca3af", pointerEvents: "none" }} />
        </div>
        {error && <p className="text-[12px] font-medium" style={{ color: "#ef4444" }}>{error}</p>}
        {!error && hint && <p className="text-[12px]" style={{ color: dark ? "#6b7280" : "#9ca3af" }}>{hint}</p>}
      </div>
    )
  }
)
Select.displayName = "Select"
export default Select
