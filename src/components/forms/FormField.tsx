import { useState, forwardRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Info } from "lucide-react"

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label:     string
  /** A short optional example shown in a tooltip on hover of the info icon. */
  hint?:     string
  /** Error message — shown in red under the field, animated in. */
  error?:    string
  /** Optional helper text under the field when no error. */
  help?:     string
  /** Label suffix, e.g. "(optional)". */
  optional?: boolean
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, hint, error, help, optional, className, ...rest }, ref,
) {
  const [showHint, setShowHint] = useState(false)

  const baseClass =
    "h-11 w-full rounded-xl border bg-card px-4 text-[14px] text-foreground " +
    "placeholder:text-muted-foreground transition-all " +
    "focus:outline-none focus:ring-2 focus:ring-teal-600/30 "
  const stateClass = error
    ? "border-red-300 focus:border-red-500"
    : "border-border focus:border-teal-600"
  const inputClass = baseClass + stateClass + (className ? " " + className : "")

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <label className="text-[13px] font-semibold text-foreground">
          {label}
          {optional && (
            <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
          )}
        </label>

        {hint && (
          <div
            className="relative"
            onMouseEnter={() => setShowHint(true)}
            onMouseLeave={() => setShowHint(false)}
            onFocus={() => setShowHint(true)}
            onBlur={() => setShowHint(false)}
          >
            <button
              type="button"
              aria-label="Show hint"
              className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-teal-600"
            >
              <Info className="h-3 w-3" />
            </button>
            <AnimatePresence>
              {showHint && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  role="tooltip"
                  className="absolute left-0 top-6 z-20 w-max max-w-xs rounded-lg bg-stone-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg"
                >
                  {hint}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <input ref={ref} className={inputClass} {...rest} />

      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="mt-1.5 text-[11.5px] font-semibold text-red-600"
          >
            {error}
          </motion.p>
        ) : help ? (
          <p className="mt-1.5 text-[11.5px] text-muted-foreground">
            {help}
          </p>
        ) : null}
      </AnimatePresence>
    </div>
  )
})

export default FormField
