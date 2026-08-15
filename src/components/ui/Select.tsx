import { forwardRef } from "react"
import { ChevronDown } from "lucide-react"
import { Field, FIELD_BASE, FIELD_HEIGHT, fieldState } from "@/components/ui/field"
import { ICON_STROKE } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"

interface SelectOption {
  value: string | number
  label: string
}

interface SelectOptionGroup {
  label:   string
  options: SelectOption[]
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?:        string
  error?:        string
  hint?:         string
  options?:      SelectOption[]
  optionGroups?: SelectOptionGroup[]
  placeholder?:  string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, optionGroups, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <Field label={label} htmlFor={selectId} error={error} hint={hint}>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            // Lets the native option list follow the app theme.
            style={{ colorScheme: "light dark" }}
            className={cn(
              FIELD_BASE,
              fieldState(!!error),
              FIELD_HEIGHT,
              "cursor-pointer appearance-none pl-3 pr-9",
              className,
            )}
            {...props}
          >
            {placeholder ? <option value="">{placeholder}</option> : null}
            {optionGroups
              ? optionGroups.map(g => (
                  <optgroup key={g.label} label={g.label}>
                    {g.options.map(o => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </optgroup>
                ))
              : options?.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={ICON_STROKE}
          />
        </div>
      </Field>
    )
  },
)

Select.displayName = "Select"
export default Select
