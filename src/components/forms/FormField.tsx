import { useState, forwardRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Info } from "lucide-react"
import { Field, FIELD_BASE, FIELD_HEIGHT, FIELD_LABEL, fieldState } from "@/components/ui/field"
import { ICON_STROKE, FOCUS, MOTION, SURFACE } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label:     string
  /** A short optional example shown in a tooltip on hover of the info icon. */
  hint?:     string
  /** Error message — shown under the field. */
  error?:    string
  /** Optional helper text under the field when no error. */
  help?:     string
  /** Label suffix, e.g. "(optional)". */
  optional?: boolean
}

/**
 * Labelled text input with an optional hint tooltip.
 *
 * Shares the field system with `Input` and `Select` now — it previously had its
 * own 44px height and its own focus ring, so a `FormField` and a `Select` sitting
 * in the same form row were visibly different sizes.
 */
const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, hint, error, help, optional, className, id, ...rest }, ref,
) {
  const [showHint, setShowHint] = useState(false)
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-")

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <label htmlFor={fieldId} className={FIELD_LABEL}>
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
              aria-label={`Hint for ${label}`}
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors duration-120 hover:text-foreground",
                FOCUS,
              )}
            >
              <Info className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
            </button>
            <AnimatePresence>
              {showHint && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: MOTION.fast, ease: MOTION.ease }}
                  role="tooltip"
                  className={cn(
                    SURFACE.raised,
                    "absolute left-0 top-6 z-20 w-max max-w-xs px-2.5 py-1.5 text-[11.5px] font-medium text-foreground",
                  )}
                >
                  {hint}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <input
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        className={cn(FIELD_BASE, fieldState(!!error), FIELD_HEIGHT, "px-3", className)}
        {...rest}
      />

      {error ? (
        <p className="mt-1.5 text-[12px] font-medium text-destructive">{error}</p>
      ) : help ? (
        <p className="mt-1.5 text-[12px] text-muted-foreground">{help}</p>
      ) : null}
    </div>
  )
})

export default FormField
export { Field }
