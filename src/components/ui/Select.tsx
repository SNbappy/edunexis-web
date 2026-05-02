import { forwardRef } from "react"
import { ChevronDown } from "lucide-react"
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

    const stateClass = error
      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
      : "border-border focus:border-teal-600 focus:ring-teal-600/20"

    return (
      <div className="space-y-1.5">
        {label ? (
          <label
            htmlFor={selectId}
            className="block text-[13px] font-semibold text-foreground"
          >
            {label}
          </label>
        ) : null}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            style={{ colorScheme: "light dark" }}
            className={cn(
              "h-11 w-full appearance-none rounded-xl border bg-card pl-4 pr-10 text-[14px] font-medium text-foreground transition-all outline-none placeholder:text-muted-foreground focus:outline-none focus:ring-2 disabled:opacity-50",
              stateClass,
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
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        {error ? (
          <p className="text-[12px] font-semibold text-red-600">{error}</p>
        ) : null}
        {!error && hint ? (
          <p className="text-[12px] text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    )
  },
)

Select.displayName = "Select"
export default Select