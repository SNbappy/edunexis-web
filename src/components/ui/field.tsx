import { forwardRef } from "react"
import { AlertCircle } from "lucide-react"
import { ICON_STROKE } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"

/**
 * One field system, shared by every control.
 *
 * Input and Select had drifted apart on every dimension — 40px vs 44px tall,
 * 12px vs 13px labels, semantic colours vs hardcoded red/teal, a box-shadow
 * focus ring vs `ring-2`. Two fields sitting side by side in the same form did
 * not line up. Everything below is defined once and imported by both.
 */

/** 36px, matching Button `md` and a table row. */
export const FIELD_HEIGHT = "h-9"

export const FIELD_LABEL =
  "block text-[12.5px] font-semibold text-foreground"

/**
 * Focus is a ring drawn with box-shadow rather than `ring-*`, so it composes
 * with the border colour change instead of fighting it.
 */
export const FIELD_BASE = cn(
  "w-full rounded-xl border bg-card text-[13.5px] font-medium text-foreground",
  "transition-[border-color,box-shadow,background-color] duration-120 ease-out outline-none",
  "placeholder:font-normal placeholder:text-muted-foreground/70",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
)

export function fieldState(error?: boolean) {
  return error
    ? "border-destructive/60 focus:border-destructive focus:shadow-[0_0_0_3px_rgb(var(--destructive)/0.16)]"
    : "border-border hover:border-border-strong focus:border-primary focus:shadow-[0_0_0_3px_rgb(var(--ring)/0.18)]"
}

/**
 * Textarea.
 *
 * The app had no textarea primitive, so every form that needed one hand-rolled
 * it with its own padding, focus ring and border colour. This one is the Input
 * styles with the height freed up.
 */
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }
>(({ className, error, ...props }, ref) => (
  <textarea
    ref={ref}
    aria-invalid={error || undefined}
    className={cn(FIELD_BASE, fieldState(error), "resize-y px-3 py-2.5 leading-relaxed", className)}
    {...props}
  />
))
Textarea.displayName = "Textarea"

/** Label + control + one message slot. Error wins over hint; they never stack. */
export function Field({
  label, htmlFor, error, hint, required, children, className,
}: {
  label?: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className={FIELD_LABEL}>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </label>
      )}

      {children}

      {error ? (
        <p className="flex items-center gap-1 text-[12px] font-medium text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={ICON_STROKE} aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
