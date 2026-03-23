import { forwardRef } from "react"
import { cn } from "@/utils/cn"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; hint?: string
  leftIcon?: React.ReactNode; rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-semibold"
            style={{ color: "rgba(148,163,184,0.9)" }}>
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
              style={{ color: "#475569" }}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref} id={inputId}
            className={cn(
              "w-full h-11 rounded-xl text-[13.5px] font-medium transition-all duration-200 outline-none",
              "placeholder:font-medium",
              leftIcon ? "pl-10" : "pl-4",
              rightIcon ? "pr-10" : "pr-4",
              className
            )}
            style={{
              background: "rgba(10,22,40,0.8)",
              border: `1px solid ${error ? "rgba(239,68,68,0.4)" : "rgba(99,102,241,0.15)"}`,
              color: "#e2e8f0",
              boxShadow: "none",
              // @ts-ignore
              "--placeholder-color": "rgba(71,85,105,0.7)",
            }}
            onFocus={e => {
              (e.target as HTMLElement).style.borderColor = error ? "rgba(239,68,68,0.6)" : "rgba(99,102,241,0.4)"
              ;(e.target as HTMLElement).style.boxShadow = error
                ? "0 0 0 3px rgba(239,68,68,0.08)"
                : "0 0 0 3px rgba(99,102,241,0.08)"
            }}
            onBlur={e => {
              (e.target as HTMLElement).style.borderColor = error ? "rgba(239,68,68,0.4)" : "rgba(99,102,241,0.15)"
              ;(e.target as HTMLElement).style.boxShadow = "none"
            }}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }}>
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-[12px] font-medium flex items-center gap-1" style={{ color: "#f87171" }}>{error}</p>}
        {!error && hint && <p className="text-[12px]" style={{ color: "#475569" }}>{hint}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"
export default Input
