import { motion } from "framer-motion"
import { Check } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface FormSectionProps {
  /** The icon shown in the header badge. */
  icon:        LucideIcon
  /** Section title, e.g. "Identity". */
  title:       string
  /** Helpful subtitle under the title. */
  subtitle?:   string
  /** Tint for the icon badge. */
  tone?:       "teal" | "amber" | "stone"
  /** Show a subtle "complete" check mark when all required fields are filled. */
  complete?:   boolean
  children:    React.ReactNode
}

const TONE_CLASSES = {
  teal:  "bg-teal-50 text-teal-600 border-teal-200",
  amber: "bg-amber-50 text-amber-600 border-amber-200",
  stone: "bg-stone-100 text-stone-600 border-stone-200",
} as const

export default function FormSection({
  icon: Icon, title, subtitle, tone = "teal", complete, children,
}: FormSectionProps) {
  const toneClass = TONE_CLASSES[tone]

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-border bg-card p-6"
    >
      <header className="mb-5 flex items-start gap-3">
        <div
          className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border " + toneClass}
        >
          <Icon className="h-4 w-4" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[16px] font-bold text-foreground">
              {title}
            </h2>
            {complete && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-white"
                aria-label="Section complete"
              >
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </motion.span>
            )}
          </div>
          {subtitle && (
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </header>

      <div className="space-y-4">
        {children}
      </div>
    </motion.section>
  )
}
