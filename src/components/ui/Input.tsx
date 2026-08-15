import { forwardRef } from "react"
import { Field, FIELD_BASE, fieldState } from "@/components/ui/field"
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
  sm: "h-8  text-[12.5px]",
  md: "h-9  text-[13.5px]",
  lg: "h-10 text-[14px]",
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, sizeVariant = "md", ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <Field label={label} htmlFor={inputId} error={error} hint={hint}>
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              FIELD_BASE,
              fieldState(!!error),
              SIZE[sizeVariant],
              leftIcon  ? "pl-9" : "pl-3",
              rightIcon ? "pr-9" : "pr-3",
              className,
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
              {rightIcon}
            </div>
          )}
        </div>
      </Field>
    )
  },
)
Input.displayName = "Input"
export default Input
