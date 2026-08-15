import { Check } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { ICON, ICON_STROKE, SURFACE } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"

interface FormSectionProps {
  /** The icon shown beside the title. */
  icon:        LucideIcon
  /** Section title, e.g. "Identity". */
  title:       string
  /** Helpful subtitle under the title. */
  subtitle?:   string
  /**
   * @deprecated No longer tints anything. The three tones (teal / amber /
   * stone) coloured one badge per section in the order the sections happened to
   * appear, which told the reader nothing. Kept so existing callers compile.
   */
  tone?:       "teal" | "amber" | "stone"
  /** Show a "complete" check when all required fields in the section are filled. */
  complete?:   boolean
  children:    React.ReactNode
}

/**
 * A titled group of fields.
 *
 * The completion check is the one signal here that carries information — it
 * tells you a section needs nothing more from you — so it is the only thing
 * given colour.
 */
export default function FormSection({
  icon: Icon, title, subtitle, complete, children,
}: FormSectionProps) {
  return (
    <section className={cn(SURFACE.card, "p-5")}>
      <header className="mb-4 flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors duration-150",
            complete
              ? "border-success/25 bg-success-soft text-success"
              : "border-border bg-muted text-muted-foreground",
          )}
          aria-hidden
        >
          {complete
            ? <Check className={ICON.sm} strokeWidth={2.5} />
            : <Icon className={ICON.sm} strokeWidth={ICON_STROKE} />}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[15px] font-bold text-foreground">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </header>

      <div className="space-y-4">{children}</div>
    </section>
  )
}
